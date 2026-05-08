'use client'

import { Bell } from 'lucide-react'

export function Header() {
  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6">
      <div />
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg">
          <Bell className="w-5 h-5" />
        </button>
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
          <span className="text-xs font-medium text-green-700">A</span>
        </div>
      </div>
    </header>
  )
}
