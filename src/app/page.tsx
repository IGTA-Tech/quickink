import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
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
            </div>
            <nav className="flex gap-4">
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Dashboard
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Simple, Self-Hosted
            <br />
            <span className="text-blue-600">E-Signature Solution</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            QuickInk is a lightweight e-signature system designed as an
            alternative to expensive services like DocuSign or HelloSign.
            Perfect for applications that need basic document signing without
            enterprise pricing.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/dashboard"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
            >
              Get Started
            </Link>
            <Link
              href="/sign/demo"
              className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium text-lg"
            >
              Try Demo
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="h-6 w-6 text-blue-600"
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
            </div>
            <h3 className="text-xl font-semibold mb-2">Signature Pad</h3>
            <p className="text-gray-600">
              Draw signatures with mouse or touch. Clean, intuitive interface
              for quick signing.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="h-6 w-6 text-blue-600"
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
            </div>
            <h3 className="text-xl font-semibold mb-2">PDF Integration</h3>
            <p className="text-gray-600">
              Embed signatures directly into PDF documents with full audit
              trail.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="h-6 w-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Self-Hosted</h3>
            <p className="text-gray-600">
              No per-document fees. Complete control over your data and
              signing workflow.
            </p>
          </div>
        </div>

        {/* Cost Comparison */}
        <div className="mt-20 bg-white p-8 rounded-lg shadow-md">
          <h3 className="text-2xl font-bold text-center mb-8">
            Cost Comparison
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Solution</th>
                  <th className="text-right py-3 px-4">Cost (500 docs/mo)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4">SignWell</td>
                  <td className="text-right py-3 px-4">~$375/mo</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">DocuSign</td>
                  <td className="text-right py-3 px-4">~$400/mo</td>
                </tr>
                <tr className="bg-blue-50">
                  <td className="py-3 px-4 font-bold">QuickInk</td>
                  <td className="text-right py-3 px-4 font-bold text-blue-600">
                    ~$5/mo (storage only)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Use Cases */}
        <div className="mt-20">
          <h3 className="text-2xl font-bold text-center mb-8">Use Cases</h3>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h4 className="font-semibold mb-2">Interest & Offer Letters</h4>
              <p className="text-gray-600 text-sm">
                Quick signatures for hiring documents and candidate agreements
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h4 className="font-semibold mb-2">Simple Contracts</h4>
              <p className="text-gray-600 text-sm">
                Basic service agreements and vendor contracts
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h4 className="font-semibold mb-2">Internal Approvals</h4>
              <p className="text-gray-600 text-sm">
                Workflow approvals and policy acknowledgments
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h4 className="font-semibold mb-2">Any Document</h4>
              <p className="text-gray-600 text-sm">
                Any document requiring a signature with audit trail
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-600">
            QuickInk - Built as an alternative to expensive e-signature
            services
          </p>
        </div>
      </footer>
    </div>
  )
}
