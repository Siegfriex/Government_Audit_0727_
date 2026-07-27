import type { Dispatch, SetStateAction } from 'react';
import type { Location } from 'react-router';

export type DetailKind = 'evidence' | 'case';

export interface BackgroundLocationState {
  backgroundLocation?: Location;
}

export interface AppOutletContext {
  activeChapterId: string;
  setActiveChapterId: Dispatch<SetStateAction<string>>;
}
