// THE HEDGE: Dave vs Gary. Shots on the voice clock (data/lines.json).
import { ctx, W, H, clamp, lerp, seg, eo, eio, eob } from './core/lib.js';
import { L, Le, Wd, T } from './core/timing.js';
import { CAST, P, INK, person, head, pickles, yap, street, GROUND, hedgeBlob, mailbox, livingRoom, bigWindow,
  megaGrow, shears, lemonade, lawnChair, endCard, blurred, tint, stroke, disc, label, box, poly } from './pb.js';

const ENV = await (await fetch('data/env.json', { cache: 'no-store' })).json();
const SPEAK = { dave: [0, 1, 3], gary: [2, 6], linda: [4, 5] };
const talk = (who, t) => SPEAK[who].some((i) => t >= L(i) - 0.03 && t <= Le(i) + 0.03) ? (ENV[Math.floor(t * 30)] || 0) : 0;
const blink = (t, seed) => ((t + seed) % 3.3) < 0.11 ? 1 : 0;

export function buildShots() {
  const S = [], CUES = [];
  const add = (s) => S.push(s), cue = (t, type, extra = {}) => CUES.push({ t: +t.toFixed(3), type, ...extra });
  const cut = { night: 6.55, room: 9.65, roomClose: 11.0, giant: 13.65, react: 15.7, end: 17.15 };

  // 1. Day street: Dave complains, Gary trims his taller hedge
  add({ id: 'A', at: 0, cam: [540, 1150], zoom: 0.05, note: 'street: Dave vs Gary hedges', draw(lt, d, t) {
    ctx.translate(560, 1560); ctx.scale(1.16, 1.16); ctx.translate(-560, -1560);
    street({ pettyHedge: { h: 140 }, garyHedge: { h: 330 } });
    const snip = Math.max(0, Math.sin(t * 13));
    pickles(640, GROUND + 25, 0.62, { dir: -1, t });
    person(270, GROUND, CAST.dave, { s: 0.66, mood: 'angry', talk: talk('dave', t), look: [1, 0], blink: blink(t, 0.4),
      arms: { R: t > Wd('Your', 1) - 0.2 ? 1.45 : 0.2, bR: 0 } });
    person(820, GROUND, CAST.gary, { s: 0.66, mood: 'smug', look: [-1, 0], blink: blink(t, 1.7),
      arms: { R: 0.95, bR: -0.5 }, hold: (hx, hy) => shears(hx, hy, 0.75, snip, 0.5) });
  } });
  for (let t = 0.4; t < 3.2; t += 0.48) cue(t, 'tock', { gain: 0.45 });

  // 2. Gary close-up: "Some of us have patience, Dave."
  add({ id: 'B', at: L(2) - 0.3, cam: [540, 1000], zoom: 0.05, note: 'Gary close, smug', draw(lt, d, t) {
    blurred(14, () => { ctx.save(); ctx.translate(-200, -250); ctx.scale(1.4, 1.4); street({ pettyHedge: { h: 140 }, garyHedge: { h: 330 }, noMailbox: true }); ctx.restore(); });
    person(540, 2420, CAST.gary, { s: 1.3, mood: 'smug', talk: talk('gary', t), look: t > Wd('Dave', 2) - 0.1 ? [-0.6, 0] : [0, 0], blink: blink(t, 0.9),
      arms: { R: 0.1, bR: 2.6 }, hold: (hx, hy) => shears(hx + 10, hy + 40, 1.1, 0, 0.2) });
  } });
  cue(L(2) - 0.32, 'whoosh');

  // 3. Night: Dave and the MEGA GROW
  const pourAt = Le(3) + 0.05;
  add({ id: 'C', at: cut.night, cam: [540, 1000], zoom: 0.04, note: 'night: Dave whispers, pours MEGA GROW', draw(lt, d, t) {
    blurred(5, () => { ctx.save(); ctx.translate(-160, -300); ctx.scale(1.3, 1.3); street({ night: true, noPettyHedge: true, noMailbox: true }); ctx.restore(); });
    tint('#0B1430', 0.22);
    const p = eio(seg(t, pourAt, pourAt + 0.35));
    const look = t < L(3) ? [Math.sin(lt * 9) > 0 ? -1 : 1, 0] : [0.4, 0.3];
    person(380, 2150, CAST.dave, { s: 1.05, mood: 'sneaky', talk: talk('dave', t), look, blink: 0,
      arms: { R: lerp(0.55, 1.15, p), bR: lerp(2.3, 1.6, p), L: 0.12 },
      hold: (hx, hy) => {
        const rot = lerp(0.15, 2.3, p), bx = hx + 40 * Math.sin(rot), by = hy - 40 * Math.cos(rot); megaGrow(bx, by, 0.8, rot);
        if (p > 0.95) {   // the stream of plant food
          const mx = bx + 200 * Math.sin(rot), my = by - 200 * Math.cos(rot), k = seg(t, pourAt + 0.35, pourAt + 0.55);
          stroke([[mx, my], [mx + 10, lerp(my, 1760, k)]], '#7FE04A', 26);
        }
      } });
    const g = seg(t, pourAt + 0.55, pourAt + 1.2);
    hedgeBlob(-60, 2000, 1200, 300 + 80 * eo(g), 5, { wiggle: g > 0 && g < 1 ? g : 0, col: '#2F7A33' });
    if (g > 0) for (let i = 0; i < 6; i++) { const a = (i / 6) * 6.28 + t * 3; label('✦', 600 + Math.cos(a) * 340, 1720 + Math.sin(a) * 90, 60, '#B8FF7A'); }
  } });
  cue(cut.night - 0.02, 'whoosh'); cue(pourAt + 0.3, 'bubbles', { dur: 0.8, gain: 0.8 }); cue(pourAt + 0.6, 'sparkle', { gain: 0.8 });

  // 4. Morning, living room: Linda opens the curtains on a wall of leaves
  const openAt = cut.room + 0.15;
  const room = (t, lindaOn) => {
    const o = eio(seg(t, openAt, openAt + 0.35));
    livingRoom({ t, couchX: 260, kevinX: 900, kevinY: 1080, photoX: 190, photoY: 520 });
    bigWindow(470, 330, 500, 620, o, 'leaves', t);
    tint('#0E2410', 0.22 + 0.13 * o);
    return o;
  };
  add({ id: 'D', at: cut.room, cam: [540, 1000], zoom: 0.03, note: 'Linda opens curtains: leaves', draw(lt, d, t) {
    const o = room(t, true);
    const turned = t > L(4) - 0.15;
    person(360, 2050, CAST.linda, { s: 1.05, mood: turned ? 'flat' : 'calm', talk: talk('linda', t), blink: blink(t, 0.2),
      look: turned ? [0, 0] : [1, -0.4], arms: { R: turned ? 0.1 : lerp(1.6, 1.25, o), bR: 0 } });
  } });
  cue(cut.room - 0.02, 'whoosh'); cue(openAt, 'slide', { dur: 0.5, gain: 0.8 });
  add({ id: 'E', at: cut.roomClose, cam: [540, 1000], zoom: 0.06, note: 'Linda close: why is it dark', draw(lt, d, t) {
    blurred(12, () => { ctx.save(); ctx.translate(-120, -60); ctx.scale(1.25, 1.25); room(cut.roomClose + 1, false); ctx.restore(); }, 'roomE');
    person(540, 2500, CAST.linda, { s: 1.4, mood: 'flat', talk: talk('linda', t), blink: blink(t, 0.5) });
  } });
  cue(cut.roomClose - 0.02, 'whoosh', { gain: 0.6 });

  // 5. The reveal: a giant hedge, a squashed mailbox, Gary sunbathing in the shade
  add({ id: 'F', at: cut.giant, cam: [540, 1000], zoom: 0.03, note: 'giant hedge reveal, Gary in shade', draw(lt, d, t) {
    const pan = lerp(900, 0, eio(seg(lt, 0.0, 0.8)));
    ctx.fillStyle = P.sky; ctx.fillRect(-300, -300, W + 600, H + 600);
    ctx.save(); ctx.translate(0, pan);
    street({ noPettyHedge: true, mailSquash: 1, garyHedge: { h: 330 } });
    // shade from the giant hedge
    hedgeBlob(-60, 1450, 400, 1500, 9, { lw: 9 });
    ctx.save(); ctx.globalAlpha = 0.25; ctx.beginPath(); ctx.ellipse(700, 1650, 420, 90, 0, 0, 6.29); ctx.fillStyle = '#0F2A12'; ctx.fill(); ctx.restore();
    mailbox(430, 1480, 0.9, 1);
    lawnChair(760, 1660, 0.75);
    person(690, 1660, CAST.gary, { s: 0.62, sit: true, seatY: 1490, dir: 1, mood: 'smug', shades: true, talk: talk('gary', t),
      arms: { R: 0.5, bR: 1.9, L: 0.3 }, hold: (hx, hy) => lemonade(hx + 6, hy + 30, 0.9) });
    pickles(1000, 1700, 0.55, { dir: -1, t });
    ctx.restore();
  } });
  cue(cut.giant - 0.02, 'whoosh'); cue(cut.giant + 0.75, 'boing', { gain: 0.6 });

  // 6. Dave's reaction, Pickles yaps
  add({ id: 'G', at: cut.react, cam: [540, 1000], zoom: 0.07, note: 'Dave reaction, Pickles yaps', draw(lt, d, t) {
    blurred(14, () => { ctx.fillStyle = P.sky; ctx.fillRect(-300, -300, W + 600, H + 600); hedgeBlob(-200, 2400, 1500, 2300, 4); });
    const crying = lt > 0.45;
    person(520, 2520, CAST.dave, { s: 1.4, mood: crying ? 'cry' : 'shock', sweat: 1, t, arms: { L: 0.15, R: 0.15 } });
    if (!crying) { label('!', 200, 360, 170, P.red, 18); label('!', 860, 330, 170, P.red, 18); }
    const pin = eob(seg(lt, 0.2, 0.45));
    pickles(lerp(1250, 900, pin), 1990, 1.25, { dir: -1, bark: (Math.sin(lt * 18) > 0 ? 1 : 0.2), t });
    yap(720, 1180, seg(lt, 0.3, 0.42), -0.15); yap(870, 960, seg(lt, 0.75, 0.87), 0.12);
  } });
  cue(cut.react - 0.02, 'whoosh'); cue(cut.react + 0.32, 'yap'); cue(cut.react + 0.77, 'yap');

  // 7. End card
  add({ id: 'H', at: cut.end, cam: [540, 960], zoom: 0, note: 'Follow Plotbulb', draw(lt) { endCard(lt); } });
  cue(cut.end + 0.05, 'pop'); cue(cut.end + 0.2, 'sparkle', { gain: 0.6 });
  return { shots: S, cues: CUES };
}
