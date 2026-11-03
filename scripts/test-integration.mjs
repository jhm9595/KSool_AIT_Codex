import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const artifacts = join(root, 'test-results/integration');
mkdirSync(artifacts, { recursive: true });
const manifest = JSON.parse(readFileSync(join(root, 'upstream.json'), 'utf8'));
for (const [file, expected] of Object.entries(manifest.files)) {
  assert.equal(createHash('sha256').update(readFileSync(join(root, 'vendor/KSool_Gemini', file))).digest('hex'), expected, `Upstream modified: ${file}`);
}
function checkBundle(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) checkBundle(path);
    else if (/\.(js|html)$/.test(path)) {
      const text = readFileSync(path, 'utf8');
      assert(!text.includes('jyjxvwxlwkoedxwkkysj.supabase.co'), `Source backend leaked into ${path}`);
      assert(!/eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\./.test(text), `Embedded token in ${path}`);
    }
  }
}
checkBundle(join(root, 'k-sool/dist'));
const port = 4175;
const server = spawn(process.execPath, [join(root, 'k-sool/node_modules/vite/bin/vite.js'), '--host', '127.0.0.1', '--port', String(port), '--strictPort'], { cwd: join(root, 'k-sool'), stdio: 'pipe' });
let browser;
try {
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    if (server.exitCode !== null) throw new Error(`Vite exited ${server.exitCode}`);
    try { const response = await fetch(`http://127.0.0.1:${port}`); if (response.ok) { ready = true; break; } } catch { /* Starting. */ }
    await new Promise(resolveWait => setTimeout(resolveWait, 300));
  }
  assert(ready, 'Vite startup timed out');
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const errors = [], requests = [], missing = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', req => requests.push(req.url()));
  page.on('response', res => { if (res.status() === 404) missing.push(res.url()); });
  page.on('dialog', dialog => dialog.dismiss());
  await page.goto(`http://127.0.0.1:${port}`);
  await page.waitForFunction(() => window.ksoolApp?.recipeBook.recipes.size > 0);
  // Test the game surface without the development-only floating inspector.
  await page.addStyleTag({ content: '.ait-panel-root { display: none !important; }' });
  assert.equal(await page.title(), 'K-Sool');
  assert.equal(await page.locator('.brand h1').innerText(), 'K-Sool');
  assert.equal(await page.locator('#mix-btn').isDisabled(), true);
  const tabBounds = await page.locator('.tab-bar .tab-btn, .tab-bar #open-settings-btn').evaluateAll(elements => elements.filter(el => el.checkVisibility()).map(el => { const r = el.getBoundingClientRect(); return { y: r.y, height: r.height, width: r.width }; }));
  assert(tabBounds.every(r => Math.abs(r.y - tabBounds[0].y) < 1 && Math.abs(r.height - tabBounds[0].height) < 1 && Math.abs(r.width - tabBounds[0].width) < 1));
  await page.locator('#open-settings-btn').hover();
  assert.equal(await page.locator('#open-settings-btn').evaluate(el => getComputedStyle(el).transform), 'none');
  await page.screenshot({ path: join(artifacts, '01-mobile-start.png') });

  // Actual input -> first recipe -> persistent unlock, using visible controls.
  await page.locator('[data-base-ing-id="202"]').click();
  await page.locator('[data-base-ing-id="203"]').click();
  assert.equal(await page.locator('#mix-btn').isEnabled(), true);
  await page.locator('#mix-btn').click();
  await page.waitForFunction(() => window.ksoolApp.inventory.isRecipeUnlocked(5));
  await page.locator('#result-close-btn').waitFor();
  await page.waitForTimeout(600);
  await page.screenshot({ path: join(artifacts, '02-first-recipe.png') });
  await page.locator('#result-close-btn').click();
  await page.reload();
  await page.waitForFunction(() => window.ksoolApp?.inventory.isRecipeUnlocked(5));

  await page.locator('#open-settings-btn').click();
  for (const theme of ['blue', 'apricot', 'brown', 'green']) {
    await page.locator(`.ait-theme-option[data-bottle-theme="${theme}"]`).click();
    assert.equal(await page.evaluate(() => document.documentElement.dataset.bottleTheme), theme);
    await page.evaluate(() => window.ksoolApp.settingsModalView.close());
    await page.waitForTimeout(400); // Let existing surface color transitions settle before visual capture.
    await page.screenshot({ path: join(artifacts, `theme-${theme}.png`) });
    assert.equal(await page.locator('.pot-slot.empty span').last().evaluate(el => getComputedStyle(el).color), 'rgb(255, 255, 255)');
    assert.equal(await page.locator('.ait-slot-plus').count(), 4);
    assert.equal(await page.locator('.ait-slot-plus').first().evaluate(el => getComputedStyle(el).color), 'rgb(255, 255, 255)');
    assert(!(await page.locator('.quiz-num-badge').evaluate(el => getComputedStyle(el).fontFamily)).includes('Tossface'));
    const themeSurface = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--bg').trim());
    assert.equal(await page.locator('.quiz-num-total').evaluate(el => getComputedStyle(el).color), 'rgb(255, 255, 255)');
    await page.evaluate(() => { window.ksoolApp.inventory.unlockAllSandboxMode = true; window.ksoolApp.renderAll(); });
    for (const tab of ['collection', 'suggestions', 'party']) {
      await page.evaluate(tab => window.ksoolApp.switchTab(tab), tab);
      await page.waitForTimeout(400);
      assert.equal(await page.locator(`#view-${tab}`).evaluate(el => el.classList.contains('active')), true);
      assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()), themeSurface);
      await page.screenshot({ path: join(artifacts, `theme-${theme}-${tab}.png`) });
    }
    await page.evaluate(() => window.ksoolApp.switchTab('brew'));
    await page.reload();
    await page.waitForFunction(() => window.ksoolApp?.recipeBook.recipes.size > 0);
    assert.equal(await page.evaluate(() => document.documentElement.dataset.bottleTheme), theme);
    await page.locator('#open-settings-btn').click();
    assert.equal(await page.locator(`.ait-theme-option[data-bottle-theme="${theme}"]`).getAttribute('aria-pressed'), 'true');
    await page.waitForTimeout(400);
    const soundColors = await page.evaluate(() => {
      const root = getComputedStyle(document.documentElement);
      const button = document.querySelector('#settings-sound-mute-btn');
      const range = document.querySelector('#settings-sound-range');
      const probe = document.createElement('span'); probe.style.color = root.getPropertyValue('--primary'); document.body.append(probe);
      const expected = getComputedStyle(probe).color; probe.remove();
      return { expected, button: getComputedStyle(button).color, accent: getComputedStyle(range).accentColor, fill: range.style.getPropertyValue('--track-fill') };
    });
    assert.equal(soundColors.button, soundColors.expected);
    assert.equal(soundColors.accent, soundColors.expected);
    assert(soundColors.fill.includes('var(--primary)'));
    await page.screenshot({ path: join(artifacts, `theme-${theme}-settings.png`) });
  }
  await page.locator('#settings-sound-mute-btn').click();
  const muted = await page.evaluate(() => window.ksoolApp.audio.isMutedState());
  await page.locator('#ait-exit').waitFor();
  await page.screenshot({ path: join(artifacts, '03-settings.png') });
  await page.evaluate(() => window.__ksoolPlatform.back());
  assert.equal(await page.locator('#settings-modal').evaluate(el => el.classList.contains('active')), false);
  await page.reload();
  await page.waitForFunction(() => window.ksoolApp?.recipeBook.recipes.size > 0);
  assert.equal(await page.evaluate(() => window.ksoolApp.audio.isMutedState()), muted);

  // Make one failed combination to unlock the collection through normal rules.
  await page.locator('[data-base-ing-id="205"]').click();
  await page.locator('[data-base-ing-id="206"]').click();
  await page.locator('#mix-btn').click();
  await page.locator('#result-close-btn').waitFor();
  await page.locator('#result-close-btn').click();
  await page.evaluate(() => {
    document.querySelectorAll('.modal-overlay.active').forEach(el => el.classList.remove('active'));
    window.ksoolApp.switchTab('collection');
  });
  assert.equal(await page.evaluate(() => window.ksoolApp.currentTab), 'collection');
  assert((await page.locator('#sool-grid').innerHTML()).length > 100);
  await page.screenshot({ path: join(artifacts, '04-collection.png') });
  // Hint entry renders the actual source UI; free service supports callback users.
  await page.evaluate(() => window.ksoolApp.hintModalView.open(6));
  await page.locator('#hint-modal.active').waitFor();
  await page.waitForTimeout(600);
  assert.equal(await page.locator('#hint-modal .ad-tag').innerText(), '무료');
  await page.screenshot({ path: join(artifacts, '05-hint.png') });
  await page.evaluate(() => window.__ksoolPlatform.back());
  await page.evaluate(() => window.__ksoolPlatform.back());

  // Upstream 3e31279 changed all three picture-hint games and their controls.
  await page.evaluate(() => window.ksoolApp.hintModalView.open(6));
  await page.locator('#btn-start-scratch').click();
  await page.waitForFunction(() => Boolean(window.ksoolApp.hintModalView.scratchCardInstance?.ctx));
  const scratch = await page.locator('#scratch-overlay-canvas').boundingBox();
  assert(scratch && scratch.width > 0 && scratch.height > 0);
  await page.mouse.move(scratch.x + 2, scratch.y + 2);
  await page.mouse.down();
  for (let y = 2; y < scratch.height; y += 12) {
    await page.mouse.move(scratch.x + scratch.width - 2, scratch.y + y, { steps: 15 });
    await page.mouse.move(scratch.x + 2, scratch.y + y, { steps: 15 });
  }
  await page.mouse.up();
  await page.waitForFunction(() => window.ksoolApp.inventory.isRecipeDescUnlocked(6));
  await page.screenshot({ path: join(artifacts, 'hint-scratch-complete.png') });
  await page.evaluate(() => window.ksoolApp.hintModalView.close());
  for (const type of ['BRICK_BREAKER', 'TERRITORY_QIX', 'NONOGRAM']) {
    await page.addStyleTag({ content: '.ait-panel-root { display: none !important; }' });
    await page.evaluate(() => window.ksoolApp.hintModalView.open(6, 'MINIGAME_SELECT'));
    await page.locator(`[data-start-minigame="${type}"]`).click();
    await page.waitForFunction(() => Boolean(window.ksoolApp.hintModalView.minigameInstance));
    assert.equal(await page.evaluate(() => {
      window.__lastHintGame = window.ksoolApp.hintModalView.minigameInstance;
      return window.__lastHintGame.canvas.dispatchEvent(new Event('contextmenu', { cancelable: true }));
    }), false, 'Canvas must suppress long-press context menus');
    if (type === 'NONOGRAM') {
      assert.equal(await page.evaluate(() => window.ksoolApp.hintModalView.minigameInstance.nonogramState.rows), 15);
      await page.locator('#nono-mode-mark').click();
      assert.equal(await page.evaluate(() => window.ksoolApp.hintModalView.minigameInstance.nonogramState.toolMode), 'X');
      await page.locator('#nono-mode-fill').click();
      await page.locator('#nono-reset-btn').click();
    }
    await page.screenshot({ path: join(artifacts, `hint-${type}.png`) });
    await page.evaluate(() => window.ksoolApp.hintModalView.close());
    assert.equal(await page.evaluate(() => window.ksoolApp.hintModalView.minigameInstance), null);
    assert.equal(await page.evaluate(() => {
      const stopped = !window.__lastHintGame.isRunning;
      const detached = window.__lastHintGame.canvas.dispatchEvent(new Event('contextmenu', { cancelable: true }));
      delete window.__lastHintGame;
      return stopped && detached;
    }), true, 'Closing a hint must stop its game and remove canvas listeners');
  }

  // Native back ordering: game -> lobby -> brew. Every available party game mounts.
  await page.locator('[data-tab-target="party"]').click();
  const games = await page.evaluate(() => window.ksoolApp.partyGameHubView.gamesList.map(game => game.key));
  for (const key of games) {
    await page.evaluate(key => window.ksoolApp.partyGameHubView.playGame(key), key);
    await page.waitForTimeout(120);
    assert.equal(await page.evaluate(() => window.ksoolApp.partyGameHubView.activeGameKey), key);
    assert((await page.locator('#party-game-stage').innerHTML()).length > 50, `Empty ${key}`);
    if (key === 'updown') {
      await page.evaluate(() => { window.ksoolApp.partyGameHubView.games.updown.secretNumber = 25; });
      await page.locator('[data-digit="2"]').last().click();
      await page.locator('[data-digit="5"]').last().click();
      await page.locator('.btn-updown-submit').last().click();
      assert.equal(await page.evaluate(() => window.ksoolApp.partyGameHubView.games.updown.isFinished), true);
      await page.waitForTimeout(550);
      await page.locator('#party-penalty-overlay').click();
      assert.equal(await page.evaluate(() => window.ksoolApp.partyGameHubView.games.updown.isFinished), false);
    }
    await page.screenshot({ path: join(artifacts, `party-${key}.png`) });
    await page.evaluate(() => window.__ksoolPlatform.back());
    await page.waitForFunction(() => window.ksoolApp.partyGameHubView.mode === 'lobby');
  }
  await page.evaluate(() => window.__ksoolPlatform.back());
  assert.equal(await page.evaluate(() => window.ksoolApp.currentTab), 'brew');

  // Free hint callback must work; no source production backend may be contacted.
  assert.equal(await page.evaluate(async () => {
    let granted = 0;
    const result = await window.KSool.AdService.showRewardedAd({ onRewarded: () => granted++ });
    return granted === 1 && result.mode === 'free_hint' && result.success && !result.simulated;
  }), true);
  assert(!requests.some(url => url.includes('supabase.co')), 'Source backend request detected');
  assert.deepEqual(missing, [], 'Missing local assets');
  assert.deepEqual(errors, [], 'Uncaught game errors');
  writeFileSync(join(artifacts, 'state.json'), await page.evaluate(() => window.render_game_to_text()));
  writeFileSync(join(artifacts, 'report.json'), JSON.stringify({ sourceFilesVerified: Object.keys(manifest.files).length, partyGames: games, firstRecipe: 'passed', reloadPersistence: 'passed', settings: 'passed', nativeBack: 'passed', sourceBackendRequests: 0, errors, missing }, null, 2));
  console.log(`PASS: snapshot, bundle isolation, first recipe, persistence, settings, ${games.length} party games, back navigation, free hints.`);
} finally {
  await browser?.close();
  server.kill();
}
