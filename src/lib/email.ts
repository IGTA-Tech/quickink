import sgMail from '@sendgrid/mail'

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

// This must be a verified sender in your SendGrid account
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@yourdomain.com'
const FROM_NAME = 'QuickInk'

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
  if (!process.env.SENDGRID_API_KEY) {
    console.log('SendGrid not configured (SENDGRID_API_KEY missing), skipping email')
    return null
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const signingUrl = `${appUrl}/sign/${documentId}`

  try {
    const msg = {
      to,
      from: { email: FROM_EMAIL, name: FROM_NAME },
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
            <div style="text-align: center;">
              <a href="${signingUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">
                Review & Sign Document
              </a>
            </div>
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
    }

    const response = await sgMail.send(msg)
    console.log('Signature request email sent to:', to)
    return response
  } catch (error: any) {
    console.error('Error sending signature request email:', error?.response?.body || error)
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
  if (!process.env.SENDGRID_API_KEY) {
    console.log('SendGrid not configured (SENDGRID_API_KEY missing), skipping confirmation email')
    return null
  }

  try {
    const msg = {
      to,
      from: { email: FROM_EMAIL, name: FROM_NAME },
      subject: `Signed: ${documentTitle}`,
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
          </div>

          <div style="background: #f0fdf4; border-radius: 8px; padding: 24px; text-align: center;">
            <div style="width: 48px; height: 48px; background: #22c55e; border-radius: 50%; margin: 0 auto 16px; line-height: 48px;">
              <span style="color: white; font-size: 24px;">&#10004;</span>
            </div>
            <h2 style="color: #166534; margin: 0 0 8px 0;">Document Signed Successfully</h2>
            <p style="margin: 0; color: #166534;">
              Hi ${signerName}, you've successfully signed <strong>${documentTitle}</strong>
            </p>
          </div>

          <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin-top: 24px;">
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #475569;">
              <strong>What happens next?</strong>
            </p>
            <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #475569;">
              <li style="margin-bottom: 6px;">Your signature has been securely embedded into the document</li>
              <li style="margin-bottom: 6px;">A signed PDF copy has been generated and stored</li>
              <li>A complete audit trail has been recorded for legal compliance</li>
            </ul>
          </div>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">

          <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
            This is an automated confirmation from QuickInk. A copy of your signature has been recorded with a complete audit trail including timestamp and IP address.
          </p>
        </body>
        </html>
      `,
    }

    const response = await sgMail.send(msg)
    console.log('Signature confirmation email sent to:', to)
    return response
  } catch (error: any) {
    console.error('Error sending confirmation email:', error?.response?.body || error)
    return null
  }
}