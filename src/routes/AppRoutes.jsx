import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import Home from '../pages/Home'
import Inventario from '../pages/Inventario'
import Login from '../pages/Login'
import Promociones from '../pages/Promociones'
import SoporteUsuarios from '../pages/SoporteUsuarios'
import Unauthorized from '../pages/Unauthorized'
import ProtectedRoute from './ProtectedRoute'

function AppRoutes() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/inventario" element={<Inventario />} />
          <Route path="/promociones" element={<Promociones />} />
          <Route path="/soporte/usuarios" element={<SoporteUsuarios />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default AppRoutes
