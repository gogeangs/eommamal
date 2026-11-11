import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import { App } from './App';
import { ProgressProvider } from './lib/progress';
import { PlanProvider } from './lib/plan';
import { AccountProvider } from './lib/account';
import { applyPack } from './content/pack';
import { contentStore, setPublishedPack } from './lib/contentStore';
import './styles.css';

registerSW({ immediate: true });

/** Fade out the launch splash (index.html) once the app has drawn — kept on screen at least ~1.2s. */
function hideSplash() {
  const el = document.getElementById('splash');
  if (!el) return;
  const wait = Math.max(0, 1200 - performance.now());
  window.setTimeout(() => {
    el.classList.add('out');
    window.setTimeout(() => el.remove(), 500);
  }, wait);
}

async function boot() {
  // Published content pack first, then this device's preview (from the admin screen) on top.
  const published = await contentStore.loadPublished();
  setPublishedPack(published);
  const preview = contentStore.loadPreview();
  applyPack(preview ?? published);

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ProgressProvider>
        <PlanProvider>
          <AccountProvider>
            <App />
          </AccountProvider>
        </PlanProvider>
      </ProgressProvider>
    </StrictMode>,
  );
  hideSplash();
}
// Never leave the splash up if start-up fails.
boot().finally(hideSplash);
