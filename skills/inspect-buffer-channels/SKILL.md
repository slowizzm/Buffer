# Inspect Buffer Channels

## Purpose

Inspect the currently connected, publishable Buffer channels for the configured identities without creating posts.

## Procedure

1. Read the current repository-root `AGENTS.md` before acting.
2. Use the repository's channel-inspection command; do not duplicate Buffer discovery queries in the skill.
3. Report channels grouped by identity, including service and channel name.
4. Never expose API keys or other credential values.
5. If an identity is not configured, report the missing environment variable indicated by the runtime rather than inventing a connection.

## Command

```bash
npm run channels
```

Channel discovery behavior lives in `src/buffer/discover.js`; this skill is only the execution recipe.
