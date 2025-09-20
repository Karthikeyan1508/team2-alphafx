import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Chip,
  Alert,
} from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';
import { toast } from 'react-toastify';

import { tradingService, marketDataService } from '../services/api';

const Trading = () => {
  const [orderForm, setOrderForm] = useState({
    currencyPair: 'EUR/USD',
    side: 'BUY',
    quantity: 10000,
    executionType: 'MARKET',
    stopLoss: '',
    takeProfit: ''
  });
  
  const [currentRates, setCurrentRates] = useState({});
  const [positions, setPositions] = useState([]);
  const [recentTrades, setRecentTrades] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMarketData();
    fetchPositions();
    fetchRecentTrades();
    
    // Refresh data every 5 seconds
    const interval = setInterval(() => {
      fetchMarketData();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchMarketData = async () => {
    try {
      const data = await marketDataService.getCurrentRates();
      if (data.success) {
        setCurrentRates(data.data.rates);
      }
    } catch (error) {
      console.error('Error fetching market data:', error);
    }
  };

  const fetchPositions = async () => {
    try {
      const data = await tradingService.getCurrentPositions('demo-user-id');
      if (data.success) {
        setPositions(data.data);
      }
    } catch (error) {
      console.error('Error fetching positions:', error);
    }
  };

  const fetchRecentTrades = async () => {
    try {
      const data = await tradingService.getTradingHistory('demo-user-id');
      if (data.success) {
        setRecentTrades(data.data.slice(0, 10)); // Last 10 trades
      }
    } catch (error) {
      console.error('Error fetching trades:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setOrderForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const orderData = {
        ...orderForm,
        quantity: parseFloat(orderForm.quantity),
        stopLoss: orderForm.stopLoss ? parseFloat(orderForm.stopLoss) : null,
        takeProfit: orderForm.takeProfit ? parseFloat(orderForm.takeProfit) : null
      };
      
      const response = await tradingService.executeTrade(orderData);
      
      if (response.success) {
        toast.success(`Trade executed successfully! ID: ${response.data.tradeId.slice(0, 8)}...`);
        
        // Reset form
        setOrderForm(prev => ({
          ...prev,
          stopLoss: '',
          takeProfit: ''
        }));
        
        // Refresh data
        fetchPositions();
        fetchRecentTrades();
      } else {
        toast.error(response.error || 'Trade execution failed');
      }
    } catch (error) {
      console.error('Error executing trade:', error);
      toast.error('Trade execution failed');
    } finally {
      setLoading(false);
    }
  };

  const currencyPairs = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD'];
  
  const getCurrentPrice = (pair) => {
    if (pair === 'USD/JPY') return currentRates.JPY ? (1 / currentRates.JPY * 100).toFixed(2) : '149.32';
    if (pair === 'EUR/USD') return currentRates.EUR ? (1 / currentRates.EUR).toFixed(4) : '1.0856';
    if (pair === 'GBP/USD') return currentRates.GBP ? (1 / currentRates.GBP).toFixed(4) : '1.2534';
    if (pair === 'USD/CHF') return currentRates.CHF ? currentRates.CHF.toFixed(4) : '0.9145';
    if (pair === 'AUD/USD') return currentRates.AUD ? (1 / currentRates.AUD).toFixed(4) : '0.6542';
    return '1.0000';
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Trading Interface
      </Typography>

      <Grid container spacing={3}>
        {/* Order Form */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Place Order
            </Typography>
            
            <Box component="form" onSubmit={handleSubmitOrder} sx={{ mt: 2 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Currency Pair</InputLabel>
                <Select
                  value={orderForm.currencyPair}
                  label="Currency Pair"
                  onChange={(e) => handleInputChange('currencyPair', e.target.value)}
                >
                  {currencyPairs.map(pair => (
                    <MenuItem key={pair} value={pair}>
                      {pair} - {getCurrentPrice(pair)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Side</InputLabel>
                <Select
                  value={orderForm.side}
                  label="Side"
                  onChange={(e) => handleInputChange('side', e.target.value)}
                >
                  <MenuItem value="BUY">
                    <Box display="flex" alignItems="center">
                      <TrendingUp color="success" sx={{ mr: 1 }} />
                      BUY
                    </Box>
                  </MenuItem>
                  <MenuItem value="SELL">
                    <Box display="flex" alignItems="center">
                      <TrendingDown color="error" sx={{ mr: 1 }} />
                      SELL
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={orderForm.quantity}
                onChange={(e) => handleInputChange('quantity', e.target.value)}
                sx={{ mb: 2 }}
                inputProps={{ min: 1000, step: 1000 }}
              />

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Execution Type</InputLabel>
                <Select
                  value={orderForm.executionType}
                  label="Execution Type"
                  onChange={(e) => handleInputChange('executionType', e.target.value)}
                >
                  <MenuItem value="MARKET">Market</MenuItem>
                  <MenuItem value="LIMIT">Limit</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Stop Loss (Optional)"
                type="number"
                value={orderForm.stopLoss}
                onChange={(e) => handleInputChange('stopLoss', e.target.value)}
                sx={{ mb: 2 }}
                inputProps={{ step: 0.0001 }}
              />

              <TextField
                fullWidth
                label="Take Profit (Optional)"
                type="number"
                value={orderForm.takeProfit}
                onChange={(e) => handleInputChange('takeProfit', e.target.value)}
                sx={{ mb: 3 }}
                inputProps={{ step: 0.0001 }}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading}
                color={orderForm.side === 'BUY' ? 'success' : 'error'}
              >
                {loading ? 'Executing...' : `${orderForm.side} ${orderForm.currencyPair}`}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Current Positions */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, height: 'fit-content' }}>
            <Typography variant="h6" gutterBottom>
              Open Positions
            </Typography>
            
            {positions.length === 0 ? (
              <Alert severity="info">No open positions</Alert>
            ) : (
              positions.map((position, index) => (
                <Card key={position.id || index} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6">{position.currency_pair}</Typography>
                      <Chip 
                        label={position.side} 
                        color={position.side === 'BUY' ? 'success' : 'error'}
                        size="small"
                      />
                    </Box>
                    <Typography color="textSecondary">
                      Quantity: {position.quantity?.toLocaleString()}
                    </Typography>
                    <Typography color="textSecondary">
                      Avg Price: {position.avg_price}
                    </Typography>
                    <Typography 
                      color={position.unrealized_pnl >= 0 ? 'success.main' : 'error.main'}
                      fontWeight="bold"
                    >
                      P&L: ${position.unrealized_pnl?.toFixed(2)}
                    </Typography>
                  </CardContent>
                </Card>
              ))
            )}
          </Paper>
        </Grid>

        {/* Recent Trades */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, height: 'fit-content' }}>
            <Typography variant="h6" gutterBottom>
              Recent Trades
            </Typography>
            
            {recentTrades.length === 0 ? (
              <Alert severity="info">No recent trades</Alert>
            ) : (
              recentTrades.map((trade, index) => (
                <Card key={trade.id || index} sx={{ mb: 2 }}>
                  <CardContent sx={{ p: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" fontWeight="bold">
                        {trade.currency_pair}
                      </Typography>
                      <Chip 
                        label={trade.side} 
                        color={trade.side === 'BUY' ? 'success' : 'error'}
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" color="textSecondary">
                      {trade.quantity?.toLocaleString()} @ {trade.price}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Status: {trade.status}
                    </Typography>
                    {trade.profit_loss && (
                      <Typography 
                        variant="body2"
                        color={trade.profit_loss >= 0 ? 'success.main' : 'error.main'}
                      >
                        P&L: ${trade.profit_loss.toFixed(2)}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </Paper>
        </Grid>

        {/* Market Data */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Live Market Data
            </Typography>
            
            <Grid container spacing={2}>
              {currencyPairs.map(pair => (
                <Grid item xs={12} sm={6} md={2} key={pair}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h6">{pair}</Typography>
                      <Typography variant="h5" color="primary">
                        {getCurrentPrice(pair)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Trading;
