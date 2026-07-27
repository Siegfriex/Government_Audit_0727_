# Frontend

React·TypeScript·Vite로 만든 정적 SPA입니다. canonical BF data bundle 한 개만 사용합니다.

## 데이터 로딩

```text
public/data/current-release.json
→ frontend-manifest.json
→ file hash와 runtime schema 확인
→ repository
→ adapter
→ ViewModel
→ Story Preview / Full Atlas / Evidence Detail
```

| 화면 | 경로 | 내용 |
|---|---|---|
| Story | `/` | 프로젝트 전체 스토리 |
| Answers Preview | `/#answers` | 선정 규칙이 고정된 16개 노드 |
| Full Atlas | `/atlas` | 전체 140개 노드 탐색 |
| Evidence | `/evidence/:evidenceId` | 공개 근거 64건의 상세 |
| Method | `/method` | 처리 방법 설명 |
| Data | `/data` | 데이터 구조와 출처 |

## 실행

```bash
npm ci
npm run dev
```

## 검증

```bash
npm run typecheck
npm run lint
npm run test
npm run build
npm run test:e2e
```

Vercel은 repository의 `frontend`를 Root Directory로 사용하고 `npm ci`, `npm run build`, `dist` 설정으로 배포합니다. production에서는 `VITE_ATLAS_RELEASE_ID`를 설정하지 않고 `current-release.json`을 따릅니다.

외부 editorial 이미지 binary는 공개 권리 범위가 확정되지 않아 repository에 포함하지 않았습니다. portfolio build는 repository-owned 중립 SVG placeholder를 사용합니다.
