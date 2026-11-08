import { useCallback, useEffect, useState } from 'react';
import { NavContext, type Route } from './nav';
import { STORIES } from './content';
import { stopSpeaking } from './lib/speech';
import { Home } from './screens/Home';
import { Reader } from './screens/Reader';
import { Done } from './screens/Done';
import { Quiz } from './screens/Quiz';
import { Dictation } from './screens/Dictation';
import { Trace } from './screens/Trace';

// Routes live in the URL hash (#read-star, #quiz-all …) so the back button and shared links work.
const STORY_IDS = new Set(['all', ...STORIES.map((s) => s.id)]);

function parse(hash: string): Route {
  const m = hash.replace(/^#/, '').match(/^(read|done|quiz|dict|trace)-([a-z]+)$/);
  if (!m || !STORY_IDS.has(m[2])) return { view: 'home' };
  if ((m[1] === 'read' || m[1] === 'done') && m[2] === 'all') return { view: 'home' };
  return { view: m[1] as Exclude<Route['view'], 'home'>, story: m[2] };
}
const toHash = (r: Route) => (r.view === 'home' ? '' : `#${r.view}-${r.story}`);

export function App() {
  const [route, setRoute] = useState<Route>(() => parse(location.hash));
  const [nonce, setNonce] = useState(0); // remounts the screen when navigating to the same route

  useEffect(() => {
    const onHash = () => setRoute(parse(location.hash));
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    stopSpeaking();
    window.scrollTo(0, 0);
  }, [route, nonce]);

  const nav = useCallback((r: Route) => {
    const h = toHash(r);
    if (h === location.hash) {
      setNonce((n) => n + 1);
    } else if (h === '') {
      history.pushState(null, '', location.pathname + location.search);
      setRoute(r);
    } else {
      location.hash = h; // triggers hashchange → setRoute
    }
  }, []);

  let screen;
  switch (route.view) {
    case 'read': screen = <Reader storyId={route.story} />; break;
    case 'done': screen = <Done storyId={route.story} />; break;
    case 'quiz': screen = <Quiz storyId={route.story} />; break;
    case 'dict': screen = <Dictation storyId={route.story} />; break;
    case 'trace': screen = <Trace storyId={route.story} />; break;
    default: screen = <Home />;
  }

  return (
    <NavContext.Provider value={nav}>
      <main className="wrap" key={`${toHash(route)}:${nonce}`}>
        {screen}
      </main>
    </NavContext.Provider>
  );
}
