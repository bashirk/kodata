import { RpcProvider, Account, Contract, json } from 'starknet';

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
  private isInitialized = false;

  constructor() {
    // Initialize RPC provider for Starknet testnet
    this.provider = new RpcProvider({
      nodeUrl: process.env.STARKNET_RPC_URL || 'https://starknet-testnet.public.blastapi.io',
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
        console.log('Starknet account initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Starknet account:', error);
        throw new Error('Starknet account initialization failed. Please check your credentials.');
      }
    } else {
      throw new Error('Starknet environment variables not set. Please configure STARKNET_ACCOUNT_ADDRESS and STARKNET_PRIVATE_KEY.');
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
      
      // Call the approve_submission function on the contract
      const tx = await this.contract.invoke('approve_submission', [submissionId]);
      console.log('Starknet submission approval transaction sent:', tx.transaction_hash);
      return tx.transaction_hash;
    } catch (error) {
      console.error('StarknetService approveSubmission error:', error);
      throw new Error(`Failed to approve submission on Starknet: ${error instanceof Error ? error.message : String(error)}`);
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
      
      const contractAddress = process.env.STARKNET_CONTRACT_ADDRESS;
      if (!contractAddress) {
        throw new Error('STARKNET_CONTRACT_ADDRESS environment variable not set');
      }
      
      // Contract ABI for WorkProof contract
      // This ABI matches the deployed contract interface from lib.cairo
      const contractAbi = json.parse(`[
        {
          "name": "add_admin",
          "type": "function",
          "inputs": [{ "name": "new_admin", "type": "ContractAddress" }],
          "outputs": []
        },
        {
          "name": "remove_admin",
          "type": "function",
          "inputs": [{ "name": "admin_to_remove", "type": "ContractAddress" }],
          "outputs": []
        },
        {
          "name": "create_submission",
          "type": "function",
          "inputs": [
            { "name": "task_id", "type": "felt252" },
            { "name": "result_hash", "type": "felt252" },
            { "name": "storage_uri", "type": "felt252" }
          ],
          "outputs": [{ "name": "submission_id", "type": "felt252" }]
        },
        {
          "name": "approve_submission",
          "type": "function",
          "inputs": [{ "name": "submission_id", "type": "felt252" }],
          "outputs": []
        },
        {
          "name": "reject_submission",
          "type": "function",
          "inputs": [{ "name": "submission_id", "type": "felt252" }],
          "outputs": []
        },
        {
          "name": "is_submission_approved",
          "type": "function",
          "inputs": [{ "name": "submission_id", "type": "felt252" }],
          "outputs": [{ "name": "approved", "type": "bool" }]
        },
        {
          "name": "get_user_reputation",
          "type": "function",
          "inputs": [{ "name": "user_address", "type": "ContractAddress" }],
          "outputs": [{ "name": "reputation", "type": "u256" }]
        },
        {
          "name": "is_admin",
          "type": "function",
          "inputs": [{ "name": "address", "type": "ContractAddress" }],
          "outputs": [{ "name": "admin", "type": "bool" }]
        },
        {
          "name": "get_admin",
          "type": "function",
          "inputs": [],
          "outputs": [{ "name": "admin", "type": "ContractAddress" }]
        },
        {
          "name": "get_submission_count",
          "type": "function",
          "inputs": [],
          "outputs": [{ "name": "count", "type": "u256" }]
        },
        {
          "name": "get_contract_info",
          "type": "function",
          "inputs": [],
          "outputs": [
            { "name": "name", "type": "felt252" },
            { "name": "version", "type": "felt252" }
          ]
        }
      ]`);
      
      this.contract = new Contract(contractAbi, contractAddress, this.account);
      console.log('Starknet WorkProof contract loaded at:', contractAddress);
    } catch (error) {
      console.error('StarknetService loadContract error:', error);
      throw new Error(`Failed to load Starknet contract: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}