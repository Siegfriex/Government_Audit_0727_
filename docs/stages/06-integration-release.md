<div align="center">

[![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-CI-2088FF?logo=githubactions&logoColor=white)](https://github.com/features/actions) [![Vercel](https://img.shields.io/badge/Vercel-Production-000000?logo=vercel)](https://vercel.com/) [![Node.js](https://img.shields.io/badge/Node.js-20.20.1-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/) [![Vite](https://img.shields.io/badge/Vite-6.4.3-646CFF?logo=vite&logoColor=white)](https://vite.dev/)

# Stage 06 · 통합과 배포

**데이터·노트북·frontend 검증을 CI와 Vercel production, GitHub Release로 연결하는 단계**

[목적](#목적) · [입력](#이전-단계-입력) · [처리](#처리-과정) · [결과](#결과) · [실행](#실행) · [다음 단계](#다음-단계)

</div>

---

## 목적

앞 단계의 자료를 하나의 포트폴리오로 통합하고, 작은 검증은 Pull Request마다 실행하며 전체 재현 자료는 GitHub Release asset으로 분리합니다. React SPA는 GitHub `main`과 연결된 별도 Vercel project에 배포합니다.

## 이전 단계 입력

- [Stage 05 · Frontend](05-frontend.md)
- canonical BF runtime bundle
- 검증 완료 data·notebook·frontend

## 처리 과정

| 구성 | 확인 내용 |
|---|---|
| `data-integrity.yml` | source card, row count, ID, Atlas, BF manifest |
| `notebook-smoke.yml` | notebook JSON, 절대경로, 외부 import, seed |
| `frontend-ci.yml` | npm ci, typecheck, lint, unit, build, production route smoke |
| Vercel | `main`, Root `frontend`, Node 20.x, Vite SPA |
| GitHub Release | 정제한 공개 재현 ZIP과 SHA-256 |

42개 PDF와 470MB MiniLM weight를 사용하는 전체 재현은 CI에서 반복하지 않습니다. `scripts/build_public_release_bundle.py`가 두 항목을 release asset에 포함하고 처리결과보고서 PDF 3건, 환경 파일, 검토자 정보, 로컬 절대경로를 제외합니다.

## 주요 파일

| 파일 | 역할 |
|---|---|
| `.github/workflows/data-integrity.yml` | 공개 데이터와 runtime 검증 |
| `.github/workflows/notebook-smoke.yml` | 노트북 portability 검증 |
| `.github/workflows/frontend-ci.yml` | frontend build·test |
| `scripts/build_public_release_bundle.py` | 공개 재현 asset 생성 |
| `docs/release/v1.0.0.md` | release notes |

## 실행

```bash
python3 scripts/validate_data_integrity.py --stage all
python3 scripts/validate_notebook_portability.py
python3 scripts/verify_frontend_release.py

cd frontend
npm run deploy:check
npm run test:e2e:preview
```

공개 재현 asset은 원본 제출 패키지 경로를 argument로 전달해 생성합니다.

```bash
python3 scripts/build_public_release_bundle.py \
  --submission-root /path/to/P3_CULTURE_SUBMISSION_DATA_PIPELINE
```

## 결과

| 항목 | 값 |
|---|---|
| Vercel project | `government-audit-0727` |
| Production branch | `main` |
| Root directory | `frontend` |
| Canonical release | `ATLAS_DG761_STORY_20260724_022353_KST_BF673FD1` |
| Projection | `PROJ_DG761_20260723_213011_KST_4665FDF3E5CF` |

## 다음 단계

`stage/06-integration-release` PR의 merge commit을 `main`에 반영한 뒤 production route QA, `v1.0.0-portfolio-release` tag와 GitHub Release를 확정합니다.

## Branch Map

`stage/00-project-definition` → `stage/01-data-sources` → `stage/02-data-preparation` → `stage/03-text-mining` → `stage/04-modeling-atlas` → `stage/05-frontend` → **`stage/06-integration-release`** → `main`

