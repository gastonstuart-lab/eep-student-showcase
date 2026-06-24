import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { IedEntryPage } from './components/public/IedEntryPage'
import './admin-layout-fix.css'
import './workspace.css'

function RootExperience() {
  const [entered, setEntered] = useState(window.location.pathname !== '/')

  if (!entered) {
    return <IedEntryPage onComplete={() => setEntered(true)} />
  }

  return <App />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootExperience />
  </StrictMode>,
)
