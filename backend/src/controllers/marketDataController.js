const axios = require('axios');
const supabase = require('../utils/supabase');

class MarketDataController {
  // Get current exchange rates
  async getCurrentRates(req, res) {
    try {
      const { baseCurrency = 'USD' } = req.params;
      
      // Mock data for demo (since demo API key doesn't work)
      const mockRates = {
        EUR: 0.8234,
        GBP: 0.7456,
        JPY: 149.32,
        CHF: 0.9145,
        AUD: 1.5287,
        CAD: 1.3698,
        NZD: 1.6234,
        SEK: 10.8934,
        NOK: 11.2345
      };

      try {
        const response = await axios.get(
          `${process.env.EXCHANGE_API_URL}/${process.env.EXCHANGE_API_KEY}/latest/${baseCurrency}`
        );

        if (response.data.result === 'success') {
          // Store the data in Supabase for historical tracking
          await supabase
            .from('market_data')
            .insert({
              base_currency: baseCurrency,
              rates: response.data.conversion_rates,
              timestamp: new Date().toISOString()
            });

          res.json({
            success: true,
            data: {
              base: baseCurrency,
              rates: response.data.conversion_rates,
              timestamp: response.data.time_last_update_utc
            }
          });
        } else {
          throw new Error('Failed to fetch exchange rates');
        }
      } catch (apiError) {
        // Use mock data as fallback
        console.log('Using mock data for exchange rates (demo mode)');
        
        res.json({
          success: true,
          data: {
            base: baseCurrency,
            rates: mockRates,
            timestamp: new Date().toISOString(),
            source: 'mock_data'
          }
        });
      }
    } catch (error) {
      console.error('Error fetching current rates:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch current exchange rates'
      });
    }
  }

  // Get historical data
  async getHistoricalData(req, res) {
    try {
      const { currencyPair } = req.params;
      const { days = 30 } = req.query;

      // Fetch from Supabase database
      const { data, error } = await supabase
        .from('market_data')
        .select('*')
        .gte('timestamp', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .order('timestamp', { ascending: true });

      if (error) {
        throw error;
      }

      res.json({
        success: true,
        data: data,
        currencyPair,
        period: `${days} days`
      });
    } catch (error) {
      console.error('Error fetching historical data:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch historical data'
      });
    }
  }

  // Get WebSocket stream info
  async getStreamInfo(req, res) {
    try {
      res.json({
        success: true,
        data: {
          wsUrl: `ws://localhost:${process.env.WS_PORT || 8080}`,
          supportedPairs: ['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD'],
          updateInterval: '1s'
        }
      });
    } catch (error) {
      console.error('Error getting stream info:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get stream info'
      });
    }
  }

  // Get supported currencies
  async getSupportedCurrencies(req, res) {
    try {
      const response = await axios.get(
        `${process.env.EXCHANGE_API_URL}/${process.env.EXCHANGE_API_KEY}/codes`
      );

      if (response.data.result === 'success') {
        res.json({
          success: true,
          data: response.data.supported_codes
        });
      } else {
        throw new Error('Failed to fetch supported currencies');
      }
    } catch (error) {
      console.error('Error fetching supported currencies:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch supported currencies'
      });
    }
  }
}

module.exports = new MarketDataController();
