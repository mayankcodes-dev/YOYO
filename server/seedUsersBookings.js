/**
 * YoYo Rooms — Users + Bookings Seed
 * Seeds 4 regular users with realistic bookings against existing hotels/rooms.
 * Run: node seedUsersBookings.js
 *
 * Prerequisites: run seedOwners.js first so hotels & rooms exist in DB.
 */
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import connectDB from './configs/db.js';
import User    from './models/User.js';
import Hotel   from './models/Hotel.js';
import Room    from './models/Room.js';
import Booking from './models/Booking.js';

const PEPPER = process.env.PASSWORD_PEPPER || '';

// ─── Helper: date offset from today ──────────────────────────
const daysFromNow = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(14, 0, 0, 0); // standard hotel check-in 2pm
  return d;
};

const daysAgo = (n) => daysFromNow(-n);

// ─── Regular users to seed ────────────────────────────────────
const USERS = [
  {
    username: 'Rahul Sharma',
    email:    'rahul@example.com',
    password: 'User@1234',
    image:    'https://i.pravatar.cc/150?img=12',
  },
  {
    username: 'Sneha Patel',
    email:    'sneha@example.com',
    password: 'User@1234',
    image:    'https://i.pravatar.cc/150?img=48',
  },
  {
    username: 'Karan Mehra',
    email:    'karan@example.com',
    password: 'User@1234',
    image:    'https://i.pravatar.cc/150?img=7',
  },
  {
    username: 'Anjali Verma',
    email:    'anjali@example.com',
    password: 'User@1234',
    image:    'https://i.pravatar.cc/150?img=44',
  },
];

// ─── Main seed ────────────────────────────────────────────────
async function seed() {
  await connectDB();
  console.log('\n👤 Seeding regular users + bookings…\n');

  // ── 1. Create users ─────────────────────────────────────────
  const createdUsers = [];
  for (const u of USERS) {
    let user = await User.findOne({ email: u.email });
    if (!user) {
      const hashed = await bcrypt.hash(u.password + PEPPER, 12);
      user = await User.create({
        username: u.username,
        email:    u.email,
        password: hashed,
        image:    u.image,
        role:     'user',
      });
      console.log(`  ✅ User created: ${u.email}`);
    } else {
      console.log(`  ♻️  User exists:  ${u.email}`);
    }
    createdUsers.push({ ...u, _id: user._id.toString() });
  }

  // ── 2. Load hotels + rooms ───────────────────────────────────
  const udaipurHotel = await Hotel.findOne({ city: 'Udaipur' });
  const goaHotel     = await Hotel.findOne({ city: 'Goa' });
  const manaliHotel  = await Hotel.findOne({ city: 'Manali' });

  if (!udaipurHotel || !goaHotel || !manaliHotel) {
    console.error('\n❌ Hotels not found — run seedOwners.js first!\n');
    return mongoose.disconnect();
  }

  // Get rooms per hotel
  const udaipurRooms = await Room.find({ hotel: udaipurHotel._id });
  const goaRooms     = await Room.find({ hotel: goaHotel._id });
  const manaliRooms  = await Room.find({ hotel: manaliHotel._id });

  const pick = (arr, i) => arr[i % arr.length];

  // ── 3. Booking templates ─────────────────────────────────────
  // Format: { userId, room, hotel, checkIn, checkOut, guests, status, isPaid, paymentMethod }
  const bookingTemplates = [
    // ── Rahul: 2 bookings ──────────────────────────────────
    {
      userId:   createdUsers[0]._id,
      room:     pick(udaipurRooms, 0),    // Luxury Room
      hotel:    udaipurHotel,
      checkIn:  daysAgo(15),
      checkOut: daysAgo(12),
      guests:   2,
      status:   'confirmed',
      isPaid:   true,
      paymentMethod: 'stripe',
    },
    {
      userId:   createdUsers[0]._id,
      room:     pick(goaRooms, 0),        // Beach Villa
      hotel:    goaHotel,
      checkIn:  daysFromNow(10),
      checkOut: daysFromNow(15),
      guests:   3,
      status:   'confirmed',
      isPaid:   false,
      paymentMethod: 'pay at hotel',
    },

    // ── Sneha: 3 bookings ──────────────────────────────────
    {
      userId:   createdUsers[1]._id,
      room:     pick(manaliRooms, 0),     // Mountain Chalet
      hotel:    manaliHotel,
      checkIn:  daysAgo(30),
      checkOut: daysAgo(25),
      guests:   2,
      status:   'confirmed',
      isPaid:   true,
      paymentMethod: 'stripe',
    },
    {
      userId:   createdUsers[1]._id,
      room:     pick(udaipurRooms, 1),    // Heritage Suite
      hotel:    udaipurHotel,
      checkIn:  daysAgo(5),
      checkOut: daysAgo(2),
      guests:   2,
      status:   'confirmed',
      isPaid:   true,
      paymentMethod: 'stripe',
    },
    {
      userId:   createdUsers[1]._id,
      room:     pick(goaRooms, 2),        // Family Suite
      hotel:    goaHotel,
      checkIn:  daysFromNow(20),
      checkOut: daysFromNow(27),
      guests:   4,
      status:   'pending',
      isPaid:   false,
      paymentMethod: 'pay at hotel',
    },

    // ── Karan: 2 bookings ──────────────────────────────────
    {
      userId:   createdUsers[2]._id,
      room:     pick(goaRooms, 1),        // Single Bed
      hotel:    goaHotel,
      checkIn:  daysAgo(60),
      checkOut: daysAgo(57),
      guests:   1,
      status:   'confirmed',
      isPaid:   true,
      paymentMethod: 'stripe',
    },
    {
      userId:   createdUsers[2]._id,
      room:     pick(manaliRooms, 1),     // Double Bed
      hotel:    manaliHotel,
      checkIn:  daysFromNow(5),
      checkOut: daysFromNow(9),
      guests:   2,
      status:   'confirmed',
      isPaid:   false,
      paymentMethod: 'pay at hotel',
    },

    // ── Anjali: 3 bookings (incl. one cancelled) ───────────
    {
      userId:   createdUsers[3]._id,
      room:     pick(udaipurRooms, 2),    // Double Bed
      hotel:    udaipurHotel,
      checkIn:  daysAgo(45),
      checkOut: daysAgo(43),
      guests:   2,
      status:   'cancelled',
      isPaid:   false,
      paymentMethod: 'pay at hotel',
    },
    {
      userId:   createdUsers[3]._id,
      room:     pick(manaliRooms, 2),     // Budget Room
      hotel:    manaliHotel,
      checkIn:  daysAgo(10),
      checkOut: daysAgo(7),
      guests:   1,
      status:   'confirmed',
      isPaid:   true,
      paymentMethod: 'stripe',
    },
    {
      userId:   createdUsers[3]._id,
      room:     pick(goaRooms, 0),        // Beach Villa
      hotel:    goaHotel,
      checkIn:  daysFromNow(30),
      checkOut: daysFromNow(35),
      guests:   2,
      status:   'pending',
      isPaid:   false,
      paymentMethod: 'pay at hotel',
    },
  ];

  // ── 4. Create bookings ───────────────────────────────────────
  console.log('\n📅 Creating bookings…\n');
  let created = 0;
  let skipped = 0;

  for (const b of bookingTemplates) {
    if (!b.room || !b.hotel) { skipped++; continue; }

    const nights = Math.round(
      (b.checkOut - b.checkIn) / (1000 * 60 * 60 * 24)
    );
    const totalPrice = b.room.pricePerNight * nights;

    // Skip if exact duplicate already exists
    const exists = await Booking.findOne({
      user:        b.userId,
      room:        b.room._id,
      checkInDate: b.checkIn,
    });
    if (exists) { skipped++; continue; }

    await Booking.create({
      user:          b.userId,           // stored as String (legacy schema)
      room:          b.room._id,
      hotel:         b.hotel._id,
      checkInDate:   b.checkIn,
      checkOutDate:  b.checkOut,
      totalPrice,
      guests:        b.guests,
      status:        b.status,
      isPaid:        b.isPaid,
      paymentMethod: b.paymentMethod,
    });

    const userName = createdUsers.find(u => u._id === b.userId)?.username || b.userId;
    const checkInStr  = b.checkIn.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    const checkOutStr = b.checkOut.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    const paidTag     = b.isPaid ? '💳 paid' : '🏨 pay-at-hotel';
    const statusTag   = b.status === 'confirmed' ? '✅' : b.status === 'pending' ? '⏳' : '❌';

    console.log(
      `  ${statusTag} ${userName.padEnd(14)} | ${b.room.roomType.padEnd(18)} | ` +
      `${b.hotel.city.padEnd(8)} | ${checkInStr}→${checkOutStr} | ` +
      `₹${totalPrice.toLocaleString('en-IN').padStart(7)} | ${paidTag}`
    );
    created++;
  }

  console.log(`\n✅ Done — ${created} bookings created, ${skipped} skipped (already exist)`);

  console.log('\n📋 Regular User Credentials:');
  USERS.forEach(u => console.log(`   ${u.email.padEnd(22)} /  ${u.password}`));

  mongoose.disconnect();
}

seed().catch(err => { console.error('❌', err.message); process.exit(1); });
