import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'

function AnalysisReport() {
  return (
    <div className="bg-grid-pattern min-h-screen">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Analysis <span className="text-cyber-teal">Report</span>
        </h1>
        <p className="text-gray-400">
          Detailed verification results and risk assessment for submitted offers.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Empty State */}
        <Card className="p-12 lg:p-16" hover={false}>
          <div className="text-center max-w-lg mx-auto">
            {/* Animated Icon */}
            <div className="relative w-28 h-28 mx-auto mb-8">
              {/* Outer ring */}
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-navy-600 animate-[spin_20s_linear_infinite]" />
              {/* Middle ring */}
              <div className="absolute inset-3 rounded-full border border-navy-600/50 animate-[spin_15s_linear_infinite_reverse]" />
              {/* Center icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-2xl bg-navy-800/80 border border-navy-600/50 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-3">No Report Available</h2>
            <p className="text-gray-400 mb-2 leading-relaxed">
              There is no analysis report to display yet. Submit a job offer first, and your detailed verification report will appear here.
            </p>
            <p className="text-gray-500 text-sm mb-8">
              Submit an offer to begin. Detailed results will appear once the verification service has processed it.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button to="/submit" variant="primary">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Submit an Offer
              </Button>
              <Button to="/dashboard" variant="secondary">
                View Dashboard
              </Button>
            </div>
          </div>
        </Card>

        {/* What You'll See Section */}
        <div className="mt-12">
          <h3 className="text-xl font-semibold text-white mb-6">
            What a Report Will <span className="text-cyber-teal">Include</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                ),
                title: 'Risk Score & Level',
                description: 'An overall risk score from 0–100 with a clear Safe/Low/Medium/High/Critical rating.',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                ),
                title: 'Red Flag Breakdown',
                description: 'Detailed list of specific red flags found in the offer, with explanations for each.',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
                ),
                title: 'Recommendations',
                description: 'Actionable next steps — whether to proceed, investigate further, or avoid entirely.',
              },
            ].map((item, index) => (
              <Card key={index}>
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyber-teal/20 to-cyber-blue/20 flex items-center justify-center text-cyber-teal mb-3">
                  {item.icon}
                </div>
                <h4 className="text-white font-semibold mb-2">{item.title}</h4>
                <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalysisReport
