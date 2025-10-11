import { PrismaClient } from '@prisma/client';

// Singleton pattern to prevent multiple Prisma client instances
class PrismaSingleton {
  private static instance: PrismaClient;

  public static getInstance(): PrismaClient {
    if (!PrismaSingleton.instance) {
      // Use DIRECT_URL for more reliable connections
      const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
      
      PrismaSingleton.instance = new PrismaClient({
        log: ['query', 'info', 'warn', 'error'],
        datasources: {
          db: {
            url: databaseUrl,
          },
        },
      });
    }
    return PrismaSingleton.instance;
  }

  public static async disconnect(): Promise<void> {
    if (PrismaSingleton.instance) {
      await PrismaSingleton.instance.$disconnect();
      PrismaSingleton.instance = null as any;
    }
  }
}

export default PrismaSingleton;
