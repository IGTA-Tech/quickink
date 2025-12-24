-- QuickInk Database Schema
-- Self-hosted e-signature solution

-- Documents table
-- Stores information about documents that need to be signed
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  pdf_url TEXT NOT NULL,
  signed_pdf_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'signed', 'expired', 'declined')),
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Signature requests table
-- Tracks individual signature requests for documents
CREATE TABLE IF NOT EXISTS signature_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  signer_email TEXT NOT NULL,
  signer_name TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'signed', 'declined', 'expired')),
  signed_at TIMESTAMPTZ,
  signature_data TEXT, -- Base64 encoded signature image
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ
);

-- Signature audit trail
-- Logs all events related to document signing
CREATE TABLE IF NOT EXISTS signature_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  request_id UUID REFERENCES signature_requests(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'document_created',
    'document_viewed',
    'signature_requested',
    'signature_started',
    'signature_completed',
    'signature_declined',
    'document_expired',
    'document_downloaded'
  )),
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_signature_requests_document_id ON signature_requests(document_id);
CREATE INDEX IF NOT EXISTS idx_signature_requests_email ON signature_requests(signer_email);
CREATE INDEX IF NOT EXISTS idx_signature_requests_status ON signature_requests(status);
CREATE INDEX IF NOT EXISTS idx_signature_audit_document_id ON signature_audit(document_id);
CREATE INDEX IF NOT EXISTS idx_signature_audit_request_id ON signature_audit(request_id);
CREATE INDEX IF NOT EXISTS idx_signature_audit_created_at ON signature_audit(created_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
-- Enable RLS on all tables
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE signature_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE signature_audit ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view documents (for signing)
CREATE POLICY "Documents are viewable by everyone"
  ON documents FOR SELECT
  USING (true);

-- Policy: Anyone can view their signature requests
CREATE POLICY "Signature requests are viewable by everyone"
  ON signature_requests FOR SELECT
  USING (true);

-- Policy: Anyone can insert signature requests
CREATE POLICY "Anyone can create signature requests"
  ON signature_requests FOR INSERT
  WITH CHECK (true);

-- Policy: Anyone can update their own signature requests
CREATE POLICY "Anyone can update signature requests"
  ON signature_requests FOR UPDATE
  USING (true);

-- Policy: Audit trail is viewable by everyone (for transparency)
CREATE POLICY "Audit trail is viewable by everyone"
  ON signature_audit FOR SELECT
  USING (true);

-- Policy: Anyone can insert audit logs
CREATE POLICY "Anyone can insert audit logs"
  ON signature_audit FOR INSERT
  WITH CHECK (true);

-- Comments for documentation
COMMENT ON TABLE documents IS 'Stores documents that require signatures';
COMMENT ON TABLE signature_requests IS 'Tracks signature requests sent to signers';
COMMENT ON TABLE signature_audit IS 'Audit trail of all signature-related events';
COMMENT ON COLUMN signature_requests.signature_data IS 'Base64 encoded PNG image of the signature';
COMMENT ON COLUMN signature_audit.metadata IS 'Additional event metadata stored as JSON';
