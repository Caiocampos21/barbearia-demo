import { stats } from '../../data/seed'
import CountUp from '../ui/CountUp'

export default function Stats() {
  return (
    <section aria-label="Números da barbearia" className="border-y border-white/5 bg-ink-900/70">
      <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-y-8 px-4 py-10 sm:px-6 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <dd className="order-1 font-display text-4xl font-bold text-gold-gradient sm:text-5xl">
              <CountUp value={s.value} suffix={s.suffix} decimals={s.decimals} />
            </dd>
            <dt className="mt-1 text-xs uppercase tracking-widest text-ink-300">{s.label}</dt>
          </div>
        ))}
      </dl>
    </section>
  )
}
