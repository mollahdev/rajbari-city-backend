# Rajbari City - Backend API (রাজবাড়ী সিটি)

Fastify-powered REST API backend for Rajbari City (District ID: 49) digital municipal services platform.

## Features

- 🏥 **Health & Medical**: Blood donation requests & donor directory, doctor chambers & specialists, hospitals & clinics, 24/7 ambulance services.
- 🚨 **Emergency & Safety**: Fire service stations, Police stations and emergency hotlines.
- ⚖️ **Legal & Administration**: Lawyers & advocate directory for Rajbari District Court.
- 📰 **Media & Journalism**: Local daily newspapers, press club, accredited journalists.
- 🎓 **Education & Tuition**: Teachers & tutors matching across Rajbari upazilas.
- 🚗 **Transport**: Rental cars, microbuses, ambulances, and pickup rentals.
- 🔐 **Authentication & Auth**: SMS OTP verification and JWT session management.
- 🧭 **Interactive API Explorer**: Fastify auto-documentation at `/discovery`.

## Requirements

- Node.js (v18+)
- MySQL / MariaDB

## Installation

```bash
npm install
```

## Running the API

```bash
# Development mode with hot-reloading
npm run dev

# Production mode
npm start
```

API server will be running on `http://localhost:5001`.
Interactive API Discovery: `http://localhost:5001/discovery`.
