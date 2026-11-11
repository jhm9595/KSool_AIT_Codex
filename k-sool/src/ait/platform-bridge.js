// Stay inside the installed mini-app; never use upstream placeholder store URLs.
window.KSool = window.KSool || {};
window.KSool.PlatformBridge = class {
  constructor() { this.config = { mode: 'TOSS_IN_APP' }; }
  setMode() { /* External store and unverified deep-link destinations are disabled. */ }
  handlePlayMyGameAction(app) {
    window.history.replaceState({}, '', window.location.pathname);
    if (app) {
      app.currentMode = null;
      app.storage?.setMode('TYCOON');
      app.switchTab('portal');
      app.modeSelectPortalView?.render?.();
    }
  }
};
