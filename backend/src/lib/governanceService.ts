import { PrismaClient } from '@prisma/client';
import PrismaSingleton from './prisma';
import { RunesAuthService } from './runesAuthService';

export interface ProposalData {
  title: string;
  description: string;
  proposalType: 'TREASURY' | 'GOVERNANCE' | 'TECHNICAL' | 'DATA_CURATION';
  duration?: number; // Duration in days, default 7
  metadata?: any;
}

export interface VoteData {
  proposalId: string;
  support: boolean; // true = for, false = against
  btcSignature: string;
}

export interface ProposalResult {
  proposal: any;
  forVotes: number;
  againstVotes: number;
  totalVotes: number;
  participationRate: number;
  status: 'ACTIVE' | 'PASSED' | 'REJECTED' | 'EXECUTED';
}

export class GovernanceService {
  private prisma: PrismaClient;
  private runesAuth: RunesAuthService;

  constructor() {
    this.prisma = PrismaSingleton.getInstance();
    this.runesAuth = new RunesAuthService();
  }

  /**
   * Create a new governance proposal
   */
  async createProposal(proposalData: ProposalData, proposerId: string): Promise<any> {
    try {
      console.log(`📝 Creating proposal: ${proposalData.title} by user: ${proposerId}`);
      
      // Check if proposer meets threshold
      const proposalThreshold = parseInt(process.env.PROPOSAL_THRESHOLD || '100');
      const meetsThreshold = await this.runesAuth.meetsProposalThreshold(proposerId, proposalThreshold);
      
      if (!meetsThreshold) {
        throw new Error(`Insufficient Runes balance. Need at least ${proposalThreshold} Runes to create proposals.`);
      }
      
      // Calculate proposal timing
      const startTime = new Date();
      const duration = proposalData.duration || parseInt(process.env.VOTING_PERIOD_DAYS || '7');
      const endTime = new Date(startTime.getTime() + (duration * 24 * 60 * 60 * 1000));
      
      // Create proposal
      const proposal = await this.prisma.proposal.create({
        data: {
          title: proposalData.title,
          description: proposalData.description,
          proposalType: proposalData.proposalType,
          proposer: proposerId,
          startTime,
          endTime,
          status: 'ACTIVE',
          metadata: proposalData.metadata || {}
        },
        include: {
          proposerUser: {
            select: {
              id: true,
              name: true,
              btcAddress: true,
              votingPower: true
            }
          }
        }
      });
      
      console.log(`✅ Proposal created: ${proposal.id} - ${proposal.title}`);
      
      return proposal;
    } catch (error) {
      console.error('❌ Failed to create proposal:', error);
      throw new Error(`Failed to create proposal: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Submit a vote on a proposal
   */
  async vote(voteData: VoteData, userId: string): Promise<any> {
    try {
      console.log(`🗳️ User ${userId} voting on proposal ${voteData.proposalId}: ${voteData.support ? 'FOR' : 'AGAINST'}`);
      
      // Get proposal
      const proposal = await this.prisma.proposal.findUnique({
        where: { id: voteData.proposalId }
      });
      
      if (!proposal) {
        throw new Error('Proposal not found');
      }
      
      // Check if proposal is still active
      if (proposal.status !== 'ACTIVE') {
        throw new Error('Proposal is no longer active');
      }
      
      // Check if voting period has ended
      if (new Date() > proposal.endTime) {
        throw new Error('Voting period has ended');
      }
      
      // Check if user has already voted
      const existingVote = await this.prisma.vote.findUnique({
        where: {
          proposalId_userId: {
            proposalId: voteData.proposalId,
            userId: userId
          }
        }
      });
      
      if (existingVote) {
        throw new Error('User has already voted on this proposal');
      }
      
      // Get user's voting power
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { 
          btcAddress: true, 
          votingPower: true,
          runesBalance: true 
        }
      });
      
      if (!user || user.votingPower === 0) {
        throw new Error('User has no voting power');
      }
      
      // Verify Bitcoin signature
      const message = `Vote on proposal ${voteData.proposalId}: ${voteData.support ? 'FOR' : 'AGAINST'}`;
      const signatureValid = await this.runesAuth.verifyBitcoinSignature(
        user.btcAddress || '', 
        message, 
        voteData.btcSignature
      );
      
      if (!signatureValid) {
        throw new Error('Invalid Bitcoin signature');
      }
      
      // Create vote
      const vote = await this.prisma.vote.create({
        data: {
          proposalId: voteData.proposalId,
          userId: userId,
          support: voteData.support,
          votingPower: user.votingPower,
          btcSignature: voteData.btcSignature
        }
      });
      
      // Update proposal vote counts
      const voteCounts = await this.prisma.vote.groupBy({
        by: ['support'],
        where: { proposalId: voteData.proposalId },
        _sum: { votingPower: true }
      });
      
      const forVotes = voteCounts.find(v => v.support)?._sum.votingPower || 0;
      const againstVotes = voteCounts.find(v => !v.support)?._sum.votingPower || 0;
      
      await this.prisma.proposal.update({
        where: { id: voteData.proposalId },
        data: {
          forVotes: forVotes.toString(),
          againstVotes: againstVotes.toString()
        }
      });
      
      console.log(`✅ Vote recorded: ${vote.id} for proposal ${voteData.proposalId}`);
      
      return {
        vote,
        updatedCounts: {
          forVotes,
          againstVotes
        }
      };
    } catch (error) {
      console.error('❌ Failed to submit vote:', error);
      throw new Error(`Failed to submit vote: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Execute a passed proposal
   */
  async executeProposal(proposalId: string, executorId: string): Promise<any> {
    try {
      console.log(`⚡ Executing proposal: ${proposalId} by executor: ${executorId}`);
      
      const proposal = await this.prisma.proposal.findUnique({
        where: { id: proposalId },
        include: { votes: true }
      });
      
      if (!proposal) {
        throw new Error('Proposal not found');
      }
      
      if (proposal.status !== 'PASSED') {
        throw new Error('Proposal has not passed');
      }
      
      if (proposal.executed) {
        throw new Error('Proposal has already been executed');
      }
      
      // Mark proposal as executed
      const updatedProposal = await this.prisma.proposal.update({
        where: { id: proposalId },
        data: { 
          executed: true,
          status: 'EXECUTED'
        }
      });
      
      console.log(`✅ Proposal executed: ${proposalId}`);
      
      return updatedProposal;
    } catch (error) {
      console.error('❌ Failed to execute proposal:', error);
      throw new Error(`Failed to execute proposal: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get proposals with optional filtering
   */
  async getProposals(filter?: {
    status?: 'ACTIVE' | 'PASSED' | 'REJECTED' | 'EXECUTED';
    proposalType?: 'TREASURY' | 'GOVERNANCE' | 'TECHNICAL' | 'DATA_CURATION';
    proposer?: string;
  }): Promise<any[]> {
    try {
      const proposals = await this.prisma.proposal.findMany({
        where: filter || {},
        include: {
          proposerUser: {
            select: {
              id: true,
              name: true,
              btcAddress: true,
              votingPower: true
            }
          },
          votes: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  btcAddress: true
                }
              }
            }
          },
          _count: {
            select: { votes: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      
      return proposals;
    } catch (error) {
      console.error('❌ Failed to get proposals:', error);
      return [];
    }
  }

  /**
   * Get proposal results
   */
  async getProposalResults(proposalId: string): Promise<ProposalResult> {
    try {
      const proposal = await this.prisma.proposal.findUnique({
        where: { id: proposalId },
        include: {
          votes: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  btcAddress: true,
                  votingPower: true
                }
              }
            }
          }
        }
      });
      
      if (!proposal) {
        throw new Error('Proposal not found');
      }
      
      const forVotes = parseInt(proposal.forVotes);
      const againstVotes = parseInt(proposal.againstVotes);
      const totalVotes = forVotes + againstVotes;
      
      // Calculate participation rate (simplified - would need total eligible voters)
      const totalRunesHolders = await this.prisma.user.count({
        where: { votingPower: { gt: 0 } }
      });
      
      const participationRate = totalRunesHolders > 0 ? (proposal.votes.length / totalRunesHolders) * 100 : 0;
      
      // Determine status
      let status = proposal.status;
      if (status === 'ACTIVE' && new Date() > proposal.endTime) {
        const quorumPercentage = parseInt(process.env.QUORUM_PERCENTAGE || '20');
        const passed = forVotes > againstVotes && participationRate >= quorumPercentage;
        status = passed ? 'PASSED' : 'REJECTED';
        
        // Update proposal status
        await this.prisma.proposal.update({
          where: { id: proposalId },
          data: { status }
        });
      }
      
      return {
        proposal,
        forVotes,
        againstVotes,
        totalVotes,
        participationRate,
        status
      };
    } catch (error) {
      console.error('❌ Failed to get proposal results:', error);
      throw new Error(`Failed to get proposal results: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get user's voting history
   */
  async getUserVotingHistory(userId: string): Promise<any[]> {
    try {
      const votes = await this.prisma.vote.findMany({
        where: { userId },
        include: {
          proposal: {
            select: {
              id: true,
              title: true,
              description: true,
              proposalType: true,
              status: true,
              endTime: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      
      return votes;
    } catch (error) {
      console.error('❌ Failed to get user voting history:', error);
      return [];
    }
  }

  /**
   * Get governance statistics
   */
  async getGovernanceStats(): Promise<any> {
    try {
      const stats = await this.prisma.proposal.groupBy({
        by: ['status'],
        _count: true
      });
      
      const totalProposals = await this.prisma.proposal.count();
      const totalVotes = await this.prisma.vote.count();
      const totalRunesHolders = await this.prisma.user.count({
        where: { votingPower: { gt: 0 } }
      });
      
      return {
        totalProposals,
        totalVotes,
        totalRunesHolders,
        proposalsByStatus: stats,
        averageParticipation: totalRunesHolders > 0 ? (totalVotes / totalRunesHolders) * 100 : 0
      };
    } catch (error) {
      console.error('❌ Failed to get governance stats:', error);
      return {
        totalProposals: 0,
        totalVotes: 0,
        totalRunesHolders: 0,
        proposalsByStatus: [],
        averageParticipation: 0
      };
    }
  }
}
