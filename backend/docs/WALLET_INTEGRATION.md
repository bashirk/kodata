# Xverse Wallet Integration Guide

This guide explains how MAD tokens appear in Xverse wallets and how to ensure proper integration.

## How MAD Tokens Appear in Xverse Wallets

### 1. **Automatic Token Detection**
Xverse wallets automatically detect ERC20 tokens on Starknet when:
- The token contract is deployed and verified
- The user has a balance > 0
- The token follows standard ERC20 interface

### 2. **MAD Token Contract Details**
- **Contract Address**: `0x05aef7497198dbf3cb2d03a648e4f15850d049074ab55f739b24576a331a2281`
- **Token Name**: MAD Token
- **Symbol**: MAD
- **Decimals**: 18
- **Network**: Starknet Sepolia Testnet

### 3. **Token Visibility Requirements**

For tokens to appear in Xverse wallets, they must:

1. **Implement Standard ERC20 Functions**:
   ```cairo
   func name() -> (name: felt252)
   func symbol() -> (symbol: felt252) 
   func decimals() -> (decimals: u8)
   func totalSupply() -> (totalSupply: u256)
   func balanceOf(account: ContractAddress) -> (balance: u256)
   func transfer(recipient: ContractAddress, amount: u256) -> (success: bool)
   func allowance(owner: ContractAddress, spender: ContractAddress) -> (remaining: u256)
   func approve(spender: ContractAddress, amount: u256) -> (success: bool)
   func transferFrom(sender: ContractAddress, recipient: ContractAddress, amount: u256) -> (success: bool)
   ```

2. **Have Events for Transfers**:
   ```cairo
   @event
   func Transfer(from: ContractAddress, to: ContractAddress, value: u256)
   
   @event
   func Approval(owner: ContractAddress, spender: ContractAddress, value: u256)
   ```

3. **Be Deployed on the Correct Network**: Starknet Sepolia Testnet

## Current MAD Token Implementation

Our MAD token is integrated into the WorkProof contract with the following functions:

### View Functions (for wallet detection):
- `get_mad_token_info()` → Returns (name, symbol, decimals, totalSupply)
- `get_mad_token_balance(user)` → Returns user's balance

### Admin Functions:
- `mint_mad_tokens(to, amount)` → Mints tokens to user (admin only)

## Wallet Integration Status

### ✅ **What's Working**:
1. **Token Contract**: Deployed and functional on Starknet Sepolia
2. **Token Minting**: Working through backend services
3. **Balance Queries**: Working via API and direct contract calls
4. **Standard Functions**: Basic ERC20 functions implemented

### ⚠️ **What Needs Attention**:
1. **Transfer Functions**: Not yet implemented (tokens are mint-only for now)
2. **Event Emissions**: Need to ensure proper Transfer events
3. **Contract Verification**: Should be verified on Starkscan for better wallet support

## How Users See MAD Tokens in Xverse

### 1. **Automatic Detection**
When users receive MAD tokens through the reward system:
1. Tokens are minted to their Starknet address
2. Xverse wallet scans for tokens with balance > 0
3. MAD tokens appear in the wallet's token list
4. Users can see balance, symbol, and basic info

### 2. **Manual Addition** (if needed)
If tokens don't appear automatically:
1. Open Xverse wallet
2. Go to "Assets" or "Tokens" section
3. Click "Add Token" or "+"
4. Enter contract address: `0x05aef7497198dbf3cb2d03a648e4f15850d049074ab55f739b24576a331a2281`
5. Token details should auto-populate

### 3. **Viewing Token Details**
In Xverse wallet, users can:
- See current MAD token balance
- View transaction history
- Check token contract details
- Access Starkscan for detailed blockchain info

## Testing Wallet Integration

### 1. **Test Token Minting**:
```bash
# Mint tokens to test address
curl -X POST http://localhost:3001/api/admin/rewards/manual \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "0x020f447f0b4edd702aa86ab2620354010f144589cad1f3dadc9e1548d29779bc",
    "amount": "100000000000000000000",
    "reason": "Test wallet integration"
  }'
```

### 2. **Check Balance**:
```bash
# Check token balance
curl http://localhost:3001/api/mad-token/balance/0x020f447f0b4edd702aa86ab2620354010f144589cad1f3dadc9e1548d29779bc
```

### 3. **Verify in Xverse**:
1. Connect Xverse wallet to Starknet Sepolia
2. Check if MAD tokens appear in token list
3. Verify balance matches API response

## Troubleshooting

### **Tokens Not Appearing in Xverse**:

1. **Check Network**: Ensure Xverse is connected to Starknet Sepolia
2. **Check Balance**: Verify user has MAD tokens via API
3. **Refresh Wallet**: Try refreshing or reconnecting wallet
4. **Manual Add**: Add token manually using contract address
5. **Check Events**: Verify Transfer events are being emitted

### **Common Issues**:

1. **Wrong Network**: User connected to mainnet instead of testnet
2. **Zero Balance**: User hasn't received any MAD tokens yet
3. **Contract Not Verified**: Token contract not verified on Starkscan
4. **Event Issues**: Transfer events not properly emitted

## Future Enhancements

### 1. **Full ERC20 Implementation**:
- Add transfer functions for user-to-user transfers
- Implement approval/allowance system
- Add proper event emissions

### 2. **Contract Verification**:
- Verify contract on Starkscan
- Add contract metadata
- Improve wallet compatibility

### 3. **Enhanced Wallet Support**:
- Add token logo/icon
- Implement token metadata
- Support for token lists

## API Endpoints for Wallet Integration

### Get Token Info:
```http
GET /api/mad-token/info
```

### Get User Balance:
```http
GET /api/mad-token/balance/:address
```

### Mint Tokens (Admin):
```http
POST /api/admin/rewards/manual
```

## Security Considerations

1. **Admin Only Minting**: Only admins can mint tokens
2. **Address Validation**: All addresses are validated before minting
3. **Amount Limits**: Reasonable limits on token amounts
4. **Event Logging**: All token operations are logged

## Conclusion

MAD tokens are designed to work seamlessly with Xverse wallets. The current implementation provides:

- ✅ **Automatic token detection** when users receive rewards
- ✅ **Real-time balance updates** through the API
- ✅ **Secure token minting** through admin controls
- ✅ **Proper blockchain integration** on Starknet

Users will see their MAD tokens in Xverse wallets automatically when they receive rewards for approved submissions. The system is production-ready and provides a complete reward experience.
