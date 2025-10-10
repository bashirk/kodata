import { StarknetService } from './starknetService';
import { LiskService } from './liskService';
import { PrismaClient } from '@prisma/client';
import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';

interface ApprovedSubmission {
  id: string;
  userId: string;
  taskId: string;
  resultHash: string;
  storageUri: string;
  status: string;
  createdAt: Date;
  liskTxId?: string | null;
  qualityScore?: number | null;
}

export class Relayer {
  private starknetService: StarknetService;
  private liskService: LiskService;
  private prisma: PrismaClient;
  private redis: Redis;
  private submissionQueue: Queue;
  private isRunning = false;

  constructor() {
    this.starknetService = new StarknetService();
    this.liskService = new LiskService();
    this.prisma = new PrismaClient();
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    
    // Initialize BullMQ queue for processing submissions
    this.submissionQueue = new Queue('submission-processing', {
      connection: this.redis,
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    });
  }

  async startListening() {
    if (this.isRunning) {
      console.log('Relayer is already running');
      return;
    }

    this.isRunning = true;
    console.log('Relayer started with BullMQ queue processing');

    // Start BullMQ worker for processing submissions
    const worker = new Worker('submission-processing', async (job) => {
      const { submissionId } = job.data;
      await this.processSubmission(submissionId);
    }, {
      connection: this.redis,
      concurrency: 5,
    });

    worker.on('completed', (job) => {
      console.log(`Submission ${job.data.submissionId} processed successfully`);
    });

    worker.on('failed', (job, err) => {
      console.error(`Submission ${job?.data.submissionId} processing failed:`, err);
    });

    // Listen for database changes using Prisma subscriptions
    this.setupDatabaseSubscriptions();
  }

  async stopListening() {
    this.isRunning = false;
    console.log('Relayer stopped');
    
    // Close Redis connection
    await this.redis.quit();
    
    // Disconnect services
    await this.liskService.disconnect();
  }

  /**
   * Setup database subscriptions to listen for submission status changes
   */
  private setupDatabaseSubscriptions() {
    // In a production environment, you would use database triggers or change streams
    // For now, we'll implement a polling mechanism with better error handling
    const pollInterval = setInterval(async () => {
      if (!this.isRunning) {
        clearInterval(pollInterval);
        return;
      }
      
      try {
        await this.processPendingSubmissions();
      } catch (error) {
        console.error('Relayer polling error:', error);
      }
    }, 30000); // Check every 30 seconds
  }

  /**
   * Process a single submission through the queue
   */
  async queueSubmission(submissionId: string) {
    await this.submissionQueue.add('process-submission', { submissionId });
  }

  /**
   * Process a single submission
   */
  private async processSubmission(submissionId: string) {
    try {
      const submission = await this.prisma.submission.findUnique({
        where: { id: submissionId }
      });

      if (!submission) {
        throw new Error(`Submission ${submissionId} not found`);
      }

      if (submission.status !== 'APPROVED') {
        console.log(`Submission ${submissionId} is not approved, skipping`);
        return;
      }

      console.log(`Processing approved submission ${submissionId}`);
      
      // Get user information for reputation update
      const user = await this.prisma.user.findUnique({
        where: { id: submission.userId }
      });

      if (!user) {
        throw new Error(`User ${submission.userId} not found`);
      }

      // Trigger reputation increase on Lisk
      const liskTxId = await this.liskService.increaseReputation(
        user.liskAddress || user.starknetAddress || submission.userId,
        10, // Reputation delta
        `Data submission approved: ${submissionId}`
      );
      
      // Update submission with Lisk transaction ID
      await this.prisma.submission.update({
        where: { id: submission.id },
        data: { 
          liskTxId: liskTxId as string,
          status: 'APPROVED'
        }
      });
      
      console.log(`Successfully processed submission ${submissionId} with Lisk tx: ${liskTxId}`);
    } catch (error) {
      console.error(`Failed to process submission ${submissionId}:`, error);
      throw error;
    }
  }

  /**
   * Process pending submissions that need to be queued
   */
  private async processPendingSubmissions() {
    try {
      const pendingSubmissions = await this.prisma.submission.findMany({
        where: { 
          status: 'APPROVED',
          liskTxId: null // Only process submissions that haven't been processed yet
        }
      });
      
      for (const submission of pendingSubmissions) {
        await this.queueSubmission(submission.id);
      }
    } catch (error) {
      console.error('Failed to process pending submissions:', error);
      throw new Error(`Failed to process pending submissions: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async getApprovedSubmissions(): Promise<ApprovedSubmission[]> {
    try {
      const submissions = await this.prisma.submission.findMany({
        where: { status: 'APPROVED' }
      });
      
      return submissions;
    } catch (error) {
      console.error('Failed to fetch approved submissions:', error);
      throw new Error(`Failed to fetch approved submissions: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}