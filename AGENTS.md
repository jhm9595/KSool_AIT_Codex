# K-Sool Apps in Toss

- Source: https://github.com/jhm9595/KSool_Gemini.git. READ ONLY. Never push, open PRs/issues, change its files, or call its production backend.
- Destination: https://github.com/jhm9595/KSool_AIT_Codex.git. All changes belong here.
- `vendor/KSool_Gemini` is a byte-for-byte snapshot. Do not edit it manually. Use `npm run upstream:check` then review the diff before `npm run upstream:sync`.
- App-specific transformations belong in `k-sool/scripts/prepare-game.mjs` and `k-sool/src/ait/`.
- Follow `k-sool/AGENTS.md` for UI rules. Preserve game behavior, storage keys and saved progress.
- Run `npm run build` and `npm test` before committing updates. Never submit review, accept terms or release automatically.
- Read `docs/UPSTREAM.md` and `docs/RELEASE.md` for synchronization and remaining release gates.
