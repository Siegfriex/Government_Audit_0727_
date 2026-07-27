<div align="center">

[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.9.0-F7931E?logo=scikitlearn&logoColor=white)](https://scikit-learn.org/) [![Sentence Transformers](https://img.shields.io/badge/Sentence_Transformers-5.6.0-FFD21E)](https://www.sbert.net/) [![PyTorch](https://img.shields.io/badge/PyTorch-2.12.1-EE4C2C?logo=pytorch&logoColor=white)](https://pytorch.org/) [![Hugging Face](https://img.shields.io/badge/Hugging_Face-Model-FFD21E)](https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2)

# Stage 03 · 텍스트 검색

**TF-IDF로 관련 발언 후보를 찾고 MiniLM과 RRF로 후보 순서를 정리하는 단계**

[목적](#목적) · [입력](#이전-단계-입력) · [처리](#처리-과정) · [결과](#결과) · [실행](#실행) · [다음 단계](#다음-단계)

</div>

---

## 목적

처리결과보고서의 문제·조치 문장을 검색 query로 만들고, 같은 감사 cycle의 회의록 문맥 중 관련 가능성이 높은 50건을 찾습니다. 자동 검색 이후 실제 관련성이 확인된 항목은 검토 완료 데이터로 저장하며, 이후 Atlas 단계에서는 이 데이터를 사용합니다.

## 이전 단계 입력

- [Stage 02 · 데이터 전처리](02-data-preparation.md)
- 검색 query 297건
- 검색 문맥 196,686건

## 처리 과정

### TF-IDF 후보 검색

| 표현 | 설정 | 역할 |
|---|---|---|
| 문자 TF-IDF | 3–5 gram, 최대 120,000 특징 | 띄어쓰기 변화에 강한 표현 검색 |
| 단어 TF-IDF | 1–2 gram, 최대 80,000 특징 | 단어 조합 검색 |
| 결합 점수 | `0.65 × char + 0.35 × word` | 두 검색 결과 결합 |
| 후보 조건 | 같은 감사 cycle, 상위 50 | 비교 범위 제한 |

문제 벡터와 조치 벡터는 각각 변환한 뒤 조치에 0.25 가중치를 적용하고 L2 정규화합니다.

### MiniLM 재정렬

`paraphrase-multilingual-MiniLM-L12-v2`가 query와 후보 문장을 각각 384개 숫자로 바꿉니다. masked mean pooling과 L2 정규화 뒤 cosine similarity가 큰 순서로 TF-IDF 상위 50건만 재정렬합니다. 전체 회의록을 MiniLM으로 직접 검색하지 않습니다.

### RRF

문자 순위, 단어 순위, MiniLM 순위를 `k=60`인 Reciprocal Rank Fusion으로 합칩니다. MiniLM vector는 Atlas 좌표를 만드는 데 사용하지 않습니다.

## 주요 파일

| 파일 | 행 수 |
|---|---:|
| `data/pipeline/target_issues.parquet` | 297 |
| `data/pipeline/retrieval_candidates.parquet` | 14,850 |
| `data/reviewed/reviewed_links.parquet` | 64 |
| `data/reviewed/answer_behavior_labels.parquet` | 769 |
| `data/reviewed/decision_groups.parquet` | 761 |

## 실행

```bash
python3 scripts/validate_data_integrity.py --stage retrieval
```

## 결과

| 항목 | 값 |
|---|---:|
| 검색 query | 297 |
| query별 후보 | 50 |
| 전체 후보 | 14,850 |
| 검토 완료 target-answer 연결 | 64 |
| 답변행태 라벨 | 769 |
| 최종 분석 단위 | 761 |

## 다음 단계

[Stage 04 · Atlas 모델링](04-modeling-atlas.md)에서 761개 분석 단위를 문자 TF-IDF·SVD·KMeans·UMAP으로 변환합니다.

## Branch Map

`stage/00-project-definition` → `stage/01-data-sources` → `stage/02-data-preparation` → **`stage/03-text-mining`** → `stage/04-modeling-atlas` → `stage/05-frontend` → `stage/06-integration-release` → `main`
