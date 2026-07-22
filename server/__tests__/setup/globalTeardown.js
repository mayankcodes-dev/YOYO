/**
 * globalTeardown.js — runs ONCE after all test suites complete.
 * Stops the mongodb-memory-server.
 */
import { MongoMemoryServer } from 'mongodb-memory-server';
import { readFileSync, existsSync } from 'fs';

export default async function globalTeardown() {
  // Re-create the mongod reference from the stored URI if needed
  // (global.__MONGOD__ may not be available in teardown worker context)
  if (global.__MONGOD__) {
    await global.__MONGOD__.stop();
  } else {
    // Fallback: just clean up the tmp file
    const tmpFile = '/tmp/mongo-instance.txt';
    if (existsSync(tmpFile)) {
      try { readFileSync(tmpFile); } catch { /* ignore */ }
    }
  }
}
