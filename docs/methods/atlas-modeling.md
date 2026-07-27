# Atlas 모델링 방법

## 문장을 숫자로 바꾸기

761개 topic anchor를 문자 2–5 gram TF-IDF로 바꿉니다. `min_df=2`, `max_features=8192`, `sublinear_tf=True`, `norm="l2"`, `dtype=float64`를 사용합니다.

## 96차원 핵심 패턴

TruncatedSVD는 TF-IDF 특징을 96개 패턴으로 줄입니다. `n_iter=15`, `random_state=42`로 고정하고 결과를 다시 L2 정규화합니다.

## 주제 구역과 대표 문장

KMeans는 96차원 행렬을 24개 구역으로 나눕니다. `n_init=40`, `algorithm="lloyd"`, `random_state=42`를 사용합니다. 각 구역에서 다른 member와의 평균 cosine 유사도가 가장 높은 실제 문장을 대표 문장으로 선택합니다.

## 2차원 좌표와 노드

UMAP은 `metric="cosine"`, `n_neighbors=20`, `min_dist=0.08`, `random_state=42`, `n_jobs=1`로 2차원 좌표를 만듭니다. 이후 topic·status·primary answer type이 같은 member를 한 노드로 집계합니다.

