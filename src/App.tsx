import { lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import AdminLayout from './components/admin/AdminLayout'
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
    </Routes>
  )
}
