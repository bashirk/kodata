// API service for communicating with the backend
// Normalize base URL to avoid double "/api" when endpoints already include it
// In production, use empty string for relative URLs (nginx proxies /api to backend)
// In development, use localhost:3001
const RAW_API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === 'production' ? '' : 'http://localhost:3001');

const API_BASE_URL = (() => {
  // If empty or just slash, use empty for relative URLs
  if (!RAW_API_BASE_URL || RAW_API_BASE_URL === '/') {
    return '';
  }
  
  try {
    const url = new URL(RAW_API_BASE_URL);
    // If env base ends with /api, drop it, since endpoints already include /api prefix
    if (url.pathname.replace(/\/$/, '') === '/api') {
      url.pathname = '/';
    }
    return url.toString().replace(/\/$/, '');
  } catch {
    // Fallback simple string normalization
    return RAW_API_BASE_URL.replace(/\/$/, '').replace(/\/api$/, '');
  }
})();

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
    // Ensure we don't produce double slashes
    const url = `${this.baseURL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
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

  async createEthereumSubmission(submissionData) {
    return this.request('/api/ethereum/submissions', {
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

  async getEthereumTransactionStatus(txHash) {
    return this.request(`/api/ethereum/transaction/${txHash}/status`);
  }

  // Blockchain status
  async ethereumMadTokenTransfer(to, amount, from) {
    return this.request('/api/ethereum/mad-token/transfer', {
      method: 'POST',
      body: JSON.stringify({ to, amount, from }),
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }

  // Runes Authentication API methods
  async registerRunesHolder(authData) {
    return this.request('/api/runes/register', {
      method: 'POST',
      body: JSON.stringify(authData),
    });
  }

  async getRunesBalance(address, runeId) {
    const endpoint = runeId ? 
      `/api/runes/balance/${address}?runeId=${runeId}` : 
      `/api/runes/balance/${address}`;
    return this.request(endpoint);
  }

  async syncRunesBalance() {
    return this.request('/api/runes/sync', { method: 'POST' });
  }

  async getRunesHolders() {
    return this.request('/api/runes/holders');
  }

  // Governance API methods
  async createProposal(proposalData) {
    return this.request('/api/governance/proposals', {
      method: 'POST',
      body: JSON.stringify(proposalData),
    });
  }

  async getProposals(filter = {}) {
    const queryParams = new URLSearchParams(filter).toString();
    const endpoint = queryParams ? 
      `/api/governance/proposals?${queryParams}` : 
      '/api/governance/proposals';
    return this.request(endpoint);
  }

  async getProposal(proposalId) {
    return this.request(`/api/governance/proposals/${proposalId}`);
  }

  async voteOnProposal(proposalId, voteData) {
    return this.request(`/api/governance/proposals/${proposalId}/vote`, {
      method: 'POST',
      body: JSON.stringify(voteData),
    });
  }

  async executeProposal(proposalId) {
    return this.request(`/api/governance/proposals/${proposalId}/execute`, {
      method: 'POST',
    });
  }

  async getVotingHistory(userId) {
    return this.request(`/api/governance/voting-history/${userId}`);
  }

  async ethereumVoteOnProposal(proposalId, voteData) {
    return this.request(`/api/ethereum/governance/proposals/${proposalId}/vote`, {
      method: 'POST',
      body: JSON.stringify(voteData),
    });
  }

  async getEthereumVotingPower(address) {
    return this.request(`/api/ethereum/governance/voting-power/${address}`);
  }
}

export const apiService = new ApiService();
