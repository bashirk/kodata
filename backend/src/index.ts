import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import { Relayer } from './lib/relayer';
import { AuthService } from './lib/authService';
import { StarknetService } from './lib/starknetService';
import { LiskService } from './lib/liskService';
import { MADTokenService } from './lib/madTokenService';
import { DataCurationService } from './lib/dataCurationService';
import PrismaSingleton from './lib/prisma';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const app = express();
const prisma = PrismaSingleton.getInstance();
const relayer = new Relayer();
const authService = new AuthService();
const starknetService = new StarknetService();
const liskService = new LiskService();
const madTokenService = new MADTokenService();
const dataCurationService = new DataCurationService();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Auth middleware
const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const user = await authService.verifyToken(token);
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Ready check endpoint
app.get('/ready', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ready', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({ status: 'not ready', error: 'Database connection failed' });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Data DAO Backend API',
    version: '1.0.0',
    endpoints: ['/health', '/ready', '/api/auth', '/api/submissions', '/api/users'],
    services: ['relayer', 'starknet', 'lisk', 'auth']
  });
});

// Auth endpoints
app.post('/api/auth/challenge', (req, res) => {
  try {
    const challenge = authService.generateChallenge();
    res.json(challenge);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate challenge' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { user, token } = await authService.authenticateUser(req.body);
    res.json({ user, token });
  } catch (error) {
    res.status(401).json({ error: error instanceof Error ? error.message : 'Authentication failed' });
  }
});

// User endpoints
app.get('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        credits: true,
        starknetAddress: true,
        liskAddress: true,
        btcAddress: true,
        reputation: true,
        createdAt: true
      }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Submission endpoints
app.post('/api/submissions', authenticateToken, async (req, res) => {
  try {
    const { 
      taskId, 
      resultHash, 
      storageUri, 
      title, 
      description, 
      dataType, 
      tags, 
      license,
      contributionType,
      file
    } = req.body;
    
    console.log('📝 Creating submission with data:', {
      taskId,
      title,
      description,
      dataType,
      contributionType,
      userId: req.user.id
    });
    
    // Validate required fields
    if (!title || !description) {
      res.status(400).json({ error: 'Title and description are required' });
      return;
    }
    
    // Create submission with proper data curation fields
    const submission = await prisma.submission.create({
      data: {
        taskId: taskId || `task_${Date.now()}`,
        userId: req.user.id,
        resultHash: resultHash || `hash_${Date.now()}`,
        storageUri: storageUri || 'text://submission',
        status: 'PENDING',
        // Add metadata for data curation
        metadata: {
          title,
          description,
          dataType: dataType || 'text',
          contributionType: contributionType || 'submit',
          tags: tags ? tags.split(',').map((t: string) => t.trim()) : [],
          license: license || 'CC0',
          submittedAt: new Date().toISOString(),
          fileInfo: file ? {
            name: file.name,
            size: file.size,
            type: file.type
          } : null
        }
      }
    });
    
    console.log(`✅ Submission created successfully: ${submission.id} by user ${req.user.id}`);
    console.log(`📊 Submission details:`, {
      id: submission.id,
      title,
      dataType,
      contributionType,
      status: submission.status
    });
    
    // Process submission through data curation service
    try {
      const curationResult = await dataCurationService.processSubmission(submission.id);
      console.log(`🔍 Data curation completed:`, {
        submissionId: submission.id,
        qualityScore: curationResult.qualityScore,
        valid: curationResult.valid,
        issuesCount: curationResult.issues.length
      });
      
      // Update submission with curation results
      const updatedSubmission = await prisma.submission.findUnique({
        where: { id: submission.id }
      });
      
      res.json({
        submission: updatedSubmission,
        curation: curationResult,
        message: 'Submission created successfully and processed through data curation'
      });
    } catch (curationError) {
      console.error('❌ Data curation failed:', curationError);
      res.json({
        submission,
        curation: null,
        message: 'Submission created successfully but data curation failed'
      });
    }
  } catch (error) {
    console.error('❌ Failed to create submission:', error);
    res.status(500).json({ 
      error: 'Failed to create submission',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

app.get('/api/submissions', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin - if so, return ALL submissions
    const currentUser = await prisma.user.findUnique({
      where: { id: req.user.id }
    });
    
    const isAdmin = currentUser && ((currentUser as any).isAdmin || (currentUser as any).role === 'ADMIN');
    
    const submissions = await prisma.submission.findMany({
      where: isAdmin ? {} : { userId: req.user.id }, // Admin sees all, users see only their own
      include: {
        user: {
          select: {
            id: true,
            name: true,
            starknetAddress: true,
            liskAddress: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ submissions, isAdmin });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

app.get('/api/submissions/:id', authenticateToken, async (req, res) => {
  try {
    const submission = await prisma.submission.findFirst({
      where: { 
        id: req.params.id,
        userId: req.user.id 
      }
    });
    
    if (!submission) {
      res.status(404).json({ error: 'Submission not found' });
      return;
    }
    
    res.json(submission);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch submission' });
  }
});

// Admin endpoints for production submission approval
app.post('/api/admin/approve-submission/:id', authenticateToken, async (req, res) => {
  try {
    const submission = await prisma.submission.findUnique({
      where: { id: req.params.id },
      include: { user: true }
    });
    
    if (!submission) {
      res.status(404).json({ error: 'Submission not found' });
      return;
    }
    
    if (submission.status !== 'PENDING') {
      res.status(400).json({ error: 'Submission is not in pending status' });
      return;
    }
    
    // Approve on Starknet
    const starknetTxHash = await starknetService.approveSubmission(submission.id);
    
    // Calculate MAD token reward based on quality score
    const baseReward = 100; // Base reward: 100 MAD tokens
    const qualityMultiplier = 1.0; // Can be adjusted based on submission quality
    const rewardAmount = (baseReward * qualityMultiplier).toString();
    
    // Mint MAD tokens to the submitter
    let madTokenTxHash = null;
    let rewardError = null;
    try {
      if (submission.user.starknetAddress) {
        console.log(`Minting ${rewardAmount} MAD tokens to ${submission.user.starknetAddress} for approved submission ${submission.id}`);
        
        // Use the MAD token service to mint tokens securely
        try {
          madTokenTxHash = await madTokenService.mintTokens(
            submission.user.starknetAddress, 
            rewardAmount, 
            `approval_reward_submission_${submission.id}`
          );
          console.log(`✅ MAD tokens minted successfully: ${madTokenTxHash}`);
        } catch (mintError) {
          console.warn('⚠️ MAD token minting failed:', mintError instanceof Error ? mintError.message : String(mintError));
          rewardError = 'Token minting failed: ' + (mintError instanceof Error ? mintError.message : String(mintError));
          // Continue with approval even if token minting fails
        }
      } else {
        rewardError = 'User has no Starknet address for token rewards';
      }
    } catch (error) {
      console.error('❌ MAD token reward error:', error);
      rewardError = error instanceof Error ? error.message : 'Unknown reward error';
    }
    
    // Update submission status with reward information
    const updatedSubmission = await prisma.submission.update({
      where: { id: submission.id },
      data: { 
        status: 'APPROVED',
        qualityScore: 85, // Quality score based on review
        rewardAmount: rewardAmount,
        rewardTxHash: madTokenTxHash,
        rewardError: rewardError
      }
    });
    
    // Queue submission for Lisk reputation processing
    await relayer.queueSubmission(submission.id);
    
    res.json({ 
      submission: updatedSubmission,
      starknetTxHash,
      madTokenReward: {
        amount: rewardAmount,
        txHash: madTokenTxHash,
        error: rewardError
      },
      message: 'Submission approved, MAD tokens rewarded, and queued for Lisk reputation update'
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to approve submission' });
  }
});

// MAD Token endpoints
app.get('/api/mad-token/info', async (req, res) => {
  try {
    const contractAddress = process.env.MAD_TOKEN_CONTRACT_ADDRESS;
    
    if (!contractAddress) {
      return res.status(500).json({ error: 'MAD_TOKEN_CONTRACT_ADDRESS not set' });
    }
    
    const tokenInfoCmd = `starkli call ${contractAddress} get_mad_token_info --network sepolia`;
    const tokenInfoOutput = execSync(tokenInfoCmd, { encoding: 'utf8', stdio: 'pipe' });
    const tokenInfo = JSON.parse(tokenInfoOutput);
    
    // Decode token info
    const name = Buffer.from(tokenInfo[0].replace('0x', ''), 'hex').toString('utf8').replace(/\0/g, '');
    const symbol = Buffer.from(tokenInfo[1].replace('0x', ''), 'hex').toString('utf8').replace(/\0/g, '');
    const decimals = parseInt(tokenInfo[2], 16);
    const totalSupply = BigInt(tokenInfo[3]).toString();
    
    return res.json({
      name,
      symbol,
      decimals,
      totalSupply
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to get MAD token info' });
  }
});

app.get('/api/mad-token/balance/:address', async (req, res) => {
  try {
    const contractAddress = process.env.MAD_TOKEN_CONTRACT_ADDRESS;
    
    if (!contractAddress) {
      return res.status(500).json({ error: 'MAD_TOKEN_CONTRACT_ADDRESS not set' });
    }
    
    const balanceCmd = `starkli call ${contractAddress} get_mad_token_balance --network sepolia ${req.params.address}`;
    const balanceOutput = execSync(balanceCmd, { encoding: 'utf8', stdio: 'pipe' });
    const balance = JSON.parse(balanceOutput);
    
    return res.json({ 
      address: req.params.address, 
      balance: balance[0] 
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to get MAD token balance' });
  }
});

app.get('/api/mad-token/staking/:address', async (req, res) => {
  try {
    const stakingInfo = await madTokenService.getStakingInfo(req.params.address);
    res.json({ address: req.params.address, ...stakingInfo });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get staking info' });
  }
});

app.post('/api/mad-token/stake', authenticateToken, async (req, res) => {
  try {
    const { amount } = req.body;
    const userAddress = req.user.starknetAddress;
    
    if (!userAddress) {
      return res.status(400).json({ error: 'User has no Starknet address' });
    }
    
    const txHash = await madTokenService.stakeTokens(amount, 30); // 30 days duration
    return res.json({ txHash, message: 'Staking transaction submitted' });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to stake tokens' });
  }
});

app.post('/api/mad-token/unstake', authenticateToken, async (req, res) => {
  try {
    const { amount } = req.body;
    const userAddress = req.user.starknetAddress;
    
    if (!userAddress) {
      return res.status(400).json({ error: 'User has no Starknet address' });
    }
    
    const txHash = await madTokenService.unstakeTokens(amount);
    return res.json({ txHash, message: 'Unstaking transaction submitted' });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to unstake tokens' });
  }
});

app.post('/api/mad-token/claim-rewards', authenticateToken, async (req, res) => {
  try {
    const txHash = await madTokenService.claimStakingRewards();
    res.json({ txHash, message: 'Reward claim transaction submitted' });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to claim rewards' });
  }
});

// Admin MAD Token endpoints
app.post('/api/admin/mad-token/mint', authenticateToken, async (req, res) => {
  try {
    const { to, amount, reason } = req.body;
    const txHash = await madTokenService.mintTokens(to, amount, reason);
    res.json({ txHash, message: 'Mint transaction submitted' });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to mint tokens' });
  }
});

app.post('/api/admin/mad-token/transfer', authenticateToken, async (req, res) => {
  try {
    const { to, amount } = req.body;
    const txHash = await madTokenService.transferTokens(to, amount);
    res.json({ txHash, message: 'Transfer transaction submitted' });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to transfer tokens' });
  }
});

// Reward management endpoints
app.get('/api/rewards/history/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get user's reward history from approved submissions
    const rewardHistory = await prisma.submission.findMany({
      where: {
        userId: userId,
        status: 'APPROVED',
        rewardAmount: { not: null }
      },
      select: {
        id: true,
        taskId: true,
        rewardAmount: true,
        rewardTxHash: true,
        rewardError: true,
        qualityScore: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Calculate total rewards
    const totalRewards = rewardHistory.reduce((sum, submission) => {
      return sum + (submission.rewardAmount ? parseInt(submission.rewardAmount) : 0);
    }, 0);
    
    return res.json({
      userId,
      totalRewards: totalRewards.toString(),
      rewardCount: rewardHistory.length,
      history: rewardHistory
    });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to get reward history' });
  }
});

app.get('/api/rewards/stats', authenticateToken, async (req, res) => {
  try {
    // Get overall reward statistics
    const totalRewards = await prisma.submission.aggregate({
      where: {
        status: 'APPROVED',
        rewardAmount: { not: null }
      },
      _count: true
    });
    
    const rewardStats = await prisma.submission.groupBy({
      by: ['status'],
      _count: true,
      where: {
        rewardAmount: { not: null }
      }
    });
    
    return res.json({
      totalRewardTransactions: totalRewards._count,
      rewardStats: rewardStats
    });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to get reward stats' });
  }
});

// Data curation endpoints
app.get('/api/curation/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await dataCurationService.getCurationStats();
    return res.json(stats);
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to get curation stats' });
  }
});

app.post('/api/curation/process/:submissionId', authenticateToken, async (req, res) => {
  try {
    const { submissionId } = req.params;
    const result = await dataCurationService.processSubmission(submissionId);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to process submission' });
  }
});

app.post('/api/curation/auto-approve', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    const currentUser = await prisma.user.findUnique({
      where: { id: req.user.id }
    });
    
    if (!currentUser || (!(currentUser as any).isAdmin && (currentUser as any).role !== 'ADMIN')) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const result = await dataCurationService.autoApproveHighQuality();
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to auto-approve submissions' });
  }
});

// Token transfer endpoint
app.post('/api/mad-token/transfer', authenticateToken, async (req, res) => {
  try {
    const { to, amount, from } = req.body;
    
    if (!to || !amount) {
      return res.status(400).json({ error: 'Recipient address and amount are required' });
    }
    
    // Validate amount is a positive number
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }
    
    console.log(`🔄 Processing token transfer: ${amount} MAD from ${from || 'admin'} to ${to}`);
    
    const txHash = await madTokenService.transferTokens(to, amount, from);
    
    return res.json({
      success: true,
      transactionHash: txHash,
      message: `Successfully transferred ${amount} MAD tokens to ${to}`
    });
  } catch (error) {
    console.error('Token transfer error:', error);
    return res.status(500).json({ 
      error: 'Failed to transfer tokens',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

app.post('/api/admin/rewards/manual', authenticateToken, async (req, res) => {
  try {
    const { to, amount, reason } = req.body;
    
    if (!to || !amount) {
      return res.status(400).json({ error: 'Recipient address and amount are required' });
    }
    
    // Use the MAD token service to mint tokens securely
    try {
      const txHash = await madTokenService.mintTokens(to, amount, reason || 'manual reward');
      
      console.log(`✅ Manual reward minted: ${amount} MAD tokens to ${to} (${reason || 'manual reward'})`);
      
      return res.json({
        txHash,
        amount,
        recipient: to,
        reason: reason || 'manual reward',
        message: 'Manual reward transaction submitted'
      });
    } catch (mintError) {
      console.error('❌ Manual reward minting failed:', mintError instanceof Error ? mintError.message : String(mintError));
      return res.status(500).json({ 
        error: 'Failed to mint manual reward',
        details: mintError instanceof Error ? mintError.message : String(mintError)
      });
    }
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to process manual reward' });
  }
});

// Admin delegation endpoints
app.get('/api/admin/users', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    const currentUser = await prisma.user.findUnique({
      where: { id: req.user.id }
    });
    
    if (!currentUser || (!(currentUser as any).isAdmin && (currentUser as any).role !== 'ADMIN')) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    // Get all users with their submission counts
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: {
            submissions: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return res.json({ users });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to get users' });
  }
});

app.post('/api/admin/users/:userId/promote', authenticateToken, async (req, res) => {
  try {
    // Check if current user is admin
    const currentUser = await prisma.user.findUnique({
      where: { id: req.user.id }
    });
    
    if (!currentUser || (!(currentUser as any).isAdmin && (currentUser as any).role !== 'ADMIN')) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { userId } = req.params;
    const { role } = req.body;
    
    if (!['ADMIN', 'MODERATOR'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be ADMIN or MODERATOR' });
    }
    
    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role: role as any,
        isAdmin: role === 'ADMIN',
        adminApprovedBy: req.user.id,
        adminApprovedAt: new Date()
      } as any
    });
    
    console.log(`✅ User ${userId} promoted to ${role} by admin ${req.user.id}`);
    
    return res.json({
      user: updatedUser,
      message: `User promoted to ${role} successfully`
    });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to promote user' });
  }
});

app.post('/api/admin/users/:userId/demote', authenticateToken, async (req, res) => {
  try {
    // Check if current user is admin
    const currentUser = await prisma.user.findUnique({
      where: { id: req.user.id }
    });
    
    if (!currentUser || (!(currentUser as any).isAdmin && (currentUser as any).role !== 'ADMIN')) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { userId } = req.params;
    
    // Prevent self-demotion
    if (userId === req.user.id) {
      return res.status(400).json({ error: 'Cannot demote yourself' });
    }
    
    // Update user role to USER
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role: 'USER' as any,
        isAdmin: false,
        adminApprovedBy: null,
        adminApprovedAt: null
      } as any
    });
    
    console.log(`✅ User ${userId} demoted to USER by admin ${req.user.id}`);
    
    return res.json({
      user: updatedUser,
      message: 'User demoted successfully'
    });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to demote user' });
  }
});

// Admin rewards for approving submissions
app.post('/api/admin/approve-submission/:id', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    const currentUser = await prisma.user.findUnique({
      where: { id: req.user.id }
    });
    
    if (!currentUser || (!(currentUser as any).isAdmin && (currentUser as any).role !== 'ADMIN')) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const submission = await prisma.submission.findUnique({
      where: { id: req.params.id },
      include: { user: true }
    });
    
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }
    
    if (submission.status !== 'PENDING') {
      return res.status(400).json({ error: 'Submission is not in pending status' });
    }
    
    // Approve on Starknet
    const starknetTxHash = await starknetService.approveSubmission(submission.id);
    
    // Calculate rewards
    const submitterReward = 100; // Base reward: 100 MAD tokens
    const adminReward = 25; // Admin reward: 25 MAD tokens for approving
    
    // Mint tokens to submitter
    let submitterTxHash = null;
    let submitterError = null;
    try {
      if (submission.user.starknetAddress) {
        console.log(`Minting ${submitterReward} MAD tokens to ${submission.user.starknetAddress} for approved submission ${submission.id}`);
        
        try {
          submitterTxHash = await madTokenService.mintTokens(
            submission.user.starknetAddress, 
            submitterReward.toString(), 
            `approval_reward_submission_${submission.id}`
          );
          console.log(`✅ Submitter tokens minted successfully: ${submitterTxHash}`);
        } catch (mintError) {
          console.warn('⚠️ Submitter token minting failed:', mintError instanceof Error ? mintError.message : String(mintError));
          submitterError = 'Token minting failed: ' + (mintError instanceof Error ? mintError.message : String(mintError));
        }
      } else {
        submitterError = 'User has no Starknet address for token rewards';
      }
    } catch (error) {
      console.error('❌ Submitter token reward error:', error);
      submitterError = error instanceof Error ? error.message : 'Unknown reward error';
    }
    
    // Mint tokens to admin
    let adminTxHash = null;
    let adminError = null;
    try {
      if (currentUser.starknetAddress) {
        console.log(`Minting ${adminReward} MAD tokens to admin ${currentUser.starknetAddress} for approving submission ${submission.id}`);
        
        try {
          adminTxHash = await madTokenService.mintTokens(
            currentUser.starknetAddress, 
            adminReward.toString(), 
            `admin_approval_reward_submission_${submission.id}`
          );
          console.log(`✅ Admin tokens minted successfully: ${adminTxHash}`);
        } catch (mintError) {
          console.warn('⚠️ Admin token minting failed:', mintError instanceof Error ? mintError.message : String(mintError));
          adminError = 'Token minting failed: ' + (mintError instanceof Error ? mintError.message : String(mintError));
        }
      } else {
        adminError = 'Admin has no Starknet address for token rewards';
      }
    } catch (error) {
      console.error('❌ Admin token reward error:', error);
      adminError = error instanceof Error ? error.message : 'Unknown reward error';
    }
    
    // Update submission status with reward information
    const updatedSubmission = await prisma.submission.update({
      where: { id: submission.id },
      data: { 
        status: 'APPROVED',
        qualityScore: 85, // Quality score based on review
        rewardAmount: submitterReward.toString(),
        rewardTxHash: submitterTxHash,
        rewardError: submitterError
      }
    });
    
    // Queue submission for Lisk reputation processing
    await relayer.queueSubmission(submission.id);
    
    return res.json({ 
      submission: updatedSubmission,
      starknetTxHash,
      submitterReward: {
        amount: submitterReward.toString(),
        txHash: submitterTxHash,
        error: submitterError
      },
      adminReward: {
        amount: adminReward.toString(),
        txHash: adminTxHash,
        error: adminError
      },
      message: 'Submission approved, rewards distributed to submitter and admin'
    });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to approve submission' });
  }
});

// Blockchain status endpoints
app.get('/api/blockchain/status', async (req, res) => {
  try {
    const status = {
      starknet: {
        connected: false,
        rpcUrl: process.env.STARKNET_RPC_URL || 'https://starknet-testnet.public.blastapi.io',
        contractAddress: process.env.STARKNET_CONTRACT_ADDRESS,
        workProof: {
          connected: false,
          message: 'Not tested',
          name: '',
          version: '',
          admin: '',
          submissionCount: ''
        }
      },
      lisk: {
        connected: false,
        wsUrl: 'wss://ws.api.lisk.com/',
        message: 'Not tested'
      },
      madToken: {
        connected: false,
        contractAddress: process.env.MAD_TOKEN_CONTRACT_ADDRESS || null,
        message: 'MAD token contract not deployed yet',
        name: '',
        symbol: '',
        decimals: 0,
        totalSupply: ''
      }
    };

    // Test Starknet connection using starkli
    try {
      console.log('Testing Starknet connection...');
      
      // Test contract info
      const contractInfoCmd = `starkli call ${process.env.STARKNET_CONTRACT_ADDRESS} get_contract_info --network sepolia`;
      const contractInfoOutput = execSync(contractInfoCmd, { encoding: 'utf8', stdio: 'pipe' });
      const contractInfo = JSON.parse(contractInfoOutput);
      
      // Decode the contract info (it's in hex)
      const name = Buffer.from(contractInfo[0].replace('0x', ''), 'hex').toString('utf8').replace(/\0/g, '');
      const version = Buffer.from(contractInfo[1].replace('0x', ''), 'hex').toString('utf8').replace(/\0/g, '');
      
      // Test admin
      const adminCmd = `starkli call ${process.env.STARKNET_CONTRACT_ADDRESS} get_admin --network sepolia`;
      const adminOutput = execSync(adminCmd, { encoding: 'utf8', stdio: 'pipe' });
      const admin = JSON.parse(adminOutput)[0];
      
      // Test submission count
      const submissionCountCmd = `starkli call ${process.env.STARKNET_CONTRACT_ADDRESS} get_submission_count --network sepolia`;
      const submissionCountOutput = execSync(submissionCountCmd, { encoding: 'utf8', stdio: 'pipe' });
      const submissionCount = JSON.parse(submissionCountOutput);
      
      status.starknet.connected = true;
      status.starknet.workProof = {
        connected: true,
        message: 'WorkProof contract connected successfully',
        name: name,
        version: version,
        admin: admin,
        submissionCount: submissionCount[0] + submissionCount[1] // u256 is split into low and high
      };
      console.log('✅ Starknet connection successful');
    } catch (error) {
      console.log('❌ Starknet connection failed:', error instanceof Error ? error.message : String(error));
      status.starknet.workProof.message = `Connection failed: ${error instanceof Error ? error.message : String(error)}`;
    }

    // Test Lisk connection
    try {
      console.log('Testing Lisk connection...');
      // Simple test - just check if we can create a LiskService instance
      const liskService = new LiskService();
      status.lisk.connected = true;
      status.lisk.message = 'Lisk service initialized';
      console.log('✅ Lisk connection successful');
    } catch (error) {
      console.log('❌ Lisk connection failed:', error instanceof Error ? error.message : String(error));
      status.lisk.message = `Connection failed: ${error instanceof Error ? error.message : String(error)}`;
    }

    // Test MAD Token if deployed
    if (process.env.MAD_TOKEN_CONTRACT_ADDRESS) {
      try {
        console.log('Testing MAD Token connection...');
        const tokenInfoCmd = `starkli call ${process.env.MAD_TOKEN_CONTRACT_ADDRESS} get_mad_token_info --network sepolia`;
        const tokenInfoOutput = execSync(tokenInfoCmd, { encoding: 'utf8', stdio: 'pipe' });
        const tokenInfo = JSON.parse(tokenInfoOutput);
        
        // Decode token info
        const name = Buffer.from(tokenInfo[0].replace('0x', ''), 'hex').toString('utf8').replace(/\0/g, '');
        const symbol = Buffer.from(tokenInfo[1].replace('0x', ''), 'hex').toString('utf8').replace(/\0/g, '');
        const decimals = parseInt(tokenInfo[2], 16);
        const totalSupply = BigInt(tokenInfo[3]).toString();
        
        status.madToken = {
          connected: true,
          contractAddress: process.env.MAD_TOKEN_CONTRACT_ADDRESS,
          message: 'MAD Token connected successfully',
          name,
          symbol,
          decimals,
          totalSupply
        };
        console.log('✅ MAD Token connection successful');
      } catch (error) {
        console.log('❌ MAD Token connection failed:', error instanceof Error ? error.message : String(error));
        status.madToken.message = `Connection failed: ${error instanceof Error ? error.message : String(error)}`;
      }
    }
    
    res.json(status);
  } catch (error) {
    console.error('Blockchain status error:', error);
    res.status(500).json({ error: 'Failed to get blockchain status', details: error instanceof Error ? error.message : String(error) });
  }
});

const PORT = process.env.PORT || 3001;
let server: import('http').Server; // Define server variable to hold the instance

async function startServer() {
  try {
    // Start the relayer
    await relayer.startListening();
    console.log('Relayer service started');

    // Start the server and SAVE the instance
    server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`Ready check: http://localhost:${PORT}/ready`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// ✅ Corrected Graceful shutdown logic
const shutdown = async () => {
  console.log('Shutdown signal received, closing connections gracefully.');
  
  // 1. Stop the server from accepting new connections
  server.close(async () => {
    console.log('HTTP server closed.');

    // 2. Close other services
    await relayer.stopListening();
    await PrismaSingleton.disconnect();
    console.log('Prisma and Relayer disconnected.');
    
    // 3. Exit the process
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

startServer();
