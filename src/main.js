import './style.css'
import './store.css'

// If we landed via the GitHub Pages 404.html fallback (any path other than
// the SPA root or the legacy /store.html redirect stub), rewrite the URL bar
// to "/" immediately, preserving the hash. No navigation, no flicker.
(() => {
  const p = location.pathname;
  if (p !== '/' && p !== '/index.html' && p !== '/store.html') {
    history.replaceState(null, '', '/' + location.search + location.hash);
  }
})();
import {
  ensureCatalogLoaded,
  getAllCategories,
  getTopLevelCategories,
  renderCategoryView,
  slugFor,
} from './store.js'
import {
  addToCart as cartAddToCart,
  getCartCount,
  onCartChange,
  openDrawer as openCartDrawer,
  closeDrawer as closeCartDrawer,
  renderDrawer as renderCartDrawer,
  renderSidebarCart,
  startCheckout as startCartCheckout,
} from './cart.js'

// --- Configuration ---
const SERVER_ADDRESS = 'play.ArcanaSMP.com';
const SERVER_START = new Date(2026, 3, 25); // April 25, 2026
const ONLINE_UPDATE_INTERVAL = 120000; // 2 minutes
const DISCORD_INVITE_CODE = 'pEzt5NzQa8';
const DISCORD_UPDATE_INTERVAL = 300000; // 5 minutes
const LOGIN_KEY = 'arcana_user';
const AVATAR_SIZE = 64;

// External URLs. Fill these in when the services are live.
const LIVEMAP_URL = ''; // e.g. 'https://map.arcanasmp.com'
const WIKI_URL = '';    // e.g. 'https://wiki.arcanasmp.com'

// Featured package in the sidebar Store card. All keywords must appear in
// the package name (case-insensitive). The first matching package wins. If
// nothing matches, falls back to the first package found in the catalog.
const FEATURED_PACKAGE_KEYWORDS = ['5', 'legendary', 'key'];

// Vote sites. Each entry shows up as a card on the Vote page. Add real URLs
// from your registered server listings (planetminecraft, minecraftservers.org,
// minecraft-mp, topminecraftservers, etc.). Each site typically lets a player
// vote once every 12 or 24 hours and rewards them in-game automatically.
const VOTE_SITES = [
  { name: 'Top Minecraft Servers', url: 'https://topminecraftservers.org/server/43518',                                                  cooldown: '24h' },
  { name: 'PlanetMinecraft',       url: 'https://www.planetminecraft.com/server/arcana-smp-1-21-11-no-p2w-pve-rpg-survival-custom-skills/', cooldown: '24h' },
  { name: 'Minecraft-MP',          url: 'https://minecraft-mp.com/server-s358149',                                                       cooldown: '24h' },
  { name: 'TopG',                  url: 'https://topg.org/minecraft-servers/server-682360',                                              cooldown: '24h' },
  { name: 'Minecraft Buzz',        url: 'https://minecraft.buzz/server/21038',                                                          cooldown: '24h' },
];

// Roadmap items. Edit freely. Status drives the badge color:
//   'inprogress' (blue), 'funding' (orange, actively needs support),
//   'planned' (gold), 'considering' (gray), 'done' (green).
// `funding` is optional: { amount: 30, period: '/ month' } shows a money tag.
// Flat roadmap list. Each item supports an optional `progress` array of
// already-shipped sub-points (rendered as a green-checkmark sub-list under
// the description), and an optional `funding` object that shows a money tag.
const ROADMAP = [
  {
    status: 'inprogress',
    title: 'More ways to attain keys',
    description: "The custom content in our crates is meant to be attained by players, so we want more chances to roll them. We're actively expanding this, with more planned.",
    progress: [
      'Vote parties with generous key drops',
      'Daily quests now give generous key rewards',
      'Daily parkour gives increased rewards to higher ranks',
      'AFK rewards increased for higher ranks',
      'Increased key drop rates, less junk in all crates',
    ],
  },
  {
    status: 'planned',
    title: 'Daily Auctions',
    description: "A system that puts up daily auctions for items players want. The whole server can bid, giving money more of a use and acting as a gold sink. Items like Legendary Keys, but kept modest: the server shouldn't be about having the most money.",
  },
  {
    status: 'planned',
    title: 'Dungeons',
    description: 'Custom dungeon content with its own unique rewards.',
  },
  {
    status: 'inprogress',
    title: 'Furniture Store',
    description: "We've been acquiring asset packs to expand building options. Many packs need custom editing to integrate into the server. The goal is a furniture store where players can pick up custom furniture for their builds.",
  },
  {
    status: 'inprogress',
    title: 'Referral System',
    description: "Our referral plugin was installed a while ago but never fully configured. Once it's live, both the referrer and the referred get rewarded. The referred player keeps earning extra key prizes as they hit playtime milestones, to welcome them onto the server.",
  },
  {
    status: 'funding',
    title: 'Server hardware upgrade',
    description: "We want to upgrade to better, dedicated hardware to give our server the performance it needs to support more content and growth.",
  },
  {
    status: 'inprogress',
    title: 'Website redesign',
    description: "Refreshing the site you're on now: clearer navigation, a real store experience, and a transparent roadmap.",
  },
];

const ROADMAP_STATUS_LABELS = {
  inprogress: 'In Progress',
  funding: 'Needs Funding',
  planned: 'Planned',
  considering: 'Considering',
  done: 'Done',
};

// --- Server status ---
function updateOnline() {
  fetch('https://api.mcstatus.io/v2/status/java/' + SERVER_ADDRESS)
    .then((res) => res.json())
    .then((data) => {
      const sidebarEl = document.getElementById('onlineValue');
      const pillEl = document.getElementById('pillOnlineCount');
      if (data.online) {
        const cur = data.players.online;
        const max = data.players.max;
        if (sidebarEl) sidebarEl.innerHTML = cur + ' <span class="cap">/ ' + max + '</span>';
        if (pillEl) pillEl.textContent = cur + ' / ' + max;
      } else {
        if (sidebarEl) sidebarEl.innerHTML = '0 <span class="cap">/ —</span>';
        if (pillEl) pillEl.textContent = 'offline';
      }
    })
    .catch(() => {
      const sidebarEl = document.getElementById('onlineValue');
      const pillEl = document.getElementById('pillOnlineCount');
      if (sidebarEl) sidebarEl.innerHTML = '0 <span class="cap">/ —</span>';
      if (pillEl) pillEl.textContent = '—';
    });
}

function updateServerAge() {
  const msPerDay = 1000 * 60 * 60 * 24;
  const days = Math.max(0, Math.floor((Date.now() - SERVER_START.getTime()) / msPerDay));
  const el = document.getElementById('serverAge');
  if (el) el.textContent = days + (days === 1 ? ' day' : ' days');
}

// --- Discord member count (via the invite-counts endpoint) ---
function updateDiscordCount() {
  fetch(`https://discord.com/api/v10/invites/${DISCORD_INVITE_CODE}?with_counts=true`)
    .then((res) => res.json())
    .then((data) => {
      const el = document.getElementById('discordOnlineCount');
      if (!el) return;
      const count = data && data.approximate_presence_count;
      el.textContent = typeof count === 'number' ? count.toLocaleString() : '—';
    })
    .catch(() => {
      const el = document.getElementById('discordOnlineCount');
      if (el) el.textContent = '—';
    });
}

// --- Copy IP ---
function copyIP(triggerEl) {
  const ip = SERVER_ADDRESS;

  if (navigator.clipboard) {
    navigator.clipboard.writeText(ip);
  } else {
    const ta = document.createElement('textarea');
    ta.value = ip;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }

  // Always flash the topbar pill so the affordance reads as global.
  const pill = document.querySelector('.server-pill');
  const tooltip = document.getElementById('copyTooltip');
  if (pill && tooltip) {
    pill.classList.add('copied');
    tooltip.textContent = 'IP Copied!';
    tooltip.classList.add('show');
    setTimeout(() => {
      pill.classList.remove('copied');
      tooltip.classList.remove('show');
    }, 2000);
  }

  // Also flash whatever element was actually clicked (e.g., the inline body code).
  if (triggerEl && triggerEl !== pill) {
    triggerEl.classList.add('copied');
    setTimeout(() => triggerEl.classList.remove('copied'), 1500);
  }
}
window.copyIP = copyIP;

// Any element with .copyable-ip becomes a click-to-copy IP control.
document.addEventListener('click', (e) => {
  const el = e.target.closest('.copyable-ip');
  if (!el) return;
  e.preventDefault();
  copyIP(el);
});

// --- Login (stored in localStorage; Minecraft head avatar from mc-heads.net) ---
export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(LOGIN_KEY));
  } catch (_) {
    return null;
  }
}

function setStoredUser(username) {
  const user = {
    username,
    head: `https://mc-heads.net/avatar/${encodeURIComponent(username)}/${AVATAR_SIZE}`,
  };
  localStorage.setItem(LOGIN_KEY, JSON.stringify(user));
  return user;
}

function clearStoredUser() {
  localStorage.removeItem(LOGIN_KEY);
}

function renderLoginState() {
  const user = getStoredUser();

  const topbarLoginBtn = document.getElementById('topbarLoginBtn');

  const cardEmpty = document.getElementById('loginCardEmpty');
  const cardUser = document.getElementById('loginCardUser');
  const cardHead = document.getElementById('loginCardHead');
  const cardName = document.getElementById('loginCardName');

  if (user) {
    topbarLoginBtn.hidden = true;

    cardEmpty.hidden = true;
    cardUser.hidden = false;
    cardHead.src = user.head;
    cardHead.alt = user.username;
    cardName.textContent = user.username;
  } else {
    topbarLoginBtn.hidden = false;

    cardEmpty.hidden = false;
    cardUser.hidden = true;
  }
}

// When the login modal is opened via window.requestLogin() (e.g., from the
// cart checkout flow), this Promise's resolver is stored here so that
// submitLogin / closeLoginModal can fulfill it. null otherwise.
let pendingLoginResolve = null;

function openLoginModal() {
  const modal = document.getElementById('loginModal');
  const input = document.getElementById('loginUsername');
  modal.hidden = false;
  input.value = '';
  setTimeout(() => input.focus(), 30);
}

function closeLoginModal() {
  document.getElementById('loginModal').hidden = true;
  if (pendingLoginResolve) {
    const resolve = pendingLoginResolve;
    pendingLoginResolve = null;
    resolve(null);
  }
}

function submitLogin() {
  const input = document.getElementById('loginUsername');
  const name = (input.value || '').trim();
  if (!name) return;
  setStoredUser(name);
  document.getElementById('loginModal').hidden = true;
  renderLoginState();
  if (pendingLoginResolve) {
    const resolve = pendingLoginResolve;
    pendingLoginResolve = null;
    resolve(name);
  }
}

// Exposed for the cart checkout flow: opens the same styled modal as the
// sidebar Log In button and resolves with the username (or null if the user
// cancels). Replaces the old window.prompt() fallback in cart.js.
window.requestLogin = function requestLogin() {
  return new Promise((resolve) => {
    // If something else already had a pending resolver, cancel it (resolve null)
    // before opening fresh.
    if (pendingLoginResolve) {
      const stale = pendingLoginResolve;
      pendingLoginResolve = null;
      stale(null);
    }
    pendingLoginResolve = resolve;
    openLoginModal();
  });
};

function logout() {
  clearStoredUser();
  renderLoginState();
}

// --- Hash router ---
const STATIC_ROUTES = new Set(['home', 'livemap', 'rules', 'wiki', 'vote', 'roadmap']);

function currentRoute() {
  const hash = location.hash.replace(/^#/, '');
  if (!hash) return { name: 'home' };
  if (STATIC_ROUTES.has(hash)) return { name: hash };
  const parts = hash.split('/');
  if (parts[0] === 'store' && parts[1]) {
    return { name: 'category', slug: parts[1] };
  }
  return { name: 'home' };
}

function setActiveNav(routeKey) {
  document.querySelectorAll('.category-item').forEach((item) => {
    item.classList.toggle('active', item.dataset.route === routeKey);
  });
  // The mobile topnav Store link uses data-route="store" so it highlights
  // whenever the current route is any store/<slug> category.
  const storeLink = document.querySelector('[data-route="store"]');
  if (storeLink) {
    const onStoreRoute = location.hash.replace(/^#/, '').indexOf('store/') === 0;
    storeLink.classList.toggle('active', onStoreRoute);
  }
}

function renderHome(main) {
  main.innerHTML = '';

  // Hero
  const hero = document.createElement('section');
  hero.className = 'home-hero';
  hero.innerHTML = `
    <div class="home-hero-eyebrow">Welcome to Arcana</div>
    <h1 class="home-hero-title">A chill Minecraft server<br>built for adults.</h1>
    <div class="home-hero-tags">
      <span class="home-hero-tag home-hero-tag--worldgen">Custom World Gen</span>
      <span class="home-hero-tag home-hero-tag--skills">Custom Skills</span>
      <span class="home-hero-tag home-hero-tag--rpg">Custom RPG</span>
      <span class="home-hero-tag home-hero-tag--economy">Economy</span>
      <span class="home-hero-tag home-hero-tag--balance">Balanced Progression</span>
      <span class="home-hero-tag home-hero-tag--chill">Chill Vibes</span>
    </div>
    <div class="home-hero-cta">
      <div class="mini-pill copyable-ip" title="Click to copy IP">
        <div class="mini-pill-text">
          <span class="mini-pill-title">Play Now</span>
          <span class="mini-pill-value">play.ArcanaSMP.com</span>
        </div>
      </div>
      <a class="mini-pill discord-mini-pill" href="https://discord.gg/pEzt5NzQa8" target="_blank" rel="noopener">
        <span class="mini-pill-icon discord-mini-icon">
          <svg viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
        </span>
        <div class="mini-pill-text">
          <span class="mini-pill-title">Join</span>
          <span class="mini-pill-value">Discord</span>
        </div>
      </a>
    </div>
  `;
  main.appendChild(hero);

  // About
  const about = document.createElement('section');
  about.className = 'main-card';
  about.innerHTML = `
    <h1 class="main-card-heading">About the server</h1>
    <p class="main-card-subheading">A small, community-run Minecraft world. Not a business.</p>
    <div class="main-card-body">
      <p>ArcanaSMP is a long-term survival multiplayer server built around <strong>balanced progression and chill vibes</strong>. We run <strong>custom plugins developed uniquely for our server</strong>, so the experience is one you won't find anywhere else. We're a place to mine, fish, farm, build, and just vibe with other chill adults.</p>
      <p>Every dollar from the store goes straight back into the server: hosting, plugins, events, development, and assets/art costs.</p>
    </div>
  `;
  main.appendChild(about);

}

function renderLiveMap(main) {
  main.innerHTML = '';

  const card = document.createElement('section');
  card.className = 'main-card';

  if (LIVEMAP_URL) {
    card.innerHTML = `
      <h1 class="main-card-heading">Live Map</h1>
      <p class="main-card-subheading">Browse the world from your browser. Use the link below to open the full map in a new tab.</p>
      <a class="external-link-btn" href="${LIVEMAP_URL}" target="_blank" rel="noopener">Open Full Map &rarr;</a>
    `;
    main.appendChild(card);

    const embed = document.createElement('section');
    embed.className = 'main-card';
    embed.innerHTML = `<iframe class="map-iframe" src="${LIVEMAP_URL}" loading="lazy" referrerpolicy="no-referrer"></iframe>`;
    main.appendChild(embed);
  } else {
    card.innerHTML = `
      <h1 class="main-card-heading">Live Map</h1>
      <p class="main-card-subheading">Coming soon.</p>
      <div class="main-card-body">
        <p>The live world map is being set up. Once it's live, you'll be able to explore the server from your browser right here.</p>
      </div>
    `;
    main.appendChild(card);
  }
}

function renderRules(main) {
  main.innerHTML = '';

  const card = document.createElement('section');
  card.className = 'main-card';
  card.innerHTML = `
    <h1 class="main-card-heading">Server Rules</h1>
    <p class="main-card-subheading">By playing on our server, you agree to abide by our rules. Breaking any of these rules may result in a ban, at the discretion of the staff members. Different severity of punishments will apply depending on the infraction. Rules are subject to change.</p>
  `;
  main.appendChild(card);

  const rules = document.createElement('section');
  rules.className = 'main-card';
  rules.innerHTML = `
    <ol class="rules-list">
      <li>
        <strong>No Griefing.</strong> Respect others' creations and property. No destroying or stealing.
        <div class="rule-sub">TP killing, border griefing, scamming, and other disruptive behavior will not be tolerated.</div>
      </li>
      <li><strong>Be Respectful.</strong> Treat all players kindly. No harassment, hate speech of any kind, or offensive behavior.</li>
      <li>
        <strong>No Cheating.</strong> No hacks, cheat clients, duping, or unfair advantages.
        <div class="rule-sub">This means no macros, autoclicking, or autofishing.</div>
      </li>
      <li>
        <strong>Alt Account Usage.</strong> A maximum of one alternate Minecraft account is allowed for AFK / chunk-load purposes.
        <div class="rule-sub">Auto farms have to be kept within reasonable limits as to not lag the server. Farms must be loaded by a player. Automated chunk loading is considered an exploit.</div>
      </li>
      <li><strong>No Exploiting.</strong> If you are unsure whether something is an exploit, check with a staff member first before attempting to use it.</li>
      <li><strong>Clean Chat.</strong> Keep chat appropriate and friendly.</li>
      <li><strong>Report Issues.</strong> Report problems and rule violations to staff.</li>
    </ol>
  `;
  main.appendChild(rules);
}

function renderVote(main) {
  main.innerHTML = '';

  const header = document.createElement('section');
  header.className = 'main-card';
  header.innerHTML = `
    <h1 class="main-card-heading">Vote</h1>
    <p class="main-card-subheading">Voting helps us climb the server lists and brings new players to ArcanaSMP. Every vote rewards you in-game.</p>
  `;
  main.appendChild(header);

  const wrap = document.createElement('section');
  wrap.className = 'main-card';

  if (!VOTE_SITES.length) {
    wrap.innerHTML = `
      <p>Vote links are being set up. Check back soon, or ask in <a href="https://discord.gg/${DISCORD_INVITE_CODE}" target="_blank" rel="noopener">Discord</a> if you'd like to help spread the word.</p>
    `;
    main.appendChild(wrap);
    return;
  }

  const grid = document.createElement('div');
  grid.className = 'vote-grid';

  VOTE_SITES.forEach((site) => {
    const card = document.createElement('a');
    card.className = 'vote-card';
    card.href = site.url;
    card.target = '_blank';
    card.rel = 'noopener';

    const icon = document.createElement('div');
    icon.className = 'vote-card-icon';
    icon.textContent = '⭐';
    card.appendChild(icon);

    const meta = document.createElement('div');
    meta.className = 'vote-card-meta';

    const name = document.createElement('div');
    name.className = 'vote-card-name';
    name.textContent = site.name;
    meta.appendChild(name);

    const sub = document.createElement('div');
    sub.className = 'vote-card-sub';
    sub.textContent = site.cooldown ? `Vote every ${site.cooldown}` : 'Vote now';
    meta.appendChild(sub);

    card.appendChild(meta);

    const cta = document.createElement('div');
    cta.className = 'vote-card-cta';
    cta.textContent = 'Vote →';
    card.appendChild(cta);

    grid.appendChild(card);
  });

  wrap.appendChild(grid);
  main.appendChild(wrap);
}

function renderRoadmap(main) {
  main.innerHTML = '';

  const header = document.createElement('section');
  header.className = 'main-card main-card--compact';
  header.innerHTML = `<h1 class="main-card-heading">Server Roadmap</h1>`;
  main.appendChild(header);

  const wrap = document.createElement('section');
  wrap.className = 'main-card';
  const list = document.createElement('ul');
  list.className = 'roadmap-list';

  ROADMAP.forEach((item) => {
    const li = document.createElement('li');
    li.className = 'roadmap-item';

    const status = document.createElement('span');
    status.className = `roadmap-status roadmap-status--${item.status}`;
    status.textContent = ROADMAP_STATUS_LABELS[item.status] || item.status;
    li.appendChild(status);

    const content = document.createElement('div');
    content.className = 'roadmap-content';

    const title = document.createElement('div');
    title.className = 'roadmap-title';
    title.textContent = item.title;
    content.appendChild(title);

    const desc = document.createElement('div');
    desc.className = 'roadmap-desc';
    desc.textContent = item.description;
    content.appendChild(desc);

    if (item.progress && item.progress.length) {
      const progressLabel = document.createElement('div');
      progressLabel.className = 'roadmap-progress-label';
      progressLabel.textContent = 'Shipped so far';
      content.appendChild(progressLabel);

      const progressList = document.createElement('ul');
      progressList.className = 'roadmap-progress-list';
      item.progress.forEach((p) => {
        const pli = document.createElement('li');
        pli.textContent = p;
        progressList.appendChild(pli);
      });
      content.appendChild(progressList);
    }

    if (item.funding) {
      const funding = document.createElement('div');
      funding.className = 'roadmap-funding';
      funding.innerHTML = `<strong>$${item.funding.amount}</strong> ${item.funding.period || ''}`.trim();
      content.appendChild(funding);
    }

    li.appendChild(content);
    list.appendChild(li);
  });

  wrap.appendChild(list);
  main.appendChild(wrap);
}

function renderWiki(main) {
  main.innerHTML = '';

  const card = document.createElement('section');
  card.className = 'main-card';

  if (WIKI_URL) {
    card.innerHTML = `
      <h1 class="main-card-heading">Wiki</h1>
      <p class="main-card-subheading">Server lore, build guides, FAQs, and reference material.</p>
      <a class="external-link-btn" href="${WIKI_URL}" target="_blank" rel="noopener">Open Wiki &rarr;</a>
    `;
  } else {
    card.innerHTML = `
      <h1 class="main-card-heading">Wiki</h1>
      <p class="main-card-subheading">Coming soon.</p>
      <div class="main-card-body">
        <p>Documentation, lore, build guides, and FAQs are being put together. Hop in Discord while you wait.</p>
      </div>
    `;
  }
  main.appendChild(card);
}

async function applyRoute() {
  const main = document.getElementById('main-content');
  if (!main) return;

  // Show a quick loading shell while the catalog is fetched the first time.
  let loadFailed = false;
  try {
    await ensureCatalogLoaded();
  } catch (err) {
    console.error(err);
    loadFailed = true;
  }

  const route = currentRoute();
  if (route.name === 'home') {
    renderHome(main);
    setActiveNav('home');
  } else if (route.name === 'livemap') {
    renderLiveMap(main);
    setActiveNav('livemap');
  } else if (route.name === 'rules') {
    renderRules(main);
    setActiveNav('rules');
  } else if (route.name === 'wiki') {
    renderWiki(main);
    setActiveNav('wiki');
  } else if (route.name === 'vote') {
    renderVote(main);
    setActiveNav('vote');
  } else if (route.name === 'roadmap') {
    renderRoadmap(main);
    setActiveNav('roadmap');
  } else if (route.name === 'category') {
    const cat = getTopLevelCategories().find((c) => slugFor(c) === route.slug);
    if (cat) {
      renderCategoryView(main, cat);
      setActiveNav(route.slug);
    } else {
      // Unknown slug. Bounce home.
      history.replaceState({}, '', location.pathname);
      renderHome(main);
      setActiveNav('home');
    }
  }

  if (loadFailed && route.name === 'category') {
    main.innerHTML = '<div class="main-card"><p>Could not load the store. Please try again later.</p></div>';
  }

  // Handle purchase return banner.
  const params = new URLSearchParams(location.search);
  if (params.get('purchase') === 'complete') {
    const banner = document.createElement('div');
    banner.className = 'main-card';
    banner.innerHTML = '<p>Thanks for your purchase! Your items will be delivered in-game shortly.</p>';
    main.prepend(banner);
    history.replaceState({}, '', location.pathname + location.hash);
  } else if (params.get('purchase') === 'cancel') {
    const banner = document.createElement('div');
    banner.className = 'main-card';
    banner.innerHTML = '<p>Checkout cancelled.</p>';
    main.prepend(banner);
    history.replaceState({}, '', location.pathname + location.hash);
  }

  window.scrollTo(0, 0);
}

function categoryIcon(cat) {
  const n = (cat.name || '').toLowerCase();
  if (n.includes('key')) return '🔑';
  if (n.includes('chunk')) return '🗺';
  if (n.includes('cosmetic')) return '✨';
  if (n.includes('rank')) return '⭐';
  return '◆';
}

function makeEmojiIcon(cat) {
  const span = document.createElement('span');
  span.className = 'category-icon';
  span.textContent = categoryIcon(cat);
  return span;
}

// Categories that should render with an actual package image instead of an
// emoji. Looks at the category's first package (or first child sub-package)
// and returns its image URL. Used for Claim Chunks: the grass-block
// art on the Bonus Claim Chunks package doubles as the category icon.
function packageImageForCategoryIcon(cat) {
  const name = (cat.name || '').toLowerCase();
  if (!name.includes('chunk')) return null;

  const pickFromList = (packages) => {
    if (!Array.isArray(packages)) return null;
    const withImage = packages.find((p) => p && p.image);
    return withImage ? withImage.image : null;
  };

  const direct = pickFromList(cat.packages);
  if (direct) return direct;

  // Walk into subcategories too (Tebex returns these as separate entries
  // with `.parent` pointing back at this category).
  const subs = getTopLevelCategories();
  for (const c of subs) {
    if (c.parent && c.parent.id === cat.id) {
      const fromSub = pickFromList(c.packages);
      if (fromSub) return fromSub;
    }
  }
  return null;
}

async function populateSidebarNav() {
  try {
    await ensureCatalogLoaded();
  } catch (_) {
    return;
  }
  const nav = document.getElementById('categoriesNav');
  if (!nav) return;
  nav.innerHTML = '';

  const cats = getTopLevelCategories();
  cats.forEach((cat) => {
    const a = document.createElement('a');
    a.className = 'category-item';
    const slug = slugFor(cat);
    a.href = '#store/' + slug;
    a.dataset.route = slug;

    const iconImageUrl = packageImageForCategoryIcon(cat);
    if (iconImageUrl) {
      const img = document.createElement('img');
      img.className = 'category-icon category-icon-img';
      img.src = iconImageUrl;
      img.alt = '';
      img.loading = 'lazy';
      img.addEventListener('error', () => img.replaceWith(makeEmojiIcon(cat)));
      a.appendChild(img);
    } else {
      a.appendChild(makeEmojiIcon(cat));
    }

    const name = document.createElement('span');
    name.className = 'category-name';
    name.textContent = cat.name;
    a.appendChild(name);

    nav.appendChild(a);
  });

  // Wire the Browse Store button + mobile topnav Store link to the first
  // category, and populate the featured slot.
  if (cats.length) {
    const firstHref = '#store/' + slugFor(cats[0]);
    const browseBtn = document.getElementById('storeBrowseBtn');
    if (browseBtn) browseBtn.href = firstHref;
    const topnavStoreLink = document.getElementById('topnavStoreLink');
    if (topnavStoreLink) topnavStoreLink.href = firstHref;
    renderFeaturedPackage();
  }

  // Re-apply route now that nav exists so the active highlight lands.
  const route = currentRoute();
  setActiveNav(route.name === 'home' ? 'home' : route.slug);
}

function pickFeaturedPackage() {
  // Flatten every package across every category (including subcategories).
  const allPackages = getAllCategories().flatMap((c) => c.packages || []);

  // First pass: a package whose name contains all of the configured keywords.
  if (FEATURED_PACKAGE_KEYWORDS.length) {
    const matched = allPackages.find((p) => {
      if (!p || !p.name) return false;
      const name = p.name.toLowerCase();
      return FEATURED_PACKAGE_KEYWORDS.every((kw) => name.includes(kw.toLowerCase()));
    });
    if (matched) return matched;
  }

  // Fallback: first package in the catalog.
  return allPackages.find((p) => p && p.id) || null;
}

function renderFeaturedPackage() {
  const wrap = document.getElementById('storeFeatured');
  const slot = document.getElementById('storeFeaturedCard');
  if (!wrap || !slot) return;

  const pkg = pickFeaturedPackage();
  if (!pkg) {
    wrap.hidden = true;
    return;
  }
  wrap.hidden = false;
  slot.innerHTML = '';

  const row = document.createElement('div');
  row.className = 'store-featured-row';

  if (pkg.image) {
    const img = document.createElement('img');
    img.className = 'store-featured-img';
    img.src = pkg.image;
    img.alt = '';
    img.loading = 'lazy';
    img.addEventListener('error', () => {
      img.classList.add('store-featured-img--placeholder');
      img.removeAttribute('src');
    });
    row.appendChild(img);
  } else {
    const ph = document.createElement('div');
    ph.className = 'store-featured-img store-featured-img--placeholder';
    row.appendChild(ph);
  }

  const meta = document.createElement('div');
  meta.className = 'store-featured-meta';
  const name = document.createElement('div');
  name.className = 'store-featured-name';
  name.textContent = pkg.name;
  meta.appendChild(name);

  const price = document.createElement('div');
  price.className = 'store-featured-price';
  try {
    price.textContent = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: pkg.currency || 'USD',
    }).format(pkg.total_price ?? pkg.base_price ?? 0);
  } catch (_) {
    price.textContent = (pkg.currency || 'USD') + ' ' + (pkg.total_price ?? pkg.base_price ?? 0);
  }
  meta.appendChild(price);

  row.appendChild(meta);
  slot.appendChild(row);

  const add = document.createElement('button');
  add.className = 'store-featured-add';
  add.type = 'button';
  add.textContent = 'Add to Cart';
  add.addEventListener('click', () => {
    addToCartFromSidebar(pkg, add);
  });
  slot.appendChild(add);
}

function addToCartFromSidebar(pkg, btn) {
  // Cart is imported at the top of this module.
  cartAddToCart(pkg);
  const original = btn.textContent;
  btn.textContent = 'Added ✓';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = original;
    btn.disabled = false;
  }, 1200);
}

// --- Wiring ---
updateOnline();
setInterval(updateOnline, ONLINE_UPDATE_INTERVAL);
updateServerAge();
updateDiscordCount();
setInterval(updateDiscordCount, DISCORD_UPDATE_INTERVAL);

document.getElementById('topbarLoginBtn').addEventListener('click', openLoginModal);
document.getElementById('loginCardBtn').addEventListener('click', openLoginModal);
document.getElementById('loginCardLogout').addEventListener('click', logout);
document.getElementById('loginCancelBtn').addEventListener('click', closeLoginModal);
document.getElementById('loginSubmitBtn').addEventListener('click', submitLogin);
document.getElementById('loginUsername').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') submitLogin();
});
document.getElementById('loginModal').addEventListener('click', (e) => {
  if (e.target.id === 'loginModal') closeLoginModal();
});

// --- Mobile sidebar drawer ---
const sidebarEl = document.querySelector('.sidebar');
const sidebarBackdrop = document.getElementById('sidebarBackdrop');
const hamburgerBtn = document.getElementById('hamburgerBtn');

function openSidebar() {
  if (sidebarEl) sidebarEl.classList.add('open');
  if (sidebarBackdrop) sidebarBackdrop.classList.add('open');
}

function closeSidebar() {
  if (sidebarEl) sidebarEl.classList.remove('open');
  if (sidebarBackdrop) sidebarBackdrop.classList.remove('open');
}

if (hamburgerBtn) hamburgerBtn.addEventListener('click', openSidebar);
if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', closeSidebar);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeSidebar();
});

// --- Cart wiring ---
const sidebarCartCard = document.querySelector('.sidebar-cart-card');

function bumpSidebarCart() {
  if (!sidebarCartCard) return;
  sidebarCartCard.classList.remove('bump');
  // Restart the animation by forcing a reflow.
  void sidebarCartCard.offsetWidth;
  sidebarCartCard.classList.add('bump');
}

document.getElementById('sidebarCartBtn').addEventListener('click', openCartDrawer);
document.getElementById('cartClose').addEventListener('click', closeCartDrawer);
document.getElementById('cartBackdrop').addEventListener('click', closeCartDrawer);
document.getElementById('cartCheckoutBtn').addEventListener('click', startCartCheckout);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeCartDrawer();
});

// Initial render (in case the cart was non-empty from a previous visit).
renderSidebarCart();
// Subscribe to changes: bump the sidebar card on add, also keep the open
// drawer in sync if it's currently visible.
onCartChange(() => {
  renderSidebarCart();
  renderCartDrawer();
  if (getCartCount() > 0) bumpSidebarCart();
});

renderLoginState();
populateSidebarNav();
applyRoute();

window.addEventListener('hashchange', () => {
  closeSidebar();
  applyRoute();
});
