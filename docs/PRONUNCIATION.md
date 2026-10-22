# Pronunciation scoring (v8)

## Model choice
| Candidate | Size (quantised) | Result in our tests | Decision |
|---|---|---|---|
| ZIPA-CR-Ns small, `anyspeech/zipa-small-crctc-ns-700k` (Zhu et al., ACL 2025, aclanthology.org/2025.acl-long.961) | 70.7 MB int8 ONNX | ok mean 93 / mispronounced mean 60 (offline pipeline), ok > bad in 30/32 pairs | **Chosen** |
| ZIPA-CR small 500k (CC BY 4.0) | ~71 MB | ok 84 / bad 59, ok > bad 27/32 | weaker |
| bookbot wav2vec2-ljspeech-gruut | 89.8 MB q4 | overfits to one speaker, fails on other voices | rejected |
| facebook wav2vec2-lv-60-espeak-cv-ft | 241 MB q4 | generalises well | too big for phones |
| wav2vec2-xlsr-53-espeak-cv-ft (ONNX) | 230 MB q4 | similar | too big for phones |

Other references: RemiKG/slip (GOP-CTC in the browser, ~318 MB), transformers.js issue #1506 (ZIPA ONNX export).

ZIPA licence: CC BY-NC-SA 4.0. The app is free and non-commercial. The model is not bundled; the user's browser downloads it from Hugging Face (pinned commit 797523f) and caches it in Cache Storage (`htv-engine-v1`).

## Pipeline
16 kHz mono audio, Kaldi-style 80-bin fbank (`pron.js`), ZIPA in a Web Worker on onnxruntime-web 1.30 (WASM, 1 thread; GitHub Pages has no cross-origin isolation). Next comes CTC greedy decoding into IPA units. Then DP alignment against CMUdict variants (`data/pron.json`), which accepts UK/US variants. Each phone gets a GOP-like posterior credit and one of four states: ok, close, substituted or missing. Stress is a heuristic based on vowel energy times duration.

## Measured (Playwright, real app, fake microphone stream, Chrome on the box)
- 32 correct native-TTS recordings vs 32 deliberately mispronounced ones (th→t, æ→e, iː→ɪ, dropped final consonants, -s/-ed, ʃ→s): **mean 89 vs 58**, correct > mispronounced in **30/32** pairs.
- Native TTS reading, 8 words: mean 93. The same words read by a Vietnamese TTS voice: mean 45.
- Zero contradictory states (error and score shown together) across 80+ attempts. Silence gives an error and no score.
- Inference is about 50–200 ms per word on the box (WASM). End to end from tapping the mic to the result is about 2.7 s, including the 0.9 s silence auto-stop. Model download plus init took about 17 s on the box network.
- WebKit (Playwright build): the worker, WASM, model loading and scoring all work, with the same scores.

## Not verified
- Real iPhone speed and memory (the int8 model takes roughly 150–250 MB RAM while running), and microphone capture through ScriptProcessor on iOS.
- Real Vietnamese learners' voices. All measurements use TTS voices.
- The stress check is a heuristic, not a trained model.

## v10 re-evaluation (Oct 2026)
Every candidate below was checked to exist on HF, GitHub, PyPI or arXiv. Scores come from the same scorer (`pron.js`) and the same 32 correct/mispronounced TTS pairs, plus 8 words read by native voices and by a Vietnamese-accent voice.

| Candidate | Exists / licence | Size | ok / bad mean | ok > bad | gap ≥ 20 | native / vi | Phone? |
|---|---|---|---|---|---|---|---|
| **ZIPA-CR-Ns small (current)** | yes, CC BY-NC-SA 4.0 | 70.7 MB int8 | **92.7 / 59.6** | **30/32** | **27** | 96.4 / 45.1 | yes |
| KoelLabs/xlsr-english-01 (tested via the public mirror ReubenAImen/xlsr-english-01; the original is gated) | yes, AGPL-3.0 | 1.26 GB fp32 (315M params, about 320 MB int8) | 94.0 / 62.2 | 29 | 25 | 94.5 / 45.6 | no |
| Pransfrance/cmubye-phoneme-encoder | yes, Apache-2.0 | 1.26 GB fp32 | 93.2 / 59.9 | 28 | 26 | 92.9 / 33.1 | no |
| moxeeeem/wav2vec2-finetuned-pronunciation-correction | yes, Apache-2.0 | 1.26 GB fp32 | 91.5 / 62.2 | 29 | 23 | 93.4 / 46.3 | no |
| OpenPronounce (PyPI 0.3.0) | yes, MIT | two wav2vec2 models, about 1.2 GB each (its phone model is lv-60-espeak, measured in v8) | not re-run | | | | no (server) |
| oollim (arXiv 2610.26406, github cburst/oollim) | yes, licence "other" | XLS-R + XEUS + PhoneticXeus | not run | | | | no (gaming PC) |
| "17 MB CTC + GOP engine" (fabiosuizu / Brainiall) | exists as a REST API and blog posts; **no public weights** (the HF Space calls api.brainiall.com) | claimed 17 MB INT4 Citrinet-256 | cannot run | | | | n/a |
| Qwen2.5-Omni-7B | yes, licence "other" | 10.7 GB | not run | | | | no |

Decision: keep ZIPA. No candidate separates correct from mispronounced audio better, and all the wav2vec2/XLS-R models are about 4–5 times too large for a phone browser. An ensemble would add more than 300 MB, so I left it out.

UK reference: `data/pron-uk.json`, generated from [Britfone](https://github.com/JoseLlarena/Britfone) (MIT) by `tools/pron-uk.py`, covers 251/252 words ("alcoholic" falls back to CMUdict). In UK mode the British form comes first, and the US forms are still accepted. In the app, the UK-voice "bath" recording now shows /ɑː/ as correct (score 31 → 59). /θ/ is still missing because this TTS clip is recognised without it.

Reference audio (TTS): the 252 words were run through ZIPA and scored against the reference IPA. Lower PER is better.

| Voice set | US PER | UK PER |
|---|---|---|
| edge-tts (current) | 3.3 % | **2.1 %** |
| Kokoro-82M v1.0 (Apache-2.0; af_heart / bf_emma) | **2.5 %** | 3.6 % |
| Kyutai Pocket TTS (CC BY 4.0; "anna", a British VCTK speaker) | n/a | 2.9 % |

I kept edge-tts. Kokoro is slightly better on US but worse on UK, and it misreads some words (for example "agenda", "a"). Not tried: Gradium phonon-31m-en (exists, Apache-2.0) and Ming-3.0-tts-0.5B (exists, MIT, 1.5 GB).

## v11: microphone on iOS Safari (Oct 2026)

**Report.** On a real iPhone the mic worked once after the model download. After that, every attempt said "no speech": the orange mic indicator was on, but the level bar stayed empty.

**Probable root cause.** This is not confirmed on a device; we could not reproduce it on Linux.
- v10 kept one long-lived `AudioContext`, which was also used for `decodeAudioData`, and resumed it only when `state === 'suspended'`.
- On iOS the context can be `interrupted`, so it was never resumed.
- iOS also changes the audio session and hardware sample rate after a mic track stops or after an `<audio>` element plays. A new `MediaStreamSource` on the old context can then deliver silence.
- `ScriptProcessor` callbacks keep firing with zeros, so the recorder timed out as "no speech". The page never knew the mic was dead.

**Fix (speech.js).**
- Every attempt creates a new capture `AudioContext` synchronously inside the tap (`prime()`).
- Every attempt makes a new `getUserMedia` call and checks that the track exists and is `live`.
- If the track's sample rate differs from the context's, the context is rebuilt at the track's rate.
- The context is resumed whenever it is not `running`.
- A watchdog runs: if there are no callbacks, or only exact zeros, after 900 ms, it rebuilds the context once. If that also fails, it stops with `dead` and shows an honest message.
- A track `ended` event stops the attempt cleanly.
- On every exit, tracks are stopped and the context is closed.
- Decoding uses `OfflineAudioContext`, so playback never shares a context with capture.
- Voice detection uses an adaptive noise floor: the median RMS of the first 300 ms, with threshold max(0.008, 3×floor) and 2 loud frames.
- If the level stays near zero for 1.5 s, a "Không nhận được tiếng từ micro" warning appears.
- `?debug=1` shows a live overlay with context state, sample rate, track state, RMS, callbacks and rebuilds.

**Tested.** Playwright Chromium and Playwright WebKit (`test_v11.py`, `test_v11_webkit.py`), using a fake microphone stream built from real recordings:
- 6 attempts in a row, including attempts right after the native recording played.
- Each attempt was scored correctly, with a fresh `getUserMedia` call per attempt.
- The quiet warning was checked.
- An all-zero stream triggered one rebuild and then the `dead` message.

**Not tested.** A real iPhone. Playwright's WebKit is not iOS Safari: it has no iOS audio session, no `interrupted` state and no hardware sample-rate switch. Please confirm on the device with `?debug=1`.

## v11: articulation diagrams
`artic.js` draws original animated mid-sagittal sections:
- tongue, lips, jaw and lower teeth move from a rest pose to the target pose, glide to a second target for diphthongs, then return;
- the velum is lowered for nasals;
- airflow is shown along the oral or nasal path, and for stops it appears only at release;
- voicing is shown as a vibrating line at the larynx.

The animation uses SMIL `animate` on paths with the same structure in every pose, which Safari supports. With reduced motion, a static target frame is shown.

The layout is our own schematic. Seeing Speech (University of Glasgow), Sounds of Speech (University of Iowa) and Rachel's English were consulted for articulator placement only; no artwork was copied.
