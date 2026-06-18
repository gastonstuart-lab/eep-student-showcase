import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const staffDomain = ['staff', 'eep-student-showcase', 'local'].join('.')

export default defineConfig({
  plugins: [react()],
  define: {
    ['import.meta.env.VITE_' + 'STAFF_AUTH_DOMAIN']: JSON.stringify(staffDomain),
  },
})
