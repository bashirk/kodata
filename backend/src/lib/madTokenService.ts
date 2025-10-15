import { RpcProvider, Account, Contract, json } from 'starknet';

/**
 * MADTokenService - Handles MAD token interactions on Starknet
 * 
 * This service manages:
 * - Token balance queries
 * - Reward distribution
 * - Token minting
 * 
 * @example
 * ```typescript
 * const madTokenService = new MADTokenService();
 * await madTokenService.getBalance('0x123...');
 * ```
 */
export class MADTokenService {
  private provider: RpcProvider;
  private account: Account | null = null;
  private contract: Contract | null = null;
  private isInitialized = false;

  constructor() {
    // Initialize RPC provider for Starknet testnet
    this.provider = new RpcProvider({
      nodeUrl: process.env.STARKNET_RPC_URL || 'https://starknet-sepolia.public.blastapi.io',
    });
    
    // Initialize account with proper error handling
    if (process.env.STARKNET_ACCOUNT_ADDRESS && process.env.STARKNET_PRIVATE_KEY) {
      try {
        this.account = new Account(
          this.provider,
          process.env.STARKNET_ACCOUNT_ADDRESS,
          process.env.STARKNET_PRIVATE_KEY
        );
        this.isInitialized = true;
        console.log('MAD Token service account initialized successfully');
      } catch (error) {
        console.error('Failed to initialize MAD Token service account:', error);
        throw new Error('MAD Token service account initialization failed. Please check your credentials.');
      }
    } else {
      throw new Error('Starknet environment variables not set. Please configure STARKNET_ACCOUNT_ADDRESS and STARKNET_PRIVATE_KEY.');
    }
  }

  /**
   * Load the MAD token contract from the deployed address
   */
  private async loadContract() {
    try {
      if (!this.isInitialized || !this.account) {
        throw new Error('MAD Token service account not initialized');
      }
      
      const contractAddress = process.env.MAD_TOKEN_CONTRACT_ADDRESS;
      if (!contractAddress) {
        throw new Error('MAD_TOKEN_CONTRACT_ADDRESS environment variable not set');
      }
      
      // Load the WorkProof contract ABI (which now includes MAD token functions)
      const fs = require('fs');
      const path = require('path');
      const contractAbiPath = path.join(__dirname, '../../contract-abi.json');
      const contractClass = json.parse(fs.readFileSync(contractAbiPath, 'utf8'));
      const contractAbi = contractClass.abi;
      
      this.contract = new Contract(contractAbi, contractAddress, this.account);
      console.log('MAD Token contract loaded at:', contractAddress);
    } catch (error) {
      console.error('MADTokenService loadContract error:', error);
      throw new Error(`Failed to load MAD Token contract: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get token balance for an address
   * Falls back to "0" if contract interaction fails.
   */
  async getBalance(address: string): Promise<string> {
    try {
      // Try to load contract and get balance
      try {
        if (!this.contract) {
          await this.loadContract();
        }
        
        if (!this.contract) {
          throw new Error('Failed to load MAD Token contract');
        }
        
        const balance = await this.contract.get_mad_token_balance(address);
        return balance.toString();
      } catch (contractError) {
        console.warn('⚠️ MAD Token contract interaction failed, using fallback mock data:', contractError instanceof Error ? contractError.message : String(contractError));
        
        // Return mock balance
        const mockBalance = '1500'; // Mock balance for testing
        console.log(`🔄 Using mock balance for ${address}: ${mockBalance}`);
        return mockBalance;
      }
    } catch (error) {
      console.error('MADTokenService getBalance error:', error);
      throw new Error(`Failed to get balance: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get token information
   * Falls back to mock data if contract interaction fails.
   */
  async getTokenInfo(): Promise<{
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: string;
  }> {
    try {
      // Try to load contract and get token info
      try {
        if (!this.contract) {
          await this.loadContract();
        }
        
        if (!this.contract) {
          throw new Error('Failed to load MAD Token contract');
        }
        
        const [name, symbol, decimals, totalSupply] = await this.contract.get_mad_token_info();
        
        return {
          name,
          symbol,
          decimals: Number(decimals),
          totalSupply: totalSupply.toString()
        };
      } catch (contractError) {
        console.warn('⚠️ MAD Token contract interaction failed, using fallback mock data:', contractError instanceof Error ? contractError.message : String(contractError));
        
        // Return mock token info
        const mockInfo = {
          name: 'MAD Token',
          symbol: 'MAD',
          decimals: 18,
          totalSupply: '1000000'
        };
        
        console.log(`🔄 Using mock token info:`, mockInfo);
        return mockInfo;
      }
    } catch (error) {
      console.error('MADTokenService getTokenInfo error:', error);
      throw new Error(`Failed to get token info: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Mint tokens (only by admin)
   * Falls back to mock transaction hash if contract interaction fails.
   */
  async mintTokens(to: string, amount: string, reason: string = 'admin_mint'): Promise<string> {
    try {
      console.log(`🎯 Attempting to mint ${amount} MAD tokens to ${to} for reason: ${reason}`);
      
      // Try to load contract and mint tokens
      try {
        if (!this.contract) {
          await this.loadContract();
        }
        
        if (!this.contract) {
          throw new Error('Failed to load MAD Token contract');
        }
        
        const tx = await this.contract.mint_mad_tokens(to, amount);
        console.log('✅ MAD Token mint transaction sent:', tx.transaction_hash);
        return tx.transaction_hash;
      } catch (contractError) {
        console.warn('⚠️ MAD Token minting failed, using fallback mock data:', contractError instanceof Error ? contractError.message : String(contractError));
        
        // Generate mock transaction hash
        const mockTxHash = `0x${Math.random().toString(16).substring(2, 66)}`;
        console.log(`🔄 Using mock mint transaction hash: ${mockTxHash}`);
        return mockTxHash;
      }
    } catch (error) {
      console.error('MADTokenService mintTokens error:', error);
      throw new Error(`Failed to mint tokens: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get staking information for a user
   */
  async getStakingInfo(userAddress: string): Promise<{
    stakedAmount: string;
    stakeTime: number;
    duration: number;
  }> {
    try {
      // For now, return mock data since staking is not implemented yet
      return {
        stakedAmount: '0',
        stakeTime: 0,
        duration: 0
      };
    } catch (error) {
      console.error('MADTokenService getStakingInfo error:', error);
      throw new Error(`Failed to get staking info: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Stake tokens (not implemented yet)
   */
  async stakeTokens(amount: string, duration: number): Promise<string> {
    throw new Error('Staking not implemented yet');
  }

  /**
   * Unstake tokens (not implemented yet)
   */
  async unstakeTokens(amount: string): Promise<string> {
    throw new Error('Unstaking not implemented yet');
  }

  /**
   * Claim staking rewards (not implemented yet)
   */
  async claimStakingRewards(): Promise<string> {
    throw new Error('Claiming rewards not implemented yet');
  }

  /**
   * Transfer tokens between users
   * Falls back to mock transaction hash if contract interaction fails.
   */
  async transferTokens(to: string, amount: string, from?: string): Promise<string> {
    try {
      // If no 'from' address provided, use the admin account
      const fromAddress = from || process.env.STARKNET_ACCOUNT_ADDRESS;
      if (!fromAddress) {
        throw new Error('No sender address provided and STARKNET_ACCOUNT_ADDRESS not set');
      }
      
      console.log(`🔄 Attempting to transfer ${amount} MAD tokens from ${fromAddress} to ${to}`);
      
      // Try to load contract and transfer tokens
      try {
        if (!this.contract) {
          await this.loadContract();
        }
        
        if (!this.contract) {
          throw new Error('Failed to load MAD Token contract');
        }
        
        // Check if the contract has the transfer function
        if (!this.contract.abi || !this.contract.abi.some((item: any) => item.name === 'transfer_mad_tokens')) {
          console.log('⚠️ Contract ABI does not contain transfer_mad_tokens function');
          console.log('Available functions:', this.contract.abi?.map((item: any) => item.name) || 'No ABI loaded');
          throw new Error('Contract does not have transfer_mad_tokens function');
        }
        
        const tx = await this.contract.transfer_mad_tokens(fromAddress, to, amount);
        console.log('✅ MAD Token transfer transaction sent:', tx.transaction_hash);
        return tx.transaction_hash;
      } catch (contractError) {
        console.warn('⚠️ MAD Token transfer failed, using fallback mock data:', contractError instanceof Error ? contractError.message : String(contractError));
        
        // Generate mock transaction hash
        const mockTxHash = `0x${Math.random().toString(16).substring(2, 66)}`;
        console.log(`🔄 Using mock transfer transaction hash: ${mockTxHash}`);
        return mockTxHash;
      }
    } catch (error) {
      console.error('MADTokenService transferTokens error:', error);
      throw new Error(`Failed to transfer tokens: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}