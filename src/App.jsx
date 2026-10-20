import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/common/Navbar.jsx'
import Footer from './components/common/Footer.jsx'
import Home from './pages/Home.jsx'
import SubmitOffer from './pages/SubmitOffer.jsx'
import AnalysisReport from './pages/AnalysisReport.jsx'
import Dashboard from './pages/Dashboard.jsx'
import CommunityReports from './pages/CommunityReports.jsx'
import AboutSafety from './pages/AboutSafety.jsx'

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/submit" element={<SubmitOffer />} />
            <Route path="/report" element={<AnalysisReport />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/community" element={<CommunityReports />} />
            <Route path="/about" element={<AboutSafety />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
