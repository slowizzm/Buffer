const BASE_LIMITS = Object.freeze({
  facebook: 5000,
  instagram: 2196,
  twitter: 280,
  x: 280,
  linkedin: 3000,
  pinterest: 500,
  tiktok: 4000,
  threads: 500,
  bluesky: 300,
  youtube: 5000,
  googlebusiness: 4000,
  mastodon: 500,
});

const SERVICE_ALIASES = Object.freeze({
  google_business: 'googlebusiness',
  googlebusinessprofile: 'googlebusiness',
  twitterprofile: 'twitter',
});

export function normalizeService(service) {
  const raw = String(service ?? '').toLowerCase().replace(/[\s-]/gu, '');
  return SERVICE_ALIASES[raw] ?? raw;
}

function hasVideo(message) {
  return message.media.some((item) => item.type === 'video');
}

export function getChannelLimit(channel, message) {
  const service = normalizeService(channel.service);

  if (service === 'mastodon') {
    const dynamic = Number(channel.metadata?.maxCharacters);
    return Number.isFinite(dynamic) && dynamic > 0 ? Math.min(dynamic, 20000) : BASE_LIMITS.mastodon;
  }

  if (service === 'tiktok' && hasVideo(message)) return 2200;

  const limit = BASE_LIMITS[service];
  if (!limit) {
    throw new Error(`No local character-limit rule for Buffer service: ${channel.service}`);
  }

  return limit;
}

function graphemeLength(text) {
  const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
  return Array.from(segmenter.segment(text)).length;
}

export function countForChannel(text, channel) {
  const service = normalizeService(channel.service);

  // Buffer documents grapheme counting for Bluesky. For other supported
  // networks JavaScript string.length is a conservative UTF-16 preflight.
  return service === 'bluesky' ? graphemeLength(text) : text.length;
}

export function validateMessageForChannels(message, channels) {
  if (!Array.isArray(channels) || channels.length === 0) {
    throw new Error('No publishable Buffer channels were found for this account.');
  }

  const evaluations = channels.map((channel) => {
    const limit = getChannelLimit(channel, message);
    const count = countForChannel(message.text, channel);
    return {
      channelId: channel.id,
      channelName: channel.name,
      service: normalizeService(channel.service),
      count,
      limit,
      remaining: limit - count,
      ok: count <= limit,
    };
  });

  const failures = evaluations.filter((item) => !item.ok);
  const strictest = [...evaluations].sort((a, b) => a.limit - b.limit)[0];

  return {
    ok: failures.length === 0,
    strictest,
    evaluations,
    failures,
  };
}
