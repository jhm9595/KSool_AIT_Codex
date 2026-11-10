window.KSool = window.KSool || {};

/**
 * 🤝 FriendHelpService
 * K-술 조합 퀴즈 모드: "나 너무 어려우니 같이 풀자!" 친구 도움요청 SOS 링크 생성 및 복호화 서비스
 * - 질문자: 현재 막힌 레시피 ID + 본인이 보유한 기초 재료 ID 목록을 안전하게 인코딩하여 링크 생성
 * - 친구: 해당 링크로 접속 시 친구가 가진 재료와 문제만 노출되는 독립 샌드박스로 진입 (기존 세이브 데이터 100% 무영향)
 */
class FriendHelpService {
  constructor() {}

  /**
   * 도움 요청 공유 URL 생성
   */
  generateHelpUrl({ recipeId, recipeNumber, recipeName, leafIngIds = [], sharerName = '주모' }) {
    try {
      const payload = {
        rId: Number(recipeId),
        num: String(recipeNumber || ''),
        name: String(recipeName || ''),
        ings: Array.from(new Set(leafIngIds.map(Number))),
        by: String(sharerName || '주모'),
        ts: Date.now()
      };
      const jsonStr = JSON.stringify(payload);
      let b64 = '';
      if (typeof Buffer !== 'undefined') {
        b64 = Buffer.from(jsonStr, 'utf8').toString('base64');
      } else {
        b64 = btoa(unescape(encodeURIComponent(jsonStr)));
      }

      const baseUrl = (typeof window !== 'undefined' && window.location)
        ? `${window.location.origin}${window.location.pathname}`
        : 'https://ksool.game/';
      return `${baseUrl}?help=${encodeURIComponent(b64)}`;
    } catch (e) {
      console.error('[FriendHelpService] generateHelpUrl failed:', e);
      return '';
    }
  }

  /**
   * 도움 요청 URL 파라미터 복호화
   */
  decodeHelpPayload(paramStr) {
    if (!paramStr) return null;
    try {
      const cleaned = decodeURIComponent(paramStr);
      let jsonStr = '';
      if (typeof Buffer !== 'undefined') {
        jsonStr = Buffer.from(cleaned, 'base64').toString('utf8');
      } else {
        jsonStr = decodeURIComponent(escape(atob(cleaned)));
      }
      const data = JSON.parse(jsonStr);
      if (!data || !data.rId || !Array.isArray(data.ings)) {
        return null;
      }
      return {
        recipeId: Number(data.rId),
        recipeNumber: data.num || '',
        recipeName: data.name || '',
        leafIngIds: data.ings.map(Number),
        sharerName: data.by || '친구',
        timestamp: data.ts || 0
      };
    } catch (e) {
      console.warn('[FriendHelpService] decodeHelpPayload failed:', e);
      return null;
    }
  }

  /**
   * 모바일 Web Share API 또는 클립보드 복사 실행
   */
  async shareHelp({ recipeId, recipeNumber, recipeName, leafIngIds, sharerName }) {
    const url = this.generateHelpUrl({ recipeId, recipeNumber, recipeName, leafIngIds, sharerName });
    if (!url) {
      return { ok: false, message: '도움 링크 생성에 실패했습니다.' };
    }

    const title = `[K-술 SOS] No.${recipeNumber} ${recipeName} 같이 풀자! 🍶`;
    const text = `나 이거 너무 어려우니 같이 풀어줘! 내가 가진 재료로 [No.${recipeNumber} ${recipeName}] 조합법을 찾아봐!`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return { ok: true, shared: true, url, message: '친구에게 도움 요청을 전송했습니다!' };
      } catch (err) {
        // 사용자가 취소했거나 지원 안 될 경우 클립보드로 폴백
      }
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        return { ok: true, copied: true, url, message: '📋 친구에게 보낼 SOS 도움요청 링크가 복사되었습니다!' };
      } catch (e) {}
    }

    return { ok: true, copied: false, url, message: `도움 링크: ${url}` };
  }
}

window.KSool.FriendHelpService = FriendHelpService;
