/**
 * YoYo Rooms — Full Seed Script
 * Seeds: 3 hotel owners + 3 regular users + 3 hotels + 9 rooms
 * Run: node seedOwners.js
 */
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import connectDB from './configs/db.js';
import User from './models/User.js';
import Hotel from './models/Hotel.js';
import Room from './models/Room.js';

const CLOUD  = 'dgqgzmzed';
const PEPPER = process.env.PASSWORD_PEPPER || '';
const cld = (id, w = 600) =>
  `https://res.cloudinary.com/${CLOUD}/image/upload/f_auto,q_auto,w_${w}/${id}`;


const owners = [
  {
    username: 'Arjun Mehta',
    email: 'arjun@yoyo.in',
    password: 'Password@123',
    image: 'https://i.pravatar.cc/150?img=11',
    hotel: {
      name: 'The Grand Udaipur Palace',
      address: 'Lake Palace Road, Pichola, Udaipur',
      contact: '+91 9876543210',
      city: 'Udaipur',
    },
    rooms: [
      {
        roomType: 'Luxury Room',
        pricePerNight: 5999,
        amenities: ['Free Wi-Fi', 'Pool Access', 'Room Service', 'Mountain View'],
        images: [cld('yoyo/rooms/udaipur_1'), cld('yoyo/rooms/udaipur_2'), cld('yoyo/rooms/udaipur_heritage_1')],
        isAvailable: true,
        category: 'Luxury',
      },
      {
        roomType: 'Heritage Suite',
        pricePerNight: 9999,
        amenities: ['Free Wi-Fi', 'Pool Access', 'Free Breakfast', 'Room Service'],
        images: [cld('yoyo/rooms/udaipur_heritage_1'), cld('yoyo/rooms/udaipur_heritage_2'), cld('yoyo/rooms/udaipur_1')],
        isAvailable: true,
        category: 'Villa',
      },
      {
        roomType: 'Double Bed',
        pricePerNight: 3499,
        amenities: ['Free Wi-Fi', 'Room Service'],
        images: [cld('yoyo/rooms/udaipur_2'), cld('yoyo/rooms/udaipur_1')],
        isAvailable: true,
        category: 'Premium',
      },
    ],
  },
  {
    username: 'Priya Kapoor',
    email: 'priya@yoyo.in',
    password: 'Password@123',
    image: 'https://i.pravatar.cc/150?img=47',
    hotel: {
      name: 'Goa Beach Bliss Resort',
      address: 'Calangute Beach Road, North Goa',
      contact: '+91 9765432109',
      city: 'Goa',
    },
    rooms: [
      {
        roomType: 'Beach Villa',
        pricePerNight: 7499,
        amenities: ['Free Wi-Fi', 'Pool Access', 'Free Breakfast', 'Room Service'],
        images: [cld('yoyo/rooms/goa_villa_1'), cld('yoyo/rooms/goa_villa_2'), cld('yoyo/rooms/goa_1')],
        isAvailable: true,
        category: 'Villa',
      },
      {
        roomType: 'Single Bed',
        pricePerNight: 1799,
        amenities: ['Free Wi-Fi', 'Room Service'],
        images: [cld('yoyo/rooms/goa_1'), cld('yoyo/rooms/goa_2')],
        isAvailable: true,
        category: 'Budget',
      },
      {
        roomType: 'Family Suite',
        pricePerNight: 11999,
        amenities: ['Free Wi-Fi', 'Pool Access', 'Free Breakfast', 'Mountain View'],
        images: [cld('yoyo/rooms/goa_villa_2'), cld('yoyo/rooms/goa_villa_1'), cld('yoyo/rooms/goa_2')],
        isAvailable: true,
        category: 'Luxury',
      },
    ],
  },
  {
    username: 'Vikram Singh',
    email: 'vikram@yoyo.in',
    password: 'Password@123',
    image: 'https://i.pravatar.cc/150?img=3',
    hotel: {
      name: 'Himalayan Heights Manali',
      address: 'Mall Road, Old Manali, Manali',
      contact: '+91 9654321098',
      city: 'Manali',
    },
    rooms: [
      {
        roomType: 'Mountain Chalet',
        pricePerNight: 4999,
        amenities: ['Free Wi-Fi', 'Mountain View', 'Room Service', 'Free Breakfast'],
        images: [cld('yoyo/rooms/manali_chalet_1'), cld('yoyo/rooms/manali_chalet_2'), cld('yoyo/rooms/manali_1')],
        isAvailable: true,
        category: 'Luxury',
      },
      {
        roomType: 'Double Bed',
        pricePerNight: 2999,
        amenities: ['Free Wi-Fi', 'Mountain View', 'Room Service'],
        images: [cld('yoyo/rooms/manali_1'), cld('yoyo/rooms/manali_2')],
        isAvailable: true,
        category: 'Premium',
      },
      {
        roomType: 'Budget Room',
        pricePerNight: 1299,
        amenities: ['Free Wi-Fi', 'Room Service'],
        images: [cld('yoyo/rooms/manali_2'), cld('yoyo/rooms/manali_1')],
        isAvailable: true,
        category: 'Budget',
      },
    ],
  },
];

async function seed() {
  await connectDB();
  console.log('🌱 Seeding hotel owners...\n');

  for (const ownerData of owners) {
    const { username, email, password, image, hotel, rooms } = ownerData;

    // Upsert user
    let user = await User.findOne({ email });
    if (!user) {
      const hashed = await bcrypt.hash(password + PEPPER, 12);
      user = await User.create({ username, email, password: hashed, image, role: 'hotelOwner' });
      console.log(`  ✅ Created owner: ${email}`);
    } else {
      await User.findByIdAndUpdate(user._id, { role: 'hotelOwner' });
      console.log(`  ♻️  Updated existing user: ${email} → hotelOwner`);
    }

    // Upsert hotel
    let existingHotel = await Hotel.findOne({ owner: user._id });
    if (!existingHotel) {
      existingHotel = await Hotel.create({ ...hotel, owner: user._id });
      console.log(`     🏨 Hotel created: ${hotel.name}`);
    } else {
      console.log(`     🏨 Hotel exists: ${existingHotel.name}`);
    }

    // Add rooms
    for (const roomData of rooms) {
      const exists = await Room.findOne({ hotel: existingHotel._id, roomType: roomData.roomType });
      if (!exists) {
        await Room.create({ ...roomData, hotel: existingHotel._id });
        console.log(`        🛏  Room: ${roomData.roomType} (₹${roomData.pricePerNight}/night)`);
      }
    }
  }

  console.log('\n✅ Seeding complete!');
  console.log('\n📋 Owner Credentials:');
  owners.forEach(o => console.log(`   ${o.email}  /  ${o.password}`));
  mongoose.disconnect();
}

seed().catch(err => { console.error('❌', err); process.exit(1); });
