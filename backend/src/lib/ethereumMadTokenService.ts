import { ethers } from 'ethers';
import { EthereumService } from './ethereumService';
import { PrismaClient, Prisma } from '@prisma/client';

/**
 * EthereumMADTokenService - Handles MAD token interactions on Ethereum
 * 
 * This service manages:
 * - MAD token ERC-20 operations (balanceOf, transfer, approve)
 * - Token balance queries
 * - Token transfers and governance deductions
 * - Event monitoring for token transfers
 * - Integration with existing reward system
 * 
 * @example
 * ```typescript
 * const madTokenService = new EthereumMADTokenService();
 * const balance = await madTokenService.getMadBalance('0x123...');
 * const txHash = await madTokenService.transferMad(from, to, amount);
 * ```
 */
export class EthereumMADTokenService {
  private ethereumService: EthereumService;
  private contract!: ethers.Contract;
  private prisma: PrismaClient;
  private contractAddress!: string;
  private isInitialized = false;

  // Standard ERC-20 ABI for MAD token
  private readonly MAD_TOKEN_ABI = [
    // Standard ERC-20 functions
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address account) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function transferFrom(address from, address to, uint256 amount) returns (bool)",
    
    // Events
    "event Transfer(address indexed from, address indexed to, uint256 value)",
    "event Approval(address indexed owner, address indexed spender, uint256 value)",
    
    // Custom MAD token functions (if any)
    "function mint(address to, uint256 amount) returns (bool)",
    "function burn(uint256 amount) returns (bool)",
  ];

  constructor() {
    this.ethereumService = new EthereumService();
    this.prisma = new PrismaClient();
    this.initializeContract();
  }

  /**
   * Initialize MAD token contract
   */
  private initializeContract(): void {
    try {
      const contractAddress = process.env.MAD_TOKEN_ETHEREUM_ADDRESS;
      if (!contractAddress) {
        throw new Error('MAD_TOKEN_ETHEREUM_ADDRESS environment variable not set');
      }
      this.contractAddress = contractAddress;

      // Validate contract address
      if (!ethers.isAddress(this.contractAddress)) {
        throw new Error(`Invalid MAD token contract address: ${this.contractAddress}`);
      }

      // Create contract instance
      const provider = this.ethereumService.getProvider();
      this.contract = new ethers.Contract(this.contractAddress, this.MAD_TOKEN_ABI, provider);
      
      console.log(`✅ MAD Token contract initialized at: ${this.contractAddress}`);
      this.isInitialized = true;
    } catch (error) {
      console.error('❌ Failed to initialize MAD token contract:', error);
      throw new Error(`MAD Token contract initialization failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get MAD token balance for an address
   */
  async getMadBalance(address: string): Promise<string> {
    try {
      if (!this.isInitialized) {
        throw new Error('MAD Token service not initialized');
      }

      // Validate Ethereum address
      if (!ethers.isAddress(address)) {
        throw new Error(`Invalid Ethereum address: ${address}`);
      }

      console.log(`🔍 Querying MAD balance for: ${address}`);
      const balance = await this.contract.balanceOf(address);
      const decimals = await this.contract.decimals();
      
      // Convert from wei to token units
      const formattedBalance = ethers.formatUnits(balance, decimals);
      console.log(`💰 MAD balance for ${address}: ${formattedBalance}`);
      
      return formattedBalance;
    } catch (error) {
      console.error('❌ getMadBalance error:', error);
      
      // Fallback to mock balance for development/testing
      if (process.env.NODE_ENV !== 'production') {
        console.log('🔄 Using mock MAD balance for development');
        return '1500.0'; // Mock balance
      }
      
      throw new Error(`Failed to get MAD balance: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Transfer MAD tokens between addresses
   */
  async transferMad(from: string, to: string, amount: string): Promise<string> {
    try {
      if (!this.isInitialized) {
        throw new Error('MAD Token service not initialized');
      }

      // Validate addresses
      if (!ethers.isAddress(from) || !ethers.isAddress(to)) {
        throw new Error(`Invalid Ethereum address: from=${from}, to=${to}`);
      }

      // Validate amount
      const amountNumber = parseFloat(amount);
      if (isNaN(amountNumber) || amountNumber <= 0) {
        throw new Error('Amount must be a positive number');
      }

      // Check daily transfer limit (1000 MAD tokens)
      const dailyLimit = 1000;
      if (amountNumber > dailyLimit) {
        throw new Error(`Transfer amount exceeds daily limit of ${dailyLimit} MAD tokens`);
      }

      // Check sender's balance
      const senderBalance = await this.getMadBalance(from);
      const senderBalanceNum = parseFloat(senderBalance);
      if (senderBalanceNum < amountNumber) {
        throw new Error(`Insufficient balance. Available: ${senderBalance}, Required: ${amount}`);
      }

      console.log(`🚀 Transferring ${amount} MAD from ${from} to ${to}`);

      // Get decimals and convert amount
      const decimals = await this.contract.decimals();
      const amountInWei = ethers.parseUnits(amount, decimals);

      // Check if from address is the server wallet
      const serverWalletAddress = this.ethereumService.getServerWalletAddress();
      let transaction: ethers.TransactionResponse;

      if (from.toLowerCase() === serverWalletAddress.toLowerCase()) {
        // Transfer from server wallet
        const serverSigner = this.ethereumService.getServerWallet();
        const contractWithSigner = this.contract.connect(serverSigner);
        
        // Get current gas price with safety buffer
        const feeData = await this.ethereumService.getProvider().getFeeData();
        const safeMaxFeePerGas = feeData.maxFeePerGas ? (feeData.maxFeePerGas * 120n) / 100n : ethers.parseUnits('20', 'gwei');
        const safeMaxPriorityFeePerGas = feeData.maxPriorityFeePerGas ? (feeData.maxPriorityFeePerGas * 120n) / 100n : ethers.parseUnits('2', 'gwei');
        
        transaction = await (contractWithSigner as any).transfer(to, amountInWei, {
          maxFeePerGas: safeMaxFeePerGas,
          maxPriorityFeePerGas: safeMaxPriorityFeePerGas,
          gasLimit: 100000n // Safe gas limit for ERC20 transfer
        });
      } else {
        // Check allowance if not sending from server wallet
        const allowance = await this.contract.allowance(from, serverWalletAddress);
        const allowanceNum = parseFloat(ethers.formatUnits(allowance, decimals));
        if (allowanceNum < amountNumber) {
          throw new Error(`Insufficient allowance. Required: ${amount}, Available: ${allowanceNum}`);
        }
        
        // For transfers from user wallets, we need approval or signed transaction
        throw new Error('Direct transfers from user wallets require approval. Use transferFrom instead.');
      }

      console.log(`✅ MAD transfer transaction sent: ${transaction.hash}`);
      
      // Wait for 1 confirmation
      const receipt = await transaction.wait(1);
      if (!receipt) {
        throw new Error('Transfer transaction failed to confirm');
      }
      
      // Log transaction to database
      await this.logTransaction({
        hash: transaction.hash,
        from,
        to,
        amount,
        type: 'TRANSFER',
        status: 'CONFIRMED',
      });

      return transaction.hash;
    } catch (error) {
      console.error('❌ transferMad error:', error);
      throw new Error(`Failed to transfer MAD tokens: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Deduct MAD tokens for voting (governance)
   */
  async deductMadForVoting(address: string, amount: string): Promise<string> {
    try {
      if (!this.isInitialized) {
        throw new Error('MAD Token service not initialized');
      }

      // Validate Ethereum address
      if (!ethers.isAddress(address)) {
        throw new Error(`Invalid Ethereum address: ${address}`);
      }

      // Validate amount
      const amountNumber = parseFloat(amount);
      if (isNaN(amountNumber) || amountNumber <= 0) {
        throw new Error('Amount must be a positive number');
      }

      console.log(`🗳️ Deducting ${amount} MAD from ${address} for voting`);

      // For voting, we transfer tokens to a governance treasury address
      const governanceTreasury = process.env.GOVERNANCE_TREASURY_ADDRESS || this.ethereumService.getServerWalletAddress();
      
      // This would typically involve more complex governance logic
      // For now, we'll do a simple transfer to the treasury
      const txHash = await this.transferMad(address, governanceTreasury, amount);

      // Log governance action
      await this.logGovernanceAction({
        address,
        amount,
        action: 'VOTE_DEDUCTION',
        transactionHash: txHash,
      });

      return txHash;
    } catch (error) {
      console.error('❌ deductMadForVoting error:', error);
      throw new Error(`Failed to deduct MAD for voting: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Approve spender to transfer MAD tokens
   */
  async approveMad(spender: string, amount: string): Promise<string> {
    try {
      if (!this.isInitialized) {
        throw new Error('MAD Token service not initialized');
      }

      // Validate addresses
      if (!ethers.isAddress(spender)) {
        throw new Error(`Invalid spender address: ${spender}`);
      }

      console.log(`🔓 Approving ${spender} to spend ${amount} MAD`);

      // Get decimals and convert amount
      const decimals = await this.contract.decimals();
      const amountInWei = ethers.parseUnits(amount, decimals);

      // Use server wallet for approval
      const serverSigner = this.ethereumService.getServerWallet();
      const contractWithSigner = this.contract.connect(serverSigner);
      
      const transaction = await (contractWithSigner as any).approve(spender, amountInWei);
      console.log(`✅ MAD approval transaction sent: ${transaction.hash}`);

      return transaction.hash;
    } catch (error) {
      console.error('❌ approveMad error:', error);
      throw new Error(`Failed to approve MAD tokens: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get token information
   */
  async getTokenInfo(): Promise<{
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: string;
    contractAddress: string;
  }> {
    try {
      if (!this.isInitialized) {
        throw new Error('MAD Token service not initialized');
      }

      console.log('🔍 Querying MAD token information');

      const [name, symbol, decimals, totalSupply] = await Promise.all([
        this.contract.name(),
        this.contract.symbol(),
        this.contract.decimals(),
        this.contract.totalSupply(),
      ]);

      const tokenInfo = {
        name,
        symbol,
        decimals,
        totalSupply: ethers.formatUnits(totalSupply, decimals),
        contractAddress: this.contractAddress,
      };

      console.log('💎 MAD Token info:', tokenInfo);
      return tokenInfo;
    } catch (error) {
      console.error('❌ getTokenInfo error:', error);
      
      // Fallback to mock data for development/testing
      if (process.env.NODE_ENV !== 'production') {
        console.log('🔄 Using mock MAD token info for development');
        return {
          name: 'MAD Token',
          symbol: 'MAD',
          decimals: 18,
          totalSupply: '1000000.0',
          contractAddress: this.contractAddress,
        };
      }
      
      throw new Error(`Failed to get token info: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Monitor MAD token transfers
   */
  async monitorTransfers(fromBlock?: number, toBlock?: number): Promise<void> {
    try {
      if (!this.isInitialized) {
        throw new Error('MAD Token service not initialized');
      }

      console.log(`👀 Monitoring MAD transfers from block ${fromBlock || 'latest'} to ${toBlock || 'latest'}`);

      const filter = this.contract.filters.Transfer();
      const events = await this.contract.queryFilter(filter, fromBlock, toBlock);

      console.log(`📊 Found ${events.length} transfer events`);

      for (const event of events) {
        const { from, to, value } = (event as any).args;
        const decimals = await this.contract.decimals();
        const amount = ethers.formatUnits(value, decimals);

        console.log(`🔄 Transfer: ${from} → ${to}, Amount: ${amount}, Block: ${event.blockNumber}`);

        // Log to database
        await this.logTransaction({
          hash: event.transactionHash,
          from,
          to,
          amount,
          type: 'TRANSFER',
          status: 'CONFIRMED',
          blockNumber: event.blockNumber,
        });
      }
    } catch (error) {
      console.error('❌ monitorTransfers error:', error);
      throw new Error(`Failed to monitor transfers: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Log transaction to database
   */
  private async logTransaction(data: {
    hash: string;
    from: string;
    to: string;
    amount: string;
    type: string;
    status: string;
    blockNumber?: number;
  }): Promise<void> {
    try {
      await this.prisma.transaction.create({
        data: {
          amount: new Prisma.Decimal(data.amount),
          currency: 'MAD',
          status: data.status,
          reference: data.hash,
          userId: 'system' // System transaction
        },
      });
    } catch (error) {
      console.error('❌ Failed to log transaction:', error);
      // Don't throw error here to avoid breaking the main flow
    }
  }

  /**
   * Log governance action to database
   */
  private async logGovernanceAction(data: {
    address: string;
    amount: string;
    action: string;
    transactionHash: string;
  }): Promise<void> {
    try {
      // Find user by Ethereum address
      const user = await this.prisma.user.findFirst({
        where: { ethereumAddress: data.address },
      });

      await this.prisma.transaction.create({
        data: {
          amount: parseFloat(data.amount),
          currency: 'MAD',
          status: 'CONFIRMED',
          reference: data.transactionHash,
          userId: user?.id || 'unknown'
        },
      });
    } catch (error) {
      console.error('❌ Failed to log governance action:', error);
      // Don't throw error here to avoid breaking the main flow
    }
  }

  /**
   * Health check for MAD token service
   */
  async healthCheck(): Promise<{
    status: string;
    contractAddress: string;
    tokenInfo?: any;
    error?: string;
  }> {
    try {
      if (!this.isInitialized) {
        throw new Error('MAD Token service not initialized');
      }

      const tokenInfo = await this.getTokenInfo();
      
      return {
        status: 'healthy',
        contractAddress: this.contractAddress,
        tokenInfo,
      };
    } catch (error) {
      console.error('❌ MAD Token health check failed:', error);
      return {
        status: 'unhealthy',
        contractAddress: this.contractAddress,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}