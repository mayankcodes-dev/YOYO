/**
 * globalSetup.js — runs ONCE before all test suites.
 * Starts mongodb-memory-server and stores the URI in process.env.
 */
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod;

export default async function globalSetup() {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  process.env.MONGODB_URL       = uri;
  process.env.JWT_SECRET         = 'test-jwt-secret-32-characters-long!!';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-32-chars-long!!';
  process.env.PASSWORD_PEPPER    = 'test-pepper-16ch';
  process.env.GOOGLE_CLIENT_ID   = 'test-google-client-id';
  process.env.NODE_ENV           = 'test';

  // Store mongod instance URI in a file so globalTeardown can read it
  // (globalSetup and globalTeardown run in separate worker contexts)
  const { writeFileSync } = await import('fs');
  writeFileSync('/tmp/mongo-uri.txt', uri);
  writeFileSync('/tmp/mongo-instance.txt', JSON.stringify({ uri }));

  // Store globally for access by setup files
  global.__MONGOD__ = mongod;
}
