'use client'

import { CreditCard } from 'lucide-react'

export default function PaymentsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Pagamentos</h1>
      <div className="bg-white rounded-xl border p-8 text-center text-gray-500">
        <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p>Histórico de pagamentos e cobranças via Asaas</p>
      </div>
    </div>
  )
}
