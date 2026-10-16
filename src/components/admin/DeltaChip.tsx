import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'

interface Props {
  value: number
  unit?: '%' | 'pp'
  /** Quando "menos é melhor" (ex.: despesas), inverte as cores. */
  invert?: boolean
}

/** Variação vs. período anterior. Traz seta + sinal, nunca só cor. */
export default function DeltaChip({ value, unit = '%', invert = false }: Props) {
  const flat = Math.abs(value) < 0.05
  const good = invert ? value < 0 : value > 0
  const Icon = flat ? Minus : value > 0 ? ArrowUpRight : ArrowDownRight
  const tone = flat ? 'bg-white/5 text-ink-300' : good ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'
  const text = `${value > 0 ? '+' : ''}${value.toFixed(1).replace('.', ',')}${unit === '%' ? '%' : ' pp'}`
  return (
    <span className={`inline-flex items-center gap-1 rounded-pill px-2 py-0.5 text-xs font-semibold tabular-nums ${tone}`}>
      <Icon className="size-3.5" aria-hidden />
      {text}
    </span>
  )
}
