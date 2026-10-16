import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'

type Variant = 'gold' | 'outline' | 'ghost'
type Size = 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 rounded-pill font-semibold tracking-wide transition-all duration-300 select-none disabled:opacity-40 disabled:hover:translate-y-0 active:scale-[0.98]'

const variants: Record<Variant, string> = {
  gold: 'bg-gradient-to-b from-gold-400 to-gold-600 text-ink-950 shadow-gold hover:-translate-y-0.5 hover:from-gold-300 hover:to-gold-500',
  outline: 'border border-gold-500/60 text-gold-300 hover:bg-gold-500/10 hover:border-gold-400',
  ghost: 'text-ink-200 hover:text-gold-300 hover:bg-white/5',
}

const sizes: Record<Size, string> = {
  md: 'h-11 px-6 text-sm',
  lg: 'h-14 px-8 text-base',
}

const cls = (variant: Variant, size: Size, extra = '') =>
  `${base} ${variants[variant]} ${sizes[size]} ${extra}`

interface CommonProps {
  variant?: Variant
  size?: Size
  className?: string
  children: ReactNode
}

export function Button({
  variant = 'gold',
  size = 'md',
  className,
  children,
  ...rest
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cls(variant, size, className)} {...rest}>
      {children}
    </button>
  )
}

export function ButtonLink({
  variant = 'gold',
  size = 'md',
  className,
  children,
  ...rest
}: CommonProps & LinkProps) {
  return (
    <Link className={cls(variant, size, className)} {...rest}>
      {children}
    </Link>
  )
}
