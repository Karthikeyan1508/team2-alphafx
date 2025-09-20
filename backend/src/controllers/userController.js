const supabase = require('../utils/supabase');

class UserController {
  // Register new user
  async register(req, res) {
    try {
      const { email, username, password, firstName, lastName } = req.body;

      if (!email || !username || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email, username, and password are required'
        });
      }

      // In a real implementation, password would be hashed
      const passwordHash = `hashed_${password}`;

      const { data: user, error } = await supabase
        .from('users')
        .insert({
          email,
          username,
          password_hash: passwordHash,
          first_name: firstName,
          last_name: lastName
        })
        .select('id, email, username, first_name, last_name')
        .single();

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          return res.status(400).json({
            success: false,
            error: 'Email or username already exists'
          });
        }
        throw error;
      }

      // Generate mock JWT token
      const token = `mock_jwt_token_${user.id}`;

      res.status(201).json({
        success: true,
        data: {
          userId: user.id,
          email: user.email,
          username: user.username,
          token
        }
      });
    } catch (error) {
      console.error('Error in register:', error);
      res.status(500).json({
        success: false,
        error: 'Registration failed'
      });
    }
  }

  // User login
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password are required'
        });
      }

      // For demo purposes, use mock authentication
      if (email === 'demo@alphafx.com' && password === 'demo123') {
        const mockUser = {
          id: 'demo-user-id',
          email: 'demo@alphafx.com',
          username: 'demotrader',
          firstName: 'Demo',
          lastName: 'Trader'
        };

        const token = `mock_jwt_token_${mockUser.id}`;

        return res.json({
          success: true,
          data: {
            userId: mockUser.id,
            email: mockUser.email,
            username: mockUser.username,
            token,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          }
        });
      }

      res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    } catch (error) {
      console.error('Error in login:', error);
      res.status(500).json({
        success: false,
        error: 'Login failed'
      });
    }
  }

  // Get user profile
  async getProfile(req, res) {
    try {
      const { userId } = req.params;

      if (userId === 'demo-user-id') {
        // Return mock profile for demo
        return res.json({
          success: true,
          data: {
            id: 'demo-user-id',
            email: 'demo@alphafx.com',
            username: 'demotrader',
            firstName: 'Demo',
            lastName: 'Trader',
            profile: {
              timezone: 'UTC',
              currency: 'USD',
              riskTolerance: 'MEDIUM'
            },
            createdAt: '2025-09-01T00:00:00Z'
          }
        });
      }

      const { data: user, error } = await supabase
        .from('users')
        .select('id, email, username, first_name, last_name, profile, created_at')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({
            success: false,
            error: 'User not found'
          });
        }
        throw error;
      }

      res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name,
          profile: user.profile || {},
          createdAt: user.created_at
        }
      });
    } catch (error) {
      console.error('Error getting profile:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get profile'
      });
    }
  }

  // Update user profile
  async updateProfile(req, res) {
    try {
      const { userId } = req.params;
      const { firstName, lastName, profile } = req.body;

      const updateData = {};
      if (firstName !== undefined) updateData.first_name = firstName;
      if (lastName !== undefined) updateData.last_name = lastName;
      if (profile !== undefined) updateData.profile = profile;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No update data provided'
        });
      }

      updateData.updated_at = new Date().toISOString();

      const { data: user, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select('id, email, username, first_name, last_name, profile, updated_at')
        .single();

      if (error) {
        throw error;
      }

      res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name,
          profile: user.profile || {},
          updatedAt: user.updated_at
        }
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update profile'
      });
    }
  }

  // Get dashboard data
  async getDashboardData(req, res) {
    try {
      const { userId } = req.params;

      // Mock dashboard data for demo
      const mockDashboardData = {
        portfolioValue: 125430.50,
        todaysPnl: 2340.75,
        activeTrades: 8,
        winRate: 73.2,
        totalTrades: 156,
        performance: {
          daily: 1.87,
          weekly: 3.45,
          monthly: 12.34
        }
      };

      res.json({
        success: true,
        data: mockDashboardData
      });
    } catch (error) {
      console.error('Error getting dashboard data:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get dashboard data'
      });
    }
  }
}

module.exports = new UserController();
