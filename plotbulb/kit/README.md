
## Fixed sounds
- `sounds/pickles_bark.mp3`: Pickles' bark. ALWAYS use this for any dog bark (cue type `bark`, optional `dur` to trim). Never synthesize a bark.
  `tools/mix.py` finds it in the episode's `sounds/` folder or in `../sounds/` (this kit folder).

## Character rig v2 (from Gym Every Day onward)
`person()` in `gym-every-day/src/pb.js` is the standard: chunkier proportions (about 1030 px tall at s = 1, head radius 176),
two-joint arms placed by hand targets (`hands: { L, R }` in local units, or `gesture:` rest hips cross point phoneEar phoneShow
shock cheeks scratch flex shrug beg hang), breathing and weight shifts, talk beats, `walk` phase, `squash`, `lean`, `slump`, `tilt`.
Always pass `t`. Close-up: feet at y = 1020 + 858 * s puts the head centre at y = 1020.

## The Pettys end card + sting (every episode)
`pettysCard(lt, t)` in `pettys-card/src/pb.js` (also in gym-every-day) replaces `endCard`. Give it ~2.8 s at the end, with cues:
`sting` at the card start (our own original brass fanfare in tools/mix.py, hit at +0.42 s), pops at +0.05/+0.12/+0.19, `bark` (dur 0.36) at +0.45.
On the card: Dave, Linda, Gary, Pickles. Add Grandma Bev once she has debuted on screen.

## User-made sets (`sets/`)
Each set folder has the images plus SET.md with seat/standing measurements and overlays. `rig/pb.js` is the current kit
(rig v2 + proper sitting: `sitter()`, seat-front rects from the image, `sitLegs()` with hands on knees).
