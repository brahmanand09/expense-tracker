import { Router } from 'express';
import { db } from '../db.js';
import { ensureFreshRate, getCachedRate } from '../rateCache.js';
import { z } from 'zod';

const router = Router();

const TransactionSchema = z.object({
  amount: z.number().positive(),
  currency: z.enum(['INR','USD']),
  category: z.enum(['Food','Travel','Utilities','Other']),
  description: z.string().max(100).optional().default(''),
  // optional timestamp from client; otherwise server uses now UTC
  timestampUtc: z.string().datetime().optional()
});

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM transactions ORDER BY datetime(timestamp_utc) DESC').all();
  res.json(rows);
});

router.get('/summary', (req, res) => {
  const totalCount = db.prepare('SELECT COUNT(*) as c FROM transactions').get().c;
  const totalsRow = db.prepare('SELECT COALESCE(SUM(amount_in_inr), 0) as totalInr FROM transactions WHERE amount_in_inr IS NOT NULL').get();
  const totalInr = Number(totalsRow.totalInr.toFixed(2));
  const pendingCount = db.prepare('SELECT COUNT(*) as c FROM transactions WHERE pending_conversion = 1').get().c;

  const categories = db.prepare(`
    SELECT category, COALESCE(SUM(amount_in_inr), 0) as totalInr
    FROM transactions
    GROUP BY category
  `).all().map(r => ({ category: r.category, totalInr: Number(r.totalInr.toFixed(2)) }));

  res.json({
    totalInr,
    totalCount,
    pendingCount,
    categories
  });
});

router.post('/', async (req, res) => {
  // Ensure cache is fresh (won't throw if offline; just returns current cached state)
  await ensureFreshRate();
  const parsed = TransactionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { amount, currency, category, description, timestampUtc } = parsed.data;

  // compute converted amount if possible
  let amountInInr = null;
  let originalRate = null;
  let pending = 0;

  if (currency === 'INR') {
    amountInInr = Number(amount.toFixed(2));
  } else if (currency === 'USD') {
    const { rate, isFresh } = getCachedRate();
    if (typeof rate === 'number') {
      amountInInr = Number((amount * rate).toFixed(2));
      originalRate = rate;
    } else {
      // offline or no rate yet
      pending = 1;
    }
  }

  const nowUtc = new Date().toISOString();
  const ts = timestampUtc ?? nowUtc;

  const stmt = db.prepare(`
    INSERT INTO transactions
      (amount, currency, category, description, timestamp_utc, amount_in_inr, original_rate, pending_conversion)
    VALUES (?,?,?,?,?,?,?,?)
  `);
  const info = stmt.run(amount, currency, category, description ?? '', ts, amountInInr, originalRate, pending);

  res.status(201).json({
    id: info.lastInsertRowid,
    amount, currency, category, description,
    timestamp_utc: ts,
    amount_in_inr: amountInInr,
    original_rate: originalRate,
    pending_conversion: pending
  });
});

// Attempt to convert pending transactions manually
import { forceRefreshRate } from '../rateCache.js';

router.post('/retry-pending', async (req, res) => {
  try {
    await forceRefreshRate(); // hamesha fresh rate lo
    const { rate } = getCachedRate();
    if (typeof rate !== 'number') {
      return res.status(503).json({ ok: false, message: 'Could not fetch USD→INR rate.' });
    }

    const pending = db.prepare(
      'SELECT id, amount FROM transactions WHERE pending_conversion = 1 AND currency = ?'
    ).all('USD');

    const update = db.prepare(
      'UPDATE transactions SET amount_in_inr = ?, original_rate = ?, pending_conversion = 0 WHERE id = ?'
    );

    const trx = db.transaction((rows) => {
      rows.forEach((r) => {
        const converted = Number((r.amount * rate).toFixed(2));
        update.run(converted, rate, r.id);
      });
    });

    trx(pending);

    res.json({ ok: true, converted: pending.length, rate });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});


export default router;
