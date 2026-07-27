import { useEffect } from 'react';
import { useLocation } from 'react-router';

const PRODUCT_NAME = '문체위 국정감사 6년';

function routeIdentifier(pathname: string): string {
  const value = pathname.split('/').filter(Boolean).at(-1) ?? '';
  try {
    return decodeURIComponent(value).toUpperCase();
  } catch {
    return value.toUpperCase();
  }
}

function routeTitle(pathname: string): string {
  if (pathname === '/') return `에세이 | ${PRODUCT_NAME}`;
  if (pathname === '/atlas') return `답변행태 지도 | ${PRODUCT_NAME}`;
  if (pathname === '/method/projection') return `Projection Method Lab | ${PRODUCT_NAME}`;
  if (pathname === '/method') return `분석 방법론 | ${PRODUCT_NAME}`;
  if (pathname === '/data') return `데이터 계약 | ${PRODUCT_NAME}`;
  if (pathname === '/about') return `프로젝트 소개 | ${PRODUCT_NAME}`;
  if (pathname.startsWith('/evidence/')) return `증거 ${routeIdentifier(pathname)} | ${PRODUCT_NAME}`;
  if (pathname.startsWith('/case/')) return `대표 사례 ${routeIdentifier(pathname)} | ${PRODUCT_NAME}`;
  if (pathname === '/dev/foundations') return `Foundation Gallery | ${PRODUCT_NAME}`;
  return `기록을 찾을 수 없음 | ${PRODUCT_NAME}`;
}

export function RouteAccessibility() {
  const { pathname } = useLocation();

  useEffect(() => {
    document.title = routeTitle(pathname);
  }, [pathname]);

  return null;
}
