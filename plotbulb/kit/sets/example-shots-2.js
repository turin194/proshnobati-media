import { ctx } from './core/lib.js';
import { CAST, INK, P, person, sitter, sitLegs, pickles, head, box, label, HIP } from './pb.js';
const load = async (f) => { const i = new Image(); i.src = 'sets/' + f + '.png'; await i.decode(); return i; };
const K = await load('kitchen_A_wide'), F = await load('frontyard_C_porch'), G = await load('garage_master'), S = await load('street_A_wide');
const front = (img, rects) => rects.forEach(([x, y, w, h]) => ctx.drawImage(img, x, y, w, h, x, y, w, h));
function fridgeNote(x, y, w, h, lines, rot = -0.05) {
  ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.rotate(rot);
  box(-w / 2, -h / 2, w, h, 2, '#F2E27A', INK, 3); box(-w / 2, -h / 2, w, h * 0.14, 0, '#E6D35E', null);
  lines.forEach((l, i) => { ctx.font = `800 ${h * 0.16}px Inter`; ctx.textAlign = 'left'; ctx.fillStyle = INK; ctx.fillText(l, -w / 2 + 22, -h / 2 + h * 0.36 + i * h * 0.22); });
  ctx.restore();
}
export function buildShots() {
  return { cues: [], shots: [
    { id: 'K', at: 0, cam: [540, 960], zoom: 0, note: 'kitchen', draw(lt, d, t) {
      ctx.drawImage(K, 0, 0);
      fridgeNote(78, 1008, 196, 196, ['Bev stays.', 'Deal with it.', '— L']);
      sitter(380, 1330, CAST.dave, { s: 0.62, t, mood: 'annoyed', gesture: 'rest' });
      sitter(700, 1330, CAST.linda, { s: 0.62, t, mood: 'smug', gesture: 'cross', look: [-1, 0] });
      front(K, [[228, 1394, 626, 180], [268, 1570, 28, 110], [786, 1570, 28, 110]]);
    } },
    { id: 'F', at: 1, cam: [540, 960], zoom: 0, note: 'front yard', draw(lt, d, t) {
      ctx.drawImage(F, 0, 0);
      person(420, 1760, CAST.dave, { s: 0.7, t, mood: 'shock', look: [1, 0] });
      person(700, 1700, CAST.bev, { s: 0.66, t, mood: 'happy', gesture: 'hips', look: [-1, 0] });
    } },
    { id: 'G', at: 2, cam: [540, 960], zoom: 0, note: 'garage', draw(lt, d, t) {
      ctx.drawImage(G, 0, 0);
      sitter(820, 1650, CAST.dave, { s: 0.78, t, mood: 'happy', hands: { L: [-70, HIP + 40], R: [70, HIP + 40] } });
      front(G, [[620, 1690, 420, 130]]);
      sitLegs(820, 1650, 1710, 1830, 0.78, CAST.dave, { spread: 80 });
    } },
    { id: 'S', at: 3, cam: [540, 960], zoom: 0, note: 'street', draw(lt, d, t) {
      ctx.drawImage(S, 0, 0);
      person(300, 1880, CAST.dave, { s: 0.74, t, mood: 'angry', gesture: 'point', look: [1, 0] });
      pickles(560, 1890, 0.62, { dir: -1, t, bark: 1 });
      person(800, 1880, CAST.gary, { s: 0.74, t, mood: 'smug', gesture: 'cross', look: [-1, 0] });
    } },
  ] };
}
