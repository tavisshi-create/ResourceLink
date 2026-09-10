import { Routes, Route } from 'react-router-dom'
import Navbar from './components/ui/Navbar'

import HomePage from './pages/HomePage'
import Discover from './pages/Discover'
import AIMatch from './pages/AIMatch'
import PaymentTrust from './pages/PaymentTrust'
import SmartAccess from './pages/SmartAccess'
import PredictiveTracking from './pages/PredictiveTracking'
import GetVerified from './pages/GetVerified'

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/ai-match" element={<AIMatch />} />
        <Route path="/payment-trust" element={<PaymentTrust />} />
        <Route path="/smart-access" element={<SmartAccess />} />
        <Route path="/predictive-tracking" element={<PredictiveTracking />} />
        <Route path="/get-verified" element={<GetVerified />} />
      </Routes>
    </>
  )
}

export default App
