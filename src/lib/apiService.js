// API service for communicating with the backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async getChallenge() {
    return this.request('/api/auth/challenge', { method: 'POST' });
  }

  async login(signature) {
    const response = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(signature),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  // User endpoints
  async getUserProfile() {
    return this.request('/api/users/profile');
  }

  // Submission endpoints
  async createSubmission(submissionData) {
    return this.request('/api/submissions', {
      method: 'POST',
      body: JSON.stringify(submissionData),
    });
  }

  async getSubmissions() {
    return this.request('/api/submissions');
  }

  async getSubmission(id) {
    return this.request(`/api/submissions/${id}`);
  }

  // Admin endpoints
  async approveSubmission(id) {
    return this.request(`/api/admin/approve-submission/${id}`, {
      method: 'POST',
    });
  }

  // MAD Token endpoints
  async getMADTokenInfo() {
    return this.request('/api/mad-token/info');
  }

  async getMADTokenBalance(address) {
    return this.request(`/api/mad-token/balance/${address}`);
  }

  async getMADTokenStaking(address) {
    return this.request(`/api/mad-token/staking/${address}`);
  }

  async stakeMADTokens(amount) {
    return this.request('/api/mad-token/stake', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  }

  async unstakeMADTokens(amount) {
    return this.request('/api/mad-token/unstake', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  }

  async claimMADTokenRewards() {
    return this.request('/api/mad-token/claim-rewards', {
      method: 'POST',
    });
  }

  // Admin MAD Token endpoints
  async mintMADTokens(to, amount, reason) {
    return this.request('/api/admin/mad-token/mint', {
      method: 'POST',
      body: JSON.stringify({ to, amount, reason }),
    });
  }

  async transferMADTokens(to, amount) {
    return this.request('/api/admin/mad-token/transfer', {
      method: 'POST',
      body: JSON.stringify({ to, amount }),
    });
  }

  // Admin user management endpoints
  async getAdminUsers() {
    return this.request('/api/admin/users');
  }

  async promoteUser(userId, role) {
    return this.request(`/api/admin/users/${userId}/promote`, {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
  }

  async demoteUser(userId) {
    return this.request(`/api/admin/users/${userId}/demote`, {
      method: 'POST',
    });
  }

  // Reward endpoints
  async getRewardHistory(userId) {
    return this.request(`/api/rewards/history/${userId}`);
  }

  async getRewardStats() {
    return this.request('/api/rewards/stats');
  }

  async createManualReward(to, amount, reason) {
    return this.request('/api/admin/rewards/manual', {
      method: 'POST',
      body: JSON.stringify({ to, amount, reason }),
    });
  }

  async transferTokens(to, amount, from) {
    return this.request('/api/mad-token/transfer', {
      method: 'POST',
      body: JSON.stringify({ to, amount, from }),
    });
  }

  // Blockchain status
  async getBlockchainStatus() {
    return this.request('/api/blockchain/status');
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export const apiService = new ApiService();
