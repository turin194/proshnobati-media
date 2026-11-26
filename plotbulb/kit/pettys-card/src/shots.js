import { ctx } from './core/lib.js';
import { pettysCard } from './pb.js';
export function buildShots() {
  const CUES = [{ t: 0.0, type: 'sting' }, { t: 0.05, type: 'pop', gain: 0.4 }, { t: 0.12, type: 'pop', gain: 0.4 }, { t: 0.19, type: 'pop', gain: 0.4 }, { t: 0.45, type: 'bark', dur: 0.36, gain: 0.7 }];
  return { shots: [{ id: 'CARD', at: 0, cam: [540, 960], zoom: 0, note: 'Pettys card', draw(lt, d, t) { pettysCard(lt, t); } }], cues: CUES };
}
