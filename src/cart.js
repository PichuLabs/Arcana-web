// Shopping cart: state + drawer rendering + multi-item Tebex checkout.
// Persists across reloads via localStorage so users can fill a cart over
// multiple visits before checking out.

import { TEBEX_PUBLIC_TOKEN, tebexApi, formatPrice } from './tebex-api.js';

const CART_KEY = 'arcana_cart';
const LOGIN_KEY = 'arcana_user';

const CHECKOUT_THEME = 'dark';
const CHECKOUT_COLORS = [
  { name: 'primary', color: '#00A3FF' },
  { name: 'secondary', color: '#0088d4' },
];

let cart = loadCart();
const listeners = new Set();

// --- Persistence ---
function loadCart() {
  try {
    const data = JSON.parse(localStorage.getItem(CART_KEY));
    return Array.isArray(data) ? data : [];
  } catch (_) {
    return [];
  }
}

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  listeners.forEach((fn) => fn());
}

// --- Public API ---
export function getCart() {
  return cart.slice();
}

export function getCartCount() {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

export function onCartChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function addToCart(pkg) {
  const existing = cart.find((i) => i.packageId === pkg.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      packageId: pkg.id,
      name: pkg.name,
      image: pkg.image || null,
      price: pkg.total_price ?? pkg.base_price ?? 0,
      currency: pkg.currency || 'USD',
      quantity: 1,
    });
  }
  saveCart();
}

export function updateQuantity(packageId, delta) {
  const item = cart.find((i) => i.packageId === packageId);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity < 1) {
    cart = cart.filter((i) => i.packageId !== packageId);
  }
  saveCart();
}

export function removeFromCart(packageId) {
  cart = cart.filter((i) => i.packageId !== packageId);
  saveCart();
}

export function clearCart() {
  cart = [];
  saveCart();
}

function subtotal() {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// --- Drawer rendering ---
export function renderDrawer() {
  const itemsEl = document.getElementById('cartItems');
  const emptyEl = document.getElementById('cartEmpty');
  const footerEl = document.getElementById('cartFooter');
  const subtotalEl = document.getElementById('cartSubtotal');
  if (!itemsEl || !emptyEl || !footerEl || !subtotalEl) return;

  itemsEl.innerHTML = '';

  if (cart.length === 0) {
    emptyEl.hidden = false;
    footerEl.hidden = true;
    return;
  }

  emptyEl.hidden = true;
  footerEl.hidden = false;

  cart.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'cart-item';

    if (item.image) {
      const img = document.createElement('img');
      img.className = 'cart-item-image';
      img.src = item.image;
      img.alt = '';
      img.loading = 'lazy';
      img.addEventListener('error', () => img.remove());
      row.appendChild(img);
    } else {
      const placeholder = document.createElement('div');
      placeholder.className = 'cart-item-image cart-item-image--placeholder';
      row.appendChild(placeholder);
    }

    const meta = document.createElement('div');
    meta.className = 'cart-item-meta';
    const nameEl = document.createElement('div');
    nameEl.className = 'cart-item-name';
    nameEl.textContent = item.name;
    const priceEl = document.createElement('div');
    priceEl.className = 'cart-item-price';
    priceEl.textContent = formatPrice(item.price, item.currency) + ' each';
    meta.appendChild(nameEl);
    meta.appendChild(priceEl);
    row.appendChild(meta);

    const qty = document.createElement('div');
    qty.className = 'cart-item-qty';
    const dec = document.createElement('button');
    dec.className = 'cart-qty-btn';
    dec.type = 'button';
    dec.textContent = '−';
    dec.addEventListener('click', () => updateQuantity(item.packageId, -1));
    const val = document.createElement('span');
    val.className = 'cart-qty-val';
    val.textContent = item.quantity;
    const inc = document.createElement('button');
    inc.className = 'cart-qty-btn';
    inc.type = 'button';
    inc.textContent = '+';
    inc.addEventListener('click', () => updateQuantity(item.packageId, 1));
    qty.appendChild(dec);
    qty.appendChild(val);
    qty.appendChild(inc);
    row.appendChild(qty);

    const remove = document.createElement('button');
    remove.className = 'cart-item-remove';
    remove.type = 'button';
    remove.setAttribute('aria-label', 'Remove from cart');
    remove.textContent = '×';
    remove.addEventListener('click', () => removeFromCart(item.packageId));
    row.appendChild(remove);

    itemsEl.appendChild(row);
  });

  const currency = cart[0].currency;
  subtotalEl.textContent = formatPrice(subtotal(), currency);
}

// --- Sidebar mini-cart ---
export function renderSidebarCart() {
  const emptyEl = document.getElementById('sidebarCartEmpty');
  const summaryEl = document.getElementById('sidebarCartSummary');
  const countEl = document.getElementById('sidebarCartCount');
  const totalEl = document.getElementById('sidebarCartTotal');
  const badgeEl = document.getElementById('sidebarCartBadge');
  if (!emptyEl || !summaryEl || !countEl || !totalEl || !badgeEl) return;

  const count = getCartCount();
  if (count === 0) {
    emptyEl.hidden = false;
    summaryEl.hidden = true;
    badgeEl.hidden = true;
    return;
  }

  emptyEl.hidden = true;
  summaryEl.hidden = false;
  badgeEl.hidden = false;
  badgeEl.textContent = count > 99 ? '99+' : String(count);
  countEl.textContent = count === 1 ? '1 item' : count + ' items';
  totalEl.textContent = formatPrice(subtotal(), cart[0].currency);
}

// --- Drawer open/close ---
export function openDrawer() {
  const drawer = document.getElementById('cartDrawer');
  const backdrop = document.getElementById('cartBackdrop');
  renderDrawer();
  if (drawer) drawer.classList.add('open');
  if (backdrop) backdrop.classList.add('open');
}

export function closeDrawer() {
  const drawer = document.getElementById('cartDrawer');
  const backdrop = document.getElementById('cartBackdrop');
  if (drawer) drawer.classList.remove('open');
  if (backdrop) backdrop.classList.remove('open');
}

// --- Checkout ---
function getStoredUsername() {
  try {
    const u = JSON.parse(localStorage.getItem(LOGIN_KEY));
    return u && u.username ? u.username : null;
  } catch (_) {
    return null;
  }
}

export async function startCheckout() {
  if (cart.length === 0) return;

  let username = getStoredUsername();
  if (!username) {
    // Open the same styled login modal the sidebar uses, instead of the
    // native browser prompt(). Returns null if the user cancels/closes.
    if (typeof window.requestLogin === 'function') {
      username = await window.requestLogin();
    } else {
      const raw = window.prompt('Enter your Minecraft (Java) username:');
      username = (raw || '').trim();
    }
    if (!username) return;
  }

  const btn = document.getElementById('cartCheckoutBtn');
  const originalLabel = btn ? btn.textContent : 'Checkout';
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Preparing…';
  }

  try {
    const base = location.origin + location.pathname;

    const basketRes = await tebexApi(`/accounts/${TEBEX_PUBLIC_TOKEN}/baskets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        username,
        complete_url: `${base}?purchase=complete${location.hash}`,
        cancel_url: `${base}?purchase=cancel${location.hash}`,
        complete_auto_redirect: true,
      }),
    });
    const ident = (basketRes.data || basketRes).ident;

    for (const item of cart) {
      await tebexApi(`/baskets/${ident}/packages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          package_id: String(item.packageId),
          quantity: item.quantity,
        }),
      });
    }

    const { default: Tebex } = await import('@tebexio/tebex.js');
    Tebex.checkout.init({
      ident,
      theme: CHECKOUT_THEME,
      colors: CHECKOUT_COLORS,
    });
    Tebex.checkout.on('payment:complete', () => {
      clearCart();
      closeDrawer();
    });
    Tebex.checkout.launch();

    if (btn) {
      btn.textContent = originalLabel;
      btn.disabled = false;
    }
  } catch (err) {
    console.error(err);
    if (btn) {
      btn.textContent = 'Try again';
      setTimeout(() => {
        btn.textContent = originalLabel;
        btn.disabled = false;
      }, 2500);
    }
  }
}
