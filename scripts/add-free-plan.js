const { Sequelize } = require('sequelize');

// Database configuration
const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.MYSQL_HOST || 'localhost',
  port: process.env.MYSQL_PORT || 3306,
  username: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASS || '',
  database: process.env.MYSQL_DB || 'trading_academy',
  logging: false
});

async function addFreePlan() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    // Add free plan
    const [result] = await sequelize.query(`
      INSERT INTO subscription_plans (name, display_name, description, price, billing_cycle, features, is_active, created_at, updated_at) VALUES
      (
          'free',
          'Free',
          'Get started with trading',
          0.00,
          'monthly',
          '{
              "features": [
                  "Basic trading introduction",
                  "Limited course access (3 courses)",
                  "Community forum access",
                  "Email support",
                  "Mobile app access"
              ],
              "max_courses": 3,
              "live_sessions_per_month": 0,
              "one_on_one_sessions": 0,
              "priority_support": false
          }',
          true,
          NOW(),
          NOW()
      ) ON DUPLICATE KEY UPDATE updated_at = NOW()
    `);

    console.log('Free plan added successfully!');
    console.log('Result:', result);

  } catch (error) {
    console.error('Error adding free plan:', error);
  } finally {
    await sequelize.close();
  }
}

addFreePlan();

