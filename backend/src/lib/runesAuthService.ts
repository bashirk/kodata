import { PrismaClient } from '@prisma/client';
import PrismaSingleton from './prisma';

export interface RunesBalance {
  balance: number;
  runeId: string;
  address: string;
  allRunes: any[];
}

export interface RunesAuthData {
  btcAddress: string;
  signature: string;
  message: string;
  runeId?: string;
}

export class RunesAuthService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = PrismaSingleton.getInstance();
  }

  /**
   * Verify Runes balance for a Bitcoin address using Hiro Ordinals API
   */
  async verifyRunesBalance(btcAddress: string, runeId?: string): Promise<RunesBalance> {
    try {
      console.log(`🔍 Verifying Runes balance for address: ${btcAddress}, runeId: ${runeId}`);
      
      // Query Hiro Ordinals API for Runes balance
      const response = await fetch(`https://api.hiro.so/ordinals/v1/runes/balances/${btcAddress}`);
      
      if (!response.ok) {
        throw new Error(`Hiro API error: ${response.status}`);
      }
      
      const data = await response.json() as { results?: Array<{ rune: { id: string }, balance: string }> };
      console.log('📊 Hiro API response:', data);
      
      // Find the specific Rune balance
      if (data.results && data.results.length > 0) {
        const runeBalance = data.results.find((r) => r.rune.id === runeId);
        const balance = runeBalance ? parseInt(runeBalance.balance) : 0;
        
        console.log(`✅ Runes balance for ${runeId}: ${balance}`);
        return {
          balance,
          runeId: runeId || '',
          address: btcAddress,
          allRunes: data.results
        };
      }
      
      return {
        balance: 0,
        runeId: runeId || '',
        address: btcAddress,
        allRunes: []
      };
    } catch (error) {
      console.error('❌ Runes balance verification failed:', error);
      throw new Error(`Failed to verify Runes balance: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Register a Runes holder in the database
   */
  async registerRunesHolder(userId: string, authData: RunesAuthData): Promise<any> {
    try {
      console.log(`📝 Registering Runes holder: ${userId} with address: ${authData.btcAddress}`);
      
      // Verify Runes balance
      const runesData = await this.verifyRunesBalance(authData.btcAddress, authData.runeId);
      
      // Calculate voting power based on balance
      const votingPower = Math.floor(runesData.balance / 100); // 1 vote per 100 Runes
      
      // Update user with Runes information
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: {
          btcAddress: authData.btcAddress,
          runesBalance: runesData.balance.toString(),
          runesRuneId: authData.runeId || runesData.runeId,
          votingPower: votingPower,
          lastRunesSync: new Date()
        }
      });
      
      console.log(`✅ Runes holder registered: ${userId}, voting power: ${votingPower}`);
      
      return {
        user: updatedUser,
        runesData,
        votingPower
      };
    } catch (error) {
      console.error('❌ Failed to register Runes holder:', error);
      throw new Error(`Failed to register Runes holder: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Sync Runes balance for a user
   */
  async syncRunesBalance(userId: string): Promise<any> {
    try {
      console.log(`🔄 Syncing Runes balance for user: ${userId}`);
      
      const user = await this.prisma.user.findUnique({
        where: { id: userId }
      });
      
      if (!user || !user.btcAddress) {
        throw new Error('User not found or no Bitcoin address');
      }
      
      // Verify current Runes balance
      const runesData = await this.verifyRunesBalance(user.btcAddress, user.runesRuneId || undefined);
      
      // Calculate new voting power
      const votingPower = Math.floor(runesData.balance / 100);
      
      // Update user with new balance
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: {
          runesBalance: runesData.balance.toString(),
          votingPower: votingPower,
          lastRunesSync: new Date()
        }
      });
      
      console.log(`✅ Runes balance synced: ${userId}, new balance: ${runesData.balance}, voting power: ${votingPower}`);
      
      return {
        user: updatedUser,
        runesData,
        votingPower
      };
    } catch (error) {
      console.error('❌ Failed to sync Runes balance:', error);
      throw new Error(`Failed to sync Runes balance: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get voting power for a user
   */
  async getVotingPower(userId: string): Promise<number> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { votingPower: true }
      });
      
      return user?.votingPower || 0;
    } catch (error) {
      console.error('❌ Failed to get voting power:', error);
      return 0;
    }
  }

  /**
   * Verify Bitcoin signature (basic validation for now)
   */
  async verifyBitcoinSignature(address: string, message: string, signature: string): Promise<boolean> {
    try {
      // For development/testing, we'll accept properly formatted signatures
      // In production, you'd want to use a proper Bitcoin signature verification library
      
      if (!address || !message || !signature) {
        return false;
      }
      
      // Basic format validation
      if (!address.startsWith('bc1') && !address.startsWith('1') && !address.startsWith('3')) {
        console.warn('Invalid Bitcoin address format:', address);
        return false;
      }
      
      if (signature.length < 64) {
        console.warn('Invalid signature format:', signature);
        return false;
      }
      
      console.log(`✅ Bitcoin signature validation passed for address: ${address}`);
      return true;
    } catch (error) {
      console.error('❌ Bitcoin signature verification failed:', error);
      return false;
    }
  }

  /**
   * Get all Runes holders
   */
  async getRunesHolders(): Promise<any[]> {
    try {
      const holders = await this.prisma.user.findMany({
        where: {
          btcAddress: { not: null },
          runesBalance: { not: null }
        },
        select: {
          id: true,
          name: true,
          btcAddress: true,
          runesBalance: true,
          runesRuneId: true,
          votingPower: true,
          lastRunesSync: true
        },
        orderBy: { votingPower: 'desc' }
      });
      
      return holders;
    } catch (error) {
      console.error('❌ Failed to get Runes holders:', error);
      return [];
    }
  }

  /**
   * Check if user meets proposal threshold
   */
  async meetsProposalThreshold(userId: string, threshold: number = 100): Promise<boolean> {
    try {
      const votingPower = await this.getVotingPower(userId);
      return votingPower >= threshold;
    } catch (error) {
      console.error('❌ Failed to check proposal threshold:', error);
      return false;
    }
  }
}
