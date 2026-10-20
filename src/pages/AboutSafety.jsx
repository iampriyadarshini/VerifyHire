import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'

const howItWorks = [
  {
    step: '01',
    title: 'Submit the Offer',
    description: 'Paste the offer details, sender email, and job URL into our secure form.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
  {
    step: '02',
    title: 'Analysis Ready',
    description: 'Submit offer details securely and prepare them for verification.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
      </svg>
    ),
  },
  {
    step: '03',
    title: 'Risk Assessment',
    description: 'Receive a clear risk rating with detailed explanations of any red flags discovered.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
  {
    step: '04',
    title: 'Take Action',
    description: 'Follow our recommendations to protect yourself and report scams to the community.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
]

const safetyTips = [
  {
    title: 'Never Pay to Get a Job',
    description: 'Legitimate employers never ask candidates to pay for training materials, background checks, or equipment upfront. This is the #1 red flag.',
    icon: '💰',
  },
  {
    title: 'Verify the Sender',
    description: 'Check if the email comes from an official company domain. Be suspicious of Gmail, Yahoo, or Outlook addresses for corporate communication.',
    icon: '📧',
  },
  {
    title: 'Research the Company',
    description: 'Look up the company on LinkedIn, Glassdoor, and official registries. Verify they actually have the job opening posted.',
    icon: '🔍',
  },
  {
    title: 'Guard Your Personal Info',
    description: 'Never share your SSN, bank details, or passport information before signing an official, verified offer letter.',
    icon: '🔒',
  },
  {
    title: 'Watch for Pressure Tactics',
    description: 'Scammers create urgency. Real companies give you time to decide. If they pressure you to accept immediately, it\'s a red flag.',
    icon: '⏰',
  },
  {
    title: 'Trust Your Instincts',
    description: 'If an offer seems too good to be true, it probably is. An unsolicited offer for a job you never applied for deserves extra scrutiny.',
    icon: '🎯',
  },
]

function AboutSafety() {
  return (
    <div className="bg-grid-pattern min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute top-10 right-20 w-64 h-64 bg-cyber-teal/5 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy-800/60 border border-navy-600/50 text-xs text-gray-300 mb-6">
              <svg className="w-3.5 h-3.5 text-cyber-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              Your Safety Matters
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              About <span className="text-cyber-teal">VerifyHire</span> &<br />
              Staying Safe Online
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed">
              VerifyHire is a free, open verification platform that helps job seekers identify fraudulent offers
              before they become victims. Learn how our system works and protect yourself with these safety guidelines.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-10">
          How It <span className="text-cyber-teal">Works</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {howItWorks.map((item) => (
            <Card key={item.step} className="relative group">
              <span className="absolute top-4 right-4 text-3xl font-extrabold text-navy-700/80 group-hover:text-cyber-teal/20 transition-colors duration-300">
                {item.step}
              </span>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyber-teal/20 to-cyber-blue/20 flex items-center justify-center text-cyber-teal mb-4 group-hover:scale-110 transition-transform duration-300">
                {item.icon}
              </div>
              <h3 className="text-white font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Safety Tips */}
      <section className="bg-navy-900/30 border-y border-navy-700/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Safety <span className="text-cyber-teal">Guidelines</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Essential tips to protect yourself from employment scams and fraudulent offers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {safetyTips.map((tip, index) => (
              <Card key={index}>
                <div className="text-3xl mb-3">{tip.icon}</div>
                <h3 className="text-white font-semibold mb-2">{tip.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{tip.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Card className="p-8 lg:p-12" hover={false} glow>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Our <span className="text-cyber-teal">Mission</span>
              </h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                Every year, thousands of job seekers fall victim to fake offers, losing money, personal data,
                and confidence. VerifyHire was built to change that.
              </p>
              <p className="text-gray-400 leading-relaxed mb-6">
                VerifyHire focuses on a clear, accessible experience. Verification services and community
                intelligence help job seekers make safer decisions about suspicious offers.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button to="/submit" variant="primary">
                  Start Verifying
                </Button>
                <Button to="/community" variant="secondary">
                  Join the Community
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Open Source', desc: 'Transparent & community-driven' },
                { label: 'Privacy First', desc: 'No data sold, ever' },
                { label: 'Clear Process', desc: 'Simple offer review workflow' },
                { label: 'Trustworthy Results', desc: 'Reports reflect verified findings' },
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-xl bg-navy-800/40 border border-navy-700/30">
                  <p className="text-white font-semibold text-sm mb-1">{item.label}</p>
                  <p className="text-gray-500 text-xs">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </section>

      {/* What to Do If Scammed */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8">
          If You've Been <span className="text-risk-high">Scammed</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              title: 'Stop All Communication',
              description: 'Immediately cease contact with the scammer. Block their phone numbers, emails, and social media accounts.',
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              ),
            },
            {
              title: 'Document Everything',
              description: 'Save all emails, messages, screenshots, and transaction records. These will be crucial for reporting.',
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              ),
            },
            {
              title: 'Report to Authorities',
              description: 'File a complaint with the FTC (reportfraud.ftc.gov), IC3 (ic3.gov), and your local law enforcement.',
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              ),
            },
            {
              title: 'Protect Your Accounts',
              description: 'Change passwords, enable 2FA, monitor your credit, and consider a fraud alert or credit freeze.',
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              ),
            },
          ].map((item, index) => (
            <Card key={index}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-risk-high/15 border border-risk-high/20 flex items-center justify-center text-risk-high flex-shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">{item.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}

export default AboutSafety
