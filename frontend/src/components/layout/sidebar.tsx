'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Building2,
  Wifi,
  MessageSquare,
  Key,
  CreditCard,
  LogOut,
} from 'lucide-react'
import { removeToken } from '@/lib/auth'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/companies', label: 'Empresas', icon: Building2 },
  { href: '/whatsapp', label: 'WhatsApp', icon: Wifi },
  { href: '/messages', label: 'Mensagens', icon: MessageSquare },
  { href: '/tokens', label: 'Tokens', icon: Key },
  { href: '/payments', label: 'Pagamentos', icon: CreditCard },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  function logout() {
    removeToken()
    router.push('/login')
  }

  return (
    <aside className="w-64 bg-white border-r flex flex-col">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-green-700">ZapZap</h1>
        <p className="text-xs text-gray-500 mt-0.5">WhatsApp API</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
              pathname === href
                ? 'bg-green-50 text-green-700 font-medium'
                : 'text-gray-600 hover:bg-gray-50'
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 w-full transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </aside>
  )
}
