import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000',
  headers: {
    'Content-Type': 'application/json',
  },
})

export async function submitOfferForAnalysis(offerData) {
  const { data } = await apiClient.post('/api/v1/offers', offerData)
  return data
}

export async function fetchAnalysisReport(reportId) {
  const { data } = await apiClient.get(`/api/v1/offers/${encodeURIComponent(reportId)}`)
  return data
}

export async function fetchOffer(offerId) {
  return fetchAnalysisReport(offerId)
}

export async function analyzeOfferAttachment(offerId, file) {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await apiClient.post(`/api/v1/offers/${encodeURIComponent(offerId)}/attachments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function analyzeEmailFile(file, companyName, companyWebsite) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('company_name', companyName || 'Unknown company')
  if (companyWebsite) formData.append('company_website', companyWebsite)
  const { data } = await apiClient.post('/api/v1/email-checks', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export { apiClient }
