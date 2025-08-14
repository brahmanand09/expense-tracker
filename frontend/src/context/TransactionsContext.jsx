import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { createTransaction, getSummary, listTransactions, retryPending } from '../api.js';
import { flushOffline, loadOffline, saveOffline } from '../offlineQueue.js';

const TxCtx = createContext(null);

export function TransactionsProvider({ children }) {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ totalInr: 0, totalCount: 0, pendingCount: 0, categories: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queueCount, setQueueCount] = useState(loadOffline().length);

  useEffect(() => {
    function handleOnline() { setIsOnline(true); }
    function handleOffline() { setIsOnline(false); }
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  async function refreshAll() {
    setLoading(true);
    try {
      const [tx, sum] = await Promise.all([listTransactions(), getSummary()]);
      setTransactions(tx);
      setSummary(sum);
      setError('');
    } catch (e) {
      setError(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refreshAll(); }, []);

  async function addTransaction(payload) {
    // Ensure UTC timestamp from client side as fallback
    const ts = new Date().toISOString();
    const body = { ...payload, timestampUtc: ts };

    if (!isOnline) {
      saveOffline(body);
      setQueueCount(q => q + 1);
      // optimistic add
      setTransactions(prev => [{ ...body, id: `local-${Date.now()}`, pending_conversion: body.currency === 'USD' ? 1 : 0, amount_in_inr: body.currency === 'INR' ? Number(body.amount.toFixed(2)) : null }, ...prev]);
      // summary optimistic update (approx; INR ok, USD will reflect when synced)
      setSummary(s => ({ ...s, totalCount: s.totalCount + 1 }));
      return { offline: true };
    }
    const created = await createTransaction(body);
    // refresh after creation to keep summary accurate
    await refreshAll();
    return created;
  }

  async function syncOffline() {
    if (!isOnline) return { ok: false, message: 'Offline' };
    const results = await flushOffline(createTransaction);
    setQueueCount(loadOffline().length);
    await refreshAll();
    return { ok: true, results };
  }

  async function convertPendingNow() {
    const res = await retryPending();
    await refreshAll();
    return res;
  }

  const value = useMemo(() => ({
    transactions, summary, loading, error, isOnline, queueCount,
    addTransaction, refreshAll, syncOffline, convertPendingNow
  }), [transactions, summary, loading, error, isOnline, queueCount]);

  return <TxCtx.Provider value={value}>{children}</TxCtx.Provider>;
}

export function useTx() {
  const ctx = useContext(TxCtx);
  if (!ctx) throw new Error('useTx must be used within TransactionsProvider');
  return ctx;
}
