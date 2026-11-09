import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const artifacts = join(root, 'test-results/tycoon');
mkdirSync(artifacts, { recursive: true });
const manifest = JSON.parse(readFileSync(join(root, 'upstream.json')));
for (const [file, hash] of Object.entries(manifest.files)) {
  assert.equal(createHash('sha256').update(readFileSync(join(root, 'vendor/KSool_Gemini', file))).digest('hex'), hash, file);
}
function scan(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) scan(path);
    else if (/\.(js|html)$/.test(path)) {
      const content = readFileSync(path, 'utf8');
      assert(!content.includes('jyjxvwxlwkoedxwkkysj.supabase.co'), `Production backend in ${path}`);
      assert(!content.includes('sb_publishable_'), `Production key in ${path}`);
    }
  }
}
scan(join(root, 'k-sool/dist'));
const port = 4177, url = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, [join(root, 'k-sool/node_modules/vite/bin/vite.js'), '--host', '127.0.0.1', '--port', String(port), '--strictPort'], { cwd: join(root, 'k-sool'), stdio: 'pipe' });
let browser;
try {
  let ready = false;
  for (let i = 0; i < 100; i++) {
    try { ready = (await fetch(url)).ok; } catch { /* Booting. */ }
    if (ready) break;
    if (server.exitCode !== null) throw Error('Preview exited');
    await new Promise(r => setTimeout(r, 200));
  }
  assert(ready);
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await context.addInitScript(() => document.addEventListener('DOMContentLoaded', () => {
    const style = document.createElement('style'); style.textContent = '.ait-panel-root{display:none!important}'; document.head.append(style);
  }));
  const page = await context.newPage(), errors = [], forbidden = [], missing = [];
  await context.route('**/*', route => {
    if (/supabase\.(co|com)/.test(route.request().url())) { forbidden.push(route.request().url()); return route.abort(); }
    return route.continue();
  });
  page.on('pageerror', e => errors.push(e.message));
  page.on('response', res => { if (res.status() === 404) missing.push(res.url()); });
  page.on('dialog', dialog => dialog.dismiss());
  await page.goto(url);
  await page.waitForFunction(() => window.ksoolApp?.recipeBook.recipes.size > 0);
  await page.addStyleTag({ content: '.ait-panel-root{display:none!important}' });
  await page.locator('#cutscene-skip-btn').waitFor();
  await page.screenshot({ path: join(artifacts, 'prologue.png') });
  assert(await page.locator('#story-tutorial-content img').evaluate(img => img.complete && img.naturalWidth > 0));
  await page.locator('#cutscene-skip-btn').click();
  await page.waitForFunction(() => !document.querySelector('.modal-overlay.active'));
  await page.evaluate(() => window.ksoolApp.switchTab('brew'));
  await page.locator('[data-base-ing-id="202"]').click();
  await page.locator('[data-base-ing-id="206"]').click();
  await page.locator('#mix-btn').click();
  await page.waitForFunction(() => window.ksoolApp.inventory.isRecipeUnlocked(11));
  await page.locator('#result-close-btn').click();
  await page.locator('[data-base-ing-id="202"]').click();
  await page.locator('[data-base-ing-id="205"]').click();
  await page.locator('#mix-btn').click();
  await page.waitForFunction(() => window.ksoolApp.inventory.isRecipeUnlocked(12));
  await page.locator('#result-close-btn').click();
  await page.reload();
  await page.waitForFunction(() => window.ksoolApp?.inventory.isRecipeUnlocked(12));
  assert(await page.evaluate(() => window.ksoolApp.inventory.isRecipeUnlocked(11)));
  // Current upstream requires three sellable drinks before opening the shop.
  await page.evaluate(() => window.ksoolApp.switchTab('brew'));
  for (const recipe of [58, 14]) {
    // Intermediate ingredients now have persistent consumable stock. Rebuild
    // depleted inputs through the actual crafting engine before the next UI craft.
    await page.evaluate(id => {
      const a = window.ksoolApp;
      const ensure = (ingredientId, count) => {
        if (a.recipeBook.isLeafIngredient(ingredientId)) return;
        while (a.inventory.getIngredientStock(ingredientId) < count) {
          const producer = a.recipeBook.producerRecipesByIngId.get(ingredientId)?.[0];
          if (!producer) throw Error(`Missing producer for ${ingredientId}`);
          const items = a.recipeBook.getRecipeItems(producer);
          for (const item of items) ensure(item.ingredient_id, item.ratio);
          a.craftingPot.clear();
          for (const item of items) for (let n = 0; n < item.ratio; n++) {
            const added = a.craftingPot.tapIngredient(item.ingredient_id, item.detail_ingredient_id, a.inventory.getCurrentStepConfig());
            if (!added.ok) throw Error('Cannot replenish intermediate stock');
          }
          if (!a.alchemyEngine.executeCraft(producer).isSuccess) throw Error('Stock craft failed');
        }
      };
      for (const item of a.recipeBook.getRecipeItems(id)) ensure(item.ingredient_id, item.ratio);
      a.craftingPot.clear();
      a.renderBrewView();
    }, recipe);
    const items = await page.evaluate(id => window.ksoolApp.recipeBook.getRecipeItems(id).map(it => ({ id: it.ingredient_id, cat: window.ksoolApp.recipeBook.getBaseIngredient(it.ingredient_id).category_id })), recipe);
    for (const item of items) {
      await page.locator(`[data-ing-cat="${item.cat}"]`).click();
      await page.locator(`[data-base-ing-id="${item.id}"]`).click();
    }
    await page.locator('#mix-btn').click();
    await page.waitForFunction(id => window.ksoolApp.inventory.isRecipeUnlocked(id), recipe);
    await page.locator('#result-close-btn').click();
    await page.evaluate(() => { const a = window.ksoolApp; a.pendingTabIntroQueue = []; document.querySelectorAll('.modal-overlay.active').forEach(el => el.classList.remove('active')); });
  }
  assert.equal(await page.evaluate(() => window.ksoolApp.inventory.getIngredientStock(204)), 0, 'Carbonated water consumed by soda and lemonade');
  await page.reload();
  await page.waitForFunction(() => window.ksoolApp?.inventory.isRecipeUnlocked(14));
  assert.equal(await page.evaluate(() => window.ksoolApp.inventory.getIngredientStock(204)), 0, 'Zero stock survives reload without legacy refill');
  await page.evaluate(() => {
    const a = window.ksoolApp;
    a.switchTab('brew'); a.selectedIngCategory = 'DRINK'; a.renderBrewView();
  });
  assert.equal(await page.locator('[data-base-ing-id="204"]').getAttribute('aria-disabled'), 'true', 'Zero-stock card is disabled');
  await page.locator('[data-base-ing-id="204"]').click();
  assert.equal(await page.evaluate(() => window.ksoolApp.craftingPot.getSlots().length), 0, 'Zero-stock input cannot enter pot');

  const results = await page.evaluate(async () => {
    const a = window.ksoolApp, e = a.tycoonView.engine, inv = a.inventory;
    const assert = (v, message) => { if (!v) throw Error(message); };
    assert(e.startGame('GROWTH').ok, 'Start first sale');
    const firstRecipe = e.session.activeOrder.recipeId;
    for (const item of a.recipeBook.getRecipeItems(firstRecipe)) {
      for (let n = 0; n < item.ratio; n++) e.tapIngredientInTycoonPot(item.ingredient_id, item.detail_ingredient_id);
    }
    assert(e.craftToPlate().ok, 'Craft order');
    const cash = e.persistentWallet, price = e.session.activeOrder.price;
    assert(e.ringBellToServe().isCorrect && e.persistentWallet === cash + price, 'Serve and money');
    e.persistentWallet = 51;
    assert(inv.purchaseBaseIngredient(401, e).ok && e.persistentWallet === 1, 'Buy milk');
    assert(!inv.purchaseBaseIngredient(401, e).ok && e.persistentWallet === 1, 'No duplicate charge');
    assert(!inv.purchaseBaseIngredient(307, e).ok && e.persistentWallet === 1, 'No funds');
    assert(!e.unlockMapStage('stage_2').ok, 'Stage gate');
    const board = e.leaderboard;
    const rank = await board.submitScore({ playerName: '<QA>', mode: 'INFINITE', servedCount: 3, totalEarnings: 60, maxCombo: 2, maxWave: 1 });
    assert(rank.ok && rank.localOnly && rank.rank === 1, 'Local ranking');
    assert(!board.cachedRankings.INFINITE[0].player_name.includes('<'), 'Safe local name');
    e.session.status = 'LOBBY';
    a.tycoonView.render();
    return { firstRecipe, price, cash: e.persistentWallet };
  });
  await page.reload();
  await page.waitForFunction(() => window.ksoolApp?.inventory.isIngredientAvailable(401));
  assert.equal(await page.evaluate(() => window.ksoolApp.tycoonView.engine.persistentWallet), 1);

  for (const theme of ['green', 'blue', 'apricot', 'brown']) {
    await page.locator('#open-settings-btn').click();
    await page.locator(`.ait-theme-option[data-bottle-theme="${theme}"]`).click();
    await page.evaluate(() => window.ksoolApp.settingsModalView.close());
    for (const tab of ['tycoon', 'brew', 'collection', 'party']) {
      await page.evaluate(tab => window.ksoolApp.switchTab(tab), tab);
      await page.waitForTimeout(250); // Let source entrance animations reach their visible state.
      await page.screenshot({ path: join(artifacts, `${theme}-${tab}.png`) });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, `${theme}/${tab} overflow`);
    }
    await page.evaluate(() => window.ksoolApp.hintModalView.open(14));
    await page.waitForTimeout(250);
    await page.screenshot({ path: join(artifacts, `${theme}-hint.png`) });
    await page.evaluate(() => window.ksoolApp.hintModalView.close());
  }
  await page.locator('#open-settings-btn').click();
  await page.screenshot({ path: join(artifacts, 'settings.png') });
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#settings-modal.active').count(), 0);
  await page.evaluate(() => { window.ksoolApp.switchTab('brew'); window.__ksoolPlatform.back(); });
  assert.equal(await page.evaluate(() => window.ksoolApp.currentTab), 'tycoon');
  await page.evaluate(() => window.ksoolApp.tycoonView.openIngredientShopModal());
  await page.evaluate(() => window.__ksoolPlatform.back());
  assert.equal(await page.locator('#tycoon-close-submodal').count(), 0);
  await page.evaluate(() => { const a = window.ksoolApp; a.tycoonView.engine.startGame('GROWTH'); a.tycoonView.render(); });
  await page.waitForTimeout(500);
  await page.screenshot({ path: join(artifacts, 'tycoon-playing.png') });
  await page.evaluate(() => window.__ksoolPlatform.back());
  assert.equal(await page.evaluate(() => window.ksoolApp.tycoonView.engine.session.status), 'LOBBY');

  const progression = await page.evaluate(() => {
    const a = window.ksoolApp, e = a.tycoonView.engine, inv = a.inventory;
    const assert = (v, m) => { if (!v) throw Error(m); };
    e.persistentWallet = 1000000;
    const stages = [];
    const craft = (recipeId, depth = 0) => {
      assert(depth < 100, 'Stock producer cycle');
      const items = a.recipeBook.getRecipeItems(recipeId);
      const required = new Map();
      for (const it of items) required.set(it.ingredient_id, (required.get(it.ingredient_id) || 0) + it.ratio);
      for (let attempt = 0; ; attempt++) {
        assert(attempt < 100, 'Unable to prepare intermediate stock');
        const missing = [...required].filter(([id, count]) => inv.getIngredientStock(id) < count);
        if (!missing.length) break;
        for (const [id, count] of missing) while (inv.getIngredientStock(id) < count) {
          const producer = a.recipeBook.producerRecipesByIngId.get(id)?.[0];
          assert(producer, `No stock producer ${id}`);
          craft(producer, depth + 1);
        }
      }
      a.craftingPot.clear();
      for (const it of items) for (let n = 0; n < it.ratio; n++) {
        assert(a.craftingPot.tapIngredient(it.ingredient_id, it.detail_ingredient_id, inv.getCurrentStepConfig()).ok, 'Stock recipe input');
      }
      const result = a.alchemyEngine.executeCraft(recipeId);
      assert(result.isSuccess && result.recipe.recipe_id === recipeId, `Stock recipe failed ${recipeId}`);
    };
    for (let n = 1; n <= 6; n++) {
      if (n > 1) assert(e.unlockMapStage(`stage_${n}`).ok, 'Unlock stage');
      for (const it of a.recipeBook.progression.getShopIngredientsForStep(n)) if (!inv.isBaseIngredientPurchased(it.id)) assert(inv.purchaseBaseIngredient(it.id, e).ok, 'Stage purchase');
      let progress = true;
      while (progress) {
        progress = false;
        for (const r of a.recipeBook.getAllRecipes().filter(r => r.step_id === n)) if (!inv.isRecipeUnlocked(r.recipe_id) && inv.isRecipeChallengeable(r)) { craft(r.recipe_id); progress = true; }
      }
      const state = inv.getStageCompletionStatus(n);
      assert(state.isStageMastered, `Unreachable stage ${n}`);
      stages.push(state.recipeUnlockedCount);
    }
    e.startGame('GROWTH');
    for (let n = 0; n < 200; n++) { e.session.servedCount = n; e._spawnCounterCustomer(); assert(e.session.activeOrder.orderType === 'NORMAL', 'Memory in growth'); }
    assert(e.startGame('INFINITE').ok, 'Infinite gate');
    for (let i = 0; i < 3; i++) { e.session.activeOrder.patienceSec = 0; e.tickPatience(1); }
    assert(e.session.lives === 0 && e.session.status === 'GAMEOVER', 'Three lives');
    return stages;
  });
  await page.evaluate(() => { const a = window.ksoolApp; a.tycoonView.engine.session.status = 'LOBBY'; a.storyTutorialModalView.startInteractiveTutorial(); });
  await page.locator('#live-interactive-tutorial-layer').waitFor();
  await page.waitForTimeout(250);
  await page.screenshot({ path: join(artifacts, 'interactive-guide.png') });
  await page.evaluate(() => window.__ksoolPlatform.back());
  assert.equal(await page.locator('#live-interactive-tutorial-layer').count(), 0);

  const legacyContext = await browser.newContext();
  await legacyContext.addInitScript(() => {
    localStorage.setItem('ksool_alchemy_v2_state', JSON.stringify({ unlockedStepId: 2, unlockedRecipeIds: [5, 11, 12], hasSeenIntroStory: true, hasSeenIntroTutorial: true }));
    localStorage.setItem('ksool_sound_muted', 'true');
  });
  const legacy = await legacyContext.newPage();
  legacy.on('pageerror', e => errors.push(e.message));
  await legacy.goto(url);
  await legacy.waitForFunction(() => window.ksoolApp?.inventory.isRecipeUnlocked(5));
  assert(await legacy.evaluate(() => window.ksoolApp.inventory.isIngredientAvailable(203)));
  assert.equal(await legacy.evaluate(() => window.ksoolApp.inventory.getIngredientStock(204)), 1, 'Legacy intermediate stock migrates once');
  assert(await legacy.evaluate(() => window.ksoolApp.audio.isMuted));
  assert.equal(forbidden.length, 0, `Upstream request: ${forbidden}`);
  assert.deepEqual(errors, []);
  assert.deepEqual(missing, []);
  writeFileSync(join(artifacts, 'report.json'), JSON.stringify({ source: manifest.commit, results, progression, errors, forbidden, missing, screenshots: readdirSync(artifacts).filter(name => name.endsWith('.png')).length }, null, 2));
  console.log('PASS: snapshot hashes, isolated backend, research/save migration, sale/purchase, local ranking, four themes, navigation, guide, six stages and survival.');
} finally {
  await browser?.close();
  server.kill();
}
