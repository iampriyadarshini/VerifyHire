import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import { chatWithReportAssistant, fetchAnalysisReport } from '../services/api.js'

const riskStyles = {
  'Low Risk': 'border-cyber-teal/40 bg-cyber-teal/10 text-cyber-teal',
  'Moderate Risk': 'border-risk-medium/40 bg-risk-medium/10 text-risk-medium',
  'High Risk': 'border-risk-high/40 bg-risk-high/10 text-risk-high',
  'Critical Risk': 'border-risk-high/60 bg-risk-high/20 text-risk-high',
}

const severityStyles = {
  high: 'border-risk-high/40 bg-risk-high/10',
  medium: 'border-risk-medium/40 bg-risk-medium/10',
  low: 'border-cyber-teal/30 bg-cyber-teal/[0.06]',
  info: 'border-navy-700 bg-navy-800/40',
}

function Icon({ name, className = 'h-5 w-5' }) {
  const paths = {
    shield: <><path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.3 7.5 9.5 4.3-1.2 7.5-4.9 7.5-9.5V6L12 3Z" /><path d="m8.8 12 2.1 2.1 4.3-4.3" /></>,
    brain: <><path d="M9.5 4.5A3 3 0 0 0 6 7.3 3 3 0 0 0 4 12a3 3 0 0 0 2 4.7A3 3 0 0 0 9.5 19" /><path d="M14.5 4.5A3 3 0 0 1 18 7.3 3 3 0 0 1 20 12a3 3 0 0 1-2 4.7 3 3 0 0 1-3.5 2.3M9 4v16M15 4v16M9 9h6M9 15h6" /></>,
    alert: <><path d="m12 3 9 17H3L12 3Z" /><path d="M12 9v4M12 16h.01" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M8 13h8M8 17h6" /></>,
  }
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

function SectionTitle({ eyebrow, title, icon }) {
  return <div className="mb-4 flex items-center gap-3"><span className="rounded-lg border border-cyber-teal/20 bg-cyber-teal/10 p-2 text-cyber-teal"><Icon name={icon} className="h-4 w-4" /></span><div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyber-teal">{eyebrow}</p><h2 className="text-lg font-semibold text-white">{title}</h2></div></div>
}

function FindingCard({ finding }) {
  const severity = finding.severity || 'info'
  return <details className={`group rounded-xl border p-4 ${severityStyles[severity] || severityStyles.info}`}><summary className="flex cursor-pointer list-none items-start justify-between gap-3"><span className="flex min-w-0 items-start gap-2"><Icon name="alert" className={`mt-0.5 h-4 w-4 shrink-0 ${severity === 'high' ? 'text-risk-high' : severity === 'medium' ? 'text-risk-medium' : 'text-cyber-teal'}`} /><span><span className="block text-sm font-semibold text-white">{finding.title}</span><span className="mt-1 block text-[10px] uppercase tracking-wide text-gray-500">{severity} severity</span></span></span><span className="text-gray-500 transition-transform group-open:rotate-180">⌄</span></summary><div className="mt-3 space-y-2 border-t border-white/10 pt-3 text-xs leading-relaxed"><p className="text-gray-300"><span className="text-gray-500">Evidence:</span> {finding.evidence}</p><p className="text-gray-400">{finding.explanation}</p>{finding.recommended_action && <p className="text-cyber-teal"><span className="text-gray-400">Next step:</span> {finding.recommended_action}</p>}</div></details>
}

function AssistantCard({ verification, companyName, senderEmail, reportId }) {
  const result = verification || {
    status: 'UNABLE TO VERIFY',
    company_name: companyName,
    sender_email: senderEmail,
    explanation: 'The available local evidence is insufficient to independently establish that the sender represents the claimed company.',
    evidence: ['No saved company-and-sender verification result is available.'],
    recommended_action: 'Verify the recruiter through contact information obtained independently from the company website.',
  }
  const statusClass = result.status === 'VERIFIED' ? 'border-cyber-teal/40 bg-cyber-teal/10 text-cyber-teal' : result.status === 'MISMATCH' ? 'border-risk-high/40 bg-risk-high/10 text-risk-high' : 'border-risk-medium/40 bg-risk-medium/10 text-risk-medium'
  const [messages, setMessages] = useState([{ role: 'assistant', content: result.explanation }])
  const [question, setQuestion] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState('')
  const sendMessage = async (event) => {
    event.preventDefault()
    const trimmed = question.trim()
    if (!trimmed || isSending) return
    setQuestion('')
    setError('')
    setMessages((current) => [...current, { role: 'user', content: trimmed }])
    setIsSending(true)
    try {
      const response = await chatWithReportAssistant(reportId, trimmed)
      setMessages((current) => [...current, { role: 'assistant', content: response.answer }])
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'The AI Assistant is unavailable. Check the backend configuration and try again.')
    } finally {
      setIsSending(false)
    }
  }
  return <Card hover={false} className="p-5 print:border-gray-300 print:bg-white"><SectionTitle eyebrow="VerifyHire AI Assistant" title="Company & Sender Identity Analysis" icon="brain" /><div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-start"><div className={`flex h-24 w-24 items-center justify-center rounded-full border-4 text-center text-xs font-bold tracking-wide ${statusClass}`}>{result.status}</div><div><div className="grid gap-2 text-sm sm:grid-cols-2"><p className="truncate text-gray-300"><span className="block text-[10px] uppercase text-gray-500">Company</span>{result.company_name}</p><p className="truncate text-gray-300"><span className="block text-[10px] uppercase text-gray-500">Sender</span>{result.sender_email}</p></div><p className="mt-4 text-sm leading-relaxed text-gray-300">{result.explanation}</p><div className="mt-3 flex flex-wrap gap-2">{(result.evidence || []).map((item, index) => <span key={`${item}-${index}`} className="rounded-lg border border-navy-700 bg-navy-800/50 px-2.5 py-1.5 text-xs text-gray-400">{item}</span>)}</div><p className="mt-4 text-xs leading-relaxed text-cyber-teal"><span className="text-gray-400">Recommended action: </span>{result.recommended_action}</p></div></div><div className="mt-5 rounded-xl border border-navy-700/70 bg-navy-950/40 p-3"><div className="mb-3 flex items-center gap-2 text-xs font-semibold text-cyber-teal"><Icon name="brain" className="h-4 w-4" /> Ask about this report</div><div className="max-h-64 space-y-2 overflow-y-auto pr-1">{messages.map((message, index) => <div key={`${message.role}-${index}`} className={`rounded-lg p-3 text-xs leading-relaxed ${message.role === 'user' ? 'ml-6 bg-cyber-teal/10 text-cyber-teal' : 'mr-6 bg-navy-800/60 text-gray-300'}`}><span className="mb-1 block text-[10px] uppercase tracking-wide text-gray-500">{message.role === 'user' ? 'You' : 'VerifyHire AI Assistant'}</span>{message.content}</div>)}</div><form onSubmit={sendMessage} className="mt-3 flex gap-2"><input value={question} onChange={(event) => setQuestion(event.target.value)} maxLength={2000} placeholder="Why is this sender not verified?" className="min-w-0 flex-1 rounded-lg border border-navy-700 bg-navy-900 px-3 py-2 text-xs text-white placeholder:text-gray-500 focus:border-cyber-teal focus:outline-none" disabled={isSending} /><button type="submit" className="rounded-lg bg-cyber-teal px-3 py-2 text-xs font-semibold text-navy-950 disabled:cursor-not-allowed disabled:opacity-50" disabled={!question.trim() || isSending}>{isSending ? 'Sending...' : 'Send'}</button></form>{error && <p className="mt-2 text-xs text-risk-medium" role="alert">{error}</p>}</div></Card>
}

function AnalysisReport() {
  const { offerId } = useParams()
  const [offer, setOffer] = useState(() => {
    const stored = sessionStorage.getItem('verifyhire.latestOffer')
    if (!stored) return null
    try { return JSON.parse(stored) } catch (error) { console.error('[VerifyHire] Could not read the saved offer report.', error); return null }
  })
  const [isLoading, setIsLoading] = useState(Boolean(offerId))
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    if (!offerId) return undefined
    let active = true
    fetchAnalysisReport(offerId).then((report) => {
      if (active) {
        setOffer(report)
        sessionStorage.setItem('verifyhire.latestOffer', JSON.stringify(report))
      }
    }).catch((error) => {
      if (active) setLoadError(error.response?.data?.detail || 'The report could not be loaded.')
    }).finally(() => { if (active) setIsLoading(false) })
    return () => { active = false }
  }, [offerId])

  if (isLoading) return <ReportState title="Loading verification report" detail="Retrieving the saved assessment." />
  if (!offer?.assessment || loadError) return <ReportState title={loadError ? 'Report unavailable' : 'No report available'} detail={loadError || 'Submit an offer to generate an assessment.'} action />

  const { assessment } = offer
  const findings = assessment.findings || []
  const attachment = offer.attachment
  const emailEvidence = offer.emailEvidence
  const score = Number.isFinite(assessment.risk_score) ? assessment.risk_score : 0
  const riskLevel = assessment.risk_level || 'Low Risk'
  const firstAction = assessment.recommended_actions?.[0]
  const verification = assessment.company_sender_verification

  return <div className="bg-grid-pattern min-h-screen print:bg-white print:text-black"><div className="mx-auto max-w-5xl space-y-5 px-4 py-5 sm:px-6 lg:py-8">
    <section className="relative overflow-hidden rounded-2xl border border-cyber-teal/20 bg-navy-900/90 p-5 shadow-[0_0_50px_rgba(0,229,204,0.08)] print:border-gray-300 print:bg-white print:shadow-none">
      <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-cyber-teal/10 blur-3xl" /><div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center"><div><p className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyber-teal"><Icon name="shield" className="h-4 w-4" /> VerifyHire assessment</p><h1 className="text-2xl font-bold text-white print:text-black sm:text-3xl">{offer.company_name}</h1><p className="mt-2 text-sm text-gray-400">{offer.job_title}</p><div className="mt-4 grid gap-2 text-xs sm:grid-cols-2"><p className="truncate text-gray-300"><span className="block text-[10px] uppercase text-gray-600">Sender email</span>{offer.sender_email}</p><p className="truncate text-gray-300"><span className="block text-[10px] uppercase text-gray-600">Report status</span>Preliminary assessment</p></div></div><div className="text-center lg:min-w-[180px]"><div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full border-[10px] border-cyber-teal/25 bg-navy-800/70 text-3xl font-bold text-white print:text-black" style={{ background: `conic-gradient(#00e5cc ${score * 3.6}deg, rgba(30, 48, 73, .8) 0deg)` }}><span className="flex h-24 w-24 items-center justify-center rounded-full bg-navy-900 print:bg-white">{score}%</span></div><span className={`mt-3 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${riskStyles[riskLevel] || riskStyles['Low Risk']}`}>{riskLevel}</span><p className="mt-2 text-[11px] text-gray-500">Observed risk from actual findings</p></div></div><p className="relative mt-5 border-l-2 border-cyber-teal pl-3 text-xs leading-relaxed text-gray-500">{assessment.explanation} This is preliminary and not a guarantee of authenticity.</p>
    </section>

    <AssistantCard verification={verification} companyName={offer.company_name} senderEmail={offer.sender_email} reportId={offer.id} />

    <section><SectionTitle eyebrow="Why review is needed" title="What we found" icon="alert" />{findings.length ? <div className="space-y-3">{findings.filter((finding) => finding.severity !== 'info').slice(0, 5).map((finding, index) => <FindingCard key={`${finding.rule_id}-${index}`} finding={finding} />)}</div> : <Card hover={false} className="p-5 print:border-gray-300 print:bg-white"><p className="text-sm text-gray-400">No material warning findings were identified in the information supplied.</p></Card>}</section>

    <section className="grid gap-5 lg:grid-cols-2"><Card hover={false} className="p-5 print:border-gray-300 print:bg-white"><SectionTitle eyebrow="Your next step" title="Final recommendation" icon="shield" /><div className="rounded-xl border border-cyber-teal/25 bg-cyber-teal/10 p-4"><p className="text-sm font-semibold leading-relaxed text-cyber-teal">{firstAction || 'Verify the employer through an independently obtained contact channel before proceeding.'}</p></div><p className="mt-3 text-xs leading-relaxed text-gray-500">Do not treat this report as proof that an offer is genuine or fraudulent.</p></Card>{attachment && <Card hover={false} className="p-5 print:border-gray-300 print:bg-white"><SectionTitle eyebrow="Uploaded evidence" title="Screenshot analysis" icon="file" /><div className="grid grid-cols-3 gap-2 text-xs"><div className="rounded-lg bg-navy-800/40 p-3"><span className="block text-[10px] uppercase text-gray-500">OCR</span>{attachment.ocr.status}</div><div className="rounded-lg bg-navy-800/40 p-3"><span className="block text-[10px] uppercase text-gray-500">Image</span>{attachment.image.width} × {attachment.image.height}</div><div className="rounded-lg bg-navy-800/40 p-3"><span className="block text-[10px] uppercase text-gray-500">QR</span>{attachment.qr_codes.length ? `${attachment.qr_codes.length} found` : 'None found'}</div></div><details className="mt-3 border-t border-navy-700/50 pt-3"><summary className="cursor-pointer text-xs text-cyber-teal">View evidence details</summary><p className="mt-3 whitespace-pre-wrap text-xs leading-relaxed text-gray-400">{attachment.ocr.text || 'No readable text was extracted.'}</p></details></Card>}</section>

    {emailEvidence && <Card hover={false} className="p-5 print:border-gray-300 print:bg-white"><SectionTitle eyebrow="Uploaded evidence" title="Email analysis" icon="mail" /><p className="text-sm text-gray-300">Email evidence was processed. Missing authentication information is not treated as a failure.</p><details className="mt-4 border-t border-navy-700/50 pt-3"><summary className="cursor-pointer text-xs text-cyber-teal">View technical email details</summary><div className="mt-3 grid gap-2 text-xs text-gray-400 sm:grid-cols-3">{Object.entries(emailEvidence.authentication || {}).map(([name, value]) => <p key={name} className="rounded-lg bg-navy-800/40 p-3"><span className="block uppercase text-gray-500">{name}</span>{value.status}</p>)}</div></details></Card>}

    <details className="rounded-xl border border-navy-700/70 bg-navy-900/60 p-5 print:border-gray-300 print:bg-white"><summary className="cursor-pointer text-sm font-semibold text-cyber-teal">View technical report details</summary><div className="mt-4 space-y-4 text-xs leading-relaxed text-gray-400"><p>{assessment.score_breakdown?.explanation}</p><p>Observed category: {assessment.category}. Checks completed: {assessment.score_breakdown?.passed_checks ?? 0}. Checks unavailable or unverified: {assessment.score_breakdown?.unverified_checks ?? 0}.</p>{assessment.limitations?.map((limitation) => <p key={limitation}>• {limitation}</p>)}</div></details>
  </div></div>
}

function ReportState({ title, detail, action = false }) {
  return <div className="bg-grid-pattern min-h-screen"><div className="mx-auto max-w-xl px-4 py-16"><Card className="p-10 text-center" hover={false}><p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-cyber-teal">Report status</p><h1 className="text-2xl font-bold text-white">{title}</h1><p className="mt-3 text-sm text-gray-400">{detail}</p>{action && <Button to="/submit" variant="primary" className="mt-7">Submit an Offer</Button>}</Card></div></div>
}

export default AnalysisReport
