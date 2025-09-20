# System Architecture Document
## AlphaFx Trader - Forex Trading Application

### 1. Overview

AlphaFx Trader is a comprehensive forex trading platform built with modern web technologies to provide real-time market data streaming, algorithmic trading capabilities, and advanced analytics for forex traders.

### 2. High-Level Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend       │    │   External APIs │
│   React.js      │◄──►│   Node.js        │◄──►│   ExchangeRate  │
│   - Dashboard   │    │   Express.js     │    │   API           │
│   - Trading UI  │    │   - REST API     │    │                 │
│   - Analytics   │    │   - WebSocket    │    └─────────────────┘
│   - Charts      │    │   - Trading      │
└─────────────────┘    │     Logic        │    ┌─────────────────┐
                       │                  │◄──►│   Supabase      │
┌─────────────────┐    │                  │    │   PostgreSQL    │
│   WebSocket     │◄──►│                  │    │   - Users       │
│   Real-time     │    │                  │    │   - Trades      │
│   Data Stream   │    │                  │    │   - Market Data │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### 3. Component Architecture

#### 3.1 Frontend Components (React.js)
- **Dashboard**: Main trading dashboard with live data
- **Trading Interface**: Order execution and position management
- **Analytics**: Performance metrics and backtesting
- **Chart Components**: Real-time price visualization using Recharts
- **Navigation**: Responsive navigation and routing

#### 3.2 Backend Components (Node.js/Express.js)
- **API Gateway**: Central routing and request handling
- **Market Data Service**: External API integration and data processing
- **Trading Engine**: Order execution and position management
- **Analytics Engine**: Technical indicators and backtesting
- **WebSocket Server**: Real-time data streaming
- **Database Layer**: Supabase integration for data persistence

#### 3.3 External Integrations
- **ExchangeRate API**: Real-time forex data provider
- **Supabase**: Database and authentication services

### 4. Technology Stack

#### Frontend Stack:
- **Framework**: React.js 18.2.0
- **UI Library**: Material-UI (MUI) v5
- **Charts**: Recharts for data visualization
- **State Management**: React Query for server state
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Real-time**: Socket.IO Client
- **Notifications**: React Toastify

#### Backend Stack:
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js 4.18.2
- **Database**: Supabase (PostgreSQL)
- **Real-time**: WebSocket (ws library)
- **HTTP Client**: Axios
- **Security**: Helmet, CORS, Rate Limiting
- **Utilities**: Lodash, Moment.js, UUID

#### Development Tools:
- **Package Manager**: npm
- **Development Server**: Nodemon
- **Testing**: Jest, Supertest
- **Code Quality**: ESLint

### 5. Data Flow Architecture

#### 5.1 Market Data Flow
1. **External API** → Backend scheduled jobs fetch forex rates
2. **Backend** → Processes and stores data in Supabase
3. **WebSocket** → Streams real-time updates to frontend
4. **Frontend** → Updates charts and displays live data

#### 5.2 Trading Flow
1. **User Input** → Trading interface captures order details
2. **Frontend** → Sends trade request to backend API
3. **Backend** → Validates order and executes trade logic
4. **Database** → Stores trade history and positions
5. **WebSocket** → Broadcasts trade updates to all clients

#### 5.3 Analytics Flow
1. **Historical Data** → Retrieved from database
2. **Technical Indicators** → Calculated using trading algorithms
3. **Backtesting** → Performance analysis against historical data
4. **Results** → Displayed in analytics dashboard

### 6. Security Architecture

- **API Rate Limiting**: Protection against abuse
- **CORS Configuration**: Controlled cross-origin requests
- **Helmet Security**: HTTP headers security
- **Input Validation**: Request data sanitization
- **Environment Variables**: Secure configuration management

### 7. Scalability Considerations

- **Modular Architecture**: Loosely coupled components
- **Database Optimization**: Efficient queries and indexing
- **Caching Strategy**: Redis integration for future scaling
- **Load Balancing**: Horizontal scaling capabilities
- **Microservices Ready**: Service separation for scaling

### 8. Deployment Architecture

#### Development Environment:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`
- WebSocket: `ws://localhost:8080`

#### Production Environment:
- Frontend: Static hosting (Vercel/Netlify)
- Backend: Cloud hosting (AWS/GCP/Azure)
- Database: Supabase cloud
- CDN: Asset delivery optimization

### 9. Monitoring and Logging

- **Application Logging**: Morgan for HTTP request logging
- **Error Tracking**: Centralized error handling
- **Performance Monitoring**: Response time tracking
- **Health Checks**: `/health` endpoint for service monitoring

### 10. Future Enhancements

- **Machine Learning**: Predictive trading algorithms
- **Multi-Exchange Support**: Additional data providers
- **Mobile Application**: React Native implementation
- **Advanced Analytics**: Custom indicator development
- **Social Trading**: Copy trading features

### 11. Risk Management

- **Trading Limits**: Configurable position size limits
- **Stop Loss**: Automated risk management
- **Circuit Breakers**: Trading halt mechanisms
- **Audit Trail**: Complete transaction logging

This architecture provides a solid foundation for the AlphaFx Trader application with room for growth and scalability as the platform evolves.
