import { useEffect, useMemo, useState } from 'react'
import { Clock3, Handshake, UserRoundCheck } from 'lucide-react'
import { Card } from '../../components/common'
import { useAuth } from '../../context/AuthContext'
import { dataService } from '../../services/dataService'
import { formatNumber } from '../../utils/formatters'
import MetricCard from './components/MetricCard'

const STUB_CONFIG = {
  lab: {
    title: 'Vista BDC Lab',
    description: 'Monitoreo de calificacion centralizada y traspaso a ventas.',
    responseMinutes: 16,
  },
  sucursal: {
    title: 'Vista BDC Sucursal',
    description: 'Seguimiento operativo de leads en la sucursal asignada.',
    responseMinutes: 24,
  },
}

function BdcDashboardStub({ variant = 'lab' }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [leads, setLeads] = useState([])
  const [opportunities, setOpportunities] = useState([])

  useEffect(() => {
    let isActive = true

    const loadData = async () => {
      try {
        setLoading(true)
        const [loadedLeads, loadedOpportunities] = await Promise.all([
          dataService.getLeads(),
          dataService.getOpportunities(),
        ])

        if (!isActive) return

        setLeads(loadedLeads)
        setOpportunities(loadedOpportunities)
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    loadData()

    return () => {
      isActive = false
    }
  }, [])

  const config = STUB_CONFIG[variant] ?? STUB_CONFIG.lab

  const computed = useMemo(() => {
    const scopedLeads =
      variant === 'sucursal'
        ? leads.filter((lead) => lead.branchId === user?.branchId)
        : leads

    const leadsToQualify = scopedLeads.filter((lead) =>
      ['nuevo', 'contactado'].includes(lead.stage)
    ).length

    const transfersToSales =
      variant === 'sucursal'
        ? opportunities.filter((opportunity) => opportunity.branchId === user?.branchId).length
        : opportunities.length

    return {
      leadsToQualify,
      transfersToSales,
    }
  }, [leads, opportunities, user, variant])

  return (
    <section className="mx-auto w-full max-w-6xl space-y-6">
      <Card className="space-y-2">
        <h2 className="text-2xl font-bold text-lab-text">{config.title}</h2>
        <p className="text-sm text-lab-muted">{config.description}</p>
      </Card>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title="Leads por calificar"
          value={loading ? '...' : formatNumber(computed.leadsToQualify)}
          description="Leads en nuevo/contactado"
          icon={UserRoundCheck}
          tone="warning"
        />
        <MetricCard
          title="Tiempo prom. respuesta"
          value={`${config.responseMinutes} min`}
          description="Promedio operativo de atencion"
          icon={Clock3}
          tone="info"
        />
        <MetricCard
          title="Transferencias a ventas"
          value={loading ? '...' : formatNumber(computed.transfersToSales)}
          description="Escalamientos a equipo comercial"
          icon={Handshake}
          tone="success"
        />
      </section>

      <Card>
        <p className="text-sm text-lab-muted">Vista BDC inicial, se enriquecera en Sprint 4/5.</p>
      </Card>
    </section>
  )
}

export default BdcDashboardStub
