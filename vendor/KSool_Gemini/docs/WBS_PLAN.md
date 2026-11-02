# 🗂️ WBS 작업 분해 및 DAG 의존성 계획서: 한국의 술 도감 게임

- **총괄 PM**: 김수석 (PM / Technical Lead)
- **프로젝트 식별자**: `ksool_game`
- **작성일시**: 2026. 10. 27. 오후 7:29:38
- **분류(Triage)**: URGENT_HOTFIX (도감/필터 UI의 '전체보기' 인근 버튼들이 부모 컨테이너 영역을 벗어나 가려지는 화면 렌더링 결함으로, 즉각적인 CSS/레이아웃 수정이 필요한 긴급 버그(URGENT_HOTFIX)로 분류하여 패스트트랙을 적용합니다.)

---
## 1. DAG 파이프라인 흐름
```text
[PM Router Triage] ➔ [Planner PRD] ➔ [Security Gate 1: Threat Modeling]
       │
       ▼
 [PM WBS 수립] ➔ [DBA 스키마 DDL] ➔ [BE 비즈니스/API] ➔ [FE 컴포넌트]
       │
       ▼
 [Security Gate 2: SAST] ➔ [Staging Build] ➔ [QA Gate 3: E2E/회귀]
       │
       ▼
 [Security Gate 4: DAST 모의침투] ➔ [Infra Production Release]
```

## 2. WBS 세부 작업 패키지 (Work Packages)
### WP-1: [agent-frontend]
- **지시 내용**: index.html 내 '전체보기' 버튼이 포함된 카테고리 필터 컨테이너를 찾아 레이아웃을 개선하세요. flex-wrap: wrap (또는 모바일 최적화를 위한 overflow-x: auto와 no-scrollbar/smooth-scroll 스타일)을 적용하고, 버튼 간 gap 및 최소 클릭 영역을 확보하여 UX를 최적화하세요.
- **완료 기준**: 다양한 뷰포트 폭에서 버튼들이 영역을 벗어나지 않고 정상적으로 노출 및 클릭 가능해야 함


## 3. 테스트 케이스 및 검증 지표
- **TC-1**: TC-1: 화면 해상도(375px 모바일, 768px 태블릿, 1280px 데스크톱)별로 버튼 그룹이 잘림 없이 렌더링되는지 확인
- **TC-2**: TC-2: 가로 스크롤 또는 줄바꿈 시 버튼 간 여백(gap) 및 액티브/호버 상태 스타일이 깨지지 않는지 E2E 검증
- **TC-3**: TC-3: 끝 쪽 버튼 클릭 시 해당 주류 카테고리 목록이 정상 필터링되는지 기능 회귀 테스트

## 4. 품질 및 보안 게이트웨이 기준
- **기준 1**: '전체보기' 및 인접 카테고리/필터 버튼들이 화면이나 컨테이너 밖으로 잘려 나가지 않고 온전히 노출되어야 한다.
- **기준 2**: 모바일 및 좁은 화면 폭에서도 가로 스크롤(터치 스와이프) 혹은 자연스러운 줄바꿈(flex-wrap)으로 모든 버튼에 접근 가능해야 한다.
- **기준 3**: 버튼 클릭 시 해당 카테고리 필터링 기능이 기존과 동일하게 정상 동작해야 한다.
