import { CalendarDays, Clock, Scissors, User, Wallet } from 'lucide-react'
import { barbers, services } from '../../data/seed'
import { formatBRL, formatDuration, longDate } from '../../lib/format'

interface Props {
  serviceId?: string
  barberId?: string // id ou 'any'
  /** Barbeiro já definido (quando 'any' foi resolvido para um horário) */
  resolvedBarberId?: string
  date?: string
  time?: string
  className?: string
}

const Row = ({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string }) => (
  <li className="flex items-start gap-3 py-3">
    <span className="mt-0.5 text-gold-500">{icon}</span>
    <span className="min-w-0 flex-1">
      <span className="block text-[0.65rem] uppercase tracking-widest text-ink-400">{label}</span>
      <span className={`block text-sm ${value ? 'font-medium text-ink-100' : 'text-ink-500'}`}>{value ?? '—'}</span>
    </span>
  </li>
)

/** Resumo do agendamento (sidebar no desktop e reaproveitado na revisão). */
export default function Summary({ serviceId, barberId, resolvedBarberId, date, time, className = '' }: Props) {
  const service = services.find((s) => s.id === serviceId)
  const barber = barbers.find((b) => b.id === (resolvedBarberId ?? barberId))
  const barberLabel = barberId === 'any' && !resolvedBarberId ? 'Sem preferência' : barber?.name

  return (
    <aside className={`rounded-card border border-white/10 bg-ink-900 p-5 shadow-card ${className}`} aria-label="Resumo do agendamento">
      <h2 className="font-display text-xl font-semibold">Seu agendamento</h2>
      <ul className="mt-2 divide-y divide-white/8">
        <Row icon={<Scissors className="size-4" />} label="Serviço" value={service?.name} />
        <Row icon={<User className="size-4" />} label="Barbeiro" value={barberLabel} />
        <Row icon={<CalendarDays className="size-4" />} label="Data" value={date ? longDate(date) : undefined} />
        <Row icon={<Clock className="size-4" />} label="Horário" value={time && service ? `${time} · ${formatDuration(service.duration)}` : undefined} />
      </ul>
      <div className="mt-2 flex items-center justify-between border-t border-gold-500/30 pt-4">
        <span className="flex items-center gap-2 text-sm text-ink-300">
          <Wallet className="size-4 text-gold-500" aria-hidden />
          Total
        </span>
        <span className="font-display text-3xl font-bold text-gold-400">{service ? formatBRL(service.price) : '—'}</span>
      </div>
    </aside>
  )
}
