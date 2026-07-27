# PDF 추출과 발언 연결

## 입력과 출력

```text
42 PDF
→ 4,495 Page
→ 293,717 Block
→ 65,590 Speaker Turn
→ 196,686 Retrieval Segment
→ 25,958 QA Pair
→ 26,063 Answer Unit
```

PyMuPDF로 페이지를 열고 `get_text("blocks", sort=True)`를 사용합니다. 좌표 기준으로 정렬된 블록에서 화자 표식을 찾고, 다음 화자가 나타날 때까지의 문장을 하나의 발언으로 연결합니다.

검색 단계에서는 현재 발언만 보는 `TURN`, 앞 발언과 현재 발언을 함께 보는 `PREV_CURR`, 현재 발언과 다음 발언을 함께 보는 `CURR_NEXT` 문맥을 만듭니다. 각 결과에는 회의록·페이지·블록·발언 식별자가 유지됩니다.

