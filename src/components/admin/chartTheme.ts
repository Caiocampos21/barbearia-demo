/**
 * Cores dos gráficos. A ordem categórica foi validada (daltonismo, contraste e
 * separação) contra o fundo escuro #151518 — use sempre nessa ordem, sem pular.
 */
export const chartColors = {
  gold: '#c8a24b', // marca: séries únicas (faturamento)
  grid: 'rgba(255,255,255,0.07)',
  axis: '#9a9aa4',
  surface: '#151518',
  positive: '#3dbe8b',
  negative: '#e5584f',
  categorical: ['#c98500', '#3987e5', '#d95926', '#199e70', '#9085e9', '#d55181'],
}

export const axisProps = {
  stroke: chartColors.axis,
  tickLine: false,
  axisLine: false,
  fontSize: 12,
} as const
