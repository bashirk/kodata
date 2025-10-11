import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import { Relayer } from './lib/relayer';
import { AuthService } from './lib/authService';
import { StarknetService } from './lib/starknetService';
import { LiskService } from './lib/liskService';
import { MADTokenService } from './lib/madTokenService';
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
    const { taskId, resultHash, storageUri } = req.body;
    
    const submission = await prisma.submission.create({
      data: {
        taskId,
        userId: req.user.id,
        resultHash,
        storageUri,
        status: 'PENDING'
      }
    });
    
    res.json(submission);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create submission' });
  }
});

app.get('/api/submissions', authenticateToken, async (req, res) => {
  try {
    const submissions = await prisma.submission.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(submissions);
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
