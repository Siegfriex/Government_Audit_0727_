import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router';

export function AppScrollRestoration() {
  const location = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (location.hash || navigationType === 'POP') return;
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.hash, location.pathname, navigationType]);

  return null;
}
