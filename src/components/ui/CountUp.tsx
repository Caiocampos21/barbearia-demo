import { useEffect, useState } from 'react'
import { useInView } from '../../hooks/useInView'

interface Props {
  value: number
  decimals?: number
  suffix?: string
  duration?: number
  /** Formatação própria (ex.: moeda). Substitui decimals/suffix. */
  format?: (n: number) => string
}

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

/** Número que "sobe" até o valor final quando aparece na tela. */
export default function CountUp({ value, decimals = 0, suffix = '', duration = 1600, format }: Props) {
  const { ref, inView } = useInView<HTMLSpanElement>(0.4)
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (!inView) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setCurrent(value)
      return
    }
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      setCurrent(value * easeOut(p))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, value, duration])

  const text = format ? format(current) : current.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
  return (
    <span ref={ref}>
      {text}
      {format ? '' : suffix}
    </span>
  )
}
