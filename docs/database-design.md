# Database Design Document
## AlphaFx Trader - Supabase Schema

### 1. Database Overview

The AlphaFx Trader application uses Supabase (PostgreSQL) as the primary database system. The schema is designed to support user management, trading operations, market data storage, and analytics.

### 2. Entity Relationship Diagram

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    users    │    │   trades    │    │market_data  │
│─────────────│    │─────────────│    │─────────────│
│ id (PK)     │◄──►│ id (PK)     │    │ id (PK)     │
│ email       │    │ user_id (FK)│    │ timestamp   │
│ username    │    │ currency_pair│   │ base_currency│
│ created_at  │    │ side        │    │ rates       │
│ updated_at  │    │ quantity    │    │ created_at  │
│ profile     │    │ price       │    └─────────────┘
└─────────────┘    │ status      │
                   │ executed_at │    ┌─────────────┐
┌─────────────┐    │ algorithm   │    │ algorithms  │
│ positions   │    │ created_at  │    │─────────────│
│─────────────│    └─────────────┘    │ id (PK)     │
│ id (PK)     │                       │ name        │
│ user_id (FK)│◄─────────────────────►│ type        │
│ currency_pair│                      │ parameters  │
│ side        │    ┌─────────────┐    │ is_active   │
│ quantity    │    │performance  │    │ created_at  │
│ avg_price   │    │─────────────│    └─────────────┘
│ current_price│   │ id (PK)     │
│ unrealized_pnl│  │ user_id (FK)│
│ created_at  │    │ algorithm_id │
│ updated_at  │    │ period      │
└─────────────┘    │ total_return│
                   │ win_rate    │
                   │ max_drawdown│
                   │ created_at  │
                   └─────────────┘
```

### 3. Table Schemas

#### 3.1 Users Table
```sql
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

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_created_at ON users(created_at);
```

#### 3.2 Market Data Table
```sql
CREATE TABLE market_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    base_currency VARCHAR(3) NOT NULL,
    rates JSONB NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    source VARCHAR(50) DEFAULT 'exchangerate-api',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_market_data_timestamp ON market_data(timestamp DESC);
CREATE INDEX idx_market_data_base_currency ON market_data(base_currency);
CREATE INDEX idx_market_data_source ON market_data(source);

-- Sample data structure for rates JSONB:
-- {
--   "EUR": 0.8234,
--   "GBP": 0.7456,
--   "JPY": 149.32,
--   "CHF": 0.9145,
--   "AUD": 1.5287
-- }
```

#### 3.3 Trades Table
```sql
CREATE TABLE trades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    currency_pair VARCHAR(7) NOT NULL, -- e.g., 'EUR/USD'
    side VARCHAR(4) NOT NULL CHECK (side IN ('BUY', 'SELL')),
    quantity DECIMAL(15,2) NOT NULL,
    price DECIMAL(10,5) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'FILLED', 'CANCELLED', 'REJECTED')),
    algorithm VARCHAR(50), -- 'SMA', 'RSI', 'BOLLINGER', 'MANUAL'
    execution_type VARCHAR(20) DEFAULT 'MARKET' CHECK (execution_type IN ('MARKET', 'LIMIT', 'STOP')),
    stop_loss DECIMAL(10,5),
    take_profit DECIMAL(10,5),
    executed_at TIMESTAMP WITH TIME ZONE,
    commission DECIMAL(10,2) DEFAULT 0,
    swap DECIMAL(10,2) DEFAULT 0,
    profit_loss DECIMAL(15,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_trades_user_id ON trades(user_id);
CREATE INDEX idx_trades_currency_pair ON trades(currency_pair);
CREATE INDEX idx_trades_status ON trades(status);
CREATE INDEX idx_trades_algorithm ON trades(algorithm);
CREATE INDEX idx_trades_created_at ON trades(created_at DESC);
CREATE INDEX idx_trades_executed_at ON trades(executed_at DESC);
```

#### 3.4 Positions Table
```sql
CREATE TABLE positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    currency_pair VARCHAR(7) NOT NULL,
    side VARCHAR(4) NOT NULL CHECK (side IN ('BUY', 'SELL')),
    quantity DECIMAL(15,2) NOT NULL,
    avg_price DECIMAL(10,5) NOT NULL,
    current_price DECIMAL(10,5),
    unrealized_pnl DECIMAL(15,2),
    stop_loss DECIMAL(10,5),
    take_profit DECIMAL(10,5),
    is_open BOOLEAN DEFAULT true,
    opened_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    closed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_positions_user_id ON positions(user_id);
CREATE INDEX idx_positions_currency_pair ON positions(currency_pair);
CREATE INDEX idx_positions_is_open ON positions(is_open);
CREATE INDEX idx_positions_opened_at ON positions(opened_at DESC);
```

#### 3.5 Algorithms Table
```sql
CREATE TABLE algorithms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'SMA', 'RSI', 'BOLLINGER', 'ML'
    description TEXT,
    parameters JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT false,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    performance_metrics JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_algorithms_type ON algorithms(type);
CREATE INDEX idx_algorithms_is_active ON algorithms(is_active);
CREATE INDEX idx_algorithms_user_id ON algorithms(user_id);

-- Sample parameters JSONB structure:
-- SMA: {"fast_period": 10, "slow_period": 20, "currency_pair": "EUR/USD"}
-- RSI: {"period": 14, "overbought": 70, "oversold": 30}
-- BOLLINGER: {"period": 20, "std_dev": 2, "currency_pair": "GBP/USD"}
```

#### 3.6 Performance Table
```sql
CREATE TABLE performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    algorithm_id UUID REFERENCES algorithms(id) ON DELETE SET NULL,
    period VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly', 'yearly'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_trades INTEGER DEFAULT 0,
    winning_trades INTEGER DEFAULT 0,
    losing_trades INTEGER DEFAULT 0,
    win_rate DECIMAL(5,2), -- percentage
    total_return DECIMAL(15,2),
    max_drawdown DECIMAL(15,2),
    sharpe_ratio DECIMAL(10,4),
    profit_factor DECIMAL(10,4),
    avg_win DECIMAL(15,2),
    avg_loss DECIMAL(15,2),
    largest_win DECIMAL(15,2),
    largest_loss DECIMAL(15,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_performance_user_id ON performance(user_id);
CREATE INDEX idx_performance_algorithm_id ON performance(algorithm_id);
CREATE INDEX idx_performance_period ON performance(period);
CREATE INDEX idx_performance_start_date ON performance(start_date DESC);
```

#### 3.7 Audit Log Table
```sql
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_resource_type ON audit_log(resource_type);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at DESC);
```

### 4. Views and Stored Procedures

#### 4.1 Trading Summary View
```sql
CREATE VIEW trading_summary AS
SELECT 
    u.id as user_id,
    u.username,
    COUNT(t.id) as total_trades,
    COUNT(CASE WHEN t.profit_loss > 0 THEN 1 END) as winning_trades,
    COUNT(CASE WHEN t.profit_loss < 0 THEN 1 END) as losing_trades,
    ROUND(
        COUNT(CASE WHEN t.profit_loss > 0 THEN 1 END) * 100.0 / 
        NULLIF(COUNT(t.id), 0), 2
    ) as win_rate,
    SUM(COALESCE(t.profit_loss, 0)) as total_pnl,
    AVG(CASE WHEN t.profit_loss > 0 THEN t.profit_loss END) as avg_win,
    AVG(CASE WHEN t.profit_loss < 0 THEN t.profit_loss END) as avg_loss
FROM users u
LEFT JOIN trades t ON u.id = t.user_id AND t.status = 'FILLED'
GROUP BY u.id, u.username;
```

#### 4.2 Position Summary Function
```sql
CREATE OR REPLACE FUNCTION get_position_summary(p_user_id UUID)
RETURNS TABLE(
    currency_pair VARCHAR,
    total_quantity DECIMAL,
    avg_price DECIMAL,
    current_value DECIMAL,
    unrealized_pnl DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.currency_pair,
        SUM(CASE WHEN p.side = 'BUY' THEN p.quantity ELSE -p.quantity END) as total_quantity,
        AVG(p.avg_price) as avg_price,
        SUM(p.quantity * p.current_price) as current_value,
        SUM(p.unrealized_pnl) as unrealized_pnl
    FROM positions p
    WHERE p.user_id = p_user_id AND p.is_open = true
    GROUP BY p.currency_pair;
END;
$$ LANGUAGE plpgsql;
```

### 5. Security and Permissions

#### Row Level Security (RLS)
```sql
-- Enable RLS on sensitive tables
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY user_trades_policy ON trades
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY user_positions_policy ON positions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY user_performance_policy ON performance
    FOR ALL USING (auth.uid() = user_id);
```

### 6. Data Retention and Archival

- **Market Data**: Retain 2 years of historical data
- **Trades**: Permanent retention for regulatory compliance
- **Audit Logs**: Retain 7 years for compliance
- **Performance Data**: Permanent retention for analysis

### 7. Backup and Recovery

- **Automated Backups**: Daily full backups via Supabase
- **Point-in-Time Recovery**: 30-day recovery window
- **Disaster Recovery**: Cross-region replication

### 8. Performance Optimization

- **Indexing Strategy**: Optimized for query patterns
- **Partitioning**: Consider partitioning large tables by date
- **Query Optimization**: Regular EXPLAIN ANALYZE reviews
- **Connection Pooling**: Supabase built-in connection pooling

This database design provides a robust foundation for the AlphaFx Trader application with proper normalization, indexing, and security considerations.
