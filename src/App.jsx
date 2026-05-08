import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { DemoProvider } from './context/DemoContext'
import { ToastProvider } from './context/ToastContext'
import AppRoutes from './routes/AppRoutes'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <DemoProvider>
            <AppRoutes />
          </DemoProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
