import { ButtonLink } from '../../components/ui/Button'

export default function AdminNotFound() {
  return (
    <section className="flex min-h-[55dvh] flex-col items-center justify-center text-center">
      <p className="font-display text-7xl font-bold text-gold-gradient">404</p>
      <h1 className="mt-3 text-2xl font-bold">Essa tela não existe no painel</h1>
      <p className="mt-2 text-ink-300">Use o menu ao lado para navegar pelas seções.</p>
      <ButtonLink to="/painel" className="mt-6">
        Voltar ao dashboard
      </ButtonLink>
    </section>
  )
}
