import importlib.util
import pathlib
import tempfile
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('content_build', ROOT / 'tools/content/build.py')
build = importlib.util.module_from_spec(spec)
spec.loader.exec_module(build)


class ContentTests(unittest.TestCase):
    def test_months_do_not_share_identity_with_verbs_or_adjectives(self):
        self.assertNotEqual(build.normalize('IT'), build.normalize('it'))
        self.assertNotEqual(build.normalize('May'), build.normalize('may'))
        self.assertNotEqual(build.normalize('March'), build.normalize('march'))
        self.assertNotEqual(build.normalize('August'), build.normalize('august'))

    def test_same_spelling_different_parts_of_speech_keep_their_senses(self):
        rows = [
            {'word': 'book', 'pos': 'noun', 'senses': [{'glosses': ['Sách.']}]},
            {'word': 'book', 'pos': 'verb', 'senses': [{'glosses': ['Đặt trước.']}]},
        ]
        senses = build.senses_for(rows, {})
        self.assertEqual([(x['pos'], x['vi']) for x in senses], [('noun', 'Sách.'), ('verb', 'Đặt trước.')])

    def test_blocked_source_error_cannot_become_a_meaning(self):
        rows = [{'word': 'abandon', 'pos': 'verb', 'senses': [
            {'glosses': ['Bộm (nhiếp ảnh)']}, {'glosses': ['Từ bỏ.']},
        ]}]
        result = build.senses_for(rows, {'reject': ['Bộm (nhiếp ảnh)']})
        self.assertEqual([s['vi'] for s in result], ['Từ bỏ.'])

    def test_cloze_requires_an_explicit_whole_word_and_correct_offsets(self):
        self.assertIsNone(build.cloze_target('be', 'The beer is cold.', []))
        self.assertEqual(build.cloze_target('become', 'She became a doctor.', ['became']), {'text': 'became', 'start': 4, 'end': 10})

    def test_missing_translations_are_rejected(self):
        with self.assertRaisesRegex(ValueError, 'Vietnamese'):
            build.validate_word({'id': 'p2-001', 'w': 'test', 'vi': '', 'ex': '', 'exvi': '', 'meanings': [], 'cefr': ['A1']})

    def test_existing_ids_are_never_renumbered(self):
        legacy = [{'id': 'p1-003', 'w': 'ability'}, {'id': 'p1-001', 'w': 'a, an'}]
        ids = build.allocate_ids(['a', 'ability', 'an', 'zebra'], legacy, {})
        self.assertEqual(ids['ability'], 'p1-003')
        self.assertEqual(ids['an'], 'p1-001')
        self.assertEqual(ids['zebra'], 'p2-001')
        expanded = build.allocate_ids(['a', 'ability', 'an', 'new', 'zebra'], legacy, ids)
        self.assertEqual(expanded['zebra'], ids['zebra'])
        self.assertNotEqual(expanded['new'], ids['zebra'])

    def test_audio_identity_changes_when_text_or_voice_changes(self):
        key = build.audio_key('access', 'gb', 'v1')
        self.assertNotEqual(key, build.audio_key('access the file', 'gb', 'v1'))
        self.assertNotEqual(key, build.audio_key('access', 'us', 'v1'))

    def test_snapshot_has_exact_reference_coverage_and_preserves_legacy_ids(self):
        words, issues = build.compile_words()
        self.assertEqual(issues, [])
        reference = build.reference_rows()
        self.assertEqual({a for w in words for a in build.aliases(w['w'])}, {build.normalize(r['word']) for r in reference})
        self.assertEqual(len(words), len({w['id'] for w in words}))
        old = build.read_json(build.CONTENT / 'legacy-p1.json')
        current = {w['id']: w for w in words}
        for w in old:
            self.assertEqual(current[w['id']]['w'], w['w'])
        for w in words:
            build.validate_word(w)
            self.assertFalse(w['contentReview']['humanReviewed'])

    def test_pdf_additions_keep_their_reference_levels_spelling_and_editorial_examples(self):
        words, issues = build.compile_words()
        self.assertEqual(issues, [])
        index = {w['w']:w for w in words}
        expected={'blank':'A2','CD':'A1','chairman':'B2','disc':'B2','DVD':'A1',
                  'gentleman':'B1','policeman':'A1','sculpture':'B1','stiff':'B2','tape':'B1'}
        for label,level in expected.items():
            w=index[label]
            self.assertEqual(w['cefr'],[level])
            self.assertTrue(all(r.get('source')=='oxford3000-pdf-20200706' for r in w['references']))
            self.assertEqual(w['cloze']['text'],label)
            self.assertEqual(w['contentReview']['example'],'ai-edited')
            self.assertTrue(w['vi'] and w['exvi'])
        self.assertFalse(any('dissociated' in m['vi'] for m in index['DVD']['meanings']))
        self.assertFalse(any('Nhà vệ sinh' in m['vi'] for m in index['gentleman']['meanings']))

    def test_projection_keeps_language_and_rejects_vietnamese_homographs(self):
        import json
        rows = [json.loads(s) for s in (build.CONTENT / 'sources/viwiktionary-20261002.jsonl').read_text(encoding='utf-8').splitlines()]
        self.assertTrue(all(r['lang_code'] == 'en' for r in rows))
        words, _ = build.compile_words()
        may = next(w for w in words if w['w'] == 'may')
        self.assertFalse(any('máy khâu' in m['vi'] for m in may['meanings']))
        who = next(w for w in words if w['w'] == 'who')
        self.assertFalse(any('Tổ chức Y tế' in m['vi'] for m in who['meanings']))

    def test_article_does_not_import_unrelated_parts_of_speech(self):
        words, _ = build.compile_words()
        article = next(w for w in words if w['id'] == 'p1-001')
        self.assertTrue(all(m['pos'] in {'article', 'det'} for m in article['meanings']))
        self.assertEqual(next(w for w in words if w['w'] == 'eight')['vi'], 'Tám.')


if __name__ == '__main__':
    unittest.main()
