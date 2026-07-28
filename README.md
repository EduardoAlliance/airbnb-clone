# Airbnb Clone

A full-featured vacation rental platform built with Laravel, React, and Inertia.js — featuring property management, real-time availability calendar, booking system with concurrent reservation handling, payment processing, and an admin dashboard.

## Tech Stack

| Layer          | Technology                                      |
| -------------- | ----------------------------------------------- |
| **Backend**    | Laravel 13, PHP 8.4, MariaDB, Redis             |
| **Frontend**   | React 19, TypeScript, Tailwind CSS 4, Radix UI  |
| **Framework**  | Inertia.js (SPA without an API)                 |
| **Queue**      | Redis (queue, cache, sessions)                  |
| **Build**      | Vite 8                                          |
| **Container**  | Docker (multi-stage, Nginx + PHP-FPM)           |

## Features

- User authentication with roles (guest, host, admin) via Laravel Fortify
- Property (cabin) management with media, amenities, and policies
- Per-day inventory and availability calendar with dynamic pricing
- Booking system with `SELECT ... FOR UPDATE` concurrency control
- Payment processing, service fees, and host payouts
- Reviews and ratings
- Notification system with delivery tracking
- Admin dashboard with metrics

## Quick Start with Docker

```bash
# 1. Clone the repository
git clone https://github.com/your-username/airbnb-clone.git
cd airbnb-clone

# 2. Start all services
docker compose up -d

# 3. Access the application
open http://localhost:8080
```

The container will run migrations automatically on first startup.

## Services

| Service    | Port                              |
| ---------- | --------------------------------- |
| App        | `8080` (configurable via `APP_PORT`) |
| Mailpit    | `8025` (email preview)            |

### Environment variables

Copy `.env.example` to `.env` and adjust if needed. The defaults work out of the box with Docker.

## Manual Setup (without Docker)

```bash
# Backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve

# Frontend
npm install
npm run dev
```

Requires PHP 8.4, Composer 2, Node.js 22, MariaDB/MySQL, and Redis.

## Testing

```bash
./vendor/bin/pest
```

## License

[MIT](LICENSE)
