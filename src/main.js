import './style.css'
import { createIcon } from './icons.js'

// If we landed via the GitHub Pages 404.html fallback (any path other than
// the SPA root), rewrite the URL bar to "/" immediately, preserving the hash.
// No navigation, no flicker.
(() => {
  const p = location.pathname;
  if (p !== '/' && p !== '/index.html') {
    history.replaceState(null, '', '/' + location.search + location.hash);
  }
})();

// --- Configuration ---
const SERVER_ADDRESS = 'play.ArcanaSMP.com';
const SERVER_START = new Date(2026, 3, 25); // April 25, 2026
const ONLINE_UPDATE_INTERVAL = 120000; // 2 minutes
const DISCORD_INVITE_CODE = 'pEzt5NzQa8';
const DISCORD_UPDATE_INTERVAL = 300000; // 5 minutes

// External URLs. Fill these in when the services are live.
const LIVEMAP_URL = ''; // e.g. 'https://map.arcanasmp.com'
const WIKI_URL = '';    // e.g. 'https://wiki.arcanasmp.com'

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

// Sidebar quick links. Live Map and Wiki are internal hash routes that
// render a "coming soon" page until their URL constant above is filled in —
// the `soon` flag is derived from that, so the badge disappears on its own
// the moment a real URL is set.
const QUICK_LINKS = [
  { icon: 'discord', name: 'Discord',  href: `https://discord.gg/${DISCORD_INVITE_CODE}`, external: true },
  { icon: 'map', name: 'Live Map', href: '#livemap', soon: !LIVEMAP_URL },
  // No `soon` flag: the wiki route has real sections now, even though
  // WIKI_URL (an external wiki) is still unset.
  { icon: 'wiki', name: 'Wiki',     href: '#wiki' },
];

// The usual microtransaction gates on other servers, listed in the
// no-pay-to-win card. Keep every entry to something a player can actually
// obtain here by playing — the whole point is "paywalled there, earned
// here", so anything that simply doesn't exist on this server (XP
// multipliers, premium currency) belongs in the prose, not this list.
const PAYWALLED_ELSEWHERE = [
  'Ranks',
  'Crate Keys',
  'Powerful Items',
  'Claim Blocks',
  'Kits',
  'Extra Homes',
];

// What the server offers, shown as a grid on the Home page. Edit freely —
// the wording below was drafted from the server MOTD, so tighten it to match
// how each system actually works in-game.
const FEATURES = [
  {
    icon: 'economy',
    title: 'Economy',
    description: 'A player-driven market with shops and a real currency. Money has a purpose beyond the leaderboard.',
  },
  {
    icon: 'jobs',
    title: 'Jobs',
    description: 'Get paid for the work you already enjoy - mining, farming, fishing, building. Pick a profession and earn as you play.',
  },
  {
    icon: 'lands',
    title: 'Lands',
    description: 'Claim your territory so your builds stay yours. Add trusted friends and build together.',
  },
  {
    icon: 'pets',
    title: 'Custom Pets',
    description: 'Companion pets built uniquely for ArcanaSMP. Collect and raise them as you play.',
  },
  {
    icon: 'rpg',
    title: 'Custom RPG',
    description: 'RPG systems layered over survival, so long-term play keeps opening up new things to chase.',
  },
  {
    icon: 'ranks',
    title: 'Ranks',
    description: 'Work your way up through ranks as you progress, unlocking perks along the way.',
  },
];

// Wiki sections. This is a living document — `items` is what's written so
// far, `todo` is what still needs filling in, and both render, so a
// half-finished section is useful instead of blank. Set status to 'ready'
// once a section no longer has gaps; anything else shows a WIP badge.
//
// Everything below is drawn from what the site already states (the rules,
// the roadmap, the feature list, the vote pages). Fill in the `todo` lines
// with real commands and numbers — those are the parts only you can write.
const WIKI_SECTIONS = [
  {
    icon: 'block',
    title: 'Getting Started',
    status: 'ready',
    summary: 'What you need for your first session.',
    items: [
      'ArcanaSMP runs on Minecraft: Java Edition. Add the server address shown in the sidebar and connect.',
      'The version we run is listed on the Play Now card — match it in your launcher profile.',
      'Read the Rules before you build. They are short, and they are enforced.',
      'Join the Discord for announcements, support, and to find people to build with.',
    ],
  },
  {
    icon: 'economy',
    title: 'Economy & Jobs',
    summary: 'How money works and how to earn it.',
    items: [
      'Pick a profession and get paid for work you already do: mining, farming, fishing, building.',
      'Money is spent in the player-driven market and in the daily auctions.',
    ],
    todo: ['Full job list and payout rates', 'Shop and market commands', 'How to set up your own shop'],
  },
  {
    icon: 'lands',
    title: 'Lands & Claiming',
    summary: 'Protecting your builds and sharing them with friends.',
    items: [
      'Claim territory so your builds stay yours — unclaimed builds are not protected.',
      'Trusted friends can be added to a claim so you can build together.',
    ],
    todo: ['Claim commands and how to expand a claim', 'How to earn more claim blocks', 'Trust levels and permission flags'],
  },
  {
    icon: 'key',
    title: 'Crates & Keys',
    summary: 'Keys are earned in-game. They have never been for sale.',
    items: [
      'Vote parties drop keys for everyone online when the server hits a vote goal.',
      'Daily quests reward keys for completing objectives.',
      'Daily parkour and AFK rewards both scale with your rank.',
      'Keys also drop from normal play, and Legendary Keys show up in the daily auctions.',
    ],
    todo: ['Crate list and full reward tables', 'Drop rates per crate tier'],
  },
  {
    icon: 'ranks',
    title: 'Ranks & Progression',
    summary: 'Every rank is earned by playing. None are purchasable.',
    items: [
      'Ranks come from progression and playtime, not from a checkout.',
      'Higher ranks increase daily parkour and AFK rewards.',
    ],
    todo: ['Full rank ladder and requirements', 'Perks unlocked at each rank'],
  },
  {
    icon: 'rpg',
    title: 'Custom Systems',
    summary: 'The plugins built specifically for this server.',
    items: [
      'Custom skills, RPG progression, and companion pets are developed in-house for ArcanaSMP.',
      'These systems are why progression here does not match any other server.',
    ],
    todo: ['Skill list and how each levels', 'Pet collection and raising guide', 'RPG stat reference'],
  },
  {
    icon: 'star',
    title: 'Voting',
    status: 'ready',
    summary: 'Free, takes a minute, and rewards you in-game.',
    items: [
      'Five listing sites are linked in the sidebar and on the Vote page.',
      'Each site can be voted on once every 24 hours, so you can vote five times a day.',
      'Votes reward you automatically in-game and count toward server-wide vote parties.',
    ],
  },
  {
    icon: 'help',
    title: 'FAQ',
    status: 'ready',
    summary: 'The questions we get most often.',
    items: [
      'Is there a store? No. Nothing on this server is for sale, and nothing gives a paid advantage.',
      'Can I donate? Yes, entirely optionally — it earns you nothing in-game by design.',
      'Can I use an alt account? One alt is allowed for AFK and chunk-loading. Automated chunk loading counts as an exploit.',
      'Are macros or autoclickers allowed? No. That includes autofishing.',
      'Bedrock Edition? Not supported — ArcanaSMP is Java Edition only.',
    ],
  },
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
    status: 'done',
    title: 'More ways to attain keys',
    description: "The custom content in our crates is meant to be attained by players, so we added more chances to roll them across the systems players already use.",
    progress: [
      'Vote parties with generous key drops',
      'Daily quests now give generous key rewards',
      'Daily parkour gives increased rewards to higher ranks',
      'AFK rewards increased for higher ranks',
      'Increased key drop rates, less junk in all crates',
    ],
  },
  {
    status: 'done',
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
    status: 'inprogress',
    title: 'Website redesign',
    description: "Refreshing the site you're on now: clearer navigation and a transparent roadmap.",
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
// mcstatus reports the server software alongside the version ("Paper 26.1.2").
// Players only care about the number they need to connect with, so drop a
// leading software name when one is present.
const SERVER_SOFTWARE = /^(paper|spigot|purpur|bukkit|craftbukkit|fabric|forge|folia|velocity|waterfall|bungeecord)\s+/i;

function cleanVersion(raw) {
  if (!raw) return null;
  return raw.replace(SERVER_SOFTWARE, '').trim() || raw;
}

function updateOnline() {
  fetch('https://api.mcstatus.io/v2/status/java/' + SERVER_ADDRESS)
    .then((res) => res.json())
    .then((data) => {
      const sidebarEl = document.getElementById('onlineValue');
      const pillEl = document.getElementById('pillOnlineCount');
      const versionEl = document.getElementById('playVersion');
      if (data.online) {
        const cur = data.players.online;
        const max = data.players.max;
        if (sidebarEl) sidebarEl.innerHTML = cur + ' <span class="cap">/ ' + max + '</span>';
        if (pillEl) pillEl.textContent = cur + ' / ' + max;
        const version = cleanVersion(data.version && data.version.name_clean);
        if (versionEl) versionEl.textContent = version || '—';
      } else {
        if (sidebarEl) sidebarEl.innerHTML = '0 <span class="cap">/ —</span>';
        if (pillEl) pillEl.textContent = 'offline';
        if (versionEl) versionEl.textContent = '—';
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

// --- Discord counts (via the invite-counts endpoint) ---
// One request feeds both the topbar pill (online now) and the sidebar stats
// row (total members).
function updateDiscordCount() {
  fetch(`https://discord.com/api/v10/invites/${DISCORD_INVITE_CODE}?with_counts=true`)
    .then((res) => res.json())
    .then((data) => {
      const el = document.getElementById('discordOnlineCount');
      const membersEl = document.getElementById('discordMembers');
      const online = data && data.approximate_presence_count;
      const members = data && data.approximate_member_count;
      if (el) el.textContent = typeof online === 'number' ? online.toLocaleString() : '—';
      if (membersEl) {
        membersEl.textContent = typeof members === 'number'
          ? members.toLocaleString() + ' members'
          : '—';
      }
    })
    .catch(() => {
      const el = document.getElementById('discordOnlineCount');
      const membersEl = document.getElementById('discordMembers');
      if (el) el.textContent = '—';
      if (membersEl) membersEl.textContent = '—';
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

// --- Hash router ---
const STATIC_ROUTES = new Set(['home', 'livemap', 'rules', 'wiki', 'vote', 'roadmap']);

function currentRoute() {
  const hash = location.hash.replace(/^#/, '');
  if (!hash) return { name: 'home' };
  if (STATIC_ROUTES.has(hash)) return { name: hash };
  return { name: 'home' };
}

function setActiveNav(routeKey) {
  document.querySelectorAll('.category-item').forEach((item) => {
    item.classList.toggle('active', item.dataset.route === routeKey);
  });
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
      <span class="home-hero-tag home-hero-tag--nop2w">Zero Pay-to-Win</span>
      <span class="home-hero-tag home-hero-tag--worldgen">Custom World Gen</span>
      <span class="home-hero-tag home-hero-tag--skills">Custom Skills</span>
      <span class="home-hero-tag home-hero-tag--rpg">Custom RPG</span>
      <span class="home-hero-tag home-hero-tag--economy">Economy</span>
      <span class="home-hero-tag home-hero-tag--balance">Balanced Progression</span>
      <span class="home-hero-tag home-hero-tag--chill">Chill Vibes</span>
    </div>
  `;
  main.appendChild(hero);

  // No-store / no-pay-to-win callout. Sits directly under the hero because
  // it's the single biggest differentiator for players arriving from a
  // server list, where most listings are pay-to-win.
  const noP2W = document.createElement('section');
  noP2W.className = 'main-card nop2w-card';
  noP2W.innerHTML = `
    <div class="nop2w-badge">No Store &middot; Zero Pay-to-Win</div>
    <h2 class="nop2w-title">Nothing on this server is for sale.</h2>
    <div class="main-card-body">
      <p>We removed the store completely. No checkout, no packages, no premium currency, no &ldquo;supporter&rdquo; tier that quietly hands out an edge. <strong>There is nothing to buy here at any price</strong> - and that's a permanent design decision, not a phase.</p>
    </div>
    <p class="nop2w-lead">What other servers sell as pay-to-win perks, we make players earn:</p>
    <ul class="nop2w-grid">
      ${PAYWALLED_ELSEWHERE.map((item) => `<li class="nop2w-box">${item}</li>`).join('')}
    </ul>
    <div class="main-card-body">
      <p><strong>Nobody can spend their way past you</strong>, out-gear you, or skip a grind you did. No wallet-fed head start, no boosted XP curve, no crate luck you can top up. The playing field is identical for everyone who logs in.</p>
      <p class="nop2w-support">Donating is optional, earns you nothing in-game, and is genuinely appreciated. Every contribution goes straight to hosting and running costs.</p>
    </div>
  `;
  main.appendChild(noP2W);

  // About the server. The feature grid lives inside this same card rather
  // than in its own: the prose introduces the server and the grid gives the
  // specifics, so splitting them into two bordered blocks just added a
  // boundary in the middle of one thought.
  const about = document.createElement('section');
  about.className = 'main-card';
  about.innerHTML = `
    <p class="main-card-subheading">A small, community-run Minecraft world. Not a business.</p>
    <div class="main-card-body">
      <p>ArcanaSMP is a long-term survival multiplayer server built around <strong>balanced progression and chill vibes</strong>. We run <strong>custom plugins developed uniquely for our server</strong>, so the experience is one you won't find anywhere else. We're a place to mine, fish, farm, build, and just vibe with other chill adults.</p>
    </div>
  `;

  const grid = document.createElement('div');
  grid.className = 'feature-grid';

  FEATURES.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'feature-card';

    const icon = document.createElement('div');
    icon.className = 'feature-icon';
    const iconSvg = createIcon(item.icon);
    if (iconSvg) icon.appendChild(iconSvg);
    card.appendChild(icon);

    const title = document.createElement('div');
    title.className = 'feature-title';
    title.textContent = item.title;
    card.appendChild(title);

    const desc = document.createElement('div');
    desc.className = 'feature-desc';
    desc.textContent = item.description;
    card.appendChild(desc);

    grid.appendChild(card);
  });

  about.appendChild(grid);
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
    const voteStar = createIcon('star');
    if (voteStar) icon.appendChild(voteStar);
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

  const header = document.createElement('section');
  header.className = 'main-card';
  header.innerHTML = `
    <h1 class="main-card-heading">Wiki</h1>
    <p class="main-card-subheading">Guides and reference for playing on ArcanaSMP.</p>
    <div class="main-card-body">
      <p>This is a work in progress. Sections marked <span class="wiki-badge wiki-badge--wip">WIP</span> are partly written &mdash; what's documented so far is below each one, along with what still needs filling in. If something here is wrong or missing, tell us in <a href="https://discord.gg/${DISCORD_INVITE_CODE}" target="_blank" rel="noopener">Discord</a>.</p>
    </div>
    ${WIKI_URL ? `<a class="external-link-btn" href="${WIKI_URL}" target="_blank" rel="noopener">Open the full wiki &rarr;</a>` : ''}
  `;
  main.appendChild(header);

  const wrap = document.createElement('section');
  wrap.className = 'main-card';

  const grid = document.createElement('div');
  grid.className = 'wiki-grid';

  WIKI_SECTIONS.forEach((section) => {
    const card = document.createElement('article');
    card.className = 'wiki-section';

    const head = document.createElement('div');
    head.className = 'wiki-section-head';

    const icon = document.createElement('span');
    icon.className = 'wiki-section-icon';
    const svg = createIcon(section.icon);
    if (svg) icon.appendChild(svg);
    head.appendChild(icon);

    const title = document.createElement('h2');
    title.className = 'wiki-section-title';
    title.textContent = section.title;
    head.appendChild(title);

    const badge = document.createElement('span');
    const ready = section.status === 'ready';
    badge.className = `wiki-badge wiki-badge--${ready ? 'ready' : 'wip'}`;
    badge.textContent = ready ? 'Ready' : 'WIP';
    head.appendChild(badge);

    card.appendChild(head);

    if (section.summary) {
      const summary = document.createElement('p');
      summary.className = 'wiki-section-summary';
      summary.textContent = section.summary;
      card.appendChild(summary);
    }

    if (section.items && section.items.length) {
      const list = document.createElement('ul');
      list.className = 'wiki-list';
      section.items.forEach((text) => {
        const li = document.createElement('li');
        li.textContent = text;
        list.appendChild(li);
      });
      card.appendChild(list);
    }

    if (section.todo && section.todo.length) {
      const todo = document.createElement('div');
      todo.className = 'wiki-todo';

      const label = document.createElement('div');
      label.className = 'wiki-todo-label';
      label.textContent = 'Still to document';
      todo.appendChild(label);

      const list = document.createElement('ul');
      list.className = 'wiki-todo-list';
      section.todo.forEach((text) => {
        const li = document.createElement('li');
        li.textContent = text;
        list.appendChild(li);
      });
      todo.appendChild(list);

      card.appendChild(todo);
    }

    grid.appendChild(card);
  });

  wrap.appendChild(grid);
  main.appendChild(wrap);
}

function applyRoute() {
  const main = document.getElementById('main-content');
  if (!main) return;

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
  }

  window.scrollTo(0, 0);
}

// --- Sidebar quick links ---
function populateQuickLinks() {
  const nav = document.getElementById('quickLinks');
  if (!nav) return;
  nav.innerHTML = '';

  QUICK_LINKS.forEach((link) => {
    const a = document.createElement('a');
    a.className = 'quick-link';
    a.href = link.href;
    if (link.external) {
      a.target = '_blank';
      a.rel = 'noopener';
    }

    const icon = document.createElement('span');
    icon.className = 'quick-link-icon';
    const linkSvg = createIcon(link.icon);
    if (linkSvg) icon.appendChild(linkSvg);
    a.appendChild(icon);

    const name = document.createElement('span');
    name.className = 'quick-link-name';
    name.textContent = link.name;
    a.appendChild(name);

    if (link.soon) {
      const badge = document.createElement('span');
      badge.className = 'quick-link-soon';
      badge.textContent = 'Soon';
      a.appendChild(badge);
    }

    nav.appendChild(a);
  });
}

// --- Sidebar vote list ---
// Same VOTE_SITES source as the Vote page, so the two never drift apart.
function populateVoteSidebar() {
  const list = document.getElementById('voteSidebarList');
  if (!list) return;
  list.innerHTML = '';

  VOTE_SITES.forEach((site) => {
    const a = document.createElement('a');
    a.className = 'vote-sidebar-item';
    a.href = site.url;
    a.target = '_blank';
    a.rel = 'noopener';

    const star = document.createElement('span');
    star.className = 'vote-sidebar-star';
    const starSvg = createIcon('star');
    if (starSvg) star.appendChild(starSvg);
    a.appendChild(star);

    const name = document.createElement('span');
    name.className = 'vote-sidebar-name';
    name.textContent = site.name;
    a.appendChild(name);

    list.appendChild(a);
  });
}

// --- Wiring ---
updateOnline();
setInterval(updateOnline, ONLINE_UPDATE_INTERVAL);
updateServerAge();
updateDiscordCount();
setInterval(updateDiscordCount, DISCORD_UPDATE_INTERVAL);

// --- Sticky sidebar offset ---
// The .topbar is static and scrolls away; .topnav is what stays pinned, so
// the sticky sidebar has to clear the nav's height, not the topbar's. Height
// is measured rather than hard-coded because web fonts land after first
// paint and the nav can wrap at some widths.
const topnavEl = document.querySelector('.topnav');

function syncTopnavHeight() {
  if (!topnavEl) return;
  document.documentElement.style.setProperty('--topnav-height', topnavEl.offsetHeight + 'px');
}

syncTopnavHeight();
if (topnavEl && window.ResizeObserver) {
  new ResizeObserver(syncTopnavHeight).observe(topnavEl);
} else {
  window.addEventListener('resize', syncTopnavHeight);
}

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

populateVoteSidebar();
populateQuickLinks();
applyRoute();

window.addEventListener('hashchange', () => {
  closeSidebar();
  applyRoute();
});
