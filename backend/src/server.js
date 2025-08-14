import express from 'express';
import cors from 'cors';
import { db } from './db.js';
import { getCachedRate, forceRefreshRate } from './rateCache.js';
import transactionsRouter from './routes/transactions.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, utc: new Date().toISOString() });
});

// Rate endpoints
app.get('/api/rate', (req, res) => {
  const cached = getCachedRate();
  res.json(cached);
});

(async () => {
  try {
    await forceRefreshRate();
    console.log("Initial USD→INR rate fetched successfully.");
  } catch (err) {
    console.warn("Could not fetch initial rate:", err.message);
  }
})();

app.post('/api/rate/refresh', async (req, res) => {
  try {
    const updated = await forceRefreshRate();
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Transactions
app.use('/api/transactions', transactionsRouter);

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
