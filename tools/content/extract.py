"""Project only English entries from a pinned Kaikki Vietnamese Wiktionary dump."""
import argparse
import gzip
import hashlib
import json
from pathlib import Path

from build import CONTENT, ROOT, normalize, read_json, write_json


def project(row, headwords):
    if row.get('lang_code') != 'en' or normalize(row.get('word', '')) not in headwords:
        return None
    return {k: row[k] for k in ('word', 'lang_code', 'pos', 'pos_title', 'senses', 'forms', 'sounds') if k in row}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('dump', type=Path)
    args = parser.parse_args()
    digest = hashlib.sha256(args.dump.read_bytes()).hexdigest()
    audit = ROOT / 'docs/audits/source-extraction.json'
    if audit.exists() and read_json(audit)['dumpSha256'] != digest:
        raise SystemExit('Dump checksum differs from the pinned 2026-10-02 snapshot')
    headwords = {normalize(r['word']) for r in read_json(CONTENT / 'sources/oxford-20261026.json')}
    dest = CONTENT / 'sources/viwiktionary-20261002.jsonl'
    count = 0
    with gzip.open(args.dump, 'rt', encoding='utf-8') as source, dest.with_suffix('.tmp').open('w', encoding='utf-8', newline='\n') as out:
        for line in source:
            row = project(json.loads(line), headwords)
            if row:
                out.write(json.dumps(row, ensure_ascii=False, separators=(',', ':')) + '\n')
                count += 1
    dest.with_suffix('.tmp').replace(dest)
    write_json(ROOT / 'docs/audits/source-extraction.json', {
        'source': 'https://kaikki.org/viwiktionary/rawdata.html', 'dumpDate': '2026-10-02',
        'dumpSha256': digest,
        'projectionSha256': hashlib.sha256(dest.read_bytes()).hexdigest(), 'englishEntries': count,
        'filter': 'lang_code == en, then Oxford snapshot headword membership',
    })
    print(count)


if __name__ == '__main__':
    main()
