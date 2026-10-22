# EventHub — Ticket Booking System

A full-stack ticket booking app built for ITUE301 / AWDF practical exam (24IT088).

**Stack:** React + Vite (frontend) · Express + Node.js (backend) · MongoDB (database) · JWT auth

---

## Prerequisites

- [Node.js LTS](https://nodejs.org/) (v18+)
- MongoDB running locally **or** a MongoDB Atlas connection string

---

## Quick Start

### 1. Clone the repo

```bash
git clone https://github.com/Yash-Senjaliya12/itue301-exam-24it088-A2.git
cd itue301-exam-24it088-A2/EventHub
```

### 2. Backend setup

```bash
cd backend
npm install
```

Copy the example env file and fill in your values:

```bash
# Windows PowerShell
Copy-Item .env.example .env

# macOS / Linux
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/eventhub
JWT_SECRET=replace_with_a_long_random_secret_min_32_chars
```

> ⚠️ **Never commit `.env`** — it is in `.gitignore`. Only `.env.example` is committed.

Start the backend:

```bash
# Production / grading
node server.js

# or
npm start

# Development (auto-restart on save)
npm run dev
```

The server starts on **http://localhost:5000**

On first run, demo accounts and sample events are seeded automatically:

| Role | Email | Password |
|------|-------|----------|
| Attendee | `attendee@eventhub.com` | `123456` |
| Organizer | `organizer@eventhub.com` | `123456` |

---

### 3. Frontend setup (new terminal)

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## API Reference

| Method | Path | Auth |
|--------|------|------|
| `POST` | `/api/v1/auth/register` | Public |
| `POST` | `/api/v1/auth/login` | Public |
| `GET` | `/api/v1/events` | Public |
| `POST` | `/api/v1/tickets` | Bearer token |
| `GET` | `/api/v1/tickets/my` | Bearer token |
| `PATCH` | `/api/v1/tickets/:id/status` | Bearer token |
| `POST` | `/api/v1/events` | Bearer token (organizer) |

All protected routes require: `Authorization: Bearer <token>`

### Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{ "email": "attendee@eventhub.com", "password": "123456" }
```

### Book tickets

```http
POST /api/v1/tickets
Authorization: Bearer <token>
Content-Type: application/json

{ "eventId": "<id from GET /events>", "quantity": 2 }
```

---

## Project Structure

```
EventHub/
├── backend/
│   ├── server.js        # Express app entry point
│   ├── models.js        # Mongoose schemas
│   ├── .env.example     # ✅ committed — template only
│   ├── .env             # ❌ NOT committed — your real secrets
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── AuthContext.jsx
│   │   ├── pages/
│   │   └── components/
│   └── package.json
├── .gitignore
└── README.md
```

---

## Notes

- Ticket booking uses atomic inventory decrement to prevent overbooking.
- Cancelling a ticket restores its inventory.
- The Organizer panel is lazy-loaded and role-protected.
- For production: use MongoDB transactions, rotate JWT secrets, and remove demo credentials.
