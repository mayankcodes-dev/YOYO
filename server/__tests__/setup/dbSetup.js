/**
 * dbSetup.js — runs before EACH test file (setupFilesAfterFramework).
 * Connects mongoose to the in-memory server, clears all collections between files.
 */
import mongoose from 'mongoose';

beforeAll(async () => {
  const uri = process.env.MONGODB_URL;
  if (!uri) throw new Error('MONGODB_URL not set — globalSetup may have failed');
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri, { bufferCommands: false });
  }
});

afterEach(async () => {
  // Wipe all collections after each test to keep tests isolated
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.close();
});
