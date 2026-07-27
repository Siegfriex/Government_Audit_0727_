# 데이터부터 화면까지

```text
처리결과보고서
→ 문제·조치 query

국정감사 회의록 PDF
→ Page → Block → Speaker Turn → Retrieval Segment

Query + Retrieval Segment
→ char/word TF-IDF → MiniLM → RRF → 검토 완료 연결

검토 완료 데이터
→ char TF-IDF → SVD 96D → KMeans 24 → UMAP 2D
→ topic × status × answer type → Atlas Node 140

Atlas bundle
→ manifest → loader → adapter → ViewModel
→ Story Preview / Full Atlas / Evidence Detail
```

MiniLM은 검색 후보 50건의 순서를 다시 정리하는 데만 사용합니다. Atlas 좌표는 검토 완료 761개 분석 단위를 문자 TF-IDF와 SVD로 변환한 값에서 만듭니다.

