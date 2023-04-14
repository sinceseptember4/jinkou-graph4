import React from 'react';
import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import { App } from '../src/App';

const container = document.getElementById('root');
if (container !== null ) {
    const root = createRoot(container);
    root.render(<App />);
}