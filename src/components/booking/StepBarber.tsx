import { Check, Shuffle, Star } from 'lucide-react'
import { barbers } from '../../data/seed'

interface Props {
  value?: string // id ou 'any'
  onSelect: (id: string) => void
}

export default function StepBarber({ value, onSelect }: Props) {
  const base = 'relative flex items-center gap-4 rounded-card border p-4 text-left transition-all duration-200 hover:-translate-y-0.5'
  const on = 'border-gold-400 bg-gold-500/10 shadow-glow'
  const off = 'border-white/10 bg-ink-900 hover:border-gold-500/40'

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <button type="button" aria-pressed={value === 'any'} onClick={() => onSelect('any')} className={`${base} ${value === 'any' ? on : off} sm:col-span-2`}>
        <span className="grid size-14 shrink-0 place-items-center rounded-full bg-gold-500/10 text-gold-400">
          {value === 'any' ? <Check className="size-6" strokeWidth={3} /> : <Shuffle className="size-6" aria-hidden />}
        </span>
        <span>
          <span className="block font-display text-lg font-semibold">Sem preferência</span>
          <span className="block text-xs text-ink-300">Mostramos todos os horários livres e escolhemos o barbeiro para você.</span>
        </span>
      </button>

      {barbers.map((b) => (
        <button key={b.id} type="button" aria-pressed={value === b.id} onClick={() => onSelect(b.id)} className={`${base} ${value === b.id ? on : off}`}>
          <span
            className="grid size-14 shrink-0 place-items-center rounded-full font-display text-lg font-bold text-white"
            style={{ background: `linear-gradient(145deg, ${b.gradient[0]}, ${b.gradient[1]})` }}
          >
            {value === b.id ? <Check className="size-6" strokeWidth={3} /> : b.initials}
          </span>
          <span className="min-w-0">
            <span className="flex items-center gap-2">
              <span className="font-display text-lg font-semibold">{b.name}</span>
              <span className="flex items-center gap-0.5 text-xs font-semibold text-gold-400">
                <Star className="size-3 fill-current" aria-hidden />
                {b.rating.toFixed(1)}
              </span>
            </span>
            <span className="block text-xs text-ink-300">{b.specialty}</span>
          </span>
        </button>
      ))}
    </div>
  )
}
