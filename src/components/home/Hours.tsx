import { Clock } from 'lucide-react'
import { weekHours, weekdayNames } from '../../data/seed'
import { getOpenStatus } from '../../lib/hours'
import Reveal from '../ui/Reveal'
import SectionTitle from '../ui/SectionTitle'

// Segunda primeiro (padrão brasileiro).
const order = [1, 2, 3, 4, 5, 6, 0]

export default function Hours() {
  const today = new Date().getDay()
  const status = getOpenStatus()

  return (
    <section id="horarios" className="bg-ink-900/50 py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionTitle eyebrow="Horários" title="Quando nos visitar" />

        <Reveal>
          <div className="rounded-card border border-white/8 bg-ink-900 p-6 shadow-card sm:p-8">
            <p className={`mb-6 flex items-center gap-2 text-sm font-semibold ${status.open ? 'text-success' : 'text-danger'}`}>
              <Clock className="size-4" aria-hidden />
              {status.label}
            </p>
            <ul className="divide-y divide-white/8">
              {order.map((d) => {
                const h = weekHours[d]
                const isToday = d === today
                return (
                  <li key={d} className={`flex items-center justify-between py-3.5 ${isToday ? 'font-semibold text-gold-300' : 'text-ink-200'}`}>
                    <span className="flex items-center gap-2">
                      {weekdayNames[d]}
                      {isToday && <span className="rounded-pill bg-gold-500/15 px-2 py-0.5 text-[0.65rem] uppercase tracking-widest">hoje</span>}
                    </span>
                    <span className={h ? '' : 'text-ink-400'}>{h ? `${h.open} – ${h.close}` : 'Fechado'}</span>
                  </li>
                )
              })}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
