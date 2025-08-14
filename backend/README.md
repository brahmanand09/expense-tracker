# Expense Tracker Backend (Node.js + Express + SQLite)

Implements:
- USD→INR exchange rate with 15‑minute cache (persisted in SQLite).
- Transactions stored in SQLite with original currency and converted INR amount.
- Offline handling: if rate unavailable, USD transactions are stored with `pending_conversion=1` and converted automatically when a rate is fetched later.
- Validation: amount must be positive, description ≤ 100 chars.
- UTC timestamps stored; clients display in local time.
- Summary endpoint returns total INR, total count, pending count, and category totals.

## Endpoints
- `GET /api/health`
- `GET /api/rate` → current cached rate and freshness
- `POST /api/rate/refresh` → force a refresh from exchangerate.host
- `GET /api/transactions` → list all (newest first)
- `POST /api/transactions` → body: `{ amount, currency:'INR'|'USD', category:'Food'|'Travel'|'Utilities'|'Other', description? }`
- `GET /api/transactions/summary`
- `POST /api/transactions/retry-pending` → attempts to convert all pending USD rows using current cached rate

## Run locally
```bash
cd backend
npm install
npm run start   # or: npm run dev
```
Server runs at `http://localhost:4000`.

Data persisted in `backend/../data/store.sqlite` (auto-created).

## Notes
- Cache TTL: 15 minutes. The last known rate is persisted and loaded at startup.
- On each transaction POST and rate refresh, the server tries to refresh the rate and convert any pending USD transactions.
- All amounts rounded to 2 decimals for INR storage.
