import { Route, Routes } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Booking from './pages/Booking'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import Payment from './pages/Payment'
import Receipt from './pages/Receipt'

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
    </Routes>
  )
}
