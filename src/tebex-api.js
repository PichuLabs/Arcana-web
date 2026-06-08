// Shared Tebex Headless API config + fetch helper. Imported by both
// store.js (catalog) and cart.js (multi-item checkout).

export const TEBEX_PUBLIC_TOKEN = '12zus-4d1005bc1bb8a3d924ee9f25bf107d981399ae5d';
export const HEADLESS_BASE = 'https://headless.tebex.io/api';

export async function tebexApi(path, options) {
  const res = await fetch(HEADLESS_BASE + path, options);
  if (!res.ok) {
    let body = '';
    try { body = await res.text(); } catch (_) {}
    throw new Error(`Tebex API ${res.status} on ${path}: ${body}`);
  }
  return res.json();
}

export function formatPrice(amount, currency) {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount);
  } catch (_) {
    return `${currency} ${amount}`;
  }
}
