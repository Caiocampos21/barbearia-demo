import { Route, Routes } from 'react-router-dom'
import AdminLayout from './components/admin/AdminLayout'
import Layout from './components/layout/Layout'
import Booking from './pages/Booking'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import Payment from './pages/Payment'
import Receipt from './pages/Receipt'
import Dashboard from './pages/admin/Dashboard'
import Barbers from './pages/admin/Barbers'
import Customers from './pages/admin/Customers'
import Finance from './pages/admin/Finance'
import Stock from './pages/admin/Stock'

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
        <Route path="financeiro" element={<Finance />} />
        <Route path="barbeiros" element={<Barbers />} />
        <Route path="clientes" element={<Customers />} />
        <Route path="estoque" element={<Stock />} />
      </Route>
    </Routes>
  )
}
