# AGENTS.md

This file is the **sole orchestration source** for agent behavior in this repository.

## Authority

1. Platform/system safety and tool rules always win.
2. For repository work, follow the latest `AGENTS.md` on the active branch.
3. `README.md`, skills, tests, comments, and docs may explain or execute behavior, but they must not become competing orchestration layers.
4. If another file conflicts with this file, fix the other file rather than duplicating policy here and there.

## Mission

Maintain a small social-publishing layer that can route content through separate Buffer accounts for:

- `personal`
- `warp` (Warp the Surface)
- both accounts together

The system must accept text and optional image/video media, discover the actual connected Buffer channels for each configured account, enforce the strictest destination character constraint before publishing, and keep credentials isolated.

## Source-of-truth boundaries

Keep responsibilities singular to prevent drift:

- **Orchestration and intent routing:** `AGENTS.md`
- **Accepted input and normalization:** `src/contracts.js` and `src/normalize.js`
- **Character/media validation:** `src/constraints.js`
- **Account credential mapping:** `src/accounts.js`
- **Buffer GraphQL transport/discovery/publishing:** `src/buffer/*`
- **End-to-end publish transaction:** `src/publish.js`
- **Human setup and CLI examples:** `README.md`
- **Narrow agent execution recipes:** `skills/*/SKILL.md`

Do not restate implementation contracts in this file when the named source owns them.

## Required workflow

For every task involving this repository:

1. Retrieve/read the current `AGENTS.md` before acting.
2. Classify the request as repository maintenance, channel inspection, publish/dry-run, or another explicit task.
3. Use the existing source-of-truth file for that responsibility; do not create a second orchestration path.
4. For publishing, normalize the user's payload, resolve the target Buffer account(s), and discover live channels before any write.
5. Validate **all** selected messages and media before creating the first post. A multi-channel request must fail preflight as a whole rather than knowingly creating a partial publish because of local validation.
6. Determine validity per destination using `src/constraints.js`. The effective common copy is bounded by the strictest selected destination. Do not silently truncate user copy.
7. If an agent is authoring or adapting copy and the copy exceeds a limit, shorten it deliberately while preserving intent, then revalidate. If the user requires verbatim copy, report the constraint instead of changing it.
8. Buffer media must be a public, direct, stable HTTPS URL. Media hosting is a separate concern unless a dedicated hosting adapter is intentionally added later.
9. Publish through the Buffer GraphQL API using the account-specific credential and one destination channel per `createPost` mutation.
10. Return results grouped by Buffer identity and destination channel, including failures. Never expose API keys.

## Account isolation

Credentials are server-side/environment-only:

- `BUFFER_PERSONAL_API_KEY`
- `BUFFER_WARP_API_KEY`

Never commit, echo, log, or place real keys in examples. The same publishing code serves both identities; do not fork implementation by brand.

## Input intent

The runtime supports these semantic intents: publish to personal only, Warp only, both with the same message, or both with split messages. The executable schema is owned by `src/contracts.js`/`src/normalize.js`; use those files rather than inventing alternate payload shapes.

## Character-limit policy

Use the connected destination channels, not a fixed global maximum. Validate each selected channel with the rules in `src/constraints.js`, then treat the tightest valid destination as the common constraint for shared copy. Local validation is intentionally conservative; Buffer's API response remains authoritative.

## Change discipline

- Prefer the smallest coherent change.
- Preserve ESM (`import`/`export`) throughout the Node project.
- Add/update tests when contract, validation, or routing behavior changes.
- Keep runtime dependencies at zero unless a dependency clearly removes more risk than it adds.
- Update `README.md` for human-facing setup/usage changes only.
- Update a skill only when its narrow execution procedure changes.
- Update `AGENTS.md` only when orchestration or responsibility boundaries change.

## Skills

Skills are operators, not orchestrators. They must begin by reading `AGENTS.md`, call into repository behavior, and avoid copying policy or schema definitions that already live elsewhere.
