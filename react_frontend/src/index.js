import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
// Import config to trigger boot-time logging of resolved API base URL
import './config';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
