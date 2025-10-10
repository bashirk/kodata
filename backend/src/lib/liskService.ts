import { apiClient } from '@liskhq/lisk-client';
import { address } from '@liskhq/lisk-cryptography';
import { signTransaction } from '@liskhq/lisk-transactions';

export class LiskService {
  private client: ReturnType<typeof apiClient.createWSClient>;

  constructor() {
    this.client = apiClient.createWSClient('wss://ws.api.lisk.com/');
  }

  async increaseReputation(targetAddress: string, delta: number, reason: string) {
    try {
      const c = await this.client;
      const chainID = await c.invoke('system_getChainID');
      const senderPublicKey = Buffer.from(process.env.LISK_BACKEND_PUBKEY!, 'hex');
      const senderAddress = address.getAddressFromPublicKey(senderPublicKey);
      const account = await c.invoke('auth_getAuthAccount', { address: senderAddress });
      
      const tx = {
        module: 'reputation',
        command: 'increase',
        params: {
          targetAddress,
          delta,
          reason,
        },
        nonce: BigInt(account.nonce as string),
        fee: BigInt(1000000),
        senderPublicKey,
        signatures: [],
      };
      
      // Use chainID directly as network identifier
      const networkIdentifier = Buffer.from(String(chainID), 'hex');
      const privateKey = Buffer.from(process.env.LISK_BACKEND_PRIVKEY!, 'hex');
      const signedTx = signTransaction(tx, networkIdentifier, privateKey);
      const encodedTx = c.transaction.encode(signedTx);
      const result = await c.invoke('txpool_postTransaction', { transaction: encodedTx.toString('hex') });
      
      console.log('Lisk reputation increase transaction sent:', result.transactionId);
      return result.transactionId;
    } catch (error) {
      console.error('LiskService increaseReputation error:', error);
      throw new Error(`Failed to increase reputation on Lisk: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async disconnect() {
    try {
      const c = await this.client;
      await c.disconnect();
      console.log('Lisk client disconnected');
    } catch (error) {
      console.error('LiskService disconnect error:', error);
    }
  }
}