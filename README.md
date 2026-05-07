<p align="center">
  <img src="client/public/favicon.svg" alt="QuickStay Logo" width="80" height="80" />
</p>

<h1 align="center">QuickStay</h1>

<p align="center">
  <strong>A full-stack hotel booking platform built with the MERN stack</strong>
</p>

<p align="center">
  <a href="https://quick-stay-chi-two.vercel.app/">🌐 Live Demo</a> &nbsp;·&nbsp;
  <a href="#-getting-started">🚀 Getting Started</a> &nbsp;·&nbsp;
  <a href="#-api-reference">📡 API Reference</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Stripe-Payments-635BFF?logo=stripe&logoColor=white" alt="Stripe" />
  <img src="https://img.shields.io/badge/Clerk-Auth-6C47FF?logo=clerk&logoColor=white" alt="Clerk" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind" />
</p>

---

## 📋 Overview

QuickStay provides two distinct user experiences:

| 🧳 **Travelers** | 🏨 **Hotel Owners** |
|---|---|
| Search & filter rooms by city, type, and price | Register a hotel and manage listings |
| Check real-time availability by date range | Upload room images to Cloudinary |
| Book rooms with dynamic pricing | Toggle room availability instantly |
| Pay via Stripe or at the hotel | Track bookings & revenue on a dashboard |
| Receive email confirmations | View guest details and payment status |

---

## ✨ Key Features

- **🔐 Auth** — Clerk-powered authentication with automatic user sync via webhooks
- **🔍 Smart Search** — Filter by destination, room type, price range, and sort order
- **📅 Availability Engine** — Real-time date-range overlap detection prevents double-bookings
- **💳 Stripe Integration** — Full checkout flow with webhook-based payment verification
- **📧 Email Notifications** — Booking confirmations sent via SMTP (Brevo)
- **☁️ Image Hosting** — Multi-image room uploads stored on Cloudinary
- **📊 Owner Dashboard** — Live metrics for total bookings and revenue
- **📱 Responsive Design** — Mobile-first UI with Tailwind CSS v4

---

## 🏗️ Architecture

```
hotel_booking/
├── client/                  # React + Vite frontend
│   ├── public/              # Static assets & favicon
│   ├── src/
│   │   ├── assets/          # Images, icons, dummy data
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # Global state (AppContext)
│   │   └── pages/           # Route pages
│   │       └── hotelOwner/  # Owner dashboard pages
│   └── .env                 # Client environment config
│
├── server/                  # Express API backend
│   ├── configs/             # DB & Cloudinary setup
│   ├── controllers/         # Business logic
│   ├── middleware/           # Auth middleware
│   ├── models/              # Mongoose schemas
│   ├── routes/              # API route definitions
│   └── .env                 # Server environment config
│
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
- Clerk React SDK
- Axios
- react-hot-toast

</td>
<td>

- Express 5
- Mongoose 8
- Multer 2
- Nodemailer 7
- Svix (webhook verification)

</td>
<td>

- **Auth**: Clerk
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
- Accounts on: [Clerk](https://clerk.com), [Stripe](https://stripe.com), [Cloudinary](https://cloudinary.com)

### 1. Clone the repository

```bash
git clone https://github.com/coderMayank69/QuickStay.git
cd QuickStay
```

### 2. Set up environment variables

**`client/.env`**

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_BACKEND_URL=http://localhost:3000
VITE_CURRENCY=$
```

**`server/.env`**

```env
PORT=3000
MONGODB_URL=your_mongodb_connection_string

# Clerk
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret

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

### 4. Run the development servers

```bash
# Terminal 1 — Backend (port 3000)
cd server
npm run server

# Terminal 2 — Frontend (port 5173)
cd client
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000 |

---

## 📡 API Reference

> All protected routes require a Clerk Bearer token in the `Authorization` header.

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
| `POST` | `/api/rooms` | ✅ | Create room with image upload |
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
| `POST` | `/clerk` | Clerk user lifecycle events |
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

## 📦 Data Models

### User
| Field | Type | Description |
|-------|------|-------------|
| `_id` | String | Clerk user ID |
| `username` | String | Display name |
| `email` | String | User email |
| `image` | String | Profile image URL |
| `role` | Enum | `user` \| `hotelOwner` |
| `recentSearchedCities` | [String] | Last 3 searched cities |

### Hotel
| Field | Type | Description |
|-------|------|-------------|
| `name` | String | Hotel name |
| `address` | String | Full address |
| `contact` | String | Phone number |
| `city` | String | City location |
| `owner` | Ref → User | Hotel owner |

### Room
| Field | Type | Description |
|-------|------|-------------|
| `hotel` | Ref → Hotel | Parent hotel |
| `roomType` | String | e.g., Single Bed, Double Bed |
| `pricePerNight` | Number | Nightly rate |
| `amenities` | [String] | e.g., Free Wi-Fi, Pool Access |
| `images` | [String] | Cloudinary URLs |
| `isAvailable` | Boolean | Availability toggle |

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
| Root | Start backend | `npm run start` |
| Client | Dev server | `npm run dev` |
| Client | Production build | `npm run build` |
| Client | Preview build | `npm run preview` |
| Client | Lint | `npm run lint` |
| Server | Dev (nodemon) | `npm run server` |
| Server | Production | `npm run start` |

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/coderMayank69">Mayank Singh</a>
</p>
