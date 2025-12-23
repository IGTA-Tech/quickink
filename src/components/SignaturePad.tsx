'use client'

import React, { useRef, useState } from 'react'
import SignatureCanvas from 'react-signature-canvas'

interface SignaturePadProps {
  onSave: (signature: string) => void
  onClear?: () => void
}

export default function SignaturePad({ onSave, onClear }: SignaturePadProps) {
  const sigPadRef = useRef<SignatureCanvas>(null)
  const [isEmpty, setIsEmpty] = useState(true)

  const handleClear = () => {
    sigPadRef.current?.clear()
    setIsEmpty(true)
    onClear?.()
  }

  const handleSave = () => {
    if (sigPadRef.current?.isEmpty()) {
      alert('Please provide a signature first')
      return
    }

    const signatureData = sigPadRef.current?.toDataURL('image/png')
    if (signatureData) {
      onSave(signatureData)
    }
  }

  const handleBegin = () => {
    setIsEmpty(false)
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="border-2 border-gray-300 rounded-lg bg-white overflow-hidden">
        <SignatureCanvas
          ref={sigPadRef}
          canvasProps={{
            className: 'w-full h-64 cursor-crosshair',
            style: { touchAction: 'none' }
          }}
          backgroundColor="rgb(255, 255, 255)"
          penColor="rgb(0, 0, 0)"
          onBegin={handleBegin}
        />
      </div>

      <div className="flex gap-4 mt-4">
        <button
          onClick={handleClear}
          disabled={isEmpty}
          className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          Clear
        </button>
        <button
          onClick={handleSave}
          disabled={isEmpty}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          Save Signature
        </button>
      </div>

      <p className="text-sm text-gray-500 text-center mt-4">
        Sign above using your mouse or touch screen
      </p>
    </div>
  )
}
