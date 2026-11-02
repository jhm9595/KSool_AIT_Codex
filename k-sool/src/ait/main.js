import { User, Screen, graniteEvent } from '@apps-in-toss/web-framework';
import '../styles/base.css';
import './platform.css';

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
  if (overlays.length) { overlays.at(-1).classList.remove('active'); return; }
  if (app?.currentTab === 'party' && app.partyGameHubView?.activeGameKey) {
    app.partyGameHubView.openLobby(); return;
  }
  if (app && app.currentTab !== 'brew') { app.switchTab('brew'); return; }
  void exit();
}
const cleanup = [];
for (const [event, onEvent] of [['backEvent', back], ['homeEvent', exit]]) {
  try { cleanup.push(graniteEvent.addEventListener(event, { onEvent, onError: () => {} })); } catch { /* Plain browser without bridge. */ }
}
window.addEventListener('pagehide', () => {
  cleanup.forEach(fn => fn());
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
