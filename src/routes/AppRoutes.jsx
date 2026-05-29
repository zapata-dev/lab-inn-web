import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import Inicio from '../pages/Inicio'
import Inventario from '../pages/Inventario'
import HerramientasComerciales from '../pages/HerramientasComerciales'
import CapacitacionSoporte from '../pages/CapacitacionSoporte'
import Salesforce from '../pages/Salesforce'
import Perfil from '../pages/Perfil'
import Login from '../pages/Login'
import Promociones from '../pages/Promociones'
import SoporteNotificationAttempts from '../pages/SoporteNotificationAttempts'
import SoporteNotificaciones from '../pages/SoporteNotificaciones'
import SoporteInventoryImports from '../pages/SoporteInventoryImports'
import Solicitudes from '../pages/Solicitudes'
import Unauthorized from '../pages/Unauthorized'
import ProtectedRoute from './ProtectedRoute'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/inicio" replace />} />
          <Route path="/inicio" element={<Inicio />} />
          <Route path="/inventario" element={<Inventario />} />
          <Route path="/herramientas" element={<HerramientasComerciales />} />
          <Route path="/promociones" element={<Promociones />} />
          <Route path="/solicitudes" element={<Solicitudes />} />
          <Route path="/soporte/notificaciones" element={<SoporteNotificaciones />} />
          <Route path="/soporte/notificaciones/attempts" element={<SoporteNotificationAttempts />} />
          <Route path="/soporte/inventario/imports" element={<SoporteInventoryImports />} />
          <Route path="/capacitacion" element={<CapacitacionSoporte />} />
          <Route path="/salesforce" element={<Salesforce />} />
          <Route path="/perfil" element={<Perfil />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/inicio" replace />} />
    </Routes>
  )
}

export default AppRoutes
