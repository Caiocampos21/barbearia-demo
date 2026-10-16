import Reveal from './Reveal'

interface Props {
  eyebrow: string
  title: string
  subtitle?: string
  align?: 'left' | 'center'
}

export default function SectionTitle({ eyebrow, title, subtitle, align = 'center' }: Props) {
  return (
    <Reveal className={`mb-12 ${align === 'center' ? 'text-center mx-auto' : ''} max-w-2xl`}>
      <div
        className={`mb-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-gold-500 ${
          align === 'center' ? 'justify-center' : ''
        }`}
      >
        <span className="h-px w-8 bg-gold-500/60" />
        {eyebrow}
        <span className={`h-px w-8 bg-gold-500/60 ${align === 'center' ? '' : 'hidden'}`} />
      </div>
      <h2 className="text-4xl font-bold leading-tight sm:text-5xl">{title}</h2>
      {subtitle && <p className="mt-4 text-lg text-ink-300">{subtitle}</p>}
    </Reveal>
  )
}
