import { lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from './components/admin/AdminLayout'
import BarberLayout from './components/barber/BarberLayout'
import Layout from './components/layout/Layout'
import Booking from './pages/Booking'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import Payment from './pages/Payment'
import Receipt from './pages/Receipt'
import AdminNotFound from './pages/admin/AdminNotFound'

// O painel (com Recharts) só é baixado quando alguém abre /painel: o site do cliente fica leve.
const Dashboard = lazy(() => import('./pages/admin/Dashboard'))
const Agenda = lazy(() => import('./pages/admin/Agenda'))
const Finance = lazy(() => import('./pages/admin/Finance'))
const Barbers = lazy(() => import('./pages/admin/Barbers'))
const Customers = lazy(() => import('./pages/admin/Customers'))
const Stock = lazy(() => import('./pages/admin/Stock'))

// Área do barbeiro: também sob demanda (a tela de ganhos usa Recharts).
const BarberToday = lazy(() => import('./pages/barber/BarberToday'))
const BarberWeek = lazy(() => import('./pages/barber/BarberWeek'))
const BarberEarnings = lazy(() => import('./pages/barber/BarberEarnings'))
const BarberClients = lazy(() => import('./pages/barber/BarberClients'))

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="agendar" element={<Booking />} />
        <Route path="pagamento/:id" element={<Payment />} />
        <Route path="comprovante/:id" element={<Receipt />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="painel" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="agenda" element={<Agenda />} />
        <Route path="financeiro" element={<Finance />} />
        <Route path="barbeiros" element={<Barbers />} />
        <Route path="clientes" element={<Customers />} />
        <Route path="estoque" element={<Stock />} />
        <Route path="*" element={<AdminNotFound />} />
      </Route>
      <Route path="equipe" element={<BarberLayout />}>
        <Route index element={<BarberToday />} />
        <Route path="semana" element={<BarberWeek />} />
        <Route path="ganhos" element={<BarberEarnings />} />
        <Route path="clientes" element={<BarberClients />} />
        <Route path="*" element={<Navigate to="/equipe" replace />} />
      </Route>
    </Routes>
  )
}
