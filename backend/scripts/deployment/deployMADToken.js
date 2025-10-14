const { RpcProvider, Account, Contract, json } = require('starknet');
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
const STARKNET_RPC_URL = process.env.STARKNET_RPC_URL || 'https://starknet-sepolia.public.blastapi.io';
const STARKNET_ACCOUNT_ADDRESS = process.env.STARKNET_ACCOUNT_ADDRESS;
const STARKNET_PRIVATE_KEY = process.env.STARKNET_PRIVATE_KEY;

// MAD Token deployment configuration
const INITIAL_SUPPLY = '1000000000000000000000000'; // 1,000,000 MAD tokens (18 decimals)
const MINTER_ADDRESS = STARKNET_ACCOUNT_ADDRESS; // The deployer becomes the initial minter

async function deployMADToken() {
  try {
    console.log('🚀 Starting MAD Token deployment...');
    
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
      console.log('      STARKNET_ACCOUNT_ADDRESS=0x... STARKNET_PRIVATE_KEY=0x... node deployMADToken.js');
      console.log('   4. Generate new keys: npm run mad:keys');
      console.log('\n🔗 Get testnet ETH from: https://faucet.goerli.starknet.io/');
      throw new Error('Missing required environment variables');
    }
    
    // Initialize provider and account
    const provider = new RpcProvider({
      nodeUrl: STARKNET_RPC_URL,
    });
    
    const account = new Account(
      provider,
      STARKNET_ACCOUNT_ADDRESS,
      STARKNET_PRIVATE_KEY
    );
    
    console.log('📋 Account initialized:', STARKNET_ACCOUNT_ADDRESS);
    
    // Read the compiled contract
    const contractPath = path.join(__dirname, 'target/dev/madtoken_work_proof.contract_class.json');
    
    if (!fs.existsSync(contractPath)) {
      throw new Error(`Contract not found at ${contractPath}. Please compile the contract first with: scarb build`);
    }
    
    const compiledContract = json.parse(fs.readFileSync(contractPath, 'utf8'));
    console.log('📄 Contract loaded from:', contractPath);
    
    // Deploy the contract
    console.log('⏳ Deploying MAD Token contract...');
    
    const deployResponse = await account.deployContract({
      classHash: compiledContract.class_hash,
      constructorCalldata: [
        MINTER_ADDRESS, // minter address
        BigInt(INITIAL_SUPPLY).toString()  // initial supply as string
      ],
      salt: '0x' + Math.random().toString(16).substr(2, 64), // Random salt for unique deployment
    });
    
    console.log('⏳ Deployment transaction sent:', deployResponse.transaction_hash);
    
    // Wait for deployment confirmation
    console.log('⏳ Waiting for deployment confirmation...');
    await provider.waitForTransaction(deployResponse.transaction_hash);
    
    const contractAddress = deployResponse.contract_address;
    console.log('✅ MAD Token deployed successfully!');
    console.log('📍 Contract Address:', contractAddress);
    console.log('🔗 Transaction Hash:', deployResponse.transaction_hash);
    
    // Verify deployment by calling contract methods
    console.log('🔍 Verifying deployment...');
    
    const contract = new Contract(compiledContract.abi, contractAddress, account);
    
    // Test contract methods
    const name = await contract.name();
    const symbol = await contract.symbol();
    const decimals = await contract.decimals();
    const totalSupply = await contract.total_supply();
    const minter = await contract.get_minter();
    
    console.log('📊 Contract Verification:');
    console.log('  Name:', name);
    console.log('  Symbol:', symbol);
    console.log('  Decimals:', decimals.toString());
    console.log('  Total Supply:', totalSupply.toString());
    console.log('  Minter:', minter);
    
    // Save deployment info
    const deploymentInfo = {
      contractAddress,
      transactionHash: deployResponse.transaction_hash,
      classHash: compiledContract.class_hash,
      deploymentTime: new Date().toISOString(),
      network: 'starknet-testnet',
      initialSupply: INITIAL_SUPPLY,
      minter: MINTER_ADDRESS,
      rpcUrl: STARKNET_RPC_URL
    };
    
    const deploymentPath = path.join(__dirname, 'MADToken-deployment.json');
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log('💾 Deployment info saved to:', deploymentPath);
    
    // Update environment file
    const envPath = path.join(__dirname, '.env');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Update or add MAD token contract address
    if (envContent.includes('MAD_TOKEN_CONTRACT_ADDRESS=')) {
      envContent = envContent.replace(
        /MAD_TOKEN_CONTRACT_ADDRESS=.*/,
        `MAD_TOKEN_CONTRACT_ADDRESS=${contractAddress}`
      );
    } else {
      envContent += `\nMAD_TOKEN_CONTRACT_ADDRESS=${contractAddress}\n`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log('🔧 Environment file updated with MAD_TOKEN_CONTRACT_ADDRESS');
    
    console.log('\n🎉 MAD Token deployment completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Update your WorkProof contract to use this MAD token address');
    console.log('2. Set the WorkProof contract as the authorized caller for reward distribution');
    console.log('3. Test the token functionality with some transactions');
    
    return deploymentInfo;
    
  } catch (error) {
    console.error('❌ Deployment failed:', error);
    throw error;
  }
}

// Run deployment if called directly
if (require.main === module) {
  deployMADToken()
    .then((info) => {
      console.log('✅ Deployment completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Deployment failed:', error);
      process.exit(1);
    });
}

module.exports = { deployMADToken };
