import { createContext, useContext } from 'react';

export type HomeTab = 'books' | 'study' | 'words';
export type Route =
  | { view: 'home'; tab?: HomeTab }
  | { view: 'contact' }
  | { view: 'read' | 'done' | 'quiz' | 'dict' | 'trace' | 'sent'; story: string };

/** replace: swap the current history entry, so the back button skips the screen being left. */
export type Nav = (r: Route, opts?: { replace?: boolean }) => void;
export const NavContext = createContext<Nav>(() => {});
export const useNav = () => useContext(NavContext);
