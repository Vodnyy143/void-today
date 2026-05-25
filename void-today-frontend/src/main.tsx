import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {BrowserRouter} from "react-router-dom";

import App from './App.tsx'
import './styles/main.scss';
import {Provider} from "react-redux";
import {store} from "./store/store.ts";

// Применяем тему до рендера React, чтобы не было вспышки
const savedTheme = localStorage.getItem('vt-theme') || 'dark';
const resolvedTheme = savedTheme === 'system'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : savedTheme;
document.documentElement.setAttribute('data-theme', resolvedTheme);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <Provider store={store}>
          <BrowserRouter>
              <App />
          </BrowserRouter>
      </Provider>
  </StrictMode>,
)
