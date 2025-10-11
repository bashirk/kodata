const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file if not already set
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath) && !process.env.STARKNET_ACCOUNT_ADDRESS) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envLines = envContent.split('\n');
  envLines.forEach(line => {
    const [key, value] = line.split('=');
    if (key && value && !process.env[key]) {
      process.env[key] = value;
    }
  });
}

// Configuration
const STARKNET_ACCOUNT_ADDRESS = process.env.STARKNET_ACCOUNT_ADDRESS;
const STARKNET_PRIVATE_KEY = process.env.STARKNET_PRIVATE_KEY;
const KEYSTORE_PASSWORD = process.env.KEYSTORE_PASSWORD || 'test123';

async function deployWorkProof() {
  try {
    console.log('🚀 Starting WorkProof contract deployment using Starkli...');
    
    // Check environment variables
    if (!STARKNET_ACCOUNT_ADDRESS || !STARKNET_PRIVATE_KEY) {
      console.error('❌ Missing required environment variables!');
      console.log('\n🔍 Debug info:');
      console.log('   STARKNET_ACCOUNT_ADDRESS:', STARKNET_ACCOUNT_ADDRESS ? 'SET' : 'NOT SET');
      console.log('   STARKNET_PRIVATE_KEY:', STARKNET_PRIVATE_KEY ? 'SET' : 'NOT SET');
      console.log('   .env file exists:', fs.existsSync(envPath));
      
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        console.log('   .env content preview:', envContent.substring(0, 200) + '...');
      }
      
      console.log('\n📋 Please set the following environment variables:');
      console.log('   STARKNET_ACCOUNT_ADDRESS=0x...');
      console.log('   STARKNET_PRIVATE_KEY=0x...');
      console.log('\n💡 You can either:');
      console.log('   1. Set them in your .env file');
      console.log('   2. Export them in your terminal:');
      console.log('      export STARKNET_ACCOUNT_ADDRESS=0x...');
      console.log('      export STARKNET_PRIVATE_KEY=0x...');
      console.log('   3. Run with inline variables:');
      console.log('      STARKNET_ACCOUNT_ADDRESS=0x... STARKNET_PRIVATE_KEY=0x... node deployWorkProofStarkli.js');
      console.log('   4. Generate new keys: npm run mad:keys');
      console.log('\n🔗 Get testnet ETH from: https://faucet.goerli.starknet.io/');
      throw new Error('Missing required environment variables');
    }
    
    console.log('📋 Account Address:', STARKNET_ACCOUNT_ADDRESS);
    
    // Check if starkli is installed
    try {
      execSync('starkli --version', { stdio: 'pipe' });
    } catch (error) {
      console.error('❌ Starkli is not installed. Please install it first:');
      console.log('   cargo install starkli');
      throw new Error('Starkli not found');
    }
    
    // Check if contract files exist
    const contractClassPath = path.join(__dirname, 'target/dev/backend_work_proof.contract_class.json');
    const compiledClassPath = path.join(__dirname, 'target/dev/backend_work_proof.compiled_contract_class.json');
    
    if (!fs.existsSync(contractClassPath) || !fs.existsSync(compiledClassPath)) {
      throw new Error(`Contract files not found. Please compile the contract first with: scarb build`);
    }
    
    console.log('📄 Contract files found');
    
    // Create keystore if it doesn't exist
    const keystorePath = path.join(__dirname, 'keystore.json');
    if (!fs.existsSync(keystorePath)) {
      console.log('🔑 Creating keystore...');
      const createKeystoreCmd = `echo "${STARKNET_PRIVATE_KEY}" | starkli signer keystore from-key ${keystorePath} --private-key-stdin --password "${KEYSTORE_PASSWORD}"`;
      execSync(createKeystoreCmd, { stdio: 'inherit' });
    }
    
    // Create account config if it doesn't exist
    const accountConfigPath = path.join(__dirname, 'account.json');
    if (!fs.existsSync(accountConfigPath)) {
      console.log('👤 Creating account configuration...');
      const createAccountCmd = `starkli account oz init ${accountConfigPath} --keystore ${keystorePath} --keystore-password "${KEYSTORE_PASSWORD}"`;
      execSync(createAccountCmd, { stdio: 'inherit' });
    }
    
    // Deploy the account if it's not already deployed
    console.log('🚀 Deploying account...');
    const deployAccountCmd = `starkli account deploy ${accountConfigPath} --keystore ${keystorePath} --keystore-password "${KEYSTORE_PASSWORD}" --network sepolia`;
    
    try {
      const deployAccountOutput = execSync(deployAccountCmd, { encoding: 'utf8', stdio: 'pipe' });
      console.log('✅ Account deployed:', deployAccountOutput);
    } catch (error) {
      // Account might already be deployed, check if it's a "already deployed" error
      if (error.message.includes('already deployed') || error.message.includes('Account already deployed')) {
        console.log('✅ Account already deployed');
      } else {
        console.error('❌ Failed to deploy account:', error.message);
        throw error;
      }
    }
    
    // Step 1: Declare the contract class
    console.log('📝 Step 1: Declaring contract class...');
    const declareCmd = `starkli declare --account ${accountConfigPath} --keystore ${keystorePath} --keystore-password "${KEYSTORE_PASSWORD}" --casm-file ${compiledClassPath} ${contractClassPath} --network sepolia`;
    
    let classHash;
    try {
      const declareOutput = execSync(declareCmd, { encoding: 'utf8', stdio: 'pipe' });
      console.log('📝 Declare output:', declareOutput);
      
      // Extract class hash from output
      const classHashMatch = declareOutput.match(/Class hash declared:\s*(0x[a-fA-F0-9]+)/) || 
                            declareOutput.match(/(0x[a-fA-F0-9]{64})/);
      if (classHashMatch) {
        classHash = classHashMatch[1];
        console.log('✅ Class hash declared:', classHash);
      } else {
        console.log('📝 Raw declare output:', declareOutput);
        throw new Error('Could not extract class hash from declare output');
      }
    } catch (error) {
      console.error('❌ Failed to declare contract class:', error.message);
      throw error;
    }
    
    // Step 2: Deploy the contract instance
    console.log('🚀 Step 2: Deploying contract instance...');
    const deployCmd = `starkli deploy --account ${accountConfigPath} --keystore ${keystorePath} --keystore-password "${KEYSTORE_PASSWORD}" ${classHash} ${STARKNET_ACCOUNT_ADDRESS} --network sepolia`;
    
    let contractAddress;
    try {
      const deployOutput = execSync(deployCmd, { encoding: 'utf8', stdio: 'pipe' });
      console.log('🚀 Deploy output:', deployOutput);
      
      // Extract contract address from output
      const addressMatch = deployOutput.match(/Contract deployed at:\s*(0x[a-fA-F0-9]+)/) ||
                          deployOutput.match(/(0x[a-fA-F0-9]{64})/);
      if (addressMatch) {
        contractAddress = addressMatch[1];
        console.log('✅ Contract deployed at:', contractAddress);
      } else {
        console.log('📝 Raw deploy output:', deployOutput);
        throw new Error('Could not extract contract address from deploy output');
      }
    } catch (error) {
      console.error('❌ Failed to deploy contract:', error.message);
      throw error;
    }
    
    // Step 3: Verify deployment
    console.log('🔍 Step 3: Verifying deployment...');
    const verifyCmd = `starkli call ${contractAddress} get_contract_info --account ${accountConfigPath} --rpc https://starknet-testnet.public.blastapi.io`;
    
    try {
      const verifyOutput = execSync(verifyCmd, { encoding: 'utf8', stdio: 'pipe' });
      console.log('🔍 Contract info:', verifyOutput);
    } catch (error) {
      console.warn('⚠️ Could not verify contract (this might be normal):', error.message);
    }
    
    // Save deployment info
    const deploymentInfo = {
      contractAddress,
      classHash,
      deploymentTime: new Date().toISOString(),
      network: 'starknet-testnet',
      admin: STARKNET_ACCOUNT_ADDRESS,
      rpcUrl: 'https://starknet-testnet.public.blastapi.io'
    };
    
    const deploymentPath = path.join(__dirname, 'WorkProof-deployment.json');
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log('💾 Deployment info saved to:', deploymentPath);
    
    // Update environment file
    const envPath = path.join(__dirname, '.env');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Update or add WorkProof contract address
    if (envContent.includes('STARKNET_CONTRACT_ADDRESS=')) {
      envContent = envContent.replace(
        /STARKNET_CONTRACT_ADDRESS=.*/,
        `STARKNET_CONTRACT_ADDRESS=${contractAddress}`
      );
    } else {
      envContent += `\nSTARKNET_CONTRACT_ADDRESS=${contractAddress}\n`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log('🔧 Environment file updated with STARKNET_CONTRACT_ADDRESS');
    
    console.log('\n🎉 WorkProof contract deployment completed successfully!');
    console.log('\n📋 Deployment Summary:');
    console.log('  Contract Address:', contractAddress);
    console.log('  Class Hash:', classHash);
    console.log('  Admin:', STARKNET_ACCOUNT_ADDRESS);
    console.log('  Network: Starknet Testnet');
    
    console.log('\n📋 Next steps:');
    console.log('1. The contract is ready to receive submissions');
    console.log('2. You can now test the submission and approval workflow');
    console.log('3. Later, we can add MAD token integration');
    
    return deploymentInfo;
    
  } catch (error) {
    console.error('❌ Deployment failed:', error);
    throw error;
  }
}

// Run deployment if called directly
if (require.main === module) {
  deployWorkProof()
    .then((info) => {
      console.log('✅ Deployment completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Deployment failed:', error);
      process.exit(1);
    });
}

module.exports = { deployWorkProof };
