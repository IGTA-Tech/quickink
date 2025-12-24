import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const documentId = params.id

    // For demo purposes
    if (documentId === 'demo') {
      return NextResponse.json({
        id: 'demo',
        title: 'Sample Employment Agreement',
        description: 'This is a demo document for testing the signature functionality',
        status: 'pending',
        created_at: new Date().toISOString(),
      })
    }

    const supabase = await createClient()

    // Fetch document
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single()

    if (docError || !document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Log view event
    const ip = request.headers.get('x-forwarded-for') ||
                request.headers.get('x-real-ip') ||
                'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    await supabase.from('signature_audit').insert({
      document_id: documentId,
      event_type: 'document_viewed',
      ip_address: ip,
      user_agent: userAgent,
    })

    return NextResponse.json(document, { status: 200 })
  } catch (error) {
    console.error('Error fetching document:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
