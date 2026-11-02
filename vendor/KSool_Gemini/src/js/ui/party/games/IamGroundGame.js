window.KSool = window.KSool || {};

/**
 * ⑩ 아이엠그라운드 (I Am Ground - 박자 리듬 술게임 에디션)
 * - 4박자 / 8박자 모드 지원
 * - 2글자 닉네임 설정 및 컴퓨터 AI 참가자 (최대 3명 추가 가능, 총 2~4인)
 * - "아이엠 그라운드 자기소개 하기!" 인트로 후 4박자의 마지막 박자에 자기 이름 탭
 * - 2종류의 컨트롤 버튼:
 *    1) 참여자 이름 버튼 한 줄 (최대 4개)
 *    2) 1~8 숫자 버튼 한 줄 (4박자 모드는 1~4)
 * - 박자에 맞춘 공격(상대 이름 + 숫자) 및 수비(호명된 횟수만큼 박자에 맞춰 내 이름 연타)
 * - 생동감 넘치는 연출:
 *    1) 전원 박자에 맞춰 둠칫둠칫 비트 바운스
 *    2) 실시간 만화 말풍선 ("쿵!", "짝!", "철수!", "영희 셋!", "어버버?! 😵")
 *    3) 지목 시 공격자 -> 피해자 번개 레이저 빔 & 피해자 깜짝 진동 리액션
 *    4) 네온 비트 패드 & 황금빛 타이밍 가이드 링 (PERFECT / HIT / MISS 판정)
 *    5) 랠리가 이어질수록 스피드업(Speed Up)으로 긴장감 극대화!
 */
class IamGroundGame {
  constructor(hub) {
    this.hub = hub;

    // 기본 설정 상태
    this.gameState = 'setup'; // 'setup' | 'playing' | 'game_over'
    this.phase = 'setup'; // 'setup' | 'intro' | 'self_intro' | 'battle'
    this.beatMode = 4; // 4 또는 8
    this.userNickname = '철수';
    this.aiCount = 3; // 1, 2, 3 (총 2~4명)

    // 게임 진행 엔진 변수
    this.players = [];
    this.bpm = 96;
    this.timerId = null;
    this.currentMeasureBeat = 0; // 0 to (totalBeats - 1)
    this.measureIndex = 0;
    this.rallyCount = 0;

    // 인트로 & 자기소개 상태
    this.introBeat = 0;
    this.selfIntroPlayerIdx = 0;
    this.userIntroHit = false;
    this.userIntroRhythmHits = new Set();

    // 배틀 (공격 & 수비) 상태
    this.turnMode = 'attack'; // 'attack' | 'defend'
    this.activeAttackerIdx = 0;
    this.activeDefenderIdx = null;
    this.targetCount = 0;
    this.userAttackTargetChosen = null;
    this.userAttackCountChosen = null;
    this.userAttackRhythmHits = new Set();
    this.defenseRequiredBeats = [];
    this.userDefenseHits = [];
    this.userDefendRhythmHits = new Set();

    // 시각 연출 상태
    this.currentSpeech = {}; // { [playerIdx]: { text, type, time } }
    this.laserTarget = null; // { from: idx, to: idx }
    this.feedbackText = '';
    this.feedbackType = ''; // 'perfect' | 'hit' | 'miss'
    this.feedbackTimer = null;
    this.beatBounceActive = false;
  }

  init() {
    this.reset();
  }

  reset() {
    this._stopBeatLoop();
    this.gameState = 'setup';
    this.phase = 'setup';
    this.currentMeasureBeat = 0;
    this.measureIndex = 0;
    this.rallyCount = 0;
    this.bpm = 96;
    this.currentSpeech = {};
    this.laserTarget = null;
    this.feedbackText = '';
    this.userIntroHit = false;
    this.userIntroRhythmHits = new Set();
    this.userAttackRhythmHits = new Set();
    this.userDefenseHits = [];
    this.userDefendRhythmHits = new Set();
    this.render();
  }

  onPenaltyDismissed() {
    // 벌칙 오버레이가 닫혀도 설정창으로 튕기지 않고, 게임오버 결과 화면에서 [바로 다시 시작] 제공
    this.gameState = 'game_over';
    this.render();
  }

  destroy() {
    this._stopBeatLoop();
  }

  // =========================================================================
  // 참가자 세팅 & 게임 시작
  // =========================================================================

  _buildPlayers() {
    const aiPool = [
      { name: '영희', emoji: '🦊' },
      { name: '맹구', emoji: '🐻' },
      { name: '소주', emoji: '🍶' },
      { name: '맥주', emoji: '🍺' },
      { name: '짱구', emoji: '👦' },
      { name: '유리', emoji: '👧' },
      { name: '민수', emoji: '🦁' },
      { name: '치킨', emoji: '🍗' },
      { name: '루피', emoji: '🐰' }
    ];

    // 유저 이름과 겹치지 않는 AI 선택
    const filteredAi = aiPool.filter(a => a.name !== this.userNickname);
    for (let i = filteredAi.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [filteredAi[i], filteredAi[j]] = [filteredAi[j], filteredAi[i]];
    }

    const selectedAi = filteredAi.slice(0, this.aiCount);

    this.players = [
      {
        id: 'user',
        name: this.userNickname,
        emoji: '🧑‍🎤',
        isUser: true,
        tag: '나'
      },
      ...selectedAi.map((ai, idx) => ({
        id: `ai_${idx + 1}`,
        name: ai.name,
        emoji: ai.emoji,
        isUser: false,
        tag: `COM ${idx + 1}`
      }))
    ];
  }

  startGame() {
    let cleanName = (this.userNickname || '').trim();
    if (cleanName.length < 2) cleanName = '철수';
    if (cleanName.length > 2) cleanName = cleanName.slice(0, 2);
    this.userNickname = cleanName;

    this._buildPlayers();

    this.gameState = 'playing';
    this.phase = 'intro';
    this.introBeat = 0;
    this.currentMeasureBeat = 0;
    this.measureIndex = 0;
    this.rallyCount = 0;
    this.bpm = 96;
    this.currentSpeech = {};
    this.laserTarget = null;
    this.feedbackText = '';
    this.isFirstBeatOfIntro = true;
    this.isFirstBeatOfSelfIntro = true;
    this.isFirstBeatOfBattle = true;

    this.hub.sound.playTap();
    this.hub.vibrateShort();
    this.render();

    this._startBeatLoop();
  }

  // =========================================================================
  // 메트로놈 & 박자 엔진
  // =========================================================================

  _startBeatLoop() {
    this._stopBeatLoop();
    const interval = (60 / this.bpm) * 1000;
    this.timerId = setInterval(() => {
      this._onBeatTick();
    }, interval);
    this._onBeatTick();
  }

  _stopBeatLoop() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  _onBeatTick() {
    if (this.gameState !== 'playing') return;

    this.beatBounceActive = true;

    if (this.phase === 'intro') {
      this._handleIntroBeat();
      return;
    }

    if (this.phase === 'self_intro') {
      this._handleSelfIntroBeat();
      return;
    }

    if (this.phase === 'battle') {
      this._handleBattleBeat();
      return;
    }
  }

  _handleIntroBeat() {
    if (this.isFirstBeatOfIntro) {
      this.introBeat = 0;
      this.isFirstBeatOfIntro = false;
    } else {
      this.introBeat++;
    }

    if (this.introBeat >= 4) {
      this.phase = 'self_intro';
      this.selfIntroPlayerIdx = 0;
      this.currentMeasureBeat = 0;
      this.userIntroHit = false;
      this.currentSpeech = {};
      this.isFirstBeatOfSelfIntro = true;
      this._handleSelfIntroBeat();
      return;
    }

    const introPhrases = ['아이-엠', '그라-운드', '자기-소개', '하기!'];
    const curPhrase = introPhrases[this.introBeat] || '';

    if (this.introBeat % 2 === 0) {
      this.hub.sound.playRhythmThud?.();
    } else {
      this.hub.sound.playRhythmClap?.();
    }

    this.players.forEach((p, idx) => {
      this.currentSpeech[idx] = {
        text: curPhrase,
        type: 'intro',
        time: Date.now()
      };
    });

    this.currentMeasureBeat = this.introBeat;
    this.render();
  }

  _handleSelfIntroBeat() {
    if (this.isFirstBeatOfSelfIntro) {
      this.currentMeasureBeat = 0;
      this.isFirstBeatOfSelfIntro = false;
    } else {
      this.currentMeasureBeat = (this.currentMeasureBeat + 1) % 4;
      if (this.currentMeasureBeat === 0) {
        // 이전 플레이어 결과 검증 (유저는 4번째 박자에 자기 이름을 누르면 성공)
        const prevPlayer = this.players[this.selfIntroPlayerIdx];
        if (prevPlayer && prevPlayer.isUser) {
          if (!this.userIntroHit) {
            this._triggerUserFail(`${prevPlayer.name}님이 4번째 박자에 자기 이름을 누르지 못했습니다!`);
            return;
          }
        }

        this.selfIntroPlayerIdx++;
        this.userIntroHit = false;
        this.userIntroRhythmHits = new Set();

        if (this.selfIntroPlayerIdx >= this.players.length) {
          this._finishSelfIntroPhase();
          return;
        }
      }
    }

    const curPlayer = this.players[this.selfIntroPlayerIdx];
    if (!curPlayer) {
      this._finishSelfIntroPhase();
      return;
    }

    const beat = this.currentMeasureBeat;

    if (beat === 0 || beat === 2) {
      this.hub.sound.playRhythmThud?.();
      this.currentSpeech[this.selfIntroPlayerIdx] = { text: '쿵!', type: 'rhythm', time: Date.now() };
    } else if (beat === 1) {
      this.hub.sound.playRhythmClap?.();
      this.currentSpeech[this.selfIntroPlayerIdx] = { text: '짝!', type: 'rhythm', time: Date.now() };
    } else if (beat === 3) {
      if (!curPlayer.isUser) {
        this.hub.sound.playRhythmHit?.(false);
        this.currentSpeech[this.selfIntroPlayerIdx] = { text: `${curPlayer.name}!`, type: 'name', time: Date.now() };
      }
    }

    this.render();
  }

  _finishSelfIntroPhase() {
    this.phase = 'battle';
    this.turnMode = 'attack';
    this.activeAttackerIdx = 0;
    this.activeDefenderIdx = null;
    this.currentMeasureBeat = 0;
    this.userAttackTargetChosen = null;
    this.userAttackCountChosen = null;
    this.currentSpeech = {};
    this.laserTarget = null;
    this.isFirstBeatOfBattle = true;
    this.hub.sound.playUp?.();
    this._handleBattleBeat();
  }

  _handleBattleBeat() {
    const totalBeats = this.beatMode; // 4 or 8

    if (this.isFirstBeatOfBattle) {
      this.currentMeasureBeat = 0;
      this.isFirstBeatOfBattle = false;
      this.currentSpeech = {};
      this.laserTarget = null;
    } else {
      this.currentMeasureBeat = (this.currentMeasureBeat + 1) % totalBeats;
      if (this.currentMeasureBeat === 0) {
        // 새 마디 시작 시 이전 턴 말풍선 및 레이저 완벽 초기화 (혼란 방지)
        this.currentSpeech = {};
        this.laserTarget = null;
        const shouldContinue = this._onMeasureCompleted(totalBeats);
        if (!shouldContinue) return;
      }
    }

    const beat = this.currentMeasureBeat;
    this.laserTarget = null;

    if (this.turnMode === 'attack') {
      this._handleAttackMeasureBeat(totalBeats, beat);
    } else if (this.turnMode === 'defend') {
      this._handleDefendMeasureBeat(totalBeats, beat);
    }

    this.render();
  }

  _handleAttackMeasureBeat(totalBeats, beat) {
    const attacker = this.players[this.activeAttackerIdx];
    const nameBeat = totalBeats - 2;
    const countBeat = totalBeats - 1;

    if (beat < nameBeat) {
      if (beat % 2 === 0) {
        this.hub.sound.playRhythmThud?.();
        this.currentSpeech[this.activeAttackerIdx] = { text: '쿵!', type: 'rhythm', time: Date.now() };
      } else {
        this.hub.sound.playRhythmClap?.();
        this.currentSpeech[this.activeAttackerIdx] = { text: '짝!', type: 'rhythm', time: Date.now() };
      }
    } else if (beat === nameBeat) {
      if (!attacker.isUser) {
        const targets = this.players.filter((_, i) => i !== this.activeAttackerIdx);
        const chosen = targets[Math.floor(Math.random() * targets.length)];
        this.userAttackTargetChosen = this.players.indexOf(chosen);

        if (this.hub.sound.playRhythmTarget) {
          this.hub.sound.playRhythmTarget(false);
        } else {
          this.hub.sound.playRhythmHit?.(false);
        }
        this.currentSpeech[this.activeAttackerIdx] = { text: `${chosen.name}!`, type: 'attack', time: Date.now() };
        this.laserTarget = { from: this.activeAttackerIdx, to: this.userAttackTargetChosen };
      }
    } else if (beat === countBeat) {
      if (!attacker.isUser) {
        const maxCount = totalBeats;
        const count = Math.floor(Math.random() * maxCount) + 1;
        this.userAttackCountChosen = count;

        const target = this.players[this.userAttackTargetChosen];
        const countKor = this._getCountKorean(count);

        if (this.hub.sound.playRhythmCount) {
          this.hub.sound.playRhythmCount(count);
        } else {
          this.hub.sound.playSnap?.();
        }
        this.currentSpeech[this.activeAttackerIdx] = { text: `${target.name} ${countKor}!`, type: 'attack', time: Date.now() };
        this.currentSpeech[this.userAttackTargetChosen] = { text: '앗! 나?! 😱', type: 'panic', time: Date.now() };
        this.laserTarget = { from: this.activeAttackerIdx, to: this.userAttackTargetChosen };
      }
    }
  }

  _handleDefendMeasureBeat(totalBeats, beat) {
    const defender = this.players[this.activeDefenderIdx];
    const isRequired = this.defenseRequiredBeats.includes(beat);

    if (!isRequired) {
      if (beat % 2 === 0) {
        this.hub.sound.playRhythmThud?.();
        this.currentSpeech[this.activeDefenderIdx] = { text: '쿵!', type: 'rhythm', time: Date.now() };
      } else {
        this.hub.sound.playRhythmClap?.();
        this.currentSpeech[this.activeDefenderIdx] = { text: '짝!', type: 'rhythm', time: Date.now() };
      }
    } else {
      if (!defender.isUser) {
        // AI 탈락 판정: 최소 3회 이상 랠리가 이어진 뒤, 마지막 수비 박자에서만 1회 판정 (초반 돌연사 방지)
        const isLastRequiredBeat = beat === this.defenseRequiredBeats[this.defenseRequiredBeats.length - 1];
        if (isLastRequiredBeat && this.rallyCount >= 3) {
          const failChance = 0.05 + Math.min(0.20, (this.rallyCount - 3) * 0.03);
          if (Math.random() < failChance) {
            this._triggerAiFail(defender, `${defender.name}님이 당황해서 박자를 놓쳤습니다!`);
            return;
          }
        }

        this.hub.sound.playRhythmHit?.(false);
        this.currentSpeech[this.activeDefenderIdx] = { text: `${defender.name}!`, type: 'defend', time: Date.now() };
      }
    }
  }

  _onMeasureCompleted(totalBeats) {
    if (this.turnMode === 'attack') {
      const attacker = this.players[this.activeAttackerIdx];

      if (attacker.isUser) {
        const requiredRhythmCount = totalBeats - 2;
        if (this.userAttackRhythmHits.size < requiredRhythmCount || this.userAttackTargetChosen === null || this.userAttackCountChosen === null) {
          this._triggerUserFail(`${attacker.name}님이 비트 버튼과 대상을 박자에 맞춰 지목하지 못했습니다!`);
          return false;
        }
      }

      const targetIdx = this.userAttackTargetChosen;
      const count = this.userAttackCountChosen;

      this.turnMode = 'defend';
      this.activeDefenderIdx = targetIdx;
      this.targetCount = count;
      this.userDefenseHits = [];
      this.userDefendRhythmHits = new Set();
      this.userAttackRhythmHits = new Set();
      this.currentSpeech = {};
      this.laserTarget = null;

      this.defenseRequiredBeats = [];
      const startBeat = totalBeats - count;
      for (let b = startBeat; b < totalBeats; b++) {
        this.defenseRequiredBeats.push(b);
      }

      this.userAttackTargetChosen = null;
      this.userAttackCountChosen = null;
      return true;

    } else if (this.turnMode === 'defend') {
      const defender = this.players[this.activeDefenderIdx];

      if (defender.isUser) {
        const requiredRhythmCount = totalBeats - this.targetCount;
        if (this.userDefendRhythmHits.size < requiredRhythmCount || this.userDefenseHits.length < this.targetCount) {
          this._triggerUserFail(`${defender.name}님이 수비 박자(비트+이름)를 다 채우지 못하고 놓쳤습니다!`);
          return false;
        }
      }

      this.rallyCount++;
      if (this.hub.sound.playRhythmSuccess) {
        this.hub.sound.playRhythmSuccess();
      } else {
        this.hub.sound.playUp?.();
      }
      this._showFeedback('DEFENSE SUCCESS! 🛡️✨', 'perfect');

      if (this.rallyCount % 4 === 0 && this.bpm < 125) {
        this.bpm += 3;
        this._startBeatLoop();
        if (this.hub.sound.playRhythmSpeedUp) {
          this.hub.sound.playRhythmSpeedUp();
        } else {
          this.hub.sound.playUp?.();
        }
        this._showFeedback('🔥 SPEED UP! 박자가 빨라집니다!', 'perfect');
      }

      this.turnMode = 'attack';
      this.activeAttackerIdx = this.activeDefenderIdx;
      this.activeDefenderIdx = null;
      this.targetCount = 0;
      this.defenseRequiredBeats = [];
      this.userDefenseHits = [];
      this.userDefendRhythmHits = new Set();
      this.userAttackRhythmHits = new Set();
      this.userAttackTargetChosen = null;
      this.userAttackCountChosen = null;
      this.currentSpeech = {};
      this.laserTarget = null;
      return true;
    }
    return true;
  }

  // =========================================================================
  // 유저 컨트롤 핸들러
  // =========================================================================

  /**
   * 동그란 비트 버튼 탭 핸들러 (이름을 부르지 않는 타이밍에 누르는 버튼)
   */
  handleRoundBeatButtonClick() {
    if (this.gameState !== 'playing') return;

    const beat = this.currentMeasureBeat;
    const isEven = beat % 2 === 0;

    if (isEven) {
      this.hub.sound.playRhythmThud?.(true);
    } else {
      this.hub.sound.playRhythmClap?.(true);
    }
    this.hub.vibrateShort();

    // 1. 자기소개 단계
    if (this.phase === 'self_intro') {
      const curPlayer = this.players[this.selfIntroPlayerIdx];
      if (curPlayer && curPlayer.isUser) {
        if (beat < 3) {
          this.userIntroRhythmHits.add(beat);
          this.currentSpeech[0] = { text: isEven ? '쿵!' : '짝!', type: 'rhythm', time: Date.now() };
          this._showFeedback('PERFECT! 🥁', 'perfect');
          this.render();
        } else {
          // 4번째 박자에는 자기 이름을 눌러야 함
          this._triggerUserFail('4번째 박자에는 자기 이름 버튼을 눌러야 합니다!');
        }
      } else {
        // AI 자기소개 중에는 박자 연습 자유
        this.currentSpeech[0] = { text: isEven ? '쿵!' : '짝!', type: 'rhythm', time: Date.now() };
        this.render();
      }
      return;
    }

    // 2. 배틀 단계
    if (this.phase === 'battle') {
      // 2-A. 공격 모드
      if (this.turnMode === 'attack') {
        const attacker = this.players[this.activeAttackerIdx];
        if (attacker.isUser) {
          const nameBeat = this.beatMode - 2;
          const countBeat = this.beatMode - 1;
          if (beat < nameBeat) {
            this.userAttackRhythmHits.add(beat);
            this.currentSpeech[0] = { text: isEven ? '쿵!' : '짝!', type: 'rhythm', time: Date.now() };
            this._showFeedback('PERFECT! 🥁', 'perfect');
            this.render();
          } else if (beat === nameBeat) {
            if (this.userAttackTargetChosen === null) {
              this._showFeedback('상대방 이름을 탭하세요! 👤', 'miss');
            }
          } else if (beat === countBeat) {
            if (this.userAttackCountChosen === null) {
              this._showFeedback('숫자를 탭하세요! 🔢', 'miss');
            }
          }
        } else {
          this.currentSpeech[0] = { text: isEven ? '쿵!' : '짝!', type: 'rhythm', time: Date.now() };
          this.render();
        }
        return;
      }

      // 2-B. 수비 모드
      if (this.turnMode === 'defend') {
        const defender = this.players[this.activeDefenderIdx];
        if (defender.isUser) {
          const isNameBeat = this.defenseRequiredBeats.includes(beat);
          if (!isNameBeat) {
            this.userDefendRhythmHits.add(beat);
            this.currentSpeech[0] = { text: isEven ? '쿵!' : '짝!', type: 'rhythm', time: Date.now() };
            this._showFeedback('HIT! 🥁', 'hit');
            this.render();
          } else {
            this._showFeedback('내 이름을 탭하세요! 🙋', 'miss');
          }
        } else {
          this.currentSpeech[0] = { text: isEven ? '쿵!' : '짝!', type: 'rhythm', time: Date.now() };
          this.render();
        }
      }
    }
  }

  /**
   * 이름 버튼 탭 핸들러 (Row 1 - 맨 위)
   */
  handleNameButtonClick(playerIdx) {
    if (this.gameState !== 'playing') return;
    const player = this.players[playerIdx];
    if (!player) return;

    // 1. 자기소개 단계
    if (this.phase === 'self_intro') {
      const curPlayer = this.players[this.selfIntroPlayerIdx];
      if (curPlayer && curPlayer.isUser) {
        if (player.isUser && this.currentMeasureBeat === 3) {
          this.userIntroHit = true;
          this.hub.sound.playRhythmHit?.(true);
          this.hub.vibrateShort();
          this.currentSpeech[0] = { text: `${player.name}!`, type: 'name', time: Date.now() };
          this._showFeedback('PERFECT! ✨', 'perfect');
          this.render();
        } else if (!player.isUser) {
          this._triggerUserFail('자기소개에서는 자신의 이름을 눌러야 합니다!');
        } else if (this.currentMeasureBeat !== 3) {
          this._triggerUserFail('자기소개에서는 4번째 박자(쿵-짝-쿵-내이름!)에 이름을 눌러야 합니다!');
        }
      }
      return;
    }

    // 2. 배틀 단계
    if (this.phase === 'battle') {
      // 2-A. 공격 모드
      if (this.turnMode === 'attack') {
        const attacker = this.players[this.activeAttackerIdx];
        if (attacker.isUser) {
          const nameBeat = this.beatMode - 2;
          // 지목 타이밍 또는 1박자 전 선입력 허용
          if (this.currentMeasureBeat === nameBeat || this.currentMeasureBeat === nameBeat - 1) {
            if (player.isUser) {
              this._showFeedback('자신을 공격할 수 없습니다! 🙅', 'miss');
              return;
            }
            this.userAttackTargetChosen = playerIdx;
            this.laserTarget = { from: 0, to: playerIdx };
            if (this.hub.sound.playRhythmTarget) {
              this.hub.sound.playRhythmTarget(true);
            } else {
              this.hub.sound.playRhythmHit?.(true);
            }
            this.hub.vibrateShort();
            this.currentSpeech[0] = { text: `${player.name}!`, type: 'attack', time: Date.now() };
            this._showFeedback(`${player.name}! 🎯`, 'hit');
            this.render();
          } else {
            this._showFeedback('지목 타이밍에 이름을 누르세요! 👤', 'miss');
          }
        }
        return;
      }

      // 2-B. 수비 모드
      if (this.turnMode === 'defend') {
        const defender = this.players[this.activeDefenderIdx];
        if (defender.isUser) {
          if (!player.isUser) {
            this._showFeedback('수비할 때는 내 이름을 눌러야 합니다! 🙋', 'miss');
            return;
          }
          const beat = this.currentMeasureBeat;
          if (this.defenseRequiredBeats.includes(beat) && !this.userDefenseHits.includes(beat)) {
            this.userDefenseHits.push(beat);
            this.hub.sound.playRhythmHit?.(true);
            this.hub.vibrateShort();
            this.currentSpeech[0] = { text: `${player.name}!`, type: 'defend', time: Date.now() };
            this._showFeedback(`HIT! (${this.userDefenseHits.length}/${this.targetCount}) 🔥`, 'perfect');
            this.render();
          } else if (!this.defenseRequiredBeats.includes(beat)) {
            this._showFeedback('박자 타이밍에 맞춰 이름을 외치세요!', 'miss');
          }
        }
      }
    }
  }

  /**
   * 숫자 버튼 탭 핸들러 (Row 2 - 중간)
   */
  handleNumberButtonClick(count) {
    if (this.gameState !== 'playing') return;

    if (this.phase === 'battle' && this.turnMode === 'attack') {
      const attacker = this.players[this.activeAttackerIdx];
      if (attacker.isUser) {
        const countBeat = this.beatMode - 1;
        const nameBeat = this.beatMode - 2;
        // 이름이 이미 지목되었고, countBeat 또는 nameBeat 직후에 누른 경우 유연하게 수용
        if (this.currentMeasureBeat === countBeat || (this.currentMeasureBeat === nameBeat && this.userAttackTargetChosen !== null)) {
          if (this.userAttackTargetChosen === null) {
            this._showFeedback('상대방 이름을 먼저 탭하세요! 👤', 'miss');
            return;
          }
          this.userAttackCountChosen = count;
          const target = this.players[this.userAttackTargetChosen];
          const countKor = this._getCountKorean(count);

          if (this.hub.sound.playRhythmCount) {
            this.hub.sound.playRhythmCount(count);
          } else {
            this.hub.sound.playSnap?.();
          }
          this.hub.vibrateShort();
          this.currentSpeech[0] = { text: `${target.name} ${countKor}!`, type: 'attack', time: Date.now() };
          this.currentSpeech[this.userAttackTargetChosen] = { text: '앗! 나?! 😱', type: 'panic', time: Date.now() };
          this.laserTarget = { from: 0, to: this.userAttackTargetChosen };
          this._showFeedback(`${target.name} ${countKor}! ⚡`, 'perfect');
          this.render();
        } else {
          this._showFeedback('지목 타이밍에 맞춰 숫자를 선택하세요!', 'miss');
        }
      }
    }
  }

  // =========================================================================
  // 탈락 및 벌칙 처리
  // =========================================================================

  _triggerUserFail(reason) {
    this._stopBeatLoop();
    this.hub.sound.playRhythmMiss?.();
    this.hub.sound.playExplosion?.();
    this.gameState = 'game_over';
    this.lastGameOverTitle = '🚨 박자 삑사리! 원샷!';
    this.lastGameOverReason = reason;
    this.lastGameOverIcon = '🎙️';

    this.hub.triggerPenalty({
      title: '🚨 박자 삑사리! 원샷!',
      subtitle: `${reason}`,
      accentColor: '#ec4899',
      icon: '🎙️'
    });
    this.render();
  }

  _triggerAiFail(aiPlayer, reason) {
    this._stopBeatLoop();
    this.hub.sound.playRhythmMiss?.();
    this.hub.sound.playCurtainReveal?.();
    this.gameState = 'game_over';
    this.lastGameOverTitle = `🎉 ${aiPlayer.name} 탈락! 벌칙 당첨!`;
    this.lastGameOverReason = `${reason} 유저 승리! 벌칙주 원샷!`;
    this.lastGameOverIcon = '🏆';

    this.hub.triggerPenalty({
      title: `🎉 ${aiPlayer.name} 탈락! 벌칙 당첨!`,
      subtitle: `${reason} 유저 승리! 원샷 축하합니다!`,
      accentColor: '#10b981',
      icon: '🏆'
    });
    this.render();
  }

  _showFeedback(text, type = 'perfect') {
    this.feedbackText = text;
    this.feedbackType = type;
    clearTimeout(this.feedbackTimer);
    this.feedbackTimer = setTimeout(() => {
      this.feedbackText = '';
      this.render();
    }, 1200);
  }

  _getCountKorean(num) {
    const map = {
      1: '하나',
      2: '둘',
      3: '셋',
      4: '넷',
      5: '다섯',
      6: '여섯',
      7: '일곱',
      8: '여덟'
    };
    return map[num] || String(num);
  }

  // =========================================================================
  // 렌더링
  // =========================================================================

  render() {
    const container = document.getElementById('party-game-stage');
    if (!container) return;

    if (this.gameState === 'setup') {
      this._renderSetupStage(container);
    } else {
      this._renderPlayingStage(container);
    }
  }

  _renderSetupStage(container) {
    const nicknames = ['철수', '영희', '소주', '맥주', '짱구', '루피', '치킨', '피자', '콜라', '사이다'];

    container.innerHTML = `
      <div class="party-game-box iamground-setup-stage">
        <div class="iamground-setup-card">
          <div class="iamground-setup-header">
            <span class="iamground-setup-badge">RHYTHM GAME</span>
            <h3 class="iamground-setup-title">🎙️ 아이엠그라운드 설정</h3>
            <p class="iamground-setup-desc">박자에 맞춰 자기소개와 공격/수비를 릴레이하는 리듬 술게임!</p>
          </div>

          <!-- 1. 내 별명 설정 (2글자) -->
          <div class="iamground-setup-section">
            <label class="iamground-label">내 별명 정하기 (딱 2글자)</label>
            <div class="iamground-nick-input-wrap">
              <input type="text" 
                     id="iamground-nick-input" 
                     class="iamground-nick-input" 
                     maxlength="2" 
                     value="${this.userNickname}" 
                     placeholder="2글자" />
            </div>
            <div class="iamground-quick-chips">
              ${nicknames.map(nick => `
                <button type="button" class="iamground-chip ${this.userNickname === nick ? 'active' : ''}" data-nick="${nick}">
                  ${nick}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- 2. 컴퓨터 AI 참가자 수 (1~3명) -->
          <div class="iamground-setup-section">
            <label class="iamground-label">컴퓨터 참가자 수 (총 2~4명)</label>
            <div class="iamground-btn-group">
              <button type="button" class="iamground-sel-btn ${this.aiCount === 1 ? 'active' : ''}" data-ai-count="1">
                1명 (총 2인)
              </button>
              <button type="button" class="iamground-sel-btn ${this.aiCount === 2 ? 'active' : ''}" data-ai-count="2">
                2명 (총 3인)
              </button>
              <button type="button" class="iamground-sel-btn ${this.aiCount === 3 ? 'active' : ''}" data-ai-count="3">
                3명 (총 4인) ⭐추천
              </button>
            </div>
          </div>

          <!-- 3. 박자 선택 (4박자 / 8박자) -->
          <div class="iamground-setup-section">
            <label class="iamground-label">박자 모드 선택</label>
            <div class="iamground-btn-group">
              <button type="button" class="iamground-sel-btn ${this.beatMode === 4 ? 'active' : ''}" data-beat-mode="4">
                🥁 4박자 (클래식)
              </button>
              <button type="button" class="iamground-sel-btn ${this.beatMode === 8 ? 'active' : ''}" data-beat-mode="8">
                ⚡ 8박자 (고수/스피드)
              </button>
            </div>
          </div>

          <button type="button" class="iamground-start-btn" id="btn-iamground-start">
            🔥 아이엠그라운드 시작하기!
          </button>
        </div>
      </div>
    `;

    const nickInput = container.querySelector('#iamground-nick-input');
    if (nickInput) {
      nickInput.oninput = (e) => {
        this.userNickname = e.target.value.trim().slice(0, 2);
      };
    }

    container.querySelectorAll('[data-nick]').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        this.userNickname = btn.getAttribute('data-nick');
        if (nickInput) nickInput.value = this.userNickname;
        this.hub.sound.playTap();
        this.render();
      };
    });

    container.querySelectorAll('[data-ai-count]').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        this.aiCount = parseInt(btn.getAttribute('data-ai-count'), 10);
        this.hub.sound.playTap();
        this.render();
      };
    });

    container.querySelectorAll('[data-beat-mode]').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        this.beatMode = parseInt(btn.getAttribute('data-beat-mode'), 10);
        this.hub.sound.playTap();
        this.render();
      };
    });

    const startBtn = container.querySelector('#btn-iamground-start');
    if (startBtn) {
      startBtn.onclick = (e) => {
        e.stopPropagation();
        this.startGame();
      };
    }
  }

  _renderPlayingStage(container) {
    const totalBeats = (this.phase === 'self_intro' || this.phase === 'intro') ? 4 : this.beatMode;
    const curBeat = this.currentMeasureBeat;

    let statusText = '';
    let statusClass = '';
    if (this.phase === 'intro') {
      statusText = '📢 "아이-엠 그라-운드 자기-소개 하기!"';
      statusClass = 'intro';
    } else if (this.phase === 'self_intro') {
      const curP = this.players[this.selfIntroPlayerIdx];
      if (curP) {
        if (curP.isUser) {
          statusText = `🎙️ [내 차례] 4번째 박자에 [${curP.name}] 버튼을 탭하세요!`;
          statusClass = 'user-action';
        } else {
          statusText = `👀 [${curP.name}] 자기소개 진행 중...`;
          statusClass = 'ai-action';
        }
      }
    } else if (this.phase === 'battle') {
      if (this.turnMode === 'attack') {
        const att = this.players[this.activeAttackerIdx];
        if (att.isUser) {
          statusText = `🎯 [공격] ${this.beatMode - 2}박자에 [상대 이름], ${this.beatMode - 1}박자에 [숫자] 선택!`;
          statusClass = 'user-action';
        } else {
          statusText = `⚡ [${att.name}] 공격 준비 중...`;
          statusClass = 'ai-action';
        }
      } else if (this.turnMode === 'defend') {
        const def = this.players[this.activeDefenderIdx];
        const countKor = this._getCountKorean(this.targetCount);
        if (def.isUser) {
          statusText = `🚨 [비상 수비] 내 이름 [${def.name}]을 박자에 맞춰 ${this.targetCount}번 연타! (${this.userDefenseHits.length}/${this.targetCount})`;
          statusClass = 'user-defend';
        } else {
          statusText = `🛡️ [${def.name}] 수비 중: "${def.name} ${countKor}!"`;
          statusClass = 'ai-action';
        }
      }
    }

    const isUserIntroAction = this.phase === 'self_intro' && this.players[this.selfIntroPlayerIdx]?.isUser;
    const isUserAttackNameAction = this.phase === 'battle' && this.turnMode === 'attack' && this.players[this.activeAttackerIdx]?.isUser && (curBeat === this.beatMode - 2);
    const isUserAttackCountAction = this.phase === 'battle' && this.turnMode === 'attack' && this.players[this.activeAttackerIdx]?.isUser && (curBeat === this.beatMode - 1);
    const isUserDefendAction = this.phase === 'battle' && this.turnMode === 'defend' && this.players[this.activeDefenderIdx]?.isUser;

    container.innerHTML = `
      <div class="party-game-box iamground-stage">
        <!-- 1. 상단 미니 바 -->
        <div class="iamground-top-bar">
          <div class="iamground-stat-pill">
            <span class="m-stat-icon">⚡</span>
            <span class="m-stat-val">${this.bpm} BPM</span>
          </div>
          <div class="iamground-stat-pill highlight">
            <span class="m-stat-icon">🔥</span>
            <span class="m-stat-val">랠리 ${this.rallyCount}회</span>
          </div>
          <button type="button" class="iamground-icon-btn" id="btn-iamground-reset" title="게임 재설정">
            🔄
          </button>
        </div>

        <!-- 2. 중앙 상단: 참가자 아레나 -->
        <div class="iamground-arena">
          ${this.players.map((p, idx) => {
            const isTurn = (this.phase === 'self_intro' && this.selfIntroPlayerIdx === idx) ||
                           (this.phase === 'battle' && this.turnMode === 'attack' && this.activeAttackerIdx === idx) ||
                           (this.phase === 'battle' && this.turnMode === 'defend' && this.activeDefenderIdx === idx);

            const isTargeted = this.laserTarget && this.laserTarget.to === idx;
            // 자기 턴이거나 타깃(패닉)인 경우에만 말풍선 표시, 턴이 끝나면 즉시 사라져 혼란 방지
            const speech = (isTurn || isTargeted) ? this.currentSpeech[idx] : null;

            return `
              <div class="iamground-player-card ${isTurn ? 'active-turn' : ''} ${isTargeted ? 'targeted-shake' : ''}" 
                   data-p-idx="${idx}">
                <div class="iamground-speech-wrap ${speech ? 'show' : ''}">
                  <span class="iamground-speech-bubble ${speech ? speech.type : ''}">
                    ${speech ? speech.text : ''}
                  </span>
                </div>

                <div class="iamground-avatar-box ${this.beatBounceActive ? 'beat-bounce' : ''}">
                  <span class="iamground-avatar-emoji">${p.emoji}</span>
                  ${isTargeted ? '<span class="iamground-target-reticle">🎯</span>' : ''}
                </div>

                <div class="iamground-name-tag ${p.isUser ? 'user-tag' : ''}">
                  <span class="m-name-text">${p.name}</span>
                  <span class="m-role-badge">${p.tag}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- 3. 실시간 액션 배너 & 판정 팝업 -->
        <div class="iamground-banner-section">
          <div class="iamground-action-banner ${statusClass}">
            ${statusText}
          </div>
          ${this.feedbackText ? `
            <div class="iamground-feedback-popup ${this.feedbackType}">
              ${this.feedbackText}
            </div>
          ` : ''}
        </div>

        <!-- 4. 네온 리듬 비트 트랙 -->
        <div class="iamground-rhythm-track">
          ${Array.from({ length: totalBeats }).map((_, bIdx) => {
            const isActive = bIdx === curBeat;
            const isTargetBeat = (this.phase === 'self_intro' && bIdx === 3) ||
                                 (this.phase === 'battle' && this.turnMode === 'attack' && bIdx >= totalBeats - 2) ||
                                 (this.phase === 'battle' && this.turnMode === 'defend' && this.defenseRequiredBeats.includes(bIdx));

            let beatIcon = bIdx % 2 === 0 ? '👞' : '👏';
            if (this.phase === 'self_intro' && bIdx === 3) beatIcon = '🎙️';
            if (this.phase === 'battle' && this.turnMode === 'attack') {
              if (bIdx === totalBeats - 2) beatIcon = '🎯';
              if (bIdx === totalBeats - 1) beatIcon = '🔢';
            }
            if (this.phase === 'battle' && this.turnMode === 'defend' && this.defenseRequiredBeats.includes(bIdx)) {
              beatIcon = '🔥';
            }

            return `
              <div class="iamground-beat-pad ${isActive ? 'active' : ''} ${isTargetBeat ? 'target-pulse' : ''}" 
                   data-beat-idx="${bIdx}">
                <span class="m-beat-num">${bIdx + 1}</span>
                <span class="m-beat-icon">${beatIcon}</span>
              </div>
            `;
          }).join('')}
        </div>

        <!-- 4-B. 게임 오버 결과 오버레이 (설정창으로 튕기지 않고 같은 설정으로 즉시 재도전) -->
        ${this.gameState === 'game_over' ? `
          <div class="iamground-gameover-overlay">
            <div class="iamground-gameover-card">
              <div class="iamground-gameover-icon">${this.lastGameOverIcon || '🚨'}</div>
              <h3 class="iamground-gameover-title">${this.lastGameOverTitle || '게임 종료'}</h3>
              <p class="iamground-gameover-desc">${this.lastGameOverReason || ''}</p>
              <div class="iamground-gameover-stat">
                <span>최종 랠리 기록: <b>${this.rallyCount}회</b></span>
              </div>
              <div class="iamground-gameover-btns">
                <button type="button" class="iamground-replay-btn" id="btn-iamground-replay">
                  🔥 바로 다시 시작
                </button>
                <button type="button" class="iamground-config-btn" id="btn-iamground-goto-setup">
                  ⚙️ 설정 변경하기
                </button>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- 5. 하단 3종 컨트롤 버튼 바 (아래부터: 동그란 버튼 -> 숫자 -> 이름) -->
        <div class="iamground-controls-box">
          <!-- 1) 맨 위: 참여자 이름 버튼 한 줄 -->
          <div class="iamground-controls-label">
            <span>👤 참여자 이름 (지목 / 내 이름 외치기)</span>
          </div>
          <div class="iamground-names-row">
            ${this.players.map((p, idx) => {
              let isHighlighted = false;
              if (isUserIntroAction && p.isUser && curBeat === 3) isHighlighted = true;
              if (isUserDefendAction && p.isUser && this.defenseRequiredBeats.includes(curBeat)) isHighlighted = true;
              if (isUserAttackNameAction && !p.isUser) isHighlighted = true;

              return `
                <button type="button" 
                        class="iamground-name-btn ${p.isUser ? 'user-btn' : ''} ${isHighlighted ? 'highlight-pulse' : ''}" 
                        data-player-idx="${idx}">
                  <span class="m-btn-emoji">${p.emoji}</span>
                  <span class="m-btn-name">${p.name}</span>
                </button>
              `;
            }).join('')}
          </div>

          <!-- 2) 중간: 박자에 따른 1~8 숫자 버튼 한 줄 -->
          <div class="iamground-controls-label">
            <span>🔢 공격 횟수 선택 (1 ~ ${this.beatMode})</span>
          </div>
          <div class="iamground-numbers-row">
            ${Array.from({ length: this.beatMode }).map((_, idx) => {
              const num = idx + 1;
              const isHighlighted = isUserAttackCountAction;
              return `
                <button type="button" 
                        class="iamground-num-btn ${isHighlighted ? 'highlight-pulse' : ''}" 
                        data-count-num="${num}">
                  ${num}
                </button>
              `;
            }).join('')}
          </div>

          <!-- 3) 맨 아래: 동그란 비트 버튼 (이름 부르지 않는 타이밍에 누르는 버튼) -->
          <div class="iamground-controls-label">
            <span>🥁 비트 타기 (이름을 부르지 않는 타이밍에 탭)</span>
          </div>
          <div class="iamground-beat-btn-row">
            ${(() => {
              const isUserIntroRhythm = isUserIntroAction && curBeat < 3;
              const isUserAttackRhythm = this.phase === 'battle' && this.turnMode === 'attack' && this.players[this.activeAttackerIdx]?.isUser && curBeat < (this.beatMode - 2);
              const isUserDefendRhythm = isUserDefendAction && !this.defenseRequiredBeats.includes(curBeat);
              const isRoundHighlighted = isUserIntroRhythm || isUserAttackRhythm || isUserDefendRhythm;

              return `
                <button type="button" 
                        class="iamground-round-beat-btn ${isRoundHighlighted ? 'highlight-pulse' : ''}" 
                        id="btn-iamground-beat"
                        title="이름을 부르지 않는 박자에 탭!">
                  <span class="m-round-btn-icon">${curBeat % 2 === 0 ? '👞' : '👏'}</span>
                  <span class="m-round-btn-label">${curBeat % 2 === 0 ? '쿵 (1·3박)' : '짝 (2·4박)'}</span>
                </button>
              `;
            })()}
          </div>
        </div>
      </div>
    `;

    this._bindPlayingEvents(container);
  }

  _bindPlayingEvents(container) {
    container.querySelectorAll('[data-player-idx]').forEach(btn => {
      const handleTap = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const pIdx = parseInt(btn.getAttribute('data-player-idx'), 10);
        this.handleNameButtonClick(pIdx);
      };
      btn.addEventListener('pointerdown', handleTap);
      btn.onclick = (e) => e.preventDefault();
    });

    container.querySelectorAll('[data-count-num]').forEach(btn => {
      const handleTap = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const count = parseInt(btn.getAttribute('data-count-num'), 10);
        this.handleNumberButtonClick(count);
      };
      btn.addEventListener('pointerdown', handleTap);
      btn.onclick = (e) => e.preventDefault();
    });

    // 3. 동그란 비트 버튼 탭
    const beatBtn = container.querySelector('#btn-iamground-beat');
    if (beatBtn) {
      const handleTap = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.handleRoundBeatButtonClick();
      };
      beatBtn.addEventListener('pointerdown', handleTap);
      beatBtn.onclick = (e) => e.preventDefault();
    }

    const resetBtn = container.querySelector('#btn-iamground-reset');
    if (resetBtn) {
      resetBtn.onclick = (e) => {
        e.stopPropagation();
        this.hub.sound.playTap();
        this.reset();
      };
    }

    const replayBtn = container.querySelector('#btn-iamground-replay');
    if (replayBtn) {
      replayBtn.onclick = (e) => {
        e.stopPropagation();
        this.startGame();
      };
    }

    const gotoSetupBtn = container.querySelector('#btn-iamground-goto-setup');
    if (gotoSetupBtn) {
      gotoSetupBtn.onclick = (e) => {
        e.stopPropagation();
        this.hub.sound.playTap();
        this.reset();
      };
    }
  }
}

window.KSool.IamGroundGame = IamGroundGame;
if (typeof module !== 'undefined' && module.exports) {
  module.exports = IamGroundGame;
}
