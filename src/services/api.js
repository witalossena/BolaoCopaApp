import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  register: async (name, handle, email, password) => {
    const response = await api.post('/auth/register', { name, handle, email, password });
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    if (response.data) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  }
};

export const matchService = {
  getMatches: async (group = '', round = '') => {
    const response = await api.get(`/matches?group=${group}&round=${round}`);
    return response.data;
  }
};

export const predictionService = {
  submitMatchPrediction: async (matchId, homeScore, awayScore) => {
    const response = await api.post('/predictions/match', { matchId, homeScore, awayScore });
    return response.data;
  },
  submitGroupRankPrediction: async (group, firstTeam, secondTeam) => {
    const response = await api.post('/predictions/group-rank', { group, firstTeam, secondTeam });
    return response.data;
  }
};

export const rankingService = {
  getRanking: async () => {
    const response = await api.get('/ranking');
    return response.data;
  }
};

export const adminService = {
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },
  getUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },
  togglePayment: async (userId, isPaid) => {
    const response = await api.patch(`/admin/users/${userId}/payment`, isPaid, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  },
  updateMatchResult: async (matchId, homeScore, awayScore) => {
    const response = await api.post('/admin/match-result', { matchId, homeScore, awayScore });
    return response.data;
  },
  calculateScores: async () => {
    const response = await api.post('/admin/calculate-scores');
    return response.data;
  }
};

export const paymentService = {
  generatePix: async () => {
    const response = await api.post('/payment/pix');
    return response.data;
  }
};

export default api;
