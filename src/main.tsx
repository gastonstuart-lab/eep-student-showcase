import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { IedIntroGate } from './components/public/IedIntroGate'
import App from './App.tsx'
import './index.css'
import './admin-layout-fix.css'
import './workspace.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <IedIntroGate>
      <App />
    </IedIntroGate>
  </StrictMode>,
)
