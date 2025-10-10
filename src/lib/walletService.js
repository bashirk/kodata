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
      // Check if Xverse wallet is available
      if (typeof window !== 'undefined' && window.xverseWallet) {
        const wallet = window.xverseWallet;
        
        // Request connection
        await wallet.request({
          method: 'starknet_requestAccounts',
        });

        const accounts = await wallet.request({
          method: 'starknet_accounts',
        });

        if (accounts && accounts.length > 0) {
          return {
            address: accounts[0],
            wallet: wallet,
            type: 'starknet'
          };
        }
      }

      // Fallback: check for other Starknet wallets
      if (typeof window !== 'undefined' && window.starknet) {
        const wallet = window.starknet;
        
        if (!wallet.isConnected) {
          await wallet.enable();
        }

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
      if (wallet.type === 'starknet') {
        // Use the wallet's signMessage method
        const signature = await wallet.wallet.request({
          method: 'starknet_signMessage',
          params: {
            message: message,
          },
        });

        return signature;
      }

      throw new Error('Invalid wallet type for Starknet signing');
    } catch (error) {
      console.error('Starknet message signing failed:', error);
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
