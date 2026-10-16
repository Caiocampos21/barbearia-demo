import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarX, Sun, Sunset } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { barbers } from '../../data/seed'
import { longDate } from '../../lib/format'
import { getBookableDays, getDaySlots } from '../../lib/schedule'
import type { Appointment, Service } from '../../lib/types'

interface Props {
  service: Service
  barberId: string // id ou 'any'
  appts: Appointment[]
  date?: string
  time?: string
  onChange: (date: string, time?: string) => void
}

export default function StepDateTime({ service, barberId, appts, date, time, onChange }: Props) {
  const pool = useMemo(() => (barberId === 'any' ? barbers : barbers.filter((b) => b.id === barberId)), [barberId])
  const days = useMemo(() => getBookableDays(pool), [pool])
  // dias com pelo menos um horário livre para este serviço/barbeiro
  const freeByDay = useMemo(
    () => Object.fromEntries(days.map((d) => [d.key, d.closed ? 0 : getDaySlots(d.date, pool, service, appts).filter((s) => s.available).length])),
    [days, pool, service, appts],
  )
  const selected = days.find((d) => d.key === date)

  // poupa um clique: já abre o primeiro dia com horário livre
  useEffect(() => {
    if (date) return
    const first = days.find((d) => freeByDay[d.key] > 0)
    if (first) onChange(first.key, undefined)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const slots = useMemo(() => (selected && !selected.closed ? getDaySlots(selected.date, pool, service, appts) : []), [selected, pool, service, appts])

  const morning = slots.filter((s) => Number(s.time.slice(0, 2)) < 12)
  const afternoon = slots.filter((s) => Number(s.time.slice(0, 2)) >= 12)
  const freeCount = slots.filter((s) => s.available).length

  const group = (title: string, icon: React.ReactNode, list: typeof slots) =>
    list.length > 0 && (
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-ink-300">
          {icon}
          {title}
        </h3>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
          {list.map((s) => {
            const isSel = s.time === time
            return (
              <button
                key={s.time}
                type="button"
                disabled={!s.available}
                aria-pressed={isSel}
                aria-label={`${s.time}${s.available ? '' : ' — ocupado'}`}
                onClick={() => date && onChange(date, s.time)}
                className={`h-11 rounded-xl border text-sm font-semibold tabular-nums transition-all duration-200 ${
                  isSel
                    ? 'scale-105 border-gold-400 bg-gold-500 text-ink-950 shadow-gold'
                    : s.available
                      ? 'border-white/12 bg-ink-900 text-ink-100 hover:border-gold-400 hover:text-gold-300'
                      : 'border-transparent bg-ink-800/60 text-ink-500 line-through decoration-ink-500/60'
                }`}
              >
                {s.time}
              </button>
            )
          })}
        </div>
      </div>
    )

  return (
    <div className="space-y-8">
      {/* Faixa de dias, rolagem horizontal no celular */}
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-ink-300">Escolha o dia</h3>
        <div className="no-scrollbar -mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0" role="listbox" aria-label="Dias disponíveis">
          {days.map((d) => {
            const isSel = d.key === date
            return (
              <button
                key={d.key}
                type="button"
                role="option"
                aria-selected={isSel}
                disabled={d.closed || freeByDay[d.key] === 0}
                onClick={() => onChange(d.key, undefined)}
                className={`flex w-[4.25rem] shrink-0 snap-start flex-col items-center rounded-2xl border py-3 transition-all duration-200 ${
                  isSel
                    ? 'border-gold-400 bg-gold-500 text-ink-950 shadow-gold'
                    : d.closed || freeByDay[d.key] === 0
                      ? 'border-transparent bg-ink-800/50 text-ink-500'
                      : 'border-white/12 bg-ink-900 hover:border-gold-400'
                }`}
              >
                <span className="text-[0.65rem] font-semibold uppercase tracking-wider opacity-80">{format(d.date, 'EEE', { locale: ptBR }).replace('.', '')}</span>
                <span className="font-display text-2xl font-bold leading-tight">{format(d.date, 'd')}</span>
                <span className="text-[0.65rem] uppercase opacity-70">{d.closed ? 'fechado' : freeByDay[d.key] === 0 ? 'lotado' : format(d.date, 'MMM', { locale: ptBR }).replace('.', '')}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Horários */}
      {!selected ? (
        <p className="rounded-card border border-dashed border-white/15 p-6 text-center text-sm text-ink-300">Selecione um dia para ver os horários livres.</p>
      ) : (
        <div key={selected.key} className="animate-page-in space-y-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-display text-xl font-semibold">{longDate(selected.key)}</h3>
            <span className="text-sm text-ink-300">
              {freeCount > 0 ? (
                <>
                  <strong className="text-gold-400">{freeCount}</strong> {freeCount === 1 ? 'horário livre' : 'horários livres'}
                </>
              ) : (
                'sem horários livres'
              )}
            </span>
          </div>

          {freeCount === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-card border border-dashed border-white/15 p-8 text-center">
              <CalendarX className="size-8 text-ink-400" aria-hidden />
              <p className="text-sm text-ink-300">Agenda cheia neste dia. Que tal escolher outro dia ou outro barbeiro?</p>
            </div>
          ) : (
            <>
              {group('Manhã', <Sun className="size-3.5" aria-hidden />, morning)}
              {group('Tarde e noite', <Sunset className="size-3.5" aria-hidden />, afternoon)}
              <p className="flex items-center gap-4 text-xs text-ink-400">
                <span className="flex items-center gap-1.5">
                  <span className="size-3 rounded border border-white/20 bg-ink-900" /> livre
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-3 rounded bg-ink-800" /> ocupado
                </span>
              </p>
            </>
          )}
        </div>
      )}
    </div>
  )
}
