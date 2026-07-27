# Data bundle에서 React ViewModel까지

| 계층 | 역할 |
|---|---|
| Pointer | 사용할 release ID와 manifest SHA-256 선택 |
| Manifest loader | runtime 파일 목록·크기·hash 확인 |
| Runtime schema | JSON 구조와 필수 값 검사 |
| Repository | node·member·evidence·topic 데이터를 한 release로 제공 |
| Adapter | raw 필드를 화면에서 사용하는 이름과 형식으로 변환 |
| ViewModel | Story·Atlas·Evidence가 공유하는 읽기 모델 생성 |
| Widget | 사용자 탐색과 표현 담당 |

component는 raw JSON을 직접 읽지 않습니다. bundle을 읽지 못하면 임의 mock이나 과거 release로 대체하지 않고 데이터 이용 불가 상태를 표시합니다. relation data도 검증된 계약이 없으면 생성하지 않습니다.

Story Preview와 Full Atlas는 같은 `projection_id`, 좌표, node encoding을 공유합니다. Preview subset은 manifest가 연결한 16개 고정 ID이며 화면에서 임의 선택하지 않습니다.
