// The Pettys kit: Plotbulb's look. White round heads with thick ink outlines, coloured shirts,
// stick limbs, flat illustrated sets. Everything takes the shared ctx from core/lib.js.
import { ctx, setCtx, W, H, clamp, lerp, eo, eob, TAU, rnd } from './core/lib.js';

export const INK = '#151515';
export const P = {
  sky: '#BFE6F7', skyLow: '#E3F4FB', grass: '#6CC04A', grassDark: '#57A63A', side: '#CFCFD2', sideLine: '#B5B5BA',
  road: '#5C5F66', siding: '#F1DDB4', sidingLine: '#D9C08F', roof: '#C8473A', roofDark: '#A93A2F', door: '#B9773F',
  trim: '#FFFFFF', glass: '#BFE6F7', hedge: '#4FA83D', hedgeDark: '#3E8C2F', hedgeLight: '#6CC351', trunk: '#8A5A33',
  tree: '#5DB548', gsiding: '#CFE3C6', gsidingLine: '#B4CDA9', groof: '#5E6E8C',
  wall: '#E9EEF2', wallLine: '#D3DAE0', floor: '#D7A877', floorLine: '#C49163', curtain: '#E9688C', curtainDark: '#C9516F',
  couch: '#7C5A44', couchDark: '#664835', frame: '#9C6B3C', yellow: '#FFE03A', red: '#E23B3B', blueBox: '#2F6FC0',
};
export const CAST = {
  dave: { shirt: '#3A8DDE', shirtDark: '#2F78C2', pants: '#1E1E22', badge: '#E23B3B', head: 'bald' },
  gary: { shirt: '#E3AE45', shirtDark: '#C99634', pants: '#6E8F4B', collar: true, head: 'gary', glasses: true },
  bev: { shirt: '#8E5BB5', shirtDark: '#764A9B', skirt: '#5B5670', head: 'bun', glasses: true, cardigan: true, shoes: '#6B4E8A', lips: '#C4567A' },
  linda: { shirt: '#EC82A7', shirtDark: '#D66C92', skirt: '#4B70B4', head: 'bob', lashes: true, shoes: '#E86A95', lips: '#E86A95' },
};

// ---------- small helpers ----------
export function poly(pts, fill, stroke = INK, lw = 8) {
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.stroke(); }
}
export function box(x, y, w, h, r, fill, stroke = INK, lw = 8) {
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
}
export function disc(x, y, r, fill, stroke = INK, lw = 8) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
}
export function oval(x, y, rx, ry, fill, stroke = INK, lw = 8, rot = 0) {
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, TAU);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
}
export function stroke(pts, color = INK, w = 8) {
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
}
export function arcStroke(x, y, r, a0, a1, color = INK, w = 8) {
  ctx.beginPath(); ctx.arc(x, y, r, a0, a1); ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.stroke();
}
export function label(text, x, y, size, fill = '#fff', strokeW = 0, strokeC = INK, font = 900) {
  ctx.font = `${font} ${size}px Inter`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  if (strokeW) { ctx.lineWidth = strokeW; ctx.strokeStyle = strokeC; ctx.strokeText(text, x, y); }
  ctx.fillStyle = fill; ctx.fillText(text, x, y);
}
/** draw fn with a blur (for out-of-focus backgrounds) */
const BLUR = new Map();
/** draw fn once into a stored, blurred bitmap (keyed), then reuse it every frame */
export function blurred(px, fn, key) {
  const k = key || fn.toString() + px;
  let img = BLUR.get(k);
  if (!img) {
    const main = ctx, a = new OffscreenCanvas(W, H), b = new OffscreenCanvas(W, H);
    setCtx(a.getContext('2d')); fn(); setCtx(main);
    const bc = b.getContext('2d'); bc.filter = `blur(${px}px)`; bc.drawImage(a, 0, 0);
    img = b; BLUR.set(k, img);
  }
  ctx.drawImage(img, 0, 0);
}
export function tint(color, a) { ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = color; ctx.fillRect(-400, -400, W + 800, H + 800); ctx.restore(); }

// ---------- faces ----------
// mood: calm angry smug sneaky flat shock cry happy annoyed
// talk: 0..1 mouth opening while speaking. look: [dx, dy] pupils (-1..1). blink: 0..1
export function head(x, y, r, o = {}) {
  const c = o.cast || CAST.dave, mood = o.mood || 'calm', s = r / 160, lw = Math.max(5, 11 * s);
  const talk = clamp(o.talk || 0), look = o.look || [0, 0], blink = o.blink || 0;
  // hair behind (bob)
  if (c.head === 'bob') {
    ctx.beginPath();
    ctx.moveTo(x - r * 1.16, y + r * 0.62);
    ctx.bezierCurveTo(x - r * 1.3, y - r * 0.4, x - r * 0.95, y - r * 1.22, x, y - r * 1.2);
    ctx.bezierCurveTo(x + r * 0.95, y - r * 1.22, x + r * 1.3, y - r * 0.4, x + r * 1.16, y + r * 0.62);
    ctx.lineTo(x + r * 0.7, y + r * 0.62); ctx.lineTo(x - r * 0.7, y + r * 0.62); ctx.closePath();
    ctx.fillStyle = '#8E5A2E'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.stroke();
  }
  disc(x, y, r, '#FFFFFF', INK, lw);
  if (o.band) {   // sweatband
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, r - lw / 2, 0, TAU); ctx.clip();
    ctx.fillStyle = o.band; ctx.fillRect(x - r, y - r * 0.78, r * 2, r * 0.24);
    stroke([[x - r, y - r * 0.78], [x + r, y - r * 0.78]], INK, lw * 0.5); stroke([[x - r, y - r * 0.54], [x + r, y - r * 0.54]], INK, lw * 0.5);
    ctx.restore(); disc(x, y, r, null, INK, lw);
  }
  if (c.head === 'bob') {   // fringe over the forehead
    ctx.beginPath();
    ctx.moveTo(x - r * 1.02, y + r * 0.1);
    ctx.bezierCurveTo(x - r * 1.0, y - r * 0.9, x - r * 0.3, y - r * 1.12, x + r * 0.2, y - r * 1.08);
    ctx.bezierCurveTo(x + r * 0.8, y - r * 1.0, x + r * 1.05, y - r * 0.5, x + r * 1.02, y + r * 0.1);
    ctx.bezierCurveTo(x + r * 0.7, y - r * 0.55, x + r * 0.1, y - r * 0.72, x - r * 0.45, y - r * 0.45);
    ctx.bezierCurveTo(x - r * 0.7, y - r * 0.3, x - r * 0.9, y - r * 0.1, x - r * 1.02, y + r * 0.1);
    ctx.closePath(); ctx.fillStyle = '#8E5A2E'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = lw; ctx.stroke();
    stroke([[x - r * 0.1, y - r * 0.95], [x + r * 0.35, y - r * 0.82]], '#6E4321', lw * 0.6);
  }
  if (c.head === 'bun') {   // grey hair cap + bun on top
    const hair = '#C9CCD3';
    disc(x, y - r * 1.12, r * 0.36, hair, INK, lw);
    stroke([[x - r * 0.12, y - r * 1.2], [x + r * 0.14, y - r * 1.05]], '#A9ADB6', lw * 0.5);
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, r - lw / 2, 0, TAU); ctx.clip();
    ctx.beginPath(); ctx.ellipse(x, y - r * 0.78, r * 1.05, r * 0.5, 0, 0, TAU); ctx.fillStyle = hair; ctx.fill();
    stroke([[x - r * 0.5, y - r * 0.55], [x - r * 0.1, y - r * 0.75]], '#A9ADB6', lw * 0.5); stroke([[x + r * 0.15, y - r * 0.72], [x + r * 0.55, y - r * 0.52]], '#A9ADB6', lw * 0.5);
    ctx.restore(); disc(x, y, r, null, INK, lw);
    // cheek blush
    ctx.save(); ctx.globalAlpha = 0.35; disc(x - r * 0.5, y + r * 0.25, r * 0.12, '#F08A9A', null); disc(x + r * 0.5, y + r * 0.25, r * 0.12, '#F08A9A', null); ctx.restore();
  }
  if (c.head === 'gary') {  // three springy hairs
    for (const [dx, k] of [[-0.25, -1], [0.05, 0.2], [0.32, 1]]) {
      ctx.beginPath(); ctx.moveTo(x + dx * r, y - r * 0.98);
      ctx.quadraticCurveTo(x + dx * r + k * r * 0.12, y - r * 1.35, x + dx * r + k * r * 0.3 + 6 * s, y - r * 1.3);
      ctx.strokeStyle = INK; ctx.lineWidth = lw * 0.8; ctx.lineCap = 'round'; ctx.stroke();
    }
  }
  const ex = r * 0.33, ey = y - r * 0.08, er = r * 0.2;
  // eyes
  const lid = mood === 'smug' || mood === 'flat' || mood === 'sneaky' ? 0.45 : mood === 'annoyed' ? 0.3 : 0;
  const closed = mood === 'cry' || mood === 'happy' || blink > 0.5;
  for (const side of [-1, 1]) {
    const cx = x + side * ex;
    if (closed) {
      if (mood === 'happy') arcStroke(cx, ey + er * 0.3, er * 0.75, Math.PI * 1.1, Math.PI * 1.9, INK, lw * 0.8);
      else if (mood === 'cry') arcStroke(cx, ey + er * 0.2, er * 0.75, Math.PI * 1.1, Math.PI * 1.9, INK, lw * 0.8);
      else stroke([[cx - er * 0.8, ey], [cx + er * 0.8, ey]], INK, lw * 0.8);
      continue;
    }
    const big = mood === 'shock' ? 1.25 : 1;
    oval(cx, ey, er * big, er * 1.2 * big, '#FFFFFF', INK, lw * 0.75);
    const pr = (mood === 'shock' ? er * 0.32 : er * 0.5);
    const px = cx + look[0] * er * 0.4, py = ey + look[1] * er * 0.45 + lid * er * 0.35;
    disc(px, py, pr, INK, null);
    if (lid) {   // heavy upper lid
      ctx.save(); ctx.beginPath(); ctx.ellipse(cx, ey, er * big, er * 1.2 * big, 0, 0, TAU); ctx.clip();
      ctx.fillStyle = '#FFFFFF'; ctx.fillRect(cx - er * 1.5, ey - er * 1.4, er * 3, er * 1.4 * (0.35 + lid));
      ctx.restore();
      const ly = ey - er * 1.2 + er * 1.4 * (0.35 + lid);
      stroke([[cx - er * 1.0, ly + (mood === 'sneaky' ? side * -er * 0.15 : 0)], [cx + er * 1.0, ly + (mood === 'sneaky' ? side * er * 0.15 : 0)]], INK, lw * 0.8);
    }
    if (c.lashes) for (let k = 0; k < 3; k++) {
      const a = -Math.PI / 2 + side * (0.5 + k * 0.28);
      stroke([[cx + Math.cos(a) * er * 0.95, ey + Math.sin(a) * er * 1.15], [cx + Math.cos(a) * er * 1.4, ey + Math.sin(a) * er * 1.55]], INK, lw * 0.45);
    }
  }
  if (c.glasses) {
    for (const side of [-1, 1]) disc(x + side * ex, ey, er * 1.45, null, INK, lw * 0.7);
    stroke([[x - ex + er * 1.45, ey], [x + ex - er * 1.45, ey]], INK, lw * 0.7);
  }
  if (o.shades) {   // sunglasses
    for (const side of [-1, 1]) { box(x + side * ex - er * 1.45, ey - er * 0.9, er * 2.9, er * 1.8, er * 0.7, '#1B1B1F', INK, lw * 0.6); stroke([[x + side * ex - er * 0.7, ey - er * 0.4], [x + side * ex - er * 0.2, ey - er * 0.6]], '#666', lw * 0.4); }
    stroke([[x - ex + er * 1.4, ey - er * 0.3], [x + ex - er * 1.4, ey - er * 0.3]], INK, lw * 0.7);
  }
  // brows
  const by = ey - er * (c.glasses ? 2.0 : 1.75);
  const browTilt = { angry: 0.45, annoyed: 0.25, sneaky: 0.3, smug: -0.15, shock: -0.35, cry: -0.4, flat: 0, calm: 0, happy: -0.1 }[mood] ?? 0;
  for (const side of [-1, 1]) {
    const cx = x + side * ex, raise = (mood === 'shock' ? -er * 0.6 : 0) + (mood === 'smug' && side === 1 ? -er * 0.45 : 0);
    stroke([[cx - side * er * 0.9, by + raise + browTilt * er * 0.7], [cx + side * er * 0.9, by + raise - browTilt * er * 0.7]], INK, lw * 0.9);
  }
  // mouth
  const mx = x + (o.mouthX || 0) * r, my = y + r * 0.48;
  const open = mood === 'shock' ? Math.max(0.75, talk) : mood === 'cry' ? Math.max(0.6, talk) : talk;
  if (open > 0.08) {
    const mw = r * (mood === 'cry' ? 0.42 : 0.26), mh = r * (0.08 + 0.3 * open);
    if (mood === 'cry') {   // wide wobbly frown-mouth
      ctx.beginPath(); ctx.moveTo(mx - mw, my + mh * 0.4); ctx.quadraticCurveTo(mx, my - mh * 1.2, mx + mw, my + mh * 0.4);
      ctx.quadraticCurveTo(mx, my + mh * 1.1, mx - mw, my + mh * 0.4); ctx.closePath();
      ctx.fillStyle = '#7A1F2B'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = lw * 0.75; ctx.stroke();
      oval(mx, my + mh * 0.45, mw * 0.5, mh * 0.35, '#F08A9A', null);
    } else {
      oval(mx, my, mw * (mood === 'sneaky' ? 1.4 : 1), mh, '#7A1F2B', INK, lw * 0.75);
      ctx.save(); ctx.beginPath(); ctx.ellipse(mx, my, mw, mh, 0, 0, TAU); ctx.clip();
      oval(mx, my + mh * 0.7, mw * 0.7, mh * 0.55, '#F08A9A', null); ctx.restore();
      if (mood === 'sneaky') stroke([[mx - mw * 1.3, my - mh * 0.2], [mx + mw * 1.3, my - mh * 0.2]], '#FFFFFF', lw * 0.6);
    }
  } else if (mood === 'smug' || mood === 'sneaky') {
    ctx.beginPath(); ctx.moveTo(mx - r * 0.25, my + r * 0.02); ctx.quadraticCurveTo(mx + r * 0.02, my + r * 0.14, mx + r * 0.28, my - r * 0.1);
    ctx.strokeStyle = INK; ctx.lineWidth = lw * 0.8; ctx.lineCap = 'round'; ctx.stroke();
  } else if (mood === 'happy' || mood === 'calm') {
    arcStroke(mx, my - r * 0.12, r * 0.2, Math.PI * 0.2, Math.PI * 0.8, c.lips || INK, lw * (c.lips ? 1 : 0.8));
  } else if (mood === 'angry' || mood === 'annoyed') {
    arcStroke(mx, my + r * 0.2, r * 0.18, Math.PI * 1.2, Math.PI * 1.8, INK, lw * 0.8);
  } else {
    stroke([[mx - r * 0.14, my], [mx + r * 0.14, my]], c.lips || INK, lw * 0.8);
  }
  if (o.sweat) { ctx.save(); ctx.globalAlpha = o.sweat; const sx = x + r * 0.62, sy = y - r * 0.55; ctx.beginPath(); ctx.moveTo(sx, sy - r * 0.16); ctx.quadraticCurveTo(sx + r * 0.1, sy, sx, sy + r * 0.04); ctx.quadraticCurveTo(sx - r * 0.1, sy, sx, sy - r * 0.16); ctx.fillStyle = '#7CC4F0'; ctx.fill(); ctx.restore(); }
  if (mood === 'cry') for (const side of [-1, 1]) {
    const tx = x + side * ex, len = r * (0.35 + 0.2 * ((o.t || 0) * 2 % 1));
    stroke([[tx, ey + er * 0.6], [tx + side * 2, ey + er * 0.6 + len]], '#7CC4F0', lw * 1.1);
  }
}

// ---------- full figure (v2 rig: chunkier proportions, 2-bone IK arms, idle life, talk gestures, walk) ----------
// x = centre, y = ground (feet). s = scale (1 → about 1030 px tall). t = film time (idle motion needs it).
// Hands: o.hands = { L: [lx, ly], R: [lx, ly] } targets in LOCAL units (origin at feet, +x = character's right on screen),
//        or o.gesture: 'rest' 'hips' 'cross' 'point' 'phoneEar' 'phoneShow' 'cheeks' 'scratch' 'flex' 'shrug' 'beg' 'hang' 'hold'
// o.talk 0..1 (mouth + head bob + beat gestures), o.squash (-1 stretch .. 1 squash), o.lean (rad), o.slump 0..1,
// o.walk = leg phase (radians, keeps increasing), o.sit = true (front-view seated, feet at y), hold / holdL (hx, hy) => prop
export const SH = -680, HIP = -360;
export function ik(S, P, a, b, bend) {
  let dx = P[0] - S[0], dy = P[1] - S[1], d = Math.hypot(dx, dy); const m = a + b - 0.5;
  if (d > m) { dx *= m / d; dy *= m / d; d = m; }
  const ang = Math.atan2(dy, dx), A = Math.acos(clamp((a * a + d * d - b * b) / (2 * a * d), -1, 1)) * bend;
  return { E: [S[0] + Math.cos(ang + A) * a, S[1] + Math.sin(ang + A) * a], H: [S[0] + dx, S[1] + dy] };
}
export function gestureHands(g, t = 0, talk = 0) {
  const sw = Math.sin(t * 1.7) * 6;
  switch (g) {
    case 'hips': return { L: [-128, -392], R: [128, -392] };
    case 'cross': return { L: [78, -548], R: [-78, -522], down: true };
    case 'point': return { L: [-150 + sw, -330], R: [340, -650] };
    case 'phoneEar': return { L: [-150, -330], R: [150, -835], down: true };
    case 'phoneShow': return { L: [-150, -330], R: [235, -800], down: true };
    case 'shock': { const b = Math.sin(t * 30) * 8; return { L: [-262, -935 + b], R: [262, -935 - b] }; }
    case 'cheeks': return { L: [-150, -790], R: [150, -790], down: true };
    case 'scratch': return { L: [-150, -330 + sw], R: [120 + Math.sin(t * 14) * 14, -990], down: true };
    case 'flex': return { L: [-128, -392], R: [215, -900] };
    case 'shrug': return { L: [-270, -620], R: [270, -620] };
    case 'beg': return { L: [-34, -600 + Math.sin(t * 8) * 10], R: [34, -600 + Math.sin(t * 8) * 10], down: true };
    case 'hang': return { L: [-120, -290], R: [120, -290] };
    default: { // rest, with idle sway and talk beats on the right hand
      const beat = talk > 0.05 ? (Math.sin(t * 7) * 30 + 40) * clamp(talk * 2) : 0;
      return { L: [-150 + sw, -330], R: [150 + beat * 0.8 - sw, -330 - beat * 2.4] };
    }
  }
}
export function person(x, y, c, o = {}) {
  const s = o.s ?? 1, t = o.t ?? 0, talk = clamp(o.talk || 0), seed = (x * 0.013) % 6.28;
  const breathe = Math.sin(t * 2.3 + seed), slump = o.slump || 0, q = o.squash || 0;
  const wph = o.walk || 0, walking = o.walk != null && o.walk !== 0;
  const OUT = ctx.getTransform();
  ctx.save();
  ctx.translate(x, y + (o.bob || 0));
  ctx.rotate((o.lean || 0) + (walking ? Math.sin(wph) * 0.025 : 0));
  ctx.scale(s * (1 + 0.14 * q), s * (1 - 0.14 * q));
  if (walking) ctx.translate(0, -Math.abs(Math.sin(wph)) * 14);
  // soft ground shadow
  if (!o.sit) { ctx.save(); ctx.globalAlpha = 0.16; ctx.beginPath(); ctx.ellipse(0, 4, 150, 22, 0, 0, TAU); ctx.fillStyle = '#000'; ctx.fill(); ctx.restore(); }
  const sway = walking ? 0 : Math.sin(t * 0.9 + seed) * 5;            // idle weight shift
  const up = -breathe * 4 + slump * 36;                               // chest rise / slump drop
  const hip = o.sit ? -200 : HIP, top = (o.sit ? -560 : -728) + up, tw = 250, sh = top + 48;
  // ---- legs ----
  const darkPants = c.pants === '#1E1E22';
  if (o.sit) {
    for (const sd of [-1, 1]) {
      stroke([[sd * 56, hip + 20], [sd * 66, -150]], c.skirt ? INK : (darkPants ? INK : c.pants), c.skirt ? 16 : 78);
      stroke([[sd * 66, -150], [sd * 70, -18]], c.skirt ? INK : (darkPants ? INK : c.pants), c.skirt ? 16 : 70);
      oval(sd * 80, -12, 46, 19, c.shoes || INK, INK, 6);
    }
    if (c.skirt) poly([[-tw * 0.5, hip - 30], [tw * 0.5, hip - 30], [tw * 0.62, hip + 70], [-tw * 0.62, hip + 70]], c.skirt, INK, 9);
  } else {
    for (const sd of [-1, 1]) {
      const a = wph + (sd > 0 ? Math.PI : 0), lift = walking ? Math.max(0, Math.sin(a)) * 46 : 0, sw2 = walking ? Math.cos(a) * 22 : 0;
      const hx = sd * 56 + sway, fx = sd * 62 + sw2, fy = -lift, kx = (hx + fx) / 2 + sd * 6, ky = (hip + fy) / 2 - lift * 0.4;
      if (c.skirt) { stroke([[hx * 0.8, hip + 120], [kx, ky + 40], [fx, fy - 12]], INK, 14); oval(fx + sd * 10, fy - 9, 30, 13, c.shoes, INK, 5); }
      else {
        const col = darkPants ? INK : c.pants;
        stroke([[hx, hip], [kx, ky], [fx, fy - 30]], INK, 86); stroke([[hx, hip], [kx, ky], [fx, fy - 30]], col, 72);
        oval(fx + sd * 16, fy - 12, 48, 20, INK, null);
      }
    }
    if (c.skirt) poly([[-tw * 0.47 + sway, hip - 46], [tw * 0.47 + sway, hip - 46], [tw * 0.66, hip + 150], [-tw * 0.66, hip + 150]], c.skirt, INK, 9);
  }
  // ---- torso (breathes) ----
  ctx.save(); ctx.translate(sway, hip); ctx.scale(1, 1 + breathe * 0.012); ctx.translate(-sway, -hip);
  box(-tw / 2 + sway, top, tw, hip - top + (c.skirt ? -20 : 14), 30, c.shirt, INK, 9);
  box(-tw / 2 + 14 + sway, hip - 46 + (c.skirt ? -20 : 14), tw - 28, 18, 6, c.shirtDark, null);
  if (c.badge) box(-tw * 0.3 + sway, top + 78, 36, 14, 2, c.badge, null);
  if (c.cardigan) { poly([[-46 + sway, top + 4], [46 + sway, top + 4], [sway, top + 150]], '#FFFFFF', INK, 6); for (let k = 0; k < 3; k++) disc(sway + 8, top + 190 + k * 60, 9, '#F3E6C9', INK, 4); stroke([[sway, top + 150], [sway, hip - 40]], INK, 5); }
  if (c.collar) { stroke([[-30 + sway, top + 6], [-6 + sway, top + 48], [4 + sway, top + 12]], INK, 6); stroke([[30 + sway, top + 6], [10 + sway, top + 48]], INK, 6); }
  ctx.restore();
  // ---- head (bobs with speech, tilts) ----
  const r = 176, hb = -talk * 16 + Math.sin(t * 2.3 + seed) * 2, hy = top - r + 46 + hb + slump * 20;
  const tilt = (o.tilt || 0) + Math.sin(t * 1.3 + seed) * 0.035 + talk * 0.07 * Math.sin(t * 9) - slump * 0.05;
  // ---- arms (IK, drawn after the head when hands come up in front of the face) ----
  const H = o.hands || gestureHands(o.gesture || 'rest', t, talk);
  const arm = (sd, P, hold) => {
    const S = [sd * (tw / 2 - 22) + sway, sh + slump * 10];
    const c1 = ik(S, P, 178, 170, 1), c2 = ik(S, P, 178, 170, -1);
    const k = H.down ? (c1.E[1] > c2.E[1] ? c1 : c2) : (Math.abs(c1.E[0]) > Math.abs(c2.E[0])) !== !!o.elbowIn ? c1 : c2;   // elbows out (or down for hand-to-face poses)
    stroke([k.E, k.H], INK, 17);
    stroke([S, k.E], INK, 70); stroke([S, k.E], c.shirt, 56);
    return k.H;
  };
  const handsUp = Math.min(H.L[1], H.R[1]) < top - 60;
  const drawArms = () => {
    const hl = arm(-1, H.L), hr = arm(1, H.R);
    for (const [p, hold] of [[hl, o.holdL], [hr, o.hold]]) {
      if (hold) {   // draw the prop in the caller's space, at the hand
        const w = ctx.getTransform().transformPoint(new DOMPoint(p[0], p[1])), l = OUT.inverse().transformPoint(w);
        ctx.save(); ctx.setTransform(OUT); hold(l.x, l.y); ctx.restore();
      }
      disc(p[0], p[1], 27, INK, null);
    }
  };
  if (!handsUp) drawArms();
  ctx.save(); ctx.translate(sway, hy); ctx.rotate(tilt);
  head(0, 0, r, { band: o.band, cast: c, mood: o.mood, talk, look: o.look, blink: o.blink, sweat: o.sweat, shades: o.shades, t });
  ctx.restore();
  if (handsUp) drawArms();
  ctx.restore();
}

// ---------- Pickles the chihuahua ----------
export function pickles(x, y, s = 1, o = {}) {
  const d = o.dir || 1, bark = o.bark || 0, lw = 7, fur = '#E2B97E';
  ctx.save(); ctx.translate(x, y - (bark > 0.5 ? 14 * s : 0)); ctx.scale(d * s, s); if (o.faint) { ctx.translate(0, -60); ctx.rotate(o.faint * 1.6); ctx.translate(0, 60); }
  for (const lx of [-60, -35, 40, 62]) stroke([[lx, -70], [lx, -8]], INK, 9);
  ctx.beginPath(); ctx.moveTo(-85, -95); ctx.quadraticCurveTo(-130, -150 - 20 * Math.sin((o.t || 0) * 20), -110, -170); ctx.strokeStyle = INK; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.stroke();
  oval(0, -100, 95, 48, fur, INK, lw);
  // head
  const hx = 95, hy = -170 - bark * 8;
  poly([[hx - 40, hy - 25], [hx - 70, hy - 105], [hx - 10, hy - 45]], fur, INK, lw);
  poly([[hx + 20, hy - 40], [hx + 45, hy - 115], [hx + 52, hy - 30]], fur, INK, lw);
  oval(hx, hy, 58, 50, fur, INK, lw);
  oval(hx + 52, hy + 12, 30, 22 + bark * 8, fur, INK, lw);
  disc(hx + 78, hy + 2, 8, INK, null);
  oval(hx + 2, hy - 10, 13, 16, '#FFFFFF', INK, 4); disc(hx + 6, hy - 8, 6, INK, null);
  oval(hx + 30, hy - 12, 11, 14, '#FFFFFF', INK, 4); disc(hx + 33, hy - 10, 5, INK, null);
  stroke([[hx - 12, hy - 34], [hx + 14, hy - 26]], INK, 5); stroke([[hx + 22, hy - 28], [hx + 42, hy - 34]], INK, 5);   // angry brows
  if ((o.faint || 0) > 0.8) for (const ex of [hx + 2, hx + 30]) { disc(ex, hy - 10, 16, '#E2B97E', null); stroke([[ex - 9, hy - 19], [ex + 9, hy - 1]], INK, 5); stroke([[ex + 9, hy - 19], [ex - 9, hy - 1]], INK, 5); }
  if (bark > 0.1) oval(hx + 60, hy + 30, 16, 10 * bark + 4, '#7A1F2B', INK, 4);
  ctx.restore();
}
export function yap(x, y, k, rot = 0) { // pop-in "YAP!" burst
  if (k <= 0) return; const sc = eob(clamp(k));
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc); label('YAP!', 0, 0, 96, P.yellow, 20); ctx.restore();
}

// ---------- outdoor set ----------
function tree(x, y, s, col) {
  box(x - 14 * s, y - 120 * s, 28 * s, 130 * s, 4, P.trunk, null);
  for (const [dx, dy, r] of [[0, -200, 95], [-70, -150, 70], [70, -150, 70], [0, -130, 80]]) disc(x + dx * s, y + dy * s, r * s, col, null);
}
export function hedgeBlob(x, yBase, w, h, seed = 1, o = {}) {
  const wob = o.wiggle || 0, col = o.col || P.hedge;
  ctx.save();
  ctx.beginPath();
  const n = Math.max(5, Math.round(w / 70));
  ctx.moveTo(x, yBase);
  ctx.lineTo(x, yBase - h + 40);
  for (let i = 0; i <= n; i++) {
    const px = x + (w * i) / n, py = yBase - h + Math.sin(i * 1.7 + seed) * 8 + Math.sin(wob * 30 + i) * wob * 10;
    ctx.quadraticCurveTo(px - w / n / 2, py - 34, px, py);
  }
  ctx.lineTo(x + w, yBase); ctx.closePath();
  ctx.fillStyle = col; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = o.lw ?? 8; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.clip();
  // leaf dabs
  for (let i = 0; i < (w * h) / 5200; i++) {
    const lx = x + rnd(i * 3 + seed) * w, ly = yBase - rnd(i * 7 + seed * 5) * h;
    ctx.beginPath(); ctx.arc(lx, ly, 14 + rnd(i + seed) * 10, Math.PI * 1.1, Math.PI * 1.9); ctx.strokeStyle = rnd(i * 11) > 0.5 ? P.hedgeDark : P.hedgeLight; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.stroke();
  }
  ctx.restore();
}
export function mailbox(x, y, s = 1, squash = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (squash > 0) {
    box(-10, -40 * (1 - squash) - 30, 20, 40 * (1 - squash) + 30, 3, P.trunk, INK, 6);
    ctx.save(); ctx.translate(0, -70 * (1 - squash) - 30); ctx.rotate(-0.25 * squash); ctx.scale(1 + 0.25 * squash, 1 - 0.6 * squash);
    box(-80, -70, 160, 75, 26, P.blueBox, INK, 7); label('PETTY', 0, -32, 30, '#fff');
    ctx.restore(); ctx.restore(); return;
  }
  box(-10, -170, 20, 170, 3, P.trunk, INK, 6);
  box(-80, -250, 160, 85, 30, P.blueBox, INK, 7); label('PETTY', 0, -207, 32, '#fff');
  box(70, -262, 12, 50, 3, P.red, INK, 4);
  ctx.restore();
}
function windowBox(x, y, w, h, night) {
  box(x, y, w, h, 4, night ? '#FFD982' : P.glass, INK, 7);
  stroke([[x + w / 2, y], [x + w / 2, y + h]], '#FFFFFF', 8); stroke([[x, y + h / 2], [x + w, y + h / 2]], '#FFFFFF', 8);
  ctx.strokeStyle = INK; ctx.lineWidth = 7; ctx.strokeRect(x, y, w, h);
}
export function house(x, y, w, o = {}) {   // x = left, y = ground line of the house
  const h = w * 0.62, sid = o.siding || P.siding, sl = o.sidingLine || P.sidingLine, roof = o.roof || P.roof, night = o.night;
  // roof
  poly([[x - 40, y - h], [x + w / 2, y - h - w * 0.42], [x + w + 40, y - h]], roof, INK, 8);
  box(x, y - h, w, h, 0, sid, INK, 8);
  ctx.save(); ctx.beginPath(); ctx.rect(x, y - h, w, h); ctx.clip();
  for (let yy = y - h + 26; yy < y; yy += 26) stroke([[x, yy], [x + w, yy]], sl, 3);
  ctx.restore();
  ctx.strokeStyle = INK; ctx.lineWidth = 8; ctx.strokeRect(x, y - h, w, h);
  // gable triangle siding + round window
  poly([[x + w * 0.12, y - h], [x + w / 2, y - h - w * 0.32], [x + w * 0.88, y - h]], sid, INK, 6);
  disc(x + w / 2, y - h - w * 0.13, w * 0.07, night ? '#FFD982' : P.glass, INK, 7);
  stroke([[x + w / 2 - w * 0.07, y - h - w * 0.13], [x + w / 2 + w * 0.07, y - h - w * 0.13]], '#FFF', 4);
  stroke([[x + w / 2, y - h - w * 0.2], [x + w / 2, y - h - w * 0.06]], '#FFF', 4);
  // door + windows
  box(x + w * 0.42, y - h * 0.62, w * 0.16, h * 0.62, 3, P.door, INK, 7);
  disc(x + w * 0.55, y - h * 0.3, 6, P.yellow, null);
  windowBox(x + w * 0.1, y - h * 0.68, w * 0.22, h * 0.38, night);
  windowBox(x + w * 0.68, y - h * 0.68, w * 0.22, h * 0.38, night);
  box(x + w * 0.38, y - 18, w * 0.24, 18, 2, '#C9C9C9', INK, 5);
}
// The Crabapple Lane street. o: { night, grassY, pettyHedge: {h, wiggle}, garyHedge: {h} }
export const GROUND = 1560;   // sidewalk line where people stand
export function street(o = {}) {
  const night = o.night, gy = o.grassY ?? 1330;
  // sky
  const g = ctx.createLinearGradient(0, 0, 0, gy);
  if (night) { g.addColorStop(0, '#0E1734'); g.addColorStop(1, '#2A3A6A'); } else { g.addColorStop(0, P.sky); g.addColorStop(1, P.skyLow); }
  ctx.fillStyle = g; ctx.fillRect(-300, -300, W + 600, gy + 300);
  if (night) { disc(860, 260, 70, '#FFF4C4', null); disc(890, 240, 62, '#1B2750', null); for (let i = 0; i < 30; i++) disc(rnd(i) * 1080, rnd(i + 9) * 700, 3, '#FFFFFF', null); }
  else { disc(110, 140, 60, '#FFE37A', null); }
  const tc = night ? '#1F4A3A' : P.tree;
  tree(-30, gy - 360, 1.3, tc); tree(560, gy - 420, 1.1, tc); tree(1110, gy - 380, 1.3, tc);
  // houses
  house(30, gy - 160, 480, { night });
  house(620, gy - 160, 430, { night, siding: P.gsiding, sidingLine: P.gsidingLine, roof: P.groof });
  // lawn + path + sidewalk + road
  ctx.fillStyle = night ? '#24563A' : P.grass; ctx.fillRect(-300, gy - 160, W + 600, 300);
  ctx.fillStyle = night ? '#6E7385' : P.side; ctx.fillRect(-300, gy + 130, W + 600, 200);
  for (let x = -40; x < W + 60; x += 180) stroke([[x, gy + 130], [x - 40, gy + 330]], night ? '#5D6273' : P.sideLine, 4);
  ctx.fillStyle = night ? '#2E3038' : P.road; ctx.fillRect(-300, gy + 330, W + 600, 600);
  for (let x = 0; x < W; x += 260) box(x, gy + 470, 140, 18, 6, night ? '#8A8A8A' : '#FFFFFF', null);
  // hedges along the front of each yard
  const ph = o.pettyHedge || {}, gh = o.garyHedge || {};
  if (gh.h !== 0) hedgeBlob(600, gy + 120, 470, gh.h ?? 330, 3, { col: night ? '#2F6A33' : P.hedge });
  if (!o.noPettyHedge) hedgeBlob(-20, gy + 120, 470, ph.h ?? 140, 7, { wiggle: ph.wiggle || 0, col: night ? '#2F6A33' : P.hedge });
  if (!o.noMailbox) mailbox(500, gy + 150, 0.9, o.mailSquash || 0);
}

// ---------- living room ----------
export function livingRoom(o = {}) {
  ctx.fillStyle = P.wall; ctx.fillRect(-300, -300, W + 600, 1600);
  for (let x = -40; x < W + 60; x += 110) stroke([[x, -300], [x, 1300]], P.wallLine, 4);
  ctx.fillStyle = P.floor; ctx.fillRect(-300, 1300, W + 600, 900);
  for (let y = 1360; y < 2100; y += 70) stroke([[-300, y], [W + 300, y]], P.floorLine, 4);
  stroke([[-300, 1300], [W + 300, 1300]], INK, 6);
  // family wall photo: Dave, Linda, Josh
  const fx = o.photoX ?? 170, fy = o.photoY ?? 520;
  box(fx - 130, fy - 100, 260, 200, 6, P.frame, INK, 7); box(fx - 108, fy - 78, 216, 156, 2, '#F6E7C8', INK, 4);
  for (const [dx, k] of [[-58, 'dave'], [0, 'josh'], [58, 'linda']]) {
    const c = k === 'josh' ? { ...CAST.dave, head: 'bald' } : CAST[k];
    box(fx + dx - 24, fy + 18, 48, 60, 8, k === 'josh' ? '#5DB548' : c.shirt, INK, 3);
    head(fx + dx, fy - 8, 26, { cast: c, mood: 'happy' });
  }
  // shelf + Kevin's fishbowl
  if (o.kevin !== false) {
    const kx = o.kevinX ?? 880, ky = o.kevinY ?? 700;
    box(kx - 130, ky, 260, 22, 4, P.frame, INK, 6);
    ctx.save(); ctx.beginPath(); ctx.arc(kx, ky - 70, 72, 0, TAU); ctx.fillStyle = 'rgba(160,215,240,0.75)'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.stroke(); ctx.restore();
    const fxk = kx + Math.sin((o.t || 0) * 2) * 20;
    oval(fxk, ky - 62, 22, 14, '#F59A2B', INK, 4); poly([[fxk - 20, ky - 62], [fxk - 40, ky - 76], [fxk - 40, ky - 48]], '#F59A2B', INK, 4);
    box(kx - 54, ky + 34, 108, 34, 6, '#FFFFFF', INK, 4); label('KEVIN 7', kx, ky + 52, 20, INK, 0, INK, 800);
  }
  // couch
  if (o.couch !== false) {
    const cx = o.couchX ?? 300;
    box(cx - 260, 1060, 520, 180, 30, P.couch, INK, 8); box(cx - 300, 1110, 80, 190, 24, P.couchDark, INK, 8); box(cx + 220, 1110, 80, 190, 24, P.couchDark, INK, 8);
    box(cx - 230, 1170, 460, 110, 18, P.couchDark, INK, 8);
  }
}
// big window with pink curtains. open: 0 closed → 1 fully open. view: 'leaves' | 'sky'
export function bigWindow(x, y, w, h, open, view = 'sky', t = 0) {
  box(x - 20, y - 20, w + 40, h + 40, 6, '#FFFFFF', INK, 8);
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  if (view === 'leaves') {
    ctx.fillStyle = '#2F7A2A'; ctx.fillRect(x, y, w, h);
    for (let i = 0; i < 90; i++) {
      const lx = x + rnd(i * 3.1) * w, ly = y + rnd(i * 5.7) * h, r = 30 + rnd(i * 2.3) * 30;
      oval(lx, ly, r, r * 0.55, rnd(i) > 0.5 ? '#3E9A35' : '#4FB043', '#24601F', 4, rnd(i * 9) * 3);
    }
  } else { ctx.fillStyle = P.sky; ctx.fillRect(x, y, w, h); }
  ctx.restore();
  stroke([[x + w / 2, y], [x + w / 2, y + h]], '#FFFFFF', 12); stroke([[x, y + h / 2], [x + w, y + h / 2]], '#FFFFFF', 12);
  ctx.strokeStyle = INK; ctx.lineWidth = 7; ctx.strokeRect(x, y, w, h);
  // curtains
  const cw = lerp(w / 2 + 10, w * 0.16, open);
  for (const side of [-1, 1]) {
    const cx0 = side < 0 ? x - 10 : x + w + 10 - cw;
    box(cx0, y - 30, cw, h + 60, 4, P.curtain, INK, 7);
    for (let k = 1; k < 4; k++) stroke([[cx0 + (cw * k) / 4, y - 26], [cx0 + (cw * k) / 4, y + h + 26]], P.curtainDark, 5);
  }
  box(x - 50, y - 50, w + 100, 22, 8, '#B8B8B8', INK, 6);
  box(x - 40, y + h + 24, w + 80, 26, 6, '#EDE6D8', INK, 6);
}

// ---------- props ----------
export function megaGrow(x, y, s = 1, rot = 0) {   // big bottle of plant food
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  box(-26, -250, 52, 50, 8, '#2B2B2B', INK, 6);
  box(-80, -205, 160, 270, 34, '#9BE15D', INK, 8);
  box(-70, -150, 140, 120, 10, '#FFFFFF', INK, 5);
  label('MEGA', 0, -115, 40, '#2E8B2E', 0, INK, 900); label('GROW', 0, -72, 40, '#2E8B2E', 0, INK, 900);
  label('!!!', 0, 20, 40, P.red, 0, INK, 900);
  ctx.restore();
}
export function shears(x, y, s = 1, snip = 0, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  const a = 0.08 + 0.22 * snip;
  for (const k of [-1, 1]) {
    ctx.save(); ctx.rotate(k * a);
    box(-6, -150, 12, 150, 4, '#C9CED6', INK, 5); box(-10, 0, 20, 70, 6, '#D9442E', INK, 5);
    ctx.restore();
  }
  disc(0, 0, 8, '#555', INK, 3);
  ctx.restore();
}
export function lemonade(x, y, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  poly([[-34, -110], [34, -110], [26, 0], [-26, 0]], '#FFF2A6', INK, 6);
  stroke([[10, -110], [30, -170]], '#E23B3B', 8); disc(-26, -104, 14, '#FFE03A', INK, 4);
  ctx.restore();
}
export function lawnChair(x, y, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  stroke([[-120, 0], [80, -230]], '#8F9AA8', 14); stroke([[120, 0], [-60, -230]], '#8F9AA8', 14);
  poly([[-150, -250], [140, -250], [130, -210], [-140, -210]], '#3FB6C7', INK, 7);
  poly([[-170, -460], [-120, -460], [-110, -230], [-160, -230]], '#3FB6C7', INK, 7);
  ctx.restore();
}

// ---------- end card ----------
export function endCard(lt) {
  ctx.fillStyle = '#FFC93C'; ctx.fillRect(-300, -300, W + 600, H + 600);
  ctx.save(); ctx.translate(540, 720); ctx.rotate(lt * 0.25);
  for (let i = 0; i < 16; i++) { ctx.rotate(TAU / 16); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-90, -1600); ctx.lineTo(90, -1600); ctx.closePath(); ctx.fillStyle = i % 2 ? '#FFD95E' : '#FFC93C'; ctx.fill(); }
  ctx.restore();
  const k = eob(clamp(lt / 0.35));
  ctx.save(); ctx.translate(540, 700); ctx.scale(k, k);
  for (let i = 0; i < 9; i++) { const a = -Math.PI * 0.9 + (i * Math.PI * 0.8) / 8; stroke([[Math.cos(a) * 230, Math.sin(a) * 230 - 30], [Math.cos(a) * 290, Math.sin(a) * 290 - 30]], INK, 9); }
  disc(0, -30, 190, '#FFFFFF', INK, 11);
  box(-90, 150, 180, 40, 10, '#C9CED6', INK, 8); box(-80, 190, 160, 40, 10, '#C9CED6', INK, 8); box(-55, 230, 110, 36, 14, '#8D939C', INK, 8);
  arcStroke(-62, -40, 30, Math.PI * 1.15, Math.PI * 1.85, INK, 10); arcStroke(62, -40, 30, Math.PI * 1.15, Math.PI * 1.85, INK, 10);
  arcStroke(0, 10, 50, Math.PI * 0.2, Math.PI * 0.8, INK, 10);
  ctx.restore();
  const k2 = eob(clamp((lt - 0.15) / 0.35));
  ctx.save(); ctx.translate(540, 1150); ctx.scale(k2, k2);
  label('FOLLOW', 0, -70, 120, '#FFFFFF', 26); label('PLOTBULB', 0, 60, 120, '#FFFFFF', 26);
  label('FOR MORE TWISTS!', 0, 170, 56, P.yellow, 16);
  ctx.restore();
  const k3 = eob(clamp((lt - 0.35) / 0.35));
  ctx.save(); ctx.translate(540, 1500); ctx.scale(k3, k3); box(-200, -50, 400, 100, 50, P.red, INK, 8); label('SUBSCRIBE', 0, 2, 50, '#FFFFFF'); ctx.restore();
}

// ---------- The Pettys end card (series brand) ----------
// lt = time since the card starts. The sting's hit lands at lt = 0.42 (logo slam). Needs person/pickles above.
export function pettysCard(lt, t, o = {}) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#3E7FD6'); g.addColorStop(1, '#2A5BA8');
  ctx.fillStyle = g; ctx.fillRect(-300, -300, W + 600, H + 600);
  ctx.save(); ctx.translate(540, 760); ctx.rotate(lt * 0.2);
  for (let i = 0; i < 18; i++) { ctx.rotate(TAU / 18); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-80, -1700); ctx.lineTo(80, -1700); ctx.closePath(); ctx.fillStyle = i % 2 ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0)'; ctx.fill(); }
  ctx.restore();
  // the house behind the family
  const hk = eob(clamp(lt / 0.3));
  ctx.save(); ctx.translate(540, 1300); ctx.scale(hk, hk); ctx.translate(-540, -1300);
  house(250, 1300, 580, {});
  ctx.restore();
  // family pops in, one by one (squash on landing)
  const pop = (a) => { const k = clamp((lt - a) / 0.22); return k <= 0 ? null : { k: eob(k), q: k < 1 ? 0.35 * (1 - k) : 0 }; };
  const G = pop(0.05), D = pop(0.12), B = o.bev ? pop(0.19) : null, Lp = pop(o.bev ? 0.26 : 0.19), Pk = pop(o.bev ? 0.33 : 0.3);
  const X = o.bev ? { g: 935, d: 175, b: 425, l: 685 } : { g: 900, d: 300, l: 620 }, SC = o.bev ? 0.68 : 0.8;
  ctx.save(); ctx.beginPath(); ctx.rect(-300, -300, W + 600, 1845); ctx.clip();
  if (G) person(lerp(1300, X.g, G.k), 1545, CAST.gary, { s: o.bev ? 0.64 : 0.7, t, mood: 'smug', gesture: 'cross', look: [-0.6, 0], squash: G.q });
  if (B) person(X.b, lerp(2300, 1545, B.k), CAST.bev, { s: SC, t, mood: 'smug', gesture: 'cross', squash: B.q, look: [0.4, 0] });
  if (D) person(X.d, lerp(2300, 1545, D.k), CAST.dave, { s: SC, t, mood: 'happy', gesture: 'shrug', squash: D.q, talk: 0 });
  if (Lp) person(X.l, lerp(2300, 1545, Lp.k), CAST.linda, { s: SC, t, mood: 'smug', gesture: 'hips', squash: Lp.q, look: [-0.4, 0] });
  ctx.restore();
  // ground band + Pickles
  ctx.fillStyle = '#6CC04A'; ctx.fillRect(-300, 1540, W + 600, 60); stroke([[-300, 1540], [W + 300, 1540]], INK, 8);
  if (Pk) pickles(lerp(-200, 170, Pk.k), 1590, 0.9, { dir: 1, t, bark: lt > 0.42 && lt < 0.7 ? 1 : 0 });
  // logo slams in on the hit
  const lk = clamp((lt - 0.38) / 0.16);
  if (lk > 0) {
    const sc = lerp(2.2, 1, eo(lk)) * (1 + 0.06 * Math.sin(Math.max(0, lt - 0.54) * 18) * Math.exp(-Math.max(0, lt - 0.54) * 5));
    ctx.save(); ctx.translate(540, 300); ctx.rotate(-0.05); ctx.scale(sc, sc);
    box(-430, -150, 860, 300, 46, P.red, INK, 12);
    label('THE', 0, -78, 70, '#FFFFFF', 18);
    label('PETTYS', 0, 40, 190, P.yellow, 34);
    ctx.restore();
  }
  // Plotbulb + subscribe
  const bk = eob(clamp((lt - 0.7) / 0.3));
  if (bk > 0) {
    ctx.save(); ctx.translate(540, 1740); ctx.scale(bk, bk);
    label('NEW EPISODE EVERY DAY', 0, -60, 56, '#FFFFFF', 16);
    // tiny bulb
    disc(-250, 50, 38, '#FFFFFF', INK, 6); box(-268, 86, 36, 22, 6, '#C9CED6', INK, 5);
    label('PLOTBULB', -60, 52, 60, P.yellow, 16);
    box(150, 8, 270, 88, 44, P.red, INK, 7); label('SUBSCRIBE', 285, 54, 40, '#FFFFFF');
    ctx.restore();
  }
}


// ---------- porch, lasagna, suitcases ----------
export function lasagna(x, y, s = 1) {   // a lasagna dish, centre (x, y)
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  box(-130, -40, 260, 90, 18, '#F4EFE6', INK, 7); box(-130, 28, 260, 18, 8, '#4C7FC4', null);
  box(-115, -62, 230, 40, 12, '#E8A93C', INK, 6);
  for (const [dx, dy] of [[-70, -48], [-20, -40], [35, -50], [80, -42], [5, -52]]) disc(dx, dy, 11, '#C8412E', null);
  for (const k of [-1, 1]) { ctx.save(); ctx.globalAlpha = 0.7; stroke([[k * 40, -80], [k * 46 + 8, -120], [k * 40, -150]], '#FFFFFF', 6); ctx.restore(); }
  ctx.restore();
}
export function suitcase(x, y, w, h, col, open = 0) {   // (x, y) = bottom centre; open 0..1 flips the lid up and shows the lasagnas
  if (open > 0.02) {
    const lh = h * 0.85, ang = open * 1.25;
    ctx.save(); ctx.translate(x, y - h); ctx.scale(1, Math.cos(ang)); box(-w / 2, -lh, w, lh, 22, col, INK, 8); ctx.restore();
    box(x - w / 2, y - h, w, h, 22, col, INK, 8);
    box(x - w / 2 + 16, y - h + 14, w - 32, h - 28, 14, '#6A4A35', null);
    const rows = Math.max(2, Math.floor((h - 40) / 46));
    for (let r = 0; r < rows; r++) for (let c = 0; c < 2; c++) {
      const lx = x - w / 2 + 28 + c * (w - 56) / 2, ly = y - h + 26 + r * 46, lw = (w - 64) / 2;
      box(lx, ly, lw, 38, 8, '#E8A93C', INK, 4); stroke([[lx + 8, ly + 26], [lx + lw - 8, ly + 26]], '#C8412E', 6);
    }
    return;
  }
  box(x - w / 2, y - h, w, h, 22, col, INK, 8);
  stroke([[x - 40, y - h], [x - 40, y - h - 34], [x + 40, y - h - 34], [x + 40, y - h]], INK, 10);
  for (const k of [-0.25, 0.25]) stroke([[x + k * w, y - h + 6], [x + k * w, y - 6]], '#00000033', 10);
}
export function porch(o = {}) {
  ctx.fillStyle = P.siding; ctx.fillRect(-300, -300, W + 600, 1900);
  for (let y = -300; y < 1560; y += 34) stroke([[-300, y], [W + 300, y]], P.sidingLine, 4);
  // window
  box(640, 640, 330, 380, 6, P.glass, INK, 8); stroke([[805, 640], [805, 1020]], '#FFFFFF', 10); stroke([[640, 830], [970, 830]], '#FFFFFF', 10); ctx.strokeStyle = INK; ctx.lineWidth = 8; ctx.strokeRect(640, 640, 330, 380);
  // doorway + door
  box(140, 520, 400, 1050, 4, '#FFFFFF', INK, 10);
  box(165, 545, 350, 1015, 2, '#6B5444', null);
  stroke([[165, 1380], [515, 1380]], '#5A4636', 6);
  const dk = o.doorOpen ?? 1, dw = lerp(350, 70, dk);
  box(165, 545, dw, 1015, 4, P.door, INK, 8); if (dk < 0.6) disc(165 + dw - 30, 1080, 12, P.yellow, INK, 4);
  // porch floor + mat
  ctx.fillStyle = '#B98A5E'; ctx.fillRect(-300, 1560, W + 600, 700); for (let y = 1600; y < 2300; y += 60) stroke([[-300, y], [W + 300, y]], '#A0744B', 4);
  stroke([[-300, 1560], [W + 300, 1560]], INK, 8);
  box(180, 1575, 320, 70, 10, '#7A9A4C', INK, 6); label('WELCOME', 340, 1611, 34, '#E9F2D6', 0, INK, 900);
}
