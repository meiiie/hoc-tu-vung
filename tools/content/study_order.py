"""Compile a full-library suggestion order with no CEFR gates or lesson boundaries."""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'content/sources/learning-order-v2.json'


def read_words():
    pages = json.loads((ROOT / 'data/pages.json').read_text(encoding='utf-8'))['pages']
    return [w for p in pages for w in json.loads((ROOT / p['file']).read_text(encoding='utf-8'))]


def compile_order(words):
    source = json.loads(SOURCE.read_text(encoding='utf-8'))
    rows = source['order']
    ids = {w['id'] for w in words}
    if len(words) != len(ids) or len(rows) != len(ids) or {r['id'] for r in rows} != ids:
        raise ValueError('Suggestion source must cover every word ID exactly once')
    rows = sorted(rows, key=lambda r:(-r['zipf'], r['word'].casefold(), r['id']))
    return {'version':2, 'sourceSha256':hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
            'attribution':{**source['attribution'], 'changes':'Selected entries sorted globally by written frequency; CEFR fields are not used in selection.'}, 'ordering':'global-written-frequency; no CEFR prerequisite',
            'entries':len(ids), 'wordIds':[r['id'] for r in rows]}


if __name__ == '__main__':
    result = compile_order(read_words())
    (ROOT / 'data/study-order.json').write_text(json.dumps(result,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf-8',newline='\n')
    print(json.dumps({'entries':result['entries'],'version':result['version']}))
