'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import SignatureInput from '@/components/SignatureInput'
import SignaturePreview from '@/components/SignaturePreview'
import DocumentViewer from '@/components/DocumentViewer'
import LegalConfirmation from '@/components/LegalConfirmation'

interface Document {
  id: string
  title: string
  description?: string
  pdf_url?: string
  status: string
}

export default function SignPage() {
  const params = useParams()
  const router = useRouter()
  const documentId = params.id as string

  const [document, setDocument] = useState<Document | null>(null)
  const [loading, setLoading] = useState(true)
  const [signatureData, setSignatureData] = useState<string | null>(null)
  const [signerName, setSignerName] = useState('')
  const [signerEmail, setSignerEmail] = useState('')
  const [showSignatureInput, setShowSignatureInput] = useState(false)
  const [legalConfirmed, setLegalConfirmed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchDocument()
  }, [documentId])

  const fetchDocument = async () => {
    try {
      setLoading(true)

      // For demo purposes, create a mock document
      if (documentId === 'demo') {
        setDocument({
          id: 'demo',
          title: 'Sample Employment Agreement',
          description: 'This is a demo document for testing the signature functionality',
          status: 'pending'
        })
        setLoading(false)
        return
      }

      // TODO: Fetch real document from API
      const response = await fetch(`/api/documents/${documentId}`)
      if (response.ok) {
        const data = await response.json()
        setDocument(data)
      } else {
        // Fallback to demo for now
        setDocument({
          id: documentId,
          title: 'Document #' + documentId,
          description: 'Review and sign this document',
          status: 'pending'
        })
      }
    } catch (error) {
      console.error('Error fetching document:', error)
      // Fallback to demo
      setDocument({
        id: documentId,
        title: 'Document #' + documentId,
        description: 'Review and sign this document',
        status: 'pending'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSignature = (signature: string) => {
    setSignatureData(signature)
    setShowSignatureInput(false)
  }

  const handleSubmit = async () => {
    if (!signatureData || !signerName || !signerEmail) {
      alert('Please provide your name, email, and signature')
      return
    }

    if (!legalConfirmed) {
      alert('Please confirm the legal terms before signing')
      return
    }

    try {
      setSubmitting(true)

      const response = await fetch('/api/sign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId,
          signerName,
          signerEmail,
          signatureData,
          legalConfirmed: true,
        }),
      })

      if (response.ok) {
        setSuccess(true)
        // Redirect to success page after 2 seconds
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } else {
        throw new Error('Failed to submit signature')
      }
    } catch (error) {
      console.error('Error submitting signature:', error)
      alert('Failed to submit signature. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading document...</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Document Signed Successfully!
          </h2>
          <p className="text-gray-600 mb-6">
            Your signature has been recorded and the document has been processed.
          </p>
          <Link
            href="/dashboard"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Document not found</p>
          <Link
            href="/"
            className="mt-4 inline-block text-blue-600 hover:text-blue-700"
          >
            Return to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <svg
                className="h-8 w-8 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
              <h1 className="text-2xl font-bold text-gray-900">QuickInk</h1>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {document.title}
          </h2>
          {document.description && (
            <p className="text-gray-600">{document.description}</p>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Document Viewer */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Document</h3>
            <DocumentViewer
              documentUrl={document.pdf_url}
              documentTitle={document.title}
            />
          </div>

          {/* Signing Form */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Sign Document</h3>

            {/* Step 1: Signer Info */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-sm flex items-center justify-center font-medium">
                  1
                </div>
                <h4 className="font-semibold text-gray-900">Your Information</h4>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={signerEmail}
                  onChange={(e) => setSignerEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>

            {/* Step 2: Signature */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-sm flex items-center justify-center font-medium">
                  2
                </div>
                <h4 className="font-semibold text-gray-900">Your Signature</h4>
              </div>

              {!signatureData && !showSignatureInput && (
                <button
                  onClick={() => setShowSignatureInput(true)}
                  className="w-full px-6 py-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-colors text-gray-600 hover:text-blue-600 font-medium"
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                    Click to Add Signature (Draw or Type)
                  </span>
                </button>
              )}

              {showSignatureInput && !signatureData && (
                <SignatureInput
                  onSave={handleSaveSignature}
                  onClear={() => setSignatureData(null)}
                  signerName={signerName}
                />
              )}

              {signatureData && (
                <SignaturePreview
                  signatureData={signatureData}
                  onEdit={() => {
                    setSignatureData(null)
                    setShowSignatureInput(true)
                  }}
                />
              )}
            </div>

            {/* Step 3: Legal Confirmation */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-sm flex items-center justify-center font-medium">
                  3
                </div>
                <h4 className="font-semibold text-gray-900">Confirm & Authorize</h4>
              </div>

              <LegalConfirmation
                checked={legalConfirmed}
                onChange={setLegalConfirmed}
                signerName={signerName}
                documentTitle={document.title}
              />
            </div>

            {/* Submit Button */}
            <div>
              <button
                onClick={handleSubmit}
                disabled={!signatureData || !signerName || !signerEmail || !legalConfirmed || submitting}
                className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-lg flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-r-transparent"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Sign Document
                  </>
                )}
              </button>

              {/* Progress indicator */}
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
                <span className={signerName && signerEmail ? 'text-green-600' : ''}>
                  {signerName && signerEmail ? '✓' : '○'} Info
                </span>
                <span>→</span>
                <span className={signatureData ? 'text-green-600' : ''}>
                  {signatureData ? '✓' : '○'} Signature
                </span>
                <span>→</span>
                <span className={legalConfirmed ? 'text-green-600' : ''}>
                  {legalConfirmed ? '✓' : '○'} Confirmed
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
