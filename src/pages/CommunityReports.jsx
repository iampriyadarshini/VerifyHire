import { useState } from 'react'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'

const filterOptions = ['all', 'safe', 'low', 'medium', 'high', 'critical']

function CommunityReports() {
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="bg-grid-pattern min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              Community <span className="text-cyber-teal">Reports</span>
            </h1>
            <p className="text-gray-400">
              Browse reports submitted by the community when the reporting service is available.
            </p>
          </div>
          <Button to="/submit" variant="primary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Report a Scam
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="search"
              placeholder="Search community reports..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-navy-800/60 border border-navy-600/50 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyber-teal/40 focus:border-cyber-teal/60 transition-all duration-200"
            />
          </div>
          <div className="flex flex-wrap gap-2" aria-label="Risk filters">
            {filterOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setActiveFilter(option)}
                className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all duration-200 cursor-pointer ${
                  activeFilter === option
                    ? 'bg-cyber-teal/20 text-cyber-teal border border-cyber-teal/30'
                    : 'bg-navy-800/40 text-gray-400 border border-navy-600/30 hover:border-navy-500 hover:text-gray-300'
                }`}
              >
                {option === 'all' ? 'All Reports' : option}
              </button>
            ))}
          </div>
        </div>

        <Card className="text-center py-14" hover={false}>
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-navy-800/80 border border-navy-600/50 flex items-center justify-center">
            <svg className="w-8 h-8 text-cyber-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">No community reports yet</h2>
          <p className="text-gray-400 max-w-xl mx-auto mb-3 leading-relaxed">
            Community reports will appear here once verified submissions are available.
          </p>
          <p className="text-gray-500 text-sm mb-8">
            {searchQuery || activeFilter !== 'all'
              ? 'Search and filters will apply once reports are available.'
              : 'Be the first to prepare an offer for a future community report.'}
          </p>
          <Button to="/submit" variant="outline">Submit an Offer</Button>
        </Card>
      </div>
    </div>
  )
}

export default CommunityReports
