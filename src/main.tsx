import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initAnalytics } from './utils/analytics';
import { SpeedInsights } from '@vercel/speed-insights/react';

initAnalytics();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <SpeedInsights />
  </StrictMode>,
);
