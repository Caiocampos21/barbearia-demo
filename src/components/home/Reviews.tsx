import { Quote, Star } from 'lucide-react'
import { reviews } from '../../data/seed'
import Reveal from '../ui/Reveal'
import SectionTitle from '../ui/SectionTitle'

export default function Reviews() {
  return (
    <section id="avaliacoes" className="bg-ink-900/50 py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionTitle eyebrow="Avaliações" title="Quem vem, volta" subtitle="O que nossos clientes dizem sobre a experiência." />

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r, i) => (
            <Reveal key={r.id} delay={(i % 3) * 90}>
              <figure className="relative flex h-full flex-col rounded-card border border-white/8 bg-ink-900 p-6 shadow-card">
                <Quote className="absolute right-5 top-5 size-8 text-gold-500/20" aria-hidden />
                <div className="flex text-gold-400" role="img" aria-label={`${r.rating} de 5 estrelas`}>
                  {Array.from({ length: 5 }).map((_, k) => (
                    <Star key={k} className={`size-4 ${k < r.rating ? 'fill-current' : 'text-ink-600'}`} />
                  ))}
                </div>
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-ink-200">“{r.text}”</blockquote>
                <figcaption className="mt-5 flex items-center gap-3 border-t border-white/8 pt-4">
                  <span className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-gold-500 to-leather-600 font-display font-bold text-ink-950">
                    {r.name.charAt(0)}
                  </span>
                  <span className="text-sm">
                    <strong className="block text-ink-100">{r.name}</strong>
                    <span className="text-xs text-ink-300">
                      {r.service} · {r.when}
                    </span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
