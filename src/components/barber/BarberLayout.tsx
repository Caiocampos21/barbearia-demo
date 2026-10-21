import { CalendarCheck, CalendarDays, FlaskConical, Users, Wallet } from 'lucide-react'
import { Suspense, useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useBarber } from '../../hooks/useBarber'
import { usePageTitle } from '../../hooks/usePageTitle'
import BarberAvatar from '../admin/BarberAvatar'
import PanelSkeleton from '../admin/PanelSkeleton'
import Logo from '../layout/Logo'
import ResetDemo from '../ui/ResetDemo'
import BarberPicker from './BarberPicker'

const tabs = [
  { to: '/equipe', label: 'Hoje', icon: CalendarCheck, end: true },
  { to: '/equipe/semana', label: 'Semana', icon: CalendarDays, end: false },
  { to: '/equipe/ganhos', label: 'Ganhos', icon: Wallet, end: false },
  { to: '/equipe/clientes', label: 'Clientes', icon: Users, end: false },
]

export default function BarberLayout() {
  const { pathname } = useLocation()
  const { barber, select, clear } = useBarber()
  usePageTitle('Área do barbeiro')

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  if (!barber) return <BarberPicker onSelect={select} />

  return (
    <div className="min-h-dvh bg-grain pb-24 md:pb-10">
      <header className="sticky top-0 z-40 border-b border-white/8 bg-ink-950/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
          <Logo to="/equipe" badge="Área do barbeiro" />

          <nav aria-label="Seções" className="hidden items-center gap-1 md:flex">
            {tabs.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex h-10 items-center gap-2 rounded-pill px-4 text-sm font-semibold transition-colors ${isActive ? 'bg-gold-500/15 text-gold-300' : 'text-ink-300 hover:bg-white/5 hover:text-ink-100'}`
                }
              >
                <Icon className="size-4" aria-hidden /> {label}
              </NavLink>
            ))}
          </nav>

          <button
            type="button"
            onClick={clear}
            aria-label={`Sair (${barber.name}). Trocar de barbeiro`}
            className="flex h-10 items-center gap-2 rounded-pill border border-white/12 pl-1.5 pr-3 text-sm text-ink-200 transition-colors hover:border-gold-500/50 hover:text-gold-300"
          >
            <BarberAvatar initials={barber.initials} gradient={barber.gradient} size="sm" />
            <span className="max-w-24 truncate font-semibold">{barber.name.split(' ')[0]}</span>
            <span className="hidden text-xs text-ink-400 sm:inline">Trocar</span>
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="flex items-center gap-1.5 rounded-pill border border-gold-500/30 bg-gold-500/10 px-3 py-1 text-gold-300">
            <FlaskConical className="size-3.5" aria-hidden />
            Modo demonstração · dados fictícios
          </span>
          <ResetDemo className="flex h-8 items-center gap-1.5 rounded-pill border border-white/12 px-3 font-semibold text-ink-200 transition-colors hover:border-gold-500/50 hover:text-gold-300" />
        </div>
        <main key={pathname} className="animate-page-in">
          <Suspense fallback={<PanelSkeleton />}>
            <Outlet context={{ barber }} />
          </Suspense>
        </main>
      </div>

      {/* Menu fixo embaixo no celular: o barbeiro usa com uma mão, entre um cliente e outro */}
      <nav aria-label="Seções" className="fixed inset-x-0 bottom-0 z-40 border-t border-white/8 bg-ink-950/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
        <ul className="grid grid-cols-4">
          {tabs.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) => `flex flex-col items-center gap-1 py-2.5 text-[0.7rem] font-semibold transition-colors ${isActive ? 'text-gold-300' : 'text-ink-400'}`}
              >
                <Icon className="size-5" aria-hidden />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
