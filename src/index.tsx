import React from 'react';
import ReactDOM from 'react-dom/client';
import './app/globals.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Polyfills for simple-peer (Node.js globals in browser)
import { Buffer } from 'buffer';
(window as any).global = window;
(window as any).Buffer = Buffer;
(window as any).process = {
  env: { DEBUG: undefined },
  nextTick: (fn: Function, ...args: any[]) => {
    if (typeof queueMicrotask === 'function') {
      queueMicrotask(() => fn(...args));
    } else {
      setTimeout(() => fn(...args), 0);
    }
  },
  browser: true,
  version: '',
  on: () => {}
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
