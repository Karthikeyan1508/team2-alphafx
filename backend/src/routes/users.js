const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// User registration
router.post('/register', userController.register);

// User login
router.post('/login', userController.login);

// Get user profile
router.get('/profile/:userId', userController.getProfile);

// Update user profile
router.put('/profile/:userId', userController.updateProfile);

// Get user dashboard data
router.get('/dashboard/:userId', userController.getDashboardData);

module.exports = router;
