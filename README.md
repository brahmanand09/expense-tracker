# Expense Tracker (Full Stack)

A complete offline-capable expense tracker with USD→INR currency conversion, category-wise breakdown, and persistent storage.

---

## Features

- **Currency Exchange Integration**: Fetch USD→INR rate from API, cached for 15 minutes and stored in SQLite.
- **Transaction Input**: Add amount, currency (INR/USD), category (Food/Travel/Utilities/Other), and optional description.
- **Summary View**: Total spend in INR, total transaction count, category-wise breakdown (pie chart with consistent colors).
- **Offline Mode**: Transactions stored locally when offline and synced later.
- **Pending Conversion**: USD transactions without available rate are stored pending and converted later.
- **Validation**: Reject zero/negative amounts, limit description to 100 characters.
- **Timestamps**: Stored in UTC, displayed in local time.

---

## Tech Stack

### Backend
- Node.js + Express
- SQLite (better-sqlite3)
- Node-fetch for currency API

### Frontend
- React + Vite
- Context API for state management
- Recharts for category pie chart

---

## Setup

### Clone the repository

git clone https://github.com/your-username/expense-tracker.git

cd expense-tracker

### Backend Setup
- cd backend
- npm install
- npm run start   # or: npm start

Backend will run on: http://localhost:4000

### Frontend Setup
- cd frontend
- npm install
- echo "VITE_API_URL=http://localhost:4000/api" > .env
- npm run dev

Frontend will run on: http://localhost:5173

##  API Overview

| Method | Endpoint                          | Description             |
| ------ | --------------------------------- | ----------------------- |
| GET    | `/api/health`                     | Health check            |
| GET    | `/api/rate`                       | Get cached USD→INR rate |
| POST   | `/api/rate/refresh`               | Force refresh rate      |
| GET    | `/api/transactions`               | List all transactions   |
| POST   | `/api/transactions`               | Add transaction         |
| GET    | `/api/transactions/summary`       | Get summary data        |
| POST   | `/api/transactions/retry-pending` | Convert all pending USD |

## Additional Notes
API cache TTL: 15 minutes.

If API is unavailable, USD transactions are stored as pending and converted when the rate becomes available.

Category colors in the pie chart are consistent across refreshes

## License
MIT

