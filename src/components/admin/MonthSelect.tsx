import { ChevronDown } from 'lucide-react'
import { lastMonths, monthKey, monthLabel } from '../../lib/analytics'

interface Props {
  now: Date
  value: Date
  onChange: (d: Date) => void
}

/** Seletor dos últimos 6 meses. */
export default function MonthSelect({ now, value, onChange }: Props) {
  const months = lastMonths(now, 6).reverse()
  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">Mês de referência</span>
      <select
        value={monthKey(value)}
        onChange={(e) => onChange(months.find((m) => monthKey(m) === e.target.value) ?? value)}
        className="h-11 appearance-none rounded-pill border border-white/12 bg-ink-900 pl-5 pr-11 text-sm font-semibold text-ink-100 transition-colors hover:border-gold-500/50 focus:border-gold-400 focus:outline-none"
      >
        {months.map((m) => (
          <option key={monthKey(m)} value={monthKey(m)}>
            {monthLabel(m)}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-4 size-4 text-gold-400" aria-hidden />
    </label>
  )
}
