export function utcToLocal(utcString) {
  try {
    const d = new Date(utcString);
    if (isNaN(d.getTime())) return utcString;
    return d.toLocaleString();
  } catch {
    return utcString;
  }
}
