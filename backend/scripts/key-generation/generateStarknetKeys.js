const { RpcProvider, Account, ec, json } = require('starknet');
const fs = require('fs');
const path = require('path');

/**
 * Generate Starknet testnet keys for MAD Token deployment
 * This script creates a new account with testnet keys for development
 */
async function generateStarknetKeys() {
  try {
    console.log('🔑 Generating Starknet testnet keys...');
    
    // Use Starknet's built-in key generation
    const privateKey = ec.starkCurve.utils.randomPrivateKey();
    const publicKey = ec.starkCurve.getPublicKey(privateKey);
    const address = ec.starkCurve.getStarkKey(publicKey);
    
    // Convert to hex strings for storage
    const privateKeyHex = '0x' + privateKey.toString(16);
    const publicKeyHex = '0x' + publicKey.toString(16);
    
    console.log('✅ New Starknet account generated!');
    console.log('📍 Address:', address);
    console.log('🔑 Private Key:', privateKeyHex);
    console.log('🔓 Public Key:', publicKeyHex);
    
    // Save to keystore file
    const keystore = {
      address,
      privateKey: privateKeyHex,
      publicKey: publicKeyHex,
      network: 'starknet-testnet',
      generatedAt: new Date().toISOString()
    };
    
    const keystorePath = path.join(__dirname, 'starknet-keystore.json');
    fs.writeFileSync(keystorePath, JSON.stringify(keystore, null, 2));
    console.log('💾 Keys saved to:', keystorePath);
    
    // Update .env file
    const envPath = path.join(__dirname, '.env');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Update or add Starknet configuration
    const updates = {
      'STARKNET_RPC_URL': 'https://starknet-testnet.public.blastapi.io',
      'STARKNET_ACCOUNT_ADDRESS': address,
      'STARKNET_PRIVATE_KEY': privateKeyHex
    };
    
    for (const [key, value] of Object.entries(updates)) {
      if (envContent.includes(`${key}=`)) {
        envContent = envContent.replace(
          new RegExp(`${key}=.*`),
          `${key}=${value}`
        );
      } else {
        envContent += `\n${key}=${value}\n`;
      }
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log('🔧 Environment file updated with Starknet keys');
    
    console.log('\n🎉 Setup complete! Next steps:');
    console.log('1. Get testnet ETH from: https://faucet.goerli.starknet.io/');
    console.log('2. Use address:', address);
    console.log('3. Run: node deployMADToken.js');
    
    console.log('\n⚠️  SECURITY WARNING:');
    console.log('   These are TESTNET keys only!');
    console.log('   Never use these keys on mainnet!');
    console.log('   Keep your private key secure!');
    
    return keystore;
    
  } catch (error) {
    console.error('❌ Failed to generate keys:', error);
    throw error;
  }
}

// Run key generation if called directly
if (require.main === module) {
  generateStarknetKeys()
    .then(() => {
      console.log('✅ Key generation completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Key generation failed:', error);
      process.exit(1);
    });
}

module.exports = { generateStarknetKeys };
