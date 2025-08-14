# Expense Tracker Frontend (React + Vite)

Implements:
- Transaction form with validation (amount > 0, description ≤ 100 chars).
- Real-time summary (total INR, transaction count, category breakdown via pie chart).
- Consistent category colors.
- Offline-first input: if the backend is unreachable or you are offline, transactions are queued locally and can be synced later.
- Local-time display; server stores UTC.

## Run locally
```bash
cd frontend
npm install
npm run dev
# App: http://localhost:5173
```

Configure API URL via `.env`:
```env
VITE_API_URL=http://localhost:4000/api
```

## Notes
- Use the **Sync Offline Queue** button to push locally queued transactions when you’re back online.
- Use **Convert Pending Now** to ask the server to convert any USD rows that were saved without a rate.
