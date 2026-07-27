import { useLocation } from 'react-router';

export function SkipLinks() {
  const { pathname } = useLocation();
  const isAtlas = pathname === '/atlas';
  const isProjectionLab = pathname === '/method/projection';

  return (
    <nav className="skip-links" aria-label="빠른 건너뛰기">
      <a href="#main-content">본문으로 건너뛰기</a>
      {isAtlas ? <a href="#atlas-controls">Atlas controls로 건너뛰기</a> : null}
      {isAtlas ? <a href="#atlas-node-list">Atlas node 목록으로 건너뛰기</a> : null}
      {isAtlas ? <a href="#atlas-selection-inspector">선택된 node 정보로 건너뛰기</a> : null}
      {isProjectionLab ? <a href="#projection-method-panel">Projection view로 건너뛰기</a> : null}
    </nav>
  );
}
