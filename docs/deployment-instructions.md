# Deployment Instructions
## AlphaFx Trader - Setup and Deployment Guide

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager
- Supabase account
- ExchangeRate API key
- Git

### 1. Environment Setup

#### 1.1 Clone and Setup Project
```powershell
# Clone the repository
git clone <repository-url>
cd alphafx-trader

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

#### 1.2 Environment Configuration
```powershell
# Backend environment setup
cd backend
cp .env.example .env
```

Edit `.env` file with your configuration:
```
NODE_ENV=development
PORT=5000
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
EXCHANGE_API_KEY=your_exchange_api_key
EXCHANGE_API_URL=https://v6.exchangerate-api.com/v6
MAX_TRADING_VOLUME=10000000
TRADING_ENABLED=true
WS_PORT=8080
JWT_SECRET=your_jwt_secret
API_RATE_LIMIT=100
```

### 2. Supabase Setup

#### 2.1 Create Supabase Project
1. Go to https://supabase.com
2. Create new project
3. Note down your URL and keys

#### 2.2 Database Schema Setup
Run the following SQL in Supabase SQL editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    profile JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Market data table
CREATE TABLE market_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    base_currency VARCHAR(3) NOT NULL,
    rates JSONB NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    source VARCHAR(50) DEFAULT 'exchangerate-api',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Additional tables as per database design document...
```

### 3. ExchangeRate API Setup

#### 3.1 Get API Key
1. Visit https://www.exchangerate-api.com/
2. Sign up for free account
3. Get your API key
4. Add to environment variables

### 4. Development Setup

#### 4.1 Start Backend Server
```powershell
cd backend
npm run dev
```
Backend will start at http://localhost:5000

#### 4.2 Start Frontend Server
```powershell
cd frontend
npm start
```
Frontend will start at http://localhost:3000

#### 4.3 Test the Setup
- Visit http://localhost:3000
- Check API health: http://localhost:5000/health
- Verify database connection in Supabase dashboard

### 5. Production Deployment

#### 5.1 Frontend Deployment (Vercel)
```powershell
# Install Vercel CLI
npm install -g vercel

# Deploy frontend
cd frontend
vercel --prod
```

#### 5.2 Backend Deployment (Railway/Heroku)
```powershell
# For Railway
npm install -g @railway/cli
railway login
railway init
railway up

# Or for Heroku
heroku create alphafx-trader-api
git push heroku main
```

### 6. Production Environment Variables

#### Backend (.env.production)
```
NODE_ENV=production
PORT=5000
SUPABASE_URL=your_production_supabase_url
SUPABASE_ANON_KEY=your_production_supabase_key
SUPABASE_SERVICE_KEY=your_production_service_key
EXCHANGE_API_KEY=your_exchange_api_key
EXCHANGE_API_URL=https://v6.exchangerate-api.com/v6
MAX_TRADING_VOLUME=10000000
TRADING_ENABLED=true
WS_PORT=8080
JWT_SECRET=strong_production_jwt_secret
API_RATE_LIMIT=100
```

#### Frontend (.env.production)
```
REACT_APP_API_URL=https://your-api-domain.com/api
REACT_APP_WS_URL=wss://your-api-domain.com
```

### 7. Monitoring and Logging

#### 7.1 Health Checks
- API Health: `GET /health`
- Database Health: Monitor Supabase dashboard
- Trading Status: `GET /api/trading/algorithms/status`

#### 7.2 Log Monitoring
```javascript
// Add to production logging
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### 8. Security Checklist

- [ ] Environment variables secured
- [ ] API rate limiting enabled
- [ ] CORS configured properly
- [ ] Helmet security headers enabled
- [ ] JWT secrets are strong
- [ ] Database RLS policies enabled
- [ ] HTTPS enabled in production
- [ ] Input validation implemented

### 9. Performance Optimization

#### 9.1 Backend Optimization
- Enable gzip compression
- Implement Redis caching
- Database query optimization
- Connection pooling

#### 9.2 Frontend Optimization
- Code splitting
- Lazy loading
- Image optimization
- CDN usage

### 10. Troubleshooting

#### Common Issues:

**Backend won't start:**
```powershell
# Check Node version
node --version  # Should be 18+

# Check environment variables
echo $SUPABASE_URL

# Check dependencies
npm install
```

**Database connection issues:**
- Verify Supabase URL and keys
- Check network connectivity
- Ensure database schema is created

**API rate limiting:**
- Check ExchangeRate API quota
- Verify API key is valid
- Consider upgrading API plan

**Frontend build issues:**
```powershell
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check environment variables
echo $REACT_APP_API_URL
```

### 11. Scaling Considerations

#### Horizontal Scaling
- Load balancer configuration
- Multiple backend instances
- Database read replicas
- Redis clustering

#### Performance Monitoring
- Response time tracking
- Database query monitoring
- Memory and CPU usage
- Error rate monitoring

This deployment guide provides comprehensive instructions for setting up the AlphaFx Trader application in both development and production environments.
