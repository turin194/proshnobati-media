import { ctx } from './core/lib.js';
import { CAST, INK, person, sitter, sitLegs, head, box, label, HIP } from './pb.js';
const load = async (f) => { const i = new Image(); i.src = 'sets/' + f; await i.decode(); return i; };
const A = await load('A_wide.png'), C = await load('C_chair.png');
function photo(x, y, w, h) {
  box(x, y, w, h, 2, '#DCE6EF', INK, 3); const cw = w / 3;
  [['dave', '#3A8DDE'], ['linda', '#EC82A7'], ['dave', '#5DB548']].forEach(([k, col], i) => {
    const cx = x + cw * (i + 0.5); box(cx - cw * 0.32, y + h * 0.55, cw * 0.64, h * 0.42, 10, col, INK, 3); head(cx, y + h * 0.36, h * 0.2, { cast: CAST[k], mood: 'happy' });
  });
}
function kevinLabel(x, y, w, h, n) { box(x, y, w, h, 8, '#FFFFFF', INK, 3); label('KEVIN ' + n, x + w / 2, y + h / 2 + 2, h * 0.62, INK, 0, INK, 900); }
const front = (img, rects) => rects.forEach(([x, y, w, h]) => ctx.drawImage(img, x, y, w, h, x, y, w, h));
// hands resting on the armrest tops, given in world coords → local units for the rig
const kneeHands = (x, seatY, s, kneeY, spread = 70) => ({ L: [-spread + 6, HIP + (kneeY - 10 - seatY) / s], R: [spread - 6, HIP + (kneeY - 10 - seatY) / s] });
const armHands = (x, seatY, s, lx, rx, ay) => ({ L: [(lx - x) / s, HIP + (ay - seatY) / s], R: [(rx - x) / s, HIP + (ay - seatY) / s] });
export function buildShots() {
  return { cues: [], shots: [
    { id: 'A', at: 0, cam: [540, 960], zoom: 0, note: 'wide', draw(lt, d, t) {
      ctx.drawImage(A, 0, 0); photo(390, 790, 200, 140); kevinLabel(797, 753, 126, 38, 8);
      // Dave in his chair (seat 1292, armrest tops 1205, floor 1452)
      const s = 0.62, x = 890, seat = 1292;
      sitter(x, seat, CAST.dave, { s, t, mood: 'annoyed', hands: kneeHands(x, seat, s, 1322) });
      front(A, [[731, 1213, 76, 250], [974, 1213, 78, 250], [805, 1270, 170, 190]]);
      sitLegs(x, seat, 1322, 1452, s, CAST.dave);
      // Linda on the sofa, left cushion (seat 1290, floor 1440)
      const sl = 0.62, xl = 385, seatL = 1288;
      sitter(xl, seatL, CAST.linda, { s: sl, t, mood: 'smug', look: [1, 0], gesture: 'cross' });
      front(A, [[300, 1248, 172, 180], [222, 1158, 82, 270]]);
      sitLegs(xl, seatL, 1312, 1440, sl, CAST.linda);
    } },
    { id: 'C', at: 1.0, cam: [540, 960], zoom: 0, note: 'Dave chair close', draw(lt, d, t) {
      ctx.drawImage(C, 0, 0);
      const s = 1.2, x = 590, seat = 1040;
      sitter(x, seat, CAST.dave, { s, t, mood: 'happy', hands: kneeHands(x, seat, s, 1140, 72) });
      front(C, [[182, 815, 192, 590], [808, 815, 194, 590], [372, 1112, 438, 290]]);
      sitLegs(x, seat, 1140, 1452, s, CAST.dave, { spread: 72 });
    } },
  ] };
}
