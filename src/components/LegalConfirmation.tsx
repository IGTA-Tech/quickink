'use client'

import React from 'react'

interface LegalConfirmationProps {
  checked: boolean
  onChange: (checked: boolean) => void
  signerName: string
  documentTitle?: string
}

export default function LegalConfirmation({
  checked,
  onChange,
  signerName,
  documentTitle = 'this document',
}: LegalConfirmationProps) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id="legal-confirmation"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
        />
        <label
          htmlFor="legal-confirmation"
          className="text-sm text-gray-700 cursor-pointer select-none"
        >
          <span className="font-semibold text-gray-900">
            I agree to the following terms:
          </span>
          <ul className="mt-2 space-y-2 list-disc list-inside text-gray-600">
            <li>
              I, <strong className="text-gray-900">{signerName || '[Your Name]'}</strong>,
              confirm that I am the person identified in {documentTitle}.
            </li>
            <li>
              I understand that my electronic signature is legally binding and has the same
              legal effect as a handwritten signature.
            </li>
            <li>
              I authorize the use of my electronic signature on {documentTitle} and
              acknowledge that I have read and understood its contents.
            </li>
            <li>
              I consent to conducting this transaction electronically and receiving
              electronic records related to this document.
            </li>
          </ul>
        </label>
      </div>

      {/* Legal Notice */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          <strong>Legal Notice:</strong> By checking the box above and applying your signature,
          you are agreeing to be bound by the terms of {documentTitle}. Electronic signatures
          are legally valid under the Electronic Signatures in Global and National Commerce
          Act (E-SIGN Act) and the Uniform Electronic Transactions Act (UETA). Your signature
          will be recorded with a timestamp, IP address, and other identifying information
          for audit purposes.
        </p>
      </div>
    </div>
  )
}
