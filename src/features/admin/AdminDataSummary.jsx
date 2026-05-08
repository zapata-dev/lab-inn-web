import {
  Building2,
  FileText,
  HelpCircle,
  Headphones,
  ShoppingCart,
  TrendingUp,
  Truck,
  UserPlus,
  Users,
  Video,
} from 'lucide-react'
import { Card } from '../../components/common'

const KPI_CONFIG = [
  { key: 'usuarios', label: 'Usuarios', icon: Users },
  { key: 'sucursales', label: 'Sucursales', icon: Building2 },
  { key: 'inventario', label: 'Inventario', icon: Truck },
  { key: 'leads', label: 'Leads', icon: UserPlus },
  { key: 'oportunidades', label: 'Oportunidades', icon: TrendingUp },
  { key: 'pedidos', label: 'Pedidos', icon: ShoppingCart },
  { key: 'facturas', label: 'Facturas', icon: FileText },
  { key: 'videos', label: 'Videos', icon: Video },
  { key: 'tickets', label: 'Tickets Soporte', icon: Headphones },
  { key: 'faqs', label: 'FAQs', icon: HelpCircle },
]

function AdminDataSummary({ counts }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
      {KPI_CONFIG.map(({ key, label, icon: Icon }) => (
        <Card key={key} className="flex flex-col items-center gap-1 py-4 text-center">
          <Icon className="size-5 text-lab-primary" aria-hidden="true" />
          <p className="text-2xl font-bold text-lab-text">{counts[key] ?? 0}</p>
          <p className="text-xs text-lab-muted">{label}</p>
        </Card>
      ))}
    </div>
  )
}

export default AdminDataSummary
