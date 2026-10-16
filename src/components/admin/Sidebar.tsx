import { CalendarDays, ExternalLink, LayoutDashboard, Package, Scissors, UserRound, Wallet } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import Logo from '../layout/Logo'

export const adminNav = [
  { to: '/painel', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/painel/agenda', label: 'Agenda', icon: CalendarDays },
  { to: '/painel/financeiro', label: 'Financeiro', icon: Wallet },
  { to: '/painel/barbeiros', label: 'Barbeiros', icon: Scissors },
  { to: '/painel/clientes', label: 'Clientes', icon: UserRound },
  { to: '/painel/estoque', label: 'Estoque', icon: Package },
]

/** Conteúdo da sidebar (reaproveitado no desktop e no drawer do celular). */
export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pb-6 pt-6">
        <Logo to="/painel" badge="Painel do dono" />
      </div>

      <nav aria-label="Painel" className="flex-1 space-y-1 px-3">
        {adminNav.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                isActive ? 'bg-gold-500/12 text-gold-300' : 'text-ink-300 hover:bg-white/5 hover:text-ink-100'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`absolute inset-y-2 left-0 w-0.5 rounded-full bg-gold-500 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0'}`} />
                <Icon className="size-5" aria-hidden />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-3 border-t border-white/8 p-4">
        <NavLink to="/" onClick={onNavigate} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-ink-300 hover:bg-white/5 hover:text-gold-300">
          <ExternalLink className="size-4" aria-hidden />
          Ver site do cliente
        </NavLink>
        <div className="flex items-center gap-3 rounded-xl bg-ink-800 p-3">
          <span className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-gold-500 to-leather-600 font-display font-bold text-ink-950">RM</span>
          <span className="min-w-0 text-sm leading-tight">
            <strong className="block truncate text-ink-100">Rafael Mendes</strong>
            <span className="text-xs text-ink-400">Proprietário</span>
          </span>
        </div>
      </div>
    </div>
  )
}
