import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="bg-navy-900/50 border-t border-navy-700/30 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyber-teal to-cyber-blue flex items-center justify-center">
                <svg className="w-4 h-4 text-navy-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <span className="text-lg font-bold">
                <span className="text-white">Verify</span>
                <span className="text-cyber-teal">Hire</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Helping job seekers prepare for safer decisions with a clear verification workflow.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Navigation</h3>
            <ul className="space-y-2.5">
              {[
                { name: 'Home', path: '/' },
                { name: 'Submit Offer', path: '/submit' },
                { name: 'Dashboard', path: '/dashboard' },
                { name: 'Community', path: '/community' },
              ].map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-gray-400 hover:text-cyber-teal text-sm transition-colors duration-200">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Resources</h3>
            <ul className="space-y-2.5">
              {[
                { name: 'About & Safety', path: '/about' },
                { name: 'How It Works', path: '/about' },
                { name: 'Safety Tips', path: '/about' },
                { name: 'Report Scam', path: '/submit' },
              ].map((link, index) => (
                <li key={index}>
                  <Link to={link.path} className="text-gray-400 hover:text-cyber-teal text-sm transition-colors duration-200">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Status */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">System Status</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyber-teal animate-pulse" />
                <span className="text-gray-400 text-sm">Frontend shell</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-risk-medium animate-pulse" />
                <span className="text-gray-400 text-sm">Backend integration pending</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-risk-medium animate-pulse" />
                <span className="text-gray-400 text-sm">Analysis service pending</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-navy-700/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} VerifyHire. Built to protect job seekers.
          </p>
          <div className="flex items-center gap-1 text-gray-500 text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-cyber-teal animate-pulse" />
            <span>v1.0.0 — Verification workspace</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
