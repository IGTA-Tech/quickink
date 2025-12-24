import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

interface SignatureRequestEmailParams {
  to: string
  signerName: string
  documentTitle: string
  documentId: string
  senderName?: string
}

export async function sendSignatureRequestEmail({
  to,
  signerName,
  documentTitle,
  documentId,
  senderName = 'QuickInk',
}: SignatureRequestEmailParams) {
  if (!resend) {
    console.log('Resend not configured, skipping email')
    return null
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://quickink-esign.netlify.app'
  const signingUrl = `${appUrl}/sign/${documentId}`

  try {
    const { data, error } = await resend.emails.send({
      from: 'QuickInk <onboarding@resend.dev>',
      to: [to],
      subject: `Signature requested: ${documentTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">QuickInk</h1>
            <p style="color: #666; margin-top: 5px;">E-Signature Request</p>
          </div>

          <div style="background: #f8fafc; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
            <p style="margin: 0 0 16px 0;">Hi ${signerName},</p>
            <p style="margin: 0 0 16px 0;">
              <strong>${senderName}</strong> has requested your signature on:
            </p>
            <p style="background: white; padding: 12px 16px; border-radius: 6px; border-left: 4px solid #2563eb; margin: 0 0 24px 0;">
              <strong>${documentTitle}</strong>
            </p>
            <a href="${signingUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">
              Review & Sign Document
            </a>
          </div>

          <div style="font-size: 14px; color: #666;">
            <p style="margin: 0 0 8px 0;">Or copy this link:</p>
            <p style="background: #f1f5f9; padding: 8px 12px; border-radius: 4px; word-break: break-all; margin: 0;">
              ${signingUrl}
            </p>
          </div>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">

          <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
            This email was sent by QuickInk. If you didn't expect this request, you can ignore this email.
          </p>
        </body>
        </html>
      `,
    })

    if (error) {
      console.error('Error sending email:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error sending email:', error)
    return null
  }
}

export async function sendSignatureConfirmationEmail({
  to,
  signerName,
  documentTitle,
}: {
  to: string
  signerName: string
  documentTitle: string
}) {
  if (!resend) {
    console.log('Resend not configured, skipping confirmation email')
    return null
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'QuickInk <onboarding@resend.dev>',
      to: [to],
      subject: `Signed: ${documentTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">QuickInk</h1>
          </div>

          <div style="background: #f0fdf4; border-radius: 8px; padding: 24px; text-align: center;">
            <div style="width: 48px; height: 48px; background: #22c55e; border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
              <span style="color: white; font-size: 24px;">✓</span>
            </div>
            <h2 style="color: #166534; margin: 0 0 8px 0;">Document Signed</h2>
            <p style="margin: 0; color: #166534;">
              Hi ${signerName}, you've successfully signed <strong>${documentTitle}</strong>
            </p>
          </div>

          <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 24px;">
            A copy of your signature has been recorded with a complete audit trail.
          </p>
        </body>
        </html>
      `,
    })

    if (error) {
      console.error('Error sending confirmation email:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error sending confirmation email:', error)
    return null
  }
}
