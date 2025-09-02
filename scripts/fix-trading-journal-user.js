const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixTradingJournalUser() {
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

    // The actual user ID from the logs
    const actualUserId = '091c3f7d-6ff6-4b06-9752-3dd066587093';
    const placeholderUserId = '315ee12b-bd6d-458d-bc2d-8b10d03f06cc';

    console.log(`Updating trading journal data from placeholder user ${placeholderUserId} to actual user ${actualUserId}`);

    // Update all trading journal tables to use the actual user ID
    const tables = [
      'trading_journal_categories',
      'trading_journal_tags', 
      'trading_journal_strategies',
      'trading_journal_checklists',
      'trading_journal_trades',
      'trading_journal_performance_metrics'
    ];

    for (const table of tables) {
      try {
        const [result] = await connection.execute(
          `UPDATE ${table} SET user_id = ? WHERE user_id = ?`,
          [actualUserId, placeholderUserId]
        );
        console.log(`Updated ${table}: ${result.affectedRows} rows affected`);
      } catch (error) {
        if (error.code === 'ER_BAD_FIELD_ERROR') {
          console.log(`Table ${table} doesn't have user_id field, skipping`);
        } else {
          console.error(`Error updating ${table}:`, error.message);
        }
      }
    }

    // Also update checklist items that reference checklists
    try {
      const [result] = await connection.execute(`
        UPDATE trading_journal_checklist_items ci
        JOIN trading_journal_checklists c ON ci.checklist_id = c.id
        SET ci.checklist_id = c.id
        WHERE c.user_id = ?
      `, [actualUserId]);
      console.log(`Updated checklist items: ${result.affectedRows} rows affected`);
    } catch (error) {
      console.error('Error updating checklist items:', error.message);
    }

    // Update trade tags that reference trades
    try {
      const [result] = await connection.execute(`
        UPDATE trading_journal_trade_tags tt
        JOIN trading_journal_trades t ON tt.trade_id = t.id
        SET tt.trade_id = t.id
        WHERE t.user_id = ?
      `, [actualUserId]);
      console.log(`Updated trade tags: ${result.affectedRows} rows affected`);
    } catch (error) {
      console.error('Error updating trade tags:', error.message);
    }

    // Update trade notes that reference trades
    try {
      const [result] = await connection.execute(`
        UPDATE trading_journal_notes n
        JOIN trading_journal_trades t ON n.trade_id = t.id
        SET n.trade_id = t.id
        WHERE t.user_id = ?
      `, [actualUserId]);
      console.log(`Updated trade notes: ${result.affectedRows} rows affected`);
    } catch (error) {
      console.error('Error updating trade notes:', error.message);
    }

    console.log('Trading journal user ID update completed successfully!');

    // Verify the data exists
    const [trades] = await connection.execute(
      'SELECT COUNT(*) as count FROM trading_journal_trades WHERE user_id = ?',
      [actualUserId]
    );
    console.log(`User now has ${trades[0].count} trades`);

    const [categories] = await connection.execute(
      'SELECT COUNT(*) as count FROM trading_journal_categories WHERE user_id = ?',
      [actualUserId]
    );
    console.log(`User now has ${categories[0].count} categories`);

  } catch (error) {
    console.error('Error fixing trading journal user:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the fix
fixTradingJournalUser().catch(console.error);
