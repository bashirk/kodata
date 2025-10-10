import { RpcProvider, Account, Contract, json } from 'starknet';

export class StarknetService {
  private provider: RpcProvider;
  private account: Account | null = null;
  private contract: Contract | null = null;
  private isInitialized = false;

  constructor() {
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
      
      const tx = await this.contract.invoke('approveSubmission', [submissionId]);
      console.log('Starknet submission approval transaction sent:', tx.transaction_hash);
      return tx.transaction_hash;
    } catch (error) {
      console.error('StarknetService approveSubmission error:', error);
      throw new Error(`Failed to approve submission on Starknet: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async loadContract() {
    try {
      if (!this.isInitialized || !this.account) {
        throw new Error('Starknet account not initialized');
      }
      
      const contractAddress = process.env.STARKNET_CONTRACT_ADDRESS;
      if (!contractAddress) {
        throw new Error('STARKNET_CONTRACT_ADDRESS environment variable not set');
      }
      
      const contractAbi = json.parse(`[
        {
          "name": "approveSubmission",
          "type": "function",
          "inputs": [{ "name": "submissionId", "type": "felt" }],
          "outputs": []
        }
      ]`);
      
      this.contract = new Contract(contractAbi, contractAddress, this.account);
      console.log('Starknet contract loaded at:', contractAddress);
    } catch (error) {
      console.error('StarknetService loadContract error:', error);
      throw new Error(`Failed to load Starknet contract: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}