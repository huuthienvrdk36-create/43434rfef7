# Auto Service Platform — PRD (Updated)

## Original Problem Statement
Build a comprehensive automotive service marketplace platform (mobile-first).
Two-sided marketplace: Customers create quotes, Providers respond and manage bookings.
Stack: NestJS + TypeScript + MongoDB + React (mobile-first PWA).

## Architecture

### Backend (NestJS)
- JWT Authentication with bcrypt + Rate Limiting
- Mongoose ODM for MongoDB with indexes
- WebSocket Gateway (Socket.io) for realtime
- EventBus for decoupled notifications
- Push Notifications (Firebase FCM ready)
- Global Exception Filter for consistent errors
- Structured JSON Logging
- Analytics event tracking
- Swagger/OpenAPI documentation

### Frontend (React PWA)
- Mobile-first design (Monobank-inspired)
- Bottom navigation with FAB
- Role-based navigation (Customer/Provider/Admin)
- Context API for auth & notifications
- Socket.io client for realtime
- Empty states & loading states

## What's Been Implemented

### Wave 1-7 — Core Platform ✅
- Auth, Users, Organizations, Branches
- Services, Provider Services, Vehicles
- Quotes, Bookings, Reviews, Favorites
- Notifications, Geo, Ranking, Boost

### Wave 8 — Payments + Disputes + Admin Core ✅
- PaymentsModule with platformFee (15%)
- DisputesModule with status workflow
- AdminModule with dashboard & actions
- Anti-fraud for reviews

### Wave 9 — Production Hardening + Growth System ✅

**BLOCK 1 — Production Hardening:**
- ✅ ENV files (.env.production, .env.staging)
- ✅ Global Exception Filter (consistent JSON errors)
- ✅ Structured JSON Logging (AppLoggerService)
- ✅ Rate Limiting (auth: 10/min, register: 5/min)
- ✅ Validation (class-validator already enabled)

**BLOCK 2 — Performance:**
- ✅ MongoDB Indexes script (create-indexes.ts)
- ✅ Pagination (already in most endpoints)
- ✅ Query optimization

**BLOCK 3 — Push Notifications:**
- ✅ User deviceTokens field
- ✅ PushNotificationService with templates
- ✅ Device token registration endpoints
- ✅ Push types: QUOTE_NEW, BOOKING_CONFIRMED, etc.
- 📝 MOCK: Firebase not connected (production: add firebase-admin)

**BLOCK 4 — Conversion Optimization:**
- ✅ Quote TTL = 24 hours (expiresAt)
- ✅ Fast provider boost (response time affects ranking)
- ✅ Empty states components

**BLOCK 5 — Provider Growth Loop:**
- ✅ Push notification for new quotes
- ✅ EventBus events for QUOTE_CREATED

**BLOCK 6 — Analytics:**
- ✅ AnalyticsService with event tracking
- ✅ AnalyticsEventSchema
- ✅ Events: quote_created, booking_completed, payment_completed, etc.
- ✅ Provider conversion rate calculation

**BLOCK 7 — Release Ready:**
- ✅ Dockerfile for backend
- ✅ docker-compose.yml (backend + mongo + redis)
- ✅ nginx.conf with SSL, rate limiting, WebSocket
- ✅ deploy.sh script
- ✅ backup.sh for MongoDB backups

## API Endpoints Summary

### New Production Endpoints
- POST /api/auth/device-token (register FCM token)
- POST /api/auth/device-token/remove (unregister token)

### Existing Endpoints (see previous PRD)
- Auth, Organizations, Branches, Services
- Quotes, Bookings, Reviews, Favorites
- Payments, Disputes, Admin

## Test Credentials
- **Admin:** admin@autoservice.com / Admin123!
- **Customer:** customer@test.com / Customer123!
- **Provider:** provider@test.com / Provider123!

## Platform Fee
- Fixed: 15%
- Example: 1000₽ → 850₽ provider + 150₽ platform

## Rate Limits
- POST /auth/login: 10 requests/minute per IP
- POST /auth/register: 5 requests/minute per IP

## Quote TTL
- Expires in 24 hours from creation
- Frontend shows countdown timer

## Deployment

### Development
```bash
cd backend && npm run dev
cd frontend && npm start
```

### Production
```bash
chmod +x deploy.sh
./deploy.sh
```

### Docker
```bash
docker-compose up -d
```

## Environment Variables

### Backend (.env.production)
- NODE_ENV=production
- MONGO_URL=mongodb+srv://...
- DB_NAME=auto_platform_prod
- JWT_ACCESS_SECRET=...
- FIREBASE_PROJECT_ID=...
- FIREBASE_PRIVATE_KEY=...
- FIREBASE_CLIENT_EMAIL=...

### Frontend (.env)
- REACT_APP_BACKEND_URL=https://api.yourdomain.com

## Date Log
- 2026-04-04: Wave 1-7 complete (Core Platform)
- 2026-04-04: Wave 8 complete (Payments + Disputes + Admin)
- 2026-04-04: Wave 9 complete (Production Hardening + Growth)

## DONE Criteria ✅
1. ✅ System stable (exception filter, logging)
2. ✅ User returns (push notifications, favorites, garage)
3. ✅ Provider active (fast response boost, new quote push)
4. ✅ Money flows (payments with platform fee)
5. ✅ Ready to launch (Docker, nginx, backups)

## Next Steps (Post-MVP)
- Real Stripe integration
- Firebase Admin SDK connection
- Redis caching for top organizations
- CI/CD pipeline
- Multi-language support
- Native mobile apps (React Native)
