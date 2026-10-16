export interface Business {
  name: string
  fullName: string
  tagline: string
  address: string
  city: string
  cep: string
  phone: string
  whatsapp: string
  instagram: string
  lat: number
  lng: number
  since: number
}

export interface DayHours {
  open: string // 'HH:mm'
  close: string
}
export type WeekHours = (DayHours | null)[]

export interface Service {
  id: string
  name: string
  description: string
  price: number
  duration: number // minutos
  icon: string
  popular?: boolean
}

export interface Barber {
  id: string
  name: string
  initials: string
  role: string
  specialty: string
  bio: string
  rating: number
  cuts: number
  gradient: [string, string]
  daysOff: number[] // dias da semana (0 = domingo)
}

export interface Review {
  id: string
  name: string
  rating: number
  text: string
  service: string
  when: string
}

export type PaymentMethod = 'pix' | 'cartao'
export type AppointmentStatus = 'pendente' | 'confirmado' | 'concluido' | 'cancelado'

export interface Appointment {
  id: string
  serviceId: string
  barberId: string
  date: string // 'yyyy-MM-dd'
  time: string // 'HH:mm'
  customerName: string
  customerPhone: string
  price: number
  status: AppointmentStatus
  paymentMethod?: PaymentMethod
  transactionId?: string
  paidAt?: string // ISO
  createdAt: string // ISO
}

export interface Slot {
  time: string
  available: boolean
  barberIds: string[] // barbeiros livres neste horário
}

// ───────────── Painel do dono ─────────────
export type VisitStatus = 'concluido' | 'confirmado' | 'pendente' | 'cancelado'

/** Um atendimento (passado ou futuro), vindo do mock ou do site (localStorage). */
export interface Visit {
  id: string
  date: string // 'yyyy-MM-dd'
  time: string // 'HH:mm'
  serviceId: string
  barberId: string
  customerId: string
  customerName: string
  customerPhone: string
  price: number
  status: VisitStatus
  source: 'balcao' | 'site'
  rating?: number
  paymentMethod?: PaymentMethod
}

export interface Customer {
  id: string
  name: string
  phone: string
  birthday: string // 'MM-dd'
}

export interface Expense {
  id: string
  date: string
  category: string
  description: string
  amount: number
}

export interface Product {
  id: string
  name: string
  category: string
  unit: string
  qty: number
  minQty: number
  unitCost: number
  supplier: string
}

export interface Purchase {
  id: string
  date: string
  productId: string
  qty: number
  total: number
}
