import App from './App.js'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import InfiniteScrollList from './n.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <App />
      {/* <InfiniteScrollList /> */}
  </StrictMode>
)
