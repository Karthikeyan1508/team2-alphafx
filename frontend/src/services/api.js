import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Market Data Service
export const marketDataService = {
  getCurrentRates: async (baseCurrency = 'USD') => {
    const response = await apiClient.get(`/market/rates/${baseCurrency}`);
    return response.data;
  },

  getHistoricalData: async (currencyPair, days = 30) => {
    const response = await apiClient.get(`/market/historical/${currencyPair}`, {
      params: { days }
    });
    return response.data;
  },

  getSupportedCurrencies: async () => {
    const response = await apiClient.get('/market/currencies');
    return response.data;
  },

  getStreamInfo: async () => {
    const response = await apiClient.get('/market/stream/info');
    return response.data;
  }
};

// Trading Service
export const tradingService = {
  executeTrade: async (tradeData) => {
    const response = await apiClient.post('/trading/execute', tradeData);
    return response.data;
  },

  getTradingHistory: async (userId) => {
    const response = await apiClient.get(`/trading/history/${userId}`);
    return response.data;
  },

  getCurrentPositions: async (userId) => {
    const response = await apiClient.get(`/trading/positions/${userId}`);
    return response.data;
  },

  getAlgorithmsStatus: async () => {
    const response = await apiClient.get('/trading/algorithms/status');
    return response.data;
  },

  controlAlgorithms: async (action) => {
    const response = await apiClient.post(`/trading/algorithms/${action}`);
    return response.data;
  }
};

// Analytics Service
export const analyticsService = {
  getPerformanceAnalytics: async (userId) => {
    const response = await apiClient.get(`/analytics/performance/${userId}`);
    return response.data;
  },

  runBacktest: async (backtestData) => {
    const response = await apiClient.post('/analytics/backtest', backtestData);
    return response.data;
  },

  getSMA: async (currencyPair) => {
    const response = await apiClient.get(`/analytics/indicators/sma/${currencyPair}`);
    return response.data;
  },

  getRSI: async (currencyPair) => {
    const response = await apiClient.get(`/analytics/indicators/rsi/${currencyPair}`);
    return response.data;
  },

  getBollingerBands: async (currencyPair) => {
    const response = await apiClient.get(`/analytics/indicators/bollinger/${currencyPair}`);
    return response.data;
  },

  compareAlgorithms: async (userId) => {
    const response = await apiClient.get(`/analytics/compare/${userId}`);
    return response.data;
  }
};

// User Service
export const userService = {
  register: async (userData) => {
    const response = await apiClient.post('/users/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await apiClient.post('/users/login', credentials);
    return response.data;
  },

  getProfile: async (userId) => {
    const response = await apiClient.get(`/users/profile/${userId}`);
    return response.data;
  },

  updateProfile: async (userId, profileData) => {
    const response = await apiClient.put(`/users/profile/${userId}`, profileData);
    return response.data;
  },

  getDashboardData: async (userId) => {
    const response = await apiClient.get(`/users/dashboard/${userId}`);
    return response.data;
  }
};

export default apiClient;
