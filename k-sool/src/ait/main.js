import { User, Screen, graniteEvent } from '@apps-in-toss/web-framework';
import '../styles/base.css';
import './platform.css';

const settingsControl = document.getElementById('open-settings-btn');
if (settingsControl) {
  settingsControl.textContent = '설정';
  document.querySelector('.tab-bar')?.append(settingsControl);
}
// Keep source click handlers and text intact while replacing UI glyph icons.
const paths = {
  '◀': 'm14 6-6 6 6 6', '‹': 'm14 6-6 6 6 6', '←': 'm14 6-6 6 6 6',
  '▶': 'm10 6 6 6-6 6', '›': 'm10 6 6 6-6 6', '→': 'm10 6 6 6-6 6',
  '✕': 'm6 6 12 12M18 6 6 18', '×': 'm6 6 12 12M18 6 6 18', '✖': 'm6 6 12 12M18 6 6 18',
  '↺': 'M4 10a8 8 0 1 1 1 8M4 4v6h6', '↵': 'M19 5v8H5m5-5-5 5 5 5',
};
function enhanceControls() {
  for (const button of document.querySelectorAll('button, [role="button"], .back-icon')) {
    const walker = document.createTreeWalker(button, NodeFilter.SHOW_TEXT);
    const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      if (node.parentElement.closest('svg')) continue;
      const glyphs = [...node.textContent].filter(char => paths[char]);
      if (!glyphs.length) continue;
      const label = node.textContent.replace(/[◀‹←▶›→✕×✖↺↵]/g, '').trim();
      if (label) { node.textContent = label; continue; }
      const glyph = glyphs[0];
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('class', 'ait-icon'); svg.setAttribute('aria-hidden', 'true');
      const path = document.createElementNS(svg.namespaceURI, 'path');
      path.setAttribute('d', paths[glyph]); path.setAttribute('fill', 'none'); path.setAttribute('stroke', 'currentColor'); path.setAttribute('stroke-width', '2'); path.setAttribute('stroke-linecap', 'round'); path.setAttribute('stroke-linejoin', 'round');
      svg.append(path); node.replaceWith(svg);
      if (!button.getAttribute('aria-label')) button.setAttribute('aria-label', button.title || ({ '✕': '닫기', '×': '닫기', '✖': '닫기', '◀': '이전', '▶': '다음', '↺': '다시 시작', '↵': '확인' }[glyph] || '이동'));
    }
  }
}
let enhancePending = false;
const controlObserver = new MutationObserver(() => {
  if (enhancePending) return;
  enhancePending = true;
  queueMicrotask(() => { enhancePending = false; enhanceControls(); });
});
controlObserver.observe(document.getElementById('app-container'), { childList: true, subtree: true });
enhanceControls();

// Module execution finishes before DOMContentLoaded constructs the legacy app.
const contexts = new Set();
const NativeAudioContext = window.AudioContext || window.webkitAudioContext;
if (NativeAudioContext) {
  const TrackedAudioContext = class extends NativeAudioContext {
    constructor(...args) { super(...args); contexts.add(this); }
    resume() { return document.hidden ? Promise.resolve() : super.resume(); }
  };
  window.AudioContext = TrackedAudioContext;
  if (window.webkitAudioContext) window.webkitAudioContext = TrackedAudioContext;
}
const suspended = new Set();
function updateAudio() {
  for (const context of contexts) {
    if (document.hidden && context.state === 'running') {
      suspended.add(context);
      context.suspend().catch(() => {});
    } else if (!document.hidden && suspended.delete(context)) context.resume().catch(() => {});
  }
}
document.addEventListener('visibilitychange', updateAudio);

function notice(message) {
  let el = document.getElementById('ait-status');
  if (!el) { el = document.createElement('div'); el.id = 'ait-status'; el.setAttribute('role', 'status'); document.body.append(el); }
  el.textContent = message;
  clearTimeout(notice.timer);
  notice.timer = setTimeout(() => el.remove(), 4000);
}
window.open = () => { notice('외부 힌트 링크는 이 버전에서 제공하지 않아요. 게임 안의 힌트를 이용해 주세요.'); return null; };

async function exit() {
  if (!window.confirm('K-Sool을 종료할까요? 진행 기록은 이 기기에 저장돼요.')) return;
  try { await Screen.close(); } catch { notice('브라우저에서는 탭을 닫아 종료할 수 있어요.'); }
}
function back() {
  const app = window.ksoolApp;
  const overlays = [...document.querySelectorAll('.modal-overlay.active')];
  if (overlays.length) {
    const overlay = overlays.at(-1);
    if (overlay.id === 'hint-modal') app?.hintModalView.close();
    else if (overlay.id === 'settings-modal') app?.settingsModalView.close();
    else {
      const close = overlay.querySelector('.modal-close-x, #result-close-btn, [aria-label="닫기"]');
      if (close) close.click(); else overlay.classList.remove('active');
    }
    return;
  }
  if (app?.currentTab === 'party' && app.partyGameHubView?.activeGameKey) {
    app.partyGameHubView.openLobby(); return;
  }
  if (app && app.currentTab !== 'brew') { app.switchTab('brew'); return; }
  void exit();
}
const cleanup = [];
document.addEventListener('keydown', event => {
  const overlay = [...document.querySelectorAll('.modal-overlay.active')].at(-1);
  if (!overlay) return;
  if (event.key === 'Escape') { event.preventDefault(); back(); }
  if (event.key === 'Tab') {
    const controls = [...overlay.querySelectorAll('button, input, select, textarea, [tabindex="0"]')].filter(el => el.checkVisibility() && !el.disabled);
    if (!controls.length) return;
    const first = controls[0], last = controls.at(-1);
    if (event.shiftKey && (document.activeElement === first || !overlay.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && (document.activeElement === last || !overlay.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
  }
});
for (const modal of document.querySelectorAll('.modal-overlay')) {
  modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true');
}
for (const [event, onEvent] of [['backEvent', back], ['homeEvent', exit]]) {
  try { cleanup.push(graniteEvent.addEventListener(event, { onEvent, onError: () => {} })); } catch { /* Plain browser without bridge. */ }
}
window.addEventListener('pagehide', () => {
  cleanup.forEach(fn => fn());
  controlObserver.disconnect();
  contexts.forEach(ctx => ctx.suspend().catch(() => {}));
}, { once: true });

const settings = window.KSool?.SettingsModalView?.prototype;
if (settings) {
  const originalRender = settings.render;
  settings.render = function (...args) {
    originalRender.apply(this, args);
    const button = document.createElement('button');
    button.id = 'ait-exit'; button.textContent = '게임 종료'; button.onclick = exit;
    document.getElementById(this.contentId)?.append(button);
    const note = document.createElement('p');
    note.id = 'ait-data-note';
    note.textContent = '진행 기록과 설정은 이 기기에 저장돼요. 앱 데이터 삭제나 기기 변경 시 자동으로 복원되지 않아요. 추천 조합도 이 기기에서만 볼 수 있어요.';
    button.before(note);
  };
}
if (import.meta.env.DEV) window.__ksoolPlatform = { back, exit, contexts };
window.addEventListener('DOMContentLoaded', async () => {
  const title = document.querySelector('.brand h1');
  if (title) title.textContent = 'K-Sool';
  const tagline = document.querySelector('.brand-inline-sub');
  if (tagline) tagline.textContent = '한국의 술 조합 도감';
  const service = window.KSool?.SuggestionService;
  if (!service || typeof service.prototype._syncRemoteUpsert !== 'function') notice('게임 버전 호환성을 확인해 주세요.');
  try {
    const result = await User.getAnonymousKey();
    if (result?.type === 'HASH' && result.hash) localStorage.setItem('ksool_ait_anonymous_key', result.hash);
  } catch { /* Local progress remains available without a supported bridge. */ }
});

window.render_game_to_text = () => {
  const app = window.ksoolApp;
  return JSON.stringify({
    mode: app?.currentTab || 'loading',
    level: app?.inventory?.userLevel,
    brewMode: app?.brewMode,
    pot: app?.craftingPot?.slots,
    visibleText: document.querySelector('.view.active')?.innerText.slice(0, 2500),
    modal: document.querySelector('.modal-overlay.active')?.innerText.slice(0, 1000),
    coordinateSystem: 'DOM pixels; origin top-left, x right, y down',
  });
};
