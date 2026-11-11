import { cpSync, readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { adaptDesign } from './design-transforms.mjs';

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
// Rankings remain on this device. Never load upstream production credentials
// or execute its remote leaderboard implementation in the Apps in Toss bundle.
cpSync(join(app, 'src/ait/tycoon-leaderboard.js'), join(output, 'src/js/core/tycoon/TycoonLeaderboardService.js'));

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
    else if (/\.(js|css)$/.test(file)) {
      let text = readFileSync(file, 'utf8');
      if (file.endsWith('RecipeAnalysisIntegrator.js')) text = text.replace(/totalTargetFilled,\s*minR,\s*minC/, 'totalTargetFilled, minR: 0, minC: 0');
      text = text.replaceAll('./assets/', '/game/assets/').replaceAll('./data/', '/game/data/');
      text = text.replaceAll('글로벌 Top 100', '이 기기 Top 100').replaceAll('글로벌 랭킹', '이 기기 랭킹').replaceAll('전체 유저', '이 기기 기록');
      text = text.replaceAll('광고 시청', '무료 힌트').replaceAll('광고를 시청', '힌트를 확인').replaceAll('광고 보고', '무료로').replaceAll('광고 보기', '힌트 보기');
      text = text.replaceAll('<span class="ad-tag">AD</span>', '<span class="ad-tag">무료</span>').replaceAll('은박 복권 긁기(AD)', '무료 은박 복권 긁기');
      if (file.endsWith('.css') || file.includes(`${join('js', 'ui')}`) || file.endsWith('app.js')) text = adaptDesign(text);
      writeFileSync(file, text);
    }
  }
}
transform(join(output, 'src'));
// SOS requires a verified mini-app ingress URL and SDK share integration.
// Do not emit WebView-origin links or enter the web-only SOS receiver.
const appPath = join(output, 'src/js/app.js');
const appText = readFileSync(appPath, 'utf8');
const helpEntry = "const helpParam = urlParams.get('help');";
if (!appText.includes(helpEntry)) throw new Error('Upstream SOS entry contract changed');
writeFileSync(appPath, appText.replace(helpEntry, 'const helpParam = null; // Disabled until mini-app SOS ingress is configured.'));
const sosHintPath = join(output, 'src/js/ui/HintModalView.js');
const sosHintText = readFileSync(sosHintPath, 'utf8');
const sosCondition = "const isHelpFriendMode = this.app?.currentMode === 'HELP_FRIEND';";
if (!sosHintText.includes(sosCondition)) throw new Error('Upstream SOS hint contract changed');
writeFileSync(sosHintPath, sosHintText.replace(sosCondition, 'const isHelpFriendMode = true; // No unsupported SOS share controls in Toss.'));
const portalPath = join(output, 'src/js/ui/ModeSelectPortalView.js');
writeFileSync(portalPath, readFileSync(portalPath, 'utf8').replace('<span>💌 막히는 문제 친구 SOS 공유</span>', ''));
const friendPath = join(output, 'src/js/services/FriendHelpService.js');
writeFileSync(friendPath, readFileSync(friendPath, 'utf8') + `
window.KSool.FriendHelpService.prototype.generateHelpUrl = () => '';
window.KSool.FriendHelpService.prototype.shareHelp = async () => ({ ok: false, message: '친구 공유는 준비 중이에요.' });
`);
cpSync(join(app, 'src/ait/platform-bridge.js'), join(output, 'src/js/services/PlatformBridge.js'));

// Upstream b343671: compact ingredient titles read `name` before its const.
// Move that declaration within the generated map callback only.
const tycoonPath = join(output, 'src/js/ui/TycoonView.js');
let tycoonText = readFileSync(tycoonPath, 'utf8');
const gridStart = tycoonText.indexOf('gridContentHtml = allIngs.map(ing => {');
const titleStart = tycoonText.indexOf("let titleAttr = '';", gridStart);
const nameDeclaration = 'const name = this.brandResolver.resolveName(ing);';
const nameStart = tycoonText.indexOf(nameDeclaration, gridStart);
if (gridStart >= 0 && titleStart > gridStart && nameStart > titleStart) {
  tycoonText = tycoonText.slice(0, nameStart) + tycoonText.slice(nameStart + nameDeclaration.length);
  tycoonText = tycoonText.replace('gridContentHtml = allIngs.map(ing => {', 'gridContentHtml = allIngs.map(ing => {\n        ' + nameDeclaration);
  writeFileSync(tycoonPath, tycoonText);
}

// Upstream 9ab2022: the CHOICE back button referenced a later const, causing
// a temporal-dead-zone ReferenceError on every hint screen. Patch generated
// code only, and naturally skip this once upstream fixes the spelling.
const hintPath = join(output, 'src/js/ui/HintModalView.js');
const hint = readFileSync(hintPath, 'utf8');
writeFileSync(hintPath, hint.replace(
  'this.minigameInstance.stop();',
  "if (typeof this.minigameInstance.destroy === 'function') this.minigameInstance.destroy();\n      else this.minigameInstance.stop();",
).replace(
  /(const backChoiceBtn = container\.querySelector\('#hint-back-choice-btn'\);\s*)if \(mgBackChoiceBtn\) \{\s*mgBackChoiceBtn\.onclick/,
  '$1if (backChoiceBtn) {\n      backChoiceBtn.onclick',
).replace(
  /(const isImageUnlocked = this\.inventory\.isRecipeImageUnlocked\(this\.activeRecipeId\);\s*)(const resolvedName)/,
  '$1const isDescUnlocked = this.inventory.isRecipeDescUnlocked(this.activeRecipeId);\n    const isRecipeUnlocked = this.inventory.isRecipeUnlocked(this.activeRecipeId);\n    $2',
));
let html = readFileSync(join(source, 'index.html'), 'utf8');
html = adaptDesign(html);
html = html.replaceAll('./src/', '/game/src/').replaceAll('./assets/', '/game/assets/');
html = html.replace(/<title>.*?<\/title>/, '<title>K-Sool</title>');
html = html.replace(/^.*<meta property="og:(?:image|url)".*\r?\n/gm, '');
html = html.replace('maximum-scale=1.0, user-scalable=no, ', '');
html = html.replace('</head>', '  <script type="module" src="/src/ait/main.js"></script>\n  <script type="module" src="/src/ait/modes.js"></script>\n</head>');
writeFileSync(join(app, 'index.html'), html);
console.log('K-Sool prepared: local assets, local suggestions, free hints.');
