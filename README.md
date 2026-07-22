<p align="center">
  <img src="client/public/favicon.svg" alt="YoYo Logo" width="80" height="80" />
</p>

<h1 align="center">YoYo — Hotel Booking Platform</h1>

<p align="center">
  <strong>A full-stack hotel booking platform built with the MERN stack</strong>
</p>

<p align="center">
  <a href="https://quick-stay-chi-two.vercel.app/" target="_blank">🌐 Live Demo</a> &nbsp;·&nbsp;
  <a href="#-getting-started">🚀 Getting Started</a> &nbsp;·&nbsp;
  <a href="#-mobile-app">📱 Mobile App</a> &nbsp;·&nbsp;
  <a href="#-api-reference">📡 API Reference</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Stripe-Payments-635BFF?logo=stripe&logoColor=white" alt="Stripe" />
  <img src="https://img.shields.io/badge/JWT-Auth-F7B731?logo=jsonwebtokens&logoColor=white" alt="JWT" />
  <img src="https://img.shields.io/badge/Cloudinary-Images-3448C5?logo=cloudinary&logoColor=white" alt="Cloudinary" />
</p>

---

## 📋 Overview

YoYo provides two distinct user experiences:

| 🧳 **Travelers** | 🏨 **Hotel Owners** |
|---|---|
| Search & filter rooms by city, type, and price | Register a hotel and manage listings |
| Check real-time availability by date range | Upload up to **5 room images** to Cloudinary |
| Book rooms with dynamic pricing | Toggle room availability instantly |
| Pay via Stripe or at the hotel | Track bookings & revenue on a dashboard |
| Receive email confirmations | View guest details and payment status |

---

## 📱 Mobile App

YoYo is also available as a **Progressive Web App (PWA)** — install it directly from the browser:

| Platform | Link |
|----------|------|
| 🌐 **Web / PWA (Android & iOS)** | [Install from Live Site](https://quick-stay-chi-two.vercel.app/) |
| 🤖 **Android** | Open the site in Chrome → tap ⋮ → **Add to Home Screen** |
| 🍎 **iOS** | Open the site in Safari → tap Share → **Add to Home Screen** |

> The app works offline for browsing, is installable on all devices, and syncs automatically when reconnected.

---

## ✨ Key Features

- **🔐 Auth** — JWT-based authentication with Google OAuth & email/password login
- **🔍 Smart Search** — Filter by destination, room type, price range, and sort order
- **📅 Availability Engine** — Real-time date-range overlap detection prevents double-bookings
- **💳 Stripe Integration** — Full checkout flow with webhook-based payment verification
- **📧 Email Notifications** — Booking confirmations sent via SMTP (Brevo)
- **☁️ Image Hosting** — Up to **5 images** per room, stored on Cloudinary
- **📊 Owner Dashboard** — Live metrics for total bookings and revenue
- **📱 PWA / Mobile-First** — Installable app, offline-ready, responsive on all screen sizes
- **🏨 10,000+ Hotels** — Seeded across 100+ Indian cities with a built-in seed script
- **🤖 Maya AI Chatbot** — Concierge chatbot to help guests with bookings

---

## 🏗️ Architecture

```
YOYO/
├── client/                  # React + Vite frontend (PWA)
│   ├── public/              # Static assets, PWA icons, maya.png
│   ├── src/
│   │   ├── assets/          # Images, icons, dummy data
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # Global state (AppContext + JWT auth)
│   │   └── pages/           # Route pages
│   │       ├── hotelOwner/  # Owner dashboard pages
│   │       └── admin/       # Admin panel pages
│   └── .env                 # Client environment config
│
├── server/                  # Express API backend
│   ├── configs/             # DB & Cloudinary setup
│   ├── controllers/         # Business logic
│   ├── middleware/           # JWT auth middleware
│   ├── models/              # Mongoose schemas
│   ├── routes/              # API route definitions
│   └── .env                 # Server environment config
│
├── addHotels.js             # 🌱 Seed script — adds 100 hotels to MongoDB
└── package.json             # Root deployment scripts
```

---

## 🛠️ Tech Stack

<table>
<tr>
<td><strong>Frontend</strong></td>
<td><strong>Backend</strong></td>
<td><strong>Services</strong></td>
</tr>
<tr>
<td>

- React 19
- React Router 7
- Tailwind CSS v4
- GSAP Animations
- Framer Motion
- Axios
- react-hot-toast

</td>
<td>

- Express 5
- Mongoose 8
- Multer 2 (image uploads)
- Nodemailer 7
- jsonwebtoken
- bcryptjs

</td>
<td>

- **Auth**: JWT + Google OAuth
- **Payments**: Stripe
- **Images**: Cloudinary
- **Email**: Brevo SMTP
- **Database**: MongoDB Atlas
- **Hosting**: Vercel

</td>
</tr>
</table>

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas cluster (or local MongoDB)
- Accounts on: [Stripe](https://stripe.com), [Cloudinary](https://cloudinary.com), [Google Cloud Console](https://console.cloud.google.com)

### 1. Clone the repository

```bash
git clone https://github.com/coderMayank69/YoYo.git
cd YOYO
```

### 2. Set up environment variables

**`client/.env`**

```env
VITE_BACKEND_URL=http://localhost:4000
VITE_CURRENCY=₹
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

**`server/.env`**

```env
PORT=4000
MONGODB_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_super_secret_jwt_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# SMTP (Brevo)
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
SENDER_EMAIL=your_sender_email

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

### 3. Install dependencies

```bash
# Install client dependencies
cd client && npm install

# Install server dependencies
cd ../server && npm install
```

### 4. Seed the database (optional)

```bash
# From the root YOYO/ folder — adds 100 hotels across Indian cities
node addHotels.js
```

### 5. Run the development servers

```bash
# Terminal 1 — Backend (port 4000)
cd server
npm run server

# Terminal 2 — Frontend (port 5173)
cd client
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:4000 |

---

## 🌱 Hotel Seed Script

The `addHotels.js` script in the project root seeds **100 hotels** across 80+ Indian cities into MongoDB.

```bash
# Run from root YOYO/ folder
node addHotels.js
```

**Features:**
- Skips hotels that already exist (safe to re-run)
- Each hotel gets exactly **1 room** with **1 image**
- Rooms support up to **5 images** when listed via the Owner Portal
- Covers Port Blair → Gangtok → Gulmarg → Kanyakumari

---

## 📡 API Reference

> All protected routes require a JWT Bearer token in the `Authorization` header.

### 👤 Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | ❌ | Register with email & password |
| `POST` | `/api/auth/login` | ❌ | Login — returns JWT |
| `POST` | `/api/auth/google` | ❌ | Google OAuth login |
| `GET`  | `/api/auth/me` | ✅ | Get current user profile |

### 👤 Users

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/user` | ✅ | Get current user profile & recent searches |
| `POST` | `/api/user/store-recent-search` | ✅ | Save a recently searched city |

### 🏨 Hotels

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/hotels` | ✅ | Register as hotel owner & create hotel |

### 🛏️ Rooms

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/rooms` | ❌ | List all available rooms |
| `POST` | `/api/rooms` | ✅ | Create room with up to 5 image uploads |
| `GET` | `/api/rooms/owner` | ✅ | Get rooms for current owner |
| `POST` | `/api/rooms/toggle-availability` | ✅ | Toggle room availability |

### 📋 Bookings

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/bookings/check-availability` | ❌ | Check room availability for dates |
| `POST` | `/api/bookings/book` | ✅ | Create a new booking |
| `GET` | `/api/bookings/user` | ✅ | Get current user's bookings |
| `GET` | `/api/bookings/hotel` | ✅ | Get owner's bookings & dashboard data |
| `POST` | `/api/bookings/stripe-payment` | ✅ | Create Stripe checkout session |
| `POST` | `/api/bookings/verify-payment` | ✅ | Verify payment & update booking |

### 🔗 Webhooks

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/stripe` | Stripe payment events |

---

## 💳 Booking & Payment Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Select Room │────▶│  Check Dates │────▶│ Create      │
│  & Dates     │     │  Availability│     │ Booking     │
└─────────────┘     └──────────────┘     └──────┬──────┘
                                                │
                    ┌──────────────────────────┐ │
                    │                          ▼ │
              ┌─────┴──────┐          ┌─────────────────┐
              │ Pay at Hotel│          │ Stripe Checkout  │
              │ (isPaid:    │          │ Session Created  │
              │  false)     │          └────────┬────────┘
              └────────────┘                   │
                                               ▼
                                    ┌─────────────────┐
                                    │ Webhook confirms │
                                    │ payment & updates│
                                    │ booking status   │
                                    └────────┬────────┘
                                             │
                                             ▼
                                    ┌─────────────────┐
                                    │ Email confirm    │
                                    │ sent to guest    │
                                    └─────────────────┘
```

---

## 🗄️ Data Models

### Room

| Field | Type | Description |
|-------|------|-------------|
| `hotel` | Ref → Hotel | Associated hotel |
| `roomType` | String | Single / Double / Family Suite / Luxury |
| `pricePerNight` | Number | Price in INR |
| `amenities` | [String] | List of included amenities |
| `images` | [String] | 1–5 Cloudinary URLs |
| `isAvailable` | Boolean | Listing visibility |

### Booking

| Field | Type | Description |
|-------|------|-------------|
| `user` | Ref → User | Guest |
| `room` | Ref → Room | Booked room |
| `hotel` | Ref → Hotel | Associated hotel |
| `checkInDate` | Date | Check-in date |
| `checkOutDate` | Date | Check-out date |
| `totalPrice` | Number | Calculated total |
| `guests` | Number | Guest count |
| `status` | Enum | `pending` \| `confirmed` \| `cancelled` |
| `paymentMethod` | String | Stripe \| Pay At Hotel |
| `isPaid` | Boolean | Payment status |

---

## 🚢 Deployment

The project is configured for **Vercel** with separate deployments for frontend and backend:

1. **Frontend** — Deploy the `client/` directory as a Vite static site
2. **Backend** — Deploy the `server/` directory as a Node.js serverless function

Set `VITE_BACKEND_URL` in the client's Vercel environment to point to the deployed backend URL.

---

## 📜 Available Scripts

| Location | Script | Command |
|----------|--------|---------|
| Root | Add 100 hotels to DB | `node addHotels.js` |
| Client | Dev server | `npm run dev` |
| Client | Production build | `npm run build` |
| Client | Preview build | `npm run preview` |
| Client | Lint | `npm run lint` |
| Server | Dev (nodemon) | `npm run server` |
| Server | Production | `npm run start` |

---

<p align="center">
  Built with ❤️ by <a href="https://mayankcodes.dev" target="_blank" rel="noopener noreferrer">Mayank Singh</a>
</p>
