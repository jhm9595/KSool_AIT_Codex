# K-Sool 미니앱

루트 README.md의 설치·실행·빌드 절차를 따른다.

npm run dev와 npm run build는 scripts/prepare-game.mjs를 먼저 실행해 ../vendor/KSool_Gemini에서 앱인토스 실행 자산을 생성한다. 원본 스냅샷과 생성된 public/game을 직접 편집하지 않는다. 플랫폼 변경은 src/ait와 생성 스크립트에 기록한다.

디자인 기준은 AGENTS.md 및 docs/design-guide.md를 참고한다. 원본 업데이트와 출시 준비 내역은 루트 docs/UPSTREAM.md, docs/RELEASE.md를 참고한다.
