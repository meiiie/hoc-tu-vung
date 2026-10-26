'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const Content = require('../content.js');

test('audio uses versioned assets and rejects paths outside audio', () => {
  const w = { audio: { gb: { w: 'audio/generated/gb/012345678901234567890123.mp3' } } };
  assert.equal(Content.audioURL(w, 'w', 'gb'), w.audio.gb.w);
  w.audio.gb.w = '../private.mp3';
  assert.throws(() => Content.audioURL(w, 'w', 'gb'));
});

test('cloze blanks exactly the declared surface form', () => {
  assert.deepEqual(Content.cloze({ ex: 'She became a doctor.', cloze: { start: 4, end: 10, text: 'became' } }),
    { before: 'She ', ans: 'became', after: ' a doctor.' });
  assert.equal(Content.cloze({ w: 'be', ex: 'Cold beer.' }), null);
  assert.equal(Content.cloze({ ex: 'Cold beer.', cloze: { start: 5, end: 8, text: 'be' } }), null);
});

test('offline download reports failures, then resumes without fetching saved files', async () => {
  const w = { page: 'p1', num: '001' }, saved = new Map();
  const cache = { match: async u => saved.get(u), put: async (u, r) => saved.set(u, r) };
  const first = await Content.downloadAudio([w, w], 'gb', cache, null,
    async u => new Response('audio', { status: u.includes('/ex/') ? 503 : 200 }));
  assert.equal(first.total, 2);
  assert.equal(first.saved, 1);
  assert.equal(first.failed.length, 1);
  let requests = 0;
  const resumed = await Content.downloadAudio([w], 'gb', cache, null,
    async () => { requests++; return new Response('audio'); });
  assert.equal(requests, 1);
  assert.equal(resumed.saved, 2);
  assert.deepEqual(resumed.failed, []);
});
