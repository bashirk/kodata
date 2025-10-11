#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Complete MAD Token setup script
 * This script handles the entire setup process from key generation to deployment
 */
async function setupMADToken() {
  try {
    console.log('🚀 Starting complete MAD Token setup...\n');
    
    // Step 1: Check if keys exist and load them
    const envPath = path.join(__dirname, '.env');
    let hasKeys = false;
    
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      hasKeys = envContent.includes('STARKNET_ACCOUNT_ADDRESS=') && 
                envContent.includes('STARKNET_PRIVATE_KEY=') &&
                !envContent.includes('STARKNET_ACCOUNT_ADDRESS=0x12345') &&
                !envContent.includes('STARKNET_PRIVATE_KEY=0x1234567');
      
      // Load environment variables from .env file
      if (hasKeys) {
        const envLines = envContent.split('\n');
        envLines.forEach(line => {
          const [key, value] = line.split('=');
          if (key && value && !process.env[key]) {
            process.env[key] = value;
          }
        });
      }
    }
    
    if (!hasKeys) {
      console.log('🔑 Step 1: Generating Starknet keys...');
      execSync('node generateStarknetKeysSimple.js', { stdio: 'inherit' });
      console.log('✅ Keys generated successfully!\n');
    } else {
      console.log('✅ Step 1: Starknet keys already exist, skipping...\n');
    }
    
    // Step 2: Compile contracts
    console.log('🔨 Step 2: Compiling contracts...');
    try {
      execSync('scarb build', { stdio: 'inherit' });
      console.log('✅ Contracts compiled successfully!\n');
    } catch (error) {
      console.error('❌ Contract compilation failed. Please check your Scarb installation.');
      console.log('💡 Install Scarb: https://docs.swmansion.com/scarb/');
      throw error;
    }
    
    // Step 3: Deploy MAD Token
    console.log('🚀 Step 3: Deploying MAD Token...');
    try {
      execSync('node deployMADToken.js', { stdio: 'inherit' });
      console.log('✅ MAD Token deployed successfully!\n');
    } catch (error) {
      console.error('❌ MAD Token deployment failed.');
      console.log('💡 Make sure you have testnet ETH in your account.');
      console.log('🔗 Get testnet ETH: https://faucet.goerli.starknet.io/');
      throw error;
    }
    
    // Step 4: Display next steps
    console.log('🎉 MAD Token setup completed successfully!\n');
    console.log('📋 Next steps:');
    console.log('1. Deploy/update your WorkProof contract');
    console.log('2. Configure the integration between contracts');
    console.log('3. Test the reward distribution system');
    console.log('4. Start your backend server: npm run dev');
    
    console.log('\n📊 Contract addresses saved in:');
    console.log('   - .env file (environment variables)');
    console.log('   - MADToken-deployment.json (deployment info)');
    
    console.log('\n🔗 Useful links:');
    console.log('   - Starknet Testnet Explorer: https://testnet.starkscan.co/');
    console.log('   - Testnet Faucet: https://faucet.goerli.starknet.io/');
    console.log('   - Documentation: MAD_TOKEN_DEPLOYMENT_GUIDE.md');
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check that all dependencies are installed');
    console.log('2. Verify your internet connection');
    console.log('3. Ensure you have testnet ETH');
    console.log('4. Check the error messages above for specific issues');
    process.exit(1);
  }
}

// Run setup if called directly
if (require.main === module) {
  setupMADToken();
}

module.exports = { setupMADToken };
