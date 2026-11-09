import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import { App } from './App';
import { ProgressProvider } from './lib/progress';
import { applyPack } from './content/pack';
import { contentStore, setPublishedPack } from './lib/contentStore';
import './styles.css';

registerSW({ immediate: true });

async function boot() {
  // Published content pack first, then this device's preview (from the admin screen) on top.
  const published = await contentStore.loadPublished();
  setPublishedPack(published);
  const preview = contentStore.loadPreview();
  applyPack(preview ?? published);

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ProgressProvider>
        <App />
      </ProgressProvider>
    </StrictMode>,
  );
}
boot();
