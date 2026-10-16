interface Props {
  initials: string
  gradient: [string, string]
  size?: 'sm' | 'md' | 'lg'
}

const sizes = { sm: 'size-8 text-xs', md: 'size-11 text-sm', lg: 'size-16 text-xl' }

export default function BarberAvatar({ initials, gradient, size = 'md' }: Props) {
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full font-display font-bold text-white ${sizes[size]}`}
      style={{ background: `linear-gradient(145deg, ${gradient[0]}, ${gradient[1]})` }}
      aria-hidden
    >
      {initials}
    </span>
  )
}
