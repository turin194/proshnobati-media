// THE APPLE: Dave takes every instruction literally... then uses his head.
import { ctx, W, H, clamp, lerp, seg, eo, eio, eob, TAU } from './core/lib.js';
import { L, Le, Wd, T } from './core/timing.js';
import { CAST, P, INK, person, pettysCard, blurred, stroke, disc, oval, label, box, poly } from './pb.js';

const img = async (f) => { const i = new Image(); i.src = 'sets/' + f + '.png'; await i.decode(); return i; };
const KIT = await img('kitchen_A_wide');
const ENV = await (await fetch('data/env.json', { cache: 'no-store' })).json();
const SPEAK = { linda: [0, 1, 2, 4], dave: [3, 5] };
const talk = (who, t) => SPEAK[who].some((i) => t >= L(i) - 0.03 && t <= Le(i) + 0.03) ? (ENV[Math.floor(t * 30)] || 0) : 0;
const blink = (t, seed) => ((t + seed) % 3.3) < 0.11 ? 1 : 0;

// ---------- props ----------
function apple(x, y, s = 1, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const sp = o.split || 0;
  if (sp > 0) {
    for (const sd of [-1, 1]) {
      ctx.save(); ctx.translate(sd * 70 * sp, -30 * Math.sin(sp * Math.PI) ); ctx.rotate(sd * 0.5 * sp);
      ctx.beginPath(); ctx.arc(0, 0, 46, sd < 0 ? Math.PI / 2 : -Math.PI / 2, sd < 0 ? Math.PI * 1.5 : Math.PI / 2); ctx.closePath();
      ctx.fillStyle = '#D93A30'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.stroke();
      ctx.beginPath(); ctx.ellipse(sd * -4, 0, 30, 38, 0, sd < 0 ? Math.PI / 2 : -Math.PI / 2, sd < 0 ? Math.PI * 1.5 : Math.PI / 2); ctx.fillStyle = '#F7EBC8'; ctx.fill();
      disc(sd * -12, -4, 4, '#4A2E1A', null);
      ctx.restore();
    }
    ctx.restore(); return;
  }
  ctx.beginPath(); ctx.moveTo(0, -36);
  ctx.bezierCurveTo(30, -60, 62, -30, 50, 8); ctx.bezierCurveTo(42, 40, 18, 48, 0, 40);
  ctx.bezierCurveTo(-18, 48, -42, 40, -50, 8); ctx.bezierCurveTo(-62, -30, -30, -60, 0, -36); ctx.closePath();
  ctx.fillStyle = '#D93A30'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.stroke();
  if (o.bite) { ctx.save(); ctx.globalCompositeOperation = 'source-atop'; disc(46, -16, 24, '#F7EBC8', null); ctx.restore(); disc(54, -16, 22, '#FFFFFF00', null); }
  ctx.save(); ctx.globalAlpha = 0.5; oval(-22, -18, 10, 16, '#FFFFFF', null, 0, -0.4); ctx.restore();
  stroke([[0, -36], [4, -60]], '#5A3A22', 7);
  ctx.beginPath(); ctx.ellipse(20, -58, 18, 9, -0.4, 0, TAU); ctx.fillStyle = '#5DB548'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.stroke();
  ctx.restore();
}
function halfApple(x, y, s = 1, bite = false) {   // a half held up, cut face toward camera
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  disc(0, 0, 46, '#D93A30', INK, 6); oval(0, 0, 36, 38, '#F7EBC8', null); disc(-8, -4, 4, '#4A2E1A', null); disc(8, -4, 4, '#4A2E1A', null);
  if (bite) { ctx.save(); ctx.beginPath(); ctx.arc(0, 0, 49, 0, TAU); ctx.clip(); for (const [bx, by] of [[34, -34], [46, -10], [40, 14]]) disc(bx, by, 18, '#9FC2D9', null); ctx.restore(); }
  ctx.restore();
}
function knife(x, y, s = 1, rot = 0) {   // (x, y) = grip
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  box(-12, -10, 24, 70, 8, '#6B4A2E', INK, 5);
  ctx.beginPath(); ctx.moveTo(-12, -10); ctx.lineTo(-12, -150); ctx.quadraticCurveTo(14, -150, 14, -110); ctx.lineTo(12, -10); ctx.closePath();
  ctx.fillStyle = '#D9DEE6'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.stroke();
  ctx.restore();
}
function board(x, y, s = 1, rot = 0, flat = false) {   // cutting board, (x, y) = centre
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  if (flat) { box(-140, -18, 280, 36, 14, '#D8A867', INK, 6); stroke([[-120, -6], [120, -6]], '#C4924F', 4); }
  else { box(-120, -80, 240, 160, 22, '#D8A867', INK, 7); disc(88, -48, 14, '#B98B4E', INK, 4); stroke([[-90, 20], [60, 20]], '#C4924F', 4); stroke([[-90, 44], [30, 44]], '#C4924F', 4); }
  ctx.restore();
}
function spoon(x, y, s = 1, rot = 0) {   // giant wooden spoon, (x, y) = grip
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  box(-12, -40, 24, 260, 10, '#B9844C', INK, 6);
  oval(0, -120, 62, 86, '#C99558', INK, 7); oval(0, -122, 42, 60, '#B07D45', null);
  ctx.restore();
}
function plate(x, y, s = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); oval(0, 0, 70, 70, '#F4F7FA', INK, 6); oval(0, 0, 44, 44, null, '#C9D3DD', 4); ctx.restore(); }
function sponge(x, y, s = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); box(-34, -20, 68, 40, 8, '#F2D14B', INK, 5); box(-34, 6, 68, 14, 4, '#5DB548', null); ctx.restore(); }
function stars(x, y, t, n = 4) { for (let i = 0; i < n; i++) { const a = t * 5 + (i / n) * TAU; label('★', x + Math.cos(a) * 150, y + Math.sin(a) * 40, 54, P.yellow, 10); } }
function fridgeNote(x, y, w, h, lines, rot = -0.05) {
  ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.rotate(rot);
  box(-w / 2, -h / 2, w, h, 2, '#F2E27A', INK, 3); box(-w / 2, -h / 2, w, h * 0.14, 0, '#E6D35E', null);
  lines.forEach((l, i) => { ctx.font = `800 ${h * 0.15}px Inter`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = INK; ctx.fillText(l, -w / 2 + 20, -h / 2 + h * 0.36 + i * h * 0.22); });
  ctx.restore();
}

// ---------- sets ----------
function kitchenWide() { ctx.drawImage(KIT, 0, 0); fridgeNote(78, 1008, 196, 196, ['Dave.', 'Knives are', 'sharp. —L']); }
const tableFront = () => ctx.drawImage(KIT, 226, 1392, 630, 290, 226, 1392, 630, 290);
// two-shot at the table: the kitchen pushed in 2x around the table
const Z = 2, CX = 540, CY = 1252;
function tableShot(front = false) {
  ctx.save(); ctx.translate(540, 960); ctx.scale(Z, Z); ctx.translate(-CX, -CY);
  if (front) ctx.drawImage(KIT, 226, 1392, 630, 290, 226, 1392, 630, 290); else ctx.drawImage(KIT, 0, 0);
  ctx.restore();
}
const TOP = 1250, FEET = 1594;                       // table top and hidden feet line in the two-shot
const loc = (x, y, px, s = 1, feet = FEET) => [(x - px) / s, (y - feet) / s];

export function buildShots() {
  const S = [], CUES = [];
  const add = (s) => S.push(s), cue = (t, type, extra = {}) => CUES.push({ t: +t.toFixed(3), type, ...extra });
  const DX = 330, LXo = 840;                         // Dave / Linda x in the two-shot
  const T1 = 1.7, sawA = 4.45, sawB = 5.7, T3 = Le(1) + 0.05, T4 = 9.55, chopL = 10.9, chopD = 12.55, CL = L(4) - 0.2, HB = Le(4) + 0.15, hit = HB + 0.5, C2 = L(5) - 0.15, CH = Le(5) + 0.2, C3 = CH + 2.2, CARD = 22.3;

  // 1. Wide: Linda at the sink, Dave walks in with an apple
  add({ id: 'A', at: 0, cam: [540, 1150], zoom: 0.04, note: 'wide kitchen, Dave walks in', draw(lt, d, t) {
    kitchenWide();
    person(760, 1385, CAST.linda, { s: 0.6, t, mood: 'calm', look: [1, 0.3], hands: { L: [-50, -560], R: [60 + Math.sin(t * 9) * 25, -560] }, holdL: (hx, hy) => plate(hx + 20, hy, 0.5), hold: (hx, hy) => sponge(hx, hy, 0.5) });
    const k = clamp(t / 1.3), x = lerp(-150, 420, eo(k));
    person(x, 1430, CAST.dave, { s: 0.62, t, mood: 'happy', walk: k < 1 ? t * 9 : 0, hands: { L: [-150, -330], R: [190, -560] }, hold: (hx, hy) => apple(hx, hy - 20, 0.55) });
    tableFront();
  } });
  for (let t = 0.15; t < 1.3; t += 0.32) cue(t, 'tock', { gain: 0.3 });

  // 2. The two-shot at the table (most of the episode)
  add({ id: 'B', at: T1, cam: [540, 960], zoom: 0.03, note: 'two-shot: knife, board saw, board slide, Linda demo, Dave chop', draw(lt, d, t) {
    tableShot(false);
    // ---- Linda (at the counter on the right, then leans in to demonstrate)
    const lx = lerp(LXo, 770, eio(seg(t, T4, T4 + 0.5))) + (t > chopL + 0.9 ? lerp(0, 190, eio(seg(t, chopL + 0.9, chopL + 1.4))) : 0);
    const BX = DX + 200 * eio(seg(t, T4, T4 + 0.5)) - 200 * eio(seg(t, chopL + 0.9, chopL + 1.4)); // Linda pulls the board over, then pushes it back
    const turned = t > L(1) - 0.15, demo = t > T4 + 0.3 && t < chopL + 1.0;
    let lh, lhold = null, lholdL = null;
    if (!turned) { lh = { L: [-50, -560], R: [60 + Math.sin(t * 9) * 25, -560] }; lholdL = (hx, hy) => plate(hx + 20, hy, 0.85); lhold = (hx, hy) => sponge(hx, hy, 0.85); }
    else if (demo) { const up = seg(t, chopL - 0.45, chopL - 0.1), dn = seg(t, chopL - 0.05, chopL + 0.05); const tg = loc(BX + 10, TOP - 130, lx); lh = { L: [lerp(-200, tg[0], eio(dn)), lerp(lerp(-560, -820, eo(up)), tg[1], eio(dn))], R: [150, -330] }; }
    else lh = { L: [-150, -330], R: [128, -392] };
    person(lx, FEET, CAST.linda, { s: 1, t, mood: !turned ? 'calm' : t < T3 + 0.4 ? 'shock' : 'annoyed', talk: talk('linda', t), blink: blink(t, 0.6),
      look: turned ? [-1, 0.3] : [1, 0.2], hands: lh, hold: lhold, holdL: lholdL });
    // ---- Dave
    let dh, dhold = null, dholdL = null, dmood = 'happy', dsweat = 0;
    const appleOnTable = [DX, TOP - 44];
    let ap = appleOnTable, boardDraw = null;
    if (t < sawA) {                                            // places the apple, raises the knife
      const put = eio(seg(t, T1, T1 + 0.4));
      ap = [lerp(DX - 140, DX, put), lerp(TOP - 260, TOP - 44, put)];
      dh = { L: loc(ap[0] - 40, ap[1], DX), R: [170, -800] }; dhold = (hx, hy) => knife(hx, hy, 1.4, 0.2);
    } else if (t < T3) {                                       // saws the apple with the board
      const sw = Math.sin(t * 16) * 40, bx = DX + sw, by = TOP - 44 - 80 - 60;
      dh = { L: loc(bx - 110, by + 10, DX), R: loc(bx + 110, by + 10, DX) }; dmood = 'happy';
      boardDraw = () => board(bx, by, 1, 0);
    } else if (t < T4 + 0.3) {                                 // board on its edge, slides the apple along the top
      const bx = DX - 20, by = TOP - 80, k = (Math.sin((t - T3) * 4) + 1) / 2;
      ap = [lerp(bx - 100, bx + 100, k), by - 80 - 54];
      dh = { L: loc(bx - 120, by - 20, DX), R: loc(ap[0] + 30, ap[1] + 10, DX) }; dmood = 'happy';
      boardDraw = () => board(bx, by, 1, 0);
    } else if (t < chopD + 0.05) {                             // board flat with the apple on it; Dave watches, then copies the chop
      const up = seg(t, chopD - 0.45, chopD - 0.1), dn = seg(t, chopD - 0.05, chopD + 0.05);
      const hy = t > chopL + 0.9 ? lerp(lerp(-330, -820, eo(up)), -400, eio(dn)) : -330;
      dh = { L: [-150, -330], R: [t > chopL + 0.9 ? lerp(150, 40, dn) : 150, hy] }; dmood = t > chopL + 0.9 ? 'angry' : 'calm';
      ap = [BX, TOP - 18 - 56]; boardDraw = () => board(BX, TOP - 8, 1, 0, true);
    } else {                                                   // ow
      const sh = Math.sin(t * 30) * 30;
      dh = { L: [-150, -330], R: [150 + sh, -620] }; dmood = 'cry'; dsweat = 1;
      ap = [DX, TOP - 18 - 56]; boardDraw = () => board(DX, TOP - 8, 1, 0, true);
    }
    person(DX, FEET, CAST.dave, { s: 1, t, mood: dmood, sweat: dsweat, talk: talk('dave', t), blink: blink(t, 0.2), look: t > L(1) && t < chopL + 1 ? [1, 0.2] : [0, 0.6], hands: dh, hold: dhold, holdL: dholdL });
    tableShot(true);
    if (boardDraw && t < T3 + 0.01 && t >= sawA) { apple(...appleOnTable, 1.35); boardDraw(); }
    else if (boardDraw) { boardDraw(); apple(...ap, 1.35); }
    else apple(...ap, 1.35);
    if (t < sawA) knife; // knife is drawn in Dave's hand
    if (t > chopD && t < chopD + 0.25) label('THUD!', DX + 170, TOP - 230, 80, P.yellow, 14);
  } });
  cue(T1 - 0.02, 'whoosh', { gain: 0.5 }); cue(T1 + 0.4, 'tock', { gain: 0.6 });
  cue(sawA, 'slide', { dur: 1.3, gain: 0.8 }); cue(T3 + 0.2, 'slide', { dur: 1.6, gain: 0.5 });
  cue(chopL, 'whoosh', { gain: 0.4 }); cue(chopD, 'thud', { gain: 0.9 });

  // 3. Linda: "Dave! Use your HEAD!"
  add({ id: 'C', at: CL, cam: [540, 980], zoom: 0.14, note: 'Linda furious close-up', draw(lt, d, t) {
    blurred(12, () => tableShot(false), 'kitBlur');
    const q = t > Wd('HEAD!', 4) && t < Wd('HEAD!', 4) + 0.25 ? 0.2 : 0;
    person(540, 2264, CAST.linda, { s: 1.45, t, mood: 'angry', talk: talk('linda', t), squash: q, gesture: 'point', look: [-0.5, 0] });
  } });
  cue(CL - 0.02, 'whoosh', { gain: 0.6 });

  // 4. The headbutt
  add({ id: 'D', at: HB, cam: [540, 960], zoom: 0.05, note: 'headbutt splits the apple', draw(lt, d, t) {
    tableShot(false);
    person(650 + 190, FEET, CAST.linda, { s: 1, t, mood: t > hit ? 'shock' : 'angry', gesture: t > hit ? 'shock' : 'cross', look: [-1, 0.3] });
    const dy = t < hit - 0.15 ? lerp(0, -50, eo(seg(t, HB, hit - 0.15))) : t < hit ? lerp(-50, 300, seg(t, hit - 0.15, hit)) : lerp(300, 0, eo(seg(t, hit + 0.15, hit + 0.55)));
    person(DX, FEET + dy, CAST.dave, { s: 1, t, mood: t > hit ? 'shock' : 'angry', squash: t > hit && t < hit + 0.15 ? 0.4 : t < hit && t > hit - 0.15 ? -0.3 : 0, hands: { L: [-150, -330], R: [150, -330] } });
    tableShot(true);
    board(DX, TOP - 8, 1, 0, true);
    apple(DX, TOP - 74, 1.35, { split: eob(seg(t, hit, hit + 0.25)) });
    if (t > hit) stars(DX, 600 + Math.max(0, dy * 0.2), t);
    if (t > hit && t < hit + 0.3) label('CRACK!', DX + 230, 1000, 90, P.yellow, 16);
  } });
  cue(HB - 0.02, 'whoosh', { gain: 0.5 }); cue(hit, 'thud', { gain: 1 }); cue(hit + 0.02, 'pop', { gain: 0.9 }); cue(hit + 0.2, 'sparkle', { gain: 0.6 });

  // 5. Dave: "...It worked!"
  add({ id: 'E', at: C2, cam: [540, 980], zoom: 0.08, note: 'Dave proud with two halves', draw(lt, d, t) {
    blurred(12, () => tableShot(false), 'kitBlur');
    person(540, 2264, CAST.dave, { s: 1.45, t, mood: 'happy', talk: talk('dave', t), gesture: 'shrug', hold: (hx, hy) => halfApple(hx, hy - 80, 2.0), holdL: (hx, hy) => halfApple(hx, hy - 80, 2.0) });
    stars(540, 600, t, 5);
  } });
  cue(C2 - 0.02, 'whoosh', { gain: 0.6 });

  // 6. The chase
  add({ id: 'F', at: CH, cam: [540, 1150], zoom: 0.02, note: 'Linda chases Dave with the giant spoon', draw(lt, d, t) {
    kitchenWide();
    const k = clamp(lt / 2.1);
    const dx = lerp(150, 1350, k), lx = lerp(-350, 1100, k);
    person(dx, 1830, CAST.dave, { s: 0.82, t, mood: 'shock', walk: t * 16, gesture: 'shock', hold: (hx, hy) => halfApple(hx, hy - 50, 1.1) });
    person(lx, 1830, CAST.linda, { s: 0.82, t, mood: 'angry', walk: t * 16, hands: { L: [-150, -400], R: [170, -880 + Math.sin(t * 16) * 60] }, hold: (hx, hy) => spoon(hx, hy, 1.0, 0.3 + Math.sin(t * 16) * 0.3) });
  } });
  cue(CH - 0.02, 'whoosh'); cue(CH + 0.1, 'boing', { gain: 0.5 });
  for (let t = CH + 0.1; t < CH + 2.1; t += 0.2) cue(t, 'tock', { gain: 0.35 });

  // 7. Dave's smirk to camera, with a bite
  add({ id: 'G', at: C3, cam: [540, 980], zoom: 0.1, note: 'Dave bites the apple and smirks', draw(lt, d, t) {
    blurred(12, () => tableShot(false), 'kitBlur');
    const bit = lt > 0.35;
    person(540, 2264, CAST.dave, { s: 1.45, t, mood: bit ? 'sneaky' : 'happy', look: [0, 0], hands: { L: [-150, -330], R: [lerp(150, 70, eo(seg(lt, 0, 0.3))), lerp(-560, -790, eo(seg(lt, 0, 0.3)))] }, hold: (hx, hy) => halfApple(hx + 70, hy - 50, 1.9, bit) });
  } });
  cue(C3 - 0.02, 'whoosh', { gain: 0.6 }); cue(C3 + 0.35, 'pop', { gain: 0.7 });

  add({ id: 'H', at: CARD, cam: [540, 960], zoom: 0, note: 'The Pettys card', draw(lt, d, t) { pettysCard(lt, t, { bev: true }); } });
  cue(CARD, 'sting'); [0.05, 0.12, 0.19, 0.26].forEach((a) => cue(CARD + a, 'pop', { gain: 0.4 })); cue(CARD + 0.45, 'bark', { dur: 0.36, gain: 0.7 });
  return { shots: S, cues: CUES };
}
