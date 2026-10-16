import { Crown, Droplets, Eye, Scissors, Sparkles, UserRound, type LucideProps } from 'lucide-react'

const icons = {
  scissors: Scissors,
  razor: UserRound,
  crown: Crown,
  sparkles: Sparkles,
  eye: Eye,
  droplets: Droplets,
}

export default function ServiceIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = icons[name as keyof typeof icons] ?? Scissors
  return <Icon {...props} />
}
