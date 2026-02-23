import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { documentId, email } = body

    if (!documentId || !email) {
      return NextResponse.json(
        { error: 'Document ID and email are required' },
        { status: 400 }
      )
    }

    const trimmedEmail = email.toLowerCase().trim()
    const supabase = await createClient()

    // 1. Find the signature request for this email + document
    const { data: signatureRequest, error: reqError } = await supabase
      .from('signature_requests')
      .select('*')
      .eq('document_id', documentId)
      .eq('signer_email', trimmedEmail)
      .single()

    if (reqError || !signatureRequest) {
      return NextResponse.json(
        {
          verified: false,
          message: 'No signature found for this email address on this document.',
        },
        { status: 200 }
      )
    }

    if (signatureRequest.status !== 'signed') {
      return NextResponse.json(
        {
          verified: false,
          message: 'This document has not been signed yet by this email address.',
        },
        { status: 200 }
      )
    }

    // 2. Get the signer-specific signed PDF URL from signature_audit table
    //    Each signer gets their own PDF — stored in audit metadata.signed_pdf_url
    const { data: auditRecord, error: auditError } = await supabase
      .from('signature_audit')
      .select('metadata')
      .eq('document_id', documentId)
      .eq('request_id', signatureRequest.id)
      .eq('event_type', 'signature_completed')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const signedPdfUrl = auditRecord?.metadata?.signed_pdf_url

    if (auditError || !signedPdfUrl) {
      // Fallback: try the documents table (for older records)
      const { data: document } = await supabase
        .from('documents')
        .select('signed_pdf_url')
        .eq('id', documentId)
        .single()

      if (!document?.signed_pdf_url) {
        return NextResponse.json(
          {
            verified: false,
            message: 'Signed PDF is not available yet. Please try again later.',
          },
          { status: 200 }
        )
      }

      return NextResponse.json(
        {
          verified: true,
          message: 'Email verified successfully!',
          signed_pdf_url: document.signed_pdf_url,
          signer_name: signatureRequest.signer_name,
          signed_at: signatureRequest.signed_at,
        },
        { status: 200 }
      )
    }

    // 3. Return the signer-specific PDF URL
    return NextResponse.json(
      {
        verified: true,
        message: 'Email verified successfully!',
        signed_pdf_url: signedPdfUrl,
        signer_name: signatureRequest.signer_name,
        signed_at: signatureRequest.signed_at,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error verifying download:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}