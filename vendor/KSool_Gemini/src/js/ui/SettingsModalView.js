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
      this.modalId = modalId;
      this.contentId = contentId;
      this.app = app;
      this.isOpen = false;
    }

    open() {
      const modal = document.getElementById(this.modalId);
      if (!modal) return;
      this.isOpen = true;
      modal.classList.add('active');
      this.render();
    }

    close() {
      const modal = document.getElementById(this.modalId);
      if (!modal) return;
      this.isOpen = false;
      modal.classList.remove('active');
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

          <!-- 2. 전체 진행도 초기화 -->
          <div class="settings-section settings-danger-section">
            <div class="settings-section-title" style="color:#f87171;">진행도 초기화</div>
            <div class="settings-reset-card" style="border-bottom:none; padding:0;">
              <div class="settings-reset-info">
                <div class="settings-reset-desc">해금된 모든 조합과 재료를 처음 상태로 완전히 리셋합니다.</div>
              </div>
              <button type="button" class="settings-danger-btn full-reset" id="settings-reset-all-btn">전체 초기화</button>
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

      // 3. 전체 진행도 리셋
      const resetAllBtn = container.querySelector('#settings-reset-all-btn');
      if (resetAllBtn) {
        resetAllBtn.onclick = () => {
          if (confirm('정말로 모든 해금 기록을 초기 상태로 리셋하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.')) {
            if (app) {
              app.storage?.clearState();
              app.craftingPot?.clear();
              app.inventory.unlockAllSandboxMode = false;
              app.inventory.userLevel = 1;
              app.inventory.craftFailCount = 0;
              app.inventory.shownTabIntros = { collection: false, fridge: false, suggestions: false, detailPicker: false };
              app.pendingTabIntroQueue = [];
              app.inventory.unlockedImageRecipeIds.clear();
              app.inventory.unlockedDescRecipeIds?.clear();
              app.inventory.hintProgressByRecipe = {};
              app.inventory.promotedCustomRecipes = [];
              app.inventory.init();
              app.inventory.save();
              const nextQuiz = app.inventory.getNextQuizRecipe();
              app.quizTargetRecipeId = nextQuiz ? nextQuiz.recipe_id : 5;
              app.quizHintRevealed = false;
              app.brewMode = 'QUIZ';
              app.fridgeEngine?.clearAll();
              app.selectedIngCategory = 'NATURE';
              app.audio?.playTap();
              this.close();
              app.renderAll();
              alert('모든 진행도가 처음 상태로 초기화되었습니다.');
            }
          }
        };
      }
    }
  }

  window.KSool.SettingsModalView = SettingsModalView;
})();
