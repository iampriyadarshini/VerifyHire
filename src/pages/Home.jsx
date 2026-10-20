import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import RiskBadge from '../components/ui/RiskBadge.jsx'

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    ),
    title: 'Deep Analysis',
    description: 'Prepare offer letters, emails, and job URLs for a future verification workflow.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: 'Risk Scoring',
    description: 'Use a clear Safe-to-Critical vocabulary for future verification results.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
    title: 'Community Intel',
    description: 'Share and learn from community reports when the reporting service is connected.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    title: 'Instant Results',
    description: 'Move from submitting an offer to reviewing its report in one focused workflow.',
  },
]

const stats = [
  { value: '6', label: 'Frontend routes' },
  { value: '100%', label: 'Responsive UI' },
  { value: '0', label: 'Backend calls' },
  { value: '1', label: 'Clear safety mission' },
]

function Home() {
  return (
    <div className="bg-grid-pattern">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Gradient Orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyber-teal/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyber-blue/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-28 lg:pb-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-navy-800/60 border border-navy-600/50 text-sm text-gray-300 mb-8">
              <span className="w-2 h-2 rounded-full bg-cyber-teal animate-pulse" />
              Secure verification workspace
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight mb-6">
              <span className="text-white">Don't Get</span>{' '}
              <span className="bg-gradient-to-r from-cyber-teal via-cyan-400 to-cyber-blue bg-clip-text text-transparent">
                Scammed
              </span>
              <br />
              <span className="text-white">Verify Before You</span>{' '}
              <span className="bg-gradient-to-r from-cyber-blue to-cyber-teal bg-clip-text text-transparent">
                Accept
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              VerifyHire gives job seekers a clear place to prepare suspicious offers for review.
              Submit an offer, learn common warning signs, and stay ready for future verification features.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button to="/submit" size="lg" variant="primary">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
                Verify an Offer
              </Button>
              <Button to="/about" size="lg" variant="secondary">
                Learn How It Works
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-navy-700/30 bg-navy-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-cyber-teal mb-1">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            How VerifyHire <span className="text-cyber-teal">Protects</span> You
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Our planned verification workflow will help job seekers examine suspicious offers before accepting them.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyber-teal/20 to-cyber-blue/20 flex items-center justify-center text-cyber-teal mb-4 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Risk Level Demo */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 lg:pb-28">
        <Card className="p-8 lg:p-12" hover={false}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Clear Risk <span className="text-cyber-teal">Categories</span>
              </h2>
              <p className="text-gray-400 mb-6 leading-relaxed">
                The interface uses an easy-to-understand risk vocabulary for future reports.
                No risk score is generated until the verification service is connected.
              </p>
              <Button to="/submit" variant="outline" size="md">
                Try It Now →
              </Button>
            </div>
            <div className="flex flex-wrap gap-3">
              <RiskBadge level="safe" size="lg" />
              <RiskBadge level="low" size="lg" />
              <RiskBadge level="medium" size="lg" />
              <RiskBadge level="high" size="lg" />
              <RiskBadge level="critical" size="lg" />
              <RiskBadge level="unknown" size="lg" />
            </div>
          </div>
        </Card>
      </section>

      {/* CTA Section */}
      <section className="border-t border-navy-700/30 bg-gradient-to-b from-navy-900/50 to-navy-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Received a Suspicious Offer?
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
            Don't take the risk. Submit the details now and prepare them for future verification.
          </p>
          <Button to="/submit" size="lg" variant="primary">
            Submit for Verification
          </Button>
        </div>
      </section>
    </div>
  )
}

export default Home
