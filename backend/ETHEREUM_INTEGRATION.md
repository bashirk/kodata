# Ethereum Integration Guide

This guide covers the Ethereum integration for the KoData platform, including wallet connection, token transfers, governance voting, and event listening.

## Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Ethereum RPC provider (Alchemy/Infura)
- Private key for server wallet (hot wallet)

## Environment Variables

Add these to your `.env` file:

```bash
# Ethereum Configuration
ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/your-api-key
ETHEREUM_PRIVATE_KEY=your-server-wallet-private-key
ETHEREUM_MAD_TOKEN_ADDRESS=0x... # MAD token contract address
ETHEREUM_SERVER_WALLET_ADDRESS=0x... # Server wallet address

# Optional: Alchemy WebSocket for event listening
ALCHEMY_WS_URL=wss://eth-mainnet.g.alchemy.com/v2/your-api-key
```

## API Endpoints

### Wallet Connection

#### Connect Ethereum Wallet
```bash
curl -X POST http://localhost:3001/api/ethereum/wallet/connect \
  -H "Content-Type: application/json" \
  -d '{
    "address": "0x742d35Cc6634C0532925a3b8D0f8A1D8e8b8b8b8",
    "signature": "0x...",
    "message": "Sign this message to connect your Ethereum wallet to KoData"
  }'
```

#### Verify Wallet Connection
```bash
curl -X POST http://localhost:3001/api/ethereum/wallet/verify \
  -H "Content-Type: application/json" \
  -d '{
    "address": "0x742d35Cc6634C0532925a3b8D0f8A1D8e8b8b8b8",
    "signature": "0x...",
    "message": "Sign this message to verify your Ethereum wallet"
  }'
```

### Balance & Token Management

#### Get Ethereum Balance
```bash
curl -X GET "http://localhost:3001/api/ethereum/balance/0x742d35Cc6634C0532925a3b8D0f8A1D8e8b8b8b8"
```

#### Transfer MAD Tokens
```bash
curl -X POST http://localhost:3001/api/ethereum/mad-token/transfer \
  -H "Content-Type: application/json" \
  -d '{
    "to": "0x742d35Cc6634C0532925a3b8D0f8A1D8e8b8b8b8",
    "amount": "1000000000000000000",
    "from": "0x742d35Cc6634C0532925a3b8D0f8A1D8e8b8b8b8"
  }'
```

### Dataset Submissions

#### Submit Dataset (with MAD token deduction)
```bash
curl -X POST http://localhost:3001/api/ethereum/submissions \
  -H "Content-Type: application/json" \
  -d '{
    "userAddress": "0x742d35Cc6634C0532925a3b8D0f8A1D8e8b8b8b8",
    "datasetHash": "QmYjtig7VJQ6XsnUjqqJvj7QaMcCAwtrgNdahSiFofrE7o",
    "metadata": {
      "title": "Climate Data 2024",
      "description": "Global temperature and precipitation data",
      "tags": ["climate", "weather", "temperature"]
    },
    "signature": "0x...",
    "message": "I confirm submission of climate dataset"
  }'
```

### Governance Voting

#### Vote on Proposal
```bash
curl -X POST http://localhost:3001/api/ethereum/governance/proposals/123/vote \
  -H "Content-Type: application/json" \
  -d '{
    "support": true,
    "userAddress": "0x742d35Cc6634C0532925a3b8D0f8A1D8e8b8b8b8",
    "signature": "0x...",
    "message": "I vote FOR proposal #123"
  }'
```

### Transaction Status

#### Check Transaction Status
```bash
curl -X GET "http://localhost:3001/api/ethereum/transaction/0x123...abc/status"
```

## Safety Features

### Transaction Limits
- **Daily ETH Transfer Limit**: 10 ETH per day
- **Daily MAD Token Transfer Limit**: 1000 MAD tokens per day
- **Rate Limiting**: 
  - Wallet operations: 10 requests per minute
  - Token transfers: 5 transfers per minute

### Validation
- Ethereum address format validation (0x prefix, 40 hex characters)
- Transaction hash validation (0x prefix, 64 hex characters)
- Amount validation (positive numbers only)
- Signature verification for all wallet operations

### Error Handling
All endpoints include comprehensive error handling:
- Invalid address format
- Insufficient balance
- Transaction failures
- Rate limit exceeded
- Invalid signatures

## Event Listening

The system automatically listens for MAD token transfer events and stores them in the database. Events are categorized as:
- `transfer`: Regular token transfers
- `governance_deposit`: Tokens deposited for governance
- `governance_withdrawal`: Tokens withdrawn from governance
- `reward`: Reward distributions

## Database Schema

### EthereumTransfer Model
```prisma
model EthereumTransfer {
  id              String   @id @default(uuid())
  fromAddress     String
  toAddress       String
  amount          String   // Amount in wei (as string)
  transactionHash String   @unique
  blockNumber     Int?
  blockHash       String?
  gasUsed         String?
  gasPrice        String?
  status          String   // pending, confirmed, failed
  eventType       String   // transfer, governance_deposit, etc.
  metadata        Json?    // Additional event data
  processed       Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

## Security Best Practices

1. **Server Wallet Security**:
   - Store private key in environment variables only
   - Use hardware wallets for production
   - Implement multi-signature for large transfers

2. **Rate Limiting**:
   - All endpoints have rate limiting enabled
   - Monitor for suspicious activity
   - Implement IP-based rate limiting if needed

3. **Validation**:
   - All inputs are validated before processing
   - Ethereum addresses are verified for correct format
   - Signatures are verified for authenticity

4. **Error Handling**:
   - Never expose sensitive information in error messages
   - Log all errors for monitoring
   - Implement proper error responses

## Testing

### Unit Tests
```bash
npm test
```

### Integration Tests
```bash
npm run test:integration
```

### Manual Testing with curl
Use the example curl commands provided above to test each endpoint.

## Monitoring

### Logs
All Ethereum operations are logged with:
- Transaction hash
- Block number
- Gas usage
- Status updates

### Metrics
Monitor these key metrics:
- Transaction success rate
- Average gas usage
- Response times
- Error rates

## Troubleshooting

### Common Issues

1. **"Invalid Ethereum address" error**:
   - Ensure address starts with "0x"
   - Check address is 42 characters long
   - Verify address is valid Ethereum address

2. **"Insufficient balance" error**:
   - Check user has enough MAD tokens
   - Verify server wallet has enough ETH for gas

3. **"Transaction failed" error**:
   - Check transaction on Etherscan
   - Verify gas price is sufficient
   - Check for contract reverts

4. **"Rate limit exceeded" error**:
   - Wait for rate limit to reset
   - Reduce request frequency
   - Contact admin for higher limits

### Support
For technical support, please contact the development team or create an issue in the repository.