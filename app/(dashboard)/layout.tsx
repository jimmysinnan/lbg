import Link from 'next/link'
import { type ReactNode } from 'react'

const navItems = [
  { href: '/',          label: 'Dashboard',  icon: '⬡' },
  { href: '/commandes', label: 'Commandes',  icon: '◎' },
  { href: '/catalogue', label: 'Catalogue',  icon: '▦' },
  { href: '/analytics', label: 'Analyse',    icon: '△' },
  { href: '/settings',  label: 'Paramètres', icon: '○' },
]

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--cream)' }}>

      {/* ── Sidebar desktop ───────────────────────── */}
      <aside style={{
        width: '220px',
        flexShrink: 0,
        background: 'var(--brown)',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto',
      }}
      className="hidden md:flex"
      >
        {/* Logo */}
        <div style={{
          padding: '28px 24px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{
            fontFamily: 'var(--fraunces)',
            fontSize: '20px',
            fontWeight: 800,
            fontStyle: 'italic',
            color: 'var(--cara3)',
            lineHeight: 1.2,
          }}>
            La Bonne Glace
          </div>
          <div style={{
            fontSize: '10px',
            color: 'rgba(255,255,255,0.28)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginTop: '4px',
          }}>
            Command Center
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px' }}>
          <div style={{
            fontSize: '9px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            color: 'rgba(255,255,255,0.18)',
            padding: '0 12px',
            marginBottom: '10px',
          }}>
            Navigation
          </div>
          {navItems.map(item => (
            <Link key={item.href} href={item.href} className="lbg-nav-item" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 500,
              marginBottom: '2px',
              textDecoration: 'none',
            }}>
              <span style={{ fontSize: '15px', opacity: 0.6, width: '18px', textAlign: 'center' }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: 'var(--teal2)',
            display: 'inline-block',
            animation: 'pulse-dot 2s infinite',
          }} />
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.22)' }}>
            LBG Martinique · MVP
          </span>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────── */}
      <main style={{ flex: 1, minWidth: 0, paddingBottom: '80px' }} className="md:pb-0">
        <div style={{ padding: '32px 24px', maxWidth: '1200px', margin: '0 auto' }} className="animate-fade-up">
          {children}
        </div>
      </main>

      {/* ── Bottom nav mobile ─────────────────────── */}
      <nav
        className="md:hidden"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'var(--brown)',
          display: 'flex',
          zIndex: 50,
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {navItems.map(item => (
          <Link key={item.href} href={item.href} style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px 4px',
            gap: '3px',
            textDecoration: 'none',
            color: 'rgba(255,255,255,0.45)',
            fontSize: '9px',
            fontFamily: 'var(--sans)',
            fontWeight: 600,
            letterSpacing: '0.04em',
          }}
          className="lbg-nav-item"
          >
            <span style={{ fontSize: '18px' }}>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
