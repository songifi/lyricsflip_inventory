// Setup file for Jest
// You can add global setup here, e.g. test database connection mocks

// Example: Set NODE_ENV to 'test'
process.env.NODE_ENV = 'test';
process.env.DATABASE_NAME = 'test_db';
require('dotenv').config({ path: '.env.test' });
