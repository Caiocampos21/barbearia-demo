import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { galleryIds } from '../../data/seed'
import { unsplash } from '../../lib/images'
import Photo from '../ui/Photo'
import Reveal from '../ui/Reveal'
import SectionTitle from '../ui/SectionTitle'

// Alturas variadas dão o efeito de mosaico no desktop.
const spans = ['row-span-2', '', '', 'row-span-2', '', 'row-span-2', 'row-span-2', '']

export default function Gallery() {
  const [active, setActive] = useState<number | null>(null)

  useEffect(() => {
    if (active === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActive(null)
      if (e.key === 'ArrowRight') setActive((i) => (i === null ? i : (i + 1) % galleryIds.length))
      if (e.key === 'ArrowLeft') setActive((i) => (i === null ? i : (i - 1 + galleryIds.length) % galleryIds.length))
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [active])

  return (
    <section id="galeria" className="bg-ink-900/50 py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionTitle eyebrow="Galeria" title="Nosso trabalho fala por si" subtitle="Cortes, barbas e o ambiente que faz a gente ser diferente." />

        <div className="grid grid-flow-dense auto-rows-[10rem] grid-cols-2 gap-3 sm:auto-rows-[12rem] md:grid-cols-4">
          {galleryIds.map((g, i) => (
            <Reveal key={g.id} delay={(i % 4) * 70} className={`min-h-0 ${spans[i]}`}>
              <button
                type="button"
                onClick={() => setActive(i)}
                className="group relative block size-full overflow-hidden rounded-card"
                aria-label={`Ampliar foto: ${g.alt}`}
              >
                <Photo id={g.id} alt={g.alt} width={700} className="size-full transition-transform duration-700 group-hover:scale-110" />
                <span className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      {active !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Foto ampliada"
          className="animate-page-in fixed inset-0 z-[60] grid place-items-center bg-ink-950/95 p-4"
          onClick={() => setActive(null)}
        >
          <button
            type="button"
            aria-label="Fechar"
            className="absolute right-4 top-4 grid size-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
            onClick={() => setActive(null)}
          >
            <X className="size-6" />
          </button>
          <img
            src={unsplash(galleryIds[active].id, 1400, 80)}
            alt={galleryIds[active].alt}
            className="max-h-[85dvh] max-w-full rounded-card object-contain shadow-card"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  )
}
