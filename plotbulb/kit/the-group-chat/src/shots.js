// THE GROUP CHAT: Dave insults Bev's lasagna in the family group chat; Linda "fixes" it.
import { ctx, W, H, clamp, lerp, seg, eo, eio, eob } from './core/lib.js';
import { L, Le, Wd, T } from './core/timing.js';
import { pettysCard } from './pb2.js';
import { CAST, P, INK, person, head, livingRoom, bigWindow, endCard, blurred, tint, stroke, disc, label, box, poly } from './pb.js';

const ENV = await (await fetch('data/env.json', { cache: 'no-store' })).json();
const SPEAK = { dave: [0, 1, 2, 5], linda: [3, 4, 6] };
const talk = (who, t) => SPEAK[who].some((i) => t >= L(i) - 0.03 && t <= Le(i) + 0.03) ? (ENV[Math.floor(t * 30)] || 0) : 0;
const blink = (t, seed) => ((t + seed) % 3.3) < 0.11 ? 1 : 0;
const EMO = '"Noto Color Emoji"';

// ---------- room with Dave on the couch ----------
function room(t) { livingRoom({ t, couchX: 330, kevinX: 900, kevinY: 1080, photoX: 820, photoY: 470 }); bigWindow(80, 300, 360, 520, 1, 'sky', t); }
function couchFront(cx = 330) {
  box(cx - 300, 1110, 80, 190, 24, P.couchDark, INK, 8); box(cx + 220, 1110, 80, 190, 24, P.couchDark, INK, 8);
  box(cx - 230, 1170, 460, 110, 18, P.couchDark, INK, 8);
}
function smallPhone(x, y, s = 1, glow = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  box(-34, -60, 68, 120, 12, '#222', INK, 5); box(-27, -50, 54, 96, 6, `rgba(170,220,255,${0.6 + 0.4 * glow})`, null);
  ctx.restore();
}
function daveOnCouch(t, o = {}) {
  for (const fx of [270, 390]) { stroke([[fx, 1270], [fx, 1335]], INK, 40); ctx.beginPath(); ctx.ellipse(fx + 10, 1340, 42, 17, 0, 0, 6.29); ctx.fillStyle = INK; ctx.fill(); }
  ctx.save(); ctx.beginPath(); ctx.rect(-400, -400, W + 800, 1600); ctx.clip();
  person(330, 1560, CAST.dave, { s: 0.78, mood: o.mood, talk: talk('dave', t), look: o.look || [0, 0.5], blink: blink(t, 0.3), sweat: o.sweat,
    arms: { L: -0.35, bL: -0.9, R: -0.35, bR: -0.9 }, hold: o.phone === false ? null : (hx, hy) => smallPhone(hx - 40, hy - 20, 1.2) });
  ctx.restore();
  couchFront(330);
}

// ---------- phone close-up UI ----------
function chatPhone(lt, o) {
  ctx.fillStyle = '#2A2F3A'; ctx.fillRect(-300, -300, W + 600, H + 600);
  const shake = o.shake ? Math.sin(lt * 70) * 10 * o.shake : 0;
  ctx.save(); ctx.translate(shake, 0);
  box(110, 120, 860, 1700, 90, '#111', INK, 10); box(140, 150, 800, 1640, 64, '#EDE5DA', null);
  box(140, 150, 800, 190, [64, 64, 0, 0], o.family ? '#E9688C' : '#3A8DDE', null);
  disc(240, 250, 50, '#FFFFFF', INK, 5);
  ctx.font = `40px ${EMO}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(o.family ? '👨‍👩‍👧' : '😘', 240, 252);
  ctx.font = `900 54px Inter, ${EMO}`; ctx.textAlign = 'left'; ctx.fillStyle = '#FFFFFF'; ctx.fillText(o.family ? 'FAMILY ❤️' : 'Linda ❤️', 320, 228);
  ctx.font = '800 34px Inter'; ctx.fillStyle = o.family ? '#FFE6EE' : '#DCEBFA'; ctx.fillText(o.family ? '23 members' : 'online', 322, 290);
  // bubbles (right = Dave, left = others)
  let y = 420;
  for (const b of o.bubbles) {
    if (b.k <= 0) continue;
    const sc = eob(clamp(b.k)); ctx.font = `800 44px Inter, ${EMO}`;
    const lines = b.lines, w = Math.max(...lines.map((l) => ctx.measureText(l).width)) + 70, h = 66 * lines.length + 40, top = b.who ? 46 : 0;
    const x = b.me ? 910 - w : 170;
    ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.scale(sc, sc); ctx.translate(-(x + w / 2), -(y + h / 2));
    box(x, y, w, h + top, 34, b.me ? '#D3F6B4' : '#FFFFFF', INK, 5);
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    if (b.who) { ctx.font = '800 32px Inter'; ctx.fillStyle = '#9A3F6A'; ctx.fillText(b.who, x + 35, y + 40); }
    ctx.font = `800 44px Inter, ${EMO}`; ctx.fillStyle = INK;
    lines.forEach((l, i) => ctx.fillText(l, x + 35, y + top + 52 + i * 66));
    if (b.seen) { ctx.font = '800 32px Inter'; ctx.fillStyle = '#2F78C2'; ctx.textAlign = 'right'; ctx.fillText(b.seen, x + w - 20, y + h + top + 34); }
    ctx.restore();
    y += h + top + (b.seen ? 80 : 40);
  }
  // input bar with typed text + send button
  box(160, 1640, 620, 110, 55, '#FFFFFF', INK, 5);
  if (o.typed) { ctx.font = `800 40px Inter, ${EMO}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = INK; ctx.fillText(o.typed, 200, 1697); }
  const press = o.press || 0;
  disc(860, 1695, 62 * (1 - 0.15 * press), press > 0.5 ? '#1F9D55' : '#2BB673', INK, 5);
  label('➤', 864, 1697, 54, '#FFFFFF', 0, INK, 900);
  if (press > 0.5) { disc(880, 1740, 46, '#F1C7A8', INK, 5); }   // thumb
  ctx.restore();
}
const MSG = ["Your mom's lasagna", 'tastes like wet', 'cardboard 🤢'];

export function buildShots() {
  const S = [], CUES = [];
  const add = (s) => S.push(s), cue = (t, type, extra = {}) => CUES.push({ t: +t.toFixed(3), type, ...extra });
  const C = { phone: 2.95, panic: L(2) + 0.55, linda: L(3) - 0.25, beg: L(5) - 0.12, lindaClose: L(6) - 0.2, two: Wd('and', 6) - 0.1,
    sting: Le(6) + 0.2, react: Le(6) + 1.45, end: Le(6) + 2.65 };

  // 1. Dave on the couch, typing with an evil grin
  add({ id: 'A', at: 0, cam: [330, 1050], zoom: 0.08, note: 'Dave types on the couch', draw(lt, d, t) {
    room(t); daveOnCouch(t, { mood: 'sneaky' });
    const n = Math.floor(clamp(seg(t, L(0), Le(0))) * MSG.join(' ').length);
    if (n > 0) {
      box(560, 330, 480, 250, 30, '#FFFFFF', INK, 6); poly([[610, 575], [540, 690], [680, 578]], '#FFFFFF', INK, 6); box(606, 568, 78, 16, 0, '#FFFFFF', null);
      let rest = n; ctx.font = `800 40px Inter, ${EMO}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = INK;
      MSG.forEach((m, i) => { const s = m.slice(0, Math.max(0, rest)); rest -= m.length + 1; ctx.fillText(s, 595, 395 + i * 64); });
    }
  } });
  for (let t = 0.5; t < 2.8; t += 0.22) cue(t, 'tock', { gain: 0.25 });

  // 2. Phone close-up: send → it's the FAMILY chat → reactions pile in
  const sendT = L(1) + 0.08;
  add({ id: 'B', at: C.phone, cam: [540, 960], zoom: 0.04, note: 'phone: sent to FAMILY chat', draw(lt, d, t) {
    const sent = t > sendT, fam = t > sendT + 0.3;
    const k = (a) => seg(t, a, a + 0.18);
    chatPhone(lt, { family: fam, typed: sent ? '' : "Your mom's lasagna tast…", press: t > sendT - 0.2 && t < sendT + 0.15 ? 1 : 0,
      shake: fam && t < sendT + 1.6 ? 0.5 : 0, bubbles: [
        { me: true, lines: MSG, k: k(sendT), seen: t > sendT + 1.05 ? 'Seen by Mom ✓✓' : '' },
        { who: 'Aunt Carol', lines: ['😳😳😳'], k: k(sendT + 0.3) },
        { who: 'Uncle Ron', lines: ['💀💀 bro'], k: k(sendT + 0.55) },
        { who: 'Cousin Jen', lines: ['she made that for', 'your birthday 😭'], k: k(sendT + 0.8) },
      ] });
    if (fam) { const p = 0.5 + 0.5 * Math.sin(lt * 14); ctx.save(); ctx.globalAlpha = 0.3 * p; box(140, 150, 800, 190, [64, 64, 0, 0], '#FFFFFF', null); ctx.restore(); }
  } });
  cue(C.phone - 0.02, 'whoosh'); cue(sendT, 'pop'); cue(sendT + 0.3, 'plop'); cue(sendT + 0.55, 'plop'); cue(sendT + 0.8, 'plop'); cue(sendT + 1.05, 'tock', { gain: 0.7 });

  // 3. Dave panics
  add({ id: 'C', at: C.panic, cam: [540, 1000], zoom: 0.08, note: 'Dave panics', draw(lt, d, t) {
    blurred(14, () => room(0), 'roomBlur');
    ctx.save(); ctx.translate(Math.sin(t * 60) * 6, 0);
    person(540, 2460, CAST.dave, { s: 1.35, mood: 'shock', talk: talk('dave', t), sweat: 1, arms: { L: 0.5, bL: 2.4, R: 0.5, bR: 2.4 } });
    ctx.restore();
    label('!', 190, 380, 170, P.red, 18); label('!', 880, 340, 170, P.red, 18);
  } });
  cue(C.panic - 0.02, 'whoosh');

  // 4. Linda walks in, calm, reading her phone
  add({ id: 'D', at: C.linda, cam: [540, 1100], zoom: 0.04, note: 'Linda: Mom read it', draw(lt, d, t) {
    room(t); daveOnCouch(t, { mood: 'shock', sweat: 1, look: [1, 0] });
    const x = lerp(1250, 800, eo(seg(lt, 0, 0.5)));
    person(x, 1640, CAST.linda, { s: 0.82, mood: 'flat', talk: talk('linda', t), blink: blink(t, 0.7), walk: lt < 0.5 ? lt * 14 : 0, look: [-1, 0.3],
      arms: { L: 0.5, bL: 1.6 }, holdL: (hx, hy) => smallPhone(hx + 20, hy - 10, 1.1) });
  } });
  cue(C.linda - 0.02, 'whoosh', { gain: 0.6 });

  // 5. Dave begs
  add({ id: 'E', at: C.beg, cam: [540, 1000], zoom: 0.07, note: 'Dave begs', draw(lt, d, t) {
    blurred(14, () => room(0), 'roomBlur');
    person(540, 2460, CAST.dave, { s: 1.35, mood: 'cry', talk: talk('dave', t), sweat: 1, t, arms: { L: 0.55, bL: 2.0, R: 0.55, bR: 2.0 } });
  } });
  cue(C.beg - 0.02, 'whoosh', { gain: 0.6 });

  // 6. Linda close: sweet
  add({ id: 'F', at: C.lindaClose, cam: [540, 1000], zoom: 0.05, note: 'Linda: already fixed', draw(lt, d, t) {
    blurred(14, () => room(0), 'roomBlur');
    person(540, 2500, CAST.linda, { s: 1.4, mood: 'happy', talk: talk('linda', t) });
  } });
  cue(C.lindaClose - 0.02, 'whoosh', { gain: 0.6 });

  // 7. Two-shot: the twist lands, Dave freezes
  add({ id: 'G', at: C.two, cam: [560, 1150], zoom: 0.06, note: 'twist: stay for a month', draw(lt, d, t) {
    room(t); daveOnCouch(t, { mood: t > Wd('month', 6) ? 'shock' : 'annoyed', sweat: 1, look: [1, 0], phone: false });
    person(800, 1640, CAST.linda, { s: 0.82, mood: 'smug', talk: talk('linda', t), look: [-1, 0.3], blink: blink(t, 1.1),
      arms: { L: 0.5, bL: 1.6 }, holdL: (hx, hy) => smallPhone(hx + 20, hy - 10, 1.1) });
  } });
  cue(C.two - 0.02, 'whoosh', { gain: 0.5 }); cue(Wd('month', 6) + 0.3, 'thud', { gain: 0.7 });

  // 8. The sting: Mom replies
  add({ id: 'H', at: C.sting, cam: [540, 960], zoom: 0.05, note: 'Mom: bringing lasagna', draw(lt, d, t) {
    chatPhone(lt, { family: true, bubbles: [
      { who: 'Linda', lines: ['Mom, he was joking 😘', 'He wants you to stay', 'with us for a MONTH ❤️'], k: 1 },
      { who: 'Mom', lines: ['Bringing lasagna 😊🧳'], k: seg(lt, 0.3, 0.48) },
    ] });
  } });
  cue(C.sting - 0.02, 'whoosh'); cue(C.sting + 0.3, 'pop');

  // 9. Dave's face
  add({ id: 'I', at: C.react, cam: [540, 1000], zoom: 0.1, note: 'Dave reaction', draw(lt, d, t) {
    blurred(14, () => room(0), 'roomBlur');
    person(540, 2460, CAST.dave, { s: 1.4, mood: 'cry', sweat: 1, t, arms: { L: 0.15, R: 0.15 } });
  } });
  cue(C.react - 0.02, 'whoosh');

  add({ id: 'J', at: C.end, cam: [540, 960], zoom: 0, note: 'The Pettys card', draw(lt, d, t) { pettysCard(lt, t); } });
  cue(C.end, 'sting'); cue(C.end + 0.05, 'pop', { gain: 0.4 }); cue(C.end + 0.12, 'pop', { gain: 0.4 }); cue(C.end + 0.19, 'pop', { gain: 0.4 }); cue(C.end + 0.45, 'bark', { dur: 0.36, gain: 0.7 });
  return { shots: S, cues: CUES };
}
