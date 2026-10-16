/** Monta a URL de uma foto do Unsplash com tamanho otimizado. */
export const unsplash = (id: string, width = 800, quality = 75) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=${quality}`

export const heroImage = '1585747860715-2ba37e788b70'
