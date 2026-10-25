/**
 * clearUsers.js — YoYo Rooms
 *
 * Wipes ALL user-linked data from MongoDB:
 *   - users collection
 *   - bookings collection  (linked to users)
 *   - reviews collection   (linked to users)
 *
 * Preserves: hotels, rooms (not user data)
 *
 * Usage: node server/clearUsers.js
 */

import 'dotenv/config';
import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGODB_URL;
if (!MONGO_URI) {
  console.error('❌  MONGODB_URI not set in .env');
  process.exit(1);
}

async function run() {
  console.log('🔗  Connecting to MongoDB…');
  await mongoose.connect(MONGO_URI);
  console.log('✅  Connected\n');

  const db = mongoose.connection.db;

  const collections = await db.listCollections().toArray();
  const names = collections.map(c => c.name);

  const targets = ['users', 'bookings', 'reviews'];

  for (const col of targets) {
    if (names.includes(col)) {
      const result = await db.collection(col).deleteMany({});
      console.log(`🗑  ${col}: deleted ${result.deletedCount} document(s)`);
    } else {
      console.log(`⚠️   ${col}: collection not found — skipping`);
    }
  }

  console.log('\n✅  DB cleared — users, bookings and reviews removed.');
  console.log('    Hotels and rooms are preserved.\n');
  await mongoose.disconnect();
  process.exit(0);
}

run().catch(err => {
  console.error('❌  Error:', err.message);
  process.exit(1);
});
