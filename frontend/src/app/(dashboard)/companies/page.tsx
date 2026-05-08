'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { Plus } from 'lucide-react'

interface Company {
  id: string
  name: string
  document: string
  email: string
  status: string
  creditBalance: number
  dailyLimit: number
  createdAt: string
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Ativa',
  BLOCKED: 'Bloqueada',
  CANCELLED: 'Cancelada',
  DEFAULTING: 'Inadimplente',
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  BLOCKED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-100 text-gray-700',
  DEFAULTING: 'bg-orange-100 text-orange-700',
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/companies')
      .then(({ data }) => setCompanies(data.data))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Empresas</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          <Plus className="w-4 h-4" />
          Nova Empresa
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Carregando...</p>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Empresa</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Créditos</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Limite Diário</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {companies.map((company) => (
                <tr key={company.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{company.name}</p>
                      <p className="text-sm text-gray-500">{company.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[company.status]}`}
                    >
                      {STATUS_LABELS[company.status] ?? company.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{company.creditBalance.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-700">{company.dailyLimit.toLocaleString()}/dia</td>
                  <td className="px-4 py-3">
                    <button className="text-sm text-green-600 hover:underline">Gerenciar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {companies.length === 0 && (
            <div className="py-12 text-center text-gray-400">Nenhuma empresa cadastrada</div>
          )}
        </div>
      )}
    </div>
  )
}
