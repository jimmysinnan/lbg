import Link from 'next/link'
import { type ReactNode } from 'react'

const navItems = [
  { href: '/',           label: 'Dashboard',    icon: '◈' },
  { href: '/commandes',  label: 'Commandes',    icon: '◉' },
  { href: '/catalogue',  label: 'Catalogue',    icon: '◫' },
  { href: '/analytics',  label: 'Analyse',      icon: '◬' },
  { href: '/settings',   label: 'Paramètres',   icon: '◌' },
]

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen md:h-screen md:overflow-hidden flex-col md:flex-row" style={{ background: 'var(--cream)' }}>

      {/* ── Sidebar ───────────────────────────────── */}
      <aside
        className="w-full md:w-52 flex flex-row md:flex-col shrink-0 overflow-x-auto md:overflow-hidden"
        style={{
          background: 'var(--brown)',
          boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
        }}
      >
        {/* Logo */}
        <div className="px-5 py-4 border-b md:border-b border-r md:border-r-0 shrink-0" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <div
            className="text-xl leading-tight"
            style={{ fontFamily: 'var(--fraunces)', fontStyle: 'italic', fontWeight: 700, color: 'var(--cara3)' }}
          >
            La Bonne Glace
          </div>
          <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.32)', letterSpacing: '0.05em' }}>
            Command Center
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 flex flex-row md:flex-col px-3 py-2 md:py-4 gap-0.5 md:space-y-0.5 overflow-x-auto">
          <div
            className="text-xs font-semibold mb-3 px-2 hidden md:block"
            style={{ color: 'rgba(255,255,255,0.22)', letterSpacing: '0.1em', textTransform: 'uppercase' }}
          >
            Navigation
          </div>
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="lbg-nav-item flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150"
            >
              <span style={{ fontSize: '16px', opacity: 0.7 }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Footer sidebar */}
        <div className="px-5 py-4 border-t shrink-0 hidden md:block" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: 'var(--teal2)', animation: 'pulse-dot 2s infinite' }}
            />
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>MVP · LBG Martinique</span>
          </div>
        </div>
      </aside>

      {/* ── Main ──────────────────────────────────── */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-6xl mx-auto animate-fade-up">
          {children}
        </div>
      </main>
    </div>
  )
}
