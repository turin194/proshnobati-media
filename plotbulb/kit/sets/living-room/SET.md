# Living room (user-made set, 1080×1920)

| file | shot | notes |
|---|---|---|
| A_wide.png | wide 3-shot | Dave's chair right, Linda's cream chair left, sofa centre, coffee table + rug front |
| B_medium.png | medium 2-shot | slight push-in of A |
| C_chair.png | Dave's chair close-up | |
| D_kevin.png | Kevin's bowl close-up | |

## Overlays (always draw these on top of the image)
- Family photo (A): replace the picture inside the frame with our own cast: `photo(390, 790, 200, 140)`.
- Kevin label (A): `kevinLabel(797, 753, 126, 38, N)`; raise N over the series.

## Seats (sitting = sitter() → seat-front rects from the image → sitLegs())
- A, Dave's chair: x 890, seat 1292, knee 1322, floor 1452, s 0.62; front rects [731,1213,76,250] [974,1213,78,250] [805,1270,170,190]
- A, sofa left cushion: x 385, seat 1288, knee 1312, floor 1440, s 0.62; front rects [300,1248,172,180] [222,1158,82,270]
- C, Dave's chair close-up: x 590, seat 1040, knee 1140, floor 1452, s 1.2, spread 72; front rects [182,815,192,590] [808,815,194,590] [372,1112,438,290]
- Standing in A: in front of the coffee table (feet y ≈ 1850), not on it.
