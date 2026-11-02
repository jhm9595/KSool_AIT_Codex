import { cpSync, readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';

const app = resolve(import.meta.dirname, '..');
const source = resolve(app, '../vendor/KSool_Gemini');
const output = join(app, 'public/game');
// Only generated public/game is replaced; vendor remains byte-for-byte unchanged.
if (output !== join(app, 'public', 'game')) throw new Error('Unsafe output path');
rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });
for (const dir of ['src', 'assets', 'data']) cpSync(join(source, dir), join(output, dir), { recursive: true });

// The source's embedded production credentials and backend calls are excluded
// from the runnable bundle, while the original snapshot remains untouched.
const servicePath = join(output, 'src/js/core/suggestion/SuggestionService.js');
let service = readFileSync(servicePath, 'utf8');
for (const name of ['_fetchRemoteSuggestions', '_syncRemoteUpsert', '_syncRemoteVote', '_syncRemoteApply']) {
  const start = service.indexOf(`  async ${name}(`);
  if (start < 0) throw new Error(`Upstream contract changed: ${name}`);
  let brace = service.indexOf('{', start), depth = 1, end = brace + 1;
  // These methods contain ordinary balanced object literals and no brace strings.
  for (; depth && end < service.length; end++) {
    if (service[end] === '{') depth++;
    if (service[end] === '}') depth--;
  }
  if (depth) throw new Error('Unbalanced upstream service');
  service = service.slice(0, start) + `  async ${name}() { /* Local-only Apps in Toss edition. */ }` + service.slice(end);
}
service = service.replace(/this\.SUPABASE_(?:URL|KEY)\s*=\s*[^;]+;/g, '');
writeFileSync(servicePath, service);

// Free hints are intentionally offered without ads in this initial edition.
writeFileSync(join(output, 'src/js/services/AdService.js'), `window.KSool = window.KSool || {};
window.KSool.AdService = { async showRewardedAd(options = {}) {
  options.onRewarded?.();
  return { success: true, simulated: false, mode: 'free_hint' };
} };
`);
function transform(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const file = join(dir, entry.name);
    if (entry.isDirectory()) transform(file);
    else if (file.endsWith('.js')) {
      let text = readFileSync(file, 'utf8');
      text = text.replaceAll('./assets/', '/game/assets/').replaceAll('./data/', '/game/data/');
      text = text.replaceAll('광고 시청', '무료 힌트').replaceAll('광고를 시청', '힌트를 확인').replaceAll('광고 보고', '무료로').replaceAll('광고 보기', '힌트 보기');
      text = text.replaceAll('<span class="ad-tag">AD</span>', '<span class="ad-tag">무료</span>').replaceAll('은박 복권 긁기(AD)', '무료 은박 복권 긁기');
      writeFileSync(file, text);
    }
  }
}
transform(join(output, 'src'));
// Upstream 9ab2022: the CHOICE back button referenced a later const, causing
// a temporal-dead-zone ReferenceError on every hint screen. Patch generated
// code only, and naturally skip this once upstream fixes the spelling.
const hintPath = join(output, 'src/js/ui/HintModalView.js');
const hint = readFileSync(hintPath, 'utf8');
writeFileSync(hintPath, hint.replace(
  /(const backChoiceBtn = container\.querySelector\('#hint-back-choice-btn'\);\s*)if \(mgBackChoiceBtn\) \{\s*mgBackChoiceBtn\.onclick/,
  '$1if (backChoiceBtn) {\n      backChoiceBtn.onclick',
));
let html = readFileSync(join(source, 'index.html'), 'utf8');
html = html.replaceAll('./src/', '/game/src/').replaceAll('./assets/', '/game/assets/');
html = html.replace(/<title>.*?<\/title>/, '<title>K-Sool</title>');
html = html.replace(/^.*<meta property="og:(?:image|url)".*\r?\n/gm, '');
html = html.replace('maximum-scale=1.0, user-scalable=no, ', '');
html = html.replace('</head>', '  <script type="module" src="/src/ait/main.js"></script>\n</head>');
writeFileSync(join(app, 'index.html'), html);
console.log('K-Sool prepared: local assets, local suggestions, free hints.');
