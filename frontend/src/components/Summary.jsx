import React from 'react';
import { useTx } from '../context/TransactionsContext.jsx';
import CategoryPie from './CategoryPie.jsx';

export default function Summary() {
  const { summary, loading, isOnline, queueCount, syncOffline, convertPendingNow } = useTx();

  return (
    <div className="card">
      <h2>Summary</h2>
      {loading ? <div className="muted">Loading…</div> : (
        <>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <Stat label="Total Spend (INR)" value={`₹ ${summary.totalInr.toFixed(2)}`} />
            <Stat label="Total Transactions" value={summary.totalCount} />
            <Stat label="Pending Conversions" value={summary.pendingCount} />
          </div>
          <div className="toolbar">
            <button className="secondary" onClick={syncOffline} disabled={!isOnline || queueCount===0}>
              Sync Offline Queue ({queueCount})
            </button>
            <button className="secondary" onClick={convertPendingNow} disabled={!isOnline}>
              Convert Pending Now
            </button>
          </div>
          <CategoryPie data={summary.categories} />
        </>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="card" style={{ padding: 12 }}>
      <div className="muted" style={{ fontSize: 12 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700 }}>{value}</div>
    </div>
  );
}
