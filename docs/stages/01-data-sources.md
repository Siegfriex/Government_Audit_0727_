<div align="center">

[![Python](https://img.shields.io/badge/Python-3.12.3-3776AB?logo=python&logoColor=white)](https://www.python.org/) [![pandas](https://img.shields.io/badge/pandas-3.0.3-150458?logo=pandas&logoColor=white)](https://pandas.pydata.org/) [![PyMuPDF](https://img.shields.io/badge/PyMuPDF-1.28.0-2C5BB4)](https://pymupdf.readthedocs.io/) [![SHA--256](https://img.shields.io/badge/SHA--256-Integrity-4B5563)](https://csrc.nist.gov/projects/hash-functions)

# Stage 01 · 데이터 출처

**처리결과보고서와 국정감사 회의록을 원본명·공식 URL·페이지 수·SHA-256으로 정리하는 단계**

[목적](#목적) · [입력](#이전-단계-입력) · [처리](#처리-과정) · [결과](#결과) · [다음 단계](#다음-단계)

</div>

---

## 목적

처음 보는 사람도 어떤 원본을 사용했는지 확인할 수 있도록 자료를 두 계열로 나누고, 원본명과 출처·무결성 정보를 기록합니다. PDF binary는 Git history에 넣지 않고 공식 링크와 SHA-256으로 식별합니다.

## 이전 단계 입력

- [Stage 00 · 프로젝트 정의](00-project-definition.md)
- 원본 제출 패키지의 데이터 카드와 source registry

## 처리 과정

1. 원본을 `TARGET_REPORT`와 `AUDIT_MINUTES`로 구분했습니다.
2. 회의록 registry에서 공식 URL, 원본 파일명, 페이지 수, 파일 크기, SHA-256을 선택했습니다.
3. 처리결과보고서는 원본 파일명·페이지 수·SHA-256과 추출 행 mapping만 공개했습니다.
4. 로컬 절대경로와 PDF binary는 Git tree에서 제외했습니다.

## 주요 파일

| 파일 | 내용 |
|---|---|
| `data/metadata/DATA_SOURCE_CARDS.csv` | 원본 45건의 데이터 카드 |
| `data/source_registry/meeting_sources_public.csv` | 회의록 42건의 공식 URL과 hash |
| `data/source_registry/*_marked_issue_mapping.csv` | 처리결과보고서 원본 행 연결 |
| `data/metadata/EXPECTED_COUNTS.json` | 전체 단계 기준 수치 |

## 실행

```bash
python3 scripts/validate_data_integrity.py --stage sources
```

## 결과

| 항목 | 결과 |
|---|---:|
| 처리결과보고서 | 3건 |
| 국정감사 회의록 | 42건 |
| 회의록 전체 페이지 | 4,495 |
| 회의록 공식 URL | 42건 |
| 회의록 고유 SHA-256 | 42건 |

## 다음 단계

[Stage 02 · 데이터 전처리](02-data-preparation.md)에서 회의록을 페이지·텍스트 블록·화자 발언·검색 문맥으로 바꿉니다.

## Branch Map

`stage/00-project-definition` → **`stage/01-data-sources`** → `stage/02-data-preparation` → `stage/03-text-mining` → `stage/04-modeling-atlas` → `stage/05-frontend` → `stage/06-integration-release` → `main`
