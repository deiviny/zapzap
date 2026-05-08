'use client'

import { QrCode, Plus } from 'lucide-react'

export default function WhatsAppPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sessões WhatsApp</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          <Plus className="w-4 h-4" />
          Nova Sessão
        </button>
      </div>

      <div className="bg-white rounded-xl border p-8 text-center text-gray-500">
        <QrCode className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p>Selecione uma empresa para ver e gerenciar as sessões WhatsApp</p>
      </div>
    </div>
  )
}
