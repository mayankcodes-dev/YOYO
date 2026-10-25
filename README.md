<div align="center">

<img src="client/public/logo.png" alt="YoYo Rooms Logo" width="80" />

# YoYo Rooms

**Production-grade hotel booking platform — React 19 + Express 5 + AWS Lambda + Gemini AI**

[![Live](https://img.shields.io/badge/Live-yoyo.mayankcodes.dev-E8003D?style=flat-square)](https://yoyo.mayankcodes.dev)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white&style=flat-square)](https://react.dev)
[![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white&style=flat-square)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white&style=flat-square)](https://www.mongodb.com/atlas)
[![AWS Lambda](https://img.shields.io/badge/AWS-Lambda-FF9900?logo=awslambda&logoColor=white&style=flat-square)](https://aws.amazon.com/lambda/)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?logo=stripe&logoColor=white&style=flat-square)](https://stripe.com)
[![Gemini AI](https://img.shields.io/badge/Gemini-Flash_Latest-4285F4?logo=google&logoColor=white&style=flat-square)](https://ai.google.dev)
[![Tests](https://img.shields.io/badge/Tests-8%2F8_passing-22C55E?style=flat-square)](#)
[![npm audit](https://img.shields.io/badge/npm_audit-0_vulnerabilities-22C55E?style=flat-square)](#)

</div>

---

## Live Links

| Resource | URL |
|---|---|
| **Frontend** (Vercel) | [yoyo.mayankcodes.dev](https://yoyo.mayankcodes.dev) |
| **Backend API** (AWS Lambda) | [mcr5117577.execute-api.ap-south-1.amazonaws.com](https://mcr5117577.execute-api.ap-south-1.amazonaws.com) |
| **GitHub Repo** | [github.com/mayankcodes-dev/YOYO](https://github.com/mayankcodes-dev/YOYO) |

---

## Overview

YoYo Rooms is an OYO-inspired hotel booking platform for India with two portals:

| Travelers | Hotel Owners |
|---|---|
| Search and filter 225+ rooms by city, type, and price | Register a hotel and manage room listings |
| Real-time date-range availability checking | Upload up to 5 room images via Cloudinary |
| Book rooms with dynamic pricing (GST + service fee) | Toggle room availability instantly |
| Pay via Stripe checkout or at the hotel | Revenue dashboard with booking analytics |
| Email booking confirmations | View guest details and payment status |
| Chat with Maya — AI concierge | |

---

## Features

- **Auth** — JWT sessions (access + refresh rotation), Google OAuth 2.0, bcrypt + pepper hashing
- **Maya AI Chatbot** — Google Gemini 1.5 Flash with multi-turn conversation history and auto-fallback to gemini-1.5-flash-8b on overload
- **AI Smart Search** — Natural language query parsing converts plain English into structured room filters
- **Live Viewer Count** — "X people viewing right now" badge via Upstash Redis HTTP polling (Lambda-compatible, no WebSocket)
- **Availability Engine** — Date-range overlap detection prevents double-bookings
- **Stripe Integration** — Hosted checkout with webhook-based payment verification
- **Email Notifications** — Booking confirmations via Brevo SMTP with HTML templates
- **Image Hosting** — Up to 5 images per room on Cloudinary with server-side signed upload
- **Owner Dashboard** — Live revenue metrics, booking analytics, and room management
- **PWA** — Installable as a home-screen app, responsive on all devices
- **Reviews and Ratings** — Per-hotel review system with owner reply support
- **Coupon System** — Discount codes with server-side validation (WELCOME50 first-booking-only)
- **225+ Hotels** — Seeded across 150+ Indian cities
- **Admin Panel** — Platform statistics, user role management, hotel oversight, review moderation
- **Newsletter** — Email subscription with welcome discount code via Brevo SMTP
- **Dark Mode** — Dual-theme design system (zinc dark + white/red light)
- **Wishlist** — Save favourite rooms with toggle heart button
- **Background Jobs** — Auto-cancel unpaid bookings (EventBridge cron every 15 min), daily check-in reminders (EventBridge cron 8AM IST)
- **AI Review Summaries** — Gemini-powered hotel review summarization with 12-hour cache
- **Booking Cancellation** — 48-hour full-refund policy with modal UI
- **Security** — Rate limiting, NoSQL injection protection, CORS whitelist, Stripe webhook verification, request-size limits

---

## Architecture

```
Browser / PWA  (yoyo.mayankcodes.dev — Vercel)
React 19 + Vite + Tailwind CSS v4 + Framer Motion
         |
         | HTTPS
         v
AWS API Gateway HTTP API v2
mcr5117577.execute-api.ap-south-1.amazonaws.com
         |
         v
AWS Lambda  Node 20  arm64 Graviton  (free tier)
serverless-http wrapping Express 5
Secrets via AWS SSM Parameter Store
         |
   ┌─────┼──────┬────────────┐
   v     v      v            v
MongoDB Cloudinary Stripe  Gemini AI
Atlas   (images) (payments) (Maya + NLP)
         |
         v
Upstash Redis REST (live viewer counts)
```

**Deployment model:**
- Frontend auto-deploys to Vercel on every `git push origin main`
- Backend deploys to AWS Lambda manually: `cd server && npx serverless deploy --stage prod`
- No EC2, no persistent server — fully serverless

---

## Project Structure

```
YOYO/
├── client/                 React + Vite PWA  (Vercel)
│   ├── public/             Static assets, PWA icons, maya.png
│   └── src/
│       ├── components/     Navbar, Hero, MayaChatbot, LiveViewers, …
│       ├── context/        AppContext — global state, axios, auth
│       └── pages/
│           ├── hotelOwner/ Owner dashboard pages
│           └── admin/      Admin panel
│
├── server/                 Express 5 API  (AWS Lambda)
│   ├── configs/            MongoDB, Cloudinary, Redis init
│   ├── controllers/        Business logic
│   ├── middleware/         JWT auth, rate-limit, sanitizer, multer
│   ├── models/             Mongoose schemas
│   ├── routes/             API routes
│   ├── utils/              respond.js, helpers
│   ├── lambda.js           serverless-http Lambda handler
│   ├── lambdaCron.js       EventBridge cron handlers
│   └── serverless.yml      Serverless Framework config
│
├── __tests__/              Jest test suites (8/8 passing)
├── addHotels.js            Seed script — 225+ hotels
└── README.md
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, React Router 7, Tailwind CSS v4, Framer Motion 12, GSAP 3.15, Recharts, Axios, Vite PWA |
| **Backend** | Express 5, Mongoose 8, serverless-http, Multer 2, Nodemailer, jsonwebtoken, bcryptjs, express-rate-limit, hpp |
| **Infrastructure** | Vercel (frontend CDN), AWS Lambda arm64 + API Gateway v2 + SSM + EventBridge (backend) |
| **AI** | Google Gemini 1.5 Flash — chatbot + NLP search, fallback to gemini-1.5-flash-8b on 503 |
| **Auth** | JWT access + refresh tokens (rotate-on-use), Google OAuth 2.0, bcrypt + server-side pepper |
| **Payments** | Stripe Checkout + webhook verification |
| **Images** | Cloudinary — server-side signed upload, auto-optimization, up to 5 per room |
| **Email** | Brevo SMTP with HTML booking confirmation templates |
| **Database** | MongoDB Atlas with Mongoose 8 |
| **Cache / Live Counts** | Upstash Redis REST API (`@upstash/redis`) — HTTP polling for serverless compatibility |

---

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB Atlas cluster
- Accounts: Stripe, Cloudinary, Google Cloud Console, Google AI Studio, Upstash

### 1. Clone

```bash
git clone https://github.com/mayankcodes-dev/YOYO.git
cd YOYO
```

### 2. Environment Variables

**client/.env** (local dev only — gitignored)

```env
VITE_BACKEND_URL=http://localhost:4000
VITE_CURRENCY=INR
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

**server/.env** (local dev only — production uses AWS SSM)

```env
PORT=4000
NODE_ENV=development
MONGODB_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
PASSWORD_PEPPER=your_bcrypt_pepper
GOOGLE_CLIENT_ID=your_google_client_id
ALLOWED_ORIGINS=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
SENDER_EMAIL=your_email
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_pass
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
GEMINI_API_KEY=your_gemini_api_key
UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_rest_token
```

### 3. Install and Run

```bash
# Backend on port 4000
cd server && npm install && npm run server

# Frontend on port 5173
cd client && npm install && npm run dev
```

### 4. Seed Database (optional)

```bash
node addHotels.js    # adds 225+ hotels across 150+ Indian cities
```

---

## API Reference

**Base URL**: `https://mcr5117577.execute-api.ap-south-1.amazonaws.com`

Protected routes require: `Authorization: Bearer <token>`

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | No | Register with email and password |
| POST | /api/auth/login | No | Login — returns JWT |
| POST | /api/auth/google | No | Google OAuth token exchange |
| GET | /api/auth/me | Yes | Current user profile |
| POST | /api/auth/refresh | No | Refresh access token |

### Rooms & Hotels

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /api/rooms | No | List all rooms |
| GET | /api/rooms/:id/viewers | No | Live viewer count |
| POST | /api/rooms/:id/viewers/join | No | Increment viewer count |
| POST | /api/rooms/:id/viewers/leave | No | Decrement viewer count |

### Bookings

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/bookings/book | Yes | Create booking |
| GET | /api/bookings/user | Yes | User booking history |
| POST | /api/bookings/stripe-payment | Yes | Create Stripe checkout session |
| POST | /api/bookings/validate-coupon | Yes | Validate coupon code |
| PATCH | /api/bookings/:id/cancel | Yes | Cancel booking (48h policy) |
| POST | /api/bookings/verify-payment | Yes | Verify Stripe payment |

### AI — Maya

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/ai/chat | Multi-turn chat with Gemini 1.5 Flash |
| POST | /api/ai/parse-search | Natural language to structured room filters |
| GET | /api/ai/review-summary/:hotelId | AI review summary |

---

## Deployment

### Frontend — Vercel

```
Root directory:  client/
Build command:   npm run build
Output dir:      dist/
```

All secrets injected via Vercel dashboard → Environment Variables. `client/.env.production` is **not** committed.

### Backend — AWS Lambda (Serverless Framework)

```bash
cd server
npx serverless deploy --stage prod
```

All secrets stored in AWS SSM Parameter Store under `/yoyo/prod/`. The Express app is wrapped with `serverless-http` in `lambda.js`. Three functions are deployed:

| Function | Description | Trigger |
|---|---|---|
| `api` | Main HTTP API | API Gateway (all routes) |
| `autoCancelUnpaid` | Cancel unpaid bookings | EventBridge — every 15 min |
| `sendCheckInReminders` | Send reminder emails | EventBridge — daily 8AM IST |

**Lambda config:** Node 20, arm64 Graviton, 512 MB, 29s timeout, ap-south-1

---

## Scripts

| Location | Command | Description |
|---|---|---|
| Root | `node addHotels.js` | Seed 225+ hotels into MongoDB |
| Client | `npm run dev` | Vite dev server on port 5173 |
| Client | `npm run build` | Production build |
| Server | `npm run server` | nodemon dev server on port 4000 |
| Server | `npx serverless deploy --stage prod` | Deploy to AWS Lambda |
| Server | `npx jest --verbose` | Run test suite (8/8) |

---

Built with ❤️ by [Mayank Singh](https://mayankcodes.dev)
