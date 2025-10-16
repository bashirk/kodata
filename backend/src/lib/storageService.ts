import { PrismaClient } from '@prisma/client';
import PrismaSingleton from './prisma';

/**
 * StorageService - Handles file storage and retrieval
 * 
 * This service manages:
 * - File uploads and storage
 * - Content addressing (IPFS-like)
 * - Metadata extraction
 * - File validation
 * 
 * @example
 * ```typescript
 * const storageService = new StorageService();
 * const storageUri = await storageService.storeFile(file, metadata);
 * ```
 */
export class StorageService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = PrismaSingleton.getInstance();
  }

  /**
   * Store a file and return a storage URI
   */
  async storeFile(file: Buffer | string, metadata: {
    filename: string;
    mimeType: string;
    size: number;
    userId: string;
    submissionId?: string;
  }): Promise<string> {
    try {
      // Generate a content hash (simplified IPFS-like addressing)
      const contentHash = this.generateContentHash(file);
      
      // For now, we'll store metadata in the database
      // In production, this would upload to IPFS or similar
      const storageRecord = await this.prisma.storage.create({
        data: {
          contentHash,
          filename: metadata.filename,
          mimeType: metadata.mimeType,
          size: metadata.size,
          userId: metadata.userId,
          submissionId: metadata.submissionId,
          storageUri: `ipfs://${contentHash}`,
          // Store file content as base64 for now (in production, use IPFS)
          content: Buffer.isBuffer(file) ? file.toString('base64') : Buffer.from(file).toString('base64')
        }
      });

      console.log(`✅ File stored with hash: ${contentHash}`);
      return storageRecord.storageUri;
    } catch (error) {
      console.error('StorageService storeFile error:', error);
      throw new Error(`Failed to store file: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Retrieve file content by storage URI
   */
  async retrieveFile(storageUri: string): Promise<{
    content: Buffer;
    metadata: {
      filename: string;
      mimeType: string;
      size: number;
      contentHash: string;
    };
  } | null> {
    try {
      const storageRecord = await this.prisma.storage.findFirst({
        where: { storageUri }
      });

      if (!storageRecord) {
        return null;
      }

      const content = Buffer.from(storageRecord.content, 'base64');
      
      return {
        content,
        metadata: {
          filename: storageRecord.filename,
          mimeType: storageRecord.mimeType,
          size: storageRecord.size,
          contentHash: storageRecord.contentHash
        }
      };
    } catch (error) {
      console.error('StorageService retrieveFile error:', error);
      throw new Error(`Failed to retrieve file: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Validate file before storage
   */
  validateFile(file: Buffer | string, metadata: {
    filename: string;
    mimeType: string;
    size: number;
  }): { valid: boolean; error?: string } {
    // File size limit (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (metadata.size > maxSize) {
      return { valid: false, error: 'File size exceeds 10MB limit' };
    }

    // Allowed file types
    const allowedTypes = [
      'text/plain',
      'text/csv',
      'application/json',
      'image/jpeg',
      'image/png',
      'image/gif',
      'audio/mpeg',
      'audio/wav',
      'video/mp4',
      'application/pdf'
    ];

    if (!allowedTypes.includes(metadata.mimeType)) {
      return { valid: false, error: `File type ${metadata.mimeType} not allowed` };
    }

    // Filename validation
    if (!metadata.filename || metadata.filename.length > 255) {
      return { valid: false, error: 'Invalid filename' };
    }

    return { valid: true };
  }

  /**
   * Extract metadata from file content
   */
  async extractMetadata(file: Buffer, mimeType: string): Promise<{
    type: 'text' | 'image' | 'audio' | 'video' | 'other';
    wordCount?: number;
    dimensions?: { width: number; height: number };
    duration?: number;
    metadata: Record<string, any>;
  }> {
    const metadata: Record<string, any> = {};
    let type: 'text' | 'image' | 'audio' | 'video' | 'other' = 'other';

    try {
      if (mimeType.startsWith('text/')) {
        type = 'text';
        const content = file.toString('utf8');
        metadata.wordCount = content.split(/\s+/).length;
        metadata.characterCount = content.length;
        metadata.lines = content.split('\n').length;
      } else if (mimeType.startsWith('image/')) {
        type = 'image';
        // Basic image metadata extraction
        metadata.format = mimeType.split('/')[1];
        // In production, use a proper image processing library
      } else if (mimeType.startsWith('audio/')) {
        type = 'audio';
        metadata.format = mimeType.split('/')[1];
      } else if (mimeType.startsWith('video/')) {
        type = 'video';
        metadata.format = mimeType.split('/')[1];
      }

      return { type, metadata };
    } catch (error) {
      console.error('StorageService extractMetadata error:', error);
      return { type: 'other', metadata: {} };
    }
  }

  /**
   * Generate content hash (simplified IPFS-like)
   */
  private generateContentHash(content: Buffer | string): string {
    const crypto = require('crypto');
    const data = Buffer.isBuffer(content) ? content : Buffer.from(content);
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    filesByType: Record<string, number>;
  }> {
    try {
      const stats = await this.prisma.storage.groupBy({
        by: ['mimeType'],
        _count: true,
        _sum: {
          size: true
        }
      });

      const totalFiles = stats.reduce((sum: number, stat: any) => sum + stat._count, 0);
      const totalSize = stats.reduce((sum: number, stat: any) => sum + (stat._sum.size || 0), 0);
      const filesByType: Record<string, number> = {};

      stats.forEach((stat: any) => {
        filesByType[stat.mimeType] = stat._count;
      });

      return { totalFiles, totalSize, filesByType };
    } catch (error) {
      console.error('StorageService getStorageStats error:', error);
      return { totalFiles: 0, totalSize: 0, filesByType: {} };
    }
  }
}
