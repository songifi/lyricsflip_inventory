// Example test database setup for integration tests
import { DataSource } from 'typeorm';

export const testDataSource = new DataSource({
  type: 'postgres',
  host: process.env.TEST_DB_HOST || 'localhost',
  port: +(process.env.TEST_DB_PORT || 5432),
  username: process.env.TEST_DB_USER || 'test_user',
  password: process.env.TEST_DB_PASS || 'test_pass',
  database: process.env.TEST_DB_NAME || 'test_db',
  synchronize: true, // Only for testing!
  entities: [__dirname + '/../../src/**/*.entity{.ts,.js}'],
});

export async function setupTestDB() {
  if (!testDataSource.isInitialized) {
    await testDataSource.initialize();
  }
}

export async function teardownTestDB() {
  if (testDataSource.isInitialized) {
    await testDataSource.destroy();
  }
}
