'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { StatsCard } from '@/components/dashboard/stats-card'
import { MessageSquare, Building2, Wifi, AlertCircle, Ban, Inbox } from 'lucide-react'

interface Stats {
  totalCompanies: number
  activeCompanies: number
  sentToday: number
  errorToday: number
  blockedToday: number
  receivedToday: number
  connectedSessions: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/dashboard')
      .then(({ data }) => {
        setStats(data)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-gray-500">Carregando...</div>
  if (!stats) return null

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatsCard
          title="Mensagens Enviadas Hoje"
          value={stats.sentToday}
          icon={<MessageSquare className="w-5 h-5" />}
          color="green"
        />
        <StatsCard
          title="Mensagens Recebidas"
          value={stats.receivedToday}
          icon={<Inbox className="w-5 h-5" />}
          color="blue"
        />
        <StatsCard
          title="Erros Hoje"
          value={stats.errorToday}
          icon={<AlertCircle className="w-5 h-5" />}
          color="red"
        />
        <StatsCard
          title="Bloqueadas (sem crédito)"
          value={stats.blockedToday}
          icon={<Ban className="w-5 h-5" />}
          color="orange"
        />
        <StatsCard
          title="Empresas Ativas"
          value={stats.activeCompanies}
          icon={<Building2 className="w-5 h-5" />}
          color="purple"
        />
        <StatsCard
          title="Sessões Conectadas"
          value={stats.connectedSessions}
          icon={<Wifi className="w-5 h-5" />}
          color="green"
        />
      </div>
    </div>
  )
}
