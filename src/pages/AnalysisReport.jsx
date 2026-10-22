import { useState } from 'react'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import RiskBadge from '../components/ui/RiskBadge.jsx'

const categoryLevel = {
  'High Risk': 'high',
  'Needs Review': 'needs-review',
  Unverified: 'unverified',
  'Lower Observed Risk': 'lower-observed-risk',
}

const domainLabels = {
  company_website_domain: 'Company website',
  job_url_domain: 'Job URL',
  sender_email_domain: 'Sender email',
}

function AnalysisReport() {
  const [offer] = useState(() => {
    const storedOffer = sessionStorage.getItem('verifyhire.latestOffer')
    if (!storedOffer) {
      return null
    }
    try {
      return JSON.parse(storedOffer)
    } catch (error) {
      console.error('[VerifyHire] Could not read the saved offer report.', error)
      return null
    }
  })

  if (!offer?.assessment) {
    return (
      <div className="bg-grid-pattern min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Analysis <span className="text-cyber-teal">Report</span>
          </h1>
          <p className="text-gray-400 mb-8">Preliminary evidence-based assessment for submitted offers.</p>
          <Card className="p-12 lg:p-16 text-center" hover={false}>
            <h2 className="text-2xl font-bold text-white mb-3">No Report Available</h2>
            <p className="text-gray-400 max-w-lg mx-auto mb-8">
              Submit an offer to compare its message, domains, and available company evidence.
            </p>
            <Button to="/submit" variant="primary">Submit an Offer</Button>
          </Card>
        </div>
      </div>
    )
  }

  const { assessment } = offer
  const domains = assessment.domain_comparison || {}

  return (
    <div className="bg-grid-pattern min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <p className="text-cyber-teal text-sm font-mono mb-2">Offer ID: {offer.id}</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              Analysis <span className="text-cyber-teal">Report</span>
            </h1>
            <p className="text-gray-400">
              Preliminary findings for {offer.job_title} at {offer.company_name}.
            </p>
          </div>
          <RiskBadge level={categoryLevel[assessment.category] || 'unknown'} label={assessment.category} size="lg" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card className="lg:col-span-2" hover={false}>
            <h2 className="text-xl font-semibold text-white mb-3">Assessment summary</h2>
            <p className="text-gray-300 leading-relaxed">{assessment.explanation}</p>
            <p className="text-gray-500 text-sm mt-4">
              This is a preliminary assessment, not a guarantee of authenticity.
            </p>
          </Card>
          <Card hover={false}>
            <h2 className="text-lg font-semibold text-white mb-4">Domain comparison</h2>
            <div className="space-y-3">
              {Object.entries(domainLabels).map(([key, label]) => (
                <div key={key} className="flex items-start justify-between gap-3 text-sm">
                  <span className="text-gray-400">{label}</span>
                  <span className="text-white font-mono text-right break-all">{domains[key] || 'Not supplied'}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card hover={false}>
            <h2 className="text-xl font-semibold text-white mb-4">Checks completed</h2>
            <div className="space-y-3">
              {assessment.checks.map((check) => (
                <div key={check.check_id} className="rounded-xl bg-navy-800/40 border border-navy-700/40 p-3">
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <span className="text-white text-sm font-medium">{check.label}</span>
                    <span className={`text-xs ${check.status === 'completed' ? 'text-cyber-teal' : 'text-gray-500'}`}>
                      {check.status === 'completed' ? 'Completed' : 'Unavailable'}
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs leading-relaxed">{check.detail}</p>
                </div>
              ))}
            </div>
          </Card>
          <Card hover={false}>
            <h2 className="text-xl font-semibold text-white mb-4">Recommended next actions</h2>
            <ul className="space-y-3">
              {assessment.recommended_actions.map((action) => (
                <li key={action} className="flex gap-2 text-gray-300 text-sm leading-relaxed">
                  <span className="text-cyber-teal">→</span>
                  {action}
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <Card hover={false} className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Warning signs and evidence</h2>
          {assessment.findings.length === 0 ? (
            <p className="text-gray-400">No warning signs were identified in the supplied information.</p>
          ) : (
            <div className="space-y-4">
              {assessment.findings.map((finding) => (
                <div key={finding.rule_id} className="rounded-xl border border-navy-700/50 bg-navy-800/30 p-4">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h3 className="text-white font-semibold">{finding.title}</h3>
                    <span className="text-xs font-mono text-gray-500">{finding.rule_id}</span>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed mb-2">{finding.explanation}</p>
                  <p className="text-gray-500 text-xs mb-2">Evidence: {finding.evidence}</p>
                  {finding.recommended_action && (
                    <p className="text-cyber-teal text-sm">Next step: {finding.recommended_action}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card hover={false} className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Experimental ML signal</h2>
          {!assessment.ml_assessment || assessment.ml_assessment.status === 'unavailable' ? (
            <p className="text-gray-400 text-sm">
              The optional ML classifier is not trained or is unavailable. Rule-based analysis and evidence findings remain active.
            </p>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className="text-cyber-teal font-medium">
                  {assessment.ml_assessment.label === 'suspicious' ? 'Suspicious text pattern' : 'No strong suspicious text pattern'}
                </span>
                <span className="text-gray-500 text-xs font-mono">
                  Model {assessment.ml_assessment.model_version}
                </span>
              </div>
              <p className="text-gray-300 text-sm mb-3">{assessment.ml_assessment.explanation}</p>
              {assessment.ml_assessment.influential_terms.length > 0 && (
                <p className="text-gray-400 text-sm mb-3">
                  Influential text indicators: {assessment.ml_assessment.influential_terms.join(', ')}
                </p>
              )}
              <p className="text-gray-500 text-xs">{assessment.ml_assessment.limitation}</p>
            </>
          )}
          <p className="text-gray-500 text-xs mt-3">
            This experimental signal complements the independently evaluated rules and evidence; it is not a verified fraud probability.
          </p>
        </Card>

        {offer.attachment && (
          <Card hover={false} className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Uploaded evidence</h2>
            <p className="text-gray-400 text-sm mb-3">
              OCR status: <span className="text-white">{offer.attachment.ocr.status}</span>
              {' '}({offer.attachment.image.width} × {offer.attachment.image.height})
            </p>
            <p className="text-cyber-teal text-sm mb-3">
              Evidence assessment: {offer.attachment.assessment.category}
            </p>
            {offer.attachment.assessment.findings.length > 0 && (
              <div className="space-y-2 mb-4">
                {offer.attachment.assessment.findings.map((finding) => (
                  <div key={finding.rule_id} className="rounded-lg bg-navy-800/40 p-3 text-sm">
                    <p className="text-white font-medium">{finding.title}</p>
                    <p className="text-gray-400 mt-1">{finding.explanation}</p>
                    <p className="text-gray-500 text-xs mt-1">Source: {finding.source}</p>
                    {finding.recommended_action && (
                      <p className="text-cyber-teal text-xs mt-1">Recommendation: {finding.recommended_action}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div className="rounded-xl bg-navy-800/40 border border-navy-700/40 p-4 mb-4">
              <h3 className="text-white font-medium mb-2">Extracted text</h3>
              <p className="text-gray-300 text-sm whitespace-pre-wrap">
                {offer.attachment.ocr.text || 'No readable text was extracted. The system did not invent a transcription.'}
              </p>
            </div>
            <h3 className="text-white font-medium mb-2">QR code findings</h3>
            {offer.attachment.qr_codes.length === 0 ? (
              <p className="text-gray-400 text-sm">No readable QR code was detected.</p>
            ) : (
              <div className="space-y-2">
                {offer.attachment.qr_codes.map((qr) => (
                  <div key={qr.content} className="rounded-xl border border-risk-medium/40 bg-risk-medium/10 p-3 text-sm">
                    <p className="text-white break-all">{qr.content}</p>
                    <p className="text-risk-medium mt-1">{qr.warning}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {offer.emailEvidence && (
          <Card hover={false} className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Email evidence</h2>
            <p className="text-cyber-teal text-sm mb-3">
              Evidence assessment: {offer.emailEvidence.assessment.category}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-sm">
              {[
                ['From', offer.emailEvidence.metadata.from],
                ['Reply-To', offer.emailEvidence.metadata.reply_to],
                ['Return-Path', offer.emailEvidence.metadata.return_path],
                ['Received headers', offer.emailEvidence.metadata.received_count],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg bg-navy-800/40 p-3">
                  <p className="text-gray-500 text-xs">{label}</p>
                  <p className="text-gray-300 break-all">{value || 'Not supplied'}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
              {['spf', 'dkim', 'dmarc'].map((name) => (
                <div key={name} className="rounded-lg bg-navy-800/40 p-3">
                  <p className="text-gray-500 text-xs uppercase">{name}</p>
                  <p className="text-gray-300">{offer.emailEvidence.authentication[name]?.status || 'missing'}</p>
                </div>
              ))}
            </div>
            {offer.emailEvidence.assessment.findings.length > 0 && (
              <div className="space-y-2">
                {offer.emailEvidence.assessment.findings.map((finding) => (
                  <div key={finding.rule_id} className="rounded-lg bg-navy-800/40 p-3 text-sm">
                    <p className="text-white font-medium">{finding.title}</p>
                    <p className="text-gray-400 mt-1">{finding.explanation}</p>
                    <p className="text-gray-500 text-xs mt-1">Source: {finding.source}</p>
                    {finding.recommended_action && (
                      <p className="text-cyber-teal text-xs mt-1">Recommendation: {finding.recommended_action}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
            <p className="text-gray-500 text-xs mt-4">
              Authentication headers are user-supplied and may be forged. Missing evidence is reported as unknown, not failed.
            </p>
          </Card>
        )}

        <Card hover={false}>
          <h2 className="text-xl font-semibold text-white mb-4">Limitations and uncertainty</h2>
          <ul className="space-y-2">
            {assessment.limitations.map((limitation) => (
              <li key={limitation} className="text-gray-400 text-sm leading-relaxed">• {limitation}</li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  )
}

export default AnalysisReport
