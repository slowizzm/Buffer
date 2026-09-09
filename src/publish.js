import { getAccount } from './accounts.js';
import { validateMessageForChannels } from './constraints.js';
import { normalizePublishInput } from './normalize.js';
import { discoverBufferChannels } from './buffer/discover.js';
import { createBufferPost } from './buffer/publish.js';

function publicChannel(channel) {
  return {
    id: channel.id,
    name: channel.name,
    service: channel.service,
    organizationName: channel.organizationName,
  };
}

export async function inspectAccountChannels(accountId) {
  const account = getAccount(accountId);
  const channels = await discoverBufferChannels(account.apiKey);
  return {
    account: account.id,
    label: account.label,
    channels: channels.map(publicChannel),
  };
}

export async function publishSocial(input, { dryRun = false } = {}) {
  const normalized = normalizePublishInput(input);

  const prepared = await Promise.all(
    normalized.map(async ({ account: accountId, message }) => {
      const account = getAccount(accountId);
      const channels = await discoverBufferChannels(account.apiKey);
      const validation = validateMessageForChannels(message, channels);
      return { account, message, channels, validation };
    }),
  );

  const invalid = prepared.filter((item) => !item.validation.ok);
  if (invalid.length > 0) {
    const details = invalid.map((item) => ({
      account: item.account.id,
      failures: item.validation.failures,
    }));
    const error = new Error('Publish blocked: one or more messages exceed a destination character limit.');
    error.name = 'PublishValidationError';
    error.details = details;
    throw error;
  }

  if (dryRun) {
    return {
      dryRun: true,
      targets: prepared.map((item) => ({
        account: item.account.id,
        label: item.account.label,
        text: item.message.text,
        media: item.message.media,
        strictest: item.validation.strictest,
        channels: item.validation.evaluations,
      })),
    };
  }

  const results = [];

  for (const item of prepared) {
    const accountResult = {
      account: item.account.id,
      label: item.account.label,
      results: [],
    };

    for (const channel of item.channels) {
      try {
        const post = await createBufferPost(
          item.account.apiKey,
          channel.id,
          item.message,
        );
        accountResult.results.push({
          channel: publicChannel(channel),
          ok: true,
          post,
        });
      } catch (error) {
        accountResult.results.push({
          channel: publicChannel(channel),
          ok: false,
          error: error.message,
        });
      }
    }

    results.push(accountResult);
  }

  return { dryRun: false, targets: results };
}
