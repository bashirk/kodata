// Wallet integration utilities for Starknet and Lisk
import { RpcProvider, Account } from 'starknet';

class WalletService {
  constructor() {
    this.starknetProvider = new RpcProvider({
      nodeUrl: import.meta.env.VITE_STARKNET_RPC_URL || 'https://starknet-testnet.public.blastapi.io',
    });
    this.liskWsUrl = import.meta.env.VITE_LISK_WS_URL || 'wss://ws.api.lisk.com/';
  }

  // Starknet wallet integration
  async connectStarknetWallet() {
    try {
      console.log('Attempting to connect Starknet wallet...');
      
      // Check if Xverse wallet is available
      if (typeof window !== 'undefined' && window.xverseWallet) {
        console.log('Xverse wallet detected');
        const wallet = window.xverseWallet;
        
        // Request connection
        await wallet.request({
          method: 'starknet_requestAccounts',
        });

        const accounts = await wallet.request({
          method: 'starknet_accounts',
        });

        if (accounts && accounts.length > 0) {
          console.log('Xverse wallet connected:', accounts[0]);
          return {
            address: accounts[0],
            wallet: wallet,
            type: 'starknet'
          };
        }
      }

      // Fallback: check for other Starknet wallets
      if (typeof window !== 'undefined' && window.starknet) {
        console.log('Generic starknet wallet detected');
        const wallet = window.starknet;
        
        if (!wallet.isConnected) {
          await wallet.enable();
        }

        console.log('Generic starknet wallet connected:', wallet.account.address);
        return {
          address: wallet.account.address,
          wallet: wallet,
          type: 'starknet'
        };
      }

      throw new Error('No Starknet wallet found. Please install Xverse or another Starknet wallet.');
    } catch (error) {
      console.error('Starknet wallet connection failed:', error);
      throw new Error(`Failed to connect Starknet wallet: ${error.message}`);
    }
  }

  async signStarknetMessage(message, wallet) {
    try {
      console.log('Attempting to sign message with wallet:', wallet);
      console.log('Message to sign:', message);
      
      if (wallet.type === 'starknet') {
        // For development, provide mock signature immediately to bypass wallet issues
        if (import.meta.env.DEV || import.meta.env.MODE === 'development') {
          console.warn('Development mode: Using mock signature to bypass wallet signing issues');
          return {
            r: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            s: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
            recovery: 0
          };
        }
        
        // For Xverse wallet - try account-based signing first (most reliable)
        if (wallet.wallet.account && wallet.wallet.account.signMessage) {
          console.log('Trying Xverse account.signMessage...');
          
          // Try different message formats
          const messageFormats = [
            message, // Original message
            message.replace(/\n/g, ' '), // Single line
            JSON.stringify({ message }), // JSON format
          ];
          
          for (let i = 0; i < messageFormats.length; i++) {
            const msgFormat = messageFormats[i];
            console.log(`Trying Xverse message format ${i + 1}:`, msgFormat);
            
            try {
              // Add timeout to prevent hanging
              const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Signing timeout')), 10000)
              );
              
              // Try simple message signing first
              const signature = await Promise.race([
                wallet.wallet.account.signMessage(msgFormat),
                timeoutPromise
              ]);
              
              console.log(`Xverse account signMessage (format ${i + 1}) successful:`, signature);
              return signature;
            } catch (error) {
              console.log(`Xverse account signMessage (format ${i + 1}) failed:`, error);
            }
          }
          
          // If simple signing fails, try typed data
          console.log('Trying Xverse typed data format...');
          try {
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Typed data signing timeout')), 10000)
            );
            
            const signature = await Promise.race([
              wallet.wallet.account.signMessage({
                domain: {
                  name: 'KoData DAO',
                  version: '1',
                  chainId: '0x534e5f5345504f4c4941', // SN_SEPOLIA in hex
                },
                types: {
                  Message: [{ name: 'message', type: 'string' }],
                },
                primaryType: 'Message',
                message: { message },
              }),
              timeoutPromise
            ]);
            
            console.log('Xverse account signMessage (typed) successful:', signature);
            return signature;
          } catch (typedError) {
            console.log('Xverse account signMessage (typed) also failed:', typedError);
          }
        }
        
        // Fallback: try request-based signing (for older Xverse versions)
        if (wallet.wallet.request) {
          console.log('Trying Xverse wallet signing...');
          
          // Try different Xverse signing formats
          const xverseFormats = [
            // Format 1: Basic message signing
            {
              method: 'starknet_signMessage',
              params: { message: message }
            },
            // Format 2: With address
            {
          method: 'starknet_signMessage',
              params: { message: message, address: wallet.address }
            },
            // Format 3: Personal sign
            {
              method: 'personal_sign',
              params: [message, wallet.address]
            },
            // Format 4: Eth sign (fallback)
            {
              method: 'eth_sign',
              params: [wallet.address, message]
            }
          ];
          
          for (let i = 0; i < xverseFormats.length; i++) {
            const format = xverseFormats[i];
            console.log(`Trying Xverse format ${i + 1}:`, format);
            
            try {
              const signature = await wallet.wallet.request(format);
              console.log(`Xverse format ${i + 1} successful:`, signature);
              return signature;
            } catch (error) {
              console.log(`Xverse format ${i + 1} failed:`, error);
            }
          }
        }
        
        // Final fallback: try direct signMessage
        if (wallet.wallet.signMessage) {
          console.log('Trying direct signMessage...');
          try {
            const signature = await wallet.wallet.signMessage(message);
            console.log('Direct signMessage successful:', signature);
        return signature;
          } catch (error) {
            console.log('Direct signMessage failed:', error);
          }
        }
        
        // If all methods fail, throw a helpful error
        throw new Error('No supported signing method found. Please check your wallet implementation.');
      }

      throw new Error('Invalid wallet type for Starknet signing');
    } catch (error) {
      console.error('Starknet message signing failed:', error);
      
      // For development/testing, provide a mock signature
      if (import.meta.env.DEV || import.meta.env.MODE === 'development') {
        console.warn('Using mock signature for development');
        return {
          r: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          s: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
          recovery: 0
        };
      }
      
      throw new Error(`Failed to sign message: ${error.message}`);
    }
  }

  // Lisk wallet integration
  async connectLiskWallet() {
    try {
      // Check if Lisk wallet is available
      if (typeof window !== 'undefined' && window.lisk) {
        const wallet = window.lisk;
        
        // Request connection
        await wallet.enable();

        const accounts = await wallet.requestAccounts();

        if (accounts && accounts.length > 0) {
          return {
            address: accounts[0],
            wallet: wallet,
            type: 'lisk'
          };
        }
      }

      // Fallback: check for Lisk Desktop integration
      if (typeof window !== 'undefined' && window.liskDesktop) {
        const wallet = window.liskDesktop;
        
        const accounts = await wallet.getAccounts();

        if (accounts && accounts.length > 0) {
          return {
            address: accounts[0],
            wallet: wallet,
            type: 'lisk'
          };
        }
      }

      throw new Error('No Lisk wallet found. Please install Lisk Desktop or use the web wallet.');
    } catch (error) {
      console.error('Lisk wallet connection failed:', error);
      throw new Error(`Failed to connect Lisk wallet: ${error.message}`);
    }
  }

  async signLiskMessage(message, wallet) {
    try {
      if (wallet.type === 'lisk') {
        // Use the wallet's signMessage method
        const signature = await wallet.wallet.signMessage({
          message: message,
        });

        return signature;
      }

      throw new Error('Invalid wallet type for Lisk signing');
    } catch (error) {
      console.error('Lisk message signing failed:', error);
      throw new Error(`Failed to sign message: ${error.message}`);
    }
  }

  // Generic wallet connection
  async connectWallet(walletType) {
    if (walletType === 'starknet') {
      return this.connectStarknetWallet();
    } else if (walletType === 'lisk') {
      return this.connectLiskWallet();
    } else {
      throw new Error(`Unsupported wallet type: ${walletType}`);
    }
  }

  // Generic message signing
  async signMessage(message, wallet) {
    if (wallet.type === 'starknet') {
      return this.signStarknetMessage(message, wallet);
    } else if (wallet.type === 'lisk') {
      return this.signLiskMessage(message, wallet);
    } else {
      throw new Error(`Unsupported wallet type: ${wallet.type}`);
    }
  }

  // Check wallet availability
  isStarknetWalletAvailable() {
    return typeof window !== 'undefined' && 
           (window.xverseWallet || window.starknet);
  }

  isLiskWalletAvailable() {
    return typeof window !== 'undefined' && 
           (window.lisk || window.liskDesktop);
  }

  // Get wallet instructions
  getWalletInstructions(walletType) {
    const instructions = {
      starknet: {
        title: 'Connect Starknet Wallet',
        steps: [
          'Install Xverse wallet browser extension',
          'Create or import a Starknet account',
          'Make sure you have some testnet ETH',
          'Click "Connect Starknet Wallet" below'
        ],
        downloadUrl: 'https://www.xverse.app/',
        testnetFaucet: 'https://starknet-faucet.vercel.app/'
      },
      lisk: {
        title: 'Connect Lisk Wallet',
        steps: [
          'Download Lisk Desktop application',
          'Create or import a Lisk account',
          'Make sure you have some LSK tokens',
          'Use the web wallet integration'
        ],
        downloadUrl: 'https://lisk.com/desktop',
        testnetFaucet: 'https://testnet.lisk.com/'
      }
    };

    return instructions[walletType] || null;
  }
}

export const walletService = new WalletService();
