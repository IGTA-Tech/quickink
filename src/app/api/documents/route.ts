import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendSignatureRequestEmail } from '@/lib/email'

// GET all documents
export async function GET() {
  try {
    const supabase = await createClient()

    const { data: documents, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching documents:', error)
      return NextResponse.json(
        { error: 'Failed to fetch documents' },
        { status: 500 }
      )
    }

    return NextResponse.json({ documents: documents || [] }, { status: 200 })
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST create new document
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, pdf_url, signer_name, signer_email } = body

    // Validate required fields - signer info required, PDF optional
    if (!title || !signer_name || !signer_email) {
      return NextResponse.json(
        { error: 'Title, signer name, and signer email are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Create document with signer info
    const { data: document, error: docError } = await supabase
      .from('documents')
      .insert({
        title,
        description: description || null,
        pdf_url: pdf_url || null,
        status: 'pending',
        signer_name,
        signer_email,
      })
      .select()
      .single()

    if (docError) {
      console.error('Error creating document:', docError)
      return NextResponse.json(
        { error: 'Failed to create document' },
        { status: 500 }
      )
    }

    // Create a pending signature request
    await supabase.from('signature_requests').insert({
      document_id: document.id,
      signer_name,
      signer_email,
      status: 'pending',
    })

    // Log audit event
    const ip = request.headers.get('x-forwarded-for') ||
                request.headers.get('x-real-ip') ||
                'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    await supabase.from('signature_audit').insert({
      document_id: document.id,
      event_type: 'document_created',
      ip_address: ip,
      user_agent: userAgent,
      metadata: { signer_name, signer_email },
    })

    // Send signature request email
    sendSignatureRequestEmail({
      to: signer_email,
      signerName: signer_name,
      documentTitle: title,
      documentId: document.id,
    }).catch((err) => console.error('Failed to send email:', err))

    return NextResponse.json(
      {
        success: true,
        document,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating document:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
