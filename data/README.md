# 데이터 안내

이 디렉터리에는 원본을 설명하는 metadata, 공식 출처 registry, 공개용 reviewed export, 작은 파이프라인 결과가 단계별로 추가됩니다.

## 공개 원칙

| 자료 | Git tree | 공개 방식 |
|---|---|---|
| 국정감사 회의록 PDF 42건 | 제외 | `source_registry/meeting_sources_public.csv`의 공식 URL·원본명·페이지 수·SHA-256 |
| 처리결과보고서 PDF 3건 | 제외 | `metadata/DATA_SOURCE_CARDS.csv`의 원본명·페이지 수·SHA-256과 파생 query table |
| 공개 가능한 작은 파생 데이터 | 포함 | CSV·Parquet과 schema 설명 |
| 대형 재현 자료 | 제외 | GitHub Release asset |

원본을 내려받을 때 파일명을 바꾸지 말고, registry의 SHA-256과 비교합니다. 원본 이용 조건은 [DATA_NOTICE.md](../DATA_NOTICE.md)를 확인합니다.

## 현재 자료

- `metadata/DATA_SOURCE_CARDS.csv`: 두 원본 계열 45건의 쉬운 데이터 카드
- `metadata/DATA_DICTIONARY.csv`: 노트북에서 사용하는 주요 열 설명
- `metadata/EXPECTED_COUNTS.json`: 재현 시 비교할 기준 행 수
- `source_registry/meeting_sources_public.csv`: 회의록 42건의 공개 출처 목록
- `source_registry/*_marked_issue_mapping.csv`: 처리결과보고서에서 추출한 문제 항목의 원본 행 연결
- `reviewed/reviewed_links.parquet`: 실제 관련성을 확인한 target-answer 연결 64건
- `reviewed/answer_behavior_labels.parquet`: 공개용 답변행태 라벨 769건
- `reviewed/decision_groups.parquet`: Atlas 입력이 되는 검토 완료 분석 단위 761건
- `pipeline/target_issues.parquet`: 검색 query 297건
- `pipeline/retrieval_candidates.parquet`: query별 상위 50개 검색 후보 14,850건

`reviewed/` 공개본에는 검토자 이름·이메일·로컬 경로·내부 메모 열이 없습니다.

Atlas 결과는 `pipeline/projection_points.csv`, `topic_bins.csv`, `atlas_nodes.csv`와 두 membership Parquet에 있습니다. 761개 분석 단위가 topic과 node에 각각 한 번씩 포함됩니다.
