Original prompt: Read KSool_Gemini without changing it, follow updates periodically, and create K-Sool for Apps in Toss in KSool_AIT_Codex.

- Target empty repository cloned into workspace; source cloned read-only for inspection.
- Official create-ait-app@latest scaffolded k-sool; framework 3.8.1, devtools 3.8.1, design guide verified.
- Game snapshot isolated under vendor; original Supabase service must never be contacted.
- Daily 10:00 Asia/Seoul update heartbeat created.
- Completed immutable vendor snapshot, read-only fetch/check/sync commands and SHA-256 manifest.
- Generated bundle excludes original Supabase endpoint/keys and uses local-only suggestions and free hints.
- Added SDK anonymous key, native back/home handling, exit confirmation, audio visibility handling, safe area and settings exit.
- Found upstream hint ReferenceError (backChoiceBtn vs later mgBackChoiceBtn); fixed only in generated adapter output.
- Build passed with k-sool.ait; browser suite passed first craft, saved unlock/settings, collection, hint, 9 party mounts/back and UpDown outcome/reset. No original backend requests, missing assets or page errors.
- Mobile screenshots inspected; corrected inherited dark text/exit contrast. Original small text/text arrows remain release design work.
- Remaining: actual Toss device testing, content/age-rating and brand rights review, support/privacy metadata, console registration/review. Do not mark released.
- 2026-11-03: User approved amber/gold + dark theme and all-screen improvements. Added generated typography/color transforms, native-header separation, bottom settings access, safe areas, SVG control icons, modal keyboard controls, data-locality notice and layout corrections.
- Added 45 screen/viewport design audit. All checks passed after keypad/selector size fixes; screenshots inspected. Additional upstream hint state-scope error fixed only in generated output.
- CI Vite startup detection now uses HTTP readiness. Content/copy and real-device/operational release gates remain documented in docs/DESIGN-AUDIT.md.
- 2026-11-03 scheduled sync: reviewed and imported upstream 3e3127934ffbd5644f56bddfa74a876b0573bfa7 using upstream:sync. Changes cover rapid ingredient taps, scratch hints/audio, three picture minigames, nonogram grid and recipe data. No upstream writes or source backend requests.
- Existing adapter hint fixes naturally skip upstream-corrected code. Added fullscreen hint safe-area override and coverage for scratch reveal, picture-game lifecycle and nonogram tools/reset. Extended visual audit to 54 combinations; build and audit pass.
- 2026-11-03 manual sync: imported fed0ff839eb793b4feac6723372f1d1dca5d2571 after reviewing its three changed files. Mobile canvas callout suppression and brick collision separation/escape behavior updated. Save schema/backend unchanged.
- Adapted hint teardown to prefer new destroy() with stop() fallback; regression tests assert contextmenu prevention during play and listener removal after closing all three picture games. Build and regression suite pass.
- Theme update: user requested soju-like refreshing colors after discussing light-mode candidates. Applied bottle green #16845B with mint #F2FAF6 and white cards, corrected active-tab/reset/empty-slot contrast. Theme transformation targets generated UI CSS declarations, preserving vendor and canvas/pixel art colors.
- First-screen bottle-glass experiment: user supplied a green soju bottle as material/color reference. Scoped CSS to #view-brew: white paper-label crafting section, green glass backdrop with soft vertical reflections, opaque ingredient cards and readable filter chips. No referenced brand art/text is copied; no vendor or game-state changes.
- Bottle composition revision: user requested green above and white below with a near-black green thick bottle base. Crafting controls now sit on green glass, ingredient inventory forms the lower white label, and the brew tab's footer/safe area uses deep green glass shading. Other screens and source snapshot remain unchanged.
- Added a compact decorative bottle neck and curved shoulders above brew controls at the user's request. CSS/SVG mask with green reflections and a subtle lip; scales down on short screens and does not intercept taps. No game logic or source snapshot changes.
- User preferred the previous neck-free layout: restored its CSS and added settings theme choices (green glass, blue/cyan glass, apricot glass). Decorative background/base rotate hue independently from text and art. Preference persists under a separate localStorage key with validated fallback. Added switch/reload/selected-state regression coverage.

- Added persistent brown beer-bottle glass theme; picker uses a 2x2 grid. Build, integration persistence test and visual screenshot checked.

- Sampled attached bottle photos with Pillow quantization; separated sky-glass/blue label, golden-apricot glass/cream label, and amber-brown glass/blue label palettes. Preserved green theme and improved light-glass control contrast. Build and integration tests passed.

- Changed beer theme label from blue to warm gold with ivory ingredient cards and brown selection accents. Build and integration tests passed; mobile screenshot inspected.

- Added theme-aware layered glass reflections to the ingredient shelf and ingredient cards, with bright inset rims and soft depth shadows. Build and integration tests passed; mobile render inspected.

- Unified apricot theme controls, glass, cream shelf and category colors in a warm apricot/brown palette. Removed cool teal surfaces. Let CSS color transitions settle before theme screenshots. Build and integration tests passed; final apricot capture inspected.

- Replaced accumulated per-theme overrides with a single semantic palette registry (theme.js), shared token-driven surfaces, and generated legacy UI color adaptation. Themes now cover all main tabs, settings and game surfaces. Brewing numbers/slots are white; mix and locked-hint controls use themed enabled/disabled roles. Added cross-tab palette regression captures and docs/THEMES.md. Build, integration and 54-screen design audit passed.

- Fixed settings audio button, percent, track fill and browser-specific slider thumbs to consume shared palette tokens. Replaced generated runtime gradient literals so open-modal theme switching updates fill immediately. Verified four theme settings captures and audio color regression assertions.

- Removed upstream header settings class and rotation; settings now uses equal-width bottom-tab geometry with icon above label. Added bounding-box alignment and hover-transform regression checks. Build and integration passed; bottom navigation screenshot inspected.

- Fixed color-font digits bypassing CSS text color: quiz numbers and empty-slot labels use system text fonts. Replaced fixed-color plus emoji with currentColor SVG in generated app. Verified white plus signs and numbers in blue theme screenshot; added regression checks for SVG count, color and numeric font.

- Unified collection with brewing bottle background, dark glass bottom navigation, matching 10px outer margins and shelf treatment. Themed collection filters, progress and glass cards; removed purple card paint while retaining difficulty badges. Build/integration passed; blue/brown collection captures inspected.

- Browser-led visual pass across collection/hints and party lobby/game setup: compact collection cards, larger pixel art, quiet metadata, system-font numbers, SVG locked art, subdued collection reflections, themed glass party shell and cards, removed neon card decoration, themed setup/Hint CTAs, lighter fridge panel. Rechecked screenshots at 320/390/844 widths; 54 combinations per palette (216 total) passed across four themes. Build and gameplay/storage regression checked. Original source remains untouched.

- Harmonized green collection/party shelves with a warm pale-green palette and removed divergent collection-only bottle paint. Added reusable control-material/rim roles for brewing panels, mode tabs, slots and clear button across all palettes. Fixed quiz hint button normal/hover/pressed colors using semantic palette roles. Added four-theme hint-button and material regression captures; build, integration and 54-screen design audit passed. Visually inspected brown brewing and green collection/party captures.
