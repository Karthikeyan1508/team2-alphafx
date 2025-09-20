import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  Divider,
  Slider,
  TextField,
  Button,
  Alert,
} from '@mui/material';
import { tradingService } from '../services/api';
import { toast } from 'react-toastify';

const Settings = () => {
  const [algorithmSettings, setAlgorithmSettings] = useState({
    tradingEnabled: true,
    smaEnabled: true,
    rsiEnabled: false,
    bollingerEnabled: true,
  });

  const [riskSettings, setRiskSettings] = useState({
    maxPositionSize: 50000,
    stopLossPercentage: 2.0,
    takeProfitPercentage: 4.0,
    maxDailyLoss: 1000,
    riskPerTrade: 1.0,
  });

  const [algorithmParameters, setAlgorithmParameters] = useState({
    sma: {
      fastPeriod: 10,
      slowPeriod: 20,
    },
    rsi: {
      period: 14,
      overbought: 70,
      oversold: 30,
    },
    bollinger: {
      period: 20,
      standardDeviation: 2.0,
    },
  });

  const [volumeLimits, setVolumeLimits] = useState({
    current: 5250000,
    maximum: 10000000,
  });

  useEffect(() => {
    fetchAlgorithmStatus();
  }, []);

  const fetchAlgorithmStatus = async () => {
    try {
      const data = await tradingService.getAlgorithmsStatus();
      if (data.success) {
        setVolumeLimits({
          current: data.data.totalVolume,
          maximum: data.data.volumeLimit,
        });
        setAlgorithmSettings(prev => ({
          ...prev,
          tradingEnabled: data.data.tradingEnabled,
        }));
      }
    } catch (error) {
      console.error('Error fetching algorithm status:', error);
    }
  };

  const handleAlgorithmToggle = async (algorithm) => {
    const newState = !algorithmSettings[algorithm];
    
    try {
      await tradingService.controlAlgorithms(newState ? 'start' : 'stop', {
        algorithmTypes: [algorithm.toUpperCase()],
      });
      
      setAlgorithmSettings(prev => ({
        ...prev,
        [algorithm]: newState,
      }));
      
      toast.success(`${algorithm.toUpperCase()} algorithm ${newState ? 'started' : 'stopped'}`);
    } catch (error) {
      console.error(`Error toggling ${algorithm}:`, error);
      toast.error(`Failed to ${newState ? 'start' : 'stop'} ${algorithm} algorithm`);
    }
  };

  const handleRiskSettingChange = (setting, value) => {
    setRiskSettings(prev => ({
      ...prev,
      [setting]: value,
    }));
  };

  const handleParameterChange = (algorithm, parameter, value) => {
    setAlgorithmParameters(prev => ({
      ...prev,
      [algorithm]: {
        ...prev[algorithm],
        [parameter]: value,
      },
    }));
  };

  const saveSettings = () => {
    // In a real implementation, this would save to backend
    toast.success('Settings saved successfully!');
    console.log('Saving settings:', {
      algorithmSettings,
      riskSettings,
      algorithmParameters,
    });
  };

  const resetToDefaults = () => {
    setAlgorithmSettings({
      tradingEnabled: true,
      smaEnabled: true,
      rsiEnabled: false,
      bollingerEnabled: true,
    });
    
    setRiskSettings({
      maxPositionSize: 50000,
      stopLossPercentage: 2.0,
      takeProfitPercentage: 4.0,
      maxDailyLoss: 1000,
      riskPerTrade: 1.0,
    });
    
    setAlgorithmParameters({
      sma: { fastPeriod: 10, slowPeriod: 20 },
      rsi: { period: 14, overbought: 70, oversold: 30 },
      bollinger: { period: 20, standardDeviation: 2.0 },
    });
    
    toast.info('Settings reset to defaults');
  };

  const volumeUsagePercentage = (volumeLimits.current / volumeLimits.maximum) * 100;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Trading Settings
      </Typography>

      <Grid container spacing={3}>
        {/* Algorithm Controls */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Algorithm Controls
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={algorithmSettings.tradingEnabled}
                  onChange={(e) => setAlgorithmSettings(prev => ({
                    ...prev,
                    tradingEnabled: e.target.checked
                  }))}
                  color="primary"
                />
              }
              label="Master Trading Switch"
              sx={{ mb: 2 }}
            />
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ pl: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={algorithmSettings.smaEnabled}
                    onChange={() => handleAlgorithmToggle('smaEnabled')}
                    disabled={!algorithmSettings.tradingEnabled}
                  />
                }
                label="SMA Crossover Strategy"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={algorithmSettings.rsiEnabled}
                    onChange={() => handleAlgorithmToggle('rsiEnabled')}
                    disabled={!algorithmSettings.tradingEnabled}
                  />
                }
                label="RSI Strategy"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={algorithmSettings.bollingerEnabled}
                    onChange={() => handleAlgorithmToggle('bollingerEnabled')}
                    disabled={!algorithmSettings.tradingEnabled}
                  />
                }
                label="Bollinger Bands Strategy"
              />
            </Box>
          </Paper>
        </Grid>

        {/* Volume Limits */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Trading Volume Status
            </Typography>
            
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="body2" color="textSecondary">
                  Current Volume
                </Typography>
                <Typography variant="h5" color="primary">
                  ${volumeLimits.current.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
            
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="body2" color="textSecondary">
                  Volume Limit
                </Typography>
                <Typography variant="h5">
                  ${volumeLimits.maximum.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
            
            <Box sx={{ width: '100%' }}>
              <Typography variant="body2" gutterBottom>
                Volume Usage: {volumeUsagePercentage.toFixed(1)}%
              </Typography>
              <Slider
                value={volumeUsagePercentage}
                disabled
                sx={{
                  color: volumeUsagePercentage > 80 ? 'error.main' : 'primary.main',
                }}
              />
            </Box>
            
            {volumeUsagePercentage > 90 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Trading volume is approaching the daily limit!
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* Risk Management */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Risk Management Settings
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Max Position Size"
                  type="number"
                  value={riskSettings.maxPositionSize}
                  onChange={(e) => handleRiskSettingChange('maxPositionSize', parseInt(e.target.value))}
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Default Stop Loss (%)"
                  type="number"
                  value={riskSettings.stopLossPercentage}
                  onChange={(e) => handleRiskSettingChange('stopLossPercentage', parseFloat(e.target.value))}
                  inputProps={{ step: 0.1, min: 0.1, max: 10 }}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Default Take Profit (%)"
                  type="number"
                  value={riskSettings.takeProfitPercentage}
                  onChange={(e) => handleRiskSettingChange('takeProfitPercentage', parseFloat(e.target.value))}
                  inputProps={{ step: 0.1, min: 0.1, max: 20 }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Max Daily Loss"
                  type="number"
                  value={riskSettings.maxDailyLoss}
                  onChange={(e) => handleRiskSettingChange('maxDailyLoss', parseInt(e.target.value))}
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Risk Per Trade (%)"
                  type="number"
                  value={riskSettings.riskPerTrade}
                  onChange={(e) => handleRiskSettingChange('riskPerTrade', parseFloat(e.target.value))}
                  inputProps={{ step: 0.1, min: 0.1, max: 5 }}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Algorithm Parameters */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Algorithm Parameters
            </Typography>
            
            <Grid container spacing={3}>
              {/* SMA Parameters */}
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      SMA Crossover
                    </Typography>
                    <TextField
                      fullWidth
                      label="Fast Period"
                      type="number"
                      value={algorithmParameters.sma.fastPeriod}
                      onChange={(e) => handleParameterChange('sma', 'fastPeriod', parseInt(e.target.value))}
                      sx={{ mb: 2 }}
                      inputProps={{ min: 1, max: 50 }}
                    />
                    <TextField
                      fullWidth
                      label="Slow Period"
                      type="number"
                      value={algorithmParameters.sma.slowPeriod}
                      onChange={(e) => handleParameterChange('sma', 'slowPeriod', parseInt(e.target.value))}
                      inputProps={{ min: 1, max: 100 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
              
              {/* RSI Parameters */}
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      RSI Strategy
                    </Typography>
                    <TextField
                      fullWidth
                      label="RSI Period"
                      type="number"
                      value={algorithmParameters.rsi.period}
                      onChange={(e) => handleParameterChange('rsi', 'period', parseInt(e.target.value))}
                      sx={{ mb: 2 }}
                      inputProps={{ min: 2, max: 50 }}
                    />
                    <TextField
                      fullWidth
                      label="Overbought Level"
                      type="number"
                      value={algorithmParameters.rsi.overbought}
                      onChange={(e) => handleParameterChange('rsi', 'overbought', parseInt(e.target.value))}
                      sx={{ mb: 2 }}
                      inputProps={{ min: 50, max: 90 }}
                    />
                    <TextField
                      fullWidth
                      label="Oversold Level"
                      type="number"
                      value={algorithmParameters.rsi.oversold}
                      onChange={(e) => handleParameterChange('rsi', 'oversold', parseInt(e.target.value))}
                      inputProps={{ min: 10, max: 50 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Bollinger Bands Parameters */}
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Bollinger Bands
                    </Typography>
                    <TextField
                      fullWidth
                      label="Period"
                      type="number"
                      value={algorithmParameters.bollinger.period}
                      onChange={(e) => handleParameterChange('bollinger', 'period', parseInt(e.target.value))}
                      sx={{ mb: 2 }}
                      inputProps={{ min: 5, max: 50 }}
                    />
                    <TextField
                      fullWidth
                      label="Standard Deviation"
                      type="number"
                      value={algorithmParameters.bollinger.standardDeviation}
                      onChange={(e) => handleParameterChange('bollinger', 'standardDeviation', parseFloat(e.target.value))}
                      inputProps={{ step: 0.1, min: 0.1, max: 5 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Action Buttons */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={saveSettings}
            >
              Save Settings
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={resetToDefaults}
            >
              Reset to Defaults
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Settings;
