// SHE'S HERE: Grandma Bev arrives with three suitcases... full of lasagna.
import { ctx, W, H, clamp, lerp, seg, eo, eio, eob } from './core/lib.js';
import { L, Le, Wd, T } from './core/timing.js';
import { CAST, P, INK, person, pickles, yap, street, porch, lasagna, suitcase, pettysCard, blurred, stroke, disc, label, box } from './pb.js';

const YARD = await (async () => { const i = new Image(); i.src = 'sets/frontyard_C_porch.png'; await i.decode(); return i; })();
// the blue Petty house front, pushed in on the door; k = how far the door is open
function yard(k = 1) {
  ctx.save(); ctx.translate(540, 960); ctx.scale(2.2, 2.2); ctx.translate(-540, -790);
  ctx.drawImage(YARD, 0, 0);
  if (k > 0) { box(442, 580, 196, 384, 0, '#4E3B2E', null); box(442, 880, 196, 84, 0, '#5E4838', null); box(442, 580, lerp(196, 34, k), 384, 2, '#7B4F33', INK, 3); }
  ctx.restore();
}
const STREET = await (async () => { const i = new Image(); i.src = 'sets/street_A_wide.png'; await i.decode(); return i; })();
const ENV = await (await fetch('data/env.json', { cache: 'no-store' })).json();
const SPEAK = { dave: [2, 3], bev: [0, 1, 4] };
const talk = (who, t) => SPEAK[who].some((i) => t >= L(i) - 0.03 && t <= Le(i) + 0.03) ? (ENV[Math.floor(t * 30)] || 0) : 0;
const blink = (t, seed) => ((t + seed) % 3.3) < 0.11 ? 1 : 0;
const CASES = [['#6B4E8A', 230], ['#C0392B', 540], ['#2F7D6B', 850]];
const holdDish = { L: [-95, -600], R: [95, -600] };

export function buildShots() {
  const S = [], CUES = [];
  const add = (s) => S.push(s), cue = (t, type, extra = {}) => CUES.push({ t: +t.toFixed(3), type, ...extra });
  const barkT = Le(2) + 0.2, popT = [Le(4) + 0.25, Le(4) + 0.5, Le(4) + 0.75];
  const C = { bevClose: L(1) - 0.15, dave1: L(2) - 0.12, bark: barkT - 0.1, dave2: L(3) - 0.2, bev2: L(4) - 0.2, reveal: Le(4) + 0.1, react: Le(4) + 1.45, card: Le(4) + 2.85 };

  // 1. The doorstep
  add({ id: 'A', at: 0, cam: [540, 1150], zoom: 0.05, note: 'porch: Bev arrives', draw(lt, d, t) {
    yard(eio(seg(t, 0.35, 0.75)));
    if (t > 0.6) person(540, 1345, CAST.dave, { s: 0.7, t, mood: t < 0.9 ? 'calm' : 'shock', blink: blink(t, 0.2), look: [1, 0] });
    for (const [col, x] of [[CASES[0][0], 110], [CASES[1][0], 230], [CASES[2][0], 350]]) suitcase(x, 1450, 110, 170, col);
    person(830, 1440, CAST.bev, { s: 0.76, t, mood: 'happy', talk: talk('bev', t), blink: blink(t, 0.9), hands: holdDish, hold: (hx, hy) => lasagna(hx - 76, hy - 20, 0.95) });
  } });
  cue(0.1, 'doorbell'); cue(0.4, 'slide', { dur: 0.4, gain: 0.5 });

  // 2. Bev close: "Linda says you love it."
  add({ id: 'B', at: C.bevClose, cam: [540, 1000], zoom: 0.06, note: 'Bev close', draw(lt, d, t) {
    blurred(12, () => yard(1), 'porchBlur');
    person(540, 2264, CAST.bev, { s: 1.45, t, mood: 'smug', talk: talk('bev', t), blink: blink(t, 0.4), hands: holdDish, hold: (hx, hy) => lasagna(hx - 138, hy - 60, 1.3) });
  } });
  cue(C.bevClose - 0.02, 'whoosh', { gain: 0.6 });

  // 3. Dave: "I LOVE it!"
  add({ id: 'C', at: C.dave1, cam: [540, 1000], zoom: 0.07, note: 'Dave forced smile', draw(lt, d, t) {
    blurred(12, () => yard(1), 'porchBlur');
    const q = talk('dave', t) > 0.5 ? 0.2 : 0;
    person(540, 2264, CAST.dave, { s: 1.45, t, mood: 'happy', talk: talk('dave', t), sweat: 1, squash: q, gesture: 'shrug' });
  } });
  cue(C.dave1 - 0.02, 'whoosh', { gain: 0.6 });

  // 4. Pickles over the fence: LIE
  add({ id: 'D', at: C.bark, cam: [540, 1100], zoom: 0.12, note: 'Pickles barks', draw(lt, d, t) {
    blurred(10, () => { ctx.save(); ctx.translate(540, 960); ctx.scale(2.4, 2.4); ctx.translate(-560, -1150); ctx.drawImage(STREET, 0, 0); ctx.restore(); }, 'garyHouseBlur');
    ctx.save(); ctx.translate(Math.sin(lt * 50) * 5, 0); pickles(380, 1900, 2.6, { dir: 1, bark: Math.sin(lt * 26) > 0 ? 1 : 0.2, t }); ctx.restore();
    yap(760, 760, seg(lt, 0.08, 0.2), 0.15); yap(820, 1050, seg(lt, 0.6, 0.72), -0.1);
  } });
  cue(C.bark - 0.02, 'whoosh', { gain: 0.5 }); cue(barkT, 'bark', { dur: 1.08 });

  // 5. Dave: "So... how long are you staying?"
  add({ id: 'E', at: C.dave2, cam: [540, 1000], zoom: 0.06, note: 'Dave asks', draw(lt, d, t) {
    blurred(12, () => yard(1), 'porchBlur');
    person(540, 2264, CAST.dave, { s: 1.45, t, mood: 'annoyed', talk: talk('dave', t), sweat: 1, gesture: 'scratch', look: [0.7, 0.2] });
  } });
  cue(C.dave2 - 0.02, 'whoosh', { gain: 0.6 });

  // 6. Bev: "Until you finish them."
  add({ id: 'F', at: C.bev2, cam: [540, 980], zoom: 0.14, note: 'Bev: until you finish them', draw(lt, d, t) {
    blurred(12, () => yard(1), 'porchBlur');
    person(540, 2264, CAST.bev, { s: 1.45, t, mood: 'sneaky', talk: talk('bev', t), lean: 0.04, gesture: 'hips' });
  } });
  cue(C.bev2 - 0.02, 'whoosh', { gain: 0.6 });

  // 7. The reveal: three suitcases of lasagna
  add({ id: 'G', at: C.reveal, cam: [540, 1100], zoom: 0.05, note: 'suitcases pop open', draw(lt, d, t) {
    yard(1);
    CASES.forEach(([col, x], i) => suitcase(x, 1820, 280, 520, col, eob(seg(t, popT[i], popT[i] + 0.2))));
    if (t > popT[2] + 0.15) label('!!!', 540, 520, 140, P.red, 20);
  } });
  cue(C.reveal - 0.02, 'whoosh'); popT.forEach((p, i) => cue(p, 'pop', { gain: 0.8 + i * 0.15 }));

  // 8. Dave's face; Pickles faints
  add({ id: 'H', at: C.react, cam: [540, 1000], zoom: 0.1, note: 'Dave reaction, Pickles faints', draw(lt, d, t) {
    blurred(12, () => yard(1), 'porchBlur');
    const q = lt < 0.1 ? lt / 0.1 * 0.5 : Math.max(-0.35, 0.5 - (lt - 0.1) * 8) * Math.exp(-(lt - 0.1) * 3);
    person(500, 2264, CAST.dave, { s: 1.45, t, mood: 'shock', sweat: 1, squash: q, gesture: 'shock' });
    pickles(905, 1720, 1.05, { dir: -1, t, faint: eio(seg(lt, 0.45, 0.75)) });
  } });
  cue(C.react - 0.02, 'whoosh'); cue(C.react + 0.72, 'thud', { gain: 0.7 });

  // 9. The Pettys card, now with Bev
  add({ id: 'I', at: C.card, cam: [540, 960], zoom: 0, note: 'The Pettys card', draw(lt, d, t) { pettysCard(lt, t, { bev: true }); } });
  cue(C.card, 'sting'); cue(C.card + 0.05, 'pop', { gain: 0.4 }); cue(C.card + 0.12, 'pop', { gain: 0.4 }); cue(C.card + 0.19, 'pop', { gain: 0.4 }); cue(C.card + 0.26, 'pop', { gain: 0.4 }); cue(C.card + 0.45, 'bark', { dur: 0.36, gain: 0.7 });
  return { shots: S, cues: CUES };
}
