"""Coverage, reproducibility and absence of proficiency gates in suggestions."""
import copy
import json
from pathlib import Path
import sys
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT/'tools/content'))
import study_order


class StudyOrderTests(unittest.TestCase):
    def test_every_word_remains_reachable_once(self):
        words = study_order.read_words()
        ids = study_order.compile_order(words)['wordIds']
        self.assertEqual(len(ids), 4971)
        self.assertEqual(set(ids), {w['id'] for w in words})
        self.assertEqual(len(ids), len(set(ids)))

    def test_reproducible_release(self):
        actual = json.loads((ROOT/'data/study-order.json').read_text(encoding='utf-8'))
        self.assertEqual(actual, study_order.compile_order(study_order.read_words()))
        self.assertEqual(actual['attribution']['dataLicense'], 'CC-BY-SA-4.0')

    def test_levels_do_not_gate_or_reorder_words(self):
        words = study_order.read_words()
        expected = study_order.compile_order(words)['wordIds']
        source = json.loads(study_order.SOURCE.read_text(encoding='utf-8'))
        for row in source['order']:
            row['level'] = 'C1' if row['level'] == 'A1' else 'A1'
        changed = copy.deepcopy(words)
        for word in changed:
            word['cefr'] = ['C1']
        with patch.object(Path, 'read_text', return_value=json.dumps(source)):
            self.assertEqual(study_order.compile_order(changed)['wordIds'], expected)

    def test_missing_added_and_duplicate_ids_block_release(self):
        words = study_order.read_words()
        for invalid in [words[:-1], words+[dict(words[0],id='future-word')], words+[words[0]]]:
            with self.assertRaises(ValueError):
                study_order.compile_order(invalid)


if __name__ == '__main__':
    unittest.main()
