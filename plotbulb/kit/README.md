
## Fixed sounds
- `sounds/pickles_bark.mp3`: Pickles' bark. ALWAYS use this for any dog bark (cue type `bark`, optional `dur` to trim). Never synthesize a bark.
  `tools/mix.py` finds it in the episode's `sounds/` folder or in `../sounds/` (this kit folder).

## Character rig v2 (from Gym Every Day onward)
`person()` in `gym-every-day/src/pb.js` is the standard: chunkier proportions (about 1030 px tall at s = 1, head radius 176),
two-joint arms placed by hand targets (`hands: { L, R }` in local units, or `gesture:` rest hips cross point phoneEar phoneShow
shock cheeks scratch flex shrug beg hang), breathing and weight shifts, talk beats, `walk` phase, `squash`, `lean`, `slump`, `tilt`.
Always pass `t`. Close-up: feet at y = 1020 + 858 * s puts the head centre at y = 1020.
