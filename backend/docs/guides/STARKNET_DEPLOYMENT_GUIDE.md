# Starknet Contract Deployment Guide

This guide explains how to deploy a WorkProof contract on Starknet testnet and configure your KoData DAO backend to use it.

## Step 1: Create Starknet Account

```bash
# Create a new account

starkli account deploy ~/.starkli-wallets/sepolia/my_account.json --keystore ./keystore.json --keystore-password "PASSWORD"


starkli signer gen-keypair
starkli signer keystore new ~/.starkli_keystore/backend.json
starkli account oz init ~/.starkli_accounts/new_backend.json


# This will generate:
# - Account address (copy this to STARKNET_ACCOUNT_ADDRESS)
# - Private key (copy this to STARKNET_PRIVATE_KEY)
```

## Step 2: Create WorkProof Contract

```cairo
%lang starknet

use starknet::ContractAddress;
...
```

## Step 3: Compile and Initialize Account

First, ensure you have sufficient test tokens from a faucet:

### 3.1 Compile the Contract

Run `scarb build` to compile your Cairo contract.

```bash
# Compile the contract
scarb build
```

Verify the generated artifacts (the compiled class files) are available:

```bash
# List artifacts
ls -la target/dev/
```

### 3.2 Initialize and Deploy Starknet Account

This sequence sets up a local keystore and config file for your account, then deploys it to the network.

1.  **Create Wallet Folder:**

    ```bash
    mkdir -p ~/.starkli-wallets/sepolia
    ```

2.  **Create Private Key Keystore** (using a test private key for demonstration):

    ```bash
    echo "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef" | starkli signer keystore from-key ./keystore.json --private-key-stdin --password "test123"
    ```

3.  **Create Account Configuration File:**

    ```bash
    starkli account oz init ~/.starkli-wallets/sepolia/my_account.json --keystore ./keystore.json --keystore-password "test123"
    ```

4.  **Deploy the Created Account** (This sends a transaction to the network):

    ```bash
    starkli account deploy ~/.starkli-wallets/sepolia/my_account.json --keystore ./keystore.json --keystore-password "test123"
    ```

    *This command will output your Starknet Account Address (`STARKNET_ACCOUNT_ADDRESS`).*


## Step 4: Declare Contract Class

Declare the compiled contract on the Starknet network to register its class.

```bash
# Example Transaction: 0x023d06a2d01a39380e1163a2658f59396b1f717b473f2a3eae2d7774ab90a56c confirmed

# Declare the contract class for deployed account (this registers it on the network)
starkli declare \
     --account ~/.starkli-wallets/sepolia/my_account.json \
     --keystore ./keystore.json --keystore-password "PASSWORD" \
     --casm-file target/dev/backend_work_proof.compiled_contract_class.json \
     target/dev/backend_work_proof.contract_class.json
```

**Output Example:**

```
Declaring Cairo 1 class:
.
.
Class hash declared:
0x0797147f623a37114ad29c350a13bd9bf7163e42d4e3f520ad9d86b8a0a9ef7e
```

**Save this Class Hash (`<CLASS_HASH>`) for the next step.**

-----

## Step 5: Deploy Contract Instance

Use the declared class hash to deploy a specific instance of the contract.

```bash
# Deploy an instance of the contract.
# Replace <CLASS_HASH> and <STARKNET_ACCOUNT_ADDRESS> with your values.

starkli deploy \
     --account ~/.starkli-wallets/sepolia/my_account.json \
     --keystore ./keystore.json --keystore-password "test123" \
     <CLASS_HASH> <STARKNET_ACCOUNT_ADDRESS>
```

*This command will output the final **Contract Address**. **This is your `STARKNET_CONTRACT_ADDRESS`**.*

### Test Deployment

Use the contract address to call read functions and verify the deployment.

```bash
# Check contract info
starkli call <STARKNET_CONTRACT_ADDRESS> get_contract_info

# Check admin address
starkli call <STARKNET_CONTRACT_ADDRESS> get_admin

# Check initial submission count
starkli call <STARKNET_CONTRACT_ADDRESS> get_submission_count
```

-----

## Step 6: Configure Environment Variables

Update your `backend/.env` file with the addresses and keys generated or used during the setup process.

```env
# Starknet Configuration
STARKNET_RPC_URL="https://starknet-testnet.public.blastapi.io"
STARKNET_ACCOUNT_ADDRESS="0x..."  # From Step 3 (Deploy the created account)
STARKNET_PRIVATE_KEY="0x..."      # The private key used to generate the keystore file (be careful with this!)
STARKNET_CONTRACT_ADDRESS="0x..." # From Step 5 (Deploy an instance)
```

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
starkli call <CONTRACT_ADDRESS> get_admin --account ~/.starkli-wallets/sepolia/my_account.json --rpc https://starknet-testnet.public.blastapi.io
```

## Troubleshooting

1. **Insufficient Balance**: Make sure your account has enough testnet ETH
2. **Invalid Account**: Verify your account address and private key are correct
3. **RPC Issues**: Try different RPC endpoints if you encounter connection issues
4. **Contract Errors**: Check that your Cairo syntax is correct and matches Starknet v0.12+

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
- [Starknet Testnet Faucet](https://faucet.goerli.starknet.io/)
