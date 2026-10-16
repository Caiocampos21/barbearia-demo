import { ButtonLink } from '../ui/Button'
import Reveal from '../ui/Reveal'

export default function FinalCta() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <Reveal>
        <div className="relative overflow-hidden rounded-[1.75rem] border border-gold-500/40 bg-gradient-to-br from-leather-700 via-ink-900 to-ink-950 px-6 py-14 text-center shadow-glow sm:px-12">
          <div className="pointer-events-none absolute -top-24 left-1/2 size-72 -translate-x-1/2 rounded-full bg-gold-500/20 blur-3xl" />
          <h2 className="relative text-4xl font-bold sm:text-5xl">
            Seu próximo corte <span className="text-gold-gradient italic">começa aqui</span>
          </h2>
          <p className="relative mx-auto mt-4 max-w-lg text-ink-200">Escolha o serviço, o barbeiro e o horário. Leva menos de um minuto.</p>
          <ButtonLink to="/agendar" size="lg" className="relative mt-8">
            Agendar horário
          </ButtonLink>
        </div>
      </Reveal>
    </section>
  )
}
