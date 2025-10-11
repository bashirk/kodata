# MAD Token Quick Start

Get your MAD token system up and running in minutes!

## 🚀 One-Command Setup

```bash
cd backend
npm run mad:setup
```

This single command will:
- ✅ Generate Starknet testnet keys
- ✅ Compile the contracts
- ✅ Deploy the MAD token
- ✅ Configure your environment

## 📋 Manual Steps (if needed)

If you prefer to run steps individually:

```bash
# 1. Generate keys
npm run mad:keys

# 2. Compile contracts
npm run mad:compile

# 3. Deploy token
npm run mad:deploy
```

## 🔧 Prerequisites

- Node.js 18+
- Scarb (Cairo compiler)
- Testnet ETH (get from [faucet](https://faucet.goerli.starknet.io/))

## 📊 What You Get

After setup, you'll have:
- **MAD Token Contract**: 1,000,000 tokens deployed
- **Reward System**: 1 MAD for submissions, 0.5 MAD for approvals
- **Staking**: 1% annual yield for staked tokens
- **API Endpoints**: Full backend integration

## 🎯 Next Steps

1. **Get Testnet ETH**: Visit the [Starknet faucet](https://faucet.goerli.starknet.io/)
2. **Start Backend**: `npm run dev`
3. **Test Integration**: Create submissions and see automatic rewards
4. **Build Frontend**: Add token balance displays

## 🔗 Useful Commands

```bash
# Check token info
curl http://localhost:3001/api/mad-token/info

# Get your balance
curl http://localhost:3001/api/mad-token/balance/YOUR_ADDRESS

# Check blockchain status
curl http://localhost:3001/api/blockchain/status
```

## 🆘 Troubleshooting

**"Missing environment variables"**
```bash
# Check your .env file
npm run mad:check

# Generate new keys if needed
npm run mad:keys
```

**"Compilation failed"**
- Install Scarb: https://docs.swmansion.com/scarb/

**"Deployment failed"**
- Get testnet ETH from the faucet
- Check your account has enough balance
- Verify keys are correct: `npm run mad:check`

**"Contract not found"**
- Run `npm run mad:compile` first

**"Keys exist but deployment fails"**
```bash
# Check environment loading
npm run mad:check

# If keys are invalid, regenerate
npm run mad:keys
```

## 📚 Full Documentation

For detailed information, see [MAD_TOKEN_DEPLOYMENT_GUIDE.md](./MAD_TOKEN_DEPLOYMENT_GUIDE.md)

---

🎉 **You're ready to start earning MAD tokens!**
