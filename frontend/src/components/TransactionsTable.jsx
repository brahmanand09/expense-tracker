import React from 'react';
import { useTx } from '../context/TransactionsContext.jsx';
import { CATEGORY_COLORS } from '../utils/colors.js';
import { utcToLocal } from '../utils/time.js';

export default function TransactionsTable() {
  const { transactions } = useTx();
  return (
    <div className="card">
      <h2>Transactions</h2>
      <table>
        <thead>
          <tr>
            <th>Date (Local)</th>
            <th>Amount</th>
            <th>Currency</th>
            <th>INR</th>
            <th>Category</th>
            <th>Description</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(tx => (
            <tr key={tx.id}>
              <td>{utcToLocal(tx.timestamp_utc || tx.timestampUtc)}</td>
              <td>{tx.amount}</td>
              <td>{tx.currency}</td>
              <td>{tx.amount_in_inr != null ? `₹ ${tx.amount_in_inr.toFixed(2)}` : '-'}</td>
              <td>
                <span className="badge" style={{ background: CATEGORY_COLORS[tx.category] + '33', color: CATEGORY_COLORS[tx.category] }}>
                  {tx.category}
                </span>
              </td>
              <td>{tx.description || ''}</td>
              <td>
                {tx.pending_conversion ? <span className="badge status-pending">Pending</span> : <span className="badge status-done">Converted</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
