// The entry point: index.html loads this file, and it mounts the React app
// (App.jsx) into the <div id="root"> on the page.

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
