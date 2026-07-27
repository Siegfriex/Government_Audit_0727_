import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router';

export function useDetailNavigation() {
  const location = useLocation();
  const navigate = useNavigate();

  const openEvidence = useCallback(
    (id: string) => navigate(`/evidence/${id}`, { state: { backgroundLocation: location } }),
    [location, navigate],
  );
  const openCase = useCallback(
    (id: string) => navigate(`/case/${id}`, { state: { backgroundLocation: location } }),
    [location, navigate],
  );

  return { openEvidence, openCase };
}
