"""Decode every referenced MP3 and publish a content-addressed asset manifest."""
import concurrent.futures
import hashlib
import json
import pathlib
import av
import numpy as np
from build import ROOT, VOICE_VERSION, read_json, spoken_word, write_json


def inspect(job):
    url, metadata = job
    path = ROOT / url
    data = path.read_bytes()
    digest = hashlib.sha256(data).hexdigest()
    if metadata.get('sha256') and metadata['sha256'] != digest:
        raise ValueError('Changed audio bytes: ' + url)
    samples, energy, rate = 0, 0.0, None
    with av.open(path) as container:
        for frame in container.decode(audio=0):
            pcm = frame.to_ndarray().astype(np.float64)
            if frame.format.name.startswith('s16'):
                pcm /= 32768
            energy += float(np.square(pcm).sum())
            samples += pcm.size
            rate = frame.sample_rate * len(frame.layout.channels)
    if not samples or not rate:
        raise ValueError('Empty audio: ' + url)
    seconds, rms = samples / rate, (energy / samples) ** 0.5
    if not 0.15 <= seconds <= 60 or not np.isfinite(rms) or rms < 0.001:
        raise ValueError(f'Invalid audio {url}: {seconds=}, {rms=}')
    return {**metadata, 'file': url, 'sha256': digest, 'bytes': len(data),
            'decodedSeconds': round(seconds, 3), 'decodedRms': round(rms, 6)}


def main():
    words = read_json(ROOT / '.cache-content/draft.json')
    manifest_path = ROOT / 'content/audio-manifest.json'
    records = {a['file']: a for a in read_json(manifest_path)['assets']} if manifest_path.exists() else {}
    pins = read_json(ROOT / 'content/sources/voices.json')
    for voice in ['gb', 'us']:
        journal = ROOT / f'.cache-content/audio-{voice}.jsonl'
        for line in journal.read_text(encoding='utf-8').splitlines() if journal.exists() else []:
            row = json.loads(line)
            records[row['file']] = row
    jobs = {}
    for w in words:
        for voice, assets in w['audio'].items():
            for kind, url in assets.items():
                text = spoken_word(w['w']) if kind == 'w' else w['ex']
                if url.startswith('audio/generated/'):
                    row = records.get(url)
                    if not row or row['text'] != text or row['voice'] != voice or row['version'] != VOICE_VERSION[voice]:
                        raise ValueError(f'Missing matching generation record: {url} ({text})')
                    if row.get('modelSha256') != pins[voice]['sha256']:
                        raise ValueError('Unpinned voice model: ' + url)
                    if row.get('configSha256', pins[voice]['configSha256']) != pins[voice]['configSha256']:
                        raise ValueError('Unpinned voice config: ' + url)
                else:
                    row = {'text': text, 'voice': voice, 'version': 'legacy-microsoft-edge-tts',
                           'sourceCommit': '8953b394657555ee07dd5bb32f30823829330032'}
                jobs[url] = row
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        assets = list(pool.map(inspect, sorted(jobs.items())))
    manifest = {'version': '2026-10-26', 'assets': assets}
    write_json(ROOT / 'content/audio-manifest.json', manifest)
    report = {'references': len(words) * 4, 'uniqueFiles': len(assets),
              'bytes': sum(a['bytes'] for a in assets), 'decoded': len(assets), 'failures': [],
              'voices': {v: sum(a['voice'] == v for a in assets) for v in ['gb', 'us']},
              'note': 'Decode, duration, energy and checksum checks; not a human pronunciation review.'}
    write_json(ROOT / 'docs/audits/audio-2026-10-26.json', report)
    print(json.dumps(report))


if __name__ == '__main__':
    main()
