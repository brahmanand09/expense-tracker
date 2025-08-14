const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export async function getRate() {
  const res = await fetch(`${API_URL}/rate`);
  if (!res.ok) throw new Error('Failed to fetch rate');
  return res.json();
}

export async function listTransactions() {
  const res = await fetch(`${API_URL}/transactions`);
  if (!res.ok) throw new Error('Failed to fetch transactions');
  return res.json();
}

export async function getSummary() {
  const res = await fetch(`${API_URL}/transactions/summary`);
  if (!res.ok) throw new Error('Failed to fetch summary');
  return res.json();
}

export async function createTransaction(payload) {
  const res = await fetch(`${API_URL}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e?.error ? JSON.stringify(e.error) : 'Failed to create transaction');
  }
  return res.json();
}

export async function retryPending() {
  const res = await fetch(`${API_URL}/transactions/retry-pending`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to retry pending');
  return res.json();
}
