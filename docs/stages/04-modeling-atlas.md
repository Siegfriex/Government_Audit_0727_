<div align="center">

[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.9.0-F7931E?logo=scikitlearn&logoColor=white)](https://scikit-learn.org/) [![UMAP](https://img.shields.io/badge/UMAP--learn-0.5.9.post2-5B4B8A)](https://umap-learn.readthedocs.io/) [![NumPy](https://img.shields.io/badge/NumPy-2.4.6-013243?logo=numpy)](https://numpy.org/) [![Matplotlib](https://img.shields.io/badge/Matplotlib-3.11.0-11557C)](https://matplotlib.org/)

# Stage 04 · Atlas 모델링

**761개 검토 완료 분석 단위를 24개 주제 구역과 140개 Atlas 노드로 정리하는 단계**

[목적](#목적) · [입력](#이전-단계-입력) · [처리](#처리-과정) · [결과](#결과) · [실행](#실행) · [다음 단계](#다음-단계)

</div>

---

## 목적

검토 완료 761개 문장을 같은 기준으로 숫자로 바꾸고, 비슷한 주제를 묶어 화면에서 탐색할 수 있는 좌표와 노드를 만듭니다.

## 이전 단계 입력

- [Stage 03 · 텍스트 검색](03-text-mining.md)
- `data/reviewed/decision_groups.parquet` 761행
- 각 분석 단위의 상태, 대표 답변유형, topic anchor 문장

## 처리 과정

```text
761 topic anchor
→ char TF-IDF 2–5 gram, 최대 8,192 특징
→ TruncatedSVD 96D
→ L2 normalization
→ KMeans 24
→ cosine medoid 대표 문장
→ UMAP cosine 2D
→ topic × status × primary answer type
→ 140 Atlas nodes
```

| 기술 | 설정 | 역할 |
|---|---|---|
| 문자 TF-IDF | 2–5 gram, `min_df=2`, 최대 8,192 | 문장의 반복 표현을 수치화 |
| SVD | 96차원, `n_iter=15` | 수천 개 특징을 96개 핵심 패턴으로 축소 |
| KMeans | 24개, `n_init=40`, seed 42 | 비슷한 분석 단위를 주제 구역으로 분류 |
| cosine medoid | 구역 내부 평균 cosine | 실제 문장 중 대표 문장 선택 |
| UMAP | cosine, neighbors 20, min_dist 0.08, seed 42 | 96차원을 화면용 2차원 좌표로 변환 |

노드는 `처리 상태 × 주제 구역 × 대표 답변유형`으로 묶습니다. 노드 좌표는 member 좌표의 평균이며, `weighted_mass`는 member의 `combined_confidence` 합입니다. `node_size`는 `7 + 15 × sqrt(weighted_mass / 최대 mass)`로 표시합니다.

> 이 지도는 고차원 텍스트 관계를 2차원으로 옮긴 표시용 공간입니다. 화면상의 거리 자체를 정확한 유사도 점수로 해석하지 않습니다.

## 주요 파일

| 파일 | 결과 |
|---|---:|
| `models/generated/embedding_matrix.parquet` | 761 × 96 |
| `data/pipeline/projection_points.csv` | 761 |
| `data/pipeline/topic_bins.csv` | 24 |
| `data/pipeline/topic_bin_members.parquet` | 761 |
| `data/pipeline/atlas_nodes.csv` | 140 |
| `data/pipeline/atlas_node_members.parquet` | 761 |

## 실행

```bash
python3 scripts/validate_data_integrity.py --stage atlas
python3 -m json.tool reports/reproducibility/REPRODUCIBILITY_REPORT.json
```

## 결과

![761개 UMAP 좌표](../images/data/04_umap_points.png)

![140개 Atlas 노드](../images/data/05_atlas_nodes.png)

재현 clone과 staging의 좌표 최대 차이는 같은 환경과 seed에서 `0.0`이었습니다. projection ID 중복, topic membership 중복, node membership 중복은 각각 0입니다.

## 다음 단계

[Stage 05 · Frontend](05-frontend.md)에서 검증된 Atlas bundle을 React의 Story Preview, Full Atlas, Evidence Detail에 연결합니다.

## Branch Map

`stage/00-project-definition` → `stage/01-data-sources` → `stage/02-data-preparation` → `stage/03-text-mining` → **`stage/04-modeling-atlas`** → `stage/05-frontend` → `stage/06-integration-release` → `main`
