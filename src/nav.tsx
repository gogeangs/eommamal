import { createContext, useContext } from 'react';

export type HomeTab = 'books' | 'study' | 'words';
export type Route =
  | { view: 'home'; tab?: HomeTab }
  | { view: 'contact' }
  | { view: 'read' | 'done' | 'quiz' | 'dict' | 'trace'; story: string };

export const NavContext = createContext<(r: Route) => void>(() => {});
export const useNav = () => useContext(NavContext);
