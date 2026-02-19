import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateSignedPdf } from '@/lib/pdf/generator'
import { sendSignatureConfirmationEmail } from '@/lib/email'

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
    const signedAt = new Date().toISOString()

    // Initialize Supabase clients
    const supabase = await createClient()
    const adminSupabase = createAdminClient()

    // Check if document exists
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single()

    if (docError || !document) {
      // Handle demo document
      if (documentId === 'demo') {
        const demoRequest = {
          id: `demo-${Date.now()}`,
          document_id: documentId,
          signer_email: signerEmail,
          signer_name: signerName,
          status: 'signed',
          signed_at: signedAt,
          signature_data: signatureData,
          ip_address: ip,
          user_agent: userAgent,
        }

        // Generate signed PDF for demo (certificate only, no source PDF)
        let signedPdfUrl: string | null = null
        try {
          const signedPdfBytes = await generateSignedPdf(null, {
            signatureData,
            signerName,
            signerEmail,
            signedAt,
            ipAddress: ip,
            documentTitle: 'Sample Employment Agreement',
          })

          // Upload to Supabase Storage
          const fileName = `demo/demo_signed_${Date.now()}.pdf`
          const { data: uploadData, error: uploadError } = await adminSupabase
            .storage
            .from('documents')
            .upload(fileName, signedPdfBytes, {
              contentType: 'application/pdf',
              upsert: false,
            })

          if (!uploadError && uploadData) {
            const { data: urlData } = adminSupabase
              .storage
              .from('documents')
              .getPublicUrl(uploadData.path)

            signedPdfUrl = urlData.publicUrl
          } else {
            console.error('Demo upload error:', uploadError)
          }
        } catch (pdfError) {
          console.error('Demo PDF generation error:', pdfError)
        }

        return NextResponse.json(
          {
            success: true,
            message: 'Demo signature recorded',
            request: demoRequest,
            signed_pdf_url: signedPdfUrl,
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
        signed_at: signedAt,
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

    // ===== GENERATE SIGNED PDF & UPLOAD TO SUPABASE STORAGE =====
    let signedPdfUrl: string | null = null

    try {
      console.log('Generating signed PDF...')

      const signedPdfBytes = await generateSignedPdf(
        document.pdf_url || null,
        {
          signatureData,
          signerName,
          signerEmail,
          signedAt,
          ipAddress: ip,
          documentTitle: document.title,
        }
      )

      console.log(`Signed PDF generated: ${signedPdfBytes.length} bytes`)

      // Create a safe filename
      const safeTitle = document.title
        .replace(/[^a-zA-Z0-9\s-]/g, '')
        .replace(/\s+/g, '_')
        .substring(0, 50)
      const fileName = `signed/${documentId}/${safeTitle}_signed_${Date.now()}.pdf`

      // Upload to Supabase Storage bucket "documents"
      const { data: uploadData, error: uploadError } = await adminSupabase
        .storage
        .from('documents')
        .upload(fileName, signedPdfBytes, {
          contentType: 'application/pdf',
          upsert: false,
        })

      if (uploadError) {
        console.error('Error uploading signed PDF to storage:', uploadError)
        // Don't fail the entire signing process if upload fails
      } else if (uploadData) {
        // Get the public URL for the uploaded file
        const { data: urlData } = adminSupabase
          .storage
          .from('documents')
          .getPublicUrl(uploadData.path)

        signedPdfUrl = urlData.publicUrl
        console.log('Signed PDF uploaded to:', signedPdfUrl)

        // Update document with signed PDF URL
        await supabase
          .from('documents')
          .update({
            signed_pdf_url: signedPdfUrl,
          })
          .eq('id', documentId)
      }
    } catch (pdfError) {
      console.error('Error generating/uploading signed PDF:', pdfError)
      // Don't fail the entire signing process if PDF generation fails
    }

    // Update document status to signed
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
        signed_pdf_url: signedPdfUrl,
      },
    })

    // Send confirmation email to signer via Resend
    sendSignatureConfirmationEmail({
      to: signerEmail,
      signerName: signerName,
      documentTitle: document.title,
    }).catch((err) => console.error('Failed to send confirmation email:', err))

    return NextResponse.json(
      {
        success: true,
        message: 'Signature recorded successfully',
        request: signatureRequest,
        signed_pdf_url: signedPdfUrl,
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