import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'

function Dashboard() {
  return (
    <div className="bg-grid-pattern min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              <span className="text-cyber-teal">Dashboard</span>
            </h1>
            <p className="text-gray-400">
              Your verification activity will appear here once the service is connected.
            </p>
          </div>
          <Button to="/submit" variant="primary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Submission
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <Card className="text-center p-10 lg:p-16" hover={false}>
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-navy-800/80 border border-navy-600/50 flex items-center justify-center">
            <svg className="w-8 h-8 text-cyber-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">No verification activity yet</h2>
          <p className="text-gray-400 max-w-xl mx-auto mb-8 leading-relaxed">
            Statistics, activity, and risk distributions will appear after verified submissions are processed.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button to="/submit" variant="primary">Submit an Offer</Button>
            <Button to="/report" variant="secondary">View Analysis Report</Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard
