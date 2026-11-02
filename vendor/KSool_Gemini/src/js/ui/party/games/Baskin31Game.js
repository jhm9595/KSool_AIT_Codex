window.KSool = window.KSool || {};

/**
 * ⑧ 배불러라빈스 31 (Baskin Robbins 31 패러디 술게임 - 원터치 미니멀 에디션)
 * - 불필요한 상단 정보, 하단 확인 버튼, 설명 문구 일체 제거!
 * - 화면 중앙에 오직 3개의 대형 숫자 네모칸 버튼만 시원하게 배치
 * - 3개 중 하나를 누르면 누른 만큼 1초간 활성화 보여주고, 애니메이션과 함께 다음 숫자로 즉시 전환!
 * - 마지막 31을 누른 사람이 패배 (벌칙자 당첨)
 */
class Baskin31Game {
  constructor(hub) {
    this.hub = hub;
    this.currentNumber = 0; // 0부터 시작, 1~31
    this.selectedCount = 0; // 1초간 보여줄 활성화 개수 (0, 1, 2, 3)
    this.isTransitioning = false; // 1초 딜레이 중 중복 터치 방지
    this.isAnimatingIn = false; // 새 숫자 등장 애니메이션 트리거
    this.isFinished = false;
    this.transitionTimer = null;
  }

  init() {
    this.reset();
  }

  reset() {
    if (this.transitionTimer) {
      clearTimeout(this.transitionTimer);
      this.transitionTimer = null;
    }
    this.currentNumber = 0;
    this.selectedCount = 0;
    this.isTransitioning = false;
    this.isAnimatingIn = false;
    this.isFinished = false;
    this.render();
  }

  /**
   * 3개 버튼 중 하나를 클릭했을 때 원터치 진행
   * @param {number} count 1, 2, 3개 중 선택한 수
   */
  handleSelectCount(count) {
    if (this.isFinished) {
      this.reset();
      return;
    }
    if (this.isTransitioning) return;

    const targetNum = this.currentNumber + count;
    if (this.currentNumber + 1 > 31) return;

    // 1초간 선택된 버튼들 활성화 유지
    this.isTransitioning = true;
    this.selectedCount = count;
    this.hub.sound.playTap();
    this.hub.vibrateShort();
    this.render();

    // 1초 보여주고 다음 숫자로 부드럽게 전환!
    this.transitionTimer = setTimeout(() => {
      const nextNumber = this.currentNumber + count;

      // 31 도달 시 -> 탈락/벌칙 발동!
      if (nextNumber >= 31) {
        this.currentNumber = 31;
        this.isFinished = true;
        this.isTransitioning = false;
        this.hub.sound.playExplosion();
        this.hub.triggerPenalty({
          title: '31 당첨! 원샷!',
          subtitle: '배불러라빈스 31 탈락!',
          accentColor: '#f43f5e',
          icon: '🍨'
        });
        this.render();
        return;
      }

      // 정상 진행 -> 다음 사람을 위한 다음 3개 숫자 등장
      this.currentNumber = nextNumber;
      this.selectedCount = 0;
      this.isTransitioning = false;
      this.isAnimatingIn = true;
      this.hub.sound.playUp();
      this.render();

      setTimeout(() => {
        this.isAnimatingIn = false;
        const slotsRow = document.querySelector('.baskin-slots-row');
        if (slotsRow) slotsRow.classList.remove('entering');
      }, 400);
    }, 1000);
  }

  render() {
    const container = document.getElementById('party-game-stage');
    if (!container) return;

    const n1 = this.currentNumber + 1;
    const n2 = this.currentNumber + 2;
    const n3 = this.currentNumber + 3;

    // 슬롯 3개 메타데이터
    const slots = [
      { count: 1, num: n1, available: n1 <= 31, active: this.selectedCount >= 1 },
      { count: 2, num: n2, available: n2 <= 31, active: this.selectedCount >= 2 },
      { count: 3, num: n3, available: n3 <= 31, active: this.selectedCount >= 3 }
    ];

    container.innerHTML = `
      <div class="party-game-box baskin-stage minimal-pure ${this.isFinished ? 'finished' : ''}">
        <!-- 화면 우측 상단 미니멀 리셋 아이콘 -->
        <button type="button" class="baskin-floating-reset-btn" id="btn-baskin-reset" title="새 게임 시작">
          🔄
        </button>

        <!-- 화면 정중앙: 오직 3개의 대형 숫자 네모칸 버튼 -->
        <div class="baskin-pure-center">
          <div class="baskin-slots-row ${this.isAnimatingIn ? 'entering' : ''}">
            ${slots.map(s => {
              if (!s.available) {
                return `
                  <div class="baskin-slot disabled" aria-disabled="true">
                    <span class="slot-num">-</span>
                  </div>
                `;
              }
              const isDanger = s.num === 31;
              return `
                <button type="button" 
                        class="baskin-slot ${s.active ? 'active' : ''} ${isDanger ? 'danger' : ''}" 
                        data-baskin-count="${s.count}"
                        aria-label="${s.num}까지 선택">
                  <span class="slot-num">${s.num}</span>
                  ${isDanger ? '<span class="baskin-skull-pill">💀 31</span>' : ''}
                </button>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;

    this._bindEvents();
  }

  _bindEvents() {
    const container = document.getElementById('party-game-stage');
    if (!container) return;

    // 3개 버튼 클릭
    container.querySelectorAll('[data-baskin-count]').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const count = Number(btn.getAttribute('data-baskin-count'));
        this.handleSelectCount(count);
      };
    });

    // 플로팅 리셋 버튼
    const resetBtn = container.querySelector('#btn-baskin-reset');
    if (resetBtn) {
      resetBtn.onclick = (e) => {
        e.stopPropagation();
        this.hub.sound.playTap();
        this.reset();
      };
    }

    // 게임 종료 상태에서 화면 어디든 탭하면 재시작
    if (this.isFinished) {
      const stage = container.querySelector('.baskin-stage');
      if (stage) {
        stage.onclick = (e) => {
          e.stopPropagation();
          this.hub.sound.playTap();
          this.reset();
        };
      }
    }
  }

  destroy() {
    if (this.transitionTimer) {
      clearTimeout(this.transitionTimer);
      this.transitionTimer = null;
    }
  }
}

window.KSool.Baskin31Game = Baskin31Game;
