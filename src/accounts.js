import { ACCOUNT_IDS, assertAccountId } from './contracts.js';

const ACCOUNT_CONFIG = Object.freeze({
  personal: {
    id: 'personal',
    label: 'Personal',
    envVar: 'BUFFER_PERSONAL_API_KEY',
  },
  warp: {
    id: 'warp',
    label: 'Warp the Surface',
    envVar: 'BUFFER_WARP_API_KEY',
  },
});

export function getAccount(accountId) {
  assertAccountId(accountId);
  const config = ACCOUNT_CONFIG[accountId];
  const apiKey = process.env[config.envVar]?.trim();

  if (!apiKey) {
    throw new Error(`Missing ${config.envVar} for ${config.label}.`);
  }

  return { ...config, apiKey };
}

export function getConfiguredAccounts() {
  return ACCOUNT_IDS
    .filter((accountId) => Boolean(process.env[ACCOUNT_CONFIG[accountId].envVar]?.trim()))
    .map((accountId) => getAccount(accountId));
}
