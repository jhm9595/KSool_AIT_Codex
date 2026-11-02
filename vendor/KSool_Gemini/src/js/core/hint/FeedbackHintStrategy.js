window.KSool = window.KSool || {};

/**
 * 조합 실패 시 피드백 힌트 전략 인터페이스
 * 현재 요구사항: "힌트 피드백을 보여줄 수 있는 구조는 만들어 두되 아직은 구현하지 않음"
 */
class FeedbackHintStrategy {
  getFailFeedback(potSlots, recipeBook) {
    return null;
  }
}

class NullFeedbackStrategy extends FeedbackHintStrategy {
  getFailFeedback() {
    return null; // 현재 비활성화 상태 유지
  }
}

window.KSool.FeedbackHintStrategy = FeedbackHintStrategy;
window.KSool.NullFeedbackStrategy = NullFeedbackStrategy;
