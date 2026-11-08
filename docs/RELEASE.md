# 출시 준비 상태

현재는 앱인토스 SDK가 포함된 개발·번들 빌드다. 콘솔 등록·검수·출시는 하지 않았다.

2026-11-08 원본 타이쿤 개편을 반영했다. 점포·연구실·재료 구매·가이드가 초기 흐름이며, 타이쿤 랭킹도 이 기기 전용이다. 원본 운영 서버에는 연결하지 않는다. 실전 튜토리얼 전체 완주와 실제 토스 기기의 화면·오디오·백그라운드 복귀 검증은 아직 출시 조건으로 남아 있다.

## 계획과 SDK 매핑

| 기능 | 도메인/구현 | 권한 | 약관 |
| --- | --- | --- | --- |
| 게임 세션 사용자 키 | User.getAnonymousKey (game/user) | 없음 | 기본 워크스페이스 약관 |
| 화면 종료·뒤로가기 | Screen.close, graniteEvent (navigation/events) | 없음 | 추가 없음 |
| 조합·도감·설정 기록 | 기존 Web Storage (storage 관심 영역, SDK로 교체하지 않음) | 없음 | 추가 없음 |
| 힌트·파티게임 | 기존 DOM 게임, 무료 힌트 | 없음 | 추가 없음 |
| 공용 추천 게시판 | 현재 제외, 이 기기 로컬 기록만 제공 | 없음 | 별도 서버 계획 필요 |

콘솔 약관 기본 매핑은 `BIZ_WORKSPACE`이며 실제 명칭과 동의 게이트는 등록 시 콘솔 응답으로 확인한다. auth, IAP, IAA, 프로모션 머니를 사용하지 않으므로 관련 약관은 현재 범위에 포함하지 않는다. 개인정보 수집을 위한 별도 런타임 권한 요청은 없다.

## 구현

- 공식 create-ait-app@latest React/TypeScript 도구 체인 + 기존 바닐라 DOM 게임. iframe과 외부 사이트 로딩 없이 정적 자산을 같은 번들에 포함한다.
- 프레임워크 3.8.1, devtools 3.8.1. `npm run dev`의 AIT 패널에서 모바일 viewport 확인.
- 생성·가공 단계는 원본과 별도이며 서버 호출과 원본 운영 키를 실행 산출물에서 제거한다.
- 뒤로가기는 모달 → 파티게임 목록 → 주조실 → 종료 확인 순서로 처리한다.
- Web Audio 컨텍스트의 백그라운드 일시 정지 및 복귀 처리를 추가한다.
- 익명 키는 로컬에만 저장하며 서버 인증 용도로 전송하지 않는다. 브리지 실패 시 로컬 진행을 유지한다.

## 출시 전 남은 확인

- 주류/음주 표현, 벌칙 게임, 실제·패러디 상표와 이미지의 사용 범위 및 적합한 게임 등급을 확인한다. 성인 인증이 필요한 등급이면 공식 인증 흐름을 추가한다. 현재 나이 확인 팝업을 인증으로 취급하지 않는다.
- 공식 게임 출시 가이드와 서비스 오픈 정책의 게임 등급, 과몰입 방지, 문의 채널 요건을 실제 등급·운영 방침에 맞춰 마무리한다.
- 고객센터 연락처, 개인정보처리방침과 저장 데이터 안내, 최종 로고·스크린샷 및 콘솔 브랜드 정보를 준비한다.
- 실제 토스 앱에서 Android 백버튼·상단 닫기·종료 확인·safe area·음소거·앱 복귀·사용자 키·저장 복원을 확인한다. SDK mock 테스트는 실기기 검증을 대체하지 않는다.
- 글자·버튼·아이콘·모달·도감·안전 여백은 2026-11-03 전체 화면 개선을 적용했다. `docs/DESIGN-AUDIT.md`에 화면 범위와 검증 한계를 기록했다. 주류 관련 과장 표현과 문체는 UX 문구 검토 대상이다.
- 공용 게시판·토스 로그인·광고·결제는 이 버전에 포함하지 않는다.

## 근거

문서 MCP가 2026-11-03 점검에서 Internal Server Error를 반환해 공식 웹 원문과 설치된 SDK .d.ts로 대조했다.

- https://developers-apps-in-toss.toss.im/checklist/app-game.md
- https://developers-apps-in-toss.toss.im/intro/guide.md
- https://developers-apps-in-toss.toss.im/documentation/sdk/domains-api/user/user.getanonymouskey.md
- https://developers-apps-in-toss.toss.im/documentation/sdk/domains-api/screen/screen.close.md
- https://developers-apps-in-toss.toss.im/documentation/sdk/events/graniteevent.md
