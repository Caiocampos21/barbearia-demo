import { Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { services } from '../../data/seed'
import { formatBRL, formatDuration } from '../../lib/format'
import Reveal from '../ui/Reveal'
import SectionTitle from '../ui/SectionTitle'
import ServiceIcon from '../ui/ServiceIcon'

export default function Services() {
  return (
    <section id="servicos" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <SectionTitle eyebrow="Serviços" title="Cuidado em cada detalhe" subtitle="Escolha o serviço e agende em menos de um minuto. Preços claros, sem surpresa." />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s, i) => (
          <Reveal key={s.id} delay={(i % 3) * 90}>
            <Link
              to={`/agendar?servico=${s.id}`}
              className={`group relative flex h-full flex-col rounded-card border p-6 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-glow ${
                s.popular ? 'border-gold-500/60 bg-gradient-to-b from-gold-500/10 to-ink-900' : 'border-white/8 bg-ink-900 hover:border-gold-500/40'
              }`}
            >
              {s.popular && (
                <span className="absolute -top-3 right-5 rounded-pill bg-gold-500 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-widest text-ink-950">
                  Mais pedido
                </span>
              )}
              <span className="grid size-12 place-items-center rounded-xl bg-gold-500/10 text-gold-400 transition-colors group-hover:bg-gold-500 group-hover:text-ink-950">
                <ServiceIcon name={s.icon} className="size-6" aria-hidden />
              </span>
              <h3 className="mt-5 text-2xl font-semibold">{s.name}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-300">{s.description}</p>
              <div className="mt-6 flex items-end justify-between border-t border-white/8 pt-4">
                <span className="flex items-center gap-1.5 text-xs text-ink-300">
                  <Clock className="size-3.5" aria-hidden />
                  {formatDuration(s.duration)}
                </span>
                <span className="font-display text-3xl font-bold text-gold-400">{formatBRL(s.price)}</span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
