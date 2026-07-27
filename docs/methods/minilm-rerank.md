# MiniLM 후보 재정렬

MiniLM은 문장 전체의 의미를 384개의 숫자로 바꾸는 다국어 문장 모델입니다.

```text
query / TF-IDF candidate
→ tokenizer
→ multilingual MiniLM
→ masked mean pooling
→ 384D sentence vector
→ L2 normalization
→ cosine similarity
→ descending rerank
```

모델은 query와 후보를 별도로 인코딩하는 bi-encoder입니다. TF-IDF가 먼저 찾은 50건만 재정렬하며 전체 corpus 검색이나 cross-encoder 점수 계산에는 사용하지 않습니다. Atlas의 2차원 좌표도 MiniLM이 아니라 검토 완료 데이터의 문자 TF-IDF·SVD 결과에서 만듭니다.

고정 model ID와 revision, weight SHA-256은 [models/README.md](../../models/README.md)에 기록했습니다.

