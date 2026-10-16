import { useState } from 'react'
import { unsplash } from '../../lib/images'

interface Props {
  id: string
  alt: string
  width?: number
  className?: string
  eager?: boolean
}

/** Foto do Unsplash com fade-in e gradiente de reserva caso a imagem não carregue. */
export default function Photo({ id, alt, width = 800, className = '', eager = false }: Props) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)

  return (
    <div className={`overflow-hidden bg-gradient-to-br from-leather-700 to-ink-900 ${className}`}>
      {!failed && (
        <img
          src={unsplash(id, width)}
          srcSet={`${unsplash(id, Math.round(width / 2))} ${Math.round(width / 2)}w, ${unsplash(id, width)} ${width}w`}
          sizes="(min-width: 1024px) 33vw, 100vw"
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={`size-full object-cover transition-all duration-700 ${loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
        />
      )}
    </div>
  )
}
