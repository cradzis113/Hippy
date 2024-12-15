import App from './App.js'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './context/AuthContext.js'
import InfiniteScrollList from './n.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
      {/* <InfiniteScrollList /> */}
    </AuthProvider>
  </StrictMode>
)
