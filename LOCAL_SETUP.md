# KoData DAO - Local Development Setup (Without Docker)

This guide will help you set up the KoData DAO application locally for development without using Docker.

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js 20+** - [Download from nodejs.org](https://nodejs.org/)
- **pnpm** - `npm install -g pnpm` (recommended) or use npm
- **PostgreSQL 15+** - [Download from postgresql.org](https://www.postgresql.org/download/)
- **Redis** - [Download from redis.io](https://redis.io/download) or use Redis Cloud
- **Git** - [Download from git-scm.com](https://git-scm.com/)

## Step 1: Database Setup

### PostgreSQL Installation

**macOS (using Homebrew):**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Windows:**
- Download PostgreSQL installer from [postgresql.org](https://www.postgresql.org/download/windows/)
- Follow the installation wizard
- Remember the password you set for the `postgres` user

### Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database and user
CREATE DATABASE kodata;
CREATE USER kodata WITH PASSWORD 'kodata_password';
GRANT ALL PRIVILEGES ON DATABASE kodata TO kodata;

# Exit psql
\q
```

## Step 2: Redis Setup

### Local Redis Installation

**macOS (using Homebrew):**
```bash
brew install redis
brew services start redis
```

**Ubuntu/Debian:**
```bash
sudo apt install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

**Windows:**
- Download Redis from [redis.io](https://redis.io/download)
- Or use WSL2 with Ubuntu

### Alternative: Redis Cloud (Recommended for Development)

1. Sign up at [Redis Cloud](https://redis.com/try-free/)
2. Create a free database
3. Note the connection details

## Step 3: Clone and Setup Project

```bash
# Clone the repository
git clone <your-repo-url>
cd kodata-website

# Install frontend dependencies
pnpm install

# Install backend dependencies
cd backend
pnpm install
cd ..
```

## Step 4: Environment Configuration

### Backend Environment

```bash
# Copy the example environment file
cp backend/env.example backend/.env

# Edit the environment file
nano backend/.env  # or use your preferred editor
```

**Required backend environment variables:**

```env
# Database Configuration
DATABASE_URL="postgresql://kodata:kodata_password@localhost:5432/kodata"
DIRECT_URL="postgresql://kodata:kodata_password@localhost:5432/kodata"

# Redis Configuration
REDIS_URL="redis://localhost:6379"

# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"

# Starknet Configuration
STARKNET_RPC_URL="https://starknet-testnet.public.blastapi.io"
STARKNET_ACCOUNT_ADDRESS="0x..."  # Your Starknet account address
STARKNET_PRIVATE_KEY="0x..."      # Your Starknet private key
STARKNET_CONTRACT_ADDRESS="0x..." # Your deployed contract address

# Lisk Configuration
LISK_BACKEND_PUBKEY="..."        # Your Lisk public key
LISK_BACKEND_PRIVKEY="..."       # Your Lisk private key
```

### Frontend Environment

```bash
# Copy the example environment file
cp env.example .env.local

# Edit the environment file
nano .env.local  # or use your preferred editor
```

**Required frontend environment variables:**

```env
# API Configuration
VITE_API_URL="http://localhost:3001"

# Blockchain Configuration
VITE_STARKNET_RPC_URL="https://starknet-testnet.public.blastapi.io"
VITE_LISK_WS_URL="wss://ws.api.lisk.com/"
```

## Step 5: Blockchain Credentials Setup

### Starknet Setup

1. **Install Starkli CLI:**
   ```bash
   # Install Rust if not already installed
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   
   # Install Starkli
   cargo install starkli
   ```

2. **Create Account:**
   ```bash
   # Create a new account
   starkli account new --out ~/.starkli_accounts/backend.json
   
   # Get the account address
   starkli account show ~/.starkli_accounts/backend.json
   ```

3. **Fund Account:**
   - Get testnet ETH from [Starknet Faucet](https://starknet-faucet.vercel.app/)
   - Transfer to your account address

4. **Deploy Contract (Optional for testing):**
   ```bash
   # Deploy your WorkProof contract
   starkli deploy <contract-path> --account ~/.starkli_accounts/backend.json
   ```

### Lisk Setup

1. **Download Lisk Desktop:**
   - Visit [Lisk Desktop](https://lisk.com/desktop)
   - Download and install the application

2. **Create Account:**
   - Open Lisk Desktop
   - Create a new account or import existing one
   - Note down the account details

3. **Export Keys:**
   - In Lisk Desktop, go to account settings
   - Export your public and private keys
   - Use these in your backend environment

## Step 6: Database Initialization

```bash
# Navigate to backend directory
cd backend

# Generate Prisma client
pnpm run db:generate

# Push database schema
pnpm run db:push

# Optional: Seed database with test data
# pnpm run db:seed

cd ..
```

## Step 7: Start Development Servers

### Terminal 1: Backend Server

```bash
cd backend
pnpm run dev
```

The backend will start on `http://localhost:3001`

### Terminal 2: Frontend Server

```bash
# From project root
pnpm run dev
```

The frontend will start on `http://localhost:5173`

## Step 8: Verify Setup

### Test Backend API

```bash
# Health check
curl http://localhost:3001/health

# Blockchain status
curl http://localhost:3001/api/blockchain/status

# API documentation
open http://localhost:3001/
```

### Test Frontend

1. Open `http://localhost:5173` in your browser
2. Click "Join DataDAO" button
3. Try connecting a wallet
4. Test the submission flow

## Development Workflow

### Making Changes

1. **Backend changes:**
   - Edit files in `backend/src/`
   - Server auto-reloads on changes
   - Check terminal for errors

2. **Frontend changes:**
   - Edit files in `src/`
   - Browser auto-reloads on changes
   - Check browser console for errors

3. **Database changes:**
   ```bash
   cd backend
   # Edit prisma/schema.prisma
   pnpm run db:push
   ```

### Testing API Endpoints

```bash
# Test authentication
curl -X POST http://localhost:3001/api/auth/challenge

# Test user profile (requires authentication)
curl -H "Authorization: Bearer <token>" http://localhost:3001/api/users/profile
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed:**
   ```bash
   # Check PostgreSQL is running
   brew services list | grep postgresql  # macOS
   sudo systemctl status postgresql      # Linux
   
   # Test connection
   psql -U kodata -d kodata -h localhost
   ```

2. **Redis Connection Failed:**
   ```bash
   # Check Redis is running
   redis-cli ping
   
   # Should return "PONG"
   ```

3. **Port Already in Use:**
   ```bash
   # Find process using port 3001
   lsof -i :3001
   
   # Kill the process
   kill -9 <PID>
   ```

4. **Node Modules Issues:**
   ```bash
   # Clear node modules and reinstall
   rm -rf node_modules backend/node_modules
   pnpm install
   cd backend && pnpm install
   ```

5. **Prisma Issues:**
   ```bash
   cd backend
   pnpm run db:generate
   pnpm run db:push
   ```

### Environment Variable Issues

- Ensure all required variables are set in `backend/.env`
- Check that database URLs are correct
- Verify blockchain credentials are properly formatted

### Wallet Connection Issues

- Ensure wallet extensions are installed and unlocked
- Check browser console for wallet connection errors
- Verify RPC URLs are accessible

## Production Build

### Build Frontend

```bash
pnpm run build
```

### Build Backend

```bash
cd backend
pnpm run build
```

### Start Production Servers

```bash
# Backend
cd backend
pnpm start

# Frontend (serve built files)
npx serve -s dist -l 5173
```

## Additional Tools

### Database Management

- **pgAdmin**: GUI for PostgreSQL management
- **DBeaver**: Universal database tool
- **TablePlus**: Modern database client

### Redis Management

- **RedisInsight**: GUI for Redis management
- **redis-cli**: Command line interface

### Development Tools

- **Postman**: API testing
- **Insomnia**: API client
- **VS Code**: Recommended editor with extensions:
  - Prisma
  - TypeScript
  - ES7+ React/Redux/React-Native snippets

## Next Steps

1. **Set up version control** with proper `.gitignore`
2. **Configure linting** and formatting (ESLint, Prettier)
3. **Add testing** (Jest, Cypress)
4. **Set up CI/CD** pipeline
5. **Configure monitoring** and logging
6. **Deploy to production** environment

## Support

If you encounter issues:

1. Check the logs in terminal
2. Verify all services are running
3. Test individual components
4. Check environment variables
5. Review the troubleshooting section above

For additional help, refer to:
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Starknet Documentation](https://docs.starknet.io/)
- [Lisk Documentation](https://lisk.com/documentation/)
- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
