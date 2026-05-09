import Link from 'next/link'
import { type ReactNode } from 'react'

const navItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/commandes', label: 'Commandes' },
  { href: '/catalogue', label: 'Catalogue' },
  { href: '/analytics', label: 'Analyse' },
  { href: '/settings', label: 'Paramètres' },
]

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-gray-200">
          <div className="text-sm font-bold text-gray-900">La Bonne Glace 🍦</div>
          <div className="text-xs text-gray-400 mt-0.5">Command Center</div>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-200">
          <div className="text-xs text-gray-400">MVP — La Bonne Glace MQ</div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6">
        {children}
      </main>
    </div>
  )
}
