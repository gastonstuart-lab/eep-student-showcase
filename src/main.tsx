import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { IedIntroGate } from './components/public/IedIntroGate'
import App from './App.tsx'
import './index.css'
import './admin-layout-fix.css'
import './workspace.css'

const rootElement = document.getElementById('root')!
const isHomepage = window.location.pathname === '/'

createRoot(rootElement).render(
  <StrictMode>
    {isHomepage ? (
      <IedIntroGate>
        <App />
      </IedIntroGate>
    ) : (
      <App />
    )}
  </StrictMode>,
)
