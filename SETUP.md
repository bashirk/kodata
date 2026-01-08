# KoData DAO Setup Instructions

This guide will help you set up the KoData DAO application with web3 backend integration.

## Prerequisites

- Node.js 20+ and pnpm
- Docker and Docker Compose
- PostgreSQL (if running locally)
- Redis (if running locally)

## Quick Start / Deployment

1. **Clone and setup:**
   ```bash
   sudo git clone https://github.com/bashirk/kodata.git app && cd app
   
   # Copy environment file
   cp env.production.example .env
   ```

2. **Configure environment variables:**
   Edit `.env` with your credentials (database, blockchain, etc.).

3. **Deploy:**
   ```bash
   docker-compose build --no-cache
   docker-compose down && docker-compose up -d
   sudo nginx -t && sudo systemctl reload nginx
   ```

4. **Initialize database:**
   ```bash
   docker-compose exec backend pnpm run db:push
   ```

5. **Access the application:**
   - Frontend: http://localhost (or your server IP)
   - Backend API: http://localhost:3001
   - API Docs: http://localhost:3001/

## Manual Setup (Development)

### Backend Setup

1. **Install dependencies:**
   ```bash
   cd backend
   pnpm install
   ```

2. **Setup database:**
   ```bash
   # Start PostgreSQL and Redis locally
   # Update DATABASE_URL in backend/.env
   
   pnpm run db:push
   pnpm run db:generate
   ```

3. **Start backend:**
   ```bash
   pnpm run dev
   ```

### Frontend Setup

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Start frontend:**
   ```bash
   pnpm run dev
   ```

## Blockchain Credentials Setup

### Starknet Setup

1. **Install Starkli CLI:**
   ```bash
   cargo install starkli
   ```

2. **Create account:**
   ```bash
   starkli account new --out ~/.starkli_accounts/backend.json
   ```

3. **Fund account:**
   - Get testnet ETH from [Starknet Faucet](https://starknet-faucet.vercel.app/)
   - Transfer to your account address

4. **Deploy contract:**
   ```bash
   # Deploy your WorkProof contract
   starkli deploy <contract-path> --account ~/.starkli_accounts/backend.json
   ```

### Lisk Setup

1. **Install Lisk Desktop:**
   - Download from [Lisk Desktop](https://lisk.com/desktop)
   - Create a new account

2. **Get credentials:**
   - Export your account's public/private key
   - Use these in your backend environment

3. **Test connection:**
   ```bash
   # Test Lisk connection
   curl -X POST https://api.lisk.com/rpc \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","method":"system_getChainID","id":1}'
   ```

## API Endpoints

### Authentication
- `POST /api/auth/challenge` - Get authentication challenge
- `POST /api/auth/login` - Login with wallet signature

### User Management
- `GET /api/users/profile` - Get user profile (requires auth)

### Submissions
- `POST /api/submissions` - Create submission (requires auth)
- `GET /api/submissions` - List user submissions (requires auth)
- `GET /api/submissions/:id` - Get specific submission (requires auth)

### Admin (Testing)
- `POST /api/admin/approve-submission/:id` - Approve submission (requires auth)

### Blockchain Status
- `GET /api/blockchain/status` - Get blockchain connection status

## Development Workflow

1. **Make changes to backend:**
   ```bash
   cd backend
   pnpm run dev  # Auto-reloads on changes
   ```

2. **Make changes to frontend:**
   ```bash
   pnpm run dev  # Auto-reloads on changes
   ```

3. **Test API endpoints:**
   ```bash
   # Test health check
   curl http://localhost:3001/health
   
   # Test blockchain status
   curl http://localhost:3001/api/blockchain/status
   ```

## Troubleshooting

### Common Issues

1. **Database connection failed:**
   - Ensure PostgreSQL is running
   - Check DATABASE_URL in backend/.env
   - Run `pnpm run db:push` to sync schema

2. **Starknet connection issues:**
   - Verify STARKNET_RPC_URL is correct
   - Check account has sufficient funds
   - Ensure contract is deployed

3. **Lisk connection issues:**
   - Verify Lisk credentials are correct
   - Check network connectivity to Lisk API

4. **CORS errors:**
   - Ensure FRONTEND_URL in backend/.env matches your frontend URL
   - Check CORS configuration in backend/src/index.ts

### Logs

View logs for debugging:
```bash
# Docker logs
docker-compose logs backend
docker-compose logs frontend

# Local development
# Backend logs appear in terminal running pnpm run dev
# Frontend logs appear in browser console
```

## Security Notes

- Never commit `.env` files to version control
- Use strong passwords for database and Redis
- Rotate blockchain private keys regularly
- Enable HTTPS in production
- Implement rate limiting for API endpoints

## Support

For issues and questions:
- Check the logs first
- Review environment configuration
- Test blockchain connections individually
- Consult the API documentation at `/api/docs`
