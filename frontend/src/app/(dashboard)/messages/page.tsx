'use client'

import { MessageSquare } from 'lucide-react'

export default function MessagesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mensagens</h1>
      <div className="bg-white rounded-xl border p-8 text-center text-gray-500">
        <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p>Selecione uma empresa e token para visualizar as mensagens</p>
      </div>
    </div>
  )
}
