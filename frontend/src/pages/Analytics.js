import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import { analyticsService } from '../services/api';

const Analytics = () => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedPair, setSelectedPair] = useState('EUR/USD');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('SMA');
  const [performanceData, setPerformanceData] = useState({});
  const [indicatorData, setIndicatorData] = useState([]);
  const [backtestResults, setBacktestResults] = useState(null);
  const [algorithmComparison, setAlgorithmComparison] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPerformanceData();
    fetchAlgorithmComparison();
  }, []);

  useEffect(() => {
    if (tabValue === 1) {
      fetchIndicatorData();
    }
  }, [tabValue, selectedPair, selectedAlgorithm]);

  const fetchPerformanceData = async () => {
    try {
      const data = await analyticsService.getPerformanceAnalytics('demo-user-id');
      if (data.success) {
        setPerformanceData(data.data);
      }
    } catch (error) {
      console.error('Error fetching performance data:', error);
    }
  };

  const fetchIndicatorData = async () => {
    try {
      let data;
      switch (selectedAlgorithm) {
        case 'SMA':
          data = await analyticsService.getSMA(selectedPair);
          break;
        case 'RSI':
          data = await analyticsService.getRSI(selectedPair);
          break;
        case 'BOLLINGER':
          data = await analyticsService.getBollingerBands(selectedPair);
          break;
        default:
          return;
      }
      
      if (data.success) {
        setIndicatorData(data.data);
      }
    } catch (error) {
      console.error('Error fetching indicator data:', error);
    }
  };

  const fetchAlgorithmComparison = async () => {
    try {
      const data = await analyticsService.compareAlgorithms('demo-user-id');
      if (data.success) {
        setAlgorithmComparison(data.data);
      }
    } catch (error) {
      console.error('Error fetching algorithm comparison:', error);
    }
  };

  const runBacktest = async () => {
    setLoading(true);
    try {
      const backtestData = {
        algorithm: selectedAlgorithm,
        parameters: getAlgorithmParameters(),
        currencyPair: selectedPair,
        startDate: '2025-01-01',
        endDate: '2025-09-20',
        initialCapital: 10000
      };
      
      const data = await analyticsService.runBacktest(backtestData);
      if (data.success) {
        setBacktestResults(data.data);
      }
    } catch (error) {
      console.error('Error running backtest:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAlgorithmParameters = () => {
    switch (selectedAlgorithm) {
      case 'SMA':
        return { fastPeriod: 10, slowPeriod: 20 };
      case 'RSI':
        return { period: 14, overbought: 70, oversold: 30 };
      case 'BOLLINGER':
        return { period: 20, stdDev: 2 };
      default:
        return {};
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const performanceMetrics = [
    { name: 'Total Return', value: `${performanceData.totalReturn || 0}%` },
    { name: 'Win Rate', value: `${performanceData.winRate || 0}%` },
    { name: 'Sharpe Ratio', value: performanceData.sharpeRatio || 0 },
    { name: 'Max Drawdown', value: `${performanceData.maxDrawdown || 0}%` },
  ];

  const pieChartData = [
    { name: 'Winning Trades', value: performanceData.winRate || 73, color: '#4caf50' },
    { name: 'Losing Trades', value: 100 - (performanceData.winRate || 73), color: '#f44336' },
  ];

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Analytics & Performance
      </Typography>

      <Paper elevation={2}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Performance Overview" />
          <Tab label="Technical Indicators" />
          <Tab label="Backtesting" />
          <Tab label="Algorithm Comparison" />
        </Tabs>

        {/* Performance Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {/* Key Metrics */}
            <Grid item xs={12} md={8}>
              <Grid container spacing={2}>
                {performanceMetrics.map((metric, index) => (
                  <Grid item xs={6} md={3} key={index}>
                    <Card>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography color="textSecondary" gutterBottom>
                          {metric.name}
                        </Typography>
                        <Typography variant="h5" color="primary">
                          {metric.value}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* Performance Chart */}
              <Paper sx={{ p: 2, mt: 3, height: 400 }}>
                <Typography variant="h6" gutterBottom>
                  Performance Trend
                </Typography>
                <ResponsiveContainer width="100%" height="90%">
                  <LineChart data={indicatorData.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="#1976d2"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Win/Loss Distribution */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, height: 'fit-content' }}>
                <Typography variant="h6" gutterBottom>
                  Win/Loss Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Technical Indicators Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <FormControl sx={{ minWidth: 120 }}>
                  <InputLabel>Currency Pair</InputLabel>
                  <Select
                    value={selectedPair}
                    label="Currency Pair"
                    onChange={(e) => setSelectedPair(e.target.value)}
                  >
                    <MenuItem value="EUR/USD">EUR/USD</MenuItem>
                    <MenuItem value="GBP/USD">GBP/USD</MenuItem>
                    <MenuItem value="USD/JPY">USD/JPY</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item>
                <FormControl sx={{ minWidth: 120 }}>
                  <InputLabel>Indicator</InputLabel>
                  <Select
                    value={selectedAlgorithm}
                    label="Indicator"
                    onChange={(e) => setSelectedAlgorithm(e.target.value)}
                  >
                    <MenuItem value="SMA">SMA</MenuItem>
                    <MenuItem value="RSI">RSI</MenuItem>
                    <MenuItem value="BOLLINGER">Bollinger Bands</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          <Paper sx={{ p: 2, height: 500 }}>
            <Typography variant="h6" gutterBottom>
              {selectedAlgorithm} - {selectedPair}
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={indicatorData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#1976d2"
                  strokeWidth={2}
                  name="Price"
                />
                {selectedAlgorithm === 'SMA' && (
                  <Line
                    type="monotone"
                    dataKey="sma"
                    stroke="#ff9800"
                    strokeWidth={2}
                    name="SMA"
                  />
                )}
                {selectedAlgorithm === 'RSI' && (
                  <Line
                    type="monotone"
                    dataKey="rsi"
                    stroke="#f44336"
                    strokeWidth={2}
                    name="RSI"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </TabPanel>

        {/* Backtesting Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ mb: 3 }}>
            <Button
              variant="contained"
              onClick={runBacktest}
              disabled={loading}
              sx={{ mr: 2 }}
            >
              {loading ? 'Running Backtest...' : 'Run Backtest'}
            </Button>
          </Box>

          {backtestResults && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Backtest Results
                    </Typography>
                    <TableContainer>
                      <Table>
                        <TableBody>
                          <TableRow>
                            <TableCell>Total Return</TableCell>
                            <TableCell>{backtestResults.results.totalReturn}%</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Win Rate</TableCell>
                            <TableCell>{backtestResults.results.winRate}%</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Total Trades</TableCell>
                            <TableCell>{backtestResults.results.totalTrades}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Profit Factor</TableCell>
                            <TableCell>{backtestResults.results.profitFactor}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Max Drawdown</TableCell>
                            <TableCell>{backtestResults.results.maxDrawdown}%</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </TabPanel>

        {/* Algorithm Comparison Tab */}
        <TabPanel value={tabValue} index={3}>
          {algorithmComparison.comparison && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Algorithm Performance Comparison
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={algorithmComparison.comparison}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="algorithm" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="totalReturn" fill="#1976d2" name="Total Return %" />
                  <Bar dataKey="winRate" fill="#4caf50" name="Win Rate %" />
                </BarChart>
              </ResponsiveContainer>
              
              <Typography variant="body1" sx={{ mt: 2 }}>
                <strong>Best Performer:</strong> {algorithmComparison.bestPerformer}
              </Typography>
            </Paper>
          )}
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default Analytics;
