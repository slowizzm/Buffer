import test from 'node:test';
import assert from 'node:assert/strict';
import { getChannelLimit, validateMessageForChannels } from '../src/constraints.js';

const textMessage = (text) => ({ text, media: [] });

test('shared copy is blocked by the strictest selected destination', () => {
  const channels = [
    { id: 'x1', name: 'X', service: 'twitter' },
    { id: 'li1', name: 'LinkedIn', service: 'linkedin' },
  ];

  const result = validateMessageForChannels(textMessage('a'.repeat(281)), channels);
  assert.equal(result.ok, false);
  assert.equal(result.strictest.limit, 280);
  assert.equal(result.failures[0].service, 'twitter');
});

test('TikTok video posts use the lower video text limit', () => {
  const channel = { id: 'tt1', name: 'TikTok', service: 'tiktok' };
  const message = {
    text: 'hello',
    media: [{ type: 'video', url: 'https://example.com/video.mp4' }],
  };

  assert.equal(getChannelLimit(channel, message), 2200);
});

test('Mastodon uses the connected server maxCharacters when provided', () => {
  const channel = {
    id: 'm1',
    name: 'Mastodon',
    service: 'mastodon',
    metadata: { __typename: 'MastodonMetadata', maxCharacters: 1234 },
  };

  assert.equal(getChannelLimit(channel, textMessage('hello')), 1234);
});

test('Bluesky counts graphemes for local preflight', () => {
  const channel = { id: 'b1', name: 'Bluesky', service: 'bluesky' };
  const message = textMessage('🚀'.repeat(300));
  const result = validateMessageForChannels(message, [channel]);
  assert.equal(result.ok, true);
  assert.equal(result.evaluations[0].count, 300);
});
