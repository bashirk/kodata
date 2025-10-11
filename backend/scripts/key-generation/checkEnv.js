#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Check and fix .env file for MAD Token deployment
 */
function checkEnv() {
  const envPath = path.join(__dirname, '.env');
  
  console.log('🔍 Checking .env file...');
  
  if (!fs.existsSync(envPath)) {
    console.log('❌ .env file does not exist');
    console.log('💡 Run: npm run mad:keys');
    return false;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('📄 .env file exists');
  
  // Check for required variables
  const requiredVars = [
    'STARKNET_RPC_URL',
    'STARKNET_ACCOUNT_ADDRESS', 
    'STARKNET_PRIVATE_KEY'
  ];
  
  const missingVars = [];
  const invalidVars = [];
  
  requiredVars.forEach(varName => {
    const regex = new RegExp(`${varName}=(.+)`);
    const match = envContent.match(regex);
    
    if (!match) {
      missingVars.push(varName);
    } else {
      const value = match[1].trim();
      if (value === '0x12345' || value === '0x1234567' || value === '') {
        invalidVars.push(varName);
      }
    }
  });
  
  if (missingVars.length > 0) {
    console.log('❌ Missing variables:', missingVars.join(', '));
  }
  
  if (invalidVars.length > 0) {
    console.log('❌ Invalid/placeholder variables:', invalidVars.join(', '));
  }
  
  if (missingVars.length === 0 && invalidVars.length === 0) {
    console.log('✅ All required variables are set correctly');
    
    // Show current values (masked for security)
    const addressMatch = envContent.match(/STARKNET_ACCOUNT_ADDRESS=(.+)/);
    const keyMatch = envContent.match(/STARKNET_PRIVATE_KEY=(.+)/);
    
    if (addressMatch) {
      const address = addressMatch[1].trim();
      console.log('📍 Address:', address.substring(0, 10) + '...' + address.substring(-6));
    }
    
    if (keyMatch) {
      const key = keyMatch[1].trim();
      console.log('🔑 Private Key:', key.substring(0, 10) + '...' + key.substring(-6));
    }
    
    return true;
  } else {
    console.log('\n💡 To fix this, run: npm run mad:keys');
    return false;
  }
}

// Run check if called directly
if (require.main === module) {
  const isValid = checkEnv();
  process.exit(isValid ? 0 : 1);
}

module.exports = { checkEnv };
