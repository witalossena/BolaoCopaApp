import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import './index.css';
import App from './App';

registerSW({
  onRegisteredSW(swUrl, r) {
    // Checar atualização a cada 60s quando app está em foreground
    setInterval(async () => {
      if (!(!r || !navigator.onLine)) {
        try { await r.update(); } catch {}
      }
    }, 60 * 1000);
  },
  onNeedRefresh() {},
  onOfflineReady() {},
});

// Quando SW novo assume controle, recarregar para garantir versão nova
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload();
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
