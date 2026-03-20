# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BEMSIS is a barangay event management and resident information system. It is a full-stack application built with **Laravel 12** (PHP 8.2+) backend, **React 19** (TypeScript) frontend, connected via **Inertia.js**. Database is **PostgreSQL**. UI uses **Shadcn/UI** components with **Tailwind CSS**.

## Common Commands

### Development
```bash
composer run dev          # Starts Laravel server + queue worker + log viewer + Vite dev server concurrently
npm run dev               # Vite dev server only
php artisan serve         # Laravel server only
```

### Build
```bash
npm run build             # Production frontend build
npm run build:ssr         # SSR build
```

### Code Quality
```bash
npm run lint              # ESLint with auto-fix
npm run format            # Prettier format
npm run format:check      # Check formatting without writing
npm run types             # TypeScript type checking (tsc --noEmit)
```

### Database
```bash
php artisan migrate               # Run migrations
php artisan migrate:fresh --seed   # Reset and seed database
```

### Tests
```bash
php artisan test                          # Run all tests
php artisan test --filter=TestClassName   # Run a single test class
php artisan test tests/Feature/SomeTest.php  # Run a specific test file
```

## Architecture

### Backend (Laravel)

Controllers are organized by **user role** under `app/Http/Controllers/`:
- `Captain/` — System admin: event approval/decline, user activation
- `Secretary/` — Event coordinator: event CRUD, QR attendance scanning, certificates, announcements
- `Partner/` — External agencies: event creation, profile management
- `Resident/` — Community members: event registration, feedback, certificate viewing
- `Auth/` — Login, register, password reset, device verification
- `Api/` — Sanctum-authenticated endpoints (user status)

**Middleware** enforces role-based access (`CaptainMiddleware`, `SecretaryMiddleware`, `PartnerMiddleware`, `ResidentMiddleware`). Session activity tracking via `SessionActivityMiddleware`.

Routes are in `routes/web.php` (Inertia pages, grouped by role middleware) and `routes/api.php` (Sanctum token auth).

### Frontend (React + Inertia)

Pages mirror the role-based controller structure under `resources/js/pages/`:
- `Auth/`, `Captain/`, `Secretary/`, `Partner/`, `Resident/`

Each page component receives typed props from its corresponding controller via `Inertia::render()`.

Reusable components live in `resources/js/components/` with Shadcn UI primitives in `components/ui/`.

Path alias `@/*` maps to `resources/js/*` (configured in tsconfig and vite).

### Key Models and Relationships

- **User** — Has role (resident, partner_agency, secretary, captain), status (pending/approved/declined), lockout fields, online tracking
- **Event** — Created by users, scoped to puroks (JSON array of purok IDs), has approval workflow, supports partner feedback/certificates
- **Attendance** — Links users to events with time_in/time_out
- **Purok** — Administrative subdivision; users and events belong to puroks
- **Certificate** — Generated per event attendance with unique certificate_code
- **Feedback** — Event feedback with comments and integer rating

### Security Features

- Account lockout after 5 failed login attempts (15-minute cooldown)
- Device verification with trusted device tokens
- OTP-based password reset
- QR code-based attendance tracking (simplesoftwareio/simple-qrcode)

## Code Style

- **PHP**: Laravel conventions, Eloquent ORM
- **TypeScript**: Strict mode enabled
- **Formatting**: Prettier with single quotes, semicolons, 150 char width, Tailwind class sorting plugin
- **CSS**: Tailwind utility classes; dark mode is set up but forced to light mode in `app.tsx`
