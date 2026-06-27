// One-off generator: bakes fixed (non-dynamic) LinearGradient color stops —
// from Settings (DurationBtn / CustomSwitch) and the shared Button component
// — into small PNGs. Re-run with `node scripts/generate-gradients.js`
// whenever those color stops change in app/settings.tsx or
// src/shared/components/Button.tsx — the images are NOT auto-synced.
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const OUT_DIR = path.join(__dirname, '..', 'assets', 'gradients');
// resizeMode="stretch" on Android mis-renders when one axis needs a large
// magnification factor — an 8×120 (1:15) source stretched into a wide,
// short target rendered as a narrow rounded blob; a 64×64 source stretched
// into a full-width Button showed a visible seam. Dp values also get
// multiplied by the device's pixel ratio (e.g. ~2.75x) before this stretch
// happens, so even the "short" axis (button height) was undersized once
// it actually hit physical pixels — same fix, both axes generously sized.
// Cheap to generate — solid-color rows compress to a few KB regardless.
const WIDTH = 1024;
const HEIGHT = 96;

function parseColor(c) {
  const hex = c.match(/^#([0-9a-f]{6})$/i);
  if (hex) {
    const n = parseInt(hex[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 255];
  }
  const rgba = c.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)/i);
  if (rgba) {
    const a = rgba[4] !== undefined ? parseFloat(rgba[4]) : 1;
    return [+rgba[1], +rgba[2], +rgba[3], Math.round(a * 255)];
  }
  throw new Error(`Unrecognized color: ${c}`);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

// Color of a multi-stop gradient at vertical position t (0..1).
function colorAt(colors, locations, t) {
  const stops = colors.map(parseColor);
  const locs = locations || colors.map((_, i) => i / (colors.length - 1));
  let i = 0;
  while (i < locs.length - 2 && t > locs[i + 1]) i++;
  const localT = (t - locs[i]) / (locs[i + 1] - locs[i] || 1);
  const [r1, g1, b1, a1] = stops[i];
  const [r2, g2, b2, a2] = stops[i + 1];
  return [lerp(r1, r2, localT), lerp(g1, g2, localT), lerp(b1, b2, localT), lerp(a1, a2, localT)];
}

// Standard "over" alpha compositing: paints `top` over `bottom`.
function over(top, bottom) {
  const [tr, tg, tb, ta255] = top;
  const [br, bg, bb, ba255] = bottom;
  const ta = ta255 / 255, ba = ba255 / 255;
  const outA = ta + ba * (1 - ta);
  if (outA === 0) return [0, 0, 0, 0];
  const blend = (t, b) => (t * ta + b * ba * (1 - ta)) / outA;
  return [blend(tr, br), blend(tg, bg), blend(tb, bb), outA * 255];
}

// pixelAt(t) — same color for every x in a row (t = y/(h-1)). Used for
// vertical gradients, where every row is a solid color.
function writePng(name, pixelAt, w = WIDTH, h = HEIGHT) {
  writePng2D(name, (x, y) => pixelAt(y / (h - 1)), w, h);
}

// pixelAt2D(x, y) — full per-pixel control. Used for radial gradients.
function writePng2D(name, pixelAt2D, w = WIDTH, h = HEIGHT) {
  const png = new PNG({ width: w, height: h });
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const [r, g, b, a] = pixelAt2D(x, y);
      const idx = (w * y + x) << 2;
      png.data[idx] = Math.round(r);
      png.data[idx + 1] = Math.round(g);
      png.data[idx + 2] = Math.round(b);
      png.data[idx + 3] = Math.round(a);
    }
  }
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  const outPath = path.join(OUT_DIR, `${name}.png`);
  png.pack().pipe(fs.createWriteStream(outPath)).on('finish', () => console.log('wrote', outPath));
}

// colors: string[], locations: number[] in [0,1] same length as colors (or omitted = evenly spaced).
// dims: optional {width, height} override — e.g. for circular buttons, whose
// bounding box is square rather than a wide rectangle like Button.tsx.
function generateVerticalGradient(name, colors, locations, dims) {
  writePng(name, (t) => colorAt(colors, locations, t), dims?.width, dims?.height);
}

// Same as generateVerticalGradient but left-to-right (DeckCard's tint/PRO
// badge gradients use start={x:0,y:0} end={x:1,y:0} — horizontal).
function generateHorizontalGradient(name, colors, locations, dims) {
  const w = dims?.width ?? WIDTH;
  const h = dims?.height ?? HEIGHT;
  writePng2D(name, (x) => colorAt(colors, locations, x / (w - 1)), w, h);
}

// Radial gradient — t=0 at the image center, t=1 at the inscribed circle's
// edge (not the square's corner, which sits outside the circular clip and
// would never be visible). For "3D sphere" bevels on perfectly round
// buttons, where a vertical gradient doesn't read as a dome/dent at all.
function generateRadialGradient(name, colors, locations, dims) {
  const w = dims?.width ?? WIDTH;
  const h = dims?.height ?? HEIGHT;
  const cx = (w - 1) / 2, cy = (h - 1) / 2;
  const maxR = Math.min(w, h) / 2;
  writePng2D(name, (x, y) => {
    const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
    const t = Math.min(d / maxR, 1);
    return colorAt(colors, locations, t);
  }, w, h);
}

// Pre-composites one or more overlay gradients on top of a base gradient —
// only valid when every layer shares the exact same clip bounds (otherwise
// the combined image won't match having drawn them as separate, separately
// clipped, layers).
function generateComposite(name, layers, dims) {
  writePng(name, (t) => {
    let px = colorAt(layers[0].colors, layers[0].locations, t);
    for (let i = 1; i < layers.length; i++) {
      px = over(colorAt(layers[i].colors, layers[i].locations, t), px);
    }
    return px;
  }, dims?.width, dims?.height);
}

// Must mirror app/settings.tsx's color stops exactly.
generateVerticalGradient('duration_active', ['#9590EF', '#2F2A89']);
generateVerticalGradient('duration_inactive', ['rgba(149,144,239,0.22)', 'rgba(47,42,137,0.22)']);
generateVerticalGradient('duration_active_pressed', ['#2F2A89', '#9590EF']);
generateVerticalGradient('duration_inactive_pressed', ['rgba(47,42,137,0.22)', 'rgba(149,144,239,0.22)']);
generateVerticalGradient(
  'duration_depth_convex',
  ['rgba(255,255,255,0.22)', 'rgba(255,255,255,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.18)'],
  [0, 0.38, 0.62, 1],
);
generateVerticalGradient(
  'duration_depth_concave',
  ['rgba(0,0,0,0.18)', 'rgba(0,0,0,0)', 'rgba(255,255,255,0)', 'rgba(255,255,255,0.22)'],
  [0, 0.38, 0.62, 1],
);
generateVerticalGradient('switch_off', ['rgba(51,65,85,0.95)', 'rgba(15,23,42,0.95)']);
generateVerticalGradient('switch_on', ['#9590EF', '#4F46E5']);
generateVerticalGradient(
  'switch_sheen',
  ['rgba(255,255,255,0.18)', 'rgba(255,255,255,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.14)'],
  [0, 0.4, 0.6, 1],
);
generateVerticalGradient('switch_thumb_fill', ['#34D399', '#059669']);
generateVerticalGradient(
  'switch_thumb_depth',
  ['rgba(255,255,255,0.55)', 'rgba(255,255,255,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.20)'],
  [0, 0.4, 0.6, 1],
);
// Combined thumb (fill + depth) — both layers share the exact same
// absoluteFill bounds in the thumb, so pre-compositing them is lossless
// and drops one <Image> per switch (×2 on this screen).
generateComposite('switch_thumb_combined', [
  { colors: ['#34D399', '#059669'] },
  { colors: ['rgba(255,255,255,0.55)', 'rgba(255,255,255,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.20)'], locations: [0, 0.4, 0.6, 1] },
]);

// ── Shared Button component (src/shared/components/Button.tsx) ──────────
// Must mirror bevelColors / bevelConcaveColors / DEPTH / DEPTH_CONCAVE exactly.
generateVerticalGradient('button_primary_convex', ['#9590EF', '#2F2A89']);
generateVerticalGradient('button_primary_concave', ['#2F2A89', '#9590EF']);
generateVerticalGradient('button_secondary_convex', ['#6FD5B3', '#0A6F4D']);
generateVerticalGradient('button_secondary_concave', ['#0A6F4D', '#6FD5B3']);
generateVerticalGradient('button_danger_convex', ['#F58F8F', '#8F2929']);
generateVerticalGradient('button_danger_concave', ['#8F2929', '#F58F8F']);
generateVerticalGradient('button_outline_convex', ['rgba(255,255,255,0.24)', 'rgba(0,0,0,0.22)']);
generateVerticalGradient('button_outline_concave', ['rgba(0,0,0,0.22)', 'rgba(255,255,255,0.24)']);
generateVerticalGradient('button_ghost_convex', ['rgba(255,255,255,0.10)', 'rgba(0,0,0,0.06)']);
generateVerticalGradient('button_ghost_concave', ['rgba(0,0,0,0.06)', 'rgba(255,255,255,0.10)']);
generateVerticalGradient(
  'button_depth_convex',
  ['rgba(255,255,255,0.22)', 'rgba(255,255,255,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.18)'],
  [0, 0.38, 0.62, 1],
);
generateVerticalGradient(
  'button_depth_concave',
  ['rgba(0,0,0,0.18)', 'rgba(0,0,0,0)', 'rgba(255,255,255,0)', 'rgba(255,255,255,0.22)'],
  [0, 0.38, 0.62, 1],
);
// 'accent' (orange) — used by the Zagraj (Home) / Start (Game) CTA, which
// used to be its own hand-rolled component; reuses button_depth_convex/
// concave above like every other variant.
generateVerticalGradient('button_accent_convex', ['#FBAB73', '#95450D']);
generateVerticalGradient('button_accent_concave', ['#95450D', '#FBAB73']);

// ── Dark "badge" gradient (PageHeader title / game.tsx "Przygotuj się!") ──
// Both share the exact same bevel colors; only the inner depth overlay's
// alpha differs between the two call sites.
generateVerticalGradient('badge_bevel', ['rgba(255,255,255,0.22)', 'rgba(0,0,0,0.30)']);
generateVerticalGradient(
  'badge_depth_title',
  ['rgba(255,255,255,0.20)', 'rgba(255,255,255,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.24)'],
  [0, 0.38, 0.62, 1],
);
generateVerticalGradient(
  'badge_depth_getready',
  ['rgba(255,255,255,0.16)', 'rgba(255,255,255,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.14)'],
  [0, 0.38, 0.62, 1],
);

// ── ResultsView.tsx stat cards (Dobrze / Pominięte / Celność) — static,
// no press state, so just one bevel + one depth image each, always rendered.
generateVerticalGradient('statcard_bevel', ['#777F8C', '#111926']);
generateVerticalGradient(
  'statcard_depth',
  ['rgba(255,255,255,0.18)', 'rgba(255,255,255,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.18)'],
  [0, 0.38, 0.62, 1],
);

// ── Circular icon buttons (PageHeader's HeaderBtn ⚙️/←, MuteButton — the
// latter is reused as-is for the in-game HUD's mute/pause buttons, so this
// covers all three call sites). Square bounding box, not a wide rectangle
// like Button.tsx — a 1024-wide source would over-magnify the *height* axis
// here, so these get their own near-square source instead. HeaderBtn and
// MuteButton already shared identical colors, so one set covers both.
// Small — radial gradients don't compress nearly as well as vertical ones
// (no repeated rows), and the button itself is only ~52dp; 256px made each
// of these ~40KB. Uniform square upscale (not a disproportionate
// width-vs-height stretch like Button.tsx needed), so a small source is safe.
const CIRCLE_DIMS = { width: 64, height: 64 };
// Radial, not vertical — a top-to-bottom gradient clipped into a circle
// doesn't read as a 3D dome/dent at all. Center→edge instead — swapped
// once more per direct user feedback, this direction is the one that
// actually reads as a convincing press-down on this device.
generateRadialGradient('circle_bevel_convex', ['rgba(255,255,255,0.20)', 'rgba(0,0,0,0.24)'], undefined, CIRCLE_DIMS);
generateRadialGradient('circle_bevel_concave', ['rgba(0,0,0,0.16)', 'rgba(255,255,255,0.20)'], undefined, CIRCLE_DIMS);
generateRadialGradient('circle_depth_convex', ['rgba(255,255,255,0.12)', 'rgba(0,0,0,0.10)'], undefined, CIRCLE_DIMS);
generateRadialGradient('circle_depth_concave', ['rgba(0,0,0,0.10)', 'rgba(255,255,255,0.12)'], undefined, CIRCLE_DIMS);

// ── DeckCard (decks screen) — bevel/tint depend on each deck's own
// `color`, but that's a small, fixed set (one hex per deck in decks.ts).
// Pre-bake one bevel+tint pair per color; DeckCard.tsx falls back to a
// live LinearGradient for any color not in this list (e.g. a deck added
// later, before this script is re-run for it).
function hexToRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
// Mirrors DeckCard.tsx's computeBevel(): top = color blended 40% toward
// white, bottom = color at 60% brightness.
function deckBevelColors(hex) {
  const [r, g, b] = hexToRgb(hex);
  const top = `rgb(${Math.round(0.4 * 255 + 0.6 * r)},${Math.round(0.4 * 255 + 0.6 * g)},${Math.round(0.4 * 255 + 0.6 * b)})`;
  const bot = `rgb(${Math.round(0.6 * r)},${Math.round(0.6 * g)},${Math.round(0.6 * b)})`;
  return [top, bot];
}
function hexToRgba(hex, alpha) {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}
// Must mirror every `color:` value in src/game/decks.ts (DeckCard.tsx's
// DECK_COLOR_KEYS below maps deck.color back to these same hex strings).
const DECK_COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
// DeckCard is ~118px tall in practice — closer to that than the global
// HEIGHT keeps the vertical stretch factor small.
const DECKCARD_DIMS = { width: WIDTH, height: 118 };
for (const hex of DECK_COLORS) {
  const key = hex.slice(1).toLowerCase();
  generateVerticalGradient(`deckcard_bevel_${key}`, deckBevelColors(hex), undefined, DECKCARD_DIMS);
  generateHorizontalGradient(`deckcard_tint_${key}`, [hexToRgba(hex, 0.18), hexToRgba(hex, 0.04)], undefined, DECKCARD_DIMS);
}
// Depth overlay and PRO badge are color-independent (PRO badge is always
// primary→violet regardless of the deck), so just one shared image each.
generateVerticalGradient(
  'deckcard_depth',
  ['rgba(255,255,255,0.06)', 'rgba(255,255,255,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.12)'],
  [0, 0.35, 0.65, 1],
  DECKCARD_DIMS,
);
generateHorizontalGradient('deckcard_probadge', ['#4F46E5', '#7C3AED']);

// decks.tsx's "Odblokuj Premium" banner — static, single instance on screen.
generateVerticalGradient('decks_premium_banner', ['rgba(67,56,202,0.60)', 'rgba(49,46,129,0.50)']);
