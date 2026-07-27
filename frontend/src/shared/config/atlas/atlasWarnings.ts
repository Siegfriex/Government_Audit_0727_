export const ATLAS_PROJECTION_WARNINGS = [
  '이 지도는 의미적 위치를 2차원으로 투영한 표시용 공간입니다.',
  '2차원 거리 자체를 실제 유사도 점수로 해석하지 마십시오.',
] as const;

export const ATLAS_DATA_UNAVAILABLE_COPY = {
  eyebrow: 'DATA UNAVAILABLE / FAIL CLOSED',
  title: '승인된 Atlas 데이터가 아직 없습니다',
  description:
    'P3_FINAL 승인 manifest가 배포되기 전에는 개발용 또는 legacy 좌표를 대신 표시하지 않습니다.',
} as const;
