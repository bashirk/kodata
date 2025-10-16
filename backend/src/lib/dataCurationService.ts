import { PrismaClient } from '@prisma/client';
import PrismaSingleton from './prisma';

/**
 * DataCurationService - Handles data validation, processing, and curation
 * 
 * This service manages:
 * - Data validation and quality assessment
 * - Content analysis and metadata extraction
 * - Data categorization and tagging
 * - Quality scoring for submissions
 * 
 * @example
 * ```typescript
 * const curationService = new DataCurationService();
 * const qualityScore = await curationService.assessDataQuality(submission);
 * ```
 */
export class DataCurationService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = PrismaSingleton.getInstance();
  }

  /**
   * Validate and process a data submission
   */
  async processSubmission(submissionId: string): Promise<{
    valid: boolean;
    qualityScore: number;
    issues: string[];
    recommendations: string[];
    metadata: Record<string, any>;
  }> {
    try {
      const submission = await this.prisma.submission.findUnique({
        where: { id: submissionId },
        include: { user: true }
      });

      if (!submission) {
        throw new Error(`Submission ${submissionId} not found`);
      }

      const metadata = submission.metadata as any || {};
      const issues: string[] = [];
      const recommendations: string[] = [];
      let qualityScore = 0;

      // 1. Basic validation
      if (!metadata.title || metadata.title.length < 5) {
        issues.push('Title is too short or missing');
        qualityScore -= 10;
      } else {
        qualityScore += 10;
      }

      if (!metadata.description || metadata.description.length < 20) {
        issues.push('Description is too short or missing');
        qualityScore -= 15;
      } else {
        qualityScore += 15;
      }

      // 2. Data type validation
      const validDataTypes = ['text', 'image', 'tabular', 'audio', 'video'];
      if (!metadata.dataType || !validDataTypes.includes(metadata.dataType)) {
        issues.push('Invalid or missing data type');
        qualityScore -= 10;
      } else {
        qualityScore += 10;
      }

      // 3. Content analysis
      if (metadata.description) {
        const descriptionAnalysis = this.analyzeTextContent(metadata.description);
        qualityScore += descriptionAnalysis.score;
        
        if (descriptionAnalysis.issues.length > 0) {
          issues.push(...descriptionAnalysis.issues);
        }
        
        if (descriptionAnalysis.recommendations.length > 0) {
          recommendations.push(...descriptionAnalysis.recommendations);
        }
      }

      // 4. Tag validation
      if (metadata.tags && Array.isArray(metadata.tags)) {
        if (metadata.tags.length === 0) {
          issues.push('No tags provided');
          qualityScore -= 5;
        } else if (metadata.tags.length > 10) {
          issues.push('Too many tags (max 10 recommended)');
          qualityScore -= 5;
        } else {
          qualityScore += Math.min(metadata.tags.length * 2, 10);
        }
      } else {
        issues.push('No tags provided');
        qualityScore -= 5;
      }

      // 5. License validation
      const validLicenses = ['CC0', 'CC-BY', 'CC-BY-SA', 'CC-BY-NC', 'MIT', 'Apache-2.0', 'GPL-3.0'];
      if (!metadata.license || !validLicenses.includes(metadata.license)) {
        issues.push('Invalid or missing license');
        qualityScore -= 10;
      } else {
        qualityScore += 10;
      }

      // 6. Contribution type validation
      const validContributionTypes = ['submit', 'label', 'validate'];
      if (!metadata.contributionType || !validContributionTypes.includes(metadata.contributionType)) {
        issues.push('Invalid contribution type');
        qualityScore -= 5;
      } else {
        qualityScore += 5;
      }

      // 7. User reputation consideration
      if (submission.user.reputation > 100) {
        qualityScore += 5; // Bonus for experienced users
      }

      // 8. Ensure quality score is within bounds
      qualityScore = Math.max(0, Math.min(100, qualityScore));

      // 9. Generate recommendations
      if (qualityScore < 70) {
        recommendations.push('Consider adding more detailed description');
        recommendations.push('Add relevant tags to improve discoverability');
        recommendations.push('Ensure data follows community guidelines');
      }

      if (metadata.dataType === 'text' && !metadata.fileInfo) {
        recommendations.push('Consider uploading the actual text file for better validation');
      }

      const result = {
        valid: qualityScore >= 50, // Minimum threshold for validity
        qualityScore,
        issues,
        recommendations,
        metadata: {
          ...metadata,
          processedAt: new Date().toISOString(),
          qualityAssessment: {
            score: qualityScore,
            issues,
            recommendations
          }
        }
      };

      // Update submission with quality assessment
      await this.prisma.submission.update({
        where: { id: submissionId },
        data: {
          qualityScore,
          metadata: result.metadata
        }
      });

      console.log(`✅ Data curation completed for submission ${submissionId}:`, {
        qualityScore,
        valid: result.valid,
        issuesCount: issues.length
      });

      return result;
    } catch (error) {
      console.error('DataCurationService processSubmission error:', error);
      throw new Error(`Failed to process submission: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Analyze text content for quality and relevance
   */
  private analyzeTextContent(text: string): {
    score: number;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 0;

    // Length analysis
    if (text.length < 50) {
      issues.push('Content is too short for meaningful analysis');
      score -= 10;
    } else if (text.length > 1000) {
      issues.push('Content is very long, consider summarizing');
      score -= 5;
    } else {
      score += 10;
    }

    // Word count analysis
    const words = text.split(/\s+/).length;
    if (words < 10) {
      issues.push('Very few words, consider adding more detail');
      score -= 10;
    } else if (words > 200) {
      recommendations.push('Consider breaking down into smaller sections');
    } else {
      score += 5;
    }

    // Language quality checks
    const sentences = text.split(/[.!?]+/).length;
    if (sentences < 2) {
      issues.push('Content lacks proper sentence structure');
      score -= 5;
    } else {
      score += 5;
    }

    // Check for common issues
    if (text.toLowerCase().includes('lorem ipsum')) {
      issues.push('Contains placeholder text');
      score -= 20;
    }

    if (text.includes('TODO') || text.includes('FIXME')) {
      issues.push('Contains incomplete notes');
      score -= 10;
    }

    // Check for data-specific keywords
    const dataKeywords = ['dataset', 'data', 'analysis', 'research', 'study', 'survey', 'collection'];
    const hasDataKeywords = dataKeywords.some(keyword => 
      text.toLowerCase().includes(keyword)
    );

    if (hasDataKeywords) {
      score += 10;
    } else {
      recommendations.push('Consider using more data-specific terminology');
    }

    return { score, issues, recommendations };
  }

  /**
   * Get curation statistics
   */
  async getCurationStats(): Promise<{
    totalSubmissions: number;
    averageQualityScore: number;
    qualityDistribution: Record<string, number>;
    commonIssues: Record<string, number>;
  }> {
    try {
      const submissions = await this.prisma.submission.findMany({
        where: {
          qualityScore: { not: null }
        },
        select: {
          qualityScore: true,
          metadata: true
        }
      });

      const totalSubmissions = submissions.length;
      const averageQualityScore = totalSubmissions > 0 
        ? submissions.reduce((sum: number, s: any) => sum + (s.qualityScore || 0), 0) / totalSubmissions
        : 0;

      // Quality distribution
      const qualityDistribution: Record<string, number> = {
        excellent: 0, // 90-100
        good: 0,      // 70-89
        fair: 0,      // 50-69
        poor: 0       // 0-49
      };

      // Common issues tracking
      const commonIssues: Record<string, number> = {};

      submissions.forEach((submission: any) => {
        const score = submission.qualityScore || 0;
        if (score >= 90) qualityDistribution.excellent++;
        else if (score >= 70) qualityDistribution.good++;
        else if (score >= 50) qualityDistribution.fair++;
        else qualityDistribution.poor++;

        // Track common issues from metadata
        const metadata = submission.metadata as any;
        if (metadata?.qualityAssessment?.issues) {
          metadata.qualityAssessment.issues.forEach((issue: string) => {
            commonIssues[issue] = (commonIssues[issue] || 0) + 1;
          });
        }
      });

      return {
        totalSubmissions,
        averageQualityScore: Math.round(averageQualityScore * 100) / 100,
        qualityDistribution,
        commonIssues
      };
    } catch (error) {
      console.error('DataCurationService getCurationStats error:', error);
      return {
        totalSubmissions: 0,
        averageQualityScore: 0,
        qualityDistribution: {},
        commonIssues: {}
      };
    }
  }

  /**
   * Auto-approve high-quality submissions
   */
  async autoApproveHighQuality(): Promise<{
    approved: number;
    processed: number;
  }> {
    try {
      const highQualitySubmissions = await this.prisma.submission.findMany({
        where: {
          status: 'PENDING',
          qualityScore: { gte: 85 } // Auto-approve high quality submissions
        }
      });

      let approved = 0;
      for (const submission of highQualitySubmissions) {
        await this.prisma.submission.update({
          where: { id: submission.id },
          data: { status: 'APPROVED' }
        });
        approved++;
      }

      console.log(`✅ Auto-approved ${approved} high-quality submissions`);

      return {
        approved,
        processed: highQualitySubmissions.length
      };
    } catch (error) {
      console.error('DataCurationService autoApproveHighQuality error:', error);
      return { approved: 0, processed: 0 };
    }
  }
}
