import { Check, Clock } from 'lucide-react'
import { services } from '../../data/seed'
import { formatBRL, formatDuration } from '../../lib/format'
import ServiceIcon from '../ui/ServiceIcon'

interface Props {
  value?: string
  onSelect: (id: string) => void
}

export default function StepService({ value, onSelect }: Props) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {services.map((s) => {
        const selected = s.id === value
        return (
          <button
            key={s.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onSelect(s.id)}
            className={`relative flex items-start gap-4 rounded-card border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 ${
              selected ? 'border-gold-400 bg-gold-500/10 shadow-glow' : 'border-white/10 bg-ink-900 hover:border-gold-500/40'
            }`}
          >
            <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${selected ? 'bg-gold-500 text-ink-950' : 'bg-gold-500/10 text-gold-400'}`}>
              {selected ? <Check className="size-5" strokeWidth={3} /> : <ServiceIcon name={s.icon} className="size-5" aria-hidden />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-baseline justify-between gap-2">
                <span className="font-display text-lg font-semibold">{s.name}</span>
                <span className="font-display text-lg font-bold text-gold-400">{formatBRL(s.price)}</span>
              </span>
              <span className="mt-0.5 block text-xs text-ink-300">{s.description}</span>
              <span className="mt-2 flex items-center gap-1.5 text-xs text-ink-400">
                <Clock className="size-3" aria-hidden />
                {formatDuration(s.duration)}
                {s.popular && <span className="ml-2 rounded-pill bg-gold-500 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-ink-950">Mais pedido</span>}
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
