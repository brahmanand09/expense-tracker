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
