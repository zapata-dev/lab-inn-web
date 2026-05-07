import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '../components/layout'
import { useAuth } from '../context/AuthContext'
import CapacitacionSoporte from '../pages/CapacitacionSoporte'
import HerramientasComerciales from '../pages/HerramientasComerciales'
import Inicio from '../pages/Inicio'
import InventarioNacional from '../pages/InventarioNacional'
import Login from '../pages/Login'
import Perfil from '../pages/Perfil'
import Salesforce from '../pages/Salesforce'
import ProtectedRoute from './ProtectedRoute'

function AppRoutes() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/inicio" element={<Inicio />} />
          <Route path="/inventario" element={<InventarioNacional />} />
          <Route path="/herramientas" element={<HerramientasComerciales />} />
          <Route path="/capacitacion" element={<CapacitacionSoporte />} />
          <Route path="/salesforce" element={<Salesforce />} />
          <Route path="/perfil" element={<Perfil />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to={isAuthenticated ? '/inicio' : '/login'} replace />} />
    </Routes>
  )
}

export default AppRoutes
