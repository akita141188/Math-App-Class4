import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import './styles.css';
import './features.css';
import './product.css';
import './redesign.css';
import './ui-v6.css';
import './ui-v7.css';
import './ui-v8.css';
import './ui-v9.css';
import './ui-v10.css';
import './ui-v10-3.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
