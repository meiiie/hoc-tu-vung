"""Build pronunciation references; preserve curated legacy references and label G2P fallbacks."""
import itertools
import json
import re
import cmudict
from piper.phonemize_espeak import EspeakPhonemizer
from build import ROOT, CONTENT, read_json, spoken_word, write_json, normalize

ARP = dict(zip('AA AE AH AO AW AY B CH D DH EH ER EY F G HH IH IY JH K L M N NG OW OY P R S SH T TH UH UW V W Y Z ZH'.split(),
               'ɑ æ ʌ ɔ aʊ aɪ b t͡ʃ d ð ɛ ɚ eɪ f ɡ h ɪ i d͡ʒ k l m n ŋ oʊ ɔɪ p ɹ s ʃ t θ ʊ u v w j z ʒ'.split()))
VOWELS = set('ɑ æ ʌ ɔ aʊ aɪ ɛ ɚ eɪ ɪ i oʊ ɔɪ ʊ u ə'.split())
IPA = {'ɑː': ['ɑ'], 'ɒ': ['ɑ'], 'ɔː': ['ɔ'], 'əʊ': ['oʊ'], 'iː': ['i'], 'uː': ['u'],
       'ɜː': ['ɚ'], 'ɜ': ['ɚ'], 'ɐ': ['ə'], 'ɪə': ['ɪ', 'ə'], 'iə': ['ɪ', 'ə'],
       'ɛə': ['ɛ', 'ə'], 'eə': ['ɛ', 'ə'], 'ʊə': ['ʊ', 'ə'], 'dʒ': ['d͡ʒ'], 'tʃ': ['t͡ʃ'],
       'g': ['ɡ'], 'r': ['ɹ'], 'a': ['æ'], 'e': ['ɛ'], 'ɾ': ['t'], 'ɨ': ['ɪ'], 'ᵻ': ['ɪ']}
TOKENS = sorted(set(IPA) | VOWELS | set(ARP.values()) | {'ˈ', 'ˌ', 'ː'}, key=len, reverse=True)


def arp_variant(phones):
    return [[('ə' if p == 'AH0' else ARP[re.sub(r'\d', '', p)]), int(p[-1]) if p[-1].isdigit() else None] for p in phones]


def ipa_variant(text, display=False):
    out, stress = [], 0
    text = text.replace('͡', '').replace('̩', '')
    while text:
        if text[0].isspace() or text[0] in '.,;:!?-':
            text = text[1:]
            continue
        token = next((t for t in TOKENS if text.startswith(t)), None)
        if token is None:
            raise ValueError('Unsupported IPA: ' + text)
        text = text[len(token):]
        if token in ('ˈ', 'ˌ'):
            stress = 1 if token == 'ˈ' else 2
            continue
        if token == 'ː':
            continue
        if display:
            is_vowel = IPA.get(token, [token])[0] in VOWELS
            out.append([token, stress if is_vowel else None])
            if is_vowel:
                stress = 0
            continue
        for phone in IPA.get(token, [token]):
            out.append([phone, stress if phone in VOWELS else None])
            if phone in VOWELS:
                stress = 0
    return out


def display_ipa(phones):
    vowel_indices = [i for i, (_, stress) in enumerate(phones) if stress is not None]
    onsets = set('pl pr tr kl kr bl br dr fl fr gr gl sp st sk sm sn sw tw kw θr ʃr pj bj kj fj mj hj vj dj tj nj lj sl spl spr str skr skw'.split())
    boundaries = [0]
    for a, b in zip(vowel_indices, vowel_indices[1:]):
        start = b
        for j in range(a + 1, b):
            onset = ''.join(p for p, _ in phones[j:b]).replace('ɹ', 'r').replace('ɡ', 'g')
            if b - j == 1 or onset in onsets:
                start = j
                break
        boundaries.append(start)
    parts = []
    for i, start in enumerate(boundaries):
        syllable = phones[start:boundaries[i + 1] if i + 1 < len(boundaries) else len(phones)]
        stress = 'ˈ' if any(s == 1 for _, s in syllable) else 'ˌ' if any(s == 2 for _, s in syllable) else ''
        parts.append((stress if len(vowel_indices) > 1 else '') + ''.join(p for p, _ in syllable))
    return '/' + ''.join(parts).replace('͡', '').replace('ɹ', 'r') + '/'


def main():
    cmu = cmudict.dict()
    brit = {}
    for line in (CONTENT / 'sources/britfone.csv').read_text(encoding='utf-8').splitlines():
        word, _, phones = line.partition(',')
        brit.setdefault(re.sub(r'\(\d+\)$', '', word).lower().replace('_', ' '), []).append(phones.strip())
    engine = EspeakPhonemizer()
    overrides = read_json(CONTENT / 'overrides.json')
    words = read_json(ROOT / '.cache-content/draft.json')
    outputs, meta = {'us': {}, 'gb': {}}, {}
    for w in words:
        word = spoken_word(w['w'])
        parts = re.split(r'[ -]+', word.lower())
        meta[w['id']] = {'ipa': {}}
        for accent in outputs:
            source = 'espeak-ng (Piper 1.4.2)'
            override = overrides.get(normalize(word), {}).get('pronunciation', {}).get(accent)
            if override:
                transcription = override['ipa'].strip('/')
                variants = [ipa_variant(transcription)]
                display = ipa_variant(transcription, display=True)
                source = override['source']
            elif accent == 'us' and all(p in cmu for p in parts) and word != 'IT':
                choices = [cmu[p][:2] for p in parts]
                variants = [arp_variant(sum(v, [])) for v in itertools.islice(itertools.product(*choices), 3)]
                source = 'CMUdict 1.1.3'
                display = [[{'i': 'iː', 'u': 'uː'}.get(p, p), s] for p, s in variants[0]]
            elif accent == 'gb' and all(p in brit for p in parts) and word != 'IT':
                choices = [brit[p][:2] for p in parts]
                variants = [ipa_variant(' '.join(v)) for v in itertools.islice(itertools.product(*choices), 3)]
                source = 'Britfone 3.0.1'
                display = ipa_variant(' '.join(c[0] for c in choices), display=True)
            else:
                phones = ''.join(sum(engine.phonemize('en' if accent == 'gb' else 'en-us', word), []))
                variants = [ipa_variant(phones)]
                display = ipa_variant(phones, display=True)
            if not variants or not all(v for v in variants):
                raise ValueError('Empty pronunciation for ' + word)
            outputs[accent][w['id']] = variants
            meta[w['id']][accent] = source
            meta[w['id']]['ipa'][accent] = w['ipa'] if accent == 'gb' and w['id'].startswith('p1-') else display_ipa(display)
    for accent, file in [('us', 'pron.json'), ('gb', 'pron-uk.json')]:
        path = ROOT / 'data' / file
        # Legacy variants were already used to score learners; do not change those references.
        legacy = {k: v for k, v in read_json(path).items() if k.startswith('p1-')}
        outputs[accent].update(legacy)
        for wid in legacy:
            meta[wid][accent] = 'legacy-' + ('CMUdict' if accent == 'us' else 'Britfone')
        path.write_text(json.dumps(outputs[accent], ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    write_json(ROOT / 'data/pron-sources.json', meta)
    write_json(ROOT / 'docs/audits/pronunciations-2026-10-26.json', {accent: {
        'entries': len(outputs[accent]), 'g2p': sum(m[accent].startswith('espeak') for m in meta.values())
    } for accent in outputs})


if __name__ == '__main__':
    main()
