import { createContext, useContext } from 'react';

export type Route =
  | { view: 'home' }
  | { view: 'read' | 'done' | 'quiz' | 'dict' | 'trace'; story: string };

export const NavContext = createContext<(r: Route) => void>(() => {});
export const useNav = () => useContext(NavContext);
