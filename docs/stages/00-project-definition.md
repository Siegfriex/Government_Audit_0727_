<div align="center">

[![Markdown](https://img.shields.io/badge/Markdown-Documentation-000000?logo=markdown)](https://www.markdownguide.org/) [![GitHub](https://img.shields.io/badge/GitHub-Portfolio-181717?logo=github)](https://docs.github.com/) [![CRISP-DM](https://img.shields.io/badge/CRISP--DM-Roadmap-4B5563)](https://www.ibm.com/docs/en/spss-modeler/saas?topic=dm-crisp-help-overview)

# Stage 00 · 프로젝트 정의

**정부감사 자료를 질문·답변·조치의 흐름으로 탐색하는 프로젝트의 범위를 정하는 단계**

[목적](#목적) · [입력](#입력) · [결과](#결과) · [다음 단계](#다음-단계)

</div>

---

## 목적

처리결과보고서에 적힌 감사 문제와 조치가 국정감사 회의록의 어떤 질문·답변과 이어지는지 정리하고, 검토 완료 데이터를 주제와 상태별로 탐색할 수 있는 Atlas를 만드는 것이 목표입니다.

## 분석 대상

| 자료 | 역할 |
|---|---|
| 처리결과보고서 | 검색할 문제와 조치 문장 제공 |
| 국정감사 회의록 | 질문과 답변의 원문 제공 |
| 검토 완료 연결·라벨 | 자동 검색 이후 실제 관련성을 확인한 결과 |

## 처리 범위

```text
문제 정의
→ 원본 데이터와 출처
→ PDF 추출과 텍스트 정리
→ TF-IDF·MiniLM 검색
→ 검토 완료 데이터
→ SVD·KMeans·UMAP
→ Atlas 노드
→ React 화면과 배포
```

## 기대 결과

- 원본 문서와 파생 데이터의 출처를 hash와 식별자로 확인할 수 있습니다.
- 761개 최종 분석 단위를 24개 주제 구역과 140개 Atlas 노드로 정리합니다.
- Story Preview, Full Atlas, Evidence Detail 화면에서 결과를 탐색합니다.

## 실행

이 단계는 문서 checkpoint입니다. 데이터 처리는 저장소 루트의 단일 노트북에서 진행됩니다.

```bash
jupyter nbconvert --to notebook --execute P3_CULTURE_DATA_PIPELINE.ipynb \
  --output P3_CULTURE_DATA_PIPELINE.executed.ipynb \
  --ExecutePreprocessor.timeout=-1
```

원본 PDF와 고정 모델 snapshot은 Git tree가 아니라 공식 출처 또는 release asset으로 준비합니다.

## 결과

| 항목 | 값 |
|---|---:|
| 최종 분석 단위 | 761 |
| 주제 구역 | 24 |
| Atlas 노드 | 140 |

## 다음 단계

[Stage 01 · 데이터 출처](01-data-sources.md)에서 두 원본 계열과 SHA-256, 공식 URL을 설명합니다.

## Branch Map

`stage/00-project-definition` → `stage/01-data-sources` → `stage/02-data-preparation` → `stage/03-text-mining` → `stage/04-modeling-atlas` → `stage/05-frontend` → `stage/06-integration-release` → `main`
