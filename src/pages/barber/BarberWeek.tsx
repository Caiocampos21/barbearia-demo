import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import PageHeader from '../../components/admin/PageHeader'
import VisitRow from '../../components/barber/VisitRow'
import { useAdminData } from '../../hooks/useAdminData'
import { useBarberContext } from '../../hooks/useBarber'
import { barberWeek, dayTotals, phaseOf } from '../../lib/barberAnalytics'
import { formatBRL0 } from '../../lib/format'

export default function BarberWeek() {
  const { barber } = useBarberContext()
  const ds = useAdminData()
  const [offset, setOffset] = useState(0)
  const [open, setOpen] = useState<Set<string>>(() => new Set([format(new Date(), 'yyyy-MM-dd')]))
  const week = barberWeek(ds, barber.id, offset)
  const todayKey = format(ds.now, 'yyyy-MM-dd')

  const toggle = (key: string) =>
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  const total = week.reduce((acc, d) => acc + d.visits.length, 0)
  const range = `${format(week[0].date, 'd MMM', { locale: ptBR })} – ${format(week[6].date, 'd MMM', { locale: ptBR })}`

  return (
    <>
      <PageHeader
        title="Minha semana"
        subtitle={`${range} · ${total} atendimentos`}
        right={
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setOffset((o) => o - 1)} aria-label="Semana anterior" className="grid size-10 place-items-center rounded-full border border-white/12 hover:border-gold-500/50 hover:text-gold-300">
              <ChevronLeft className="size-5" />
            </button>
            <button type="button" onClick={() => setOffset(0)} disabled={offset === 0} className="h-10 rounded-pill border border-white/12 px-4 text-sm font-semibold text-gold-300 hover:border-gold-500/50 disabled:opacity-40">
              Esta semana
            </button>
            <button type="button" onClick={() => setOffset((o) => o + 1)} aria-label="Próxima semana" className="grid size-10 place-items-center rounded-full border border-white/12 hover:border-gold-500/50 hover:text-gold-300">
              <ChevronRight className="size-5" />
            </button>
          </div>
        }
      />

      <ul className="space-y-3">
        {week.map((d) => {
          const isToday = d.key === todayKey
          const isOpen = open.has(d.key)
          const totals = dayTotals(d.visits, barber.id)
          const canOpen = d.state === 'open' && d.visits.length > 0
          return (
            <li key={d.key} className={`overflow-hidden rounded-card border shadow-card ${isToday ? 'border-gold-500/50 bg-ink-900' : 'border-white/8 bg-ink-900'}`}>
              <button
                type="button"
                onClick={() => canOpen && toggle(d.key)}
                aria-expanded={canOpen ? isOpen : undefined}
                className={`flex w-full items-center gap-4 p-4 text-left sm:p-5 ${canOpen ? '' : 'cursor-default'}`}
              >
                <span className={`grid size-14 shrink-0 place-items-center rounded-xl leading-none ${isToday ? 'bg-gold-500 text-ink-950' : 'bg-ink-800 text-ink-100'}`}>
                  <span className="text-[0.65rem] font-bold uppercase tracking-wider">{format(d.date, 'EEEE', { locale: ptBR }).slice(0, 3)}</span>
                  <span className="font-display text-2xl font-bold">{format(d.date, 'd')}</span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">
                    {d.state === 'off' ? 'Folga' : d.state === 'closed' ? 'Barbearia fechada' : d.visits.length ? `${d.visits.length} atendimentos` : 'Sem atendimentos'}
                    {isToday && <span className="ml-2 rounded-pill bg-gold-500/15 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-gold-300">hoje</span>}
                  </span>
                  {d.state === 'open' && d.visits.length > 0 && (
                    <span className="block text-sm text-ink-300">
                      {d.visits[0].time} às {d.visits.at(-1)?.time} · {totals.done ? `${formatBRL0(totals.commission)} de comissão` : 'a atender'}
                    </span>
                  )}
                </span>
                {canOpen && <ChevronDown className={`size-5 shrink-0 text-ink-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden />}
              </button>
              {canOpen && isOpen && (
                <ul className="animate-page-in space-y-2 border-t border-white/8 p-3 sm:p-4">
                  {d.visits.map((v) => (
                    <VisitRow key={v.id} visit={v} phase={phaseOf(v, ds.now)} />
                  ))}
                </ul>
              )}
            </li>
          )
        })}
      </ul>
    </>
  )
}
