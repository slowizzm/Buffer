export const ACCOUNT_IDS = Object.freeze(['personal', 'warp']);
export const MEDIA_TYPES = Object.freeze(['image', 'video']);

export function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function assertAccountId(value) {
  if (!ACCOUNT_IDS.includes(value)) {
    throw new Error(`Unknown account: ${String(value)}`);
  }
  return value;
}

export function assertMediaType(value) {
  if (!MEDIA_TYPES.includes(value)) {
    throw new Error(`Unsupported media type: ${String(value)}. Expected image or video.`);
  }
  return value;
}
