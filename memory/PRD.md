# Auto Service Platform — PRD

## Original Problem Statement
Build a comprehensive automotive service marketplace platform (mobile-first).
Two-sided marketplace: Customers create quotes, Providers respond and manage bookings.
Stack: NestJS + TypeScript + MongoDB + React (mobile-first PWA).

## Architecture

### Backend (NestJS)
- JWT Authentication with bcrypt
- Mongoose ODM for MongoDB
- WebSocket Gateway (Socket.io) for realtime
- EventBus for decoupled notifications
- Swagger/OpenAPI documentation

### Frontend (React)
- Mobile-first design (Monobank-inspired)
- Bottom navigation with FAB
- Role-based navigation (Customer/Provider)
- Context API for auth & notifications
- Socket.io client for realtime

## What's Been Implemented

### Wave 1-7 — Core Platform ✅
All previously implemented features including:
- Auth, Users, Organizations, Branches
- Services, Provider Services, Vehicles
- Quotes, Bookings, Reviews, Favorites
- Notifications, Geo, Ranking, Boost

### Wave 8 — Payments + Disputes + Admin Core (Business Engine) ✅
53. PaymentsModule — payment schema with platformFee (15%)
54. Payment Flow — booking → create payment → confirm (mock)
55. Payment Split — amount → providerAmount + platformFee
56. DisputesModule — dispute schema with reason, status, messages
57. Dispute Flow — booking completed → report problem → admin review
58. AdminModule — dashboard stats, CRUD for all entities
59. Admin Actions — block/unblock users, disable/enable orgs, resolve disputes
60. Anti-fraud — reviews: 1 booking = 1 review, user !== owner, completed only

## API Endpoints Summary

### Payments
- POST /api/payments/create (create payment for booking)
- POST /api/payments/:id/confirm (confirm payment - mock)
- GET /api/payments/my (my payments)
- GET /api/payments/booking/:bookingId (payment by booking)
- GET /api/payments/:id (payment by ID)
- POST /api/payments/:id/refund (admin: refund payment)

### Disputes
- POST /api/disputes (create dispute)
- GET /api/disputes/my (my disputes)
- GET /api/disputes/:id (dispute by ID)
- POST /api/disputes/:id/message (add message)
- PATCH /api/disputes/:id/resolve (admin: resolve dispute)

### Admin
- GET /api/admin/dashboard (stats overview)
- GET /api/admin/users (all users)
- POST /api/admin/users/:id/block (block user)
- POST /api/admin/users/:id/unblock (unblock user)
- GET /api/admin/organizations (all orgs)
- POST /api/admin/organizations/:id/disable (disable org)
- POST /api/admin/organizations/:id/enable (enable org)
- GET /api/admin/bookings (all bookings)
- GET /api/admin/payments (all payments)
- GET /api/admin/disputes (all disputes)
- GET /api/admin/reviews (all reviews)
- POST /api/admin/reviews/:id/hide (hide review)

## Test Data

### Users
- Admin: admin@autoservice.com / Admin123!
- Customer: customer@test.com / Customer123!
- Provider: provider@test.com / Provider123!

### Provider Organization
- Name: Автосервис Тест
- Branch: Центральный филиал
- Address: г. Москва, ул. Тестовая, д. 1

## Platform Fee
- Fixed: 15%
- Example: 1000₽ → 850₽ provider + 150₽ platform

## Anti-Fraud Rules
1. booking.status === 'completed' (only completed)
2. 1 booking = 1 review (no duplicates)
3. user !== organization.ownerId (no self-reviews)

## Date Log
- 2026-04-04: Wave 1-7 complete (Core Platform)
- 2026-04-04: Wave 8 Payments + Disputes + Admin Core complete (Business Engine)
