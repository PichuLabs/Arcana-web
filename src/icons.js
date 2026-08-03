// Inline SVG icon set.
//
// Emoji were the previous stand-in, but they render as a different glyph on
// every OS (and as full-color images that fight a dark, flat UI). These are
// authored on a 24x24 grid and drawn with `currentColor`, so each icon picks
// up whatever color its container sets — that's how the feature cards and
// paywall boxes tint their icons without any per-icon CSS.
//
// Everything is inlined rather than loaded from an icon font or CDN: the site
// ships as a static bundle and makes no third-party requests for chrome.

// Most icons are stroked outlines. Discord is the exception — it's a solid
// brand mark, so it sets its own fill and clears the stroke.
const STROKE_ATTRS = {
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': '1.75',
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round',
};

const FILL_ATTRS = {
  fill: 'currentColor',
  stroke: 'none',
};

export const ICONS = {
  // Two overlapping coins. The inner ring keeps the front disc reading as a
  // coin rather than a plain circle.
  economy: {
    body: '<circle cx="9" cy="9" r="6"/><circle cx="9" cy="9" r="2.2"/><path d="M15.6 5.2a6 6 0 0 1 3.2 9.4"/><path d="M14.2 19.2a6 6 0 0 1-7.4-1.6"/>',
  },
  // Pickaxe: a handle crossed by a swung head.
  jobs: {
    body: '<path d="M3.5 20.5 13 11"/><path d="M8 6.5c3.5-2.5 8-2 10.5.5"/><path d="M17.5 16c2.5-2.5 3-7 .5-10.5"/><path d="M10.5 8.5 15.5 13.5"/>',
  },
  // A claimed plot: bordered ground with a flag planted in it.
  lands: {
    body: '<path d="M3 8.5 12 4l9 4.5-9 4.5z"/><path d="M3 15.5 12 20l9-4.5"/><path d="M16 6.2V13"/>',
  },
  // Paw print.
  pets: {
    body: '<circle cx="7" cy="8" r="1.9"/><circle cx="12" cy="5.8" r="1.9"/><circle cx="17" cy="8" r="1.9"/><path d="M12 11.5c2.9 0 5 2.1 5 4.6 0 2-1.4 3.4-3.2 3.4-1 0-1.3-.4-1.8-.4s-.8.4-1.8.4C8.4 19.5 7 18.1 7 16.1c0-2.5 2.1-4.6 5-4.6z"/>',
  },
  // Crossed swords. A shield read as "verified/secure" rather than combat,
  // so this uses blades instead.
  rpg: {
    body: '<polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" y1="19" x2="19" y2="13"/><line x1="16" y1="16" x2="20" y2="20"/><line x1="19" y1="21" x2="21" y2="19"/><polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5"/><line x1="5" y1="14" x2="9" y2="18"/><line x1="7" y1="17" x2="4" y2="20"/><line x1="3" y1="19" x2="5" y2="21"/>',
  },
  // Double chevron: moving up through the ranks.
  ranks: {
    body: '<path d="m6 13 6-6 6 6"/><path d="m6 19 6-6 6 6"/><path d="M12 4h.01"/>',
  },
  // Folded map.
  map: {
    body: '<path d="m3 6.5 6-3 6 3 6-3v14l-6 3-6-3-6 3z"/><path d="M9 3.5v14"/><path d="M15 6.5v14"/>',
  },
  // Open book.
  wiki: {
    body: '<path d="M12 6.5C10.5 5 8.5 4.5 4 4.5v13c4.5 0 6.5.5 8 2 1.5-1.5 3.5-2 8-2v-13c-4.5 0-6.5.5-8 2z"/><path d="M12 6.5v13"/>',
  },
  // Star, used for vote sites.
  star: {
    body: '<path d="m12 3.5 2.7 5.5 6 .9-4.35 4.24L17.4 20 12 17.2 6.6 20l1.05-5.86L3.3 9.9l6-.9z"/>',
  },
  // Chunk / claim block: a cube.
  block: {
    body: '<path d="M12 3 4 7.5v9L12 21l8-4.5v-9z"/><path d="M4 7.5 12 12l8-4.5"/><path d="M12 12v9"/>',
  },
  // Key, for crates and key sources.
  key: {
    body: '<circle cx="7.5" cy="15.5" r="4"/><path d="m10.4 12.6 8.1-8.1"/><path d="m16.5 6.5 2.5 2.5"/><path d="m13.8 9.2 2.5 2.5"/>',
  },
  // Question mark in a circle, for the FAQ.
  help: {
    body: '<circle cx="12" cy="12" r="9"/><path d="M9.6 9.4a2.5 2.5 0 0 1 4.9.7c0 1.7-2.5 2.2-2.5 3.6"/><path d="M12 17.3h.01"/>',
  },
  // Discord brand mark (solid).
  discord: {
    fill: true,
    body: '<path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>',
  },
};

// Build an <svg> element for `name`. Returns null for an unknown name so a
// bad key degrades to "no icon" rather than throwing mid-render.
export function createIcon(name, className) {
  const spec = ICONS[name];
  if (!spec) return null;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');

  const attrs = spec.fill ? FILL_ATTRS : STROKE_ATTRS;
  Object.entries(attrs).forEach(([k, v]) => svg.setAttribute(k, v));

  if (className) svg.setAttribute('class', className);
  svg.innerHTML = spec.body;
  return svg;
}
