# Starknet Contract Deployment Guide

This guide explains how to deploy a WorkProof contract on Starknet Sepolia testnet and configure your KoData DAO backend to use it.

## Prerequisites

- Install `starkli` CLI tool
- Install `scarb` for Cairo compilation
- Have access to Starknet Sepolia testnet STRK tokens

## Step 1: Create Starknet Account

### 1.1 Generate Account Files

```bash
# Create wallet directory
mkdir -p ~/.starkli-wallets/sepolia

# Generate a new keypair
starkli signer gen-keypair

# Create keystore with the generated private key (replace with your actual private key)
echo "YOUR_PRIVATE_KEY_HERE" | starkli signer keystore from-key ./keystore.json --private-key-stdin --password "test123"

# Initialize account configuration
starkli account oz init ~/.starkli-wallets/sepolia/my_account.json --keystore ./keystore.json --keystore-password "test123"
```

### 1.2 Deploy Account to Network

```bash
# Deploy the account (requires STRK tokens for deployment fee)
starkli account deploy ~/.starkli-wallets/sepolia/my_account.json --keystore ./keystore.json --keystore-password "test123"
```

**Output Example:**
```
Once deployed, this account will be available at:
    0x05c92893b134e0c52538849337ffff35e6dc0dcdd1bb432c03145ac28b52649b
```

**Save this Account Address for your environment variables.**

**Important:** Before deploying, you must fund this account with STRK tokens from the faucet.

## Step 2: Create WorkProof Contract

```cairo
%lang starknet

use starknet::ContractAddress;
...
```

## Step 2: Fund Your Account

Before deploying contracts, ensure your account has sufficient STRK tokens:

```bash
# Get STRK tokens from Sepolia faucet
# Visit: https://starknet-faucet.vercel.app/
# Enter your account address: 0x07112aa27e0ed57dd7eda06fc9e41e96b83278071066838a6ed084ae1cd3c8ca
# Request tokens (you'll need at least 5-10 STRK for contract deployment)
```

## Step 3: Compile Contract

### 3.1 Compile the Contract

```bash
# Navigate to contract directory
cd backend/contracts/cairo

# Compile the contract
scarb build
```

Verify the generated artifacts are available:

```bash
# List artifacts
ls -la target/dev/
```

You should see:
- `backend_work_proof.compiled_contract_class.json`
- `backend_work_proof.contract_class.json`


## Step 4: Declare Contract Class

Declare the compiled contract on the Starknet Sepolia network to register its class.

```bash
# Declare the contract class (this registers it on the network)
starkli declare \
     --account ~/.starkli-wallets/sepolia/my_account.json \
     --keystore ./keystore.json --keystore-password "test123" \
     --casm-file target/dev/backend_work_proof.compiled_contract_class.json \
     target/dev/backend_work_proof.contract_class.json \
     --network sepolia
```

**Output Example:**

```
Declaring Cairo 1 class:
.
.
Class hash declared:
0x07d6924ff230afbe1525380c79909946a2217b9eb83b0b70d9b47802a493cc88
```

**Save this Class Hash for the next step.**

-----

## Step 5: Deploy Contract Instance

Use the declared class hash to deploy a specific instance of the contract.

```bash
# Deploy an instance of the contract
# Replace CLASS_HASH with the hash from Step 4
# Replace STARKNET_ACCOUNT_ADDRESS with your account address

starkli deploy \
     --account ~/.starkli-wallets/sepolia/my_account.json \
     --keystore ./keystore.json --keystore-password "test123" \
     0x07d6924ff230afbe1525380c79909946a2217b9eb83b0b70d9b47802a493cc88 \
     0x07112aa27e0ed57dd7eda06fc9e41e96b83278071066838a6ed084ae1cd3c8ca \
     --network sepolia
```

**Output Example:**

```
Contract deployed at: 0x01b047f96c3a2d17ac45711ed577611d46178e23f7c2bbe594a1647fd21935bb
```

**This is your `STARKNET_CONTRACT_ADDRESS`.**

### Test Deployment

Use the contract address to call read functions and verify the deployment.

```bash
# Check admin address
starkli call 0x01b047f96c3a2d17ac45711ed577611d46178e23f7c2bbe594a1647fd21935bb get_admin --network sepolia

# Check initial submission count
starkli call 0x01b047f96c3a2d17ac45711ed577611d46178e23f7c2bbe594a1647fd21935bb get_submission_count --network sepolia
```

-----

## Step 6: Configure Environment Variables

Update your `backend/.env` file with the correct values:

```env
# Starknet Configuration
STARKNET_RPC_URL="https://starknet-sepolia.public.blastapi.io"
STARKNET_ACCOUNT_ADDRESS="YOUR_ACCOUNT_ADDRESS_FROM_STEP_1"
STARKNET_PRIVATE_KEY="YOUR_PRIVATE_KEY_FROM_STEP_1"
STARKNET_CONTRACT_ADDRESS="YOUR_CONTRACT_ADDRESS_FROM_STEP_5"
```

**Important Notes:**
- Use the private key generated in Step 1 with `starkli signer gen-keypair`
- Use the account address from Step 1 after running `starkli account oz init`
- Ensure your account is funded with STRK tokens before deploying contracts
- The contract address comes from Step 5 after deploying the WorkProof contract

-----

## Step 7: Update StarknetService ABI

Update the Contract ABI in your service file (`backend/src/lib/starknetService.ts`) to ensure your backend can correctly interact with the deployed contract's functions.

```typescript
const contractAbi = json.parse(`[
  {
    "name": "approve_submission",
    "type": "function",
    "inputs": [{ "name": "submission_id", "type": "felt252" }],
    "outputs": []
  },
  {
    "name": "is_submission_approved",
    "type": "function",
    "inputs": [{ "name": "submission_id", "type": "felt252" }],
    "outputs": [{ "type": "bool" }]
  },
  {
    "name": "get_admin",
    "type": "function",
    "inputs": [],
    "outputs": [{ "type": "ContractAddress" }]
  }
]`);
```

-----

## Step 8: Test the Contract

Perform a final test call using your complete account and RPC configuration.

```bash
# Test calling the contract
starkli call 0x01b047f96c3a2d17ac45711ed577611d46178e23f7c2bbe594a1647fd21935bb get_admin --account ~/.starkli-wallets/sepolia/my_account.json --rpc https://starknet-sepolia.public.blastapi.io
```

## Step 9: Test Backend Integration

After updating your `.env` file, restart your backend server and test the submission approval:

```bash
# Restart the backend server
cd backend
npm run dev

# Test the submission approval endpoint
curl -X POST http://localhost:3001/api/test/starknet-approval \
  -H "Content-Type: application/json" \
  -d '{"submissionId": "test-submission-final"}'
```

**Expected Success Response:**
```json
{
  "success": true,
  "message": "Starknet approval test successful",
  "submissionId": "test-submission-final",
  "txHash": "0x..."
}
```

## Troubleshooting

1. **"Unexpected end of JSON input" Error**: 
   - Ensure you're using `https://starknet-sepolia.public.blastapi.io` (not the deprecated Goerli endpoint)
   - Check that your RPC URL is correct in all environment files

2. **"Account: invalid signature" Error**:
   - Verify your private key matches your account address
   - Use the correct private key: `0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef`

3. **"Resources bounds exceed balance" Error**:
   - Ensure your account has sufficient STRK tokens (at least 5-10 STRK)
   - Get tokens from: https://starknet-faucet.vercel.app/

4. **Contract Not Found Error**:
   - Verify your contract address is correct: `0x01b047f96c3a2d17ac45711ed577611d46178e23f7c2bbe594a1647fd21935bb`
   - Ensure the contract was deployed on Sepolia testnet

5. **RPC Issues**: 
   - Try different RPC endpoints if you encounter connection issues
   - Check network status at: https://status.starknet.io/

## Production Considerations

- Use mainnet RPC URLs for production
- Implement proper error handling and retry logic
- Consider using a multisig wallet for admin operations
- Add access control and upgrade mechanisms
- Implement proper event logging for transparency

## Useful Resources

- [Starknet Documentation](https://docs.starknet.io/)
- [Cairo Book](https://book.cairo-lang.org/)
- [Starkli Documentation](https://book.starkli.rs/)
- [Starknet.js Documentation](https://www.starknetjs.com/docs/)
- [Starknet Sepolia Faucet](https://starknet-faucet.vercel.app/)
