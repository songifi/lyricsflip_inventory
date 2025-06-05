import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

import { User } from '../../user/entities/user.entity';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User],
});

async function seed() {
  await dataSource.initialize();
  const userRepo = dataSource.getRepository(User);

  // Add a default admin user if not exists
  const admin = await userRepo.findOneBy({ email: 'admin@example.com' });
  if (!admin) {
    await userRepo.save(userRepo.create({
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin', // In production, hash this!
      firstName: 'Admin',
      lastName: 'User',
      isActive: true,
      isEmailVerified: true,
    }));
    console.log('Seeded admin user.');
  } else {
    console.log('Admin user already exists.');
  }
  await dataSource.destroy();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
