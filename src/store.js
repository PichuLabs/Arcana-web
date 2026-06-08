// Store catalog: fetches Tebex categories, renders products into the main
// content area. The product card's primary action is "Add to Cart".
// Checkout itself lives in cart.js so a buyer can combine multiple items.

import { TEBEX_PUBLIC_TOKEN, tebexApi, formatPrice } from './tebex-api.js';
import { addToCart } from './cart.js';

// --- Catalog cache ---
let allCategories = [];
let catalogLoaded = false;
let catalogPromise = null;

export async function ensureCatalogLoaded() {
  if (catalogLoaded) return;
  if (catalogPromise) return catalogPromise;
  if (!TEBEX_PUBLIC_TOKEN) {
    allCategories = [];
    catalogLoaded = true;
    return;
  }
  catalogPromise = (async () => {
    const result = await tebexApi(
      `/accounts/${TEBEX_PUBLIC_TOKEN}/categories?includePackages=1`
    );
    allCategories = result.data || [];
    catalogLoaded = true;
  })();
  return catalogPromise;
}

export function getTopLevelCategories() {
  return allCategories.filter((c) => !c.parent && hasAnyPackages(c));
}

// Every category, including subcategories, so callers can find a package
// anywhere in the tree (e.g. a Legendary subcategory under Keys).
export function getAllCategories() {
  return allCategories.slice();
}

function childrenOf(parentId) {
  return allCategories.filter((c) => c.parent && c.parent.id === parentId);
}

function hasAnyPackages(category) {
  const direct = (category.packages || []).length;
  const subs = childrenOf(category.id).reduce(
    (sum, s) => sum + ((s.packages || []).length),
    0
  );
  return direct + subs > 0;
}

export function slugFor(cat) {
  if (cat.slug) return cat.slug;
  const fromName = (cat.name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return fromName || String(cat.id);
}

// --- Card rendering ---
function renderCard(pkg, parent) {
  const card = document.createElement('div');
  card.className = 'product-card';

  if (pkg.image) {
    const img = document.createElement('img');
    img.className = 'product-image';
    img.src = pkg.image;
    img.alt = '';
    img.loading = 'lazy';
    img.addEventListener('error', () => img.remove());
    card.appendChild(img);
  }

  const name = document.createElement('h3');
  name.className = 'product-name';
  name.textContent = pkg.name;
  card.appendChild(name);

  if (pkg.description) {
    // div (not p) since the Tebex description may contain block-level
    // elements like <p>, <ul>, <ol>. Authored content is trusted.
    const desc = document.createElement('div');
    desc.className = 'product-desc';
    desc.innerHTML = pkg.description;
    card.appendChild(desc);
  }

  const price = document.createElement('div');
  price.className = 'product-price';
  const amount = pkg.total_price ?? pkg.base_price;
  price.textContent = formatPrice(amount, pkg.currency);
  card.appendChild(price);

  const add = document.createElement('button');
  add.className = 'buy-btn';
  add.type = 'button';
  add.textContent = 'Add to Cart';
  add.addEventListener('click', () => {
    addToCart(pkg);
    const original = add.textContent;
    add.textContent = 'Added ✓';
    add.disabled = true;
    setTimeout(() => {
      add.textContent = original;
      add.disabled = false;
    }, 1200);
  });
  card.appendChild(add);

  parent.appendChild(card);
}

function renderPackageGrid(packages, parent) {
  const grid = document.createElement('div');
  grid.className = 'store-category-grid';
  packages.forEach((pkg) => renderCard(pkg, grid));
  parent.appendChild(grid);
}

// --- Category view (rendered into the main content area) ---
export function renderCategoryView(main, category) {
  main.innerHTML = '';

  const header = document.createElement('section');
  header.className = 'main-card';
  const heading = document.createElement('h1');
  heading.className = 'main-card-heading';
  heading.textContent = category.name;
  header.appendChild(heading);
  const sub = document.createElement('p');
  sub.className = 'main-card-subheading';
  sub.textContent = 'Add packages to your cart. Items in the cart are delivered to your Minecraft account on checkout.';
  header.appendChild(sub);
  main.appendChild(header);

  if (category.packages && category.packages.length) {
    const block = document.createElement('section');
    block.className = 'main-card';
    renderPackageGrid(category.packages, block);
    main.appendChild(block);
  }

  childrenOf(category.id)
    .filter((s) => s.packages && s.packages.length)
    .forEach((sub) => {
      const block = document.createElement('section');
      block.className = 'main-card';

      const subHeading = document.createElement('h3');
      subHeading.className = 'store-subcategory-name';
      subHeading.textContent = sub.name;
      block.appendChild(subHeading);

      renderPackageGrid(sub.packages, block);
      main.appendChild(block);
    });

  if (!main.querySelector('.product-card')) {
    const empty = document.createElement('div');
    empty.className = 'main-card';
    empty.innerHTML = '<p>No packages available in this category yet.</p>';
    main.appendChild(empty);
  }
}
