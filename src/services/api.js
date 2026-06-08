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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('bolao2026_v1');
      window.dispatchEvent(new Event('auth:logout'));
    }
    return Promise.reject(error);
  }
);

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
  getUserPredictions: async () => {
    const response = await api.get('/predictions/me');
    return response.data;
  },
  getPredictionHistory: async () => {
    const response = await api.get('/predictions/history');
    return response.data;
  },
  submitMatchPrediction: async (matchId, homeScore, awayScore) => {
    const response = await api.post('/predictions/match', { matchId, homeScore, awayScore });
    return response.data;
  },
  submitGroupRankPrediction: async (group, firstTeam, secondTeam, thirdTeam, fourthTeam) => {
    const response = await api.post('/predictions/group-rank', { group, firstTeam, secondTeam, thirdTeam, fourthTeam });
    return response.data;
  },
  submitKnockoutPrediction: async (matchId, winnerTeam, homeScore, awayScore) => {
    const response = await api.post('/predictions/knockout', { matchId, winnerTeam, homeScore, awayScore });
    return response.data;
  },
  clearKnockoutPredictions: async () => {
    const response = await api.delete('/predictions/knockout');
    return response.data;
  },
  clearAllPredictions: async () => {
    const response = await api.delete('/predictions/all');
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
  },
  getGroupResults: async () => {
    const response = await api.get('/admin/group-results');
    return response.data;
  },
  setGroupResult: async (group, firstTeam, secondTeam, thirdTeam, fourthTeam) => {
    const response = await api.post('/admin/group-result', { group, firstTeam, secondTeam, thirdTeam, fourthTeam });
    return response.data;
  },
  calculateGroupScores: async () => {
    const response = await api.post('/admin/calculate-group-scores');
    return response.data;
  },
  lockMatch: async (matchId, isLocked) => {
    const response = await api.patch(`/admin/matches/${matchId}/lock`, isLocked, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  },
  updateMatchTeams: async (matchId, homeTeam, awayTeam) => {
    const response = await api.patch(`/admin/matches/${matchId}/teams`, { homeTeam, awayTeam });
    return response.data;
  },
  getUserPredictions: async (userId) => {
    const response = await api.get(`/admin/users/${userId}/predictions`);
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
