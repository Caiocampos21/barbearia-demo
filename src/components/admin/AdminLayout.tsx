import { FlaskConical, Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { monthLabel } from '../../lib/analytics'
import Logo from '../layout/Logo'
import Sidebar from './Sidebar'

export default function AdminLayout() {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(false)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <div className="min-h-dvh bg-grain lg:pl-64">
      {/* Sidebar fixa (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-white/8 bg-ink-900/90 backdrop-blur-xl lg:block">
        <Sidebar />
      </aside>

      {/* Barra superior (celular) */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/8 bg-ink-950/90 px-4 backdrop-blur-xl lg:hidden">
        <Logo to="/painel" badge="Painel do dono" />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={open}
          className="grid size-10 place-items-center rounded-full text-ink-100 hover:bg-white/5"
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 top-16 z-30 lg:hidden">
          <button type="button" aria-label="Fechar menu" className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="animate-slide-in relative h-full w-72 max-w-[85%] border-r border-white/8 bg-ink-900">
            <Sidebar onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-2 text-xs text-ink-400">
          <span className="flex items-center gap-1.5 rounded-pill border border-gold-500/30 bg-gold-500/10 px-3 py-1 text-gold-300">
            <FlaskConical className="size-3.5" aria-hidden />
            Modo demonstração · dados fictícios
          </span>
          <span className="font-medium text-ink-300">{monthLabel(new Date())}</span>
        </div>
        <main key={pathname} className="animate-page-in">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
