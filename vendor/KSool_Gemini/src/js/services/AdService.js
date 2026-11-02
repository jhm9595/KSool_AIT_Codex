/**
 * AdService - K-SOOL Rewarded Ad Hook Manager
 *
 * Provides a standardized interface for showing rewarded ads to players.
 * Currently operates in simulation / placeholder mode (ready to plug in AdMob / AdSense / Unity Ads / Google Interaction Ads).
 */
(function() {
  window.KSool = window.KSool || {};

  class AdService {
    constructor() {
      this.isConfigured = false;
      this.adProvider = null; // 'adsense' | 'admob' | 'custom'
      this.adDelayMs = 0; // Simulated delay if desired (0 for instant)
    }

    /**
     * 보상형 광고 요청 및 시청 완료 시 콜백 실행
     * @param {Object} options { placement: string, recipeId?: number, title?: string }
     * @returns {Promise<{success: boolean, simulated: boolean}>}
     */
    async showRewardedAd(options = {}) {
      const placement = options.placement || 'reward_hint';
      console.log(`[AdService] Requesting rewarded ad for placement: "${placement}"`, options);

      // 실제 광고 SDK가 연결되어 있으면 여기에 SDK 호출 로직 삽입
      if (this.isConfigured && this.adProvider) {
        try {
          const result = await this.adProvider.showRewarded({ placement, ...options });
          return { success: Boolean(result?.rewarded), simulated: false };
        } catch (err) {
          console.warn('[AdService] Ad display failed:', err);
          return { success: false, error: err, simulated: false };
        }
      }

      // [현재 상태: 광고 준비/모의 연동 모드]
      // 유저 흐름을 방해하지 않고 즉시 보상 지급 성공 처리
      return { success: true, simulated: true };
    }
  }

  window.KSool.AdService = new AdService();
})();
