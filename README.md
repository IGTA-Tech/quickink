# QuickInk

Simple, self-hosted e-signature solution for web applications.

## Overview

QuickInk is a lightweight e-signature system designed as an alternative to expensive services like SignWell, DocuSign, or HelloSign. Perfect for applications that need basic document signing without enterprise pricing.

## Features

- **Signature Pad** - Draw signatures with mouse or touch
- **PDF Integration** - Embed signatures into PDF documents
- **Audit Trail** - Timestamp, IP address, and user tracking
- **Self-Hosted** - No per-document fees
- **API First** - Easy integration with any application

## Use Cases

- Interest letters and offer letters
- Simple contracts and agreements
- Internal approval workflows
- Any document requiring a signature

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Signature Capture**: react-signature-canvas
- **PDF Generation**: @react-pdf/renderer
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Styling**: Tailwind CSS

## Cost Comparison

| Solution | Cost (500 docs/mo) |
|----------|-------------------|
| SignWell | ~$375/mo |
| DocuSign | ~$400/mo |
| **QuickInk** | ~$5/mo (storage only) |

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Project Structure

```
quickink/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── api/               # API routes
│   │   │   ├── documents/     # Document CRUD
│   │   │   ├── sign/          # Signature endpoints
│   │   │   └── audit/         # Audit log
│   │   ├── sign/[id]/         # Signing page
│   │   └── dashboard/         # Document management
│   ├── components/
│   │   ├── SignaturePad.tsx   # Signature capture
│   │   ├── DocumentPreview.tsx # PDF preview
│   │   └── SigningFlow.tsx    # Complete signing UI
│   ├── lib/
│   │   ├── pdf/               # PDF generation
│   │   ├── signature/         # Signature processing
│   │   └── supabase/          # Database client
│   └── types/
├── supabase/
│   └── migrations/            # Database schema
└── public/
```

## Database Schema

```sql
-- Documents to be signed
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  pdf_url TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, signed, expired
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Signature requests
CREATE TABLE signature_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id),
  signer_email TEXT NOT NULL,
  signer_name TEXT,
  status TEXT DEFAULT 'pending', -- pending, signed, declined
  signed_at TIMESTAMPTZ,
  signature_data TEXT, -- Base64 signature image
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Audit trail
CREATE TABLE signature_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id),
  request_id UUID REFERENCES signature_requests(id),
  event_type TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/documents` | POST | Create document for signing |
| `/api/documents/[id]` | GET | Get document details |
| `/api/sign/[id]` | POST | Submit signature |
| `/api/sign/[id]/pdf` | GET | Download signed PDF |
| `/api/audit/[id]` | GET | Get audit trail |

## Roadmap

- [ ] Initial setup with signature pad
- [ ] PDF generation with embedded signature
- [ ] Email notifications
- [ ] Multiple signers support
- [ ] Template system
- [ ] Bulk sending
- [ ] White-label options

## License

MIT

---

Built as an alternative to expensive e-signature services.
