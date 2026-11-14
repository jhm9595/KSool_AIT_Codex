/**
 * SettingsModalView - K-SOOL Settings Modal
 *
 * Contains strictly:
 * 1. Sound / Audio Settings (음소거 토글, 0~100% 음량 조절 슬라이더, 동적 아이콘)
 * 2. Entire Game Progress Reset (전체 초기화)
 */
(function() {
  window.KSool = window.KSool || {};

  class SettingsModalView {
    constructor(modalId = 'settings-modal', contentId = 'settings-modal-content', app = null) {
      if (typeof modalId === 'object' && modalId !== null) {
        this.modalId = modalId.modalId || 'settings-modal';
        this.contentId = modalId.contentId || 'settings-modal-content';
        this.app = modalId.app || null;
      } else {
        this.modalId = modalId;
        this.contentId = contentId;
        this.app = app;
      }
      this.isOpen = false;
      this._lastActiveElement = null;
      this._boundKeyHandler = this._handleKeyDown.bind(this);
    }

    open() {
      const modal = document.getElementById(this.modalId);
      if (!modal) return;
      this._lastActiveElement = document.activeElement;
      this.isOpen = true;
      modal.classList.add('active');
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      this.render();

      window.addEventListener('keydown', this._boundKeyHandler);

      // 모달 내부의 첫 번째 포커스 가능한 요소로 이동
      requestAnimationFrame(() => {
        const focusable = this._getFocusableElements();
        if (focusable.length > 0) {
          focusable[0].focus();
        }
      });
    }

    close() {
      const modal = document.getElementById(this.modalId);
      if (!modal) return;
      this.isOpen = false;
      modal.classList.remove('active');
      window.removeEventListener('keydown', this._boundKeyHandler);

      // 모달 열기 전 포커스되어 있던 위치로 복귀
      if (this._lastActiveElement && typeof this._lastActiveElement.focus === 'function') {
        try {
          this._lastActiveElement.focus();
        } catch (_) {}
      }
      this._lastActiveElement = null;
    }

    _getFocusableElements() {
      const modal = document.getElementById(this.modalId);
      if (!modal) return [];
      const selector = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
      return Array.from(modal.querySelectorAll(selector)).filter(el => {
        return el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement;
      });
    }

    _handleKeyDown(e) {
      if (!this.isOpen) return;

      // 1. ESC 누르면 모달 닫기
      if (e.key === 'Escape' || e.keyCode === 27) {
        e.preventDefault();
        e.stopPropagation();
        this.app?.audio?.playTap?.();
        this.close();
        return;
      }

      // 2. Tab 누를 때 모달 내부에서만 포커스 순환 (Focus Trap)
      if (e.key === 'Tab' || e.keyCode === 9) {
        const focusables = this._getFocusableElements();
        if (focusables.length === 0) {
          e.preventDefault();
          return;
        }

        const firstEl = focusables[0];
        const lastEl = focusables[focusables.length - 1];
        const activeEl = document.activeElement;

        if (e.shiftKey) {
          // Shift + Tab: 첫 요소에서 역방향으로 나가려 할 때 마지막 요소로 순환
          if (activeEl === firstEl || !focusables.includes(activeEl)) {
            e.preventDefault();
            lastEl.focus();
          }
        } else {
          // Tab: 마지막 요소에서 나가려 할 때 첫 요소로 순환
          if (activeEl === lastEl || !focusables.includes(activeEl)) {
            e.preventDefault();
            firstEl.focus();
          }
        }
      }
    }

    _getSoundIcon(isMuted, volPercent) {
      if (isMuted || volPercent === 0) return '🔇';
      if (volPercent <= 35) return '🔈';
      if (volPercent <= 70) return '🔉';
      return '🔊';
    }

    render() {
      const content = document.getElementById(this.contentId);
      if (!content) return;

      const app = this.app;
      const audioService = app?.audio;
      const isMuted = audioService ? audioService.isMutedState() : false;
      const volPercent = audioService ? audioService.getVolumePercent() : 70;
      const soundIcon = this._getSoundIcon(isMuted, volPercent);

      const currentTrack = audioService?.getTycoonBgmTrack?.() || 'kpop_dance';
      const isQuiz = (app?.currentMode === 'QUIZ');
      const modeLabel = isQuiz ? '조합 퀴즈' : '주점 타이쿤';
      const availableTracks = audioService?.getAvailableBgmTracks?.() || [];

      const bgmOptionsHtml = availableTracks.map(t => {
        const isSelected = t.id === currentTrack;
        return `<option value="${t.id}" data-bgm-track-id="${t.id}" ${isSelected ? 'selected' : ''}>${t.name}</option>`;
      }).join('');

      content.innerHTML = `
        <div class="modal-header">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:1.2rem;">⚙️</span>
            <div class="modal-title">설정</div>
          </div>
          <button class="modal-close-x" id="settings-close-btn" title="닫기">✕</button>
        </div>

        <div class="settings-modal-body">
          <!-- 1. 효과음 및 사운드 설정 -->
          <div class="settings-section">
            <div class="settings-section-title">효과음 설정</div>
            <div class="settings-sound-card">
              <button type="button" class="settings-sound-mute-btn ${isMuted ? 'is-muted' : ''}" id="settings-sound-mute-btn" title="${isMuted ? '소리 켜기' : '음소거'}">
                <span class="sound-icon-display" id="settings-sound-icon">${soundIcon}</span>
                <span class="sound-mute-btn-label" id="settings-mute-btn-label">${isMuted ? '무음' : '소리'}</span>
              </button>
              <div class="settings-sound-control-col">
                <div class="settings-sound-labels">
                  <span class="sound-status-label" id="settings-sound-status-label">${isMuted ? '음소거 상태' : '효과음 켜짐'}</span>
                  <span class="sound-vol-percent" id="settings-sound-percent">${isMuted ? '0%' : `${volPercent}%`}</span>
                </div>
                <div class="settings-slider-row">
                  <span class="slider-min-icon" id="settings-vol-min-btn" title="최소 음량 (10%)">🔈</span>
                  <input type="range" min="0" max="100" value="${isMuted ? 0 : volPercent}" class="settings-sound-range" id="settings-sound-range" aria-label="음량 조절" />
                  <span class="slider-max-icon" id="settings-vol-max-btn" title="최대 음량 (100%)">🔊</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 2. 타이쿤 배경음악(BGM) 설정 -->
          <div class="settings-section">
            <div class="settings-section-title">타이쿤 배경음악 (BGM)</div>
            <div class="settings-bgm-combobox-wrap">
              <select class="settings-bgm-select" id="settings-bgm-select" aria-label="타이쿤 배경음악 선택">
                ${bgmOptionsHtml}
              </select>
            </div>
          </div>

          <!-- 3. 게임 가이드 & 튜토리얼 -->
          <div class="settings-section">
            <div class="settings-section-title">게임 가이드 & 튜토리얼</div>
            <div class="settings-guide-actions">
              <button type="button" class="settings-guide-btn guide-popup-btn" id="settings-open-guide-btn">
                📖 게임 가이드 보기 (요약 카드)
              </button>
              <button type="button" class="settings-guide-btn live-tutorial-btn" id="settings-start-live-tutorial-btn">
                🎓 실전 조작 튜토리얼 다시하기
              </button>
            </div>
          </div>

          <!-- 4. 현재 모드 진행도 초기화 -->
          <div class="settings-section settings-danger-section">
            <div class="settings-section-title" style="color:#f87171;">${modeLabel} 진행도 초기화</div>
            <div class="settings-reset-card" style="border-bottom:none; padding:0;">
              <div class="settings-reset-info">
                <div class="settings-reset-desc">${isQuiz ? '현재 진행 중인 조합 퀴즈의 진행도를 초기화합니다. (타이쿤 자금 및 점포 기록은 안전하게 보존됩니다)' : '현재 진행 중인 주점 타이쿤의 점포 자금과 기록을 초기화합니다. (조합 퀴즈의 기록은 안전하게 보존됩니다)'}</div>
              </div>
              <button type="button" class="settings-danger-btn full-reset" id="settings-reset-all-btn">${modeLabel} 초기화</button>
            </div>
          </div>
        </div>
      `;

      this._bindEvents(content);
    }

    _bindEvents(container) {
      const app = this.app;
      const audioService = app?.audio;

      // 닫기 버튼
      const closeBtn = container.querySelector('#settings-close-btn');
      if (closeBtn) {
        closeBtn.onclick = () => {
          audioService?.playTap();
          this.close();
        };
      }

      // 모달 바깥 배경 클릭 시 닫기
      const modal = document.getElementById(this.modalId);
      if (modal) {
        modal.onclick = (e) => {
          if (e.target === modal) this.close();
        };
      }

      // 1. 사운드 음소거 토글 버튼
      const muteBtn = container.querySelector('#settings-sound-mute-btn');
      const soundIconEl = container.querySelector('#settings-sound-icon');
      const muteBtnLabelEl = container.querySelector('#settings-mute-btn-label');
      const statusLabelEl = container.querySelector('#settings-sound-status-label');
      const percentEl = container.querySelector('#settings-sound-percent');
      const rangeEl = container.querySelector('#settings-sound-range');
      const minBtn = container.querySelector('#settings-vol-min-btn');
      const maxBtn = container.querySelector('#settings-vol-max-btn');

      const updateSoundUI = (isDragging = false) => {
        if (!audioService) return;
        const isMuted = audioService.isMutedState();
        const volPercent = audioService.getVolumePercent();
        const icon = this._getSoundIcon(isMuted, volPercent);

        if (soundIconEl) soundIconEl.textContent = icon;
        if (muteBtnLabelEl) muteBtnLabelEl.textContent = isMuted ? '무음' : '소리';
        if (muteBtn) muteBtn.classList.toggle('is-muted', isMuted);
        if (statusLabelEl) statusLabelEl.textContent = isMuted ? '음소거 상태' : '효과음 켜짐';
        if (percentEl) percentEl.textContent = isMuted ? '0%' : `${volPercent}%`;

        // 드래그 중에는 사용자가 잡고 있는 input value를 덮어쓰지 않아 조작 튕김/멈춤 방지
        if (rangeEl && !isDragging) {
          rangeEl.value = isMuted ? 0 : volPercent;
        }

        // 실시간 게이지 트랙 채우기 (0% ~ 100%)
        const fillPercent = isMuted ? 0 : volPercent;
        if (rangeEl) {
          rangeEl.style.setProperty(
            '--track-fill',
            `linear-gradient(to right, #38bdf8 0%, #38bdf8 ${fillPercent}%, #334155 ${fillPercent}%, #334155 100%)`
          );
        }
      };

      // 모달 오픈 시 초기 트랙 채움 상태 즉시 렌더링
      updateSoundUI(false);

      if (muteBtn && audioService) {
        muteBtn.onclick = () => {
          audioService.toggleMute();
          updateSoundUI(false);
          if (!audioService.isMutedState()) {
            audioService.playTap();
          }
        };
      }

      // 최소 음량 (10%) 버튼
      if (minBtn && audioService) {
        minBtn.onclick = () => {
          audioService.setVolume(0.1);
          updateSoundUI(false);
          audioService.playTap();
        };
      }

      // 최대 음량 (100%) 버튼
      if (maxBtn && audioService) {
        maxBtn.onclick = () => {
          audioService.setVolume(1.0);
          updateSoundUI(false);
          audioService.playTap();
        };
      }

      // 2. 사운드 볼륨 슬라이더
      let soundDebounceTimer = null;
      const playDebouncedSound = () => {
        if (!audioService || audioService.isMutedState()) return;
        if (soundDebounceTimer) clearTimeout(soundDebounceTimer);
        soundDebounceTimer = setTimeout(() => {
          audioService.playTap();
        }, 75);
      };

      if (rangeEl && audioService) {
        rangeEl.oninput = () => {
          const val = Number(rangeEl.value);
          audioService.setVolume(val / 100);
          updateSoundUI(true);
          playDebouncedSound();
        };

        rangeEl.onchange = () => {
          const val = Number(rangeEl.value);
          audioService.setVolume(val / 100);
          updateSoundUI(false);
          if (!audioService.isMutedState()) {
            audioService.playTap();
          }
        };
      }

      // 2. 타이쿤 BGM 콤보박스 선택
      const bgmSelect = container.querySelector('#settings-bgm-select');
      if (bgmSelect) {
        bgmSelect.onchange = (e) => {
          const trackId = e.target.value;
          if (!trackId || !audioService) return;
          audioService.setTycoonBgmTrack(trackId);
          audioService.previewBgmTrack(trackId);
        };
      }

      // 3. 게임 가이드 & 실전 튜토리얼 열기
      const openGuideBtn = container.querySelector('#settings-open-guide-btn');
      if (openGuideBtn) {
        openGuideBtn.onclick = () => {
          audioService?.playTap?.();
          this.close();
          app?.storyTutorialModalView?.openTutorialOnly?.();
        };
      }

      const startLiveTutBtn = container.querySelector('#settings-start-live-tutorial-btn');
      if (startLiveTutBtn) {
        startLiveTutBtn.onclick = () => {
          audioService?.playTap?.();
          this.close();
          app?.storyTutorialModalView?.startInteractiveTutorial?.();
        };
      }

      // 4. 현재 모드 진행도 리셋
      const resetAllBtn = container.querySelector('#settings-reset-all-btn');
      if (resetAllBtn) {
        resetAllBtn.onclick = () => {
          const isQuiz = (app?.currentMode === 'QUIZ');
          const modeLabel = isQuiz ? '조합 퀴즈' : '주점 타이쿤';
          const otherModeLabel = isQuiz ? '주점 타이쿤' : '조합 퀴즈';
          if (confirm(`정말로 현재 [${modeLabel}] 모드의 진행도를 초기 상태로 리셋하시겠습니까?\n\n※ ${otherModeLabel} 모드의 기록과 점포 자금은 안전하게 보존됩니다.\n※ 이 작업은 되돌릴 수 없습니다.`)) {
            if (app) {
              this.close();
              if (typeof app.resetCurrentModeProgress === 'function') {
                app.resetCurrentModeProgress();
              } else if (typeof app.resetAllGameProgress === 'function') {
                app.resetAllGameProgress();
              }
            }
          }
        };
      }
    }
  }

  window.KSool.SettingsModalView = SettingsModalView;
})();
