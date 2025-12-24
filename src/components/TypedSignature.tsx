'use client'

import React, { useState, useRef, useEffect } from 'react'

// Signature font styles - using web-safe cursive fonts + Google Fonts
const SIGNATURE_FONTS = [
  { name: 'Elegant', fontFamily: "'Dancing Script', cursive", weight: 400 },
  { name: 'Classic', fontFamily: "'Great Vibes', cursive", weight: 400 },
  { name: 'Modern', fontFamily: "'Pacifico', cursive", weight: 400 },
  { name: 'Formal', fontFamily: "'Allura', cursive", weight: 400 },
  { name: 'Bold', fontFamily: "'Permanent Marker', cursive", weight: 400 },
  { name: 'Script', fontFamily: "'Sacramento', cursive", weight: 400 },
  { name: 'Handwritten', fontFamily: "'Caveat', cursive", weight: 700 },
  { name: 'Artistic', fontFamily: "'Satisfy', cursive", weight: 400 },
]

interface TypedSignatureProps {
  onSave: (signature: string) => void
  signerName?: string
}

export default function TypedSignature({ onSave, signerName = '' }: TypedSignatureProps) {
  const [name, setName] = useState(signerName)
  const [selectedFont, setSelectedFont] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Load Google Fonts
  useEffect(() => {
    const link = document.createElement('link')
    link.href = 'https://fonts.googleapis.com/css2?family=Allura&family=Caveat:wght@700&family=Dancing+Script&family=Great+Vibes&family=Pacifico&family=Permanent+Marker&family=Sacramento&family=Satisfy&display=swap'
    link.rel = 'stylesheet'
    document.head.appendChild(link)
    return () => {
      document.head.removeChild(link)
    }
  }, [])

  const generateSignatureImage = (): string | null => {
    const canvas = canvasRef.current
    if (!canvas || !name.trim()) return null

    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    // Clear canvas
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Set font
    const font = SIGNATURE_FONTS[selectedFont]
    ctx.font = `${font.weight} 48px ${font.fontFamily}`
    ctx.fillStyle = 'black'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // Draw signature
    ctx.fillText(name, canvas.width / 2, canvas.height / 2)

    return canvas.toDataURL('image/png')
  }

  const handleSave = () => {
    if (!name.trim()) {
      alert('Please enter your name')
      return
    }

    const signatureData = generateSignatureImage()
    if (signatureData) {
      onSave(signatureData)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Name Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Type your full legal name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your full name"
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
        />
      </div>

      {/* Font Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Choose a signature style
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SIGNATURE_FONTS.map((font, index) => (
            <button
              key={index}
              onClick={() => setSelectedFont(index)}
              className={`p-3 border-2 rounded-lg transition-all text-center ${
                selectedFont === index
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span
                className="block text-lg truncate"
                style={{
                  fontFamily: font.fontFamily,
                  fontWeight: font.weight,
                }}
              >
                {name || 'Your Name'}
              </span>
              <span className="text-xs text-gray-500 mt-1 block">{font.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Signature Preview */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Signature Preview
        </label>
        <div className="border-2 border-gray-300 rounded-lg bg-white p-4 min-h-[120px] flex items-center justify-center">
          {name ? (
            <span
              className="text-4xl sm:text-5xl"
              style={{
                fontFamily: SIGNATURE_FONTS[selectedFont].fontFamily,
                fontWeight: SIGNATURE_FONTS[selectedFont].weight,
              }}
            >
              {name}
            </span>
          ) : (
            <span className="text-gray-400">Type your name above</span>
          )}
        </div>
      </div>

      {/* Hidden canvas for generating image */}
      <canvas
        ref={canvasRef}
        width={600}
        height={200}
        className="hidden"
      />

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={!name.trim()}
        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
      >
        Use This Signature
      </button>

      <p className="text-sm text-gray-500 text-center mt-4">
        Your typed name will be converted to a signature image
      </p>
    </div>
  )
}
