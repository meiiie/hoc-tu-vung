"""Offline audio compiler. Requires Piper (GPL-3.0) and the attributed voice models."""
import argparse
import hashlib
import json
import pathlib
import time

from build import ROOT, VOICE_VERSION, spoken_word, write_json


def jobs_for(words, voice, kind):
    jobs = {}
    for w in words:
        for field in (['w', 'ex'] if kind == 'all' else [kind]):
            url = w['audio'][voice][field]
            if url.startswith('audio/generated/'):
                text = spoken_word(w['w']) if field == 'w' else w['ex']
                jobs[url] = text
    return jobs


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--models', type=pathlib.Path, required=True)
    parser.add_argument('--voice', choices=['gb', 'us'], required=True)
    parser.add_argument('--kind', choices=['w', 'ex', 'all'], default='all')
    parser.add_argument('--limit', type=int)
    args = parser.parse_args()
    import lameenc
    import numpy as np
    import onnxruntime as ort
    from piper import PiperVoice, SynthesisConfig
    names = {'gb': 'en_GB-vctk-medium', 'us': 'en_US-libritts_r-medium'}
    name = names[args.voice]
    model = args.models / (name + '.onnx')
    pins = json.loads((ROOT / 'content/sources/voices.json').read_text(encoding='utf-8'))[args.voice]
    model_sha = hashlib.sha256(model.read_bytes()).hexdigest()
    config_sha = hashlib.sha256(model.with_suffix('.onnx.json').read_bytes()).hexdigest()
    if model_sha != pins['sha256'] or config_sha != pins['configSha256']:
        raise SystemExit('Voice model/config differs from the pinned snapshot')
    voice = PiperVoice.load(model)
    options = ort.SessionOptions()
    options.intra_op_num_threads = 2
    options.inter_op_num_threads = 1
    voice.session = ort.InferenceSession(str(model), sess_options=options, providers=['CPUExecutionProvider'])
    settings = SynthesisConfig(speaker_id=voice.config.speaker_id_map.get('p225', 0), length_scale=1.05, noise_scale=0.667, noise_w_scale=0.8)
    jobs = jobs_for(json.loads((ROOT / '.cache-content/draft.json').read_text(encoding='utf-8')), args.voice, args.kind)
    cache = ROOT / '.cache-content'
    journal = cache / f'audio-{args.voice}.jsonl'
    manifest = ROOT / 'content/audio-manifest.json'
    done = {a['file']: a for a in json.loads(manifest.read_text(encoding='utf-8'))['assets'] if a['file'].startswith('audio/generated/')} if manifest.exists() else {}
    if journal.exists():
        for line in journal.read_text(encoding='utf-8').splitlines():
            try:
                row = json.loads(line)
                done[row['file']] = row
            except json.JSONDecodeError:
                continue
    generated, skipped, failures = 0, 0, []
    start = time.monotonic()
    with journal.open('a', encoding='utf-8', buffering=1) as log:
        for url, text in jobs.items():
            path = ROOT / url
            old = done.get(url)
            if path.exists() and old and old['version'] == VOICE_VERSION[args.voice] and old['modelSha256'] == model_sha and hashlib.sha256(path.read_bytes()).hexdigest() == old['sha256']:
                skipped += 1
                continue
            if args.limit and generated >= args.limit:
                break
            try:
                chunks = list(voice.synthesize(text, syn_config=settings))
                pcm = np.concatenate([x.audio_int16_array for x in chunks])
                sr = chunks[0].sample_rate
                duration = len(pcm) / sr
                length_scale = settings.length_scale
                if duration < 0.2:
                    slower = SynthesisConfig(speaker_id=settings.speaker_id, length_scale=1.4,
                                             noise_scale=settings.noise_scale, noise_w_scale=settings.noise_w_scale)
                    chunks = list(voice.synthesize(text, syn_config=slower))
                    pcm = np.concatenate([x.audio_int16_array for x in chunks])
                    duration = len(pcm) / sr
                    length_scale = slower.length_scale
                rms = float(np.sqrt(np.mean((pcm.astype(np.float64) / 32768) ** 2)))
                if not 0.2 <= duration <= 45 or not np.isfinite(rms) or rms < 0.002:
                    raise ValueError(f'invalid speech: {duration=}, {rms=}')
                encoder = lameenc.Encoder()
                encoder.set_bit_rate(64)
                encoder.set_in_sample_rate(sr)
                encoder.set_channels(1)
                encoder.set_quality(2)
                mp3 = bytes(encoder.encode(pcm.tobytes()) + encoder.flush())
                path.parent.mkdir(parents=True, exist_ok=True)
                part = path.with_suffix('.tmp')
                part.write_bytes(mp3)
                part.replace(path)
                row = {'file': url, 'text': text, 'voice': args.voice, 'version': VOICE_VERSION[args.voice],
                       'modelSha256': model_sha, 'configSha256': config_sha, 'sha256': hashlib.sha256(mp3).hexdigest(),
                       'bytes': len(mp3), 'seconds': round(duration, 3), 'rms': round(rms, 5), 'lengthScale': length_scale}
                log.write(json.dumps(row, ensure_ascii=False) + '\n')
                generated += 1
                if generated % 100 == 0:
                    print(json.dumps({'voice': args.voice, 'generated': generated, 'skipped': skipped, 'total': len(jobs), 'failed': len(failures)}), flush=True)
            except Exception as e:
                failures.append({'file': url, 'text': text, 'error': str(e)})
                print(json.dumps(failures[-1]), flush=True)
    report = {'voice': args.voice, 'kind': args.kind, 'generated': generated, 'skipped': skipped,
              'total': len(jobs), 'seconds': round(time.monotonic() - start, 2), 'failures': failures}
    write_json(cache / f'audio-{args.voice}-{args.kind}-report.json', report)
    print(json.dumps(report), flush=True)
    if failures:
        raise SystemExit(1)


if __name__ == '__main__':
    main()
