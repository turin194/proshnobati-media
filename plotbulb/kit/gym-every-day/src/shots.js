// GYM EVERY DAY: Dave brags; Pickles barks at every lie; Linda delivers the gym's phone call.
import { ctx, W, H, clamp, lerp, seg, eo, eio, eob } from './core/lib.js';
import { L, Le, Wd, T } from './core/timing.js';
import { CAST, P, INK, person, pickles, yap, street, GROUND, endCard, blurred, stroke, disc, label, box, poly } from './pb.js';

const ENV = await (await fetch('data/env.json', { cache: 'no-store' })).json();
const SPEAK = { dave: [0, 1, 2], linda: [3, 4] };
const talk = (who, t) => SPEAK[who].some((i) => t >= L(i) - 0.03 && t <= Le(i) + 0.03) ? (ENV[Math.floor(t * 30)] || 0) : 0;
const blink = (t, seed) => ((t + seed) % 3.3) < 0.11 ? 1 : 0;
const BAND = '#E23B3B';

function shake(x, y, s = 1) {   // protein shake cup
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  poly([[-36, -120], [36, -120], [28, 0], [-28, 0]], '#E9A6C8', INK, 6); box(-42, -138, 84, 22, 8, '#FFFFFF', INK, 5);
  stroke([[8, -138], [24, -190]], '#3A8DDE', 8); label('PRO', 0, -62, 22, '#FFFFFF', 0, INK, 900);
  ctx.restore();
}
function gymBag(x, y, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  box(-110, -90, 220, 90, 34, '#2F2F36', INK, 7); stroke([[-60, -90], [-40, -140], [40, -140], [60, -90]], INK, 10);
  label('GYM', 0, -45, 34, '#FFFFFF', 0, INK, 900);
  stroke([[100, -70], [150, -40]], INK, 3); ctx.save(); ctx.translate(165, -32); ctx.rotate(0.5); box(-30, -18, 60, 36, 4, '#FFF6C9', INK, 4); label('$89', 0, 1, 18, INK, 0, INK, 900); ctx.restore();
  ctx.restore();
}
function phone(x, y, s = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); box(-30, -54, 60, 108, 10, '#222', INK, 5); box(-24, -45, 48, 86, 5, '#A9D8FF', null); ctx.restore(); }

// the front-yard scene, everyone placed
function yard(t, o = {}) {
  street({ pettyHedge: { h: 140 }, garyHedge: { h: 330 } });
  // Linda on the porch, by the door
  person(272, 1235, CAST.linda, { s: 0.5, mood: o.lindaMood || 'flat', talk: o.lindaTalk ? talk('linda', t) : 0, blink: blink(t, 0.6), look: [-0.3, 0.4] });
  gymBag(250, GROUND + 10, 0.85);
  const gx = lerp(1250, 900, eo(clamp(t / 2.4))), px = lerp(1150, 690, eo(clamp(t / 2.4)));
  stroke([[gx - 60, GROUND - 360], [px + 100, GROUND - 120]], '#C0392B', 5);   // leash
  pickles(px, GROUND + 25, 0.62, { dir: -1, t, bark: o.bark || 0 });
  person(gx, GROUND, CAST.gary, { s: 0.66, mood: 'smug', look: [-1, 0], blink: blink(t, 1.4), walk: t < 2.4 ? t * 9 : 0, arms: { L: 0.35 } });
  person(470, GROUND, CAST.dave, { s: 0.66, mood: o.daveMood || 'happy', talk: talk('dave', t), band: BAND, blink: blink(t, 0.2),
    arms: { R: 0.4, bR: 2.2, L: -0.1 }, hold: (hx, hy) => shake(hx + 4, hy + 30, 0.8) });
}
function pickClose(lt, t, fury) {   // Pickles barking, close
  blurred(12, () => { ctx.save(); ctx.translate(-300, -700); ctx.scale(1.6, 1.6); street({ noMailbox: true }); ctx.restore(); }, 'streetBlur');
  const b = Math.sin(lt * (fury ? 26 : 18)) > 0 ? 1 : 0.2;
  ctx.save(); ctx.translate(Math.sin(lt * 50) * 6 * fury, 0);
  pickles(380, 1900, 2.6, { dir: 1, bark: b, t });
  ctx.restore();
}

export function buildShots() {
  const S = [], CUES = [];
  const add = (s) => S.push(s), cue = (t, type, extra = {}) => CUES.push({ t: +t.toFixed(3), type, ...extra });
  const bark1 = 3.6, bark2 = 6.05, bark3 = 15.0;
  const C = { b1: bark1 - 0.1, c: L(1) - 0.2, b2: bark2 - 0.1, e: L(2) - 0.2, f: L(3) - 0.25, h: Le(4) + 0.2, end: Le(4) + 1.6 };

  // 1. The brag
  add({ id: 'A', at: 0, cam: [540, 1150], zoom: 0.05, note: 'Dave brags in gym gear', draw(lt, d, t) {
    ctx.translate(560, 1560); ctx.scale(1.16, 1.16); ctx.translate(-560, -1560);
    yard(t, { daveMood: 'happy' });
  } });
  cue(2.35, 'tock', { gain: 0.4 });

  // 2. Pickles barks: lie #1
  add({ id: 'B', at: C.b1, cam: [540, 1100], zoom: 0.1, note: 'Pickles barks', draw(lt, d, t) {
    pickClose(lt, t, 0.5); yap(760, 760, seg(lt, 0.08, 0.2), 0.15); yap(820, 1050, seg(lt, 0.6, 0.72), -0.1);
  } });
  cue(C.b1 - 0.02, 'whoosh', { gain: 0.6 }); cue(bark1, 'bark', { dur: 1.08 });

  // 3. "...Most days."
  add({ id: 'C', at: C.c, cam: [540, 1000], zoom: 0.07, note: 'Dave: most days', draw(lt, d, t) {
    blurred(12, () => { ctx.save(); ctx.translate(-300, -700); ctx.scale(1.6, 1.6); street({ noMailbox: true }); ctx.restore(); }, 'streetBlur');
    person(540, 2460, CAST.dave, { s: 1.35, mood: 'annoyed', talk: talk('dave', t), band: BAND, sweat: 1, look: [0.8, 0.4], arms: { R: 0.3, bR: 2.3 }, hold: (hx, hy) => shake(hx + 6, hy + 50, 1.5) });
  } });
  cue(C.c - 0.02, 'whoosh', { gain: 0.6 });

  // 4. Pickles barks harder: lie #2
  add({ id: 'D', at: C.b2, cam: [540, 1100], zoom: 0.14, note: 'Pickles barks harder', draw(lt, d, t) {
    pickClose(lt, t, 1); yap(740, 700, seg(lt, 0.05, 0.17), 0.2); yap(860, 980, seg(lt, 0.55, 0.67), -0.15); yap(700, 1230, seg(lt, 1.0, 1.12), 0.1);
  } });
  cue(C.b2 - 0.02, 'whoosh', { gain: 0.6 }); cue(bark2, 'bark', { dur: 1.62, gain: 1.15 });

  // 5. The truth: "...I drove past it." Pickles is satisfied.
  add({ id: 'E', at: C.e, cam: [540, 1000], zoom: 0.07, note: 'Dave: I drove past it', draw(lt, d, t) {
    blurred(12, () => { ctx.save(); ctx.translate(-300, -700); ctx.scale(1.6, 1.6); street({ noMailbox: true }); ctx.restore(); }, 'streetBlur');
    person(500, 2460, CAST.dave, { s: 1.35, mood: 'cry', talk: talk('dave', t), band: BAND, sweat: 1, t, arms: { R: 0.15, L: 0.15 } });
    const pin = eob(seg(t, Le(2) + 0.05, Le(2) + 0.3));
    if (pin > 0) { pickles(lerp(1300, 900, pin), 1980, 1.2, { dir: -1, t: t * 4, bark: 0 }); label('✓', 980, 1560, 120 * pin, '#2BB673', 18); }
  } });
  cue(C.e - 0.02, 'whoosh', { gain: 0.6 }); cue(Le(2) + 0.1, 'pop', { gain: 0.6 });

  // 6. Linda, sweet then deadly
  add({ id: 'F', at: C.f, cam: [540, 1000], zoom: 0.06, note: 'Linda: the gym called', draw(lt, d, t) {
    blurred(12, () => { ctx.save(); ctx.translate(-80, -500); ctx.scale(1.7, 1.7); street({ noMailbox: true }); ctx.restore(); }, 'porchBlur');
    const final = t > L(4) - 0.1;
    person(540, 2500, CAST.linda, { s: 1.4, mood: final ? 'flat' : 'happy', talk: talk('linda', t), blink: final ? 0 : blink(t, 0.4),
      arms: { R: 0.35, bR: 2.4 }, hold: (hx, hy) => phone(hx, hy - 40, 1.6) });
  } });
  cue(C.f - 0.02, 'whoosh', { gain: 0.6 }); cue(L(4) + 1.3, 'thud', { gain: 0.6 });

  // 7. Dave's face; one last bark
  add({ id: 'G', at: C.h, cam: [540, 1000], zoom: 0.1, note: 'Dave reaction', draw(lt, d, t) {
    blurred(12, () => { ctx.save(); ctx.translate(-300, -700); ctx.scale(1.6, 1.6); street({ noMailbox: true }); ctx.restore(); }, 'streetBlur');
    person(540, 2460, CAST.dave, { s: 1.4, mood: 'shock', band: BAND, sweat: 1, t, arms: { L: 0.15, R: 0.15 } });
    label('!', 190, 380, 170, P.red, 18); label('!', 880, 340, 170, P.red, 18);
    const pin = eob(seg(t, bark3 - 0.25, bark3));
    if (pin > 0) { pickles(lerp(1300, 900, pin), 1990, 1.2, { dir: -1, t, bark: t > bark3 && t < bark3 + 0.35 ? 1 : 0.2 }); yap(760, 1180, seg(t, bark3, bark3 + 0.12), -0.15); }
  } });
  cue(C.h - 0.02, 'whoosh'); cue(bark3, 'bark', { dur: 0.36 });

  add({ id: 'H', at: C.end, cam: [540, 960], zoom: 0, note: 'Follow Plotbulb', draw(lt) { endCard(lt); } });
  cue(C.end + 0.05, 'pop'); cue(C.end + 0.2, 'sparkle', { gain: 0.6 });
  return { shots: S, cues: CUES };
}
