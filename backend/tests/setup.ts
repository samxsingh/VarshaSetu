import { beforeAll, afterAll } from 'vitest';
import { connectDatabase, closeDatabase } from '../src/config/database';
import { runMongoSeed } from '../src/db/seeds/mongoSeed';

beforeAll(async () => {
  await connectDatabase();
  try {
    await runMongoSeed();
  } catch (err: any) {
    console.warn('Seed warning during vitest setup:', err.message);
  }
});

afterAll(async () => {
  await closeDatabase();
});
