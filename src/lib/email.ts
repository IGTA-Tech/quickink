import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendSignatureRequestEmailParams {
  to: string
  signerName: string
  documentTitle: string
  documentId: string
  senderName: string
}

export async function sendSignatureRequestEmail({
  to,
  signerName,
  documentTitle,
  documentId,
  senderName,
}: SendSignatureRequestEmailParams) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const signingLink = `${appUrl}/sign/${documentId}`

  const { data, error } = await resend.emails.send({
    from: 'QuickInk <noreply@quickink.app>',
    to,
    subject: `${senderName} has requested your signature on "${documentTitle}"`,
    html: generateEmailHtml({
      signerName,
      documentTitle,
      senderName,
      signingLink,
    }),
  })

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`)
  }

  return data
}

interface EmailTemplateParams {
  signerName: string
  documentTitle: string
  senderName: string
  signingLink: string
}

function generateEmailHtml({
  signerName,
  documentTitle,
  senderName,
  signingLink,
}: EmailTemplateParams): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Signature Request</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 32px 40px; border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                ✍️ QuickInk
              </h1>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="background-color: #ffffff; padding: 40px;">
              <h2 style="margin: 0 0 24px 0; color: #18181b; font-size: 24px; font-weight: 600;">
                Signature Requested
              </h2>

              <p style="margin: 0 0 16px 0; color: #3f3f46; font-size: 16px; line-height: 1.6;">
                Hi ${escapeHtml(signerName)},
              </p>

              <p style="margin: 0 0 24px 0; color: #3f3f46; font-size: 16px; line-height: 1.6;">
                <strong style="color: #18181b;">${escapeHtml(senderName)}</strong> has requested your signature on the following document:
              </p>

              <!-- Document Card -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 32px;">
                <tr>
                  <td style="background-color: #f4f4f5; border: 1px solid #e4e4e7; border-radius: 8px; padding: 20px;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="width: 48px; vertical-align: top;">
                          <div style="width: 48px; height: 48px; background-color: #dbeafe; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                            <span style="font-size: 24px;">📄</span>
                          </div>
                        </td>
                        <td style="padding-left: 16px; vertical-align: middle;">
                          <p style="margin: 0; color: #18181b; font-size: 18px; font-weight: 600;">
                            ${escapeHtml(documentTitle)}
                          </p>
                          <p style="margin: 4px 0 0 0; color: #71717a; font-size: 14px;">
                            Awaiting your signature
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center">
                    <a href="${signingLink}"
                       style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; padding: 16px 32px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);">
                      Review &amp; Sign Document
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 32px 0 0 0; color: #71717a; font-size: 14px; line-height: 1.6;">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin: 8px 0 0 0; word-break: break-all;">
                <a href="${signingLink}" style="color: #3b82f6; text-decoration: none; font-size: 14px;">
                  ${signingLink}
                </a>
              </p>
            </td>
          </tr>

          <!-- Security Notice -->
          <tr>
            <td style="background-color: #fefce8; border-left: 1px solid #e4e4e7; border-right: 1px solid #e4e4e7; padding: 20px 40px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="width: 24px; vertical-align: top;">
                    <span style="font-size: 16px;">🔒</span>
                  </td>
                  <td style="padding-left: 12px;">
                    <p style="margin: 0; color: #713f12; font-size: 14px; line-height: 1.5;">
                      <strong>Security Notice:</strong> This link is unique to you. Do not share it with others. Your signature will be legally binding.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #fafafa; padding: 24px 40px; border-radius: 0 0 12px 12px; border: 1px solid #e4e4e7; border-top: none;">
              <p style="margin: 0 0 8px 0; color: #71717a; font-size: 12px; text-align: center;">
                Sent via <strong>QuickInk</strong> — Simple, secure e-signatures
              </p>
              <p style="margin: 0; color: #a1a1aa; font-size: 12px; text-align: center;">
                If you didn't expect this email, you can safely ignore it.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

function escapeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }
  return text.replace(/[&<>"']/g, (char) => htmlEntities[char])
}
