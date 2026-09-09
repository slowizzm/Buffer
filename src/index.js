import { stdin as input } from 'node:process';
import { getConfiguredAccounts } from './accounts.js';
import { loadEnvFile } from './env.js';
import { inspectAccountChannels, publishSocial } from './publish.js';

await loadEnvFile();

function print(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

async function readStdin() {
  if (input.isTTY) return '';
  const chunks = [];
  for await (const chunk of input) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8').trim();
}

async function readPublishInput(args) {
  const inline = args.find((arg) => !arg.startsWith('--'));
  const raw = inline ?? await readStdin();
  if (!raw) {
    throw new Error('Provide publish JSON as an argument or via stdin.');
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`Invalid JSON input: ${error.message}`);
  }
}

async function main() {
  const [command = 'help', ...args] = process.argv.slice(2);

  if (command === 'publish') {
    const dryRun = args.includes('--dry-run');
    const payload = await readPublishInput(args);
    print(await publishSocial(payload, { dryRun }));
    return;
  }

  if (command === 'channels') {
    const accounts = getConfiguredAccounts();
    if (accounts.length === 0) {
      throw new Error('No Buffer API keys are configured.');
    }

    const results = [];
    for (const account of accounts) {
      results.push(await inspectAccountChannels(account.id));
    }
    print(results);
    return;
  }

  print({
    usage: [
      "npm run dry-run -- '{\"all\":\"Hello\"}'",
      "npm run publish -- '{\"warp\":\"Hello\"}'",
      'npm run channels',
      'npm test',
    ],
  });
}

try {
  await main();
} catch (error) {
  process.stderr.write(`${error.name}: ${error.message}\n`);
  if (error.details) process.stderr.write(`${JSON.stringify(error.details, null, 2)}\n`);
  process.exitCode = 1;
}
