window.KSool = window.KSool || {};

class GameConfig {
  constructor() {
    // 1) 슬롯 제약: 초안은 4개이나 구조적으로 제한 없이 확장 가능 (동적 변경 지원)
    this.maxUniqueSlots = 4;
    this.unlimitedSlotsMode = false;

    // 4) 재료 총 개수 합계 상한 = 10개
    this.maxTotalCount = 10;

    // 2) 패러디 가짜 명칭 vs 제휴 실제 명칭 전역 스위치 (테스트 및 제휴 전환용)
    this.globalLicenseOverride = false;

    // 6) 관리자('나') 딸깍 모드 활성화 여부
    this.isAdminMode = false;

    // 5-2) 비율 힌트 제공 방식 ('UPDOWN' | 'REWARD_AD')
    this.ratioHintMode = 'UPDOWN';
  }

  getEffectiveMaxSlots() {
    return this.unlimitedSlotsMode ? Infinity : this.maxUniqueSlots;
  }
}

window.KSool.GameConfig = GameConfig;
