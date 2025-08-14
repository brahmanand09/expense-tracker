import React, { useState } from 'react';
import { useTx } from '../context/TransactionsContext.jsx';

const categories = ['Food','Travel','Utilities','Other'];

export default function TransactionForm() {
  const { addTransaction, isOnline } = useTx();
  const [form, setForm] = useState({ amount: '', currency: 'INR', category: 'Food', description: '' });
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');

  function onChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name === 'amount' ? value.replace(/[^0-9.]/g,'') : value }));
  }

  function validate() {
    const amount = Number(form.amount);
    if (!amount || amount <= 0) return 'Amount must be greater than 0';
    if (form.description && form.description.length > 100) return 'Description must be ≤ 100 characters';
    return '';
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErr(''); setOk('');
    const v = validate();
    if (v) { setErr(v); return; }
    const payload = { amount: Number(form.amount), currency: form.currency, category: form.category, description: form.description || undefined };
    try {
      const res = await addTransaction(payload);
      if (res?.offline) setOk('Saved offline. Will sync when online.');
      else setOk('Transaction added.');
      setForm({ amount: '', currency: form.currency, category: 'Food', description: '' });
    } catch (e) {
      setErr(e.message || 'Failed to add');
    }
  }

  return (
    <div className="card">
      <h2>Add Transaction</h2>
      <form onSubmit={onSubmit}>
        <label>Amount</label>
        <input name="amount" placeholder="e.g. 250" value={form.amount} onChange={onChange} />
        <div className="row">
          <div style={{ flex: 1 }}>
            <label>Currency</label>
            <select name="currency" value={form.currency} onChange={onChange}>
              <option value="INR">INR</option>
              <option value="USD">USD</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label>Category</label>
            <select name="category" value={form.category} onChange={onChange}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <label>Description (optional, ≤ 100 chars)</label>
        <input name="description" placeholder="Note..." value={form.description} onChange={onChange} />
        {err && <div className="error">{err}</div>}
        <div className="row" style={{ marginTop: 10 }}>
          <button type="submit">Save</button>
          {!isOnline && <span className="muted">Offline mode</span>}
        </div>
        {ok && <div className="muted" style={{ marginTop: 8 }}>{ok}</div>}
      </form>
    </div>
  );
}
