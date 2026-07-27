<div align="center">

# Stage 02 · 데이터 전처리

**PDF 원문을 페이지·텍스트 블록·화자 발언·검색 문맥으로 변환하는 단계**

[목적](#목적) · [입력](#이전-단계-입력) · [처리](#처리-과정) · [결과](#결과) · [실행](#실행) · [다음 단계](#다음-단계)

</div>

---

## 목적

회의록 PDF의 읽기 순서를 유지하면서 텍스트를 추출하고, 화자별 발언과 앞뒤 문맥을 검색 가능한 단위로 만듭니다. 원문 열은 보존하고 정리한 텍스트를 별도 열에 저장합니다.

## 이전 단계 입력

- [Stage 01 · 데이터 출처](01-data-sources.md)
- 공식 출처에서 준비한 회의록 PDF 42건
- `data/source_registry/meeting_sources_public.csv`

## 처리 과정

1. PyMuPDF의 `page.get_text("blocks", sort=True)`로 페이지의 텍스트 블록을 읽습니다.
2. 화자 표시를 기준으로 이어지는 문장을 같은 발언으로 연결합니다.
3. 각 발언 자체(`TURN`), 이전+현재(`PREV_CURR`), 현재+다음(`CURR_NEXT`) 세 종류의 검색 문맥을 만듭니다.
4. 질문과 답변의 순서를 묶고 답변을 분석 가능한 단위로 나눕니다.
5. Unicode NFKC, NUL 제거, 줄바꿈의 공백 변환, 다중 공백 정리, 앞뒤 공백 제거를 순서대로 적용합니다.

## 주요 파일

| 파일 | 역할 | 행 수 |
|---|---|---:|
| `P3_CULTURE_DATA_PIPELINE.ipynb` | 원본부터 전체 과정을 실행하는 단일 노트북 | 22 code cells |
| `data/pipeline/qa_pairs.parquet` | 질문과 답변의 묶음 | 25,958 |
| `data/pipeline/answer_units.parquet` | 최종 답변 분석 단위 | 26,063 |

페이지·블록·화자 발언·검색 문맥 전체 파일은 크기가 커서 Git tree에 중복 저장하지 않습니다. 노트북 실행 결과 또는 GitHub Release의 재현 패키지에서 만듭니다.

## 실행

```bash
python3 scripts/validate_notebook_portability.py
python3 scripts/validate_data_integrity.py --stage preparation
```

전체 재현은 원본 PDF와 로컬 MiniLM snapshot을 준비한 뒤 실행합니다.

```bash
jupyter nbconvert --to notebook --execute P3_CULTURE_DATA_PIPELINE.ipynb \
  --output P3_CULTURE_DATA_PIPELINE.executed.ipynb \
  --ExecutePreprocessor.timeout=-1
```

## 결과

| 단계 | 행 수 |
|---|---:|
| PDF 페이지 | 4,495 |
| 텍스트 블록 | 293,717 |
| 화자 발언 | 65,590 |
| 검색 문맥 | 196,686 |
| 질문·답변 묶음 | 25,958 |
| 답변 단위 | 26,063 |

## 다음 단계

[Stage 03 · 텍스트 검색](03-text-mining.md)에서 처리결과보고서 query와 검색 문맥을 TF-IDF로 비교하고 MiniLM으로 후보 순서를 다시 정리합니다.

## Branch Map

`stage/00-project-definition` → `stage/01-data-sources` → **`stage/02-data-preparation`** → `stage/03-text-mining` → `stage/04-modeling-atlas` → `stage/05-frontend` → `stage/06-integration-release` → `main`

