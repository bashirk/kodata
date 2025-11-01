import { Alchemy, Network, AlchemySubscription } from 'alchemy-sdk';
import { ethers } from 'ethers';
import { PrismaClient, Prisma } from '@prisma/client';

interface EventListenerConfig {
  alchemyKey: string;
  network: 'homestead' | 'sepolia';
  madTokenAddress: string;
  serverWalletAddress: string;
}

interface TransferEvent {
  from: string;
  to: string;
  value: string;
  transactionHash: string;
  blockNumber: number;
  blockHash: string;
}

export class EthereumEventListener {
  private alchemy: Alchemy;
  private provider: ethers.Provider;
  private prisma: PrismaClient;
  private madTokenContract: ethers.Contract;
  private isListening: boolean = false;
  private listeners: Map<string, any> = new Map();

  // ERC-20 Transfer event topic
  private readonly TRANSFER_TOPIC = ethers.keccak256(ethers.toUtf8Bytes('Transfer(address,address,uint256)'));

  constructor(
    private config: EventListenerConfig,
    prisma: PrismaClient
  ) {
    this.prisma = prisma;
    
    // Initialize Alchemy
    const settings = {
      apiKey: config.alchemyKey,
      network: config.network === 'homestead' ? Network.ETH_MAINNET : Network.ETH_SEPOLIA,
    };
    
    this.alchemy = new Alchemy(settings);
    this.provider = new ethers.AlchemyProvider(config.network, config.alchemyKey);
    
    // Initialize MAD token contract
    const abi = [
      'event Transfer(address indexed from, address indexed to, uint256 value)',
      'function decimals() view returns (uint8)',
      'function symbol() view returns (string)',
      'function name() view returns (string)'
    ];
    
    this.madTokenContract = new ethers.Contract(
      config.madTokenAddress,
      abi,
      this.provider
    );
  }

  /**
   * Start listening for MAD token transfer events
   */
  async startListening(): Promise<void> {
    if (this.isListening) {
      console.log('🔄 Ethereum event listener already running');
      return;
    }

    try {
      console.log('🚀 Starting Ethereum event listener...');
      
      // Listen for Transfer events
      await this.listenForTransfers();
      
      // Listen for pending transactions (optional, for real-time monitoring)
      await this.listenForPendingTransactions();
      
      this.isListening = true;
      console.log('✅ Ethereum event listener started successfully');
    } catch (error) {
      console.error('❌ Failed to start Ethereum event listener:', error);
      throw error;
    }
  }

  /**
   * Stop listening for events
   */
  async stopListening(): Promise<void> {
    if (!this.isListening) {
      console.log('🔄 Ethereum event listener not running');
      return;
    }

    try {
      console.log('🛑 Stopping Ethereum event listener...');
      
      // Remove all listeners
      this.listeners.forEach((listener, key) => {
        this.provider.off(key, listener);
      });
      this.listeners.clear();
      
      this.isListening = false;
      console.log('✅ Ethereum event listener stopped');
    } catch (error) {
      console.error('❌ Error stopping Ethereum event listener:', error);
      throw error;
    }
  }

  /**
   * Listen for Transfer events from the MAD token contract
   */
  private async listenForTransfers(): Promise<void> {
    try {
      // Create filter for Transfer events
      const filter = {
        address: this.config.madTokenAddress,
        topics: [this.TRANSFER_TOPIC],
        fromBlock: 'latest'
      };

      // Listen for new Transfer events
      const listener = (log: any) => {
        this.processTransferEvent(log);
      };

      this.madTokenContract.on('Transfer', listener);
      this.listeners.set('Transfer', listener);
      
      console.log('👂 Listening for MAD token Transfer events');
    } catch (error) {
      console.error('❌ Error setting up Transfer event listener:', error);
      throw error;
    }
  }

  /**
   * Process a Transfer event
   */
  private async processTransferEvent(log: any): Promise<void> {
    try {
      console.log('🔄 Processing Transfer event:', log.transactionHash);
      
      // Parse the log
      const parsedLog = this.madTokenContract.interface.parseLog(log);
      if (!parsedLog) {
        console.warn('⚠️ Failed to parse Transfer event log');
        return;
      }

      const from = (parsedLog.args as any).from.toLowerCase();
      const to = (parsedLog.args as any).to.toLowerCase();
      const value = (parsedLog.args as any).value.toString();
      const decimals = await this.madTokenContract.decimals();
      const formattedValue = ethers.formatUnits(value, decimals);

      console.log(`💰 Transfer detected: ${formattedValue} MAD from ${from} to ${to}`);

      // Store the transfer in database
      await this.storeTransferEvent({
        from,
        to,
        value: formattedValue,
        transactionHash: log.transactionHash,
        blockNumber: log.blockNumber,
        blockHash: log.blockHash
      });

      // Handle specific business logic
      await this.handleTransferBusinessLogic(from, to, formattedValue, log.transactionHash);

    } catch (error) {
      console.error('❌ Error processing Transfer event:', error);
    }
  }

  /**
   * Store transfer event in database
   */
  private async storeTransferEvent(event: TransferEvent): Promise<void> {
    try {
      // Check if this transfer is already recorded
      const existingTransfer = await this.prisma.ethereumTransfer.findFirst({
        where: { transactionHash: event.transactionHash }
      });

      if (existingTransfer) {
        console.log(`🔄 Transfer already recorded: ${event.transactionHash}`);
        return;
      }

      // Find users associated with these addresses
      const [fromUser, toUser] = await Promise.all([
        this.prisma.user.findFirst({ where: { ethereumAddress: event.from } }),
        this.prisma.user.findFirst({ where: { ethereumAddress: event.to } })
      ]);

      // Store transfer for both users (if they exist)
      if (fromUser) {
        await this.prisma.ethereumTransfer.create({
          data: {
            fromAddress: event.from,
            toAddress: event.to,
            amount: new Prisma.Decimal(event.value.toString()),
            transactionHash: event.transactionHash,
            blockNumber: event.blockNumber,
            blockHash: event.blockHash,
            gasUsed: '0',
            gasPrice: '0',
            status: 'confirmed',
            eventType: 'transfer',
            processed: true,
            userId: fromUser.id
          }
        });
      }

      if (toUser && toUser.id !== fromUser?.id) {
        await this.prisma.ethereumTransfer.create({
          data: {
            fromAddress: event.from,
            toAddress: event.to,
            amount: new Prisma.Decimal(event.value.toString()),
            transactionHash: event.transactionHash,
            blockNumber: event.blockNumber,
            blockHash: event.blockHash,
            gasUsed: '0',
            gasPrice: '0',
            status: 'confirmed',
            eventType: 'transfer',
            processed: true,
            userId: toUser.id
          }
        });
      }

      console.log(`✅ Transfer stored: ${event.transactionHash}`);
    } catch (error) {
      console.error('❌ Error storing transfer event:', error);
      throw error;
    }
  }

  /**
   * Handle business logic for specific transfer types
   */
  private async handleTransferBusinessLogic(
    from: string,
    to: string,
    amount: string,
    txHash: string
  ): Promise<void> {
    try {
      const serverWallet = this.config.serverWalletAddress.toLowerCase();

      // Handle governance deposits (user -> server)
      if (to === serverWallet) {
        await this.handleGovernanceDeposit(from, amount, txHash);
      }

      // Handle governance withdrawals (server -> user)
      if (from === serverWallet) {
        await this.handleGovernanceWithdrawal(to, amount, txHash);
      }

      // Handle regular transfers between users
      if (from !== serverWallet && to !== serverWallet) {
        await this.handleUserTransfer(from, to, amount, txHash);
      }

    } catch (error) {
      console.error('❌ Error handling transfer business logic:', error);
    }
  }

  /**
   * Handle governance deposit (user sends MAD tokens to server)
   */
  private async handleGovernanceDeposit(
    userAddress: string,
    amount: string,
    txHash: string
  ): Promise<void> {
    try {
      console.log(`🏛️ Governance deposit detected: ${amount} MAD from ${userAddress}`);

      // Find user by Ethereum address
      const user = await this.prisma.user.findFirst({
        where: { ethereumAddress: userAddress }
      });

      if (!user) {
        console.warn(`⚠️ User not found for address: ${userAddress}`);
        return;
      }

      // Update user's governance stake
      const currentStake = parseFloat(user.governanceStake || '0');
      const depositAmount = parseFloat(amount);
      const newStake = currentStake + depositAmount;

      await this.prisma.user.update({
        where: { id: user.id },
        data: { governanceStake: newStake.toString() }
      });

      // Log activity
      await this.prisma.activity.create({
        data: {
          userId: user.id,
          type: 'GOVERNANCE_DEPOSIT',
          title: 'Governance Deposit',
          description: `Deposited ${amount} MAD tokens for governance`,
          metadata: {
            amount,
            transactionHash: txHash,
            blockchain: 'ethereum',
            eventType: 'governance_deposit'
          }
        }
      });

      console.log(`✅ Updated governance stake for user ${user.id}: ${newStake} MAD`);
    } catch (error) {
      console.error('❌ Error handling governance deposit:', error);
    }
  }

  /**
   * Handle governance withdrawal (server sends MAD tokens to user)
   */
  private async handleGovernanceWithdrawal(
    userAddress: string,
    amount: string,
    txHash: string
  ): Promise<void> {
    try {
      console.log(`🏛️ Governance withdrawal detected: ${amount} MAD to ${userAddress}`);

      // Find user by Ethereum address
      const user = await this.prisma.user.findFirst({
        where: { ethereumAddress: userAddress }
      });

      if (!user) {
        console.warn(`⚠️ User not found for address: ${userAddress}`);
        return;
      }

      // Update user's governance stake
      const currentStake = parseFloat(user.governanceStake || '0');
      const withdrawalAmount = parseFloat(amount);
      const newStake = Math.max(0, currentStake - withdrawalAmount);

      await this.prisma.user.update({
        where: { id: user.id },
        data: { governanceStake: newStake.toString() }
      });

      // Log activity
      await this.prisma.activity.create({
        data: {
          userId: user.id,
          type: 'GOVERNANCE_WITHDRAWAL',
          title: 'Governance Withdrawal',
          description: `Withdrew ${amount} MAD tokens from governance`,
          metadata: {
            amount,
            transactionHash: txHash,
            blockchain: 'ethereum',
            eventType: 'governance_withdrawal'
          }
        }
      });

      console.log(`✅ Updated governance stake for user ${user.id}: ${newStake} MAD`);
    } catch (error) {
      console.error('❌ Error handling governance withdrawal:', error);
    }
  }

  /**
   * Handle regular user-to-user transfers
   */
  private async handleUserTransfer(
    fromAddress: string,
    toAddress: string,
    amount: string,
    txHash: string
  ): Promise<void> {
    try {
      console.log(`🔄 User transfer detected: ${amount} MAD from ${fromAddress} to ${toAddress}`);

      // Find both users
      const [fromUser, toUser] = await Promise.all([
        this.prisma.user.findFirst({ where: { ethereumAddress: fromAddress } }),
        this.prisma.user.findFirst({ where: { ethereumAddress: toAddress } })
      ]);

      if (!fromUser || !toUser) {
        console.warn(`⚠️ One or both users not found for transfer: ${fromAddress} -> ${toAddress}`);
        return;
      }

      // Log the transfer activity
      await this.prisma.activity.create({
        data: {
          userId: fromUser.id,
          type: 'transfer',
          title: 'Token Transfer Sent',
          description: `Sent ${amount} MAD to ${toUser.name || toAddress.slice(0, 6)}...${toAddress.slice(-4)}`,
          metadata: {
            amount,
            recipient: toAddress,
            transactionHash: txHash,
            blockchain: 'ethereum'
          }
        }
      });

      await this.prisma.activity.create({
        data: {
          userId: toUser.id,
          type: 'transfer',
          title: 'Token Transfer Received',
          description: `Received ${amount} MAD from ${fromUser.name || fromAddress.slice(0, 6)}...${fromAddress.slice(-4)}`,
          metadata: {
            amount,
            sender: fromAddress,
            transactionHash: txHash,
            blockchain: 'ethereum'
          }
        }
      });

      console.log(`✅ Logged user transfer activity for users ${fromUser.id} and ${toUser.id}`);
    } catch (error) {
      console.error('❌ Error handling user transfer:', error);
    }
  }

  /**
   * Listen for pending transactions (for monitoring)
   */
  private async listenForPendingTransactions(): Promise<void> {
    try {
      // This is optional and can be used for real-time monitoring
      // For now, we'll just log when it's available
      console.log('📡 Pending transaction monitoring available (not active)');
    } catch (error) {
      console.error('❌ Error setting up pending transaction listener:', error);
    }
  }

  /**
   * Get recent transfer events (for debugging/monitoring)
   */
  async getRecentTransfers(limit: number = 10): Promise<any[]> {
    try {
      return await this.prisma.ethereumTransfer.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
          user: { select: { id: true, name: true, ethereumAddress: true } }
        }
      });
    } catch (error) {
      console.error('❌ Error getting recent transfers:', error);
      throw error;
    }
  }

  /**
   * Get transfer statistics
   */
  async getTransferStats(): Promise<any> {
    try {
      const [
        totalTransfers,
        uniqueSenders,
        uniqueRecipients
      ] = await Promise.all([
        this.prisma.ethereumTransfer.count(),
        this.prisma.ethereumTransfer.groupBy({
          by: ['fromAddress'],
          _count: true
        }),
        this.prisma.ethereumTransfer.groupBy({
          by: ['toAddress'],
          _count: true
        })
      ]);

      return {
        totalTransfers,
        totalVolume: '0', // Amount is stored as string, can't aggregate
        uniqueSenders: uniqueSenders.length,
        uniqueRecipients: uniqueRecipients.length
      };
    } catch (error) {
      console.error('❌ Error getting transfer statistics:', error);
      throw error;
    }
  }
}