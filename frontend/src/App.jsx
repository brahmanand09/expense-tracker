import React from 'react';
import TransactionForm from './components/TransactionForm.jsx';
import Summary from './components/Summary.jsx';
import TransactionsTable from './components/TransactionsTable.jsx';
import { useTx } from './context/TransactionsContext.jsx';

export default function App() {
  const { error } = useTx();
  return (
    <div className="container">
      <h1>💸 Expense Tracker</h1>
      {error && <div className="card" style={{ border: '1px solid #3b2344', background:'#1c0f28' }}>
        <div className="error">Error: {String(error)}</div>
      </div>}
      <div className="grid">
        <TransactionForm />
        <Summary />
      </div>
      <TransactionsTable />
      <div className="muted" style={{ marginTop: 12 }}>
        * Timestamps are stored in UTC on the server and displayed in your local time here.
      </div>
    </div>
  );
}
