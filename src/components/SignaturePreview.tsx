'use client'

import React from 'react'
import Image from 'next/image'

interface SignaturePreviewProps {
  signatureData: string
  onEdit?: () => void
  showEdit?: boolean
}

export default function SignaturePreview({
  signatureData,
  onEdit,
  showEdit = true
}: SignaturePreviewProps) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="border-2 border-gray-300 rounded-lg bg-white p-4">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Your Signature
        </h3>
        <div className="bg-gray-50 rounded border border-gray-200 p-4 flex items-center justify-center min-h-[200px]">
          <img
            src={signatureData}
            alt="Signature preview"
            className="max-w-full h-auto"
            style={{ maxHeight: '180px' }}
          />
        </div>
      </div>

      {showEdit && onEdit && (
        <div className="mt-4">
          <button
            onClick={onEdit}
            className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Edit Signature
          </button>
        </div>
      )}

      <p className="text-sm text-gray-500 text-center mt-4">
        This signature will be applied to your document
      </p>
    </div>
  )
}
