window.KSool = window.KSool || {};

/**
 * 도감 그림(아이콘/일러스트) 선해금을 위한 아케이드 미니게임 엔진
 * 1) BRICK_BREAKER : 🧱 도트 아트 벽돌깨기 (각 술의 16x16 레트로 도트 모양/색상 블록 + 전략적 강철 범퍼)
 * 2) TERRITORY_QIX : 📐 외곽 실루엣 땅따먹기 (100% 암전 속 술의 고유 외곽선을 네온으로 표시 + 실루엣 100% 점령 시 클리어)
 */
class ImageMinigameSuite {
  constructor(canvas, recipe, audio, onWin, onLose, onClose) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.recipe = recipe;
    this.audio = audio;
    this.onWin = onWin;
    this.onLose = onLose;
    this.onClose = onClose;
    this.winTimestamp = 0;

    this.width = canvas.width;
    this.height = canvas.height;
    this.rafId = null;
    this.isRunning = false;
    this.gameType = null;
    this.particles = [];
    this.shakeTicks = 0;

    // 오프스크린에 숨겨진 실제 술 그래픽/일러스트 렌더링용 캔버스 (클리어 시 풀컬러 대공개)
    this.hiddenArtCanvas = document.createElement('canvas');
    this.hiddenArtCanvas.width = this.width;
    this.hiddenArtCanvas.height = this.height;

    // 게임 플레이 도중 노출할 다크 섀도우 실루엣 캔버스 (벽돌과 헷갈리지 않는 차분한 단색 실루엣)
    this.hiddenSilhouetteCanvas = document.createElement('canvas');
    this.hiddenSilhouetteCanvas.width = this.width;
    this.hiddenSilhouetteCanvas.height = this.height;

    this._renderHiddenArtwork();

    this._cleanupInputHandlers = null;

    // 모바일 롱프레스/빠른 다중 탭 시 브라우저 복사하기/오려두기/돋보기/컨텍스트 메뉴 원천 차단
    this._preventCanvasCallouts = (e) => {
      if (e.cancelable) e.preventDefault();
      return false;
    };
    this.canvas.addEventListener('contextmenu', this._preventCanvasCallouts, { passive: false });
    this.canvas.addEventListener('selectstart', this._preventCanvasCallouts, { passive: false });
  }

  /**
   * 레트로 16x16 도트 스프라이트 파싱
   * SVG <rect> 요소들을 분석하여 16x16 그리드 및 유효 픽셀 목록, 바운딩 박스를 추출
   */
  _parseDotSprite(recipe) {
    const sprite = window.KSool?.PixelIconRegistry?.getDotSprite
      ? window.KSool.PixelIconRegistry.getDotSprite(recipe)
      : null;
    const grid = Array.from({ length: 16 }, () => Array(16).fill(null));

    if (!sprite || !sprite.innerSvg) {
      // 스프라이트가 없는 경우 기본 술병 모양 자동 생성
      for (let r = 2; r <= 5; r++) { grid[r][7] = '#38bdf8'; grid[r][8] = '#38bdf8'; }
      for (let r = 6; r <= 14; r++) {
        for (let c = 5; c <= 10; c++) grid[r][c] = '#38bdf8';
      }
    } else {
      const rectRegex = /<rect\s+([^>]+)\s*\/?>/g;
      let rm;
      while ((rm = rectRegex.exec(sprite.innerSvg)) !== null) {
        const attrs = rm[1];
        const xMatch = attrs.match(/x="(\d+)"/);
        const yMatch = attrs.match(/y="(\d+)"/);
        const wMatch = attrs.match(/width="(\d+)"/);
        const hMatch = attrs.match(/height="(\d+)"/);
        const fMatch = attrs.match(/fill="([^"]+)"/);
        if (!xMatch || !yMatch || !wMatch || !hMatch || !fMatch) continue;
        const x = parseInt(xMatch[1], 10);
        const y = parseInt(yMatch[1], 10);
        const w = parseInt(wMatch[1], 10);
        const h = parseInt(hMatch[1], 10);
        const fill = fMatch[1];
        for (let r = y; r < y + h; r++) {
          for (let c = x; c < x + w; c++) {
            if (r < 16 && c < 16) {
              grid[r][c] = fill;
            }
          }
        }
      }
    }

    const activePixels = [];
    let minR = 16, maxR = -1, minC = 16, maxC = -1;
    for (let r = 0; r < 16; r++) {
      for (let c = 0; c < 16; c++) {
        if (grid[r][c]) {
          activePixels.push({ r, c, color: grid[r][c] });
          if (r < minR) minR = r;
          if (r > maxR) maxR = r;
          if (c < minC) minC = c;
          if (c > maxC) maxC = c;
        }
      }
    }

    return {
      grid,
      activePixels,
      minR: minR === 16 ? 0 : minR,
      maxR: maxR === -1 ? 15 : maxR,
      minC: minC === 16 ? 0 : minC,
      maxC: maxC === -1 ? 15 : maxC
    };
  }

  /**
   * SVG HTML 문자열을 Canvas 2D 컨텍스트에 동기적으로 즉시 정밀 렌더링
   * (<rect>, <path>, <circle>, <ellipse>, <line> 모두 지원)
   */
  _drawSvgToCanvas(ctx, svgStr, x, y, w, h) {
    if (!svgStr || !ctx) return false;

    const vbMatch = svgStr.match(/viewBox=["']0 0 ([\d\.]+) ([\d\.]+)["']/);
    const vbW = vbMatch ? parseFloat(vbMatch[1]) : 32;
    const vbH = vbMatch ? parseFloat(vbMatch[2]) : 32;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(w / vbW, h / vbH);

    let drawn = false;

    // 1. <rect>
    const rectRegex = /<rect\s+([^>]+)\s*\/?>/g;
    let m;
    while ((m = rectRegex.exec(svgStr)) !== null) {
      const attrs = m[1];
      const rx = parseFloat((attrs.match(/x=["']([^"']+)["']/) || [])[1] || '0');
      const ry = parseFloat((attrs.match(/y=["']([^"']+)["']/) || [])[1] || '0');
      const rw = parseFloat((attrs.match(/width=["']([^"']+)["']/) || [])[1] || '0');
      const rh = parseFloat((attrs.match(/height=["']([^"']+)["']/) || [])[1] || '0');
      const fill = (attrs.match(/fill=["']([^"']+)["']/) || [])[1] || '#ffffff';
      const op = parseFloat((attrs.match(/opacity=["']([^"']+)["']/) || [])[1] || '1');
      if (rw > 0 && rh > 0) {
        ctx.globalAlpha = op;
        ctx.fillStyle = fill;
        ctx.fillRect(rx, ry, rw, rh);
        drawn = true;
      }
    }

    // 2. <path>
    const pathRegex = /<path\s+([^>]+)\s*\/?>/g;
    while ((m = pathRegex.exec(svgStr)) !== null) {
      const attrs = m[1];
      const d = (attrs.match(/d=["']([^"']+)["']/) || [])[1];
      const fill = (attrs.match(/fill=["']([^"']+)["']/) || [])[1];
      const stroke = (attrs.match(/stroke=["']([^"']+)["']/) || [])[1];
      const strokeW = parseFloat((attrs.match(/stroke-width=["']([^"']+)["']/) || [])[1] || '1');
      const op = parseFloat((attrs.match(/opacity=["']([^"']+)["']/) || [])[1] || '1');
      if (d && typeof Path2D !== 'undefined') {
        const p2d = new Path2D(d);
        ctx.globalAlpha = op;
        if (fill && fill !== 'none') {
          ctx.fillStyle = fill;
          ctx.fill(p2d);
          drawn = true;
        }
        if (stroke && stroke !== 'none') {
          ctx.strokeStyle = stroke;
          ctx.lineWidth = strokeW;
          ctx.stroke(p2d);
          drawn = true;
        }
      }
    }

    // 3. <circle>
    const circleRegex = /<circle\s+([^>]+)\s*\/?>/g;
    while ((m = circleRegex.exec(svgStr)) !== null) {
      const attrs = m[1];
      const cx = parseFloat((attrs.match(/cx=["']([^"']+)["']/) || [])[1] || '0');
      const cy = parseFloat((attrs.match(/cy=["']([^"']+)["']/) || [])[1] || '0');
      const r = parseFloat((attrs.match(/r=["']([^"']+)["']/) || [])[1] || '0');
      const fill = (attrs.match(/fill=["']([^"']+)["']/) || [])[1] || '#ffffff';
      const stroke = (attrs.match(/stroke=["']([^"']+)["']/) || [])[1];
      const strokeW = parseFloat((attrs.match(/stroke-width=["']([^"']+)["']/) || [])[1] || '1');
      const op = parseFloat((attrs.match(/opacity=["']([^"']+)["']/) || [])[1] || '1');
      if (r > 0) {
        ctx.globalAlpha = op;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        if (fill && fill !== 'none') {
          ctx.fillStyle = fill;
          ctx.fill();
        }
        if (stroke && stroke !== 'none') {
          ctx.strokeStyle = stroke;
          ctx.lineWidth = strokeW;
          ctx.stroke();
        }
        drawn = true;
      }
    }

    // 4. <ellipse>
    const ellipseRegex = /<ellipse\s+([^>]+)\s*\/?>/g;
    while ((m = ellipseRegex.exec(svgStr)) !== null) {
      const attrs = m[1];
      const cx = parseFloat((attrs.match(/cx=["']([^"']+)["']/) || [])[1] || '0');
      const cy = parseFloat((attrs.match(/cy=["']([^"']+)["']/) || [])[1] || '0');
      const rx = parseFloat((attrs.match(/rx=["']([^"']+)["']/) || [])[1] || '0');
      const ry = parseFloat((attrs.match(/ry=["']([^"']+)["']/) || [])[1] || '0');
      const fill = (attrs.match(/fill=["']([^"']+)["']/) || [])[1] || '#ffffff';
      const op = parseFloat((attrs.match(/opacity=["']([^"']+)["']/) || [])[1] || '1');
      if (rx > 0 && ry > 0) {
        ctx.globalAlpha = op;
        ctx.beginPath();
        if (ctx.ellipse) {
          ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        } else {
          ctx.arc(cx, cy, Math.max(rx, ry), 0, Math.PI * 2);
        }
        ctx.fillStyle = fill;
        ctx.fill();
        drawn = true;
      }
    }

    // 5. <line>
    const lineRegex = /<line\s+([^>]+)\s*\/?>/g;
    while ((m = lineRegex.exec(svgStr)) !== null) {
      const attrs = m[1];
      const x1 = parseFloat((attrs.match(/x1=["']([^"']+)["']/) || [])[1] || '0');
      const y1 = parseFloat((attrs.match(/y1=["']([^"']+)["']/) || [])[1] || '0');
      const x2 = parseFloat((attrs.match(/x2=["']([^"']+)["']/) || [])[1] || '0');
      const y2 = parseFloat((attrs.match(/y2=["']([^"']+)["']/) || [])[1] || '0');
      const stroke = (attrs.match(/stroke=["']([^"']+)["']/) || [])[1] || '#ffffff';
      const strokeW = parseFloat((attrs.match(/stroke-width=["']([^"']+)["']/) || [])[1] || '1');
      const op = parseFloat((attrs.match(/opacity=["']([^"']+)["']/) || [])[1] || '1');
      ctx.globalAlpha = op;
      ctx.strokeStyle = stroke;
      ctx.lineWidth = strokeW;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      drawn = true;
    }

    // 6. <polygon>
    const polyRegex = /<polygon\s+([^>]+)\s*\/?>/g;
    while ((m = polyRegex.exec(svgStr)) !== null) {
      const attrs = m[1];
      const pointsStr = (attrs.match(/points=["']([^"']+)["']/) || [])[1];
      const fill = (attrs.match(/fill=["']([^"']+)["']/) || [])[1] || '#ffffff';
      const stroke = (attrs.match(/stroke=["']([^"']+)["']/) || [])[1];
      const strokeW = parseFloat((attrs.match(/stroke-width=["']([^"']+)["']/) || [])[1] || '1');
      const op = parseFloat((attrs.match(/opacity=["']([^"']+)["']/) || [])[1] || '1');
      if (pointsStr) {
        const pts = pointsStr.trim().split(/\s+/).map(pair => pair.split(',').map(Number));
        if (pts.length > 1) {
          ctx.save();
          ctx.globalAlpha = op;
          ctx.beginPath();
          ctx.moveTo(pts[0][0], pts[0][1]);
          for (let i = 1; i < pts.length; i++) {
            ctx.lineTo(pts[i][0], pts[i][1]);
          }
          ctx.closePath();
          if (fill && fill !== 'none') {
            ctx.fillStyle = fill;
            ctx.fill();
            drawn = true;
          }
          if (stroke && stroke !== 'none') {
            ctx.strokeStyle = stroke;
            ctx.lineWidth = strokeW;
            ctx.stroke();
            drawn = true;
          }
          ctx.restore();
        }
      }
    }

    ctx.restore();
    return drawn;
  }

  /**
   * 오프스크린 캔버스에 숨겨진 실제 술 그래픽/일러스트 렌더링
   * 각 게임의 목표 영역(bounds: { x, y, w, h })에 정확히 맞추어 1:1 위치 일치 보장
   */
  _renderHiddenArtwork(bounds = null) {
    const c = this.hiddenArtCanvas;
    const g = c.getContext('2d');
    const w = c.width;
    const h = c.height;

    const cx = w / 2;
    const cy = (h + 32) / 2;

    const drawBackground = () => {
      const rad = g.createRadialGradient(cx, cy, 20, cx, cy, w * 0.75);
      rad.addColorStop(0, '#1e293b');
      rad.addColorStop(0.55, '#0f172a');
      rad.addColorStop(1, '#050811');
      g.fillStyle = rad;
      g.fillRect(0, 0, w, h);
    };

    drawBackground();

    const targetX = bounds ? bounds.x : (cx - 100);
    const targetY = bounds ? bounds.y : (cy - 100);
    const targetW = bounds ? bounds.w : 200;
    const targetH = bounds ? bounds.h : 200;

    let drawn = false;
    if (this.recipe && window.KSool?.pixelIcon) {
      try {
        const svgStr = window.KSool.pixelIcon(this.recipe, Math.max(targetW, targetH));
        if (svgStr) {
          drawn = this._drawSvgToCanvas(g, svgStr, targetX, targetY, targetW, targetH);
        }
      } catch (err) {
        console.warn('Canvas SVG draw error:', err);
      }
    }

    if (!drawn) {
      g.font = `${Math.floor(Math.min(targetW, targetH) * 0.52)}px sans-serif`;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.shadowColor = 'rgba(250, 204, 21, 0.6)';
      g.shadowBlur = 18;
      g.fillText(this.recipe ? this.recipe.emoji : '🍶', targetX + targetW / 2, targetY + targetH / 2);
      g.shadowBlur = 0;
    }
  }

  /**
   * 벽돌깨기 전용: 도트 스프라이트 좌표계와 1:1로 완벽히 정렬된 숨겨진 실제 술 아트 렌더링
   * 각 블록의 원래 고유 색상(p.color)을 블록 좌표 (padX + c*pitchX, topY + r*pitchY, bw, bh)에 1픽셀 오차 없이 정밀 렌더링
   */
  _renderBrickHiddenArtwork(dotInfo, { padX, topY, bw, bh, pitchX, pitchY }) {
    const c = this.hiddenArtCanvas;
    const g = c.getContext('2d');
    const w = c.width;
    const h = c.height;

    // 1. 세련된 방사형 배경
    const cx = w / 2;
    const cy = topY + 8 * pitchY;
    const rad = g.createRadialGradient(cx, cy, 20, cx, cy, w * 0.75);
    rad.addColorStop(0, '#1a2333');
    rad.addColorStop(0.55, '#0b1120');
    rad.addColorStop(1, '#050811');
    g.fillStyle = rad;
    g.fillRect(0, 0, w, h);

    // 2. 각 도트 픽셀의 실제 색상을 블록 좌표에 1:1로 정확하게 렌더링
    for (const p of dotInfo.activePixels) {
      const bx = padX + p.c * pitchX;
      const by = topY + p.r * pitchY;

      // 본체 실제 술 색상
      g.fillStyle = p.color;
      g.fillRect(bx, by, bw, bh);

      // 입체적인 픽셀 하이라이트 & 쉐도우 (도트 아트의 질감 극대화)
      g.fillStyle = 'rgba(255, 255, 255, 0.22)';
      g.fillRect(bx, by, bw, 1.5);
      g.fillRect(bx, by, 1.5, bh);

      g.fillStyle = 'rgba(0, 0, 0, 0.25)';
      g.fillRect(bx, by + bh - 1.5, bw, 1.5);
      g.fillRect(bx + bw - 1.5, by, 1.5, bh);

      // 은은한 외곽 경계선
      g.strokeStyle = 'rgba(0, 0, 0, 0.35)';
      g.lineWidth = 1;
      g.strokeRect(bx, by, bw, bh);
    }

    // 3. 플레이 도중 깨진 자리에 보여줄 다크 섀도우 실루엣 캔버스 렌더링
    // 벽돌(밝은 네온블루)과 확실히 대비되는 어두운 단색 실루엣(#1e293b)으로 표현하여 시각적 혼동 100% 해소!
    if (!this.hiddenSilhouetteCanvas) {
      this.hiddenSilhouetteCanvas = document.createElement('canvas');
      this.hiddenSilhouetteCanvas.width = w;
      this.hiddenSilhouetteCanvas.height = h;
    }
    const sc = this.hiddenSilhouetteCanvas;
    const sg = sc.getContext('2d');
    sg.fillStyle = '#050811';
    sg.fillRect(0, 0, w, h);

    const srad = sg.createRadialGradient(cx, cy, 20, cx, cy, w * 0.75);
    srad.addColorStop(0, '#0f172a');
    srad.addColorStop(1, '#050811');
    sg.fillStyle = srad;
    sg.fillRect(0, 0, w, h);

    for (const p of dotInfo.activePixels) {
      const bx = padX + p.c * pitchX;
      const by = topY + p.r * pitchY;

      // 차분한 다크 슬레이트 실루엣
      sg.fillStyle = '#1e293b';
      sg.fillRect(bx, by, bw, bh);

      // 은은한 실루엣 테두리 음영
      sg.strokeStyle = 'rgba(51, 65, 85, 0.45)';
      sg.lineWidth = 1;
      sg.strokeRect(bx, by, bw, bh);
    }
  }

  stop() {
    this.isRunning = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this._cleanupInputHandlers) {
      this._cleanupInputHandlers();
      this._cleanupInputHandlers = null;
    }
    if (this._cleanupJoystick) {
      this._cleanupJoystick();
      this._cleanupJoystick = null;
    }
  }

  destroy() {
    this.stop();
    if (this._preventCanvasCallouts && this.canvas) {
      this.canvas.removeEventListener('contextmenu', this._preventCanvasCallouts);
      this.canvas.removeEventListener('selectstart', this._preventCanvasCallouts);
    }
  }

  start(gameType) {
    this.stop();
    this.gameType = gameType;
    this.gameState = 'READY';
    this.isRunning = true;
    this.particles = [];
    this.shakeTicks = 0;

    if (gameType === 'BRICK_BREAKER') {
      this._initBrickBreaker();
    } else if (gameType === 'TERRITORY_QIX') {
      this._initTerritoryQix();
    } else if (gameType === 'NONOGRAM') {
      this._initNonogram();
    }

    const loop = () => {
      if (!this.isRunning) return;
      this._update();
      this._draw();
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  setQixDirection(dc, dr) {
    if (!this.isRunning || this.gameType !== 'TERRITORY_QIX' || !this.qixState) return;
    if (this.gameState === 'READY') {
      this.gameState = 'PLAYING';
      this.qixState.lastTime = performance.now();
      this.qixState.player.moveAccum = 0;
      this.audio?.playTap?.();
    } else if (this.gameState === 'OVER') {
      this.audio?.playTap?.();
      this._resetTerritoryQixState();
      this.gameState = 'PLAYING';
    }
    const pl = this.qixState.player;
    const grid = this.qixState.grid;
    const isDrawing = grid[pl.r] && grid[pl.r][pl.c] === 2;
    const isReverse = (pl.dc !== 0 && dc === -pl.dc) || (pl.dr !== 0 && dr === -pl.dr);
    const nc = pl.c + dc;
    const nr = pl.r + dr;
    const nextCell = grid[nr] ? grid[nr][nc] : null;

    // 1. 자기 자신의 선(2)으로 돌진하는 것은 즉사이므로 원천 차단
    if (nextCell === 2) return;
    // 2. 선을 긋고 있는 도중 180도 역주행 완전 차단
    if (isDrawing && isReverse) return;

    pl.dc = dc;
    pl.dr = dr;
    pl.pendingDir = null;
  }

  setQixPendingDirection(dc, dr) {
    if (!this.isRunning || this.gameType !== 'TERRITORY_QIX' || !this.qixState) return;
    const pl = this.qixState.player;
    pl.pendingDir = { dc, dr, expireAt: performance.now() + 400 };
  }

  stopQixPlayer() {
    if (!this.isRunning || this.gameType !== 'TERRITORY_QIX' || !this.qixState) return;
    const pl = this.qixState.player;
    pl.dc = 0;
    pl.dr = 0;
    pl.pendingDir = null;
  }

  launchBall() {
    if (this.gameType === 'BRICK_BREAKER' && this.bbState) {
      const st = this.bbState;
      if (!st.isLaunched || this.gameState === 'READY') {
        st.isLaunched = true;
        this.gameState = 'PLAYING';
        st.lastTime = performance.now();
        const b = st.balls ? st.balls[0] : null;
        if (b) {
          const baseSpeed = 8.2;
          const angle = this._getLaunchAngle();
          b.vx = Math.cos(angle) * baseSpeed;
          b.vy = Math.sin(angle) * baseSpeed;
        }
        this.audio?.playTap?.();
      }
    }
  }

  /**
   * 발사 각도: 패들 위치 기반 조준각에 약간의 랜덤 편차를 더해
   * 정면 일직선 왕복(지루한 패턴)이 되지 않도록 보정
   */
  _getLaunchAngle() {
    const st = this.bbState;
    let angle = (st && typeof st.aimAngle === 'number') ? st.aimAngle : -Math.PI / 2;
    angle += (Math.random() - 0.5) * 0.7;
    const minA = -Math.PI + 0.38;
    const maxA = -0.38;
    return Math.max(minA, Math.min(maxA, angle));
  }

  toggleTurbo() {
    if (this.gameType === 'BRICK_BREAKER' && this.bbState) {
      this.bbState.isTurbo = !this.bbState.isTurbo;
      this.audio?.playTap?.();
      return this.bbState.isTurbo;
    }
    return false;
  }

  toggleDash() {
    if (this.gameType === 'TERRITORY_QIX' && this.qixState) {
      this.qixState.isDash = !this.qixState.isDash;
      this.audio?.playTap?.();
      return this.qixState.isDash;
    }
    return false;
  }

  setDash(bool) {
    if (this.gameType === 'TERRITORY_QIX' && this.qixState) {
      this.qixState.isDash = !!bool;
    }
  }

  setNonogramTool(tool) {
    if (this.gameType === 'NONOGRAM' && this.nonogramState) {
      this.nonogramState.toolMode = (tool === 'X' || tool === 'MARK') ? 'X' : 'FILL';
    }
  }

  resetNonogram() {
    if (this.gameType === 'NONOGRAM' && this.nonogramState) {
      for (let r = 0; r < this.nonogramState.rows; r++) {
        this.nonogramState.board[r].fill(0);
      }
      this.audio?.playTap?.();
    }
  }

  fireLaser() {
    if (this.gameType === 'BRICK_BREAKER' && this.bbState) {
      const st = this.bbState;
      if (st.activePowerups?.laserTimer > 0) {
        const p = st.paddle;
        st.lasers.push(
          { x: p.x + 8, y: p.y - 4, vy: -13 },
          { x: p.x + p.w - 8, y: p.y - 4, vy: -13 }
        );
        this.audio?.playTap?.();
      }
    }
  }

  getGameStats() {
    if (this.gameType === 'BRICK_BREAKER' && this.bbState) {
      const st = this.bbState;
      const pct = (st.brokenCount / Math.max(1, st.totalBreakable)) * 100;
      return {
        lives: st.lives,
        brokenCount: st.brokenCount,
        totalBreakable: st.totalBreakable,
        progressPct: pct,
        isTurbo: st.isTurbo,
        isLaunched: st.isLaunched,
        combo: st.combo,
        activePowerups: { ...st.activePowerups }
      };
    }
    if (this.gameType === 'TERRITORY_QIX' && this.qixState) {
      const st = this.qixState;
      return {
        lives: st.lives,
        claimedTerritoryPct: st.claimedTerritoryPct || 0,
        silhouetteRevealedPct: st.silhouetteRevealedPct || 0,
        isDash: st.isDash
      };
    }
    return null;
  }

  /**
   * 탕탕특공대 스타일 가상 조이스틱 바인딩 (땅따먹기 전용)
   */
  bindJoystick(padEl, knobEl, zoneEl) {
    this._joystickElements = { padEl, knobEl, zoneEl };
    if (this._cleanupJoystick) {
      this._cleanupJoystick();
      this._cleanupJoystick = null;
    }
    if (!padEl || !knobEl) return;

    let isDragging = false;
    let activePointerId = null;
    let centerX = 0;
    let centerY = 0;
    const maxRadius = 35; // 썸스틱 최대 이동 거리 (px)

    const arrowUp = padEl.querySelector('.arrow-up');
    const arrowDown = padEl.querySelector('.arrow-down');
    const arrowLeft = padEl.querySelector('.arrow-left');
    const arrowRight = padEl.querySelector('.arrow-right');

    const updateArrows = (dc, dr) => {
      if (arrowUp) arrowUp.classList.toggle('active', dr === -1);
      if (arrowDown) arrowDown.classList.toggle('active', dr === 1);
      if (arrowLeft) arrowLeft.classList.toggle('active', dc === -1);
      if (arrowRight) arrowRight.classList.toggle('active', dc === 1);
    };

    const resetKnob = () => {
      knobEl.style.transform = 'translate(0px, 0px)';
      padEl.classList.remove('dragging');
      updateArrows(0, 0);
      this.stopQixPlayer();
    };
    this._resetJoystickUI = resetKnob;

    const handlePointerMove = (clientX, clientY) => {
      if (!isDragging) return;
      const dx = clientX - centerX;
      const dy = clientY - centerY;
      const dist = Math.hypot(dx, dy);

      if (dist < 8) {
        // 데드존 (정지)
        knobEl.style.transform = `translate(${dx}px, ${dy}px)`;
        updateArrows(0, 0);
        this.stopQixPlayer();
        return;
      }

      // 썸스틱 위치 클램핑
      const clampedDist = Math.min(dist, maxRadius);
      const angle = Math.atan2(dy, dx);
      const knobX = Math.cos(angle) * clampedDist;
      const knobY = Math.sin(angle) * clampedDist;
      knobEl.style.transform = `translate(${knobX}px, ${knobY}px)`;

      // 4방향 결정 (오른쪽: -45°~45°, 아래: 45°~135°, 왼쪽: 135°~225°, 위: -135°~-45°)
      let reqDc = 0, reqDr = 0;
      if (angle >= -Math.PI / 4 && angle < Math.PI / 4) {
        reqDc = 1; reqDr = 0; // 우
      } else if (angle >= Math.PI / 4 && angle < 3 * Math.PI / 4) {
        reqDc = 0; reqDr = 1; // 하
      } else if (angle >= 3 * Math.PI / 4 || angle < -3 * Math.PI / 4) {
        reqDc = -1; reqDr = 0; // 좌
      } else {
        reqDc = 0; reqDr = -1; // 상
      }

      updateArrows(reqDc, reqDr);
      this.setQixDirection(reqDc, reqDr);
    };

    const onPointerDown = (e) => {
      e.preventDefault();
      isDragging = true;
      activePointerId = e.pointerId ?? (e.touches ? e.touches[0].identifier : null);

      const rect = padEl.getBoundingClientRect();
      centerX = rect.left + rect.width / 2;
      centerY = rect.top + rect.height / 2;

      padEl.classList.add('dragging');
      const clientX = e.clientX ?? (e.touches ? e.touches[0].clientX : centerX);
      const clientY = e.clientY ?? (e.touches ? e.touches[0].clientY : centerY);

      // 게임이 READY면 즉시 시작, OVER면 재시작 후 즉시 플레이
      if (this.gameState === 'READY') {
        this.setQixDirection(0, 0);
      } else if (this.gameState === 'OVER') {
        this.audio.playTap();
        this._resetTerritoryQixState();
        this.gameState = 'PLAYING';
      }

      handlePointerMove(clientX, clientY);
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;
      if (e.cancelable) e.preventDefault();
      let clientX, clientY;
      if (e.touches) {
        const touch = Array.from(e.touches).find(t => t.identifier === activePointerId) || e.touches[0];
        if (!touch) return;
        clientX = touch.clientX;
        clientY = touch.clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      handlePointerMove(clientX, clientY);
    };

    const onPointerUp = () => {
      if (!isDragging) return;
      isDragging = false;
      activePointerId = null;
      resetKnob();
    };

    padEl.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    padEl.addEventListener('touchstart', onPointerDown, { passive: false });
    window.addEventListener('touchmove', onPointerMove, { passive: false });
    window.addEventListener('touchend', onPointerUp);
    window.addEventListener('touchcancel', onPointerUp);

    this._cleanupJoystick = () => {
      padEl.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      padEl.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
      window.removeEventListener('touchcancel', onPointerUp);
      resetKnob();
      this._resetJoystickUI = null;
    };
  }

  _spawnParticles(x, y, color, count = 12) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 1.5 + Math.random() * 4.2;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        life: 18 + Math.floor(Math.random() * 14),
        maxLife: 32,
        color,
        size: 2.5 + Math.random() * 3.5
      });
    }
  }

  _updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.12;
      p.life--;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
    if (this.shakeTicks > 0) this.shakeTicks--;
  }

  _drawParticles(ctx) {
    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    ctx.globalAlpha = 1;
  }

  _drawOverlayPrompt(ctx, text, subText = '', isOver = false) {
    const pulse = 0.85 + 0.15 * Math.sin(performance.now() * 0.006);
    const cx = this.width / 2;
    const cy = this.height / 2 + 20;

    ctx.save();
    if (isOver) {
      ctx.fillStyle = 'rgba(7, 11, 20, 0.65)';
      ctx.fillRect(0, 32, this.width, this.height - 32);
    }

    const isWin = (text === 'Clear!');
    const boxW = isWin ? 150 : (subText ? 220 : 180);
    const boxH = subText ? 46 : 40;
    const boxX = cx - boxW / 2;
    const boxY = cy - boxH / 2;

    let glowColor = 'rgba(56, 189, 248, 0.7)';
    let strokeColor = `rgba(56, 189, 248, ${0.85 * pulse})`;
    let textColor = '#38bdf8';

    if (isOver) {
      glowColor = 'rgba(239, 68, 68, 0.7)';
      strokeColor = `rgba(239, 68, 68, ${0.75 * pulse})`;
      textColor = '#fca5a5';
    } else if (isWin) {
      glowColor = 'rgba(52, 211, 153, 0.85)';
      strokeColor = `rgba(52, 211, 153, ${0.9 * pulse})`;
      textColor = '#34d399';
    }

    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 12 * pulse;

    ctx.fillStyle = isOver ? 'rgba(30, 20, 35, 0.94)' : 'rgba(15, 23, 42, 0.94)';
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;

    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(boxX, boxY, boxW, boxH, boxH / 2);
    } else {
      ctx.rect(boxX, boxY, boxW, boxH);
    }
    ctx.fill();
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.font = isWin
      ? 'bold 20px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif'
      : 'bold 16px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = textColor;
    ctx.fillText(text, cx, cy + (subText ? -7 : 0));

    if (subText) {
      ctx.font = '12px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(subText, cx, cy + 11);
    }
    ctx.restore();
  }

  _drawHUD(ctx, { lives, progressPct, labelText }) {
    ctx.fillStyle = 'rgba(9, 13, 24, 0.92)';
    ctx.fillRect(0, 0, this.width, 32);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 32);
    ctx.lineTo(this.width, 32);
    ctx.stroke();

    // 라이프 표시
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    let hearts = '';
    for (let i = 0; i < 3; i++) {
      hearts += i < lives ? '❤️' : '🖤';
    }
    ctx.fillText(hearts, 10, 16);

    // 진행도 텍스트 (우측)
    ctx.textAlign = 'right';
    ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
    ctx.fillStyle = '#fde047';
    ctx.fillText(labelText || `${Math.floor(progressPct)}%`, this.width - 10, 16);

    // 중앙 상단 진행 바
    const barW = Math.min(130, this.width - 180);
    const barH = 7;
    const barX = this.width / 2 - barW / 2;
    const barY = 13;

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.strokeStyle = '#475569';
    ctx.strokeRect(barX, barY, barW, barH);

    const fillW = Math.max(0, Math.min(barW, barW * (progressPct / 100)));
    const grad = ctx.createLinearGradient(barX, barY, barX + fillW, barY);
    grad.addColorStop(0, '#3b82f6');
    grad.addColorStop(1, '#10b981');
    ctx.fillStyle = grad;
    ctx.fillRect(barX, barY, fillW, barH);
  }

  // =========================================================================
  // 1. 🧱 도트 아트 벽돌깨기 (알카노이드 정통 룰 + 쾌속 발사 + 파워업 캡슐)
  // =========================================================================
  _initBrickBreaker() {
    const dotInfo = this._parseDotSprite(this.recipe);

    const cols = 16;
    const rows = 16;
    const bw = 20;
    const bh = 13;
    const gapX = 2;
    const gapY = 2;
    const pitchX = bw + gapX;
    const pitchY = bh + gapY;

    const stageW = cols * pitchX - gapX;
    const stageH = rows * pitchY - gapY;
    const padX = Math.floor((this.width - stageW) / 2);
    const topY = 44;

    this._renderBrickHiddenArtwork(dotInfo, {
      padX,
      topY,
      bw,
      bh,
      pitchX,
      pitchY
    });

    this.bbState = {
      lives: 3,
      elapsed: 0,
      lastTime: performance.now(),
      readyTime: performance.now(),
      targetPct: 100,
      blockAreaBottom: topY + stageH,
      isLaunched: false,
      aimAngle: -Math.PI / 2, // 기본 상향 (-90도)
      isTurbo: false,
      paddle: {
        x: this.width / 2 - 44,
        y: this.height - 30,
        w: 88,
        baseW: 88,
        h: 12,
        keyDir: 0
      },
      balls: [
        {
          x: this.width / 2,
          y: this.height - 44,
          vx: 0,
          vy: 0,
          r: 7,
          isFireball: false
        }
      ],
      powerups: [], // 낙하 파워업 캡슐
      lasers: [],   // 레이저 포탑 탄환
      activePowerups: {
        wideTimer: 0,
        laserTimer: 0,
        fireTimer: 0,
        barrierHits: 0
      },
      lastLaserShot: 0,
      combo: 0,
      floatingTexts: [],
      blocks: [],
      totalBreakable: 0,
      brokenCount: 0
    };

    // 전략적 강철 블록 위치 선정
    const centerC = Math.round((dotInfo.minC + dotInfo.maxC) / 2);
    const shoulderR = dotInfo.minR + Math.floor((dotInfo.maxR - dotInfo.minR) * 0.35);

    const steelCoords = new Set();
    for (const p of dotInfo.activePixels) {
      if (p.r === dotInfo.minR && (p.c === centerC || p.c === centerC - 1)) {
        steelCoords.add(`${p.r},${p.c}`);
        if (steelCoords.size >= 2) break;
      }
    }
    if (steelCoords.size < 3 && dotInfo.maxR - dotInfo.minR >= 7) {
      for (const p of dotInfo.activePixels) {
        if (p.r === shoulderR && (p.c === dotInfo.minC || p.c === dotInfo.maxC)) {
          steelCoords.add(`${p.r},${p.c}`);
          if (steelCoords.size >= 3) break;
        }
      }
    }
    if (steelCoords.size === 0 && dotInfo.activePixels.length > 0) {
      steelCoords.add(`${dotInfo.activePixels[0].r},${dotInfo.activePixels[0].c}`);
    }

    const labelMinR = dotInfo.minR + (dotInfo.maxR - dotInfo.minR) * 0.4;
    const labelMaxR = dotInfo.minR + (dotInfo.maxR - dotInfo.minR) * 0.65;

    for (const p of dotInfo.activePixels) {
      const coordKey = `${p.r},${p.c}`;
      const isSteel = steelCoords.has(coordKey);
      let hp = 1;

      if (isSteel) {
        hp = 999;
      } else {
        if (p.r >= labelMinR && p.r <= labelMaxR && p.c > dotInfo.minC && p.c < dotInfo.maxC) {
          hp = 2;
        }
        this.bbState.totalBreakable++;
      }

      this.bbState.blocks.push({
        r: p.r,
        c: p.c,
        x: padX + p.c * pitchX,
        y: topY + p.r * pitchY,
        w: bw,
        h: bh,
        color: p.color,
        hp,
        maxHp: hp,
        isSteel,
        alive: true
      });
    }

    const handleWinClose = () => {
      if (this.gameState === 'WIN' && performance.now() - this.winTimestamp > 250) {
        this.audio?.playTap?.();
        if (this.onClose) {
          this.onClose();
        } else {
          document.getElementById('hint-close-btn')?.click();
        }
        return true;
      }
      return false;
    };

    const doLaunchBall = () => {
      if (handleWinClose()) return;
      if (this.gameState === 'READY' || !this.bbState.isLaunched) {
        this.bbState.isLaunched = true;
        this.gameState = 'PLAYING';
        this.bbState.lastTime = performance.now();
        const b = this.bbState.balls[0];
        if (b) {
          const baseSpeed = 7.6; // 상쾌하고 빠른 시작 속도!
          const la = this._getLaunchAngle();
          b.vx = Math.cos(la) * baseSpeed;
          b.vy = Math.sin(la) * baseSpeed;
        }
        this.audio?.playTap?.();
      } else if (this.gameState === 'OVER') {
        this.audio?.playTap?.();
        this.start('BRICK_BREAKER');
        this.gameState = 'PLAYING';
        this.bbState.isLaunched = true;
        this.bbState.lastTime = performance.now();
        const b = this.bbState.balls[0];
        if (b) {
          const baseSpeed = 7.6;
          const la2 = this._getLaunchAngle();
          b.vx = Math.cos(la2) * baseSpeed;
          b.vy = Math.sin(la2) * baseSpeed;
        }
      } else if (this.bbState.activePowerups?.laserTimer > 0) {
        this.fireLaser();
      }
    };

    const movePaddle = (clientX) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.width / rect.width;
      const x = (clientX - rect.left) * scaleX;
      const p = this.bbState.paddle;
      p.x = Math.max(6, Math.min(this.width - p.w - 6, x - p.w / 2));

      if (!this.bbState.isLaunched && this.bbState.balls[0]) {
        const b = this.bbState.balls[0];
        b.x = p.x + p.w / 2;
        b.y = p.y - b.r - 2;
        // 패들 위치에 따라 조준선 각도 미세 동적 틸트
        const relX = (b.x / this.width) - 0.5;
        this.bbState.aimAngle = -Math.PI / 2 + relX * 0.7;
      }
    };

    let isPointerDragging = false;

    const onPointerDown = (e) => {
      if (e.cancelable) e.preventDefault();
      if (handleWinClose()) return;
      isPointerDragging = true;
      movePaddle(e.clientX);
      // 발사 전에는 공이 패들에 붙은 채로 위치만 조정, 손을 떼는 순간 발사
      if (this.bbState.isLaunched && this.bbState.activePowerups?.laserTimer > 0) {
        this.fireLaser();
      }
    };

    // 모바일 돋보기(루페) 및 롱프레스 텍스트 선택/복사 팝업 원천 차단
    const onPreventCallout = (e) => {
      if (e.cancelable) e.preventDefault();
      return false;
    };

    const onPointerMove = (e) => {
      if (!isPointerDragging && e.buttons === 0) return;
      movePaddle(e.clientX);
    };

    const onPointerUp = (e) => {
      const wasDragging = isPointerDragging;
      isPointerDragging = false;
      if (wasDragging && !this.bbState.isLaunched && this.gameState !== 'WIN') {
        this.launchBall();
      }
    };

    const onKeyDown = (e) => {
      if (handleWinClose()) return;
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        this.bbState.paddle.keyDir = -1;
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        this.bbState.paddle.keyDir = 1;
      } else if (e.key === ' ' || e.key === 'Enter') {
        doLaunchBall();
      }
    };

    const onKeyUp = (e) => {
      if (['ArrowLeft', 'ArrowRight', 'a', 'd'].includes(e.key)) {
        this.bbState.paddle.keyDir = 0;
      }
    };

    this.canvas.addEventListener('pointerdown', onPointerDown, { passive: false });
    this.canvas.addEventListener('touchstart', onPreventCallout, { passive: false });
    this.canvas.addEventListener('touchend', onPreventCallout, { passive: false });
    this.canvas.addEventListener('contextmenu', onPreventCallout, { passive: false });
    this.canvas.addEventListener('selectstart', onPreventCallout, { passive: false });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    this._cleanupInputHandlers = () => {
      this.canvas.removeEventListener('pointerdown', onPointerDown);
      this.canvas.removeEventListener('touchstart', onPreventCallout);
      this.canvas.removeEventListener('touchend', onPreventCallout);
      this.canvas.removeEventListener('contextmenu', onPreventCallout);
      this.canvas.removeEventListener('selectstart', onPreventCallout);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }

  _updateBrickBreaker() {
    const st = this.bbState;
    const now = performance.now();
    const dt = Math.min((now - st.lastTime) / 1000, 0.05);
    st.lastTime = now;
    st.elapsed += dt;

    const timeScale = 1.0;
    const p = st.paddle;

    // 파워업 타이머 갱신
    const ap = st.activePowerups;
    if (ap.wideTimer > 0) {
      ap.wideTimer -= dt;
      if (ap.wideTimer <= 0) p.w = p.baseW;
    }
    if (ap.fireTimer > 0) {
      ap.fireTimer -= dt;
      if (ap.fireTimer <= 0) {
        for (const b of st.balls) b.isFireball = false;
      }
    }
    if (ap.laserTimer > 0) {
      ap.laserTimer -= dt;
      if (now - st.lastLaserShot > 380) {
        st.lastLaserShot = now;
        st.lasers.push(
          { x: p.x + 8, y: p.y - 4, vy: -13 },
          { x: p.x + p.w - 8, y: p.y - 4, vy: -13 }
        );
        this.audio?.playTap?.();
      }
    }

    // 패들 키보드 이동
    if (p.keyDir !== 0) {
      p.x = Math.max(6, Math.min(this.width - p.w - 6, p.x + p.keyDir * 420 * dt));
      if (!st.isLaunched && st.balls[0]) {
        st.balls[0].x = p.x + p.w / 2;
        const relX = (st.balls[0].x / this.width) - 0.5;
        st.aimAngle = -Math.PI / 2 + relX * 0.7;
      }
    }

    // 1. 레이저 탄환 업데이트
    for (let i = st.lasers.length - 1; i >= 0; i--) {
      const lz = st.lasers[i];
      lz.y += lz.vy * timeScale;
      let hit = false;
      for (const blk of st.blocks) {
        if (!blk.alive) continue;
        if (lz.x >= blk.x && lz.x <= blk.x + blk.w && lz.y >= blk.y && lz.y <= blk.y + blk.h) {
          hit = true;
          if (!blk.isSteel) {
            blk.hp--;
            if (blk.hp <= 0) {
              blk.alive = false;
              st.brokenCount++;
              st.combo++;
              this._onBlockDestroyed(blk);
            } else {
              this._spawnParticles(lz.x, lz.y, blk.color || '#38bdf8', 4);
            }
          } else {
            this._spawnParticles(lz.x, lz.y, '#94a3b8', 4);
          }
          break;
        }
      }
      if (hit || lz.y < 30) {
        st.lasers.splice(i, 1);
      }
    }

    // 2. 낙하 파워업 캡슐 업데이트
    for (let i = st.powerups.length - 1; i >= 0; i--) {
      const pw = st.powerups[i];
      pw.y += pw.vy * timeScale;
      // 패들 획득 판정
      if (
        pw.y >= p.y - 8 &&
        pw.y <= p.y + p.h + 6 &&
        pw.x >= p.x - 6 &&
        pw.x <= p.x + p.w + 6
      ) {
        st.powerups.splice(i, 1);
        this._applyPowerup(pw.type);
        continue;
      }
      if (pw.y > this.height) {
        st.powerups.splice(i, 1);
      }
    }

    // 3. 플로팅 텍스트 업데이트
    for (let i = st.floatingTexts.length - 1; i >= 0; i--) {
      const ft = st.floatingTexts[i];
      ft.life -= dt;
      ft.y -= 24 * dt;
      if (ft.life <= 0) {
        st.floatingTexts.splice(i, 1);
      }
    }

    // 공이 아직 발사 전이면 패들 상단 대기
    if (!st.isLaunched) {
      if (st.balls[0]) {
        st.balls[0].x = p.x + p.w / 2;
        st.balls[0].y = p.y - st.balls[0].r - 2;
      }
      return;
    }

    // 4. 모든 공 물리 연산
    for (let bi = st.balls.length - 1; bi >= 0; bi--) {
      const b = st.balls[bi];
      b.x += b.vx * timeScale;
      b.y += b.vy * timeScale;

      // 좌우 벽 반사
      if (b.x - b.r < 4) {
        b.x = 4 + b.r;
        b.vx = Math.abs(b.vx);
      } else if (b.x + b.r > this.width - 4) {
        b.x = this.width - 4 - b.r;
        b.vx = -Math.abs(b.vx);
      }

      // 상단 천장 반사
      if (b.y - b.r < 34) {
        b.y = 34 + b.r;
        b.vy = Math.abs(b.vy);
      }

      // 바닥 배리어 방어막 충돌
      if (ap.barrierHits > 0 && b.y + b.r >= this.height - 10 && b.vy > 0) {
        b.y = this.height - 10 - b.r;
        b.vy = -Math.abs(b.vy);
        ap.barrierHits--;
        this.audio?.playTap?.();
        this._spawnParticles(b.x, this.height - 10, '#38bdf8', 14);
        this._addFloatingText('SAFETY BOUNCE!', b.x, this.height - 30, '#38bdf8');
      }

      // 패들 충돌 판정
      if (
        b.vy > 0 &&
        b.y + b.r >= p.y &&
        b.y - b.r <= p.y + p.h &&
        b.x >= p.x - 6 &&
        b.x <= p.x + p.w + 6
      ) {
        const hitOffset = (b.x - (p.x + p.w / 2)) / (p.w / 2); // -1 ~ 1
        const speed = Math.min(11.2, Math.max(7.2, Math.hypot(b.vx, b.vy) * 1.01));
        const angle = hitOffset * (Math.PI * 0.38); // 최대 68도 정밀 굴절
        b.vx = Math.sin(angle) * speed;
        b.vy = -Math.cos(angle) * speed;
        b.y = p.y - b.r - 1;
        b.consecutiveBrickHits = 0;
        st.combo = 0; // 패들에 닿으면 콤보 리셋
        this.audio?.playTap?.();
        this._spawnParticles(b.x, p.y, '#fde047', 6);
      }

      // 블럭 충돌 검사
      for (const blk of st.blocks) {
        if (!blk.alive) continue;
        if (
          b.x + b.r > blk.x &&
          b.x - b.r < blk.x + blk.w &&
          b.y + b.r > blk.y &&
          b.y - b.r < blk.y + blk.h
        ) {
          const isFire = b.isFireball || ap.fireTimer > 0;

          if (!blk.isSteel && isFire) {
            // 파이어볼: 일반 블록을 튕기지 않고 관통하여 2HP 즉시 격파!
            blk.hp -= 2;
            if (blk.hp <= 0) {
              blk.alive = false;
              st.brokenCount++;
              st.combo++;
              this._onBlockDestroyed(blk);
            } else {
              this._spawnParticles(b.x, b.y, '#f97316', 6);
            }
          } else {
            b.consecutiveBrickHits = (b.consecutiveBrickHits || 0) + 1;

            // 일반 반사 계산 및 위치 보정 (관통 및 제자리 진동 탈출)
            const overlapLeft = b.x + b.r - blk.x;
            const overlapRight = blk.x + blk.w - (b.x - b.r);
            const overlapTop = b.y + b.r - blk.y;
            const overlapBottom = blk.y + blk.h - (b.y - b.r);
            const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

            if (minOverlap === overlapLeft) {
              b.x = blk.x - b.r - 0.5;
              b.vx = -Math.abs(b.vx || 3);
            } else if (minOverlap === overlapRight) {
              b.x = blk.x + blk.w + b.r + 0.5;
              b.vx = Math.abs(b.vx || 3);
            } else if (minOverlap === overlapTop) {
              b.y = blk.y - b.r - 0.5;
              b.vy = -Math.abs(b.vy || 3);
            } else {
              b.y = blk.y + blk.h + b.r + 0.5;
              b.vy = Math.abs(b.vy || 3);
            }

            // [끼임/진동 방지 가드]
            if (b.consecutiveBrickHits > 6) {
              const spd = Math.max(6, Math.hypot(b.vx, b.vy));
              const escapeAngle = (Math.random() * 0.4 + 0.3) * Math.PI;
              b.vx = Math.cos(escapeAngle) * spd * (Math.random() > 0.5 ? 1 : -1);
              b.vy = Math.abs(Math.sin(escapeAngle) * spd);
              b.consecutiveBrickHits = 0;
            }

            if (blk.isSteel) {
              this.shakeTicks = 3;
              this._spawnParticles(b.x, b.y, '#94a3b8', 6);
              this.audio?.playTap?.();
            } else {
              blk.hp--;
              if (blk.hp <= 0) {
                blk.alive = false;
                st.brokenCount++;
                st.combo++;
                this._onBlockDestroyed(blk);
              } else {
                this.audio?.playTap?.();
                this._spawnParticles(b.x, b.y, blk.color || '#38bdf8', 6);
              }
            }
          }
          break;
        }
      }

      // 공 바닥 추락
      if (b.y - b.r > this.height) {
        st.balls.splice(bi, 1);
      }
    }

    // 5. 공이 전부 소진되었을 때 라이프 차감 및 재장전
    if (st.balls.length === 0) {
      st.lives--;
      this.shakeTicks = 12;
      this.audio?.playFail?.();
      st.activePowerups.laserTimer = 0;
      st.activePowerups.fireTimer = 0;
      st.combo = 0;

      if (st.lives <= 0) {
        this.gameState = 'OVER';
        if (this.onLose) this.onLose();
        return;
      }

      this.gameState = 'READY';
      st.isLaunched = false;
      st.readyTime = performance.now();
      st.balls = [
        {
          x: p.x + p.w / 2,
          y: p.y - 12,
          vx: 0,
          vy: 0,
          r: 7,
          isFireball: false
        }
      ];
    }

    // 6. 승리 판정
    if (st.brokenCount >= st.totalBreakable) {
      this.gameState = 'WIN';
      this.winTimestamp = performance.now();
      this.audio?.playSuccess?.();
      if (this.onWin) this.onWin();
    }
  }

  _onBlockDestroyed(blk) {
    this.audio?.playTap?.();
    this._spawnParticles(blk.x + blk.w / 2, blk.y + blk.h / 2, blk.color || '#38bdf8', 12);

    // 콤보 팝업
    if (this.bbState.combo >= 2) {
      this._addFloatingText(`x${this.bbState.combo} COMBO!`, blk.x, blk.y - 10, '#fde047');
    }

    // 알카노이드 정통 파워업 캡슐 드롭 (26% 확률)
    if (Math.random() < 0.13) {
      const types = ['MULTI', 'WIDE', 'LASER', 'FIRE', 'BARRIER'];
      const randType = types[Math.floor(Math.random() * types.length)];
      const icons = {
        MULTI: '[M]',
        WIDE: '[W]',
        LASER: '[L]',
        FIRE: '[F]',
        BARRIER: '[S]'
      };
      const colors = {
        MULTI: '#38bdf8',
        WIDE: '#4ade80',
        LASER: '#f43f5e',
        FIRE: '#fb923c',
        BARRIER: '#a855f7'
      };

      this.bbState.powerups.push({
        x: blk.x + blk.w / 2,
        y: blk.y + blk.h / 2,
        vy: 2.8,
        type: randType,
        icon: icons[randType],
        color: colors[randType]
      });
    }
  }

  _applyPowerup(type) {
    this.audio?.playSuccess?.();
    const st = this.bbState;
    const ap = st.activePowerups;
    const p = st.paddle;

    if (type === 'MULTI') {
      // 멀티볼: 살아있는 모든 공을 각 3개로 분열! (최대 9개)
      const currentBalls = [...st.balls];
      for (const b of currentBalls) {
        if (st.balls.length >= 9) break;
        const curSpd = Math.max(7.2, Math.hypot(b.vx, b.vy));
        const curAng = Math.atan2(b.vy, b.vx);
        st.balls.push(
          {
            x: b.x,
            y: b.y,
            vx: Math.cos(curAng - 0.38) * curSpd,
            vy: Math.sin(curAng - 0.38) * curSpd,
            r: b.r,
            isFireball: b.isFireball
          },
          {
            x: b.x,
            y: b.y,
            vx: Math.cos(curAng + 0.38) * curSpd,
            vy: Math.sin(curAng + 0.38) * curSpd,
            r: b.r,
            isFireball: b.isFireball
          }
        );
      }
      this._addFloatingText('MULTI-BALL! x3', p.x + p.w / 2, p.y - 20, '#38bdf8');
    } else if (type === 'WIDE') {
      p.w = p.baseW * 1.45;
      ap.wideTimer = 11.0;
      this._addFloatingText('WIDE PADDLE!', p.x + p.w / 2, p.y - 20, '#4ade80');
    } else if (type === 'LASER') {
      ap.laserTimer = 10.0;
      this._addFloatingText('LASER CANNON!', p.x + p.w / 2, p.y - 20, '#f43f5e');
    } else if (type === 'FIRE') {
      ap.fireTimer = 8.5;
      for (const b of st.balls) b.isFireball = true;
      this._addFloatingText('FIREBALL!', p.x + p.w / 2, p.y - 20, '#fb923c');
    } else if (type === 'BARRIER') {
      ap.barrierHits = 2;
      this._addFloatingText('SAFETY BARRIER!', p.x + p.w / 2, p.y - 20, '#a855f7');
    }
  }

  _addFloatingText(text, x, y, color = '#ffffff') {
    this.bbState.floatingTexts.push({
      text,
      x: Math.max(30, Math.min(this.width - 60, x)),
      y,
      life: 0.9,
      maxLife: 0.9,
      color
    });
  }

  _drawBrickBreaker(ctx) {
    const st = this.bbState;

    // 1. 캔버스 배경 및 숨겨진 도트/실루엣 아트 렌더링
    ctx.fillStyle = '#070b14';
    ctx.fillRect(0, 0, this.width, this.height);
    if (this.gameState === 'WIN') {
      ctx.drawImage(this.hiddenArtCanvas, 0, 0);
    } else if (this.hiddenSilhouetteCanvas) {
      ctx.drawImage(this.hiddenSilhouetteCanvas, 0, 0);
    } else {
      ctx.drawImage(this.hiddenArtCanvas, 0, 0);
    }

    // 2. 블럭 렌더링
    for (const blk of st.blocks) {
      if (!blk.alive) continue;

      ctx.fillStyle = '#070b14';
      ctx.fillRect(blk.x - 1, blk.y - 1, blk.w + 2, blk.h + 2);

      if (blk.isSteel) {
        const steelGrad = ctx.createLinearGradient(blk.x, blk.y, blk.x, blk.y + blk.h);
        steelGrad.addColorStop(0, '#475569');
        steelGrad.addColorStop(1, '#1e293b');
        ctx.fillStyle = steelGrad;
        ctx.fillRect(blk.x, blk.y, blk.w, blk.h);

        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(blk.x + 2, blk.y + 1, blk.w - 4, 1.5);
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(blk.x, blk.y, blk.w, blk.h);
      } else if (blk.hp === 2) {
        const hp2Grad = ctx.createLinearGradient(blk.x, blk.y, blk.x, blk.y + blk.h);
        hp2Grad.addColorStop(0, '#1e3a8a');
        hp2Grad.addColorStop(1, '#0f172a');
        ctx.fillStyle = hp2Grad;
        ctx.fillRect(blk.x, blk.y, blk.w, blk.h);

        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(blk.x, blk.y, blk.w, blk.h);

        ctx.fillStyle = '#fde047';
        ctx.fillRect(blk.x + blk.w / 2 - 3, blk.y + blk.h / 2 - 1, 6, 2);
      } else {
        const blockGrad = ctx.createLinearGradient(blk.x, blk.y, blk.x, blk.y + blk.h);
        blockGrad.addColorStop(0, '#0284c7');
        blockGrad.addColorStop(0.5, '#0369a1');
        blockGrad.addColorStop(1, '#075985');
        ctx.fillStyle = blockGrad;
        ctx.fillRect(blk.x, blk.y, blk.w, blk.h);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.fillRect(blk.x + 1, blk.y + 1, blk.w - 2, 1.5);

        ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)';
        ctx.lineWidth = 1;
        ctx.strokeRect(blk.x, blk.y, blk.w, blk.h);
      }
    }

    // 3. 바닥 안전 배리어 (남아있을 때)
    if (st.activePowerups?.barrierHits > 0) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(10, this.height - 10);
      ctx.lineTo(this.width - 10, this.height - 10);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // 4. 레이저 탄환 렌더링
    for (const lz of st.lasers) {
      ctx.fillStyle = '#f43f5e';
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 8;
      ctx.fillRect(lz.x - 1.5, lz.y - 8, 3, 14);
      ctx.shadowBlur = 0;
    }

    // 5. 파워업 캡슐 렌더링
    for (const pw of st.powerups) {
      ctx.save();
      ctx.fillStyle = pw.color;
      ctx.shadowColor = pw.color;
      ctx.shadowBlur = 12;
      this._roundRect(ctx, pw.x - 14, pw.y - 7, 28, 14, 7, pw.color, '#ffffff');
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(pw.icon, pw.x, pw.y);
      ctx.restore();
    }

    // 6. 패들 렌더링
    const p = st.paddle;
    const paddleGrad = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.h);
    paddleGrad.addColorStop(0, '#38bdf8');
    paddleGrad.addColorStop(1, '#0284c7');
    ctx.fillStyle = paddleGrad;
    ctx.strokeStyle = '#e0f2fe';
    ctx.lineWidth = 2;
    this._roundRect(ctx, p.x, p.y, p.w, p.h, 6, paddleGrad, '#e0f2fe');

    // 레이저 포탑 장착 시 패들 양끝에 네온 포탑 표시
    if (st.activePowerups?.laserTimer > 0) {
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(p.x + 6, p.y - 5, 4, 6);
      ctx.fillRect(p.x + p.w - 10, p.y - 5, 4, 6);
    }

    // 7. 발사 전 조준 궤적 점선 렌더링 (Aiming Trajectory Line)
    if (!st.isLaunched && st.balls[0]) {
      const b = st.balls[0];
      const dotCount = 8;
      for (let i = 1; i <= dotCount; i++) {
        const dist = i * 20;
        const dx = b.x + Math.cos(st.aimAngle) * dist;
        const dy = b.y + Math.sin(st.aimAngle) * dist;
        ctx.beginPath();
        ctx.arc(dx, dy, Math.max(1.5, 4.5 - i * 0.35), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(56, 189, 248, ${0.9 - i * 0.09})`;
        ctx.fill();
      }
    }

    // 8. 공 렌더링 (복수 공 지원 + 파이어볼 이펙트)
    for (const b of st.balls) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);

      const isFire = b.isFireball || st.activePowerups?.fireTimer > 0;
      if (isFire) {
        ctx.fillStyle = '#f97316';
        ctx.shadowColor = '#ea580c';
        ctx.shadowBlur = 16;
        ctx.fill();
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        ctx.fillStyle = '#f59e0b';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      ctx.restore();
    }

    // 9. 플로팅 텍스트 렌더링
    for (const ft of st.floatingTexts) {
      ctx.save();
      ctx.font = '900 13px sans-serif';
      ctx.fillStyle = ft.color;
      ctx.shadowColor = ft.color;
      ctx.shadowBlur = 8;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.globalAlpha = Math.max(0, ft.life / ft.maxLife);
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }

    // 10. 상단 HUD
    const pct = (st.brokenCount / Math.max(1, st.totalBreakable)) * 100;
    const turboLabel = st.isTurbo ? '⚡터보' : '';
    this._drawHUD(ctx, {
      lives: st.lives,
      progressPct: pct,
      labelText: `${Math.floor(pct)}% ${turboLabel}`.trim()
    });
  }

  // =========================================================================
  // 2. 📐 외곽 실루엣 땅따먹기 (Qix 정통 룰 + 화면 스와이프 + 아케이드 십자키 + 75% 점령)
  // =========================================================================
  _createQixEnemies(cols, rows) {
    return [
      { isBoss: true, r: Math.floor(rows * 0.35), c: Math.floor(cols * 0.5), vr: 12.0, vc: 14.0 },
      { isBoss: false, r: Math.floor(rows * 0.65), c: Math.floor(cols * 0.4), vr: -13.5, vc: 11.5 }
    ];
  }

  _resetTerritoryQixState() {
    if (!this.qixState) return;
    const { cols, rows } = this.qixState;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        this.qixState.grid[r][c] = (r === 0 || r === rows - 1 || c === 0 || c === cols - 1) ? 1 : 0;
      }
    }
    this.qixState.player.c = Math.floor(cols / 2);
    this.qixState.player.r = rows - 1;
    this.qixState.player.dc = 0;
    this.qixState.player.dr = 0;
    this.qixState.player.pendingDir = null;
    this.qixState.player.moveAccum = 0;
    this.qixState.lives = 3;
    this.qixState.elapsed = 0;
    this.qixState.isDash = false;
    this.qixState.enemies = this._createQixEnemies(cols, rows);
    this.qixState.capturedSilhouetteCount = 0;
    this.qixState.silhouetteRevealedPct = 0;
    this.qixState.claimedTerritoryPct = 0;
  }

  _initTerritoryQix() {
    const cols = 52;
    const rows = 52;
    const topOffset = 32;
    const cellW = this.width / cols;
    const cellH = (this.height - topOffset) / rows;

    const grid = Array.from({ length: rows }, (_, r) =>
      Array.from({ length: cols }, (__, c) =>
        r === 0 || r === rows - 1 || c === 0 || c === cols - 1 ? 1 : 0
      )
    );

    const artSize = 32;
    const startC = Math.floor((cols - artSize) / 2);
    const startR = Math.floor((rows - artSize) / 2);

    const targetSilhouetteCells = new Set();
    const isSilhouetteGrid = Array.from({ length: rows }, () => new Uint8Array(cols));

    let hasExactMask = false;
    if (this.recipe && window.KSool?.pixelIcon) {
      try {
        const svgStr = window.KSool.pixelIcon(this.recipe, artSize);
        if (svgStr) {
          const maskCanvas = document.createElement('canvas');
          maskCanvas.width = cols;
          maskCanvas.height = rows;
          const maskCtx = maskCanvas.getContext('2d', { willReadFrequently: true });
          if (maskCtx) {
            const drawn = this._drawSvgToCanvas(maskCtx, svgStr, startC, startR, artSize, artSize);
            if (drawn) {
              const imgData = maskCtx.getImageData(0, 0, cols, rows);
              const data = imgData.data;
              const rawMask = Array.from({ length: rows }, () => new Uint8Array(cols));
              let rawCount = 0;

              for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                  const alpha = data[(r * cols + c) * 4 + 3];
                  if (alpha > 15) {
                    rawMask[r][c] = 1;
                    rawCount++;
                  }
                }
              }

              if (rawCount > 0) {
                hasExactMask = true;
                const dilatedMask = Array.from({ length: rows }, () => new Uint8Array(cols));
                for (let r = 0; r < rows; r++) {
                  for (let c = 0; c < cols; c++) {
                    if (rawMask[r][c]) {
                      for (let dr = -1; dr <= 1; dr++) {
                        for (let dc = -1; dc <= 1; dc++) {
                          const nr = r + dr;
                          const nc = c + dc;
                          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                            dilatedMask[nr][nc] = 1;
                          }
                        }
                      }
                    }
                  }
                }

                const isOutside = Array.from({ length: rows }, () => new Uint8Array(cols));
                const queue = [];
                for (let r = 0; r < rows; r++) {
                  if (!dilatedMask[r][0]) { isOutside[r][0] = 1; queue.push([r, 0]); }
                  if (!dilatedMask[r][cols - 1]) { isOutside[r][cols - 1] = 1; queue.push([r, cols - 1]); }
                }
                for (let c = 0; c < cols; c++) {
                  if (!dilatedMask[0][c] && !isOutside[0][c]) { isOutside[0][c] = 1; queue.push([0, c]); }
                  if (!dilatedMask[rows - 1][c] && !isOutside[rows - 1][c]) { isOutside[rows - 1][c] = 1; queue.push([rows - 1, c]); }
                }

                let qHead = 0;
                while (qHead < queue.length) {
                  const [qr, qc] = queue[qHead++];
                  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
                  for (const [dr, dc] of dirs) {
                    const nr = qr + dr;
                    const nc = qc + dc;
                    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                      if (!dilatedMask[nr][nc] && !isOutside[nr][nc]) {
                        isOutside[nr][nc] = 1;
                        queue.push([nr, nc]);
                      }
                    }
                  }
                }

                for (let r = 0; r < rows; r++) {
                  for (let c = 0; c < cols; c++) {
                    if (!isOutside[r][c]) {
                      isSilhouetteGrid[r][c] = 1;
                      targetSilhouetteCells.add(`${r},${c}`);
                    }
                  }
                }
              }
            }
          }
        }
      } catch (err) {
        console.warn('Failed to extract silhouette mask from SVG, falling back to dot grid:', err);
      }
    }

    if (!hasExactMask || targetSilhouetteCells.size === 0) {
      const dotInfo = this._parseDotSprite(this.recipe);
      const scale = 2;
      for (let r = 0; r < 16; r++) {
        for (let c = 0; c < 16; c++) {
          if (dotInfo.grid[r][c]) {
            for (let dr = 0; dr < scale; dr++) {
              for (let dc = 0; dc < scale; dc++) {
                const gr = startR + r * scale + dr;
                const gc = startC + c * scale + dc;
                if (gr >= 0 && gr < rows && gc >= 0 && gc < cols) {
                  isSilhouetteGrid[gr][gc] = 1;
                  targetSilhouetteCells.add(`${gr},${gc}`);
                }
              }
            }
          }
        }
      }
    }

    const silhouetteEdges = [];
    for (const coord of targetSilhouetteCells) {
      const [gr, gc] = coord.split(',').map(Number);
      const x1 = gc * cellW;
      const x2 = (gc + 1) * cellW;
      const y1 = topOffset + gr * cellH;
      const y2 = topOffset + (gr + 1) * cellH;

      if (!isSilhouetteGrid[gr - 1]?.[gc]) silhouetteEdges.push({ x1, y1, x2, y2: y1 });
      if (!isSilhouetteGrid[gr + 1]?.[gc]) silhouetteEdges.push({ x1, y1: y2, x2, y2 });
      if (!isSilhouetteGrid[gr]?.[gc - 1]) silhouetteEdges.push({ x1, y1, x2: x1, y2 });
      if (!isSilhouetteGrid[gr]?.[gc + 1]) silhouetteEdges.push({ x1: x2, y1, x2, y2 });
    }

    const silX = startC * cellW;
    const silY = topOffset + startR * cellH;
    const silW = artSize * cellW;
    const silH = artSize * cellH;

    this._renderHiddenArtwork({
      x: silX,
      y: silY,
      w: silW,
      h: silH
    });

    this.qixState = {
      cols,
      rows,
      topOffset,
      cellW,
      cellH,
      grid,
      lives: 3,
      elapsed: 0,
      lastTime: performance.now(),
      targetPct: 75, // 정통 Qix 영토 75% 점령 시 승리!
      targetSilhouetteCells,
      totalSilhouetteCells: targetSilhouetteCells.size,
      capturedSilhouetteCount: 0,
      silhouetteRevealedPct: 0,
      claimedTerritoryPct: 0,
      silhouetteEdges,
      isDash: false,
      player: {
        c: Math.floor(cols / 2),
        r: rows - 1,
        dc: 0,
        dr: 0,
        pendingDir: null,
        moveAccum: 0
      },
      enemies: this._createQixEnemies(cols, rows)
    };

    const handleWinClose = () => {
      if (this.gameState === 'WIN' && performance.now() - this.winTimestamp > 250) {
        this.audio?.playTap?.();
        if (this.onClose) {
          this.onClose();
        } else {
          document.getElementById('hint-close-btn')?.click();
        }
        return true;
      }
      return false;
    };

    const handleQixAction = () => {
      if (handleWinClose()) return true;
      if (this.gameState === 'READY') {
        this.gameState = 'PLAYING';
        this.qixState.lastTime = performance.now();
        this.qixState.player.moveAccum = 0;
        this.audio?.playTap?.();
        return true;
      } else if (this.gameState === 'OVER') {
        this.audio?.playTap?.();
        this._resetTerritoryQixState();
        this.gameState = 'PLAYING';
        this.qixState.lastTime = performance.now();
        return true;
      }
      return false;
    };

    // 1. 화면 다이렉트 스와이프 & 드래그 조작계 (조작감 대혁신!)
    let isSwiping = false;
    let startTouchX = 0;
    let startTouchY = 0;

    const onPointerDown = (e) => {
      if (e.cancelable) e.preventDefault();
      if (handleQixAction()) return;
      isSwiping = true;
      startTouchX = e.clientX;
      startTouchY = e.clientY;
    };

    const onPointerMove = (e) => {
      if (!isSwiping) return;
      const dx = e.clientX - startTouchX;
      const dy = e.clientY - startTouchY;
      const dist = Math.hypot(dx, dy);

      if (dist >= 14) {
        let reqDc = 0, reqDr = 0;
        if (Math.abs(dx) >= Math.abs(dy)) {
          reqDc = dx > 0 ? 1 : -1;
          reqDr = 0;
        } else {
          reqDc = 0;
          reqDr = dy > 0 ? 1 : -1;
        }
        this.setQixDirection(reqDc, reqDr);
        startTouchX = e.clientX;
        startTouchY = e.clientY;
      }
    };

    const onPointerUp = () => {
      isSwiping = false;
    };

    // 2. 키보드 조작
    const onKeyDown = (e) => {
      if (handleWinClose()) return;
      if (this.gameState === 'OVER') {
        this.audio?.playTap?.();
        this._resetTerritoryQixState();
        this.gameState = 'PLAYING';
      }
      handleQixAction();

      let reqDc = 0, reqDr = 0;
      if (e.key === 'ArrowLeft' || e.key === 'a') reqDc = -1;
      else if (e.key === 'ArrowRight' || e.key === 'd') reqDc = 1;
      else if (e.key === 'ArrowUp' || e.key === 'w') reqDr = -1;
      else if (e.key === 'ArrowDown' || e.key === 's') reqDr = 1;
      else if (e.key === ' ' || e.key === 'Shift') {
        this.toggleDash();
        return;
      } else return;

      this.setQixDirection(reqDc, reqDr);
    };

    const onKeyUp = (e) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'a', 'd', 'w', 's'].includes(e.key)) {
        this.stopQixPlayer();
      }
    };

    this.canvas.addEventListener('pointerdown', onPointerDown, { passive: false });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    this._cleanupInputHandlers = () => {
      this.canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };

    const padEl = this._joystickElements?.padEl || document.getElementById('qix-joystick-pad');
    const knobEl = this._joystickElements?.knobEl || document.getElementById('qix-joystick-knob');
    const zoneEl = this._joystickElements?.zoneEl || document.getElementById('qix-joystick-zone');
    if (padEl && knobEl && document.body.contains(padEl)) {
      this.bindJoystick(padEl, knobEl, zoneEl);
    }
  }

  _clearQixTrail() {
    const { grid, rows, cols } = this.qixState;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c] === 2) grid[r][c] = 0;
      }
    }
  }

  _floodFillCaptureQix() {
    const st = this.qixState;
    const { grid, rows, cols } = st;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c] === 2) grid[r][c] = 1;
      }
    }

    const compMap = Array.from({ length: rows }, () => new Int32Array(cols).fill(-1));
    const components = [];
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];

    for (let r = 1; r < rows - 1; r++) {
      for (let c = 1; c < cols - 1; c++) {
        if (grid[r][c] === 0 && compMap[r][c] === -1) {
          const compId = components.length;
          const cells = [];
          const queue = [[r, c]];
          compMap[r][c] = compId;
          let head = 0;
          while (head < queue.length) {
            const [cr, cc] = queue[head++];
            cells.push([cr, cc]);
            for (const [dr, dc] of dirs) {
              const nr = cr + dr;
              const nc = cc + dc;
              if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                if (grid[nr][nc] === 0 && compMap[nr][nc] === -1) {
                  compMap[nr][nc] = compId;
                  queue.push([nr, nc]);
                }
              }
            }
          }
          components.push({ id: compId, cells, enemyCount: 0 });
        }
      }
    }

    for (const en of st.enemies) {
      if (en.isSparx) continue;
      const er = Math.max(1, Math.min(rows - 2, Math.floor(en.r)));
      const ec = Math.max(1, Math.min(cols - 2, Math.floor(en.c)));
      const cid = compMap[er][ec];
      if (cid !== -1 && components[cid]) {
        components[cid].enemyCount++;
      }
    }

    if (components.length > 0) {
      const compsWithEnemies = components.filter(comp => comp.enemyCount > 0);
      const pool = compsWithEnemies.length > 0 ? compsWithEnemies : components;
      pool.sort((a, b) => b.cells.length - a.cells.length);
      const survivorComp = pool[0];

      for (const comp of components) {
        if (comp.id !== survivorComp.id) {
          for (const [cr, cc] of comp.cells) {
            grid[cr][cc] = 1;
          }
        }
      }

      if (survivorComp.cells.length > 0) {
        const fallbackCell = survivorComp.cells[Math.floor(survivorComp.cells.length / 2)];
        for (const en of st.enemies) {
          if (en.isSparx) continue;
          const er = Math.max(1, Math.min(rows - 2, Math.floor(en.r)));
          const ec = Math.max(1, Math.min(cols - 2, Math.floor(en.c)));
          if (compMap[er][ec] !== survivorComp.id) {
            en.r = fallbackCell[0] + 0.5;
            en.c = fallbackCell[1] + 0.5;
          }
        }
      }
    }

    // 통계 산출
    let capturedInner = 0;
    const totalInner = (rows - 2) * (cols - 2);
    for (let r = 1; r < rows - 1; r++) {
      for (let c = 1; c < cols - 1; c++) {
        if (grid[r][c] === 1) capturedInner++;
      }
    }
    st.claimedTerritoryPct = (capturedInner / totalInner) * 100;

    let capturedSilhouette = 0;
    for (const coord of st.targetSilhouetteCells) {
      const [gr, gc] = coord.split(',').map(Number);
      if (grid[gr][gc] === 1) capturedSilhouette++;
    }
    st.capturedSilhouetteCount = capturedSilhouette;
    st.silhouetteRevealedPct = (capturedSilhouette / Math.max(1, st.totalSilhouetteCells)) * 100;

    this.audio?.playTap?.();
    this._spawnParticles(
      st.player.c * st.cellW,
      st.topOffset + st.player.r * st.cellH,
      '#10b981',
      22
    );
  }

  _updateTerritoryQix() {
    const st = this.qixState;
    const now = performance.now();
    const dt = Math.min((now - st.lastTime) / 1000, 0.05);
    st.lastTime = now;
    st.elapsed += dt;

    const pl = st.player;
    // 대시 모드 시 초당 38칸, 일반 시 초당 22칸 고속 절단
    const speed = st.isDash ? 38 : 22;
    pl.moveAccum += dt * speed;

    while (pl.moveAccum >= 1) {
      pl.moveAccum -= 1;

      // 코너 턴 예약 버퍼 적용
      if (pl.pendingDir) {
        const pd = pl.pendingDir;
        if (now < pd.expireAt) {
          const testC = pl.c + pd.dc;
          const testR = pl.r + pd.dr;
          const nextCState = st.grid[testR]?.[testC];
          const isDrawing = st.grid[pl.r][pl.c] === 2;
          const isRev = (pl.dc !== 0 && pd.dc === -pl.dc) || (pl.dr !== 0 && pd.dr === -pl.dr);
          if (nextCState !== 2 && !(isDrawing && isRev)) {
            pl.dc = pd.dc;
            pl.dr = pd.dr;
            pl.pendingDir = null;
          }
        } else {
          pl.pendingDir = null;
        }
      }

      if (pl.dc !== 0 || pl.dr !== 0) {
        const nc = Math.max(0, Math.min(st.cols - 1, pl.c + pl.dc));
        const nr = Math.max(0, Math.min(st.rows - 1, pl.r + pl.dr));
        const prevState = st.grid[pl.r][pl.c];
        const nextState = st.grid[nr][nc];

        // 자기 자신의 선(2)을 밟으면 피격
        if (nextState === 2 && (nr !== pl.r || nc !== pl.c)) {
          this._onQixPlayerHit();
          return;
        }

        pl.c = nc;
        pl.r = nr;

        if (nextState === 0) {
          st.grid[nr][nc] = 2; // 새로운 절단 궤적 생성
          if (st.isDash && Math.random() < 0.4) {
            this._spawnParticles(nc * st.cellW, st.topOffset + nr * st.cellH, '#fb923c', 2);
          }
        } else if (nextState === 1 && prevState === 2) {
          // 안전지대 복귀 -> 영역 점령 완료!
          pl.dc = 0;
          pl.dr = 0;
          this._floodFillCaptureQix();

          // 실루엣 100% 해금 시에만 승리! (외곽 빈 영토만 잘라먹어서는 해금 불가)
          if (st.silhouetteRevealedPct >= 100 || st.capturedSilhouetteCount >= st.totalSilhouetteCells) {
            this.gameState = 'WIN';
            this.winTimestamp = performance.now();
            this.audio?.playSuccess?.();
            if (this.onWin) this.onWin();
            return;
          }
        }
      }
    }

    // 내부 적 이동 및 충돌 (바깥쪽 스파크 적은 완전 삭제, 내부 적 속도 대폭 상향)
    for (const en of st.enemies) {
      const stepDist = Math.max(Math.abs(en.vc), Math.abs(en.vr)) * dt;
      const subSteps = Math.max(1, Math.ceil(stepDist / 0.45));
      const subDt = dt / subSteps;

      for (let s = 0; s < subSteps; s++) {
        const nextC = en.c + en.vc * subDt;
        const nextR = en.r + en.vr * subDt;
        const checkC = Math.max(0, Math.min(st.cols - 1, Math.floor(nextC)));
        const checkR = Math.max(0, Math.min(st.rows - 1, Math.floor(nextR)));

        // 적이 플레이어의 궤적(2)을 타격하면 피격!
        if (st.grid[checkR][checkC] === 2 || (st.grid[pl.r][pl.c] === 2 && Math.hypot(en.c - pl.c, en.r - pl.r) < 1.6)) {
          this._onQixPlayerHit();
          return;
        }

        if (st.grid[checkR][Math.floor(en.c)] === 1) {
          en.vr = -en.vr;
          en.vc += (Math.random() - 0.5) * 3;
        } else {
          en.r = nextR;
        }

        if (st.grid[Math.floor(en.r)][checkC] === 1) {
          en.vc = -en.vc;
          en.vr += (Math.random() - 0.5) * 3;
        } else {
          en.c = nextC;
        }

        // 속도 유지 보정
        const spd = Math.hypot(en.vc, en.vr);
        if (spd < 13.0 || spd > 22.0) {
          const factor = 17.0 / (spd || 1);
          en.vc *= factor;
          en.vr *= factor;
        }
      }
    }
  }

  _onQixPlayerHit() {
    const st = this.qixState;
    st.lives--;
    this.shakeTicks = 12;
    this.audio?.playFail?.();
    this._spawnParticles(
      st.player.c * st.cellW,
      st.topOffset + st.player.r * st.cellH,
      '#ef4444',
      24
    );

    this._clearQixTrail();
    st.player.dc = 0;
    st.player.dr = 0;
    st.player.pendingDir = null;

    if (st.lives <= 0) {
      this.gameState = 'OVER';
      if (this.onLose) this.onLose();
      return;
    }

    // 가장 가까운 안전지대(1)로 플레이어 복귀
    for (let dist = 1; dist < st.rows; dist++) {
      for (const [dr, dc] of [[0, dist], [0, -dist], [dist, 0], [-dist, 0]]) {
        const nr = Math.max(0, Math.min(st.rows - 1, st.player.r + dr));
        const nc = Math.max(0, Math.min(st.cols - 1, st.player.c + dc));
        if (st.grid[nr][nc] === 1) {
          st.player.r = nr;
          st.player.c = nc;
          return;
        }
      }
    }
  }

  _drawTerritoryQix(ctx) {
    const st = this.qixState;

    ctx.fillStyle = '#050811';
    ctx.fillRect(0, 0, this.width, this.height);

    // 1. 점령된 영토(1)에만 클리핑하여 숨겨진 원본 술 아트 렌더링
    ctx.save();
    ctx.beginPath();
    let hasCapturedArea = false;
    for (let r = 0; r < st.rows; r++) {
      for (let c = 0; c < st.cols; c++) {
        if (st.grid[r][c] === 1) {
          ctx.rect(c * st.cellW, st.topOffset + r * st.cellH, st.cellW + 0.3, st.cellH + 0.3);
          hasCapturedArea = true;
        }
      }
    }
    if (hasCapturedArea) {
      ctx.clip();
      ctx.drawImage(this.hiddenArtCanvas, 0, 0);
    }
    ctx.restore();

    // 2. 미점령 영역 네온 격자 테두리 렌더링
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1.8;
    ctx.shadowColor = 'rgba(16, 185, 129, 0.6)';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    for (let r = 0; r < st.rows; r++) {
      for (let c = 0; c < st.cols; c++) {
        if (st.grid[r][c] === 1) {
          const x = c * st.cellW;
          const y = st.topOffset + r * st.cellH;
          if (st.grid[r - 1]?.[c] === 0) { ctx.moveTo(x, y); ctx.lineTo(x + st.cellW, y); }
          if (st.grid[r + 1]?.[c] === 0) { ctx.moveTo(x, y + st.cellH); ctx.lineTo(x + st.cellW, y + st.cellH); }
          if (st.grid[r]?.[c - 1] === 0) { ctx.moveTo(x, y); ctx.lineTo(x, y + st.cellH); }
          if (st.grid[r]?.[c + 1] === 0) { ctx.moveTo(x + st.cellW, y); ctx.lineTo(x + st.cellW, y + st.cellH); }
        }
      }
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 3. 술 외곽 실루엣 가이드선 (목표 힌트)
    if (this.gameState !== 'WIN' && st.silhouetteEdges?.length > 0) {
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      for (const e of st.silhouetteEdges) {
        ctx.moveTo(e.x1, e.y1);
        ctx.lineTo(e.x2, e.y2);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 4. 플레이어 활성 궤적 선(2) 그리기
    ctx.fillStyle = st.isDash ? '#fb923c' : '#38bdf8';
    ctx.shadowColor = st.isDash ? '#ea580c' : '#38bdf8';
    ctx.shadowBlur = st.isDash ? 14 : 8;
    for (let r = 0; r < st.rows; r++) {
      for (let c = 0; c < st.cols; c++) {
        if (st.grid[r][c] === 2) {
          ctx.fillRect(c * st.cellW, st.topOffset + r * st.cellH, st.cellW, st.cellH);
        }
      }
    }
    ctx.shadowBlur = 0;

    // 5. 적 렌더링
    for (const en of st.enemies) {
      const ex = en.c * st.cellW;
      const ey = st.topOffset + en.r * st.cellH;
      ctx.strokeStyle = en.isBoss ? '#f43f5e' : '#a855f7';
      ctx.shadowColor = en.isBoss ? '#f43f5e' : '#a855f7';
      ctx.shadowBlur = 10;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(ex, ey, en.isBoss ? 9 : 7, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // 6. 플레이어 아바타 렌더링
    const pl = st.player;
    const px = pl.c * st.cellW + st.cellW / 2;
    const py = st.topOffset + pl.r * st.cellH + st.cellH / 2;
    ctx.fillStyle = '#fde047';
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(px, py, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 7. 상단 HUD (실루엣 해금 진행도만 깔끔하게 표시)
    const dashLabel = st.isDash ? '⚡대시' : '';
    this._drawHUD(ctx, {
      lives: st.lives,
      progressPct: st.silhouetteRevealedPct,
      labelText: `실루엣 ${Math.floor(st.silhouetteRevealedPct)}% ${dashLabel}`.trim()
    });
  }
  // =========================================================================
  // 3. 🧩 네모네모 로직 (Nonogram / Picross 숫자 퍼즐)
  // =========================================================================
  _initNonogram() {
    const dotInfo = this._parseDotSprite(this.recipe);
    // 모든 재료 15x15 동일한 그리드로 통일 (16x16 도트에서 비어있는/중복 줄 1행·1열 제거)
    const rows = 15;
    const cols = 15;
    const grid15 = this._reduceGridTo15(dotInfo.grid);

    const target = Array.from({ length: rows }, () => Array(cols).fill(false));
    const targetColor = Array.from({ length: rows }, () => Array(cols).fill(null));
    let totalTargetFilled = 0;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const color = grid15[r][c];
        if (color) {
          target[r][c] = true;
          targetColor[r][c] = color;
          totalTargetFilled++;
        }
      }
    }

    // Row Clues (가로 숫자)
    const rowClues = [];
    for (let r = 0; r < rows; r++) {
      const clues = [];
      let count = 0;
      for (let c = 0; c < cols; c++) {
        if (target[r][c]) {
          count++;
        } else if (count > 0) {
          clues.push(count);
          count = 0;
        }
      }
      if (count > 0) clues.push(count);
      if (clues.length === 0) clues.push(0);
      rowClues.push(clues);
    }

    // Col Clues (세로 숫자)
    const colClues = [];
    for (let c = 0; c < cols; c++) {
      const clues = [];
      let count = 0;
      for (let r = 0; r < rows; r++) {
        if (target[r][c]) {
          count++;
        } else if (count > 0) {
          clues.push(count);
          count = 0;
        }
      }
      if (count > 0) clues.push(count);
      if (clues.length === 0) clues.push(0);
      colClues.push(clues);
    }

    // Board State: 0: Empty, 1: Filled, 2: X Mark
    const board = Array.from({ length: rows }, () => Array(cols).fill(0));

    // 고정 16x16 정밀 레이아웃 & 비율 계산
    const maxRowNums = Math.max(1, ...rowClues.map(c => c.length));
    const maxColNums = Math.max(1, ...colClues.map(c => c.length));

    const leftClueW = Math.max(52, Math.min(72, maxRowNums * 13 + 12));
    const topClueH = Math.max(48, Math.min(72, maxColNums * 13 + 10));

    // 캔버스 가용 영역에 맞춰 칸 크기를 최대한 크게 (정사각 칸 유지)
    const availW = this.width - leftClueW - 12;
    const availH = this.height - topClueH - 52;
    const cellSize = Math.max(16, Math.floor(Math.min(availW / cols, availH / rows)));
    const gridW = cols * cellSize;
    const gridH = rows * cellSize;

    const totalPuzzleW = leftClueW + gridW;
    const leftX = Math.floor((this.width - totalPuzzleW) / 2);
    const gridX = leftX + leftClueW;

    const totalPuzzleH = topClueH + gridH;
    const clueTopY = Math.max(40, Math.floor((this.height - totalPuzzleH) / 2) - 6);
    const gridY = clueTopY + topClueH;

    this.nonogramState = {
      rows,
      cols,
      target,
      targetColor,
      totalTargetFilled,
      board,
      rowClues,
      colClues,
      toolMode: 'FILL',
      isDragging: false,
      dragVal: 0,
      cellSize,
      leftClueW,
      topClueH,
      leftX,
      gridX,
      gridY,
      clueTopY,
      gridW,
      gridH
    };

    this.gameState = 'PLAYING';

    const handleWinClose = () => {
      if (this.gameState === 'WIN' && performance.now() - this.winTimestamp > 250) {
        this.audio?.playTap?.();
        this.stop();
        if (this.onClose) {
          this.onClose();
        } else {
          document.getElementById('hint-close-btn')?.click();
        }
        return true;
      }
      return false;
    };

    const getCanvasPos = (clientX, clientY) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.width / rect.width;
      const scaleY = this.height / rect.height;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
      };
    };

    const applyCellAction = (r, c, forceTool = null) => {
      const st = this.nonogramState;
      if (!st || r < 0 || r >= st.rows || c < 0 || c >= st.cols) return;
      const tool = forceTool || st.toolMode;

      if (tool === 'FILL') {
        const nextVal = st.board[r][c] === 1 ? 0 : 1;
        st.board[r][c] = nextVal;
        st.dragVal = nextVal;
      } else if (tool === 'X') {
        // 이미 칠해진 칸(1)은 X표시 도구로 누르더라도 X가 되지 않도록 방어
        if (st.board[r][c] === 1) {
          st.dragVal = null;
          return;
        }
        const nextVal = st.board[r][c] === 2 ? 0 : 2;
        st.board[r][c] = nextVal;
        st.dragVal = nextVal;
      }
      this.audio?.playTap?.();
      this._checkNonogramWin();
    };

    const handlePointerDown = (clientX, clientY, isRightClick = false) => {
      if (handleWinClose()) return;
      if (this.gameState !== 'PLAYING') return;

      const pos = getCanvasPos(clientX, clientY);
      const st = this.nonogramState;
      if (!st) return;

      // Check grid
      const col = Math.floor((pos.x - st.gridX) / st.cellSize);
      const row = Math.floor((pos.y - st.gridY) / st.cellSize);

      if (col >= 0 && col < st.cols && row >= 0 && row < st.rows) {
        st.isDragging = true;
        const tool = isRightClick ? 'X' : st.toolMode;
        st.currentDragTool = tool;
        applyCellAction(row, col, tool);
      }
    };

    const handlePointerMove = (clientX, clientY) => {
      const st = this.nonogramState;
      if (!st || !st.isDragging || this.gameState !== 'PLAYING') return;
      if (st.dragVal === null || st.dragVal === undefined) return;

      const pos = getCanvasPos(clientX, clientY);
      const col = Math.floor((pos.x - st.gridX) / st.cellSize);
      const row = Math.floor((pos.y - st.gridY) / st.cellSize);

      if (col >= 0 && col < st.cols && row >= 0 && row < st.rows) {
        // X표시 도구 드래그 조작 시 이미 칠해진 칸(1)은 X나 빈칸으로 절대 덮어쓰지 않음
        if (st.currentDragTool === 'X' && st.board[row][col] === 1) return;

        if (st.board[row][col] !== st.dragVal) {
          st.board[row][col] = st.dragVal;
          this.audio?.playTap?.();
          this._checkNonogramWin();
        }
      }
    };

    const handlePointerUp = () => {
      if (this.nonogramState) {
        this.nonogramState.isDragging = false;
        this.nonogramState.dragVal = null;
        this.nonogramState.currentDragTool = null;
      }
    };

    const onMouseDown = (e) => {
      handlePointerDown(e.clientX, e.clientY, e.button === 2);
    };
    const onMouseMove = (e) => {
      handlePointerMove(e.clientX, e.clientY);
    };
    const onMouseUp = () => {
      handlePointerUp();
    };
    const onContextMenu = (e) => {
      e.preventDefault();
    };

    const onTouchStart = (e) => {
      if (handleWinClose()) {
        if (e.cancelable) e.preventDefault();
        return;
      }
      if (e.touches && e.touches[0]) {
        if (e.cancelable) e.preventDefault();
        handlePointerDown(e.touches[0].clientX, e.touches[0].clientY, false);
      }
    };
    const onTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        if (e.cancelable) e.preventDefault();
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onTouchEnd = () => {
      handlePointerUp();
    };

    this.canvas.addEventListener('mousedown', onMouseDown);
    this.canvas.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    this.canvas.addEventListener('contextmenu', onContextMenu);
    this.canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    this.canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);

    this._cleanupInputHandlers = () => {
      this.canvas.removeEventListener('mousedown', onMouseDown);
      this.canvas.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      this.canvas.removeEventListener('contextmenu', onContextMenu);
      this.canvas.removeEventListener('touchstart', onTouchStart);
      this.canvas.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }

  /**
   * 16x16 도트 그리드를 15x15로 축소: 완전히 빈 가장자리 줄을 우선 제거하고,
   * 양끝이 모두 차 있으면 이웃 줄과 가장 비슷한(중복) 내부 줄을 제거해 형태를 유지
   */
  _reduceGridTo15(grid) {
    const pickDrop = (lines) => {
      const n = lines.length;
      const cnt = lines.map(l => l.filter(Boolean).length);
      if (cnt[n - 1] === 0) return n - 1;
      if (cnt[0] === 0) return 0;
      const emptyInner = cnt.findIndex((v, i) => i > 0 && i < n - 1 && v === 0);
      if (emptyInner !== -1) return emptyInner;
      let best = 1;
      let bestDiff = Infinity;
      for (let i = 1; i < n - 1; i++) {
        for (const j of [i - 1, i + 1]) {
          let diff = 0;
          for (let k = 0; k < lines[i].length; k++) {
            if (Boolean(lines[i][k]) !== Boolean(lines[j][k])) diff++;
          }
          if (diff < bestDiff) { bestDiff = diff; best = i; }
        }
      }
      return best;
    };

    let g = grid.map(row => row.slice());
    if (g.length > 15) {
      const dr = pickDrop(g);
      g.splice(dr, 1);
    }
    if (g[0] && g[0].length > 15) {
      const cols = g[0].length;
      const colLines = Array.from({ length: cols }, (_, c) => g.map(row => row[c]));
      const dc = pickDrop(colLines);
      g = g.map(row => { const nr = row.slice(); nr.splice(dc, 1); return nr; });
    }
    return g;
  }

  _checkNonogramWin() {
    const st = this.nonogramState;
    if (!st || this.gameState !== 'PLAYING' || st.totalTargetFilled <= 0) return;

    // 무조건 100% 똑같이 맞춰야만 Clear (256칸 전수 일치 검증)
    let isSolved = true;
    for (let r = 0; r < st.rows; r++) {
      for (let c = 0; c < st.cols; c++) {
        const isFilled = (st.board[r][c] === 1);
        const shouldBeFilled = Boolean(st.target[r][c]);
        if (isFilled !== shouldBeFilled) {
          isSolved = false;
          break;
        }
      }
      if (!isSolved) break;
    }

    if (isSolved) {
      this.gameState = 'WIN';
      this.winTimestamp = performance.now();
      this.audio?.playSuccess?.();
      this._spawnParticles(this.width / 2, this.height / 2, '#38bdf8', 25);
      this._spawnParticles(this.width / 2, this.height / 2, '#fde047', 25);
      this._spawnParticles(this.width / 2, this.height / 2, '#10b981', 25);
      if (this.onWin) {
        this.onWin();
      }
    }
  }

  _isLineMatching(line, clues) {
    const runs = [];
    let count = 0;
    for (let i = 0; i < line.length; i++) {
      if (line[i] === 1) {
        count++;
      } else if (count > 0) {
        runs.push(count);
        count = 0;
      }
    }
    if (count > 0) runs.push(count);
    if (runs.length === 0) runs.push(0);

    if (runs.length !== clues.length) return false;
    return runs.every((r, idx) => r === clues[idx]);
  }

  _updateNonogram() {
    // Nonogram uses event-driven state updates, animations handled by particle tick
  }

  _drawNonogram(ctx) {
    const st = this.nonogramState;
    if (!st) return;

    // 1. 방사형 배경
    const bgRad = ctx.createRadialGradient(this.width / 2, this.height / 2, 30, this.width / 2, this.height / 2, this.width * 0.75);
    bgRad.addColorStop(0, '#111827');
    bgRad.addColorStop(0.6, '#0b0f19');
    bgRad.addColorStop(1, '#050811');
    ctx.fillStyle = bgRad;
    ctx.fillRect(0, 0, this.width, this.height);

    // 2. 상단 HUD
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('🧩 네모네모 로직', 20, 24);

    let filledCount = 0;
    for (let r = 0; r < st.rows; r++) {
      for (let c = 0; c < st.cols; c++) {
        if (st.board[r][c] === 1) filledCount++;
      }
    }
    const pct = Math.min(100, Math.floor((filledCount / Math.max(1, st.totalTargetFilled)) * 100));

    ctx.textAlign = 'right';
    ctx.font = '12px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`${filledCount} / ${st.totalTargetFilled} (${pct}%)`, this.width - 20, 24);

    // 3. 상단 열(Column) 힌트 숫자
    ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
    ctx.fillRect(st.gridX, st.clueTopY, st.gridW, st.topClueH);

    for (let c = 0; c < st.cols; c++) {
      const colLine = [];
      for (let r = 0; r < st.rows; r++) colLine.push(st.board[r][c]);
      const isDone = this._isLineMatching(colLine, st.colClues[c]);

      const clues = st.colClues[c];
      const cx = st.gridX + c * st.cellSize + st.cellSize / 2;
      const spacing = Math.min(13, Math.floor((st.topClueH - 8) / Math.max(1, clues.length)));
      const startNumY = st.clueTopY + st.topClueH - 7 - (clues.length - 1) * spacing;

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = isDone ? 'bold 11px sans-serif' : '11px sans-serif';

      for (let i = 0; i < clues.length; i++) {
        const ny = startNumY + i * spacing;
        ctx.fillStyle = isDone ? '#10b981' : '#cbd5e1';
        ctx.fillText(String(clues[i]), cx, ny);
      }

      // 세로 구분선
      ctx.strokeStyle = (c % 5 === 0 && c > 0) ? 'rgba(148, 163, 184, 0.4)' : 'rgba(51, 65, 85, 0.4)';
      ctx.lineWidth = (c % 5 === 0 && c > 0) ? 1.5 : 0.8;
      ctx.beginPath();
      ctx.moveTo(st.gridX + c * st.cellSize, st.clueTopY);
      ctx.lineTo(st.gridX + c * st.cellSize, st.clueTopY + st.topClueH);
      ctx.stroke();
    }

    // 4. 좌측 행(Row) 힌트 숫자
    ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
    ctx.fillRect(st.leftX, st.gridY, st.leftClueW, st.gridH);

    for (let r = 0; r < st.rows; r++) {
      const rowLine = st.board[r];
      const isDone = this._isLineMatching(rowLine, st.rowClues[r]);

      const clues = st.rowClues[r];
      const cy = st.gridY + r * st.cellSize + st.cellSize / 2;
      const endX = st.leftX + st.leftClueW - 7;
      const spacing = Math.min(13, Math.floor((st.leftClueW - 10) / Math.max(1, clues.length)));

      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.font = isDone ? 'bold 11px sans-serif' : '11px sans-serif';

      for (let i = clues.length - 1; i >= 0; i--) {
        const nx = endX - (clues.length - 1 - i) * spacing;
        ctx.fillStyle = isDone ? '#10b981' : '#cbd5e1';
        ctx.fillText(String(clues[i]), nx, cy);
      }

      // 가로 구분선
      ctx.strokeStyle = (r % 5 === 0 && r > 0) ? 'rgba(148, 163, 184, 0.4)' : 'rgba(51, 65, 85, 0.4)';
      ctx.lineWidth = (r % 5 === 0 && r > 0) ? 1.5 : 0.8;
      ctx.beginPath();
      ctx.moveTo(st.leftX, st.gridY + r * st.cellSize);
      ctx.lineTo(st.leftX + st.leftClueW, st.gridY + r * st.cellSize);
      ctx.stroke();
    }

    // 5. 그리드 셀 (Board Cells)
    const isWin = (this.gameState === 'WIN');

    for (let r = 0; r < st.rows; r++) {
      for (let c = 0; c < st.cols; c++) {
        const bx = st.gridX + c * st.cellSize;
        const by = st.gridY + r * st.cellSize;
        const cs = st.cellSize;

        if (isWin) {
          // 승리 시: 풀컬러 도트 픽셀 아트 대공개!
          if (st.target[r][c] && st.targetColor[r][c]) {
            ctx.fillStyle = st.targetColor[r][c];
            ctx.fillRect(bx, by, cs, cs);

            // 입체 도트 베벨
            ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
            ctx.fillRect(bx, by, cs, 1.2);
            ctx.fillRect(bx, by, 1.2, cs);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
            ctx.fillRect(bx, by + cs - 1.2, cs, 1.2);
            ctx.fillRect(bx + cs - 1.2, by, 1.2, cs);
          } else {
            ctx.fillStyle = '#0b0f19';
            ctx.fillRect(bx, by, cs, cs);
          }
        } else {
          // 플레이 중: 세련된 다크 그리드 & 네온 큐브
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(bx, by, cs, cs);

          if (st.board[r][c] === 1) {
            // 채운 칸 (네온 블루/사이언 큐브)
            ctx.fillStyle = '#0284c7';
            ctx.fillRect(bx + 1.2, by + 1.2, cs - 2.4, cs - 2.4);

            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(bx + 1.2, by + 1.2, cs - 2.4, 1.5);
            ctx.fillRect(bx + 1.2, by + 1.2, 1.5, cs - 2.4);

            ctx.fillStyle = '#0369a1';
            ctx.fillRect(bx + 1.2, by + cs - 2.7, cs - 2.4, 1.5);
            ctx.fillRect(bx + cs - 2.7, by + 1.2, 1.5, cs - 2.4);
          } else if (st.board[r][c] === 2) {
            // X 표시
            ctx.strokeStyle = '#f43f5e';
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(bx + 4, by + 4);
            ctx.lineTo(bx + cs - 4, by + cs - 4);
            ctx.moveTo(bx + cs - 4, by + 4);
            ctx.lineTo(bx + 4, by + cs - 4);
            ctx.stroke();
          }
        }

        // 기본 셀 얇은 경계선
        ctx.strokeStyle = 'rgba(71, 85, 105, 0.35)';
        ctx.lineWidth = 0.6;
        ctx.strokeRect(bx, by, cs, cs);
      }
    }

    // 5x5 블록 강조선 (Picross 전형적인 굵은 가이드선)
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.55)';
    ctx.lineWidth = 1.8;
    for (let c = 5; c < st.cols; c += 5) {
      const gx = st.gridX + c * st.cellSize;
      ctx.beginPath();
      ctx.moveTo(gx, st.gridY);
      ctx.lineTo(gx, st.gridY + st.gridH);
      ctx.stroke();
    }
    for (let r = 5; r < st.rows; r += 5) {
      const gy = st.gridY + r * st.cellSize;
      ctx.beginPath();
      ctx.moveTo(st.gridX, gy);
      ctx.lineTo(st.gridX + st.gridW, gy);
      ctx.stroke();
    }

    // 그리드 전체 외곽 테두리
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.strokeRect(st.gridX, st.gridY, st.gridW, st.gridH);
  }

  _roundRect(ctx, x, y, w, h, r, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }

  _update() {
    this._updateParticles();
    if (this.gameState !== 'PLAYING') {
      if (this.gameState === 'READY' && this.gameType === 'BRICK_BREAKER' && this.bbState) {
        const p = this.bbState.paddle;
        const b = this.bbState.balls ? this.bbState.balls[0] : null;
        if (b && p) {
          b.x = p.x + p.w / 2;
          b.y = p.y - b.r - 2;
        }
        // 시작 후 0.6초 경과 시 자동 발사 (플레이어가 아무것도 안 눌러도 즉시 동작)
        if (performance.now() - (this.bbState.readyTime || 0) > 600) {
          this.launchBall();
        }
      }
      return;
    }
    if (this.gameType === 'BRICK_BREAKER') this._updateBrickBreaker();
    else if (this.gameType === 'TERRITORY_QIX') this._updateTerritoryQix();
    else if (this.gameType === 'NONOGRAM') this._updateNonogram();
  }

  _draw() {
    const ctx = this.ctx;
    ctx.save();
    if (this.shakeTicks > 0) {
      this.shakeTicks--;
      const dx = (Math.random() - 0.5) * 6;
      const dy = (Math.random() - 0.5) * 6;
      ctx.translate(dx, dy);
    }
    if (this.gameType === 'BRICK_BREAKER') this._drawBrickBreaker(ctx);
    else if (this.gameType === 'TERRITORY_QIX') this._drawTerritoryQix(ctx);
    else if (this.gameType === 'NONOGRAM') this._drawNonogram(ctx);
    this._drawParticles(ctx);

    if (this.gameState === 'READY') {
      this._drawOverlayPrompt(ctx, '👆 터치하여 시작');
    } else if (this.gameState === 'OVER') {
      this._drawOverlayPrompt(ctx, '👆 터치하여 다시 시작', '', true);
    } else if (this.gameState === 'WIN') {
      this._drawOverlayPrompt(ctx, 'Clear!', '');
    }

    ctx.restore();
  }
}

window.KSool.ImageMinigameSuite = ImageMinigameSuite;
