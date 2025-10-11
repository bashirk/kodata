# Lisk Sepolia Setup Guide for KoData DAO Backend

This guide explains how to set up Lisk Sepolia integration for the KoData DAO backend, including generating Ethereum-compatible addresses and configuring the environment.

## Overview

The KoData DAO backend uses **Lisk Sepolia Testnet** (Ethereum-compatible) for reputation management. When submissions are approved on Starknet, the system increases user reputation on the Lisk Sepolia blockchain.

**Important:** Lisk Sepolia uses Ethereum-compatible addresses (`0x...`) not legacy Lisk addresses (`lsk...`).

## Prerequisites

1. **Ethereum Wallet**: You need an Ethereum-compatible wallet with some ETH for transaction fees
2. **Ethers.js**: The backend uses `ethers` for blockchain interactions
3. **Node.js Environment**: Ensure Node.js and npm/pnpm are installed

## Step 1: Generate Ethereum-Compatible Wallet

### Option A: Using Ethers.js Script (Recommended)
```bash
# Run the Sepolia key generator
node generateSepoliaKeys.js
```

This will output:
- **Mnemonic Passphrase**: Your recovery phrase
- **Private Key**: For backend configuration
- **Public Key**: For backend configuration  
- **Address**: `0x...` format for faucets

### Option B: Using MetaMask (Alternative)
1. Install MetaMask browser extension
2. Create a new account
3. Go to Account Details → Export Private Key
4. Copy the private key and address

### Option C: Using Command Line
```bash
# Install ethers globally
npm install -g ethers

# Generate wallet
node -e "const { ethers } = require('ethers'); const wallet = ethers.Wallet.createRandom(); console.log('Address:', wallet.address); console.log('Private Key:', wallet.privateKey);"
```

## Step 2: Fund Your Account (Testnet)

### For Lisk Sepolia Testnet:
1. Visit [Lisk Sepolia Faucet](https://sepolia-faucet.lisk.com/)
2. Enter your Ethereum address: `0xb4BdC5B4A02609B650656Ed9bC8AaEb1c574154e`
3. Request testnet ETH tokens

### Alternative Faucets:
- [Sepolia Faucet](https://sepoliafaucet.com/)
- [Alchemy Faucet](https://sepoliafaucet.com/)

## Step 3: Configure Environment Variables

Update your `backend/.env` file:

```env
# Lisk Sepolia Configuration
LISK_NODE_URL="https://rpc.sepolia-api.lisk.com"  # Lisk Sepolia RPC
LISK_BACKEND_PRIVKEY="0xbfea221a32c893ea94f2e278bd5b770b339539d4afe74cf38d9590a92b5fb8bc"
LISK_BACKEND_PUBKEY="0x03d904f6e58bdedb725b3e80d0b07d6318d389858dfaa9f33dc75dffbd5cac4ccf"
LISK_BACKEND_ADDRESS="0xb4BdC5B4A02609B650656Ed9bC8AaEb1c574154e"
```

## Step 4: Verify Configuration

Test your Lisk Sepolia configuration:

```bash
# Start the backend
npm run dev

# Check logs for:
# - "Lisk wallet not configured" (if keys missing)
# - "Lisk Sepolia RPC not available" (if node unreachable)
# - "Lisk Sepolia reputation increase transaction sent" (if working)
```

## Step 5: Check Your Balance

### Method 1: Lisk Sepolia Explorer (Recommended)
- Visit: https://sepolia-blockscout.lisk.com/
- Search for your address: `0xb4BdC5B4A02609B650656Ed9bC8AaEb1c574154e`

### Method 2: Using Ethers.js Script
Create `checkSepoliaBalance.js`:
```javascript
const { ethers } = require('ethers');

async function checkBalance() {
  try {
    const provider = new ethers.JsonRpcProvider('https://rpc.sepolia-api.lisk.com');
    const address = '0xb4BdC5B4A02609B650656Ed9bC8AaEb1c574154e';
    
    const balance = await provider.getBalance(address);
    console.log('Balance:', ethers.formatEther(balance), 'ETH');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkBalance();
```

## Step 6: Test Reputation Increase

The backend will automatically attempt to increase reputation when:
1. A submission is approved on Starknet
2. The relayer processes the approval
3. LiskService.increaseReputation() is called

## Troubleshooting

### Error: "Lisk wallet not configured"
**Cause**: Missing `LISK_BACKEND_PRIVKEY` environment variable.
**Solution**: 
- Generate wallet using methods above
- Add private key to `.env` file
- Restart the backend

### Error: "Lisk Sepolia RPC not available"
**Cause**: RPC endpoint is unreachable.
**Solution**: 
- Check network connection
- Verify RPC URL is correct
- The backend falls back to mock transactions if RPC is unavailable

### Error: "Insufficient balance"
**Cause**: Not enough ETH for transaction fees.
**Solution**: 
- Fund your account with ETH from faucet
- Use testnet faucets for development

## Network Information

```
Network Name: Lisk Sepolia Testnet
RPC Endpoint: https://rpc.sepolia-api.lisk.com
Chain ID: 4202
Currency Symbol: ETH
Block Explorer: https://sepolia-blockscout.lisk.com
```

## Security Considerations

1. **Private Key Security**: Never commit private keys to version control
2. **Environment Variables**: Use `.env` files and secure secret management
3. **Key Rotation**: Regularly rotate backend keys
4. **Access Control**: Limit who has access to production keys
5. **Monitoring**: Monitor transactions and account balance

## Integration Flow

```
1. User submits work → Database
2. Admin approves → Starknet Contract
3. Relayer detects approval → Queue
4. Process submission → LiskService
5. Increase reputation → Lisk Sepolia Blockchain
6. Update database → Transaction ID
```

## Useful Resources

- [Lisk Sepolia Documentation](https://docs.lisk.com/)
- [Ethers.js Documentation](https://docs.ethers.org/)
- [Lisk Sepolia Explorer](https://sepolia-blockscout.lisk.com/)
- [Lisk Sepolia Faucet](https://sepolia-faucet.lisk.com/)

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify your account has sufficient ETH balance
3. Test with testnet first before using mainnet
4. Check Lisk Sepolia RPC availability
5. Review backend logs for specific error messages
