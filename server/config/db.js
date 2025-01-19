const { Pool } = require("pg");
require("dotenv").config();

// Create a new PostgreSQL connection pool using environment variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Export the pool for use in other parts of the application
module.exports = pool;
