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
