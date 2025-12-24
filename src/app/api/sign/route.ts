import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { documentId, signerName, signerEmail, signatureData } = body

    // Validate required fields
    if (!documentId || !signerName || !signerEmail || !signatureData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get client IP and user agent for audit trail
    const ip = request.headers.get('x-forwarded-for') ||
                request.headers.get('x-real-ip') ||
                'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Initialize Supabase client
    const supabase = await createClient()

    // Check if document exists
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single()

    if (docError || !document) {
      // For demo purposes, allow signing without existing document
      if (documentId === 'demo') {
        // Create demo signature request
        const demoRequest = {
          id: `demo-${Date.now()}`,
          document_id: documentId,
          signer_email: signerEmail,
          signer_name: signerName,
          status: 'signed',
          signed_at: new Date().toISOString(),
          signature_data: signatureData,
          ip_address: ip,
          user_agent: userAgent,
        }

        // Log audit event
        await supabase.from('signature_audit').insert({
          document_id: documentId,
          event_type: 'signature_completed',
          ip_address: ip,
          user_agent: userAgent,
          metadata: {
            signer_email: signerEmail,
            signer_name: signerName,
            demo: true,
          },
        })

        return NextResponse.json(
          {
            success: true,
            message: 'Demo signature recorded',
            request: demoRequest,
          },
          { status: 200 }
        )
      }

      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Create or update signature request
    const { data: signatureRequest, error: sigError } = await supabase
      .from('signature_requests')
      .insert({
        document_id: documentId,
        signer_email: signerEmail,
        signer_name: signerName,
        status: 'signed',
        signed_at: new Date().toISOString(),
        signature_data: signatureData,
        ip_address: ip,
        user_agent: userAgent,
      })
      .select()
      .single()

    if (sigError) {
      console.error('Error creating signature request:', sigError)
      return NextResponse.json(
        { error: 'Failed to save signature' },
        { status: 500 }
      )
    }

    // Update document status
    await supabase
      .from('documents')
      .update({
        status: 'signed',
      })
      .eq('id', documentId)

    // Log audit event
    await supabase.from('signature_audit').insert({
      document_id: documentId,
      request_id: signatureRequest.id,
      event_type: 'signature_completed',
      ip_address: ip,
      user_agent: userAgent,
      metadata: {
        signer_email: signerEmail,
        signer_name: signerName,
      },
    })

    // TODO: Generate signed PDF with signature overlay
    // This would involve:
    // 1. Fetching the original PDF
    // 2. Adding the signature image to the PDF
    // 3. Uploading the signed PDF to storage
    // 4. Updating the document with signed_pdf_url

    return NextResponse.json(
      {
        success: true,
        message: 'Signature recorded successfully',
        request: signatureRequest,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in sign API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve signature status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const documentId = searchParams.get('documentId')

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: requests, error } = await supabase
      .from('signature_requests')
      .select('*')
      .eq('document_id', documentId)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch signature requests' },
        { status: 500 }
      )
    }

    return NextResponse.json({ requests }, { status: 200 })
  } catch (error) {
    console.error('Error fetching signatures:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
