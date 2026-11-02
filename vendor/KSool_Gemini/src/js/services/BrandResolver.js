window.KSool = window.KSool || {};

class BrandResolver {
  constructor(gameConfig) {
    this.config = gameConfig;
  }

  /**
   * 제휴 승인 여부(is_licensed) 또는 전역 라이선스 테스트 모드가 켜져 있으면
   * 실제 기업 상표명(real_name)을 반환하고, 평소에는 안전한 패러디명(display_name)을 반환합니다.
   */
  resolveName(entity) {
    if (!entity) return '';
    if (this.config && this.config.globalLicenseOverride) {
      return entity.real_name || entity.display_name || entity.name || '';
    }
    if (entity.is_licensed) {
      return entity.real_name || entity.display_name || entity.name || '';
    }
    return entity.display_name || entity.name || entity.real_name || '';
  }
}

window.KSool.BrandResolver = BrandResolver;
