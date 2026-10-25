/**
 * testHelpers.js — factory functions for creating test data.
 * Import these in any test file to quickly spin up users, hotels, rooms, etc.
 */
import mongoose from 'mongoose';
import bcrypt   from 'bcryptjs';
import jwt      from 'jsonwebtoken';
import User     from '../../models/User.js';
import Hotel    from '../../models/Hotel.js';
import Room     from '../../models/Room.js';

const PEPPER = process.env.PASSWORD_PEPPER || 'test-pepper-16ch';

// ── User factories ────────────────────────────────────────────────────

/**
 * Creates a real User document in the test DB.
 * @param {object} overrides — any User fields to override
 */
export const createUser = async (overrides = {}) => {
  const defaults = {
    username: 'Test User',
    email:    `test-${Date.now()}@example.com`,
    password: await bcrypt.hash('Password123!' + PEPPER, 4), // low rounds for speed
    role:     'user',
  };
  return User.create({ ...defaults, ...overrides });
};

export const createOwner = (overrides = {}) =>
  createUser({ username: 'Owner User', role: 'hotelOwner', ...overrides });

export const createAdmin = (overrides = {}) =>
  createUser({ username: 'Admin User', role: 'admin', ...overrides });

export const createGoogleUser = (overrides = {}) =>
  User.create({
    username: 'Google User',
    email:    `google-${Date.now()}@gmail.com`,
    googleId: `google-id-${Date.now()}`,
    image:    'https://example.com/avatar.jpg',
    role:     'user',
    ...overrides,
  });

// ── JWT helpers ──────────────────────────────────────────────────────

export const signToken = (userId, secret = process.env.JWT_SECRET, options = { expiresIn: '6h' }) =>
  jwt.sign({ id: userId }, secret, options);

export const authHeader = (userId) => ({
  Authorization: `Bearer ${signToken(userId)}`,
});

// ── Hotel + Room factories ───────────────────────────────────────────

export const createHotel = async (ownerId, overrides = {}) =>
  Hotel.create({
    name:        'Test Palace Hotel',
    address:     '123 Test Street',
    city:        'Mumbai',
    contact:     '9876543210',
    description: 'A test hotel for unit tests',
    owner:       ownerId,
    isAvailable: true,
    ...overrides,
  });

export const createRoom = async (hotelId, overrides = {}) =>
  Room.create({
    hotel:         hotelId,
    roomType:      'Single',
    pricePerNight: 1500,
    amenities:     ['WiFi', 'AC'],
    images:        ['https://example.com/room.jpg'],
    category:      'Budget',
    isAvailable:   true,
    ...overrides,
  });

// ── HTTP mock helpers ────────────────────────────────────────────────

/**
 * Creates a minimal Express-style req mock object.
 */
export const mockReq = (overrides = {}) => ({
  body:    {},
  params:  {},
  query:   {},
  headers: {},
  cookies: {},
  user:    null,
  file:    null,
  files:   null,
  ...overrides,
});

/**
 * Creates a minimal Express-style res mock with jest.fn() methods.
 */
export const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  return res;
};

export const mockNext = () => jest.fn();
