import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { TrendingUp, TrendingDown, AccountBalance } from '@mui/icons-material';

import { marketDataService } from '../services/api';

const Dashboard = () => {
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await marketDataService.getCurrentRates();
        setMarketData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching market data:', error);
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const mockChartData = [
    { time: '09:00', EURUSD: 1.0856, GBPUSD: 1.2534, USDJPY: 149.32 },
    { time: '10:00', EURUSD: 1.0862, GBPUSD: 1.2541, USDJPY: 149.28 },
    { time: '11:00', EURUSD: 1.0851, GBPUSD: 1.2528, USDJPY: 149.45 },
    { time: '12:00', EURUSD: 1.0859, GBPUSD: 1.2537, USDJPY: 149.21 },
    { time: '13:00', EURUSD: 1.0864, GBPUSD: 1.2543, USDJPY: 149.18 },
  ];

  const majorPairs = [
    { pair: 'EUR/USD', rate: 1.0856, change: +0.0008, changePercent: +0.074 },
    { pair: 'GBP/USD', rate: 1.2534, change: -0.0012, changePercent: -0.096 },
    { pair: 'USD/JPY', rate: 149.32, change: +0.15, changePercent: +0.10 },
    { pair: 'USD/CHF', rate: 0.9145, change: +0.0023, changePercent: +0.25 },
    { pair: 'AUD/USD', rate: 0.6542, change: -0.0034, changePercent: -0.52 },
    { pair: 'USD/CAD', rate: 1.3698, change: +0.0041, changePercent: +0.30 },
  ];

  const StatCard = ({ title, value, icon, color = 'primary' }) => (
    <Card elevation={2}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h5" component="div" color={color}>
              {value}
            </Typography>
          </Box>
          <Box color={`${color}.main`}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const CurrencyPairCard = ({ pair, rate, change, changePercent }) => (
    <Paper elevation={1} sx={{ p: 2, mb: 1 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">{pair}</Typography>
        <Box textAlign="right">
          <Typography variant="h6">{rate.toFixed(4)}</Typography>
          <Box display="flex" alignItems="center" gap={1}>
            {change > 0 ? (
              <TrendingUp color="success" fontSize="small" />
            ) : (
              <TrendingDown color="error" fontSize="small" />
            )}
            <Chip
              label={`${change > 0 ? '+' : ''}${changePercent.toFixed(2)}%`}
              size="small"
              color={change > 0 ? 'success' : 'error'}
              variant="outlined"
            />
          </Box>
        </Box>
      </Box>
    </Paper>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <Typography>Loading market data...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Trading Dashboard
      </Typography>

      {/* Key Statistics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Portfolio Value"
            value="$125,430"
            icon={<AccountBalance />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Today's P&L"
            value="+$2,340"
            icon={<TrendingUp />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Trades"
            value="8"
            icon={<TrendingUp />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Win Rate"
            value="73.2%"
            icon={<TrendingUp />}
            color="success"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Live Chart */}
        <Grid item xs={12} lg={8}>
          <Paper elevation={2} sx={{ p: 2, height: '400px' }}>
            <Typography variant="h6" gutterBottom>
              Live Market Data
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <AreaChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis domain={['dataMin - 0.01', 'dataMax + 0.01']} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="EURUSD"
                  stroke="#1976d2"
                  fill="#1976d2"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Major Currency Pairs */}
        <Grid item xs={12} lg={4}>
          <Paper elevation={2} sx={{ p: 2, height: '400px', overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom>
              Major Currency Pairs
            </Typography>
            {majorPairs.map((pair) => (
              <CurrencyPairCard key={pair.pair} {...pair} />
            ))}
          </Paper>
        </Grid>

        {/* Recent Trades */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Trades
            </Typography>
            <Typography color="textSecondary">
              Recent trading activity will be displayed here...
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
