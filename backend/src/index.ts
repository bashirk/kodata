import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { Relayer } from './lib/relayer';
import { AuthService } from './lib/authService';
import { StarknetService } from './lib/starknetService';
import { LiskService } from './lib/liskService';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const app = express();
const prisma = new PrismaClient();
const relayer = new Relayer();
const authService = new AuthService();
const starknetService = new StarknetService();
const liskService = new LiskService();

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
      where: { id: req.params.id }
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
    
    // Update submission status
    const updatedSubmission = await prisma.submission.update({
      where: { id: submission.id },
      data: { 
        status: 'APPROVED',
        qualityScore: 85 // Quality score based on review
      }
    });
    
    // Queue submission for Lisk reputation processing
    await relayer.queueSubmission(submission.id);
    
    res.json({ 
      submission: updatedSubmission,
      starknetTxHash,
      message: 'Submission approved and queued for Lisk reputation update'
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to approve submission' });
  }
});

// Blockchain status endpoints
app.get('/api/blockchain/status', async (req, res) => {
  try {
    res.json({
      starknet: {
        connected: true,
        rpcUrl: process.env.STARKNET_RPC_URL || 'https://starknet-testnet.public.blastapi.io'
      },
      lisk: {
        connected: true,
        wsUrl: 'wss://ws.api.lisk.com/'
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get blockchain status' });
  }
});

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // Start the relayer
    await relayer.startListening();
    console.log('Relayer service started');
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`Ready check: http://localhost:${PORT}/ready`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await relayer.stopListening();
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await relayer.stopListening();
  await prisma.$disconnect();
  process.exit(0);
});

startServer();