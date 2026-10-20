import { useState } from 'react'
import Button from '../components/ui/Button.jsx'
import FormInput from '../components/ui/FormInput.jsx'
import Card from '../components/ui/Card.jsx'
import { submitOfferForAnalysis } from '../services/api.js'

const initialFormState = {
  companyName: '',
  jobTitle: '',
  offerMessage: '',
  senderEmail: '',
  jobUrl: '',
  screenshot: null,
}

function validateForm(formData) {
  const errors = {}

  if (!formData.companyName.trim()) {
    errors.companyName = 'Company name is required.'
  } else if (formData.companyName.trim().length < 2) {
    errors.companyName = 'Company name must be at least 2 characters.'
  }

  if (!formData.jobTitle.trim()) {
    errors.jobTitle = 'Job title is required.'
  }

  if (!formData.offerMessage.trim()) {
    errors.offerMessage = 'Please paste the offer message or description.'
  } else if (formData.offerMessage.trim().length < 20) {
    errors.offerMessage = 'Offer message must be at least 20 characters for accurate analysis.'
  }

  if (!formData.senderEmail.trim()) {
    errors.senderEmail = 'Sender email is required.'
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.senderEmail.trim())) {
      errors.senderEmail = 'Please enter a valid email address.'
    }
  }

  if (formData.jobUrl.trim()) {
    try {
      new URL(formData.jobUrl.trim())
    } catch {
      errors.jobUrl = 'Please enter a valid URL (e.g., https://example.com/job).'
    }
  }

  if (formData.screenshot) {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
    if (!allowedTypes.includes(formData.screenshot.type)) {
      errors.screenshot = 'Only PNG, JPG, and WebP images are allowed.'
    } else if (formData.screenshot.size > 5 * 1024 * 1024) {
      errors.screenshot = 'File size must be under 5MB.'
    }
  }

  return errors
}

function SubmitOffer() {
  const [formData, setFormData] = useState(initialFormState)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [fileName, setFileName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [offerId, setOfferId] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error for this field on change
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0] || null
    setFormData((prev) => ({ ...prev, screenshot: file }))
    setFileName(file ? file.name : '')
    if (errors.screenshot) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next.screenshot
        return next
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validateForm(formData)

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsSubmitting(true)
    setSubmitError('')

    try {
      const response = await submitOfferForAnalysis({
        company_name: formData.companyName.trim(),
        job_title: formData.jobTitle.trim(),
        message: formData.offerMessage.trim(),
        sender_email: formData.senderEmail.trim(),
        submitted_url: formData.jobUrl.trim() || null,
      })
      setOfferId(response.id)
      setSubmitted(true)
    } catch (error) {
      const message = error.response?.data?.detail
      setSubmitError(
        Array.isArray(message)
          ? 'Please review the offer details and try again.'
          : message || 'We could not submit this offer. Please check that the backend is running and try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setFormData(initialFormState)
    setErrors({})
    setSubmitted(false)
    setFileName('')
    setSubmitError('')
    setOfferId('')
  }

  if (submitted) {
    return (
      <div className="bg-grid-pattern min-h-screen">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <Card className="text-center p-10" glow>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-cyber-teal/20 to-cyber-blue/20 flex items-center justify-center animate-pulse-ring">
              <svg className="w-10 h-10 text-cyber-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Submission Received</h2>
            <p className="text-gray-400 mb-2">
              Your offer details have been captured successfully.
            </p>
            <p className="text-gray-500 text-sm mb-8">
              Your submission is stored for this backend session. No verification analysis has been run yet.
            </p>
            <p className="text-cyber-teal text-sm font-mono mb-8">
              Offer ID: {offerId}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button to="/report" variant="secondary">
                View Report Page
              </Button>
              <Button onClick={handleReset} variant="outline">
                Submit Another
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-grid-pattern min-h-screen">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">
        <div className="max-w-2xl">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Submit an <span className="text-cyber-teal">Offer</span> for Verification
          </h1>
          <p className="text-gray-400 leading-relaxed">
            Paste the details of the job or internship offer you received. Our system will analyze it for red flags and provide a risk assessment.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card hover={false}>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FormInput
                    label="Company Name"
                    name="companyName"
                    placeholder="e.g., Google, TechCorp Inc."
                    value={formData.companyName}
                    onChange={handleChange}
                    error={errors.companyName}
                    required
                  />
                  <FormInput
                    label="Job Title"
                    name="jobTitle"
                    placeholder="e.g., Software Engineer Intern"
                    value={formData.jobTitle}
                    onChange={handleChange}
                    error={errors.jobTitle}
                    required
                  />
                </div>

                <FormInput
                  label="Offer Message / Description"
                  name="offerMessage"
                  type="textarea"
                  placeholder="Paste the full offer email, message, or job description here..."
                  value={formData.offerMessage}
                  onChange={handleChange}
                  error={errors.offerMessage}
                  required
                  helpText="Include as much detail as possible for a more accurate analysis."
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FormInput
                    label="Sender Email"
                    name="senderEmail"
                    type="email"
                    placeholder="recruiter@company.com"
                    value={formData.senderEmail}
                    onChange={handleChange}
                    error={errors.senderEmail}
                    required
                  />
                  <FormInput
                    label="Job Posting URL"
                    name="jobUrl"
                    type="url"
                    placeholder="https://careers.company.com/job/123"
                    value={formData.jobUrl}
                    onChange={handleChange}
                    error={errors.jobUrl}
                    helpText="Optional — provide if available."
                  />
                </div>

                {/* File Upload */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-300">
                    Screenshot <span className="text-gray-500">(optional)</span>
                  </label>
                  <div
                    className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 cursor-pointer hover:border-cyber-teal/40 hover:bg-navy-800/30
                      ${errors.screenshot ? 'border-risk-high/40' : 'border-navy-600/50'}`}
                    onClick={() => document.getElementById('screenshot').click()}
                  >
                    <input
                      id="screenshot"
                      name="screenshot"
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    {fileName ? (
                      <div className="flex items-center justify-center gap-2 text-cyber-teal">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-medium">{fileName}</span>
                      </div>
                    ) : (
                      <>
                        <svg className="w-8 h-8 mx-auto text-gray-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                        <p className="text-sm text-gray-400">
                          Click to upload a screenshot of the offer
                        </p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG, or WebP — Max 5MB</p>
                      </>
                    )}
                  </div>
                  {errors.screenshot && (
                    <p className="text-risk-high text-xs flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                      </svg>
                      {errors.screenshot}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <div className="flex items-center gap-4 pt-2">
                  <Button type="submit" size="lg" variant="primary" disabled={isSubmitting}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                    {isSubmitting ? 'Submitting...' : 'Submit Offer'}
                  </Button>
                  <Button type="button" variant="ghost" onClick={handleReset}>
                    Clear Form
                  </Button>
                </div>
                {submitError && (
                  <div className="rounded-xl border border-risk-high/40 bg-risk-high/10 px-4 py-3 text-sm text-risk-high" role="alert">
                    {submitError}
                  </div>
                )}
              </form>
            </Card>
          </div>

          {/* Sidebar Tips */}
          <div className="space-y-6">
            <Card>
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-risk-medium" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                Common Red Flags
              </h3>
              <ul className="space-y-2.5 text-sm text-gray-400">
                {[
                  'Asks for money or gift cards upfront',
                  'Uses a free email domain (Gmail, Yahoo)',
                  'Vague job description or company info',
                  'Unrealistically high salary',
                  'No formal interview process',
                  'Pressure to respond immediately',
                  'Requests personal banking details',
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-risk-medium flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                    {tip}
                  </li>
                ))}
              </ul>
            </Card>

            <Card>
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-cyber-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
                Tips for Better Results
              </h3>
              <ul className="space-y-2.5 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-cyber-teal">•</span>
                  Include the full email text, not a summary
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyber-teal">•</span>
                  Provide the exact sender email address
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyber-teal">•</span>
                  Add the job posting URL if one exists
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyber-teal">•</span>
                  Screenshots help catch visual red flags
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SubmitOffer
