# P3_CULTURE 제출용 데이터 처리 패키지

## 1. 프로젝트 소개

이 폴더는 처리결과보고서와 국정감사 회의록을 어떤 순서로 정리하고 분석했는지를 한 번에 재현하는 제출 자료입니다. 처음 보는 심사관이 원본 자료에서 최종 U-MAP(이하 작업에서는 임의 부여 이름명: "Atlas" 로 표기)노드가 만들어지는 흐름을 따라갈 수 있도록 단일 Jupyter Notebook으로 구성했습니다.

사용한 원본은 문화체육관광위원회 국정감사 회의록 PDF 42건과 처리결과보고서 PDF 3건입니다. 회의록은 페이지, 텍스트 블록, 화자 발언, 검색 문맥으로 차례로 정리합니다. 처리결과보고서는 사람이 표시해 확정한 문제·조치 행을 검색 문장으로 사용합니다.

## 2. 사용한 원본 데이터

- `data/raw/meeting_pdfs/`: 공식 국정감사 회의록 PDF 42건
- `data/raw/target_reports/`: 처리결과보고서 원본 PDF 3건
- `data/raw/source_registry/`: 회의록 수집 기록, 원본 목록, 보고서 marker mapping(검색 쿼리용)
- `data/metadata/DATA_SOURCE_CARDS.csv`: 파일명, 연도, 페이지 수, SHA-256(데이터간 val용), 사용 역할
- `data/reviewed/`: 사람이 확인한 761개 분석 단위, 769개 답변행태 라벨, 관련 발언 연결
- `models/paraphrase-multilingual-MiniLM-L12-v2/`: 경량화 다국어 문장 모델

원본 파일은 노트북에서 읽기만 합니다. 새로 만든 표, 그림, 실행 기록은 모두 `outputs/` 아래에 저장됩니다.

## 3. 전체 처리 순서

1. 원본 PDF의 파일 수, 페이지 수, SHA-256을 확인합니다.
2. PyMuPDF로 회의록의 페이지와 텍스트 블록을 읽습니다.
3. 블록에서 화자 머리말을 찾아 같은 화자의 발언을 연결합니다.
4. 현재 발언과 앞뒤 발언을 합쳐 검색용 문맥을 만듭니다.
5. 처리결과보고서의 문제·조치 문장을 검색 쿼리로 정리합니다.
6. 같은 감사 연도의 회의록에서 TF-IDF 상위 50개 후보를 찾습니다.
7. 로컬 MiniLM으로 후보의 의미 유사도 순서를 다시 계산하고 세 순위를 합칩니다.
8. 사람이 확인한 연결과 답변유형 데이터는 `data/reviewed/`에서 읽습니다.
9. 761개 대표 문장을 문자 TF-IDF와 SVD 96차원으로 바꿉니다.
10. KMeans로 24개 주제 구역을 만들고 UMAP으로 2차원 좌표를 계산합니다.
11. 주제, 처리 상태, 답변유형이 같은 분석 단위를 묶어 140개 Atlas 노드를 만듭니다.

## 4. 사용한 분석 방법

### TF-IDF

특정 문서에서 중요하게 사용된 글자와 단어 표현을 숫자로 바꾸는 방법입니다. 회의록에서 관련 발언을 찾고, 지도용 문장 특징을 만드는 데 사용했습니다.

### MiniLM

문장 전체의 의미를 384개의 숫자로 바꾸는 다국어 문장 모델입니다. TF-IDF가 찾은 후보의 순서를 다시 정리하는 데만 사용했습니다.

### SVD

수천 개의 텍스트 특징을 핵심 패턴 96개로 줄이는 방법입니다.

### KMeans

비슷한 문장을 24개의 주제 구역으로 나누는 데 사용했습니다.

### UMAP

96차원 문장 데이터를 화면에서 볼 수 있도록 2차원 좌표로 옮기는 데 사용했습니다.

## 5. 폴더 구성

- `P3_CULTURE_DATA_PIPELINE.ipynb`: 위에서 아래로 한 번 실행하는 전체 처리 과정
- `data/metadata/`: 원본 명세, 주요 열 설명, 기준 행 수
- `data/raw/`: 원본 PDF와 실제 수집·정리 기록
- `data/reviewed/`: 사람의 확인이 끝난 입력 데이터
- `models/`: 오프라인 MiniLM 모델
- `outputs/tables/`: 단계별 결과 표
- `outputs/figures/`: 6개 요약 그림
- `outputs/cache/`: 실행 중 만든 벡터와 모델
- `outputs/RUN_SUMMARY.json`: 마지막 자동 검사 결과
- `verification/REPRODUCIBILITY_REPORT.json`: 별도 복사본 재실행 비교 결과

## 6. 실행 방법

Python 3.12 환경을 권장합니다. 제출 폴더에서 다음 명령을 실행합니다.

```bash
python -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/jupyter-nbconvert \
  --to notebook \
  --execute P3_CULTURE_DATA_PIPELINE.ipynb \
  --inplace \
  --ExecutePreprocessor.timeout=-1
```

Windows에서는 `.venv/bin/python` 대신 `.venv\Scripts\python.exe`를 사용할 수 있습니다. 노트북은 인터넷을 호출하지 않으며, 포함된 MiniLM 폴더를 직접 읽습니다.

## 7. 실행 후 생성되는 결과

`outputs/tables/`에는 페이지, 블록, 화자 발언, 검색 문맥, 질문·답변, 검색 후보, 2차원 좌표, 주제 구역, Atlas 노드와 구성원 표가 생성됩니다. `outputs/figures/`에는 처리 단계별 행 수부터 최종 노드 지도까지 6개 PNG가 생성됩니다.

마지막 기준 규모는 회의록 42건, 4,495페이지, 293,717블록, 65,590개 화자 발언, 196,686개 검색 문맥, 25,958개 질문·답변 묶음, 26,063개 답변 단위, 297개 쿼리, 14,850개 후보, 761개 분석 단위, 24개 주제 구역, 140개 Atlas 노드입니다.

## 8. 재현성 확인 방법

노트북의 마지막 셀은 원본 해시, 주요 행 수, 좌표의 유한값, ID 중복, 구성원 중복을 자동 검사합니다. 화면의 표와 `outputs/RUN_SUMMARY.json`에서 모든 항목의 `PASS`를 확인할 수 있습니다.

`MANIFEST.sha256`은 제출 파일의 SHA-256 목록입니다. 다음 명령으로 현재 파일과 비교할 수 있습니다.

```bash
sha256sum -c MANIFEST.sha256
```

별도 임시 복사본에서 전체 노트북을 다시 실행한 비교 결과는 `verification/REPRODUCIBILITY_REPORT.json`에 기록됩니다.
