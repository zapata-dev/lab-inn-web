import { Navigate, Route, Routes } from 'react-router-dom'
import Home from '../pages/Home'
import Inventario from '../pages/Inventario'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/inventario" element={<Inventario />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRoutes
