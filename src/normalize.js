import { ACCOUNT_IDS, assertMediaType, isPlainObject } from './contracts.js';

function normalizeMediaItem(item) {
  if (!isPlainObject(item)) {
    throw new Error('Each media item must be an object with type and url.');
  }

  const type = assertMediaType(item.type);
  const url = String(item.url ?? '').trim();
  if (!url) throw new Error('Each media item requires a url.');

  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`Invalid media URL: ${url}`);
  }

  if (parsed.protocol !== 'https:') {
    throw new Error(`Media URL must use HTTPS: ${url}`);
  }

  return {
    type,
    url: parsed.toString(),
    ...(item.alt ? { alt: String(item.alt) } : {}),
  };
}

export function normalizeMessage(value) {
  if (typeof value === 'string') {
    return { text: value, media: [] };
  }

  if (!isPlainObject(value)) {
    throw new Error('Message must be a string or an object with text/media.');
  }

  const text = value.text == null ? '' : String(value.text);
  const media = value.media == null ? [] : value.media;

  if (!Array.isArray(media)) {
    throw new Error('message.media must be an array.');
  }

  const normalizedMedia = media.map(normalizeMediaItem);
  if (!text && normalizedMedia.length === 0) {
    throw new Error('Message must contain text or at least one media item.');
  }

  return { text, media: normalizedMedia };
}

export function normalizePublishInput(input) {
  if (!isPlainObject(input)) {
    throw new Error('Publish input must be a JSON object.');
  }

  const recognized = ['all', 'personal', 'warp', 'split'].filter((key) => input[key] !== undefined);
  if (recognized.length !== 1) {
    throw new Error('Use exactly one top-level intent: all, personal, warp, or split.');
  }

  const intent = recognized[0];

  if (intent === 'all') {
    const message = normalizeMessage(input.all);
    return ACCOUNT_IDS.map((account) => ({ account, message }));
  }

  if (intent === 'personal' || intent === 'warp') {
    return [{ account: intent, message: normalizeMessage(input[intent]) }];
  }

  if (!isPlainObject(input.split)) {
    throw new Error('split must be an object containing personal and warp messages.');
  }

  if (input.split.personal === undefined || input.split.warp === undefined) {
    throw new Error('split requires both personal and warp messages.');
  }

  return ACCOUNT_IDS.map((account) => ({
    account,
    message: normalizeMessage(input.split[account]),
  }));
}
