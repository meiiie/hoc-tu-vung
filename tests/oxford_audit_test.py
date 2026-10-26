"""Reconcile a frozen web snapshot plus separately attributed PDF additions."""
import json
from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT/'tools/content'))
from audit_oxford import audit, pdf_aliases


class OxfordAuditTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.report = audit()

    def test_online_surface_coverage_and_card_count(self):
        online = self.report['online']
        self.assertEqual(online, dict(referenceRows=5975,canonicalForms=4960,
                         learningEntries=4961,missingForms=[],unmappedReferences=0))
        extra = self.report['countExplanation']['separateLegacyHomographs']
        self.assertEqual(set(extra), {'bank','bear'})
        self.assertEqual(online['canonicalForms']+self.report['pdfAdditions']['canonicalForms']-1+sum(len(ids)-1 for ids in extra.values()),
                         self.report['library']['learningEntries'])
        self.assertEqual(self.report['library'],{'learningEntries':4971,'canonicalForms':4970})

    def test_pdf_surface_forms_are_covered_without_rewriting_web_snapshot(self):
        pdf = self.report['userPdf']
        self.assertEqual(pdf['entries'], 3000)
        self.assertEqual(pdf['canonicalForms'], 2980)
        self.assertEqual(pdf['matchedEntryRows'], 3000)
        self.assertEqual(pdf['missingForms'], [])
        self.assertEqual(self.report['pdfAdditions']['words'], ['blank','cd','chairman','disc','dvd',
                                                            'gentleman','policeman','sculpture','stiff','tape'])
        self.assertEqual(len(pdf['homographGroups']), 21)

    def test_normalization_keeps_surface_and_entry_units_distinct(self):
        self.assertEqual(pdf_aliases('a, an'), ['a','an'])
        self.assertEqual(pdf_aliases('bank (money)'), ['bank'])
        self.assertEqual(pdf_aliases('can¹'), ['can'])

    def test_saved_report_matches_recomputation(self):
        saved = json.loads((ROOT/'docs/audits/oxford-counts-2026-10-26.json').read_text(encoding='utf-8'))
        self.assertEqual(saved, self.report)


if __name__ == '__main__':
    unittest.main()
