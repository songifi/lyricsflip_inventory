import { setupTestDB, teardownTestDB, testDataSource } from '../utils/test-db';

describe('Test Database Integration', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  it('should connect to the test database', async () => {
    expect(testDataSource.isInitialized).toBe(true);
  });
});
