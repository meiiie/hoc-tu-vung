"""Reconcile list records, learning entries and the user's PDF without equating their units."""
import collections
import json
import re
from pathlib import Path
from build import aliases, normalize
from study_order import read_words

ROOT = Path(__file__).resolve().parents[2]


def pdf_aliases(headword):
    return [normalize(re.sub(r'[123¹²³]', '', a).replace('’', "'")) for a in aliases(headword)]


def audit():
    reference = json.loads((ROOT/'content/sources/oxford-20261026.json').read_text(encoding='utf-8'))
    supplement = json.loads((ROOT/'content/sources/oxford3000-pdf-additions-20261026.json').read_text(encoding='utf-8'))
    pdf = json.loads((ROOT/'content/sources/oxford3000-pdf-20200706.json').read_text(encoding='utf-8'))
    words = read_words()
    index = collections.defaultdict(list)
    for w in words:
        for a in aliases(w['w']):
            index[a].append(w['id'])
    labels = {normalize(r['word']) for r in reference}
    added_labels = {normalize(r['word']) for r in supplement['references']}
    mappings = []
    for row in pdf['entries']:
        names = pdf_aliases(row['headword'])
        mappings.append({**row,'aliases':names,'learningIds':sorted({id for a in names for id in index.get(a,[])})})
    pdf_names = {a for row in mappings for a in row['aliases']}
    grouped = collections.defaultdict(list)
    for row in mappings:
        grouped[tuple(row['aliases'])].append(row['headword'])
    return {
        'snapshot':'2026-10-26', 'scope':'surface-form coverage, not proof of every sense or equivalence between editions',
        'library':{'learningEntries':len(words),'canonicalForms':len(index)},
        'online':{'referenceRows':len(reference),'canonicalForms':len(labels),
                  'learningEntries':len({id for a in labels for id in index.get(a,[])}),'missingForms':sorted(labels-set(index)),
                  'unmappedReferences':sum(not index.get(normalize(r['word'])) for r in reference)},
        'pdfAdditions':{'source':supplement['source'],'referenceRows':len(supplement['references']),
                        'canonicalForms':len(added_labels),'words':sorted(added_labels),
                        'missingForms':sorted(added_labels-set(index))},
        'countExplanation':{'combinedArticle':['a','an'],
                            'separateLegacyHomographs':{k:v for k,v in index.items() if len(v)>1},
                            'formula':'4960 web forms + 10 PDF additions - 1 combined a/an entry + 2 extra bank/bear entries = 4971 learning entries'},
        'userPdf':{'sha256':pdf['sha256'],'entries':len(mappings),'canonicalForms':len(pdf_names),
                   'matchedEntryRows':sum(bool(r['learningIds']) for r in mappings),
                   'missingForms':sorted(pdf_names-set(index)),
                   'homographGroups':[v for v in grouped.values() if len(v)>1],
                   'mapping':mappings},
        'comparisonNotes':'PDF creation metadata is 2020-07-06. The web snapshot and PDF additions remain separate sources. All PDF rows now map by surface form; this does not prove coverage of every sense. Do not pad to 5000 or count reverse cards as new words.'
    }


if __name__ == '__main__':
    result = audit()
    (ROOT/'docs/audits/oxford-counts-2026-10-26.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
    print(json.dumps({'online':result['online'],'pdf':{k:v for k,v in result['userPdf'].items() if k not in ['mapping','homographGroups']}},ensure_ascii=False))
