import { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../lib/apiService';
import { walletService } from '../lib/walletService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          const userData = await apiService.getUserProfile();
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        apiService.clearToken();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Removed automatic wallet connection polling to prevent unwanted disconnections

  const login = async (walletType) => {
    try {
      setIsLoading(true);

      // Get authentication challenge
      const challenge = await apiService.getChallenge();

      // Connect wallet
      const wallet = await walletService.connectWallet(walletType);

      // Sign the challenge message
      const signature = await walletService.signMessage(challenge.message, wallet);

      // Send signature to backend
      const response = await apiService.login({
        address: wallet.address,
        signature: signature,
        message: challenge.message,
        walletType: walletType
      });

      setUser(response.user);
      setIsAuthenticated(true);
      
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    apiService.clearToken();
    setUser(null);
    setIsAuthenticated(false);
  };

  const disconnectWallet = async () => {
    try {
      // Clear authentication state
      logout();
      
      // Try to disconnect from the actual wallet if available
      if (typeof window !== 'undefined') {
        // For Xverse wallet
        if (window.xverseWallet && window.xverseWallet.disconnect) {
          await window.xverseWallet.disconnect();
        }
        
        // For other Starknet wallets
        if (window.starknet && window.starknet.disconnect) {
          await window.starknet.disconnect();
        }
        
        // For Lisk wallets
        if (window.lisk && window.lisk.disconnect) {
          await window.lisk.disconnect();
        }
      }
      
      console.log('Wallet disconnected successfully');
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      // Still clear local state even if wallet disconnect fails
    }
  };


  const createSubmission = async (submissionData) => {
    try {
      const submission = await apiService.createSubmission(submissionData);
      return submission;
    } catch (error) {
      console.error('Failed to create submission:', error);
      throw error;
    }
  };

  const getSubmissions = async () => {
    try {
      const submissions = await apiService.getSubmissions();
      return submissions;
    } catch (error) {
      console.error('Failed to get submissions:', error);
      throw error;
    }
  };

  const approveSubmission = async (submissionId) => {
    try {
      const result = await apiService.approveSubmission(submissionId);
      return result;
    } catch (error) {
      console.error('Failed to approve submission:', error);
      throw error;
    }
  };

  const getBlockchainStatus = async () => {
    try {
      const status = await apiService.getBlockchainStatus();
      return status;
    } catch (error) {
      console.error('Failed to get blockchain status:', error);
      throw error;
    }
  };

  // MAD Token functions
  const getMADTokenInfo = async () => {
    try {
      const info = await apiService.getMADTokenInfo();
      return info;
    } catch (error) {
      console.error('Failed to get MAD token info:', error);
      throw error;
    }
  };

  const getMADTokenBalance = async (address) => {
    try {
      const balance = await apiService.getMADTokenBalance(address);
      return balance;
    } catch (error) {
      console.error('Failed to get MAD token balance:', error);
      throw error;
    }
  };

  const getMADTokenStaking = async (address) => {
    try {
      const staking = await apiService.getMADTokenStaking(address);
      return staking;
    } catch (error) {
      console.error('Failed to get MAD token staking info:', error);
      throw error;
    }
  };

  const stakeMADTokens = async (amount) => {
    try {
      const result = await apiService.stakeMADTokens(amount);
      return result;
    } catch (error) {
      console.error('Failed to stake MAD tokens:', error);
      throw error;
    }
  };

  const unstakeMADTokens = async (amount) => {
    try {
      const result = await apiService.unstakeMADTokens(amount);
      return result;
    } catch (error) {
      console.error('Failed to unstake MAD tokens:', error);
      throw error;
    }
  };

  const claimMADTokenRewards = async () => {
    try {
      const result = await apiService.claimMADTokenRewards();
      return result;
    } catch (error) {
      console.error('Failed to claim MAD token rewards:', error);
      throw error;
    }
  };

  // Admin functions
  const getAdminUsers = async () => {
    try {
      const result = await apiService.getAdminUsers();
      return result;
    } catch (error) {
      console.error('Failed to get admin users:', error);
      throw error;
    }
  };

  const promoteUser = async (userId, role) => {
    try {
      const result = await apiService.promoteUser(userId, role);
      return result;
    } catch (error) {
      console.error('Failed to promote user:', error);
      throw error;
    }
  };

  const demoteUser = async (userId) => {
    try {
      const result = await apiService.demoteUser(userId);
      return result;
    } catch (error) {
      console.error('Failed to demote user:', error);
      throw error;
    }
  };

  const getRewardHistory = async (userId) => {
    try {
      const result = await apiService.getRewardHistory(userId);
      return result;
    } catch (error) {
      console.error('Failed to get reward history:', error);
      throw error;
    }
  };

  const getRewardStats = async () => {
    try {
      const result = await apiService.getRewardStats();
      return result;
    } catch (error) {
      console.error('Failed to get reward stats:', error);
      throw error;
    }
  };

  const createManualReward = async (to, amount, reason) => {
    try {
      const result = await apiService.createManualReward(to, amount, reason);
      return result;
    } catch (error) {
      console.error('Failed to create manual reward:', error);
      throw error;
    }
  };

  const transferTokens = async (to, amount, from) => {
    try {
      const result = await apiService.transferTokens(to, amount, from);
      return result;
    } catch (error) {
      console.error('Failed to transfer tokens:', error);
      throw error;
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    disconnectWallet,
    createSubmission,
    getSubmissions,
    approveSubmission,
    getBlockchainStatus,
    // MAD Token functions
    getMADTokenInfo,
    getMADTokenBalance,
    getMADTokenStaking,
    stakeMADTokens,
    unstakeMADTokens,
    claimMADTokenRewards,
    // Admin functions
    getAdminUsers,
    promoteUser,
    demoteUser,
    getRewardHistory,
    getRewardStats,
    createManualReward,
    transferTokens,
    walletService
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
