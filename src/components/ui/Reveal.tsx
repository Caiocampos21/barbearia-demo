import type { CSSProperties, ReactNode } from 'react'
import { useInView } from '../../hooks/useInView'

interface Props {
  children: ReactNode
  delay?: number
  className?: string
}

/** Faz o conteúdo surgir suavemente ao rolar a página. */
export default function Reveal({ children, delay = 0, className = '' }: Props) {
  const { ref, inView } = useInView<HTMLDivElement>()
  return (
    <div
      ref={ref}
      className={`reveal ${inView ? 'is-visible' : ''} ${className}`}
      style={{ '--reveal-delay': `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  )
}
