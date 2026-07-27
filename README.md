<div align="center">

# 정부감사 답변행태 지도

**처리결과보고서와 국정감사 회의록을 연결해 질문·답변·조치의 흐름을 탐색하는 데이터 Atlas**

[프로젝트 정의](docs/stages/00-project-definition.md) · [데이터 안내](DATA_NOTICE.md) · [재현 노트북](P3_CULTURE_DATA_PIPELINE.ipynb)

</div>

---

## 소개

이 저장소는 처리결과보고서에 기록된 문제와 조치 문장을 국정감사 회의록의 질문·답변과 연결하고, 검토가 끝난 분석 단위를 2차원 Atlas로 구성하는 과정을 단계별로 공개합니다.

현재 브랜치는 CRISP-DM의 첫 단계인 프로젝트 정의 checkpoint입니다. 이후 데이터 출처, PDF 전처리, 텍스트 검색, Atlas 모델링, React 화면, 통합 배포 순서로 이어집니다.

## 핵심 질문

- 감사에서 제기된 문제와 실제 회의록 발언은 어떻게 연결되는가?
- 답변의 처리 상태와 설명 방식은 어떤 주제별 패턴을 보이는가?
- 데이터 수집부터 화면까지 같은 식별자와 검증 결과로 추적할 수 있는가?

## 전체 흐름

```text
처리결과보고서 + 국정감사 회의록
→ PDF·텍스트 정리
→ TF-IDF 후보 검색
→ MiniLM 후보 재정렬
→ 검토 완료 데이터
→ TF-IDF·SVD·KMeans·UMAP
→ 140개 Atlas 노드
→ React Story·Atlas·Evidence
```

## Branch Map

| Branch | 내용 |
|---|---|
| `stage/00-project-definition` | 문제 정의와 전체 로드맵 |
| `stage/01-data-sources` | 원본 데이터와 출처 |
| `stage/02-data-preparation` | PDF와 텍스트 전처리 |
| `stage/03-text-mining` | TF-IDF·MiniLM 검색 |
| `stage/04-modeling-atlas` | SVD·KMeans·UMAP과 노드 |
| `stage/05-frontend` | React Story·Atlas·Evidence |
| `stage/06-integration-release` | CI·Vercel·release |
| `main` | 통합 포트폴리오 |

## 문서

- [Stage 00 · 프로젝트 정의](docs/stages/00-project-definition.md)
- [데이터 이용 안내](DATA_NOTICE.md)
- [제출용 재현 패키지 설명](docs/reproducibility/submission-package.md)

## 라이선스

분석 코드와 문서는 [MIT License](LICENSE)를 따릅니다. 원본 데이터와 외부 모델은 각각의 발행기관 및 원 모델 이용 조건을 확인해야 합니다.

