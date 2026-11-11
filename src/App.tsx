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
import { Contact } from './screens/Contact';
import { Sentence } from './screens/Sentence';
import { Admin } from './screens/Admin';
import { Parent } from './screens/Parent';
import { contentStore, previewActive } from './lib/contentStore';

// Routes live in the URL hash (#read-star, #quiz-all …) so the back button and shared links work.
// Story ids are checked when the hash is read, so stories added by a content pack work too.
const hasStory = (id: string) => id === 'all' || STORIES.some((s) => s.id === id);

function parse(hash: string): Route {
  const h = hash.replace(/^#/, '');
  if (h === 'study' || h === 'words' || h === 'progress') return { view: 'home', tab: h };
  if (h === 'contact') return { view: 'contact' };
  if (h === 'admin') return { view: 'admin' };
  if (h === 'parent') return { view: 'parent' };
  const m = hash.replace(/^#/, '').match(/^(read|done|quiz|dict|trace|sent)-([a-z]+)$/);
  if (!m || !hasStory(m[2])) return { view: 'home' };
  if ((m[1] === 'read' || m[1] === 'done') && m[2] === 'all') return { view: 'home' };
  return { view: m[1] as Exclude<Route['view'], 'home'>, story: m[2] };
}
const toHash = (r: Route) =>
  r.view === 'home' ? (r.tab && r.tab !== 'books' ? `#${r.tab}` : '') : r.view === 'contact' ? '#contact' : r.view === 'admin' ? '#admin' : r.view === 'parent' ? '#parent' : `#${r.view}-${r.story}`;

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

  const nav = useCallback((r: Route, opts?: { replace?: boolean }) => {
    const h = toHash(r);
    if (h === location.hash) {
      setNonce((n) => n + 1);
    } else if (opts?.replace) {
      history.replaceState(null, '', location.pathname + location.search + h);
      setRoute(r);
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
    case 'contact': screen = <Contact />; break;
    case 'admin': screen = <Admin />; break;
    case 'parent': screen = <Parent />; break;
    case 'sent': screen = <Sentence storyId={route.story} />; break;
    default: screen = <Home tab={route.tab ?? 'books'} />;
  }

  return (
    <NavContext.Provider value={nav}>
      {previewActive() && route.view !== 'admin' && (
        <div className="preview-bar" role="status">
          <span>미리 보기 중 · 이 기기에서만 보여요</span>
          <button onClick={() => { location.hash = '#admin'; }}>관리 화면</button>
          <button onClick={() => { contentStore.stopPreview(); location.hash = ''; location.reload(); }}>끝내기</button>
        </div>
      )}
      <main className={`wrap v-${route.view}${route.view === 'admin' ? ' wide' : ''}`} key={`${toHash(route)}:${nonce}`}>
        {screen}
      </main>
    </NavContext.Provider>
  );
}
