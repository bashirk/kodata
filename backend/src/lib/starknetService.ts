import { RpcProvider, Account, Contract, json, Signer } from 'starknet';

/**
 * StarknetService - Handles WorkProof contract interactions on Starknet
 * 
 * This service manages:
 * - Contract deployment and initialization
 * - Submission approval transactions
 * - User reputation tracking
 * - Admin role management
 * 
 * Contract Address Source:
 * The contract address comes from deploying a WorkProof Cairo contract to Starknet testnet.
 * See STARKNET_DEPLOYMENT_GUIDE.md for complete deployment instructions.
 * 
 * Testnet Configuration:
 * - RPC URL: https://starknet-testnet.public.blastapi.io
 * - Network: Starknet Testnet (Goerli)
 * - Faucet: https://faucet.goerli.starknet.io/
 * 
 * @example
 * ```typescript
 * const starknetService = new StarknetService();
 * await starknetService.approveSubmission('submission_123');
 * ```
 */
export class StarknetService {
  private provider: RpcProvider;
  private account: Account | null = null;
  private contract: Contract | null = null;
  private contractAddress: string | null = null;
  private isInitialized = false;

  constructor() {
    // Initialize RPC provider for Starknet testnet
    this.provider = new RpcProvider({
      nodeUrl: process.env.STARKNET_RPC_URL || 'https://starknet-sepolia.public.blastapi.io',
    });
    
    // Initialize account with proper error handling
    if (process.env.STARKNET_ACCOUNT_ADDRESS) {
      try {
        // Use environment variables directly for simplicity
        this.account = new Account(
          this.provider,
          process.env.STARKNET_ACCOUNT_ADDRESS,
          process.env.STARKNET_PRIVATE_KEY || '0x031d1b15720e43baa85d2cccd083ea3f4f37883d292984ff0561f6f2ef719596'
        );
        console.log('Starknet account initialized with environment variables');
        console.log('Account address:', process.env.STARKNET_ACCOUNT_ADDRESS);
        
        this.isInitialized = true;
        console.log('Starknet account initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Starknet account:', error);
        throw new Error('Starknet account initialization failed. Please check your credentials.');
      }
    } else {
      console.error('Missing STARKNET_ACCOUNT_ADDRESS environment variable');
      throw new Error('STARKNET_ACCOUNT_ADDRESS environment variable must be set.');
    }
  }

  /**
   * Approve a submission on the Starknet WorkProof contract
   * 
   * This method calls the approve_submission function on the deployed contract,
   * which updates the submission status and increases user reputation.
   * 
   * @param submissionId - The unique identifier of the submission to approve
   * @returns Promise<string> - The transaction hash of the approval transaction
   * 
   * @throws Error if service is not initialized or contract is not loaded
   * @throws Error if the transaction fails
   * 
   * @example
   * ```typescript
   * const txHash = await starknetService.approveSubmission('submission_123');
   * console.log('Approval transaction:', txHash);
   * ```
   */
  async approveSubmission(submissionId: string) {
    try {
      if (!this.isInitialized || !this.account) {
        throw new Error('Starknet service not properly initialized');
      }
      
      if (!this.contract) {
        await this.loadContract();
      }
      
      if (!this.contract) {
        throw new Error('Failed to load Starknet contract');
      }
      
      // Convert UUID to a hash that fits in Cairo felt (31 chars max)
      // Use a simple hash of the submission ID to ensure it fits in felt
      const submissionHash = this.hashSubmissionId(submissionId);
      
      console.log(`🔍 Attempting to approve submission:`, {
        originalId: submissionId,
        hashedId: submissionHash,
        contractAddress: this.contractAddress || 'Not loaded'
      });
      
      // Check if the contract has the approve_submission function
      if (!this.contract.abi || !this.contract.abi.some((item: any) => item.name === 'approve_submission')) {
        console.log('⚠️ Contract ABI does not contain approve_submission function');
        console.log('Available functions:', this.contract.abi?.map((item: any) => item.name) || 'No ABI loaded');
        throw new Error('Contract does not have approve_submission function');
      }
      
      // Call the approve_submission function on the contract
      // Use Account.execute for better version control
      const call = this.contract.populate('approve_submission', [submissionHash]);
      const tx = await this.account!.execute([call], undefined, {
        version: 3, // Use V3 transaction version
        resourceBounds: {
          l1_gas: {
            max_amount: '0x20000', // 131,072 - reasonable L1 gas amount
            max_price_per_unit: '0x22aebafb1c74' // 38,133,856,672,884 - 1.2x actual gas price for buffer
          },
          l2_gas: {
            max_amount: '0x100000', // 1,048,576 - sufficient for L2 operations
            max_price_per_unit: '0x174876e800' // 100,000,000,000 - reasonable L2 gas price
          },
          l1_data_gas: {
            max_amount: '0x1000', // 4,096 - reasonable L1 data gas amount
            max_price_per_unit: '0x174876e800' // 100,000,000,000 - reasonable L1 data gas price
          }
        }
      });
      console.log('Starknet submission approval transaction sent:', tx.transaction_hash);
      return tx.transaction_hash;
    } catch (error) {
      console.error('StarknetService approveSubmission error:', error);
      throw new Error(`Failed to approve submission on Starknet: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Hash a submission ID to fit in Cairo felt (31 chars max)
   * 
   * @param submissionId - The UUID submission ID
   * @returns A hash string that fits in Cairo felt
   */
  private hashSubmissionId(submissionId: string): string {
    // Simple hash function to convert UUID to shorter string
    // This ensures the ID fits in Cairo's felt type (31 chars max)
    let hash = 0;
    for (let i = 0; i < submissionId.length; i++) {
      const char = submissionId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Convert to positive number and take last 8 characters
    const positiveHash = Math.abs(hash).toString(16);
    return positiveHash.slice(-8).padStart(8, '0');
  }

  /**
   * Get contract information from the deployed WorkProof contract
   * 
   * @returns Promise<{name: string, version: string, admin: string, submissionCount: string}>
   * @throws Error if contract is not accessible
   */
  async getContractInfo() {
    try {
      if (!this.isInitialized || !this.account) {
        throw new Error('Starknet service not properly initialized');
      }
      
      if (!this.contract) {
        await this.loadContract();
      }
      
      if (!this.contract) {
        throw new Error('Failed to load Starknet contract');
      }
      
      // Call contract info methods using call for view functions
      const contractInfoResult = await this.contract.call('get_contract_info', []);
      const admin = await this.contract.call('get_admin', []);
      const submissionCount = await this.contract.call('get_submission_count', []);
      
      // Parse the contract info result (it's a tuple)
      const name = (contractInfoResult as any)[0];
      const version = (contractInfoResult as any)[1];
      
      return {
        name: name.toString(),
        version: version.toString(),
        admin: admin.toString(),
        submissionCount: submissionCount.toString()
      };
    } catch (error) {
      console.error('StarknetService getContractInfo error:', error);
      throw new Error(`Failed to get contract info: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Load the WorkProof contract from the deployed address
   * 
   * This method loads the contract ABI and connects it to the deployed contract
   * address specified in the STARKNET_CONTRACT_ADDRESS environment variable.
   * 
   * The contract must be deployed using the WorkProof.cairo contract code.
   * See STARKNET_DEPLOYMENT_GUIDE.md for deployment instructions.
   * 
   * @private
   * @throws Error if contract address is not configured
   * @throws Error if contract loading fails
   */
  private async loadContract() {
    try {
      if (!this.isInitialized || !this.account) {
        throw new Error('Starknet account not initialized');
      }
      
      this.contractAddress = process.env.STARKNET_CONTRACT_ADDRESS || null;
      if (!this.contractAddress) {
        throw new Error('STARKNET_CONTRACT_ADDRESS environment variable not set');
      }
      
      // Load the actual contract class from the deployed contract
      const fs = require('fs');
      const path = require('path');
      const contractAbiPath = path.join(__dirname, '../../contract-abi.json');
      const contractClass = json.parse(fs.readFileSync(contractAbiPath, 'utf8'));
      
      this.contract = new Contract(contractClass.abi, this.contractAddress, this.account);
      console.log('Starknet WorkProof contract loaded at:', this.contractAddress);
    } catch (error) {
      console.error('StarknetService loadContract error:', error);
      throw new Error(`Failed to load Starknet contract: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}