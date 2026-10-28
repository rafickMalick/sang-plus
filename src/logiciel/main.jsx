import React from 'react'
import { createRoot } from 'react-dom/client'
import Logiciel from './Logiciel.jsx'
import './logiciel.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Logiciel />
  </React.StrictMode>
)
