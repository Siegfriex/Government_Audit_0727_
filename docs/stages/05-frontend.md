<div align="center">

[![React](https://img.shields.io/badge/React-19.2.8-61DAFB?logo=react&logoColor=black)](https://react.dev/) [![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![Vite](https://img.shields.io/badge/Vite-6.4.3-646CFF?logo=vite&logoColor=white)](https://vite.dev/) [![Playwright](https://img.shields.io/badge/Playwright-1.61.1-2EAD33?logo=playwright)](https://playwright.dev/)

# Stage 05 · Frontend

**canonical Atlas bundle을 Story·Full Atlas·Evidence 화면으로 연결하는 단계**

[목적](#목적) · [입력](#이전-단계-입력) · [처리](#처리-과정) · [결과](#결과) · [실행](#실행) · [다음 단계](#다음-단계)

</div>

---

## 목적

검증된 data bundle을 React 화면이 직접 계산하지 않고 읽도록 구성합니다. loader가 pointer와 manifest를 확인한 뒤 repository·adapter를 거쳐 화면에 필요한 ViewModel을 만듭니다.

## 이전 단계 입력

- [Stage 04 · Atlas 모델링](04-modeling-atlas.md)
- Release `ATLAS_DG761_STORY_20260724_022353_KST_BF673FD1`
- Projection `PROJ_DG761_20260723_213011_KST_4665FDF3E5CF`

## 처리 과정

```text
current-release pointer
→ frontend manifest
→ 80개 file hash/schema 확인
→ repository
→ adapter
→ ViewModel
→ Story Preview / Full Atlas / Evidence Detail
```

Story Preview와 Full Atlas는 같은 release의 좌표와 encoding을 사용합니다. Preview 16개 ID는 bundle의 `story_preview_node_ids`에서 읽고, Full Atlas는 140개 전체 노드를 사용합니다. frontend는 TF-IDF·MiniLM·UMAP 계산을 다시 수행하지 않습니다.

## 주요 파일

| 파일 | 역할 |
|---|---|
| `frontend/public/data/current-release.json` | 현재 BF release pointer |
| `frontend-manifest.json` | 80개 runtime file의 크기와 SHA-256 |
| `frontend/src/shared` | loader·schema·repository·adapter·ViewModel |
| `frontend/src/app/AppRouter.tsx` | SPA route |
| `frontend/vercel.json` | build와 SPA rewrite |

## 실행

```bash
python3 scripts/verify_frontend_release.py
cd frontend
npm ci
npm run typecheck
npm run lint
npm run test
npm run build
npm run test:e2e
```

## 결과

| 항목 | 결과 |
|---|---:|
| manifest 선언 파일 | 80 |
| 누락 / hash mismatch | 0 / 0 |
| Story Preview | 16 nodes |
| Full Atlas | 140 nodes |
| Evidence | 64 records |

![Full Atlas](../images/frontend/atlas-default-1440.png)

![Evidence Detail](../images/frontend/vercel-production-final-evidence-playwright.png)

## 다음 단계

[Stage 06 · 통합과 배포](06-integration-release.md)에서 GitHub Actions, Vercel production, route QA, GitHub Release를 구성합니다.

## Branch Map

`stage/00-project-definition` → `stage/01-data-sources` → `stage/02-data-preparation` → `stage/03-text-mining` → `stage/04-modeling-atlas` → **`stage/05-frontend`** → `stage/06-integration-release` → `main`
