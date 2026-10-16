import { ButtonLink } from '../components/ui/Button'

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[70dvh] max-w-xl flex-col items-center justify-center px-4 pt-24 text-center">
      <p className="font-display text-8xl font-bold text-gold-gradient">404</p>
      <h1 className="mt-4 text-3xl font-bold">Página não encontrada</h1>
      <p className="mt-3 text-ink-300">Parece que essa página levou um corte a mais. Volte para o início ou agende seu horário.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink to="/">Ir para o início</ButtonLink>
        <ButtonLink to="/agendar" variant="outline">
          Agendar horário
        </ButtonLink>
      </div>
    </section>
  )
}
