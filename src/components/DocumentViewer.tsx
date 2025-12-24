'use client'

import React, { useState } from 'react'

interface DocumentViewerProps {
  documentUrl?: string
  documentTitle: string
}

export default function DocumentViewer({
  documentUrl,
  documentTitle
}: DocumentViewerProps) {
  const [loading, setLoading] = useState(true)

  if (!documentUrl) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 p-12">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Sample Document
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {documentTitle}
            </p>
            <p className="mt-4 text-xs text-gray-400">
              This is a demo. Connect your document storage to view actual PDFs.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white">
        <div className="bg-gray-100 px-4 py-3 border-b border-gray-300">
          <h3 className="text-sm font-medium text-gray-900">{documentTitle}</h3>
        </div>
        <div className="relative" style={{ minHeight: '600px' }}>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                <p className="mt-2 text-sm text-gray-600">Loading document...</p>
              </div>
            </div>
          )}
          <iframe
            src={documentUrl}
            className="w-full"
            style={{ height: '600px' }}
            onLoad={() => setLoading(false)}
            title={documentTitle}
          />
        </div>
      </div>
      <p className="text-sm text-gray-500 text-center mt-4">
        Review the document above before signing
      </p>
    </div>
  )
}
