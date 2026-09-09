# Publish Social

## Purpose

Execute an explicit social-publishing request through this repository's existing runtime.

## Procedure

1. Read the current repository-root `AGENTS.md` before acting.
2. Do not reimplement routing, account selection, Buffer calls, or validation inside the skill. Use the repository runtime that owns those responsibilities.
3. Convert the user's intent into the currently accepted publish payload by consulting `src/contracts.js` and `src/normalize.js` when needed.
4. Preserve the user's intended identity selection and supplied media.
5. If the runtime reports a character-limit failure and the user did not require verbatim copy, shorten the copy while preserving meaning and revalidate before publishing.
6. If the user requires exact/verbatim copy, do not alter it; report the incompatible destination and limit.
7. For an explicit publish request, invoke the publish command. For a requested preview, invoke the dry-run command.
8. Return the result grouped by identity and destination; never expose credentials.

## Commands

```bash
npm run publish -- '<json>'
```

```bash
npm run dry-run -- '<json>'
```

The executable input contract and validation rules live in source code, not in this skill.
