const { ethers } = require('ethers');

// Generate a new Ethereum wallet (compatible with Lisk Sepolia)
const wallet = ethers.Wallet.createRandom();

console.log('=== LISK SEPOLIA TESTNET WALLET ===');
console.log('');
console.log('Mnemonic Passphrase:', wallet.mnemonic.phrase);
console.log('');
console.log('Private Key (Hex):', wallet.privateKey);
console.log('Public Key (Hex):', wallet.publicKey);
console.log('Address (0x format - for faucets):', wallet.address);
console.log('');
console.log('=== FOR FAUCETS ===');
console.log('Use this address:', wallet.address);
console.log('');
console.log('=== FOR .env FILE ===');
console.log('LISK_BACKEND_PRIVKEY="' + wallet.privateKey + '"');
console.log('LISK_BACKEND_PUBKEY="' + wallet.publicKey + '"');
console.log('LISK_BACKEND_ADDRESS="' + wallet.address + '"');
console.log('');
console.log('=== NETWORK INFO ===');
console.log('Network: Lisk Sepolia Testnet');
console.log('RPC: https://rpc.sepolia-api.lisk.com');
console.log('Chain ID: 4202');
console.log('Currency: ETH');
console.log('Explorer: https://sepolia-blockscout.lisk.com');
