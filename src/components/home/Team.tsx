import { Scissors, Star } from 'lucide-react'
import { barbers } from '../../data/seed'
import Reveal from '../ui/Reveal'
import SectionTitle from '../ui/SectionTitle'

export default function Team() {
  return (
    <section id="equipe" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <SectionTitle eyebrow="Equipe" title="Mestres da navalha" subtitle="Profissionais experientes, cada um com sua especialidade." />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {barbers.map((b, i) => (
          <Reveal key={b.id} delay={i * 90}>
            <article className="group h-full overflow-hidden rounded-card border border-white/8 bg-ink-900 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:border-gold-500/40">
              {/* Foto placeholder: gradiente + iniciais (troque por foto real do cliente) */}
              <div
                className="relative grid aspect-[4/4.2] place-items-center overflow-hidden"
                style={{ background: `linear-gradient(145deg, ${b.gradient[0]}, ${b.gradient[1]})` }}
              >
                <Scissors className="absolute -right-6 -top-6 size-40 rotate-12 text-white/5" aria-hidden />
                <span className="font-display text-7xl font-bold text-white/90 transition-transform duration-500 group-hover:scale-110">{b.initials}</span>
                <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded-pill bg-ink-950/70 px-2.5 py-1 text-xs font-semibold text-gold-300 backdrop-blur">
                  <Star className="size-3 fill-current" aria-hidden />
                  {b.rating.toFixed(1)}
                </span>
              </div>
              <div className="p-5">
                <h3 className="text-xl font-semibold">{b.name}</h3>
                <p className="text-xs font-semibold uppercase tracking-widest text-gold-500">{b.role}</p>
                <p className="mt-3 text-sm font-medium text-ink-100">{b.specialty}</p>
                <p className="mt-1 text-sm text-ink-300">{b.bio}</p>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
