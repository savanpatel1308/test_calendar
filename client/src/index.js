import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // ✅ This is what it's loading
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
