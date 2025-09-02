const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupTradingJournal() {
  let connection;

  try {
    // Connect to database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'trading_academy',
      charset: 'utf8mb4'
    });

    console.log('Connected to database successfully');

    // Read and execute the SQL schema
    const fs = require('fs');
    const schemaSQL = fs.readFileSync('./scripts/create-trading-journal-schema.sql', 'utf8');

    // Split SQL by semicolons and execute each statement
    const statements = schemaSQL.split(';').filter(stmt => stmt.trim());

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await connection.execute(statement);
          console.log('Executed:', statement.substring(0, 50) + '...');
        } catch (error) {
          if (error.code !== 'ER_TABLE_EXISTS_ERROR') {
            console.error('Error executing statement:', error.message);
          }
        }
      }
    }

    console.log('Trading journal database schema created successfully');

    // Seed sample data
    await seedSampleData(connection);

    console.log('Trading journal setup completed successfully!');

  } catch (error) {
    console.error('Error setting up trading journal:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

async function seedSampleData(connection) {
  console.log('Seeding sample trading journal data...');

  // Get a sample user ID (you can modify this to use a real user ID)
  const [users] = await connection.execute('SELECT id FROM users LIMIT 1');
  if (users.length === 0) {
    console.log('No users found, skipping sample data seeding');
    return;
  }

  const userId = users[0].id;

  // Update default categories and tags with real user ID
  await connection.execute(
    'UPDATE trading_journal_categories SET user_id = ? WHERE user_id = ?',
    [userId, '00000000-0000-0000-0000-000000000000']
  );

  await connection.execute(
    'UPDATE trading_journal_tags SET user_id = ? WHERE user_id = ?',
    [userId, '00000000-0000-0000-0000-000000000000']
  );

  await connection.execute(
    'UPDATE trading_journal_strategies SET user_id = ? WHERE user_id = ?',
    [userId, '00000000-0000-0000-0000-000000000000']
  );

  await connection.execute(
    'UPDATE trading_journal_checklists SET user_id = ? WHERE user_id = ?',
    [userId, '00000000-0000-0000-0000-000000000000']
  );

  // Sample trades
  const sampleTrades = [
    {
      trade_id: 'TRADE-001',
      symbol: 'BTCUSD',
      instrument_type: 'crypto',
      direction: 'long',
      entry_price: 45000.00,
      entry_time: '2025-09-01 10:30:00',
      entry_reason: 'Breakout above key resistance level with strong volume',
      entry_confidence: 'high',
      exit_price: 46500.00,
      exit_time: '2025-09-02 14:15:00',
      exit_reason: 'Target reached, taking profits',
      exit_confidence: 'high',
      position_size: 0.5,
      position_size_currency: 'BTC',
      leverage: 1.00,
      stop_loss: 44000.00,
      take_profit: 47000.00,
      risk_amount: 500.00,
      risk_percentage: 1.11,
      pnl_amount: 750.00,
      pnl_percentage: 1.67,
      max_profit: 800.00,
      max_loss: -200.00,
      market_condition: 'trending',
      trade_setup_quality: 'excellent',
      execution_quality: 'good',
      status: 'closed',
      is_winning: true,
      notes: 'Strong breakout trade, volume confirmed the move',
      lessons_learned: 'Could have held longer for more profit',
      next_time_actions: 'Consider trailing stops for trending moves'
    },
    {
      trade_id: 'TRADE-002',
      symbol: 'EURUSD',
      instrument_type: 'forex',
      direction: 'short',
      entry_price: 1.0850,
      entry_time: '2025-09-01 15:45:00',
      entry_reason: 'Pullback to resistance level with bearish divergence',
      entry_confidence: 'medium',
      exit_price: 1.0820,
      exit_time: '2025-09-01 16:30:00',
      exit_reason: 'Stop loss hit',
      exit_confidence: 'low',
      position_size: 10000,
      position_size_currency: 'EUR',
      leverage: 1.00,
      stop_loss: 1.0870,
      take_profit: 1.0780,
      risk_amount: 200.00,
      risk_percentage: 2.00,
      pnl_amount: -200.00,
      pnl_percentage: -2.00,
      max_profit: 50.00,
      max_loss: -200.00,
      market_condition: 'ranging',
      trade_setup_quality: 'fair',
      execution_quality: 'fair',
      status: 'closed',
      is_winning: false,
      notes: 'Trade went against the overall trend',
      lessons_learned: 'Avoid trading against strong trends',
      next_time_actions: 'Wait for better trend alignment'
    },
    {
      trade_id: 'TRADE-003',
      symbol: 'AAPL',
      instrument_type: 'stock',
      direction: 'long',
      entry_price: 175.50,
      entry_time: '2025-09-02 09:15:00',
      entry_reason: 'Gap up with strong earnings, breakout above key level',
      entry_confidence: 'high',
      exit_price: null,
      exit_time: null,
      exit_reason: null,
      exit_confidence: null,
      position_size: 100,
      position_size_currency: 'USD',
      leverage: 1.00,
      stop_loss: 170.00,
      take_profit: 185.00,
      risk_amount: 550.00,
      risk_percentage: 3.13,
      pnl_amount: null,
      pnl_percentage: null,
      max_profit: 150.00,
      max_loss: -550.00,
      market_condition: 'trending',
      trade_setup_quality: 'excellent',
      execution_quality: 'excellent',
      status: 'open',
      is_winning: null,
      notes: 'Strong fundamental catalyst with technical breakout',
      lessons_learned: null,
      next_time_actions: null
    }
  ];

  // Insert sample trades
  for (const trade of sampleTrades) {
    await connection.execute(
      `INSERT INTO trading_journal_trades (
        user_id, trade_id, symbol, instrument_type, direction, entry_price, entry_time, 
        entry_reason, entry_confidence, exit_price, exit_time, exit_reason, exit_confidence,
        position_size, position_size_currency, leverage, stop_loss, take_profit, risk_amount,
        risk_percentage, pnl_amount, pnl_percentage, max_profit, max_loss, market_condition,
        trade_setup_quality, execution_quality, status, is_winning, notes, lessons_learned, next_time_actions
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId, trade.trade_id, trade.symbol, trade.instrument_type, trade.direction,
        trade.entry_price, trade.entry_time, trade.entry_reason, trade.entry_confidence,
        trade.exit_price, trade.exit_time, trade.exit_reason, trade.exit_confidence,
        trade.position_size, trade.position_size_currency, trade.leverage, trade.stop_loss,
        trade.take_profit, trade.risk_amount, trade.risk_percentage, trade.pnl_amount,
        trade.pnl_percentage, trade.max_profit, trade.max_loss, trade.market_condition,
        trade.trade_setup_quality, trade.execution_quality, trade.status, trade.is_winning,
        trade.notes, trade.lessons_learned, trade.next_time_actions
      ]
    );
  }

  // Sample performance metrics
  const sampleMetrics = [
    {
      period_type: 'monthly',
      period_start: '2025-09-01',
      period_end: '2025-09-30',
      total_trades: 3,
      winning_trades: 1,
      losing_trades: 1,
      win_rate: 33.33,
      total_pnl: 550.00,
      average_win: 750.00,
      average_loss: -200.00,
      largest_win: 750.00,
      largest_loss: -200.00,
      profit_factor: 3.75,
      risk_reward_ratio: 2.5,
      max_drawdown: -200.00,
      sharpe_ratio: 1.25,
      average_trade_duration: 1440, // 24 hours in minutes
      total_trading_time: 4320
    }
  ];

  // Insert sample performance metrics
  for (const metric of sampleMetrics) {
    await connection.execute(
      `INSERT INTO trading_journal_performance_metrics (
        user_id, period_type, period_start, period_end, total_trades, winning_trades,
        losing_trades, win_rate, total_pnl, average_win, average_loss, largest_win,
        largest_loss, profit_factor, risk_reward_ratio, max_drawdown, sharpe_ratio,
        average_trade_duration, total_trading_time
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId, metric.period_type, metric.period_start, metric.period_end,
        metric.total_trades, metric.winning_trades, metric.losing_trades,
        metric.win_rate, metric.total_pnl, metric.average_win, metric.average_loss,
        metric.largest_win, metric.largest_loss, metric.profit_factor,
        metric.risk_reward_ratio, metric.max_drawdown, metric.sharpe_ratio,
        metric.average_trade_duration, metric.total_trading_time
      ]
    );
  }

  console.log('Sample trading journal data seeded successfully');
}

// Run the setup
setupTradingJournal().catch(console.error);



