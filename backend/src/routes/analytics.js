const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// Get trading performance analytics
router.get('/performance/:userId', analyticsController.getPerformanceAnalytics);

// Get backtesting results
router.post('/backtest', analyticsController.runBacktest);

// Get moving averages
router.get('/indicators/sma/:currencyPair', analyticsController.getSMA);

// Get RSI
router.get('/indicators/rsi/:currencyPair', analyticsController.getRSI);

// Get Bollinger Bands
router.get('/indicators/bollinger/:currencyPair', analyticsController.getBollingerBands);

// Compare algorithms performance
router.get('/compare/:userId', analyticsController.compareAlgorithms);

module.exports = router;
