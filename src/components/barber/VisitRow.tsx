import { Check, Globe } from 'lucide-react'
import { services } from '../../data/seed'
import { type Phase, visitEnd } from '../../lib/barberAnalytics'
import { formatBRL } from '../../lib/format'
import type { Visit } from '../../lib/types'
import { differenceInMinutes } from 'date-fns'

/** Uma linha da agenda do barbeiro: horário, cliente, serviço e situação. */
export default function VisitRow({ visit, phase }: { visit: Visit; phase: Phase }) {
  const service = services.find((s) => s.id === visit.serviceId)
  const minutes = service ? differenceInMinutes(visitEnd(visit), new Date(`${visit.date}T${visit.time}:00`)) : 0
  return (
    <li
      className={`flex items-center gap-3 rounded-xl border px-3 py-3 sm:px-4 ${
        phase === 'now' ? 'border-gold-500/60 bg-gold-500/10' : phase === 'done' ? 'border-white/5 bg-ink-900/50' : 'border-white/8 bg-ink-800/60'
      }`}
    >
      <span className={`w-14 shrink-0 font-display text-lg font-semibold tabular-nums ${phase === 'done' ? 'text-ink-400' : 'text-gold-400'}`}>{visit.time}</span>
      <div className="min-w-0 flex-1">
        <p className={`flex items-center gap-2 truncate font-semibold ${phase === 'done' ? 'text-ink-300' : 'text-ink-100'}`}>
          <span className="truncate">{visit.customerName}</span>
          {visit.source === 'site' && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-pill bg-gold-500/15 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-gold-300">
              <Globe className="size-3" aria-hidden /> site
            </span>
          )}
        </p>
        <p className="truncate text-xs text-ink-400">
          {service?.name}<span className="hidden sm:inline"> · {minutes} min</span>
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className={`text-sm font-semibold tabular-nums ${phase === 'done' ? 'text-ink-400' : 'text-ink-100'}`}>{formatBRL(visit.price)}</p>
        {phase === 'done' && (
          <p className="flex items-center justify-end gap-1 text-[0.65rem] uppercase tracking-wider text-success">
            <Check className="size-3" aria-hidden /> feito
          </p>
        )}
        {phase === 'now' && <p className="text-[0.65rem] font-bold uppercase tracking-wider text-gold-300">agora</p>}
      </div>
    </li>
  )
}
