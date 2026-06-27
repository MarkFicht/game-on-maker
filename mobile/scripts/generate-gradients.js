// One-off generator: bakes the fixed (non-dynamic) LinearGradient color
// stops used on Settings (DurationBtn / CustomSwitch) into small PNGs.
// Re-run with `node scripts/generate-gradients.js` whenever those color
// stops change in app/settings.tsx — the images are NOT auto-synced.
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const OUT_DIR = path.join(__dirname, '..', 'assets', 'gradients');
// A near-square source avoids resizeMode="stretch" distorting/mis-rendering
// on Android — an earlier 8×120 (1:15) source stretched into a wide, short
// target rendered as a narrow rounded blob instead of filling the box.
const WIDTH = 64;
const HEIGHT = 64;

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

function writePng(name, pixelAt) {
  const png = new PNG({ width: WIDTH, height: HEIGHT });
  for (let y = 0; y < HEIGHT; y++) {
    const t = y / (HEIGHT - 1);
    const [r, g, b, a] = pixelAt(t);
    for (let x = 0; x < WIDTH; x++) {
      const idx = (WIDTH * y + x) << 2;
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

// colors: string[], locations: number[] in [0,1] same length as colors (or omitted = evenly spaced)
function generateVerticalGradient(name, colors, locations) {
  writePng(name, (t) => colorAt(colors, locations, t));
}

// Pre-composites one or more overlay gradients on top of a base gradient —
// only valid when every layer shares the exact same clip bounds (otherwise
// the combined image won't match having drawn them as separate, separately
// clipped, layers).
function generateComposite(name, layers) {
  writePng(name, (t) => {
    let px = colorAt(layers[0].colors, layers[0].locations, t);
    for (let i = 1; i < layers.length; i++) {
      px = over(colorAt(layers[i].colors, layers[i].locations, t), px);
    }
    return px;
  });
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
