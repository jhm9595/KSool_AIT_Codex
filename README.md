# K-Sool · Apps in Toss

KSool_Gemini의 게임을 앱인토스용으로 이식한 별도 프로젝트다. 원본 저장소는 수정하지 않는다.

```powershell
npm ci
npm --prefix k-sool ci
npm run dev
npm run build
npm test
npm run audit:design
```

Node 24 이상이 필요하다. 브라우저에서는 `http://localhost:5173`을 열고 AIT → Viewport에서 모바일 폭을 선택한다. `npm run build`는 게임 생성, 타입 확인, Vite 빌드 후 `k-sool/k-sool.ait`를 만든다.

- `vendor/KSool_Gemini`: 추적 중인 원본 스냅샷
- `k-sool`: 앱인토스 설정, devtools, 전용 어댑터와 디자인 가이드
- `upstream.json`: 원본 적용 커밋·파일 해시
- [업데이트 절차](docs/UPSTREAM.md)
- [출시 준비와 남은 항목](docs/RELEASE.md)
- [전체 화면 개선과 검증 범위](docs/DESIGN-AUDIT.md)

현재 힌트는 무료이며 추천 게시판은 기기 내에서만 저장된다. 원본 운영 Supabase에 접속하지 않는다. 콘솔 등록·업로드·검수 제출은 아직 하지 않았다.
