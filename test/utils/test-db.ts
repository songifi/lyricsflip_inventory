// test-db.ts
import { DataSource } from 'typeorm';
import { Supplier } from '../../src/Purchase Order API Endpoints/supplier.entity';
import { PurchaseOrder } from '../../src/Purchase Order API Endpoints/purchase-order.entity';
// import other entities explicitly here...

export const testDataSource = new DataSource({
  type: 'postgres',
  host: process.env.TEST_DB_HOST || 'localhost',
  port: +(process.env.TEST_DB_PORT || 5432),
  username: process.env.TEST_DB_USER || 'test_user',
  password: process.env.TEST_DB_PASS || 'test_password',
  database: process.env.TEST_DB_NAME || 'test_db',
  synchronize: true, // Only for testing!
  entities: [Supplier, PurchaseOrder], // add more entities as needed
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
