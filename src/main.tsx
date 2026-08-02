import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/tailwind.css';
import { TimePlannerApp } from './TimePlannerApp';

const root = ReactDOM.createRoot(document.getElementById('timeplanner-root') as HTMLElement);
root.render(
  <React.StrictMode>
    <TimePlannerApp />
  </React.StrictMode>
);
