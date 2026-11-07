import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="mt-auto border-t border-navy-700/40 bg-navy-950/90">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Link to="/" className="font-semibold text-white">Verify<span className="text-cyber-teal">Hire</span></Link>
          <span className="hidden text-gray-600 sm:inline">|</span>
          <span className="text-gray-500">Preliminary, evidence-based offer review</span>
        </div>
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 text-gray-500" aria-label="Footer navigation">
          <Link to="/about" className="transition-colors hover:text-cyber-teal">Safety</Link>
          <Link to="/submit" className="transition-colors hover:text-cyber-teal">Submit Offer</Link>
          <span className="font-mono text-[10px] text-gray-600">v1.0.0</span>
        </nav>
      </div>
    </footer>
  )
}

export default Footer
