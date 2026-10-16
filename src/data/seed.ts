// Dados fictícios da "Barbearia Navalha de Ouro" (modo demonstração).
import type { Barber, Business, Review, Service, WeekHours } from '../lib/types'

export const business: Business = {
  name: 'Navalha de Ouro',
  fullName: 'Barbearia Navalha de Ouro',
  tagline: 'Tradição, navalha e estilo no coração da Savassi.',
  address: 'Rua Pernambuco, 1.250 — Savassi',
  city: 'Belo Horizonte · MG',
  cep: '30130-151',
  phone: '(31) 99876-5432',
  whatsapp: '5531998765432',
  instagram: '@navalhadeouro.bh',
  lat: -19.9386,
  lng: -43.9378,
  since: 2014,
}

// 0 = domingo … 6 = sábado. null = fechado.
export const weekHours: WeekHours = [
  null,
  { open: '09:00', close: '20:00' },
  { open: '09:00', close: '20:00' },
  { open: '09:00', close: '20:00' },
  { open: '09:00', close: '20:00' },
  { open: '09:00', close: '20:00' },
  { open: '08:00', close: '18:00' },
]

export const weekdayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

export const services: Service[] = [
  {
    id: 'corte',
    name: 'Corte Clássico',
    description: 'Corte na tesoura ou máquina, lavagem e finalização com pomada.',
    price: 35,
    duration: 40,
    icon: 'scissors',
  },
  {
    id: 'barba',
    name: 'Barba Premium',
    description: 'Toalha quente, óleo aromático e acabamento na navalha.',
    price: 25,
    duration: 30,
    icon: 'razor',
  },
  {
    id: 'combo',
    name: 'Combo Ouro',
    description: 'Corte + barba completos, com bebida cortesia. O queridinho da casa.',
    price: 55,
    duration: 70,
    icon: 'crown',
    popular: true,
  },
  {
    id: 'pezinho',
    name: 'Pezinho & Acabamento',
    description: 'Contorno e limpeza do acabamento para manter o corte em dia.',
    price: 15,
    duration: 20,
    icon: 'sparkles',
  },
  {
    id: 'sobrancelha',
    name: 'Sobrancelha na Navalha',
    description: 'Design masculino discreto e natural.',
    price: 15,
    duration: 20,
    icon: 'eye',
  },
  {
    id: 'hidratacao',
    name: 'Hidratação & Relax',
    description: 'Hidratação capilar, massagem no couro cabeludo e toalha quente.',
    price: 40,
    duration: 40,
    icon: 'droplets',
  },
]

export const barbers: Barber[] = [
  {
    id: 'rafael',
    name: 'Rafael Mendes',
    initials: 'RM',
    role: 'Fundador & Master Barber',
    specialty: 'Cortes clássicos e navalhados',
    bio: '12 anos de cadeira. Referência em degradê navalhado em BH.',
    rating: 4.9,
    cuts: 8200,
    gradient: ['#8b5a2b', '#3a2412'],
    daysOff: [0],
  },
  {
    id: 'thiago',
    name: 'Thiago Alves',
    initials: 'TA',
    role: 'Barbeiro Sênior',
    specialty: 'Barba e visagismo',
    bio: 'Especialista em desenhar a barba certa para o formato do seu rosto.',
    rating: 4.9,
    cuts: 5400,
    gradient: ['#c8a24b', '#4a3410'],
    daysOff: [0, 1],
  },
  {
    id: 'bruno',
    name: 'Bruno Carvalho',
    initials: 'BC',
    role: 'Barbeiro',
    specialty: 'Fade, undercut e estilos modernos',
    bio: 'Tendências e cortes de impacto, do social ao streetwear.',
    rating: 4.8,
    cuts: 3600,
    gradient: ['#6f4520', '#1f1409'],
    daysOff: [0, 3],
  },
  {
    id: 'leo',
    name: 'Léo Ribeiro',
    initials: 'LR',
    role: 'Barbeiro',
    specialty: 'Cabelo infantil e sobrancelha',
    bio: 'Paciência de sobra e mão leve. Os pequenos adoram.',
    rating: 4.8,
    cuts: 2900,
    gradient: ['#a9842f', '#2b1d0b'],
    daysOff: [0, 2],
  },
]

// Fotos do Unsplash (licença livre). Se alguma falhar, a UI usa um gradiente.
export const galleryIds = [
  { id: '1585747860715-2ba37e788b70', alt: 'Interior da barbearia com cadeiras e tijolos aparentes' },
  { id: '1503951914875-452162b0f3f1', alt: 'Barbeiro aparando a barba com tesoura' },
  { id: '1599351431202-1e0f0137899a', alt: 'Acabamento com navalha na lateral do corte' },
  { id: '1621605815971-fbc98d665033', alt: 'Barbeiro finalizando o corte com secador' },
  { id: '1605497788044-5a32c7078486', alt: 'Degradê com textura no topo' },
  { id: '1622286342621-4bd786c2447c', alt: 'Barba com espuma e pincel' },
  { id: '1532710093739-9470acff878f', alt: 'Tesoura trabalhando na barba' },
  { id: '1517832606299-7ae9b720a186', alt: 'Ferramentas de barbeiro sobre bancada de madeira' },
]

export const reviews: Review[] = [
  {
    id: 'r1',
    name: 'Marcelo Duarte',
    rating: 5,
    text: 'Melhor barbearia que já frequentei em BH. O Rafael tem mão de ouro e o ambiente é sensacional. Já virei cliente fixo.',
    service: 'Combo Ouro',
    when: 'há 2 semanas',
  },
  {
    id: 'r2',
    name: 'Pedro Henrique',
    rating: 5,
    text: 'Agendei pelo site em menos de um minuto. Cheguei na hora, fui atendido na hora e saí outro homem. Atendimento nota 10.',
    service: 'Corte Clássico',
    when: 'há 1 mês',
  },
  {
    id: 'r3',
    name: 'Gustavo Lima',
    rating: 5,
    text: 'A barba com toalha quente é um espetáculo. O Thiago acertou o desenho de primeira. Recomendo demais!',
    service: 'Barba Premium',
    when: 'há 3 semanas',
  },
  {
    id: 'r4',
    name: 'Anderson Costa',
    rating: 4,
    text: 'Corte impecável e cerveja gelada de cortesia. Só achei que poderia ter mais horários no sábado, mas vale cada centavo.',
    service: 'Corte Clássico',
    when: 'há 2 meses',
  },
  {
    id: 'r5',
    name: 'Rodrigo Faria',
    rating: 5,
    text: 'Levei meu filho de 6 anos com o Léo. Paciência incrível, ele saiu rindo e pedindo pra voltar.',
    service: 'Corte Clássico',
    when: 'há 1 semana',
  },
  {
    id: 'r6',
    name: 'Felipe Nogueira',
    rating: 5,
    text: 'Ambiente com cara de filme, música boa e profissionais de primeira. Pagamento por PIX na hora, super prático.',
    service: 'Hidratação & Relax',
    when: 'há 5 dias',
  },
]

export const stats = [
  { label: 'Clientes atendidos', value: 18500, suffix: '+' },
  { label: 'Anos de tradição', value: new Date().getFullYear() - business.since, suffix: '' },
  { label: 'Avaliação média', value: 4.9, suffix: '★', decimals: 1 },
  { label: 'Barbeiros premiados', value: 4, suffix: '' },
]
