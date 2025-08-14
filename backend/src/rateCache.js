import fetch from 'node-fetch';
import { db } from './db.js';

const FIFTEEN_MIN_MS = 15 * 60 * 1000;
let inMemory = {
  rate: null,
  fetchedAt: null, // Date instance
};

// Load persisted cache into memory on startup
(() => {
  const row = db.prepare('SELECT rate, fetched_at_utc as fetched FROM exchange_cache WHERE id = 1').get();
  if (row && row.rate && row.fetched) {
    inMemory.rate = row.rate;
    inMemory.fetchedAt = new Date(row.fetched);
  }
})();

function isFresh() {
  if (!inMemory.fetchedAt) return false;
  return (Date.now() - inMemory.fetchedAt.getTime()) < FIFTEEN_MIN_MS;
}

export function getCachedRate() {
  return {
    rate: inMemory.rate,
    fetchedAtUtc: inMemory.fetchedAt ? inMemory.fetchedAt.toISOString() : null,
    isFresh: isFresh()
  };
}

async function fetchLatestRate() {
  const url = 'https://api.exchangerate.host/latest?base=USD&symbols=INR';
  // const url = 'https://open.er-api.com/v6/latest/USD';
  const res = await fetch(url, { timeout: 10000 });
  if (!res.ok) throw new Error(`Exchange API error: ${res.status}`);
  const data = await res.json();
  const rate = data?.rates?.INR;
  if (typeof rate !== 'number') throw new Error('Invalid rate data');
  return rate;
}

function persist(rate) {
  const nowIso = new Date().toISOString();
  db.prepare('UPDATE exchange_cache SET rate = ?, fetched_at_utc = ? WHERE id = 1').run(rate, nowIso);
  inMemory.rate = rate;
  inMemory.fetchedAt = new Date(nowIso);
}

export async function ensureFreshRate() {
  if (isFresh()) return getCachedRate();
  try {
    const rate = await fetchLatestRate();
    persist(rate);
    // Attempt to convert any pending USD transactions now that we have a rate
    convertPendingTransactions(rate);
    return getCachedRate();
  } catch (e) {
    // If fetch fails, we keep whatever we had. It's okay to be stale until it refreshes.
    return getCachedRate();
  }
}

export async function forceRefreshRate() {
  const rate = await fetchLatestRate();
  persist(rate);
  convertPendingTransactions(rate);
  return getCachedRate();
}

function convertPendingTransactions(rate) {
  // Convert only USD pending rows
  const pending = db.prepare('SELECT id, amount, currency FROM transactions WHERE pending_conversion = 1 AND currency = ?').all('USD');
  const update = db.prepare('UPDATE transactions SET amount_in_inr = ?, original_rate = ?, pending_conversion = 0 WHERE id = ?');
  const trx = db.transaction((rows) => {
    rows.forEach((r) => {
      const converted = Number((r.amount * rate).toFixed(2));
      update.run(converted, rate, r.id);
    });
  });
  trx(pending);
}
