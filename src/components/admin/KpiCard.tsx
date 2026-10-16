import type { LucideIcon } from 'lucide-react'
import CountUp from '../ui/CountUp'
import Reveal from '../ui/Reveal'
import DeltaChip from './DeltaChip'

interface Props {
  label: string
  value: number
  format: (n: number) => string
  icon: LucideIcon
  delta?: number
  deltaUnit?: '%' | 'pp'
  deltaInvert?: boolean
  hint?: string
  delay?: number
}

/** Card grande com número animado — o "primeiro olhar" do dono. */
export default function KpiCard({ label, value, format, icon: Icon, delta, deltaUnit, deltaInvert, hint, delay = 0 }: Props) {
  return (
    <Reveal delay={delay} className="h-full">
      <article className="group relative h-full overflow-hidden rounded-card border border-white/8 bg-gradient-to-br from-ink-800 to-ink-900 p-4 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-gold-500/40 sm:p-6">
        <div className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-gold-500/10 blur-2xl transition-opacity group-hover:opacity-100" />
        <div className="relative flex items-start justify-between gap-2">
          <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-ink-300 sm:text-xs">{label}</p>
          <span className="hidden size-9 shrink-0 place-items-center rounded-xl sm:grid bg-gold-500/10 text-gold-400">
            <Icon className="size-[1.125rem]" aria-hidden />
          </span>
        </div>
        <p className="relative mt-4 font-display text-[1.65rem] font-bold leading-none tracking-tight text-ink-100 tabular-nums sm:text-[2.6rem]">
          <CountUp value={value} format={format} />
        </p>
        <div className="relative mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-300">
          {delta !== undefined && <DeltaChip value={delta} unit={deltaUnit} invert={deltaInvert} />}
          {hint && <span>{hint}</span>}
        </div>
      </article>
    </Reveal>
  )
}
