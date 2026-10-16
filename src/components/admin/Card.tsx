import type { ReactNode } from 'react'

interface Props {
  title?: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
}

export default function Card({ title, subtitle, action, children, className = '', bodyClassName = '' }: Props) {
  return (
    <section className={`min-w-0 rounded-card border border-white/8 bg-ink-900 p-5 shadow-card sm:p-6 ${className}`}>
      {(title || action) && (
        <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && <h2 className="font-display text-xl font-semibold">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-sm text-ink-300">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  )
}
