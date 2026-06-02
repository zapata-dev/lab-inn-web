import { BrowserRouter } from 'react-router-dom'
import { ToastProvider } from './context/ToastContext'
import AppRoutes from './routes/AppRoutes'

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ToastProvider>
  )
}

export default App
