const express = require('express');
const router = express.Router();
const tradingController = require('../controllers/tradingController');

// Execute a trade
router.post('/execute', tradingController.executeTrade);

// Get trading history
router.get('/history/:userId', tradingController.getTradingHistory);

// Get current positions
router.get('/positions/:userId', tradingController.getCurrentPositions);

// Get trading algorithms status
router.get('/algorithms/status', tradingController.getAlgorithmsStatus);

// Start/Stop algorithmic trading
router.post('/algorithms/:action', tradingController.controlAlgorithms);

// Get trade by ID
router.get('/trade/:tradeId', tradingController.getTradeById);

module.exports = router;
