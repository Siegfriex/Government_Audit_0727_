# 모델 artifact 안내

## MiniLM

| 항목 | 값 |
|---|---|
| Model ID | `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` |
| Revision | `e8f8c211226b894fcb81acc59f3b34ba3efd5f42` |
| Weight file | `model.safetensors` |
| Weight SHA-256 | `eaa086f0ffee582aeb45b36e34cdd1fe2d6de2bef61f8a559a1bbc9bd955917b` |
| 출력 | 384차원 문장 벡터 |
| 사용 | TF-IDF top 50 후보 재정렬 |

470MB weight는 일반 Git history에 넣지 않습니다. 이 저장소에는 model·pooling·tokenizer config와 고정 revision만 포함합니다.

공개 원 모델을 준비하는 예시는 다음과 같습니다.

```bash
hf download sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 \
  --revision e8f8c211226b894fcb81acc59f3b34ba3efd5f42 \
  --local-dir models/paraphrase-multilingual-MiniLM-L12-v2

sha256sum models/paraphrase-multilingual-MiniLM-L12-v2/model.safetensors
```

모델을 사용할 때는 원 모델 저장소의 라이선스와 이용 조건을 확인합니다. 이 모델은 sparse 검색 후보의 순서만 다시 정리하며, Atlas의 SVD·UMAP 좌표에는 사용하지 않습니다.

