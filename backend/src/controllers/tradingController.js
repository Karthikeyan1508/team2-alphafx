const supabase = require('../utils/supabase');
const { v4: uuidv4 } = require('uuid');

class TradingController {
  // Execute a trade
  async executeTrade(req, res) {
    try {
      const {
        currencyPair,
        side,
        quantity,
        executionType = 'MARKET',
        stopLoss,
        takeProfit,
        algorithm = 'MANUAL',
        userId = 'demo-user' // For demo purposes
      } = req.body;

      // Validate trade parameters
      if (!currencyPair || !side || !quantity) {
        return res.status(400).json({
          success: false,
          error: 'Missing required trade parameters'
        });
      }

      // Check trading volume limit
      const maxVolume = process.env.MAX_TRADING_VOLUME || 10000000;
      
      // Get current total volume for today
      const today = new Date().toISOString().split('T')[0];
      const { data: todayTrades } = await supabase
        .from('trades')
        .select('quantity')
        .gte('created_at', today)
        .eq('status', 'FILLED');

      const currentVolume = todayTrades?.reduce((sum, trade) => sum + parseFloat(trade.quantity), 0) || 0;
      
      if (currentVolume + quantity > maxVolume) {
        return res.status(400).json({
          success: false,
          error: 'Trading volume limit exceeded',
          details: {
            currentVolume,
            requestedQuantity: quantity,
            maxVolume
          }
        });
      }

      // Simulate price execution (in real implementation, this would be market price)
      const mockPrices = {
        'EUR/USD': 1.0856,
        'GBP/USD': 1.2534,
        'USD/JPY': 149.32,
        'USD/CHF': 0.9145,
        'AUD/USD': 0.6542
      };

      const executedPrice = mockPrices[currencyPair] || 1.0000;
      const tradeId = uuidv4();

      // Create trade record
      const { data: trade, error } = await supabase
        .from('trades')
        .insert({
          id: tradeId,
          user_id: userId,
          currency_pair: currencyPair,
          side: side.toUpperCase(),
          quantity: parseFloat(quantity),
          price: executedPrice,
          status: 'FILLED',
          algorithm,
          execution_type: executionType,
          stop_loss: stopLoss ? parseFloat(stopLoss) : null,
          take_profit: takeProfit ? parseFloat(takeProfit) : null,
          executed_at: new Date().toISOString(),
          commission: quantity * 0.00005, // 0.5 pip commission
          profit_loss: 0 // Will be calculated when position is closed
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating trade:', error);
        return res.status(500).json({
          success: false,
          error: 'Failed to execute trade'
        });
      }

      res.json({
        success: true,
        data: {
          tradeId: trade.id,
          status: 'FILLED',
          executedPrice,
          executedAt: trade.executed_at,
          commission: trade.commission
        }
      });
    } catch (error) {
      console.error('Error in executeTrade:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Get trading history
  async getTradingHistory(req, res) {
    try {
      const { userId } = req.params;
      const { limit = 50, offset = 0, algorithm } = req.query;

      let query = supabase
        .from('trades')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (algorithm) {
        query = query.eq('algorithm', algorithm);
      }

      const { data: trades, error, count } = await query;

      if (error) {
        throw error;
      }

      res.json({
        success: true,
        data: trades || [],
        pagination: {
          total: count || 0,
          limit: parseInt(limit),
          offset: parseInt(offset)
        }
      });
    } catch (error) {
      console.error('Error fetching trading history:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch trading history'
      });
    }
  }

  // Get current positions
  async getCurrentPositions(req, res) {
    try {
      const { userId } = req.params;

      const { data: positions, error } = await supabase
        .from('positions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_open', true)
        .order('opened_at', { ascending: false });

      if (error) {
        throw error;
      }

      res.json({
        success: true,
        data: positions || []
      });
    } catch (error) {
      console.error('Error fetching positions:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch positions'
      });
    }
  }

  // Get algorithms status
  async getAlgorithmsStatus(req, res) {
    try {
      const tradingEnabled = process.env.TRADING_ENABLED === 'true';
      
      // Get today's trading volume
      const today = new Date().toISOString().split('T')[0];
      const { data: todayTrades } = await supabase
        .from('trades')
        .select('quantity')
        .gte('created_at', today)
        .eq('status', 'FILLED');

      const totalVolume = todayTrades?.reduce((sum, trade) => sum + parseFloat(trade.quantity), 0) || 0;

      // Mock algorithm performance data
      const mockAlgorithms = [
        {
          name: 'SMA Crossover',
          type: 'SMA',
          isActive: true,
          performance: {
            trades: 45,
            winRate: 73.3,
            profit: 12450.50
          }
        },
        {
          name: 'RSI Strategy',
          type: 'RSI',
          isActive: false,
          performance: {
            trades: 32,
            winRate: 68.8,
            profit: 8230.25
          }
        },
        {
          name: 'Bollinger Bands',
          type: 'BOLLINGER',
          isActive: true,
          performance: {
            trades: 28,
            winRate: 71.4,
            profit: 9875.75
          }
        }
      ];

      res.json({
        success: true,
        data: {
          tradingEnabled,
          totalVolume,
          volumeLimit: parseInt(process.env.MAX_TRADING_VOLUME),
          activeAlgorithms: mockAlgorithms
        }
      });
    } catch (error) {
      console.error('Error getting algorithms status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get algorithms status'
      });
    }
  }

  // Control algorithms (start/stop)
  async controlAlgorithms(req, res) {
    try {
      const { action } = req.params;
      const { algorithmTypes = [], currencyPairs = [] } = req.body;

      if (!['start', 'stop'].includes(action)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid action. Use "start" or "stop"'
        });
      }

      // In a real implementation, this would control actual trading algorithms
      console.log(`${action.toUpperCase()} algorithms:`, { algorithmTypes, currencyPairs });

      res.json({
        success: true,
        data: {
          action,
          algorithmsAffected: algorithmTypes.length || 1,
          status: `Algorithmic trading ${action}ed successfully`
        }
      });
    } catch (error) {
      console.error('Error controlling algorithms:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to control algorithms'
      });
    }
  }

  // Get trade by ID
  async getTradeById(req, res) {
    try {
      const { tradeId } = req.params;

      const { data: trade, error } = await supabase
        .from('trades')
        .select('*')
        .eq('id', tradeId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({
            success: false,
            error: 'Trade not found'
          });
        }
        throw error;
      }

      res.json({
        success: true,
        data: trade
      });
    } catch (error) {
      console.error('Error fetching trade:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch trade'
      });
    }
  }
}

module.exports = new TradingController();
