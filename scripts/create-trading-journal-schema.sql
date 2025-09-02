-- Create comprehensive trading journal schema
-- This script creates tables for tracking trades, performance, and analysis

-- Drop existing tables if they exist
DROP TABLE IF EXISTS trading_journal_trade_tags;
DROP TABLE IF EXISTS trading_journal_notes;
DROP TABLE IF EXISTS trading_journal_checklist_items;
DROP TABLE IF EXISTS trading_journal_performance_metrics;
DROP TABLE IF EXISTS trading_journal_trades;
DROP TABLE IF EXISTS trading_journal_strategies;
DROP TABLE IF EXISTS trading_journal_categories;
DROP TABLE IF EXISTS trading_journal_tags;
DROP TABLE IF EXISTS trading_journal_checklists;
DROP TABLE IF EXISTS trading_journal_goals;

-- Create trading strategies table
CREATE TABLE trading_journal_strategies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    entry_rules TEXT,
    exit_rules TEXT,
    risk_management_rules TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create trading categories table
CREATE TABLE trading_journal_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#3B82F6',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create trading tags table
CREATE TABLE trading_journal_tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(7) DEFAULT '#6B7280',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create main trades table
CREATE TABLE trading_journal_trades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
    trade_id VARCHAR(50) UNIQUE NOT NULL, -- User-defined trade identifier
    symbol VARCHAR(20) NOT NULL,
    instrument_type ENUM('stock', 'forex', 'crypto', 'commodity', 'index', 'option', 'future') NOT NULL,
    direction ENUM('long', 'short') NOT NULL,
    
    -- Entry details
    entry_price DECIMAL(15,6) NOT NULL,
    entry_time DATETIME NOT NULL,
    entry_reason TEXT,
    entry_confidence ENUM('low', 'medium', 'high') DEFAULT 'medium',
    
    -- Exit details
    exit_price DECIMAL(15,6),
    exit_time DATETIME,
    exit_reason TEXT,
    exit_confidence ENUM('low', 'medium', 'high'),
    
    -- Position details
    position_size DECIMAL(15,6) NOT NULL,
    position_size_currency VARCHAR(3) DEFAULT 'USD',
    leverage DECIMAL(5,2) DEFAULT 1.00,
    
    -- Risk management
    stop_loss DECIMAL(15,6),
    take_profit DECIMAL(15,6),
    risk_amount DECIMAL(15,6),
    risk_percentage DECIMAL(5,2),
    
    -- Performance
    pnl_amount DECIMAL(15,6),
    pnl_percentage DECIMAL(8,4),
    max_profit DECIMAL(15,6),
    max_loss DECIMAL(15,6),
    
    -- Analysis
    strategy_id INT,
    category_id INT,
    market_condition ENUM('trending', 'ranging', 'volatile', 'sideways') DEFAULT 'trending',
    trade_setup_quality ENUM('poor', 'fair', 'good', 'excellent') DEFAULT 'fair',
    execution_quality ENUM('poor', 'fair', 'good', 'excellent') DEFAULT 'fair',
    
    -- Status
    status ENUM('open', 'closed', 'cancelled') DEFAULT 'open',
    is_winning BOOLEAN,
    
    -- Metadata
    notes TEXT,
    lessons_learned TEXT,
    next_time_actions TEXT,
    screenshots JSON, -- URLs to trade screenshots
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (strategy_id) REFERENCES trading_journal_strategies(id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES trading_journal_categories(id) ON DELETE SET NULL
);

-- Create trade tags relationship table
CREATE TABLE trading_journal_trade_tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trade_id INT NOT NULL,
    tag_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trade_id) REFERENCES trading_journal_trades(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES trading_journal_tags(id) ON DELETE CASCADE,
    UNIQUE KEY unique_trade_tag (trade_id, tag_id)
);

-- Create trade notes table
CREATE TABLE trading_journal_notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trade_id INT NOT NULL,
    user_id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
    note_type ENUM('pre_trade', 'during_trade', 'post_trade', 'analysis') NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (trade_id) REFERENCES trading_journal_trades(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create trading checklists table
CREATE TABLE trading_journal_checklists (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    checklist_type ENUM('pre_trade', 'during_trade', 'post_trade', 'weekly', 'monthly') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create checklist items table
CREATE TABLE trading_journal_checklist_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    checklist_id INT NOT NULL,
    item_text VARCHAR(255) NOT NULL,
    is_required BOOLEAN DEFAULT FALSE,
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (checklist_id) REFERENCES trading_journal_checklists(id) ON DELETE CASCADE
);

-- Create trading goals table
CREATE TABLE trading_journal_goals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    goal_type ENUM('daily', 'weekly', 'monthly', 'quarterly', 'yearly') NOT NULL,
    target_value DECIMAL(15,6),
    current_value DECIMAL(15,6) DEFAULT 0,
    target_date DATE,
    status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create performance metrics table
CREATE TABLE trading_journal_performance_metrics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
    period_type ENUM('daily', 'weekly', 'monthly', 'quarterly', 'yearly') NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Trade statistics
    total_trades INT DEFAULT 0,
    winning_trades INT DEFAULT 0,
    losing_trades INT DEFAULT 0,
    win_rate DECIMAL(5,2) DEFAULT 0,
    
    -- Performance metrics
    total_pnl DECIMAL(15,6) DEFAULT 0,
    average_win DECIMAL(15,6) DEFAULT 0,
    average_loss DECIMAL(15,6) DEFAULT 0,
    largest_win DECIMAL(15,6) DEFAULT 0,
    largest_loss DECIMAL(15,6) DEFAULT 0,
    
    -- Risk metrics
    profit_factor DECIMAL(8,4) DEFAULT 0,
    risk_reward_ratio DECIMAL(8,4) DEFAULT 0,
    max_drawdown DECIMAL(15,6) DEFAULT 0,
    sharpe_ratio DECIMAL(8,4) DEFAULT 0,
    
    -- Time metrics
    average_trade_duration INT DEFAULT 0, -- in minutes
    total_trading_time INT DEFAULT 0, -- in minutes
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_period (user_id, period_type, period_start)
);

-- Insert default categories
INSERT INTO trading_journal_categories (user_id, name, color, description) VALUES
('00000000-0000-0000-0000-000000000000', 'Swing Trading', '#10B981', 'Medium to long-term position trades'),
('00000000-0000-0000-0000-000000000000', 'Day Trading', '#F59E0B', 'Intraday trades closed same day'),
('00000000-0000-0000-0000-000000000000', 'Scalping', '#EF4444', 'Very short-term trades for small profits'),
('00000000-0000-0000-0000-000000000000', 'Position Trading', '#8B5CF6', 'Long-term trades based on fundamentals'),
('00000000-0000-0000-0000-000000000000', 'News Trading', '#06B6D4', 'Trades based on economic news events');

-- Insert default tags
INSERT INTO trading_journal_tags (user_id, name, color) VALUES
('00000000-0000-0000-0000-000000000000', 'Breakout', '#3B82F6'),
('00000000-0000-0000-0000-000000000000', 'Pullback', '#10B981'),
('00000000-0000-0000-0000-000000000000', 'Reversal', '#F59E0B'),
('00000000-0000-0000-0000-000000000000', 'Trend Following', '#8B5CF6'),
('00000000-0000-0000-0000-000000000000', 'Mean Reversion', '#EF4444'),
('00000000-0000-0000-0000-000000000000', 'High Probability', '#10B981'),
('00000000-0000-0000-0000-000000000000', 'Low Probability', '#EF4444');

-- Insert default strategies
INSERT INTO trading_journal_strategies (user_id, name, description, entry_rules, exit_rules, risk_management_rules) VALUES
('00000000-0000-0000-0000-000000000000', 'Breakout Strategy', 'Trade breakouts from key support/resistance levels', 'Enter on confirmed breakout above resistance or below support', 'Exit on trend reversal or target hit', 'Use 2:1 risk-reward ratio, stop loss below/above breakout level'),
('00000000-0000-0000-0000-000000000000', 'Pullback Strategy', 'Trade pullbacks to moving averages or trend lines', 'Enter on pullback to key support level with momentum confirmation', 'Exit on trend continuation or stop loss hit', 'Risk 1-2% per trade, use trailing stops'),
('00000000-0000-0000-0000-000000000000', 'Reversal Strategy', 'Trade market reversals at key levels', 'Enter on reversal signals at support/resistance with confirmation', 'Exit on trend establishment or stop loss', 'Tight stops, quick profit taking');

-- Insert default checklists
INSERT INTO trading_journal_checklists (user_id, name, description, checklist_type) VALUES
('00000000-0000-0000-0000-000000000000', 'Pre-Trade Checklist', 'Essential checks before entering any trade', 'pre_trade'),
('00000000-0000-0000-0000-000000000000', 'Risk Management Checklist', 'Risk management checks for every trade', 'pre_trade'),
('00000000-0000-0000-0000-000000000000', 'Post-Trade Analysis', 'Analysis to perform after closing a trade', 'post_trade');

-- Insert checklist items
INSERT INTO trading_journal_checklist_items (checklist_id, item_text, is_required, order_index) VALUES
(1, 'Market trend analysis completed', TRUE, 1),
(1, 'Entry and exit points defined', TRUE, 2),
(1, 'Position size calculated', TRUE, 3),
(1, 'Risk-reward ratio acceptable (minimum 2:1)', TRUE, 4),
(1, 'Stop loss and take profit set', TRUE, 5),
(1, 'Trade journal entry created', FALSE, 6),
(2, 'Risk per trade limited to 1-2% of account', TRUE, 1),
(2, 'Stop loss properly positioned', TRUE, 2),
(2, 'Position size appropriate for risk', TRUE, 3),
(2, 'No emotional trading decisions', TRUE, 4),
(3, 'Trade outcome recorded', TRUE, 1),
(3, 'Lessons learned documented', FALSE, 2),
(3, 'Performance metrics updated', TRUE, 3),
(3, 'Next trade improvements identified', FALSE, 4);

-- Create indexes for better performance
CREATE INDEX idx_trades_user ON trading_journal_trades(user_id);
CREATE INDEX idx_trades_symbol ON trading_journal_trades(symbol);
CREATE INDEX idx_trades_status ON trading_journal_trades(status);
CREATE INDEX idx_trades_entry_time ON trading_journal_trades(entry_time);
CREATE INDEX idx_trades_strategy ON trading_journal_trades(strategy_id);
CREATE INDEX idx_trades_category ON trading_journal_trades(category_id);
CREATE INDEX idx_trades_pnl ON trading_journal_trades(pnl_amount);

CREATE INDEX idx_strategies_user ON trading_journal_strategies(user_id);
CREATE INDEX idx_categories_user ON trading_journal_categories(user_id);
CREATE INDEX idx_tags_user ON trading_journal_tags(user_id);
CREATE INDEX idx_notes_trade ON trading_journal_notes(trade_id);
CREATE INDEX idx_checklists_user ON trading_journal_checklists(user_id);
CREATE INDEX idx_goals_user ON trading_journal_goals(user_id);
CREATE INDEX idx_performance_user ON trading_journal_performance_metrics(user_id);
CREATE INDEX idx_performance_period ON trading_journal_performance_metrics(period_type, period_start);
