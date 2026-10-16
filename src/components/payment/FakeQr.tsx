import { useMemo } from 'react'

const N = 29 // módulos por lado

/** PRNG simples e determinístico a partir de uma string. */
function rng(seed: string) {
  let h = 1779033703 ^ seed.length
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    return ((h ^= h >>> 16) >>> 0) / 4294967296
  }
}

const inFinder = (x: number, y: number) => (x < 8 && y < 8) || (x >= N - 8 && y < 8) || (x < 8 && y >= N - 8)

function finderCells(ox: number, oy: number) {
  const cells: [number, number][] = []
  for (let y = 0; y < 7; y++)
    for (let x = 0; x < 7; x++) {
      const ring = x === 0 || x === 6 || y === 0 || y === 6
      const core = x >= 2 && x <= 4 && y >= 2 && y <= 4
      if (ring || core) cells.push([ox + x, oy + y])
    }
  return cells
}

/** QR Code FALSO (apenas visual): não é escaneável e não representa nenhum pagamento. */
export default function FakeQr({ seed, size = 208 }: { seed: string; size?: number }) {
  const cells = useMemo(() => {
    const rand = rng(seed)
    const out: [number, number][] = []
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (!inFinder(x, y) && rand() > 0.52) out.push([x, y])
    return [...out, ...finderCells(0, 0), ...finderCells(N - 7, 0), ...finderCells(0, N - 7)]
  }, [seed])

  return (
    <svg viewBox={`-2 -2 ${N + 4} ${N + 4}`} width={size} height={size} role="img" aria-label="QR Code de demonstração (não escaneável)" className="rounded-xl bg-white">
      {cells.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="1.02" height="1.02" fill="#0e0e10" />
      ))}
    </svg>
  )
}
