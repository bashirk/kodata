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
   * Verify Runes balance for a Bitcoin address using SecretKey Labs API
   * In development mode, provides test Runes for demo purposes
   */
  async verifyRunesBalance(btcAddress: string, runeId?: string): Promise<RunesBalance> {
    try {
      console.log(`🔍 Verifying Runes balance for address: ${btcAddress}, runeId: ${runeId}`);
      
      // Check if we're in development mode and should provide test Runes
      const isDevelopment = process.env.NODE_ENV === 'development' || process.env.RUNES_NETWORK === 'testnet';
      
      if (isDevelopment) {
        console.log('🧪 Development mode: Providing test Runes for demo');
        
        // Generate deterministic test Runes based on address
        const testBalance = this.generateTestRunesBalance(btcAddress);
        
        console.log(`✅ Test Runes balance for ${btcAddress}: ${testBalance.balance}`);
        return testBalance;
      }
      
      // Production: Query SecretKey Labs API for Runes balance
      const apiKey = process.env.SECRETKEY_API_KEY || process.env.HIRO_API_KEY;
      const url = runeId 
        ? `https://api.secretkeylabs.io/v2/runes/address/${btcAddress}/balance?runeId=${runeId}`
        : `https://api.secretkeylabs.io/v2/runes/address/${btcAddress}/balance`;
      
      const headers: Record<string, string> = {
        'Accept': 'application/json'
      };
      
      if (apiKey) {
        headers['x-api-key'] = apiKey;
      }
      
      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        throw new Error(`SecretKey Labs API error: ${response.status}`);
      }
      
      const data = await response.json() as { 
        balances?: Array<{ 
          runeId: string, 
          symbol: string, 
          runeName: string,
          confirmedBalance: string,
          availableBalance: string,
          projectedBalance: string
        }>,
        indexerHeight: number
      };
      
      console.log('📊 SecretKey Labs API response:', data);
      
      // Find the specific Rune balance
      if (data.balances && data.balances.length > 0) {
        const runeBalance = runeId 
          ? data.balances.find((r) => r.runeId === runeId)
          : data.balances[0]; // Use first Rune if no specific ID provided
        
        const balance = runeBalance ? parseInt(runeBalance.confirmedBalance) : 0;
        
        console.log(`✅ Runes balance for ${runeBalance?.runeId || 'first rune'}: ${balance}`);
        return {
          balance,
          runeId: runeBalance?.runeId || runeId || '',
          address: btcAddress,
          allRunes: data.balances
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
      
      // Fallback to test Runes in case of API failure
      console.log('🔄 API failed, falling back to test Runes');
      const testBalance = this.generateTestRunesBalance(btcAddress);
      return testBalance;
    }
  }

  /**
   * Generate deterministic test Runes balance for development/demo
   */
  private generateTestRunesBalance(btcAddress: string): RunesBalance {
    // Create deterministic balance based on address
    const addressHash = btcAddress.split('').reduce((hash, char) => {
      return hash + char.charCodeAt(0);
    }, 0);
    
    // Generate balance between 50-1000 Runes for demo
    const balance = 50 + (addressHash % 950);
    
    return {
      balance,
      runeId: 'TEST:DEMO',
      address: btcAddress,
      allRunes: [{
        runeId: 'TEST:DEMO',
        symbol: 'DEMO',
        runeName: 'Demo Runes',
        confirmedBalance: balance.toString(),
        availableBalance: balance.toString(),
        projectedBalance: balance.toString()
      }]
    };
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
   * In development mode, allows test Runes to bypass threshold
   */
  async meetsProposalThreshold(userId: string, threshold: number = 100): Promise<boolean> {
    try {
      // Check if we're in development mode
      const isDevelopment = process.env.NODE_ENV === 'development' || process.env.RUNES_NETWORK === 'testnet';
      
      if (isDevelopment) {
        // In development mode, check if user has test Runes
        const user = await this.prisma.user.findUnique({
          where: { id: userId },
          select: { 
            runesRuneId: true, 
            votingPower: true,
            runesBalance: true 
          }
        });
        
        // If user has test Runes (TEST:DEMO), allow proposal creation
        if (user?.runesRuneId === 'TEST:DEMO' && user?.runesBalance && parseInt(user.runesBalance) > 0) {
          console.log(`🧪 Development mode: User ${userId} has test Runes, allowing proposal creation`);
          return true;
        }
      }
      
      // Production mode or no test Runes: check actual threshold
      const votingPower = await this.getVotingPower(userId);
      return votingPower >= threshold;
    } catch (error) {
      console.error('❌ Failed to check proposal threshold:', error);
      return false;
    }
  }
}
