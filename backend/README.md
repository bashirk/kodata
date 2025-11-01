# KoData DAO Backend

This is the backend service for the KoData DAO platform, providing API endpoints for user management, data submissions, blockchain interactions, and MAD token operations.

## Project Structure

```
backend/
├── src/                          # Source code
│   ├── index.ts                  # Main application entry point
│   └── lib/                      # Service libraries
│       ├── authService.ts        # Authentication service
│       ├── liskService.ts        # Lisk blockchain service
│       ├── madTokenService.ts    # MAD token service
│       ├── ethereumService.ts    # Ethereum blockchain service
│       ├── ethereumMadTokenService.ts # Ethereum MAD token service
│       ├── ethereumEventListener.ts # Ethereum event listener
│       ├── validation.ts         # Input validation utilities
│       ├── prisma.ts            # Database service
│       ├── relayer.ts           # Transaction relayer
│       └── starknetService.ts   # Starknet blockchain service
├── scripts/                      # Utility scripts
│   ├── deployment/              # Contract deployment scripts
│   │   ├── deployMADToken.js
│   │   ├── deployMADTokenFinal.js
│   │   ├── deployWorkProofStarkli.js
│   │   ├── setupMADToken.js
│   │   ├── MADToken-deployment.json
│   │   └── WorkProof-deployment.json
│   └── key-generation/          # Key generation scripts
│       ├── generateStarknetKeys.js
│       ├── generateSepoliaKeys.js
│       └── checkEnv.js
├── contracts/                    # Smart contracts
│   ├── cairo/                   # Cairo contracts
│   │   ├── lib.cairo           # Main WorkProof contract
│   │   ├── WorkProof.cairo     # WorkProof contract source
│   │   ├── Scarb.toml          # Scarb configuration
│   │   └── Scarb.lock          # Scarb lock file
│   └── madtoken/               # MAD token contract (legacy)
├── docs/                        # Documentation
│   ├── guides/                 # Setup and deployment guides
│   │   ├── STARKNET_DEPLOYMENT_GUIDE.md
│   │   ├── LISK_SEPOLIA_SETUP_GUIDE.md
│   │   └── MAD_TOKEN_QUICK_START.md
│   ├── docs.md                 # General documentation
│   └── PROPOSED_UPDATES.MD     # Proposed updates
├── prisma/                      # Database schema and migrations
│   └── schema.prisma
├── dist/                        # Compiled JavaScript (generated)
├── target/                      # Cairo build artifacts (generated)
├── package.json                 # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── env.example                 # Environment variables template
└── README.md                   # This file
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm (package manager)
- Starkli CLI (for Starknet interactions)
- Redis (for queue processing)
- PostgreSQL (for database)

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Set up environment variables:
```bash
cp env.example .env
# Edit .env with your configuration
```

3. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

4. Start the development server:
```bash
pnpm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Submissions
- `POST /api/submissions` - Create submission
- `GET /api/submissions` - List submissions
- `POST /api/submissions/:id/approve` - Approve submission
- `POST /api/submissions/:id/reject` - Reject submission

### MAD Token
- `GET /api/mad-token/info` - Get token information
- `GET /api/mad-token/balance/:address` - Get token balance
- `POST /api/mad-token/stake` - Stake tokens
- `POST /api/mad-token/unstake` - Unstake tokens

### Ethereum Integration
- `POST /api/ethereum/wallet/connect` - Connect Ethereum wallet
- `POST /api/ethereum/wallet/verify` - Verify wallet connection
- `GET /api/ethereum/balance/:address` - Get Ethereum balance
- `POST /api/ethereum/mad-token/transfer` - Transfer MAD tokens on Ethereum
- `POST /api/ethereum/submissions` - Submit dataset with MAD token deduction
- `POST /api/ethereum/governance/proposals/:id/vote` - Vote on governance proposal
- `GET /api/ethereum/transaction/:txHash/status` - Get transaction status

### Blockchain Status
- `GET /api/blockchain/status` - Get blockchain connection status

## Smart Contracts

The backend interacts with several smart contracts:

### WorkProof Contract
- **Address**: Set in `STARKNET_CONTRACT_ADDRESS`
- **Functions**: Submission management, admin operations, MAD token integration
- **Source**: `contracts/cairo/lib.cairo`

### MAD Token
- **Address**: Set in `MAD_TOKEN_CONTRACT_ADDRESS`
- **Functions**: Token operations (balance, mint, transfer)
- **Integration**: Built into WorkProof contract

## Development

### Scripts

- `pnpm run dev` - Start development server
- `pnpm run build` - Build for production
- `pnpm run start` - Start production server
- `pnpm run mad:setup` - Set up MAD token (deployment scripts)

### Contract Deployment

Use the scripts in `scripts/deployment/` to deploy contracts:

```bash
# Deploy WorkProof contract
node scripts/deployment/deployWorkProofStarkli.js

# Set up MAD token
node scripts/deployment/setupMADToken.js
```

### Key Generation

Use the scripts in `scripts/key-generation/` to generate Starknet keys:

```bash
# Generate new Starknet keys
node scripts/key-generation/generateStarknetKeys.js

# Check environment setup
node scripts/key-generation/checkEnv.js
```

## Environment Variables

See `env.example` for all required environment variables. Key variables include:

- `STARKNET_ACCOUNT_ADDRESS` - Starknet account address
- `STARKNET_PRIVATE_KEY` - Starknet private key
- `STARKNET_CONTRACT_ADDRESS` - WorkProof contract address
- `MAD_TOKEN_CONTRACT_ADDRESS` - MAD token contract address
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string

## Security Notes

- Never commit `.env` files or private keys
- Use testnet for development
- Keep keystore files secure
- Review all contract interactions before mainnet deployment

## Additional Documentation

- [Ethereum Integration Guide](ETHEREUM_INTEGRATION.md) - Comprehensive guide for Ethereum wallet integration, token transfers, governance voting, and event listening
