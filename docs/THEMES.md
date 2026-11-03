# Theme architecture

`k-sool/src/ait/theme.js` is the palette registry and theme application entry point. Add a palette there using the same semantic roles. Settings options and swatches are generated from this registry; the saved preference remains `ksool_ait_bottle_theme`.

`themes.css` contains reusable rendering rules, with no theme-id-specific selectors or palette hex values. Screens use `--primary`, `--text`, `--text-muted`, `--bg`, `--card-bg`, `--border`, and glass/control surface roles. Neutral translucent white/black layers provide material highlights.

`design-transforms.mjs` maps legacy generated UI declarations to these roles during preparation. Never change vendor files. New adapted UI should consume semantic roles directly. Game artwork, difficulty/status colors and player-identification colors keep their meaning and are not recolored by a whole-screen filter.

The integration test switches every palette, checks white brewing labels, exercises all main tabs, captures their renders and verifies persistence after reload. Existing gameplay/storage tests and the design audit remain required.
