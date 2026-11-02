window.KSool = window.KSool || {};

/**
 * 대표 재료별 상세 재료 선택 모달 추상 클래스
 */
class BaseDetailPickerModal {
  constructor(brandResolver, inventoryManager, audioService) {
    this.brandResolver = brandResolver;
    this.inventory = inventoryManager;
    this.audio = audioService;
  }

  render(baseIng, details, onSelectCallback, onCloseCallback) {
    throw new Error('render() must be implemented by subclass');
  }
}

/**
 * [쌀 등 특산물 전용] 대한민국 팔도 지도 모달 (KoreaMapPickerModal)
 */
class KoreaMapPickerModal extends BaseDetailPickerModal {
  render(baseIng, details, onSelect, onClose) {
    const config = baseIng.picker_config || {};
    const baseName = this.brandResolver.resolveName(baseIng);

    const pinsHtml = details.map(det => {
      const meta = det.ui_meta || {};
      const detName = this.brandResolver.resolveName(det);
      const x = meta.pin_x || 50;
      const y = meta.pin_y || 50;
      return `
        <button class="map-pin-btn"
                style="left: ${x}%; top: ${y}%;"
                data-detail-id="${det.detail_id}">
          <span>📍</span>
          <span>${detName}</span>
        </button>
      `;
    }).join('');

    return `
      <div class="modal-header">
        <div>
          <div class="modal-title">${config.title || `🗺️ ${baseName} 산지 지도`}</div>
          <div class="picker-subtitle">${config.subtitle || '지도에서 원하는 산지 재료를 선택하세요.'}</div>
        </div>
        <button class="modal-close-x" id="picker-close-btn">✕</button>
      </div>

      <button class="picker-default-btn" id="picker-select-default">
        <span>${window.KSool?.pixelIcon ? window.KSool.pixelIcon(baseIng, 24) : baseIng.emoji}</span>
        <span>${config.default_label || `일반 ${baseName} (대표 재료 그대로 넣기)`}</span>
      </button>

      <div class="korea-map-container">
        <svg class="korea-map-svg" viewBox="0 0 220 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- 한반도 남부 팔도 실루엣 그래픽 -->
          <path d="M75 20 L135 15 L165 65 L175 135 L160 205 L130 235 L70 255 L40 230 L45 160 L35 100 L60 55 Z"
                fill="#1e293b" stroke="#38bdf8" stroke-width="3" stroke-linejoin="round"/>
          <!-- 도 경계선 장식 -->
          <path d="M50 95 L168 85 M45 155 L165 150 M105 88 L108 242"
                stroke="#334155" stroke-width="1.5" stroke-dasharray="4 4"/>
          <!-- 제주도 -->
          <ellipse cx="75" cy="282" rx="22" ry="9" fill="#1e293b" stroke="#38bdf8" stroke-width="2.5"/>
        </svg>
        ${pinsHtml}
      </div>

      <div class="map-selected-info">
        <div style="font-weight:800; color:#fcd34d;">💡 팔도 특산 재료 안내</div>
        <div>지도의 핀을 누르면 해당 고장의 특산 <b>${baseName}</b>이 조합칸에 올라갑니다. (고난도 특산 명주 해금에 필수!)</div>
      </div>
    `;
  }
}

/**
 * [소주 전용] 주류 냉장고 브랜드 진열대 쇼케이스 모달 (SojuBrandShowcaseModal)
 */
class SojuBrandShowcaseModal extends BaseDetailPickerModal {
  render(baseIng, details) {
    const config = baseIng.picker_config || {};
    const baseName = this.brandResolver.resolveName(baseIng);

    const cardsHtml = details.map(det => {
      const meta = det.ui_meta || {};
      const detName = this.brandResolver.resolveName(det);
      const bottleColor = meta.bottle_color || '#16a34a';
      const capColor = meta.cap_color || '#dc2626';

      return `
        <div class="bottle-showcase-card"
             data-detail-id="${det.detail_id}">
          <div class="bottle-visual">
            <div class="bottle-silhouette" style="background: ${bottleColor};">
              <div class="bottle-cap" style="background: ${capColor};"></div>
              <span>${window.KSool?.pixelIcon ? window.KSool.pixelIcon(det, 22) : (det.emoji || '🍶')}</span>
            </div>
            <div class="bottle-meta">
              <div class="bottle-title">${detName}</div>
              <div class="bottle-abv">도수 ${meta.abv || 16.5}% · ${meta.taste_tag || '특선'}</div>
            </div>
          </div>
          <div class="bottle-desc">${det.description || ''}</div>
        </div>
      `;
    }).join('');

    return `
      <div class="modal-header">
        <div>
          <div class="modal-title">${config.title || '🍾 주류 냉장고 소주 쇼케이스'}</div>
          <div class="picker-subtitle">${config.subtitle || '브랜드 소주 또는 일반 소주를 선택하세요.'}</div>
        </div>
        <button class="modal-close-x" id="picker-close-btn">✕</button>
      </div>

      <button class="picker-default-btn" id="picker-select-default">
        <span>${window.KSool?.pixelIcon ? window.KSool.pixelIcon(baseIng, 24) : baseIng.emoji}</span>
        <span>${config.default_label || `일반 ${baseName} (대표 재료로 바로 넣기)`}</span>
      </button>

      <div class="soju-fridge-container">
        <div class="fridge-neon-banner">❄️ CHILLED K-SOJU SHOWCASE ❄️</div>
        <div class="fridge-shelf-grid">
          ${cardsHtml}
        </div>
      </div>
    `;
  }
}

/**
 * [맥주 전용] 생맥주 탭 & 캔 브루어리 쇼케이스 모달 (BeerTapShowcaseModal)
 */
class BeerTapShowcaseModal extends BaseDetailPickerModal {
  render(baseIng, details) {
    const config = baseIng.picker_config || {};
    const baseName = this.brandResolver.resolveName(baseIng);

    const cardsHtml = details.map(det => {
      const meta = det.ui_meta || {};
      const detName = this.brandResolver.resolveName(det);
      const canColor = meta.can_color || '#1d4ed8';

      return `
        <div class="bottle-showcase-card"
             data-detail-id="${det.detail_id}">
          <div class="bottle-visual">
            <div class="bottle-silhouette" style="background: ${canColor}; border-radius: 6px; width: 26px;">
              <span>${window.KSool?.pixelIcon ? window.KSool.pixelIcon(det, 22) : (det.emoji || '🍺')}</span>
            </div>
            <div class="bottle-meta">
              <div class="bottle-title">${detName}</div>
              <div class="bottle-abv">ABV ${meta.abv || 4.5}% · ${meta.taste_tag || '라거'}</div>
            </div>
          </div>
          <div class="bottle-desc">${det.description || ''}</div>
        </div>
      `;
    }).join('');

    return `
      <div class="modal-header">
        <div>
          <div class="modal-title">${config.title || '🍺 브루어리 맥주 쇼케이스'}</div>
          <div class="picker-subtitle">${config.subtitle || '맥주 브랜드를 선택하세요.'}</div>
        </div>
        <button class="modal-close-x" id="picker-close-btn">✕</button>
      </div>

      <button class="picker-default-btn" id="picker-select-default">
        <span>${window.KSool?.pixelIcon ? window.KSool.pixelIcon(baseIng, 24) : baseIng.emoji}</span>
        <span>${config.default_label || `일반 ${baseName} (대표 재료로 바로 넣기)`}</span>
      </button>

      <div class="soju-fridge-container" style="border-color: #f59e0b;">
        <div class="fridge-neon-banner" style="color: #fbbf24;">🍻 DRAFT & LAGER TAP LINEUP 🍻</div>
        <div class="fridge-shelf-grid">
          ${cardsHtml}
        </div>
      </div>
    `;
  }
}

/**
 * [기본 폴백] 선반 그리드 모달 (DefaultShelfPickerModal)
 */
class DefaultShelfPickerModal extends BaseDetailPickerModal {
  render(baseIng, details) {
    const baseName = this.brandResolver.resolveName(baseIng);
    const cardsHtml = details.map(det => {
      const detName = this.brandResolver.resolveName(det);
      return `
        <div class="bottle-showcase-card"
             data-detail-id="${det.detail_id}">
          <div class="bottle-title" style="display:inline-flex; align-items:center; gap:6px;"><span>${window.KSool?.pixelIcon ? window.KSool.pixelIcon(det, 22) : (det.emoji || baseIng.emoji)}</span><span>${detName}</span></div>
          <div class="bottle-desc">${det.description || ''}</div>
        </div>
      `;
    }).join('');

    return `
      <div class="modal-header">
        <div class="modal-title" style="display:inline-flex; align-items:center; gap:6px;"><span>${window.KSool?.pixelIcon ? window.KSool.pixelIcon(baseIng, 24) : baseIng.emoji}</span><span>${baseName} 상세 선택</span></div>
        <button class="modal-close-x" id="picker-close-btn">✕</button>
      </div>
      <button class="picker-default-btn" id="picker-select-default">
        <span>일반 ${baseName} (기본) 선택</span>
      </button>
      <div class="fridge-shelf-grid">${cardsHtml}</div>
    `;
  }
}

/**
 * 대표 재료별 모달 플러그인 레지스트리 (OCP 준수)
 */
class DetailPickerRegistry {
  constructor(brandResolver, inventoryManager, audioService) {
    this.brandResolver = brandResolver;
    this.inventory = inventoryManager;
    this.audio = audioService;
    this.pickers = new Map();

    // 기본 제공 모달 등록 (언제든 새 대표 재료 전용 모달 추가 가능)
    this.register('KOREA_MAP_PICKER', new KoreaMapPickerModal(brandResolver, inventoryManager, audioService));
    this.register('SOJU_BRAND_PICKER', new SojuBrandShowcaseModal(brandResolver, inventoryManager, audioService));
    this.register('BEER_TAP_PICKER', new BeerTapShowcaseModal(brandResolver, inventoryManager, audioService));
    this.defaultPicker = new DefaultShelfPickerModal(brandResolver, inventoryManager, audioService);
  }

  register(componentKey, pickerInstance) {
    this.pickers.set(componentKey, pickerInstance);
  }

  getPicker(componentKey) {
    return this.pickers.get(componentKey) || this.defaultPicker;
  }
}

window.KSool.DetailPickerRegistry = DetailPickerRegistry;
