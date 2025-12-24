import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'QuickInk - Simple E-Signature Solution',
  description: 'Self-hosted e-signature solution for web applications',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  )
}
