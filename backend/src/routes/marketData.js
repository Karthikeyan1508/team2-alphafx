const express = require('express');
const router = express.Router();
const marketDataController = require('../controllers/marketDataController');

// Get current exchange rates
router.get('/rates/:baseCurrency?', marketDataController.getCurrentRates);

// Get historical data
router.get('/historical/:currencyPair', marketDataController.getHistoricalData);

// Get live streaming data (for WebSocket connection info)
router.get('/stream/info', marketDataController.getStreamInfo);

// Get supported currencies
router.get('/currencies', marketDataController.getSupportedCurrencies);

module.exports = router;
