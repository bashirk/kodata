import { ethers } from 'ethers';
import { PrismaClient, Prisma } from '@prisma/client';

/**
 * EthereumService - Handles Ethereum blockchain interactions via Alchemy
 * 
 * This service manages:
 * - Alchemy provider connection
 * - Wallet connection and signature verification
 * - Transaction signing with server wallet
 * - Basic Ethereum operations
 * 
 * @example
 * ```typescript
 * const ethereumService = new EthereumService();
 * const balance = await ethereumService.getBalance('0x123...');
 * ```
 */
export class EthereumService {
  private provider!: ethers.AlchemyProvider;
  private serverWallet!: ethers.Wallet;
  private prisma: PrismaClient;
  private isInitialized = false;

  constructor() {
    this.prisma = new PrismaClient();
    this.initializeProvider();
    this.initializeServerWallet();
  }

  /**
   * Initialize Alchemy provider connection
   */
  private initializeProvider(): void {
    try {
      const alchemyApiKey = process.env.ALCHEMY_API_KEY;
      if (!alchemyApiKey) {
        throw new Error('ALCHEMY_API_KEY environment variable not set');
      }

      // Use homestead for mainnet, sepolia for testnet based on environment
      const network = process.env.NODE_ENV === 'production' ? 'homestead' : 'sepolia';
      this.provider = new ethers.AlchemyProvider(network, alchemyApiKey);
      
      console.log(`✅ Ethereum provider initialized with Alchemy (${network})`);
      this.isInitialized = true;
    } catch (error) {
      console.error('❌ Failed to initialize Ethereum provider:', error);
      throw new Error(`Ethereum provider initialization failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Initialize server wallet for transaction signing
   */
  private initializeServerWallet(): void {
    try {
      const serverPrivateKey = process.env.SERVER_WALLET_PRIVATE_KEY;
      if (!serverPrivateKey) {
        throw new Error('SERVER_WALLET_PRIVATE_KEY environment variable not set');
      }

      this.serverWallet = new ethers.Wallet(serverPrivateKey, this.provider);
      console.log(`✅ Server wallet initialized: ${this.serverWallet.address}`);
    } catch (error) {
      console.error('❌ Failed to initialize server wallet:', error);
      throw new Error(`Server wallet initialization failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get ETH balance for an address
   */
  async getBalance(address: string): Promise<string> {
    try {
      if (!this.isInitialized) {
        throw new Error('Ethereum service not initialized');
      }

      // Validate Ethereum address
      if (!ethers.isAddress(address)) {
        throw new Error(`Invalid Ethereum address: ${address}`);
      }

      const balance = await this.provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('❌ getBalance error:', error);
      throw new Error(`Failed to get balance: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Verify signed message from wallet
   */
  async verifyMessage(message: string, signature: string, expectedAddress: string): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        throw new Error('Ethereum service not initialized');
      }

      // Validate Ethereum address
      if (!ethers.isAddress(expectedAddress)) {
        throw new Error(`Invalid Ethereum address: ${expectedAddress}`);
      }

      // Recover address from signature
      const recoveredAddress = ethers.verifyMessage(message, signature);
      
      // Compare addresses (case-insensitive)
      return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
    } catch (error) {
      console.error('❌ verifyMessage error:', error);
      throw new Error(`Failed to verify message: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Sign message with server wallet
   */
  async signMessage(message: string): Promise<string> {
    try {
      if (!this.serverWallet) {
        throw new Error('Server wallet not initialized');
      }

      const signature = await this.serverWallet.signMessage(message);
      return signature;
    } catch (error) {
      console.error('❌ signMessage error:', error);
      throw new Error(`Failed to sign message: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get server wallet address
   */
  getServerWalletAddress(): string {
    if (!this.serverWallet) {
      throw new Error('Server wallet not initialized');
    }
    return this.serverWallet.address;
  }

  /**
   * Get provider (for internal use by other services)
   */
  getProvider(): ethers.AlchemyProvider {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }
    return this.provider;
  }

  /**
   * Get server wallet (for internal use by other services)
   */
  getServerWallet(): ethers.Wallet {
    if (!this.serverWallet) {
      throw new Error('Server wallet not initialized');
    }
    return this.serverWallet;
  }

  /**
   * Send ETH transaction
   */
  async sendTransaction(
    to: string, 
    amount: string, 
    data?: string
  ): Promise<ethers.TransactionResponse> {
    try {
      if (!this.isInitialized || !this.serverWallet) {
        throw new Error('Ethereum service not initialized');
      }

      // Input validation
      if (!to || !to.match(/^0x[a-fA-F0-9]{40}$/)) {
        throw new Error('Invalid recipient address format');
      }

      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum < 0) {
        throw new Error('Invalid transaction amount');
      }

      // Validate Ethereum address
      if (!ethers.isAddress(to)) {
        throw new Error(`Invalid Ethereum address: ${to}`);
      }

      // Validate amount
      const amountInWei = ethers.parseEther(amount);
      if (amountInWei <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      // Check server wallet balance
      const serverBalance = await this.getBalance(this.serverWallet.address);
      const serverBalanceWei = ethers.parseEther(serverBalance);
      if (serverBalanceWei < amountInWei) {
        throw new Error('Insufficient server wallet balance');
      }

      // Get current gas price with safety multiplier
      const feeData = await this.provider.getFeeData();
      const safeMaxFeePerGas = feeData.maxFeePerGas ? (feeData.maxFeePerGas * 120n) / 100n : ethers.parseUnits('20', 'gwei');
      const safeMaxPriorityFeePerGas = feeData.maxPriorityFeePerGas ? (feeData.maxPriorityFeePerGas * 120n) / 100n : ethers.parseUnits('2', 'gwei');

      // Calculate gas limit with safety buffer
      let gasLimit = 21000n; // Standard ETH transfer
      if (data && data !== '0x') {
        gasLimit = 100000n; // Higher limit for contract interactions
      }
      const safeGasLimit = (gasLimit * 120n) / 100n; // 20% buffer

      // Check if transaction would exceed daily limits
      const dailyLimit = ethers.parseEther('10'); // 10 ETH daily limit
      const txCost = amountInWei + (safeMaxFeePerGas * safeGasLimit);
      if (txCost > dailyLimit) {
        throw new Error('Transaction exceeds daily limit');
      }

      // Build transaction
      const tx = {
        to: to.toLowerCase(),
        value: amountInWei,
        data: data || '0x',
        gasLimit: safeGasLimit,
        maxFeePerGas: safeMaxFeePerGas,
        maxPriorityFeePerGas: safeMaxPriorityFeePerGas,
      };

      console.log(`🚀 Sending transaction: ${JSON.stringify({
        to: tx.to,
        value: ethers.formatEther(tx.value),
        gasLimit: tx.gasLimit.toString(),
        maxFeePerGas: ethers.formatUnits(tx.maxFeePerGas, 'gwei'),
        maxPriorityFeePerGas: ethers.formatUnits(tx.maxPriorityFeePerGas, 'gwei'),
      }, null, 2)}`);
      
      // Send transaction
      const transaction = await this.serverWallet.sendTransaction(tx);
      console.log(`✅ Transaction sent: ${transaction.hash}`);
      
      return transaction;
    } catch (error) {
      console.error('❌ sendTransaction error:', error);
      throw new Error(`Failed to send transaction: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get transaction receipt
   */
  async getTransactionReceipt(hash: string): Promise<ethers.TransactionReceipt | null> {
    try {
      if (!this.isInitialized) {
        throw new Error('Ethereum service not initialized');
      }

      return await this.provider.getTransactionReceipt(hash);
    } catch (error) {
      console.error('❌ getTransactionReceipt error:', error);
      throw new Error(`Failed to get transaction receipt: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get current gas price
   */
  async getGasPrice(): Promise<{
    gasPrice: bigint;
    maxFeePerGas: bigint;
    maxPriorityFeePerGas: bigint;
  }> {
    try {
      if (!this.isInitialized) {
        throw new Error('Ethereum service not initialized');
      }

      const feeData = await this.provider.getFeeData();
      return {
        gasPrice: feeData.gasPrice || BigInt(0),
        maxFeePerGas: feeData.maxFeePerGas || BigInt(0),
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas || BigInt(0),
      };
    } catch (error) {
      console.error('❌ getGasPrice error:', error);
      throw new Error(`Failed to get gas price: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get current block number
   */
  async getBlockNumber(): Promise<number> {
    try {
      if (!this.isInitialized) {
        throw new Error('Ethereum service not initialized');
      }

      return await this.provider.getBlockNumber();
    } catch (error) {
      console.error('❌ getBlockNumber error:', error);
      throw new Error(`Failed to get block number: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Wait for transaction confirmation
   */
  async waitForTransaction(
    hash: string, 
    confirmations: number = 1
  ): Promise<ethers.TransactionReceipt | null> {
    try {
      if (!this.isInitialized) {
        throw new Error('Ethereum service not initialized');
      }

      console.log(`⏳ Waiting for transaction ${hash} to be confirmed (${confirmations} confirmations)...`);
      const receipt = await this.provider.waitForTransaction(hash, confirmations);
      if (receipt) {
        console.log(`✅ Transaction confirmed: ${receipt.status === 1 ? 'Success' : 'Failed'}`);
      } else {
        console.log(`⚠️ Transaction receipt not found for hash: ${hash}`);
      }
      return receipt;
    } catch (error) {
      console.error('❌ waitForTransaction error:', error);
      throw new Error(`Failed to wait for transaction: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Health check for Ethereum connection
   */
  async healthCheck(): Promise<{
    status: string;
    blockNumber: number;
    serverWallet: string;
    network: string;
  }> {
    try {
      if (!this.isInitialized) {
        throw new Error('Ethereum service not initialized');
      }

      const blockNumber = await this.getBlockNumber();
      const serverWalletAddress = this.getServerWalletAddress();

      return {
        status: 'healthy',
        blockNumber,
        serverWallet: serverWalletAddress,
        network: process.env.NODE_ENV === 'production' ? 'mainnet' : 'sepolia',
      };
    } catch (error) {
      console.error('❌ Ethereum health check failed:', error);
      return {
        status: 'unhealthy',
        blockNumber: 0,
        serverWallet: '',
        network: 'unknown',
      };
    }
  }

  /**
   * Disconnect and cleanup
   */
  async disconnect(): Promise<void> {
    try {
      // Close any open connections
      await this.prisma.$disconnect();
      this.isInitialized = false;
      console.log('✅ Ethereum service disconnected');
    } catch (error) {
      console.error('❌ Error disconnecting Ethereum service:', error);
    }
  }
}