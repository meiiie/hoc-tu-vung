# Neko v9: how the mascot is built

Reference studied: https://github.com/ArvinYin1/grokbot-animation-anatomy (MIT explainer). I read the README, `js/vendor/grok-player.js` (rendering part), `js/glow.js`, `js/sections/blink.js`, and the structure of `js/vendor/grok-recipes.json`: 28 clips, 53 states, 9 expressions, and the constants. That repo says its recipe data was extracted from another company's app and belongs to them, so **none of its code or data is copied here**. Neko's engine (`mascot.js`) is written from scratch. It applies the same principles with its own clips and shapes.

| Principle from the reference | In Neko |
|---|---|
| Every frame is computed; procedural SVG; few DOM nodes updated | Body path, two eye-hole paths, halo, decor; about 0.13 ms per frame |
| Radial-outline body (192 rays, per-angle lerp) | 120 rays; two cat ears added as angular bumps, raised/flattened per ear |
| Eyes are cut-outs (mask) shaped by stroked point lists | Mask with two 7-point round-capped strokes; the page shows through the eyes |
| 9 expressions (neutral, happy, surprised, sad, sleepy, squinted, calm, inspecting, confused), morphed point by point | Same 9 face names, own shapes, 0.28 s point morph |
| Clips = keyframe tracks + cubic-Bezier easing with overshoot | 21 hand-authored clips on tracks x, y, rot, sx, sy, yaw, pitch, left ear, right ear, lid |
| Blinks are clip events, 0.26 s, closed at 45%; some faces are not blinked through | Same timing; happy/sad/squinted/sleepy/confused/calm are not blinked |
| State = clips + face + morph + next/hold; seeded-PRNG clip shuffle with random phase | 21 states (idle shuffles 3 clips); surprised/waking go back to idle after 1.6 s, wave after 2.4 s |
| Springs (120 Hz semi-implicit Euler), not timers | All tracks and the morph amount are springs; poke adds an impulse |
| Pseudo-3D eyes on a sphere | Eye centres on a sphere rotated by yaw/pitch, orthographic projection, width foreshortened |
| Glow from fill: radial gradient + breathing halo (period about 5.4 s) | Same idea, colours derived from the user's colour |
| Morph states (thinking dots, wave, orbit...) | `processing`: the body shrinks into the middle of three bouncing dots; `speaking`: sound bars; `listening`: ear rings that react to the mic level |

Speaking practice: recording uses `listening` (ears react to mic level), scoring uses `processing`, then `correct` (85 and up), `encouraging` (60–84) or `wrong` (below 60, ending in the sad face). The native audio playing uses `speaking`.

Colours: 6 options (Settings → Giao diện → Màu Neko), each with a light-theme and a dark-theme shade. `tests/mascot.test.js` checks that the body, highlight and shade all keep at least 3:1 contrast against page and card backgrounds (108 pairs).

Reduced motion: one static pose per state, no animation loop (0 requestAnimationFrame calls in the test).
