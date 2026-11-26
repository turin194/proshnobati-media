// Plotbulb captions: uppercase Inter Black, white with a thick ink outline, one yellow word, centre lower third.
import { ctx, clamp, lerp, seg, eob } from './core/lib.js';
import { T, lineWords } from './core/timing.js';

const Y = 1440, SIZE = 104, MAXW = 960;
let caps = [];
export function buildCaptions(script) {
  caps = [];
  script.lines.forEach((ln, i) => {
    const chunks = ln.caps.split('|').map((s) => s.trim()).filter(Boolean), ws = lineWords(i);
    const counts = chunks.map((c) => c.split(/\s+/).length); let k = 0;
    chunks.forEach((c, j) => { const w = ws[Math.min(k, ws.length - 1)]; caps.push({ line: i, s: w.s - 0.05, words: c.split(/\s+/).map((x) => ({ txt: x.replace('*', ''), hi: x.startsWith('*') })) }); k += counts[j]; });
  });
  caps.forEach((c, k) => { const next = caps[k + 1], end = T.lines[c.line].end + 0.4; c.e = next ? Math.min(next.s, next.line === c.line ? next.s : Math.max(end, c.s + 0.5)) : end; });
  return caps;
}
export const captionList = () => caps;
export function drawCaption(t) {
  const c = caps.find((c) => t >= c.s && t < c.e); if (!c) return;
  const lt = t - c.s, sc = lt < 0.16 ? lerp(0.72, 1, eob(seg(lt, 0, 0.16))) : 1;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  let size = SIZE; ctx.font = `900 ${size}px Inter`;
  const sp = () => ctx.measureText(' ').width;
  let width = c.words.reduce((a, w) => a + ctx.measureText(w.txt).width, 0) + sp() * (c.words.length - 1);
  if (width > MAXW) { size = Math.floor(size * MAXW / width); ctx.font = `900 ${size}px Inter`; width = c.words.reduce((a, w) => a + ctx.measureText(w.txt).width, 0) + sp() * (c.words.length - 1); }
  ctx.translate(540, Y); ctx.scale(sc, sc);
  let x = -width / 2; ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.lineJoin = 'round';
  for (const w of c.words) {
    ctx.lineWidth = size * 0.22; ctx.strokeStyle = '#151515'; ctx.strokeText(w.txt, x, 0);
    ctx.fillStyle = w.hi ? '#FFE03A' : '#FFFFFF'; ctx.fillText(w.txt, x, 0);
    x += ctx.measureText(w.txt).width + sp();
  }
  ctx.restore();
}
