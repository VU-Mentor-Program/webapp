import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { SplashProvider } from './contexts/SplashContext.tsx';

const root = createRoot(document.getElementById('root')!);
root.render(
  <StrictMode>
    <SplashProvider>
      <App />
    </SplashProvider>
  </StrictMode>
);

const removeSplash = () => {
  const splash = document.getElementById('splash');
  if (splash) {
    splash.classList.add('hidden');
    setTimeout(() => {
      splash.remove();
      window.dispatchEvent(new Event('splashRemoved'));
    }, 500);
  }
};

if (document.readyState === 'complete') {
  removeSplash();
} else {
  window.addEventListener('load', removeSplash);
}
