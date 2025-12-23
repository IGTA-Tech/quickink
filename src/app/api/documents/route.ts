import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET all documents
export async function GET() {
  try {
    const supabase = await createClient()

    const { data: documents, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch documents' },
        { status: 500 }
      )
    }

    return NextResponse.json({ documents }, { status: 200 })
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
    const { title, description, pdf_url } = body

    // Validate required fields
    if (!title || !pdf_url) {
      return NextResponse.json(
        { error: 'Title and PDF URL are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Create document
    const { data: document, error: docError } = await supabase
      .from('documents')
      .insert({
        title,
        description,
        pdf_url,
        status: 'pending',
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
    })

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
