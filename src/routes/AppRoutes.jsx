import { Navigate, Route, Routes } from 'react-router-dom'
import CatalogoPortadas from '../pages/CatalogoPortadas'
import CanalYoutube from '../pages/CanalYoutube'
import { AuthProvider } from '../context/AuthContext'
import Home from '../pages/Home'
import Inventario from '../pages/Inventario'
import Login from '../pages/Login'
import Perfil from '../pages/Perfil'
import Promociones from '../pages/Promociones'
import SoporteUsuarios from '../pages/SoporteUsuarios'
import Unauthorized from '../pages/Unauthorized'
import Usuarios from '../pages/Usuarios'
import ProtectedRoute from './ProtectedRoute'

function AppRoutes() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/catalogo-portadas" element={<CatalogoPortadas />} />
          <Route path="/inventario" element={<Inventario />} />
          <Route path="/promociones" element={<Promociones />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/youtube" element={<CanalYoutube />} />
          <Route path="/canal-youtube" element={<Navigate to="/youtube" replace />} />
          <Route path="/usuarios" element={<Usuarios />} />
          <Route path="/soporte/usuarios" element={<SoporteUsuarios />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default AppRoutes
