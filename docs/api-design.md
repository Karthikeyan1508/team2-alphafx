# API Design Document
## AlphaFx Trader - REST API Specification

### 1. API Overview

The AlphaFx Trader API provides comprehensive endpoints for forex trading operations, market data access, user management, and analytics. The API follows RESTful principles and returns JSON responses.

**Base URL**: `http://localhost:5000/api` (Development)
**Base URL**: `https://api.alphafx-trader.com/api` (Production)

### 2. Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

### 3. Common Response Format

#### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation successful"
}
```

#### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    // Additional error details
  }
}
```

### 4. API Endpoints

## 4.1 Market Data Endpoints

### GET /api/market/rates/:baseCurrency?
Get current exchange rates for a base currency.

**Parameters:**
- `baseCurrency` (optional): Base currency code (default: USD)

**Response:**
```json
{
  "success": true,
  "data": {
    "base": "USD",
    "rates": {
      "EUR": 0.8234,
      "GBP": 0.7456,
      "JPY": 149.32,
      "CHF": 0.9145
    },
    "timestamp": "2025-09-20T10:30:00Z"
  }
}
```

### GET /api/market/historical/:currencyPair
Get historical data for a currency pair.

**Parameters:**
- `currencyPair`: Currency pair (e.g., "EUR/USD")
- `days` (query): Number of days of history (default: 30)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "timestamp": "2025-09-19T00:00:00Z",
      "open": 1.0845,
      "high": 1.0862,
      "low": 1.0831,
      "close": 1.0856,
      "volume": 125000
    }
  ],
  "currencyPair": "EUR/USD",
  "period": "30 days"
}
```

### GET /api/market/stream/info
Get WebSocket streaming information.

**Response:**
```json
{
  "success": true,
  "data": {
    "wsUrl": "ws://localhost:8080",
    "supportedPairs": ["EUR/USD", "GBP/USD", "USD/JPY"],
    "updateInterval": "1s"
  }
}
```

### GET /api/market/currencies
Get supported currency codes.

**Response:**
```json
{
  "success": true,
  "data": [
    ["USD", "United States Dollar"],
    ["EUR", "Euro"],
    ["GBP", "British Pound Sterling"]
  ]
}
```

## 4.2 Trading Endpoints

### POST /api/trading/execute
Execute a new trade.

**Request Body:**
```json
{
  "currencyPair": "EUR/USD",
  "side": "BUY",
  "quantity": 10000,
  "executionType": "MARKET",
  "stopLoss": 1.0800,
  "takeProfit": 1.0900,
  "algorithm": "MANUAL"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tradeId": "uuid-trade-id",
    "status": "FILLED",
    "executedPrice": 1.0856,
    "executedAt": "2025-09-20T10:30:15Z"
  }
}
```

### GET /api/trading/history/:userId
Get trading history for a user.

**Parameters:**
- `userId`: User ID
- `limit` (query): Number of records (default: 50)
- `offset` (query): Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-trade-id",
      "currencyPair": "EUR/USD",
      "side": "BUY",
      "quantity": 10000,
      "price": 1.0856,
      "status": "FILLED",
      "profitLoss": 234.50,
      "executedAt": "2025-09-20T10:30:15Z"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 50,
    "offset": 0
  }
}
```

### GET /api/trading/positions/:userId
Get current open positions.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-position-id",
      "currencyPair": "EUR/USD",
      "side": "BUY",
      "quantity": 10000,
      "avgPrice": 1.0845,
      "currentPrice": 1.0856,
      "unrealizedPnl": 110.00,
      "openedAt": "2025-09-20T09:15:00Z"
    }
  ]
}
```

### GET /api/trading/algorithms/status
Get algorithmic trading status.

**Response:**
```json
{
  "success": true,
  "data": {
    "tradingEnabled": true,
    "totalVolume": 5250000,
    "volumeLimit": 10000000,
    "activeAlgorithms": [
      {
        "name": "SMA Crossover",
        "type": "SMA",
        "isActive": true,
        "performance": {
          "trades": 45,
          "winRate": 73.3,
          "profit": 12450.50
        }
      }
    ]
  }
}
```

### POST /api/trading/algorithms/:action
Start or stop algorithmic trading.

**Parameters:**
- `action`: "start" or "stop"

**Request Body:**
```json
{
  "algorithmTypes": ["SMA", "RSI"],
  "currencyPairs": ["EUR/USD", "GBP/USD"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "action": "start",
    "algorithmsAffected": 2,
    "status": "Algorithmic trading started"
  }
}
```

### GET /api/trading/trade/:tradeId
Get specific trade details.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-trade-id",
    "currencyPair": "EUR/USD",
    "side": "BUY",
    "quantity": 10000,
    "requestedPrice": 1.0850,
    "executedPrice": 1.0856,
    "status": "FILLED",
    "algorithm": "SMA",
    "commission": 2.50,
    "swap": 0.75,
    "profitLoss": 234.50,
    "notes": "SMA crossover signal",
    "createdAt": "2025-09-20T10:29:45Z",
    "executedAt": "2025-09-20T10:30:15Z"
  }
}
```

## 4.3 User Management Endpoints

### POST /api/users/register
Register a new user.

**Request Body:**
```json
{
  "email": "trader@example.com",
  "username": "trader123",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "uuid-user-id",
    "email": "trader@example.com",
    "username": "trader123",
    "token": "jwt-token-here"
  }
}
```

### POST /api/users/login
User authentication.

**Request Body:**
```json
{
  "email": "trader@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "uuid-user-id",
    "email": "trader@example.com",
    "username": "trader123",
    "token": "jwt-token-here",
    "expiresAt": "2025-09-21T10:30:00Z"
  }
}
```

### GET /api/users/profile/:userId
Get user profile information.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-user-id",
    "email": "trader@example.com",
    "username": "trader123",
    "firstName": "John",
    "lastName": "Doe",
    "profile": {
      "timezone": "UTC",
      "currency": "USD",
      "riskTolerance": "MEDIUM"
    },
    "createdAt": "2025-09-01T00:00:00Z"
  }
}
```

### PUT /api/users/profile/:userId
Update user profile.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "profile": {
    "timezone": "EST",
    "currency": "USD",
    "riskTolerance": "LOW"
  }
}
```

### GET /api/users/dashboard/:userId
Get user dashboard data.

**Response:**
```json
{
  "success": true,
  "data": {
    "portfolioValue": 125430.50,
    "todaysPnl": 2340.75,
    "activeTrades": 8,
    "winRate": 73.2,
    "totalTrades": 156,
    "performance": {
      "daily": 1.87,
      "weekly": 3.45,
      "monthly": 12.34
    }
  }
}
```

## 4.4 Analytics Endpoints

### GET /api/analytics/performance/:userId
Get detailed performance analytics.

**Parameters:**
- `period` (query): "daily", "weekly", "monthly" (default: "monthly")
- `algorithm` (query): Filter by algorithm type

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "monthly",
    "totalReturn": 12.34,
    "winRate": 73.2,
    "maxDrawdown": -2.45,
    "sharpeRatio": 1.87,
    "profitFactor": 2.34,
    "tradingDays": 20,
    "totalTrades": 45,
    "avgWin": 523.45,
    "avgLoss": -245.67
  }
}
```

### POST /api/analytics/backtest
Run backtesting analysis.

**Request Body:**
```json
{
  "algorithm": "SMA",
  "parameters": {
    "fastPeriod": 10,
    "slowPeriod": 20
  },
  "currencyPair": "EUR/USD",
  "startDate": "2025-01-01",
  "endDate": "2025-09-20",
  "initialCapital": 10000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "backtestId": "uuid-backtest-id",
    "results": {
      "totalReturn": 15.67,
      "winRate": 68.4,
      "maxDrawdown": -3.21,
      "totalTrades": 89,
      "profitFactor": 2.12,
      "sharpeRatio": 1.45
    },
    "trades": [
      {
        "date": "2025-01-15",
        "side": "BUY",
        "price": 1.0845,
        "quantity": 1000,
        "pnl": 45.67
      }
    ]
  }
}
```

### GET /api/analytics/indicators/sma/:currencyPair
Get Simple Moving Average data.

**Parameters:**
- `period` (query): SMA period (default: 20)
- `days` (query): Number of days (default: 30)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "timestamp": "2025-09-20T00:00:00Z",
      "price": 1.0856,
      "sma": 1.0848,
      "signal": "BUY"
    }
  ]
}
```

### GET /api/analytics/indicators/rsi/:currencyPair
Get Relative Strength Index data.

**Parameters:**
- `period` (query): RSI period (default: 14)
- `days` (query): Number of days (default: 30)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "timestamp": "2025-09-20T00:00:00Z",
      "price": 1.0856,
      "rsi": 45.67,
      "signal": "NEUTRAL"
    }
  ]
}
```

### GET /api/analytics/indicators/bollinger/:currencyPair
Get Bollinger Bands data.

**Parameters:**
- `period` (query): Period (default: 20)
- `stdDev` (query): Standard deviation (default: 2)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "timestamp": "2025-09-20T00:00:00Z",
      "price": 1.0856,
      "upperBand": 1.0890,
      "middleBand": 1.0850,
      "lowerBand": 1.0810,
      "signal": "BUY"
    }
  ]
}
```

### GET /api/analytics/compare/:userId
Compare algorithm performance.

**Response:**
```json
{
  "success": true,
  "data": {
    "comparison": [
      {
        "algorithm": "SMA",
        "totalReturn": 12.34,
        "winRate": 73.2,
        "maxDrawdown": -2.45,
        "trades": 45
      },
      {
        "algorithm": "RSI",
        "totalReturn": 8.67,
        "winRate": 68.4,
        "maxDrawdown": -3.21,
        "trades": 38
      }
    ],
    "bestPerformer": "SMA"
  }
}
```

## 5. WebSocket API

### Connection
```javascript
const ws = new WebSocket('ws://localhost:8080');
```

### Subscribe to Market Data
```json
{
  "action": "subscribe",
  "type": "market_data",
  "pairs": ["EUR/USD", "GBP/USD"]
}
```

### Market Data Stream
```json
{
  "type": "market_data",
  "data": {
    "pair": "EUR/USD",
    "bid": 1.0854,
    "ask": 1.0856,
    "timestamp": "2025-09-20T10:30:15Z"
  }
}
```

### Trade Updates
```json
{
  "type": "trade_update",
  "data": {
    "tradeId": "uuid-trade-id",
    "status": "FILLED",
    "executedPrice": 1.0856,
    "timestamp": "2025-09-20T10:30:15Z"
  }
}
```

## 6. Error Codes

| Code | Description |
|------|-------------|
| `AUTH_REQUIRED` | Authentication required |
| `INVALID_TOKEN` | Invalid or expired token |
| `INSUFFICIENT_FUNDS` | Insufficient account balance |
| `INVALID_PAIR` | Unsupported currency pair |
| `MARKET_CLOSED` | Market is currently closed |
| `VOLUME_LIMIT_EXCEEDED` | Trading volume limit exceeded |
| `VALIDATION_ERROR` | Request validation failed |
| `RATE_LIMIT_EXCEEDED` | API rate limit exceeded |
| `INTERNAL_ERROR` | Internal server error |

## 7. Rate Limits

- **General API**: 100 requests per 15 minutes per IP
- **Market Data**: 1000 requests per hour per API key
- **Trading**: 50 trades per minute per user
- **WebSocket**: 10 connections per user

## 8. API Versioning

The API uses URL versioning:
- `/api/v1/` - Current version
- `/api/v2/` - Future version

This API design provides comprehensive coverage of all forex trading operations while maintaining REST principles and clear documentation.
