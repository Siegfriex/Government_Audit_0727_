# TF-IDF 후보 검색

TF-IDF는 특정 문서에서 중요하게 사용된 글자와 단어 표현을 숫자로 바꾸는 방법입니다.

```text
처리결과보고서 issue/action
→ issue vector + 0.25 × action vector
→ L2 normalization
→ 같은 감사 cycle의 회의록 문맥
→ char 3–5 gram + word 1–2 gram
→ 0.65 char cosine + 0.35 word cosine
→ top 50
```

문자 모델은 최대 120,000개, 단어 모델은 최대 80,000개 특징을 사용합니다. 결측 조치 문장은 문제 문장만으로 query를 만듭니다. cycle 조건을 먼저 적용하므로 다른 감사 연도의 문맥은 후보에 포함하지 않습니다.

