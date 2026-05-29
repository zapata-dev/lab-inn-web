import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { DemoProvider } from './context/DemoContext'
import { ToastProvider } from './context/ToastContext'
import AppRoutes from './routes/AppRoutes'

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <DemoProvider>
            <AppRoutes />
          </DemoProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}

export default App
