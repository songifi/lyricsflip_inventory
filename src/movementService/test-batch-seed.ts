import { DataSource } from 'typeorm';
import { BatchTracking } from './entities/batch-tracking.entity';
import { BatchHistory } from './entities/batch-history.entity';
import { generateBatchNumber } from './batch-number.util';

// TODO: Update this import to your actual DataSource config!
// For NestJS, you may need to import from your database.module or bootstrap the app to get the DataSource.
// Example: import { AppDataSource } from '../../database/database.module';
// TODO: Update the following line to point to your actual DataSource
// Example: import { AppDataSource } from '../../database/database.module';
let AppDataSource: any;
try {
  AppDataSource = require('../../data-source').AppDataSource;
} catch (e: any) {
  console.error('Please update the DataSource import in test-batch-seed.ts to match your project setup.');
  process.exit(1);
}

async function seedBatches() {
  await AppDataSource.initialize();
  const batchRepo = AppDataSource.getRepository(BatchTracking);
  const historyRepo = AppDataSource.getRepository(BatchHistory);

  const productId = 'PROD-TEST-001';
  const locationId = 'LOC-TEST-001';
  const manufacturedDate = new Date();
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 7);

  // Create a batch with auto-generated batch number
  const batchNumber = generateBatchNumber(productId, manufacturedDate);
  const batch = batchRepo.create({
    productId,
    locationId,
    batchNumber,
    quantity: 100,
    manufacturedDate,
    expiryDate,
    isActive: true,
  });
  await batchRepo.save(batch);
  await historyRepo.save({ batchId: batch.id, action: 'CREATED', details: batch });

  // Try to create duplicate batch (should fail)
  try {
    const dup = batchRepo.create({
      productId,
      locationId,
      batchNumber,
      quantity: 50,
      manufacturedDate,
      expiryDate,
      isActive: true,
    });
    await batchRepo.save(dup);
  } catch (e) {
    console.log('Duplicate batch creation failed as expected:', e.message);
  }

  // Simulate expiry
  batch.expiryDate = new Date('2000-01-01');
  await batchRepo.save(batch);
  batch.isActive = false;
  await batchRepo.save(batch);
  await historyRepo.save({ batchId: batch.id, action: 'EXPIRED', details: batch });

  // Fetch history
  const history = await historyRepo.find({ where: { batchId: batch.id } });
  console.log('Batch history:', history);

  await AppDataSource.destroy();
}

seedBatches().catch(console.error);
