# 원본 추적

- 원본: `https://github.com/jhm9595/KSool_Gemini.git` (읽기 전용)
- 대상: `https://github.com/jhm9595/KSool_AIT_Codex.git`
- 최초 기준: `9ab2022a9b389c98d579d6b4ce1f8456127e79a8`
- 실제 적용 기준과 파일 SHA-256은 루트 `upstream.json`에 기록한다.

`vendor/KSool_Gemini`에는 원본의 index.html, project.json, src, assets, data, docs를 원본 바이트 그대로 보존한다. 원본을 편집하거나 원본의 운영 Supabase로 요청하지 않는다. `k-sool/scripts/prepare-game.mjs`가 스냅샷으로부터 실행 파일을 생성하며, 원본 게시판 네트워크 메서드·운영 키를 제거하고 무료 힌트 서비스를 넣는다. 생성되는 `public/game`은 커밋하지 않는다.

## 업데이트 절차

1. 작업 트리와 `AGENTS.md`를 확인한다. 사용자 작업을 덮어쓰지 않는다.
2. `npm run upstream:check`로 최신 HEAD와 적용 기준을 비교한다.
3. 원본 커밋 diff를 확인한다. 특히 데이터 구조, 저장 스키마, 스크립트 순서, 외부 요청, 광고·결제, 타이머를 검토한다.
4. `npm run upstream:sync`로 스냅샷을 갱신한다. 스냅샷에 수동 변경이 있으면 해시 검사로 중단한다. source fetch는 URL을 직접 사용하며 원본 push remote를 만들지 않는다.
5. 필요하면 앱 어댑터만 수정하고 `npm run build`, `npm test`를 실행한다. 조합·힌트·도감·파티게임·설정·저장 복원을 확인한다.
6. 대상 저장소에만 커밋하고 push한다. 실패/충돌은 기록하고 알린다. 검수와 출시는 별도 작업이다.

매일 오전 10시(Asia/Seoul) Codex 채팅 heartbeat가 이 절차를 수행하도록 등록했다. 실제 자동 실행은 Codex 로컬 실행 환경과 네트워크가 사용 가능해야 한다. 변경이 없으면 알리지 않는다.

## 경계

- 원본 문서와 원본 키는 provenance 목적으로 vendor에 보존되지만 실행·배포 파일에는 운영 키가 포함되지 않는다.
- 기존 저장 키를 유지한다. 원본 웹사이트와 토스 WebView는 origin이 달라 저장이 자동 이전되지는 않는다.
- 추천 게시판은 이 기기 전용이다. 공용 게시판과 투표는 별도 서버·사용자 식별·권한 검토 후 추가한다.
- 무료 힌트는 광고 시청 보상이 아니다. IAA 도입 시 SDK 보상 이벤트에서만 지급하도록 별도로 구현해야 한다.
- 최초 원본 커밋의 HintModalView에서 `backChoiceBtn` 대신 아직 초기화되지 않은 `mgBackChoiceBtn`을 참조하는 오류는 생성 파일에서만 보정한다. 원본이 수정되면 해당 패턴이 없어져 보정이 자동으로 생략된다.
- 같은 커밋의 힌트 BASEBALL/UPDOWN 분기에 필요한 해금 상태 변수도 생성 단계에서 범위를 보정한다. 디자인 변환은 `k-sool/scripts/design-transforms.mjs`에 모으고 신규 원본 화면에도 적용한다. 변경 후 `npm run audit:design`을 실행한다.
