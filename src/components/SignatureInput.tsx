'use client'

import React, { useState } from 'react'
import SignaturePad from './SignaturePad'
import TypedSignature from './TypedSignature'

type SignatureMode = 'draw' | 'type'

interface SignatureInputProps {
  onSave: (signature: string) => void
  onClear?: () => void
  signerName?: string
}

export default function SignatureInput({
  onSave,
  onClear,
  signerName = '',
}: SignatureInputProps) {
  const [mode, setMode] = useState<SignatureMode>('draw')

  return (
    <div className="w-full">
      {/* Mode Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setMode('draw')}
          className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
            mode === 'draw'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
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
            Draw Signature
          </span>
        </button>
        <button
          onClick={() => setMode('type')}
          className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
            mode === 'type'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
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
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Type Signature
          </span>
        </button>
      </div>

      {/* Signature Input Area */}
      <div className="min-h-[300px]">
        {mode === 'draw' ? (
          <SignaturePad onSave={onSave} onClear={onClear} />
        ) : (
          <TypedSignature onSave={onSave} signerName={signerName} />
        )}
      </div>
    </div>
  )
}
