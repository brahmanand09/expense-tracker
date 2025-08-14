const KEY = 'offlineQueue:v1';

export function saveOffline(tx) {
  const q = JSON.parse(localStorage.getItem(KEY) || '[]');
  q.push(tx);
  localStorage.setItem(KEY, JSON.stringify(q));
}

export function loadOffline() {
  return JSON.parse(localStorage.getItem(KEY) || '[]');
}

export function clearOffline() {
  localStorage.removeItem(KEY);
}

export async function flushOffline(postFn) {
  const q = loadOffline();
  const results = [];
  for (const item of q) {
    try {
      const res = await postFn(item);
      results.push({ ok: true, res });
    } catch (e) {
      results.push({ ok: false, error: e.message });
    }
  }
  if (results.every(r => r.ok)) clearOffline();
  return results;
}
