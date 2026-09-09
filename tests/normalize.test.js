import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizePublishInput } from '../src/normalize.js';

test('all routes the same normalized message to both accounts', () => {
  const result = normalizePublishInput({ all: 'Hello' });
  assert.deepEqual(result.map((item) => item.account), ['personal', 'warp']);
  assert.equal(result[0].message.text, 'Hello');
  assert.equal(result[1].message.text, 'Hello');
});

test('split preserves account-specific messages', () => {
  const result = normalizePublishInput({
    split: {
      personal: 'Personal copy',
      warp: 'Warp copy',
    },
  });

  assert.equal(result[0].message.text, 'Personal copy');
  assert.equal(result[1].message.text, 'Warp copy');
});

test('structured messages accept HTTPS image/video media', () => {
  const [result] = normalizePublishInput({
    warp: {
      text: 'Media post',
      media: [
        { type: 'image', url: 'https://example.com/a.jpg', alt: 'Example image' },
        { type: 'video', url: 'https://example.com/a.mp4' },
      ],
    },
  });

  assert.equal(result.message.media.length, 2);
  assert.equal(result.message.media[0].type, 'image');
  assert.equal(result.message.media[0].alt, 'Example image');
});

test('ambiguous top-level intents are rejected', () => {
  assert.throws(
    () => normalizePublishInput({ personal: 'A', warp: 'B' }),
    /exactly one top-level intent/u,
  );
});

test('non-HTTPS media is rejected', () => {
  assert.throws(
    () => normalizePublishInput({
      personal: {
        text: 'Nope',
        media: [{ type: 'image', url: 'http://example.com/a.jpg' }],
      },
    }),
    /must use HTTPS/u,
  );
});
