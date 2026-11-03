import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
const theme = process.env.KSOOL_THEME || 'green';
const artifacts = theme === 'green' ? 'test-results/design' : `test-results/design-${theme}`;
mkdirSync(artifacts, { recursive: true });
const app = resolve(import.meta.dirname, '../k-sool');
const url = process.env.KSOOL_URL || 'http://127.0.0.1:4176';
const server = process.env.KSOOL_URL ? null : spawn(process.execPath, [resolve(app,'node_modules/vite/bin/vite.js'),'--host','127.0.0.1','--port','4176','--strictPort'], {cwd:app,stdio:'pipe'});
let browser;
const report = [];
try {
  let ready=false;
  for(let n=0;n<100;n++) {
    try {if((await fetch(url)).ok){ready=true;break;}}catch{}
    await new Promise(resolveWait=>setTimeout(resolveWait,300));
  }
  if(!ready) throw new Error('Design audit server unavailable');
  browser = await chromium.launch();
  for (const viewport of [{width:320,height:568},{width:390,height:844},{width:844,height:390}]) {
    const page = await browser.newPage({ viewport });
    await page.addInitScript(theme => localStorage.setItem('ksool_ait_bottle_theme', theme), theme);
    await page.goto(url);
    await page.waitForFunction(() => window.ksoolApp?.recipeBook.recipes.size > 0);
    await page.evaluate(() => { window.ksoolApp.inventory.unlockAllSandboxMode = true; window.ksoolApp.renderAll(); });
    async function audit(screen) {
      await page.waitForTimeout(250);
      const result = await page.evaluate(() => {
        const visible = el => el.checkVisibility() && el.getClientRects().length && !el.closest('svg') && getComputedStyle(el).opacity !== '0';
        const text = [...document.querySelectorAll('body *')].filter(el => visible(el) && [...el.childNodes].some(node=>node.nodeType===3&&node.textContent.trim()));
        const buttons = [...document.querySelectorAll('button,[role="button"]')].filter(visible);
        return {
          smallText: text.filter(el=>parseFloat(getComputedStyle(el).fontSize)<=11).map(el=>({c:el.className,text:el.textContent.slice(0,40),size:getComputedStyle(el).fontSize})),
          smallTargets: buttons.filter(el=>{const r=el.getBoundingClientRect();return r.width<43.5||r.height<43.5}).map(el=>({c:el.className,text:el.textContent.slice(0,25),w:el.getBoundingClientRect().width,h:el.getBoundingClientRect().height})),
          horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
        };
      });
      report.push({ viewport, screen, ...result });
      await page.screenshot({path:`${artifacts}/${viewport.width}-${screen}.png`});
    }
    for(const tab of ['brew','collection','suggestions','party']) {
      await page.evaluate(tab=>window.ksoolApp.switchTab(tab),tab);
      await audit(tab);
    }
    const games=await page.evaluate(()=>window.ksoolApp.partyGameHubView.gamesList.map(g=>g.key));
    for(const key of games) {
      await page.evaluate(key=>window.ksoolApp.partyGameHubView.playGame(key),key);
      await audit(key);
      await page.evaluate(()=>window.ksoolApp.partyGameHubView.openLobby());
    }
    await page.evaluate(()=>window.ksoolApp.switchTab('brew'));
    for(const type of ['BRICK_BREAKER','TERRITORY_QIX','NONOGRAM']) {
      await page.evaluate(()=>window.ksoolApp.hintModalView.open(6,'MINIGAME_SELECT'));
      await page.locator(`[data-start-minigame="${type}"]`).click();
      await audit(`hint-${type}`);
      await page.evaluate(()=>window.ksoolApp.hintModalView.close());
    }
    await page.evaluate(()=>{ window.ksoolApp.switchTab('brew'); window.ksoolApp.settingsModalView.open(); });
    await audit('settings');
    await page.evaluate(()=>{window.ksoolApp.settingsModalView.close();window.ksoolApp.hintModalView.open(6);});
    await audit('hint');
    await page.close();
  }
} finally { await browser?.close(); server?.kill(); }
writeFileSync(`${artifacts}/audit.json`, JSON.stringify(report,null,2));
const issues=report.filter(r=>r.smallText.length||r.smallTargets.length||r.horizontalOverflow);
console.log(JSON.stringify(issues,null,2));
console.log(`Audited ${report.length} screen/viewport combinations; ${issues.length} with issues.`);
if(issues.length) process.exitCode=1;
