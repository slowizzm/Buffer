# Buffer

A small, agent-friendly social publishing layer for routing personal and **Warp the Surface** content through separate Buffer accounts.

The repository is intentionally organized around a single orchestration source: [`AGENTS.md`](./AGENTS.md). Agent behavior belongs there; this README documents the software and usage only.

## What it does

- Routes a post to `personal`, `warp`, or both accounts.
- Accepts plain text or text with image/video media URLs.
- Discovers the live Buffer channels attached to each account.
- Preflights every message against the strictest character limit among its destination channels.
- Publishes one Buffer `createPost` mutation per destination channel.
- Keeps personal and Warp credentials isolated.
- Supports a dry run before any post is created.

## Requirements

- Node.js 20+.
- A Buffer API key for each Buffer account you want to use.
- Media must be available at a public, direct, stable HTTPS URL. Buffer's API does not provide a file-upload endpoint.

## Setup

```bash
cp .env.example .env
```

Set the keys in your shell or preferred secret manager:

```bash
export BUFFER_PERSONAL_API_KEY="..."
export BUFFER_WARP_API_KEY="..."
```

Never commit real API keys.

## Input

The CLI accepts JSON from the first argument or stdin. The convenient forms are:

```json
{"personal":"Personal message"}
```

```json
{"warp":"Warp the Surface message"}
```

```json
{"all":"Same message to both identities"}
```

```json
{
  "split": {
    "personal": "Personal wording",
    "warp": "Warp wording"
  }
}
```

A message may also contain media:

```json
{
  "warp": {
    "text": "New work from Warp the Surface.",
    "media": [
      {"type":"image","url":"https://example.com/image.jpg"},
      {"type":"video","url":"https://example.com/demo.mp4"}
    ]
  }
}
```

## Commands

Preview target accounts, channels, character limits, and media without publishing:

```bash
npm run dry-run -- '{"all":"Hello world"}'
```

Publish to the next available Buffer queue slot:

```bash
npm run publish -- '{"warp":"Hello from Warp the Surface"}'
```

Inspect the connected channels for configured accounts:

```bash
npm run channels
```

Run tests:

```bash
npm test
```

## Character-limit policy

The runtime checks each selected destination independently and blocks the entire publish operation before making any write if a message exceeds any destination's limit. It does **not** silently truncate copy. An agent can then shorten the message deliberately while preserving meaning.

The local limits mirror Buffer's published API limits and deliberately use conservative counting. Buffer remains the final authority when it validates a `createPost` mutation.

## Media

Buffer accepts image and video assets by URL. URLs must be publicly reachable without authentication and remain valid until the scheduled post publishes. Local file upload/hosting is intentionally a separate concern so publishing does not become coupled to a specific storage provider.

## Agent skills

Narrow execution skills live under [`skills/`](./skills/). They invoke the repository behavior; they do not duplicate orchestration policy. See `AGENTS.md` for the authoritative agent workflow.
