import argparse
import collections
import csv
import hashlib
import json
import pathlib
import re
import unicodedata
from urllib.parse import quote

ROOT = pathlib.Path(__file__).resolve().parents[2]
CONTENT = ROOT / 'content'
VOICE_VERSION = {'gb': 'piper-1.4.2-vctk-p225-ljspeech-high-1',
                 'us': 'piper-1.4.2-libritts-r-medium-speaker3922-1'}
LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1']
POS = {'adjective': 'adj', 'adverb': 'adv', 'noun': 'noun', 'verb': 'verb',
       'preposition': 'prep', 'pronoun': 'pron', 'conjunction': 'conj',
       'determiner': 'det', 'exclamation': 'intj', 'number': 'num',
       'modal verb': 'verb', 'auxiliary verb': 'verb', 'linking verb': 'verb',
       'indefinite article': 'article', 'definite article': 'article',
       'ordinal number': 'num', 'infinitive marker': 'particle'}
SOURCE_POS = {'article': {'article', 'det'}, 'det': {'det', 'adj', 'pron'},
              'pron': {'pron', 'noun'}, 'num': {'num', 'noun', 'adj'},
              'prep': {'prep', 'adv'}, 'conj': {'conj', 'adv'}, 'intj': {'intj', 'adv'}}
DISPLAY_POS = {'adj': 'adj.', 'adv': 'adv.', 'noun': 'n.', 'verb': 'v.',
               'prep': 'prep.', 'pron': 'pron.', 'conj': 'conj.', 'det': 'det.',
               'intj': 'excl.', 'num': 'num.', 'article': 'article'}


def read_json(path):
    return json.loads(path.read_text(encoding='utf-8'))


def read_tsv(path):
    with path.open(encoding='utf-8', newline='') as file:
        return list(csv.DictReader(file, delimiter='\t'))


def reference_rows():
    return (read_json(CONTENT / 'sources/oxford-20261026.json') +
            read_json(CONTENT / 'sources/oxford3000-pdf-additions-20261026.json')['references'])


def write_json(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + '.tmp')
    tmp.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8', newline='\n')
    tmp.replace(path)


def normalize(text):
    text = unicodedata.normalize('NFC', text).replace('™', '').strip()
    return text if text in {'August', 'March', 'May', 'IT'} else text.lower()


def aliases(word):
    return [normalize(w) for w in re.sub(r'\s*\(.*?\)', '', word).split(',')]


def spoken_word(word):
    return re.sub(r'\s*\(.*?\)', '', word).split(',')[0].strip()


def regular_forms(word, positions):
    if ' ' in word:
        return []
    forms = []
    if 'noun' in positions or 'verb' in positions:
        forms.append(word[:-1] + 'ies' if re.search(r'[^aeiou]y$', word) else word + ('es' if re.search(r'(s|sh|ch|x|z)$', word) else 's'))
    if 'verb' in positions:
        forms.extend([word[:-1] + 'ied' if re.search(r'[^aeiou]y$', word) else word + ('d' if word.endswith('e') else 'ed'),
                      word[:-1] + 'ing' if word.endswith('e') and not word.endswith('ee') else word + 'ing'])
    return forms


def allocate_ids(headwords, legacy, previous):
    ids = dict(previous)
    for w in legacy:
        for alias in aliases(w['w']):
            ids.setdefault(alias, w['id'])
    occupied = set(ids.values()) | {w['id'] for w in legacy}
    index = 0
    for word in sorted(headwords):
        if word in ids:
            continue
        while True:
            candidate = f'p{2 + index // 250}-{index % 250 + 1:03d}'
            index += 1
            if candidate not in occupied:
                break
        ids[word] = candidate
        occupied.add(candidate)
    return ids


def senses_for(rows, override):
    rejected = set(override.get('reject', []))
    seen, result = set(), []
    for row in rows:
        for index, sense in enumerate(row.get('senses', [])):
            for gloss in sense.get('glosses', []):
                gloss = unicodedata.normalize('NFC', gloss).strip()
                key = (row['pos'], gloss.casefold())
                if not re.search(r'[^\W\d_]', gloss) or gloss in rejected or key in seen:
                    continue
                seen.add(key)
                result.append({'pos': row['pos'], 'vi': gloss,
                               'source': 'viwiktionary-20261002',
                               'sourceWord': row['word'], 'sourceSense': index,
                               'labels': sense.get('tags', []) + sense.get('categories', []),
                               'examples': [{'en': e['text'], 'vi': e['translation']}
                                            for e in sense.get('examples', [])
                                            if e.get('text') and e.get('translation')]})
    return result


def cloze_target(word, example, forms):
    for form in [word, *forms]:
        match = re.search(r'(?<![\w\'])' + re.escape(form) + r'(?!\w)', example, re.I)
        if match:
            return {'text': match[0], 'start': match.start(), 'end': match.end()}
    return None


def audio_key(text, voice, version=None):
    return hashlib.sha256(json.dumps([text, voice, version or VOICE_VERSION[voice]], ensure_ascii=False).encode()).hexdigest()[:24]


def validate_word(w):
    if not w.get('vi') or not w.get('meanings'):
        raise ValueError(f"{w['id']} {w['w']}: missing Vietnamese meaning")
    if not w.get('ex') or not w.get('exvi') or not w.get('cloze'):
        raise ValueError(f"{w['id']} {w['w']}: missing bilingual example/cloze")
    if not w.get('cefr') or any(x not in LEVELS for x in w['cefr']):
        raise ValueError(f"{w['id']}: invalid CEFR")
    cz = w['cloze']
    if w['ex'][cz['start']:cz['end']] != cz['text']:
        raise ValueError(f"{w['id']}: cloze offsets disagree")


def compile_words():
    ref = reference_rows()
    legacy = read_json(CONTENT / 'legacy-p1.json')
    source = [json.loads(line) for file in ['viwiktionary-20261002.jsonl', 'viwiktionary-pdf-additions-20261002.jsonl']
              for line in (CONTENT / 'sources' / file).read_text(encoding='utf-8').splitlines()]
    overrides = read_json(CONTENT / 'overrides.json')
    pronunciation_file = ROOT / 'data/pron-sources.json'
    pronunciations = read_json(pronunciation_file) if pronunciation_file.exists() else {}
    curated = {}
    for file in sorted((CONTENT / 'curated').glob('*.tsv')):
        for row in read_tsv(file):
            key = normalize(row['word'])
            if key in curated:
                raise ValueError(f'duplicate curated word: {key}')
            curated[key] = row
    primary_file = CONTENT / 'primary.tsv'
    if primary_file.exists():
        for row in read_tsv(primary_file):
            key = normalize(row['word'])
            if key in curated:
                raise ValueError(f'primary override duplicates curated record: {key}')
            curated[key] = row
    example_file = CONTENT / 'examples.tsv'
    if example_file.exists():
        seen_examples = set()
        for row in read_tsv(example_file):
            key = normalize(row['word'])
            if key in seen_examples or curated.get(key, {}).get('ex'):
                raise ValueError(f'duplicate edited example: {key}')
            seen_examples.add(key)
            curated.setdefault(key, {}).update(row)
    id_file = CONTENT / 'ids.json'
    ids = allocate_ids({normalize(x['word']) for x in ref}, legacy, read_json(id_file) if id_file.exists() else {})
    write_json(id_file, ids)
    refs, entries = collections.defaultdict(list), collections.defaultdict(list)
    for r in ref:
        refs[normalize(r['word'])].append(r)
    exact_words = {r['word'].replace('™', '') for r in ref}
    for r in source:
        if r.get('lang_code') != 'en':
            raise ValueError('Source projection contains a non-English entry')
        if r['word'].isupper() and len(r['word']) > 1 and r['word'] not in exact_words:
            continue
        entries[normalize(r['word'])].append(r)
    by_id = {w['id']: dict(w) for w in legacy}
    for headword, wid in ids.items():
        if wid not in by_id:
            label = refs[headword][0]['word'].replace('™', '')
            by_id[wid] = {'id': wid, 'w': label, 'ipa': '', 'tags': [], 'tip': '', 'col': ''}
    result, issues = [], []
    for w in by_id.values():
        names = aliases(w['w'])
        word = names[0]
        rows = [r for a in names for r in entries[a]]
        reference = [r for a in names for r in refs[a]]
        override = overrides.get(word, {})
        positions = list(dict.fromkeys(POS.get(r['pos'], r['pos']) for r in reference))
        source_positions = set().union(*(SOURCE_POS.get(p, {p}) for p in positions))
        meanings = [m for m in senses_for(rows, override) if m['pos'] in source_positions]
        c = curated.get(word, {})
        primary = c.get('vi') or override.get('vi') or w.get('vi')
        compatible = meanings
        if not primary:
            primary = (compatible or meanings or [{}])[0].get('vi', '')
        if c.get('vi') or override.get('vi') or w['id'].startswith('p1-'):
            meanings.insert(0, {'pos': '/'.join(positions), 'vi': primary, 'source': 'project-editorial' if c.get('vi') or override.get('vi') else 'legacy-p1', 'labels': [], 'examples': []})
        w['vi'] = primary
        w['meanings'] = meanings
        w['references'] = [{'pos': r['pos'], 'cefr': r['ox5000'].upper(),
                            'url': r.get('url') or 'https://www.oxfordlearnersdictionaries.com' + r['href'],
                            **({'source':r['source'], 'page':r['page']} if r.get('source') else {})} for r in reference]
        w['cefr'] = sorted({r['ox5000'].upper() for r in reference}, key=LEVELS.index)
        w['lv'] = '/'.join(w['cefr'])
        w.setdefault('pos', ', '.join(DISPLAY_POS.get(p, p) for p in positions))
        forms = [f['form'] for r in rows for f in r.get('forms', [])] + regular_forms(word, positions)
        if c.get('ex'):
            w['ex'], w['exvi'], w['exampleSource'] = c['ex'], c['exvi'], 'project-editorial'
        elif not w.get('ex'):
            examples = [e for m in (compatible + [m for m in meanings if m not in compatible]) for e in m['examples']
                        if 2 <= len(e['en'].split()) <= 22 and cloze_target(word, e['en'], forms)
                        and not re.search(r'[#{}<>]|\.\.\.|…', e['en'])]
            chosen = examples[0] if examples else {}
            w['ex'], w['exvi'], w['exampleSource'] = chosen.get('en', ''), chosen.get('vi', ''), 'viwiktionary-20261002'
        else:
            w['exampleSource'] = 'legacy-p1'
        w['cloze'] = cloze_target(word, w['ex'], forms + override.get('forms', []))
        if not w['ipa']:
            w['ipa'] = next((s['ipa'] for r in rows for s in r.get('sounds', []) if s.get('ipa', '').startswith('/')), '')
        if pronunciations.get(w['id'], {}).get('ipa'):
            w['ipaByVoice'] = pronunciations[w['id']]['ipa']
            w['ipa'] = w['ipa'] or w['ipaByVoice']['gb']
        w['contentReview'] = {'primary': 'ai-edited' if c.get('vi') or override.get('vi') else 'legacy' if w['id'].startswith('p1-') else 'source-import',
                              'example': 'ai-edited' if c.get('ex') else w['exampleSource'],
                              'additionalMeanings': 'source-import', 'humanReviewed': False}
        if override.get('tip'):
            w['tip'] = override['tip']
        w['audio'] = {}
        for voice in ['gb', 'us']:
            page, num = w['id'].split('-')
            w['audio'][voice] = {}
            for kind, text in [('w', spoken_word(w['w'])), ('ex', w['ex'])]:
                if page == 'p1' and not c.get('ex'):
                    url = f'audio/p1/{voice}/{kind}/{num}.mp3'
                else:
                    url = f'audio/generated/{voice}/{audio_key(text, voice)}.mp3' if text else ''
                w['audio'][voice][kind] = url
        try:
            validate_word(w)
        except ValueError as e:
            issues.append(str(e))
        result.append(w)
    result.sort(key=lambda x: tuple(int(y.lstrip('p')) for y in x['id'].split('-')))
    return result, issues


def main():
    parser = argparse.ArgumentParser(description='Compile the versioned English–Vietnamese content snapshot.')
    parser.add_argument('--draft', action='store_true')
    args = parser.parse_args()
    source_manifest = CONTENT / 'sources/manifest.json'
    if source_manifest.exists():
        for file, pin in read_json(source_manifest)['files'].items():
            if hashlib.sha256((ROOT / file).read_bytes()).hexdigest() != pin['sha256']:
                raise SystemExit(f'Source checksum mismatch: {file}')
    words, issues = compile_words()
    from study_order import compile_order
    study_order = compile_order(words)
    report = {'entries': len(words), 'headwords': len({a for w in words for a in aliases(w['w'])}),
              'meanings': sum(len(w['meanings']) for w in words), 'examples': sum(bool(w['ex'] and w['exvi']) for w in words),
              'missing': issues}
    write_json(ROOT / '.cache-content/draft.json', words)
    write_json(ROOT / '.cache-content/report.json', report)
    print(json.dumps({k: v if k != 'missing' else len(v) for k, v in report.items()}))
    if args.draft:
        return
    manifest_path = CONTENT / 'audio-manifest.json'
    assets = {a['file']: a for a in read_json(manifest_path)['assets']} if manifest_path.exists() else {}
    missing_audio = []
    for w in words:
        for voice, urls in w['audio'].items():
            for kind, url in urls.items():
                path = ROOT / url
                asset = assets.get(url, {})
                expected = spoken_word(w['w']) if kind == 'w' else w['ex']
                if not url or not path.is_file() or asset.get('text') != expected or asset.get('voice') != voice or not asset.get('decodedSeconds'):
                    missing_audio.append(url)
                elif hashlib.sha256(path.read_bytes()).hexdigest() != asset.get('sha256'):
                    missing_audio.append(url)
    if issues or missing_audio:
        raise SystemExit(f'Release blocked: {len(issues)} content issues, {len(missing_audio)} missing audio files. See .cache-content/report.json')
    for w in words:
        if not w.get('ipaByVoice') or any(not w['ipaByVoice'].get(v) for v in ['gb', 'us']):
            raise SystemExit(f"Release blocked: missing pronunciation for {w['id']}")
        w['audioBytes'] = {v: sum(assets[url]['bytes'] for url in urls.values()) for v, urls in w['audio'].items()}
    pages = []
    for page, group in __import__('itertools').groupby(words, lambda w: w['id'].split('-')[0]):
        pack = list(group)
        file = f'data/{page}.json'
        (ROOT / file).write_text(json.dumps(pack, ensure_ascii=False, separators=(',', ':')) + '\n', encoding='utf-8', newline='\n')
        pages.append({'id': page, 'title': f"Oxford 5000 · {pack[0]['w']} → {pack[-1]['w']}", 'file': file, 'short': f"{pack[0]['w']} → {pack[-1]['w']}"})
    write_json(ROOT / 'data/pages.json', {'version': '2026-10-26', 'entries': len(words), 'headwords': report['headwords'], 'pages': pages})
    (ROOT / 'data/study-order.json').write_text(json.dumps(study_order, ensure_ascii=False, separators=(',', ':')) + '\n', encoding='utf-8', newline='\n')
    write_json(ROOT / 'docs/audits/content-2026-10-26.json', report)


if __name__ == '__main__':
    main()
