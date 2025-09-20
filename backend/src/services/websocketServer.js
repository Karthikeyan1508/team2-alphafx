const WebSocket = require('ws');
const axios = require('axios');

class WebSocketServer {
  constructor(port = process.env.WS_PORT || 8080) {
    this.port = port;
    this.wss = null;
    this.clients = new Map();
    this.marketDataInterval = null;
  }

  start() {
    this.wss = new WebSocket.Server({ port: this.port });
    
    this.wss.on('connection', (ws, req) => {
      const clientId = this.generateClientId();
      this.clients.set(clientId, {
        ws,
        subscriptions: new Set(),
        lastActivity: Date.now()
      });

      console.log(`WebSocket client connected: ${clientId}`);

      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          this.handleMessage(clientId, data);
        } catch (error) {
          console.error('Invalid JSON message:', error);
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Invalid JSON format'
          }));
        }
      });

      ws.on('close', () => {
        console.log(`WebSocket client disconnected: ${clientId}`);
        this.clients.delete(clientId);
      });

      ws.on('error', (error) => {
        console.error(`WebSocket error for client ${clientId}:`, error);
      });

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'welcome',
        clientId,
        message: 'Connected to AlphaFx Trader WebSocket'
      }));
    });

    // Start market data simulation
    this.startMarketDataStream();
    
    console.log(`🚀 WebSocket server running on port ${this.port}`);
  }

  handleMessage(clientId, data) {
    const client = this.clients.get(clientId);
    if (!client) return;

    client.lastActivity = Date.now();

    switch (data.action) {
      case 'subscribe':
        this.handleSubscription(clientId, data);
        break;
      case 'unsubscribe':
        this.handleUnsubscription(clientId, data);
        break;
      case 'ping':
        client.ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
        break;
      default:
        client.ws.send(JSON.stringify({
          type: 'error',
          message: 'Unknown action'
        }));
    }
  }

  handleSubscription(clientId, data) {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { type, pairs } = data;

    if (type === 'market_data' && Array.isArray(pairs)) {
      pairs.forEach(pair => {
        client.subscriptions.add(`market_data:${pair}`);
      });

      client.ws.send(JSON.stringify({
        type: 'subscription_success',
        subscribed: pairs,
        message: `Subscribed to market data for ${pairs.join(', ')}`
      }));
    }
  }

  handleUnsubscription(clientId, data) {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { type, pairs } = data;

    if (type === 'market_data' && Array.isArray(pairs)) {
      pairs.forEach(pair => {
        client.subscriptions.delete(`market_data:${pair}`);
      });

      client.ws.send(JSON.stringify({
        type: 'unsubscription_success',
        unsubscribed: pairs
      }));
    }
  }

  startMarketDataStream() {
    const currencyPairs = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD'];
    
    // Base prices for simulation
    const basePrices = {
      'EUR/USD': 1.0856,
      'GBP/USD': 1.2534,
      'USD/JPY': 149.32,
      'USD/CHF': 0.9145,
      'AUD/USD': 0.6542
    };

    this.marketDataInterval = setInterval(() => {
      currencyPairs.forEach(pair => {
        const basePrice = basePrices[pair];
        const variation = (Math.random() - 0.5) * 0.001; // ±0.1% variation
        const bid = basePrice + variation;
        const ask = bid + 0.0002; // 2 pip spread

        const marketData = {
          type: 'market_data',
          data: {
            pair,
            bid: parseFloat(bid.toFixed(5)),
            ask: parseFloat(ask.toFixed(5)),
            timestamp: new Date().toISOString(),
            change: variation > 0 ? 'up' : 'down'
          }
        };

        // Send to subscribed clients
        this.broadcast(`market_data:${pair}`, marketData);
      });
    }, 1000); // Update every second
  }

  broadcast(subscription, message) {
    this.clients.forEach((client, clientId) => {
      if (client.subscriptions.has(subscription) && client.ws.readyState === WebSocket.OPEN) {
        try {
          client.ws.send(JSON.stringify(message));
        } catch (error) {
          console.error(`Error sending to client ${clientId}:`, error);
          this.clients.delete(clientId);
        }
      }
    });
  }

  broadcastTradeUpdate(tradeData) {
    const message = {
      type: 'trade_update',
      data: tradeData
    };

    this.clients.forEach((client, clientId) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        try {
          client.ws.send(JSON.stringify(message));
        } catch (error) {
          console.error(`Error sending trade update to client ${clientId}:`, error);
        }
      }
    });
  }

  generateClientId() {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  stop() {
    if (this.marketDataInterval) {
      clearInterval(this.marketDataInterval);
    }

    if (this.wss) {
      this.wss.close();
    }

    console.log('WebSocket server stopped');
  }
}

module.exports = WebSocketServer;
