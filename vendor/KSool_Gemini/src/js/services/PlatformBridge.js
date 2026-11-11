window.KSool = window.KSool || {};

/**
 * 🚀 PlatformBridge
 * - 웹, 네이티브 앱 다운로드(구글플레이/앱스토어), 앱인토스(토스 미니앱/딥링크) 등
 *   다양한 플랫폼 및 배포 형태에 맞춰 유연하게 게임 실행/다운로드를 분기하는 브릿지 서비스
 */
class PlatformBridge {
  constructor(config = {}) {
    this.config = Object.assign({
      mode: 'WEB', // 'WEB' | 'APP_DOWNLOAD' | 'TOSS_IN_APP' | 'CUSTOM'
      appStoreUrl: 'https://apps.apple.com/app/ksool-alchemy/id000000000',
      playStoreUrl: 'https://play.google.com/store/apps/details?id=com.ksool.alchemy',
      tossAppUrl: 'toss://miniapp/ksool-alchemy',
      onPlayMyGameHook: null
    }, config);
  }

  setMode(mode) {
    this.config.mode = mode;
  }

  /**
   * "나도 이 게임 도전하기" 액션 핸들러
   * - WEB 모드: URL 쿼리 파라미터(?help=...)를 깨끗이 정리하고 모드 선택 포털(#view-portal)로 이동
   * - APP_DOWNLOAD 모드: 모바일 OS(iOS/Android)에 맞춰 스토어 다운로드 페이지로 이동
   * - TOSS_IN_APP 모드: 토스 앱인앱 딥링크 실행
   */
  handlePlayMyGameAction(app) {
    if (typeof this.config.onPlayMyGameHook === 'function') {
      const handled = this.config.onPlayMyGameHook(app, this);
      if (handled) return;
    }

    if (this.config.mode === 'APP_DOWNLOAD') {
      const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      const targetUrl = isIOS ? this.config.appStoreUrl : this.config.playStoreUrl;
      if (typeof window !== 'undefined') {
        window.open(targetUrl, '_blank');
      }
      return;
    }

    if (this.config.mode === 'TOSS_IN_APP') {
      if (typeof window !== 'undefined') {
        window.location.href = this.config.tossAppUrl;
      }
      return;
    }

    // 기본 WEB 환경: URL 파라미터 정리 후 모드 선택 첫 화면(#view-portal)으로 진입
    if (typeof window !== 'undefined' && window.history && window.location) {
      window.history.replaceState({}, '', window.location.pathname);
    }

    if (app) {
      app.currentMode = null;
      app.storage?.setMode('TYCOON');
      app.switchTab('portal');
      app.modeSelectPortalView?.render?.();
    }
  }
}

window.KSool.PlatformBridge = PlatformBridge;
