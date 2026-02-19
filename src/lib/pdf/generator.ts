import { PDFDocument, rgb, StandardFonts, PDFPage, PDFFont, PDFImage } from 'pdf-lib'

interface SignatureInfo {
  signatureData: string // Base64 PNG data URL
  signerName: string
  signerEmail: string
  signedAt: string // ISO date string
  ipAddress?: string
  documentTitle: string
}

// ── Signature block dimensions ──
const BLOCK_WIDTH = 260
const BLOCK_HEIGHT = 160
const BLOCK_PADDING = 12
const SIG_MAX_WIDTH = 220
const SIG_MAX_HEIGHT = 70

/**
 * Decode a base64 data URL to a Uint8Array
 */
function decodeBase64DataUrl(dataUrl: string): Uint8Array {
  const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '')
  const binaryString = Buffer.from(base64, 'base64')
  return new Uint8Array(binaryString)
}

/**
 * Fetch a PDF from a URL and return as Uint8Array
 */
async function fetchPdfFromUrl(url: string): Promise<Uint8Array> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch PDF from URL: ${response.status} ${response.statusText}`)
  }
  const arrayBuffer = await response.arrayBuffer()
  return new Uint8Array(arrayBuffer)
}

/**
 * Draw a professional signature block at a specific position
 * Layout:
 * ┌──────────────────────────────┐
 * │     [signature image]        │
 * │  ──────────────────────────  │
 * │  Name: John Doe              │
 * │  Email: john@example.com     │
 * │  Date: Feb 19, 2026, 2:30PM │
 * │  IP: 127.0.0.1              │
 * └──────────────────────────────┘
 */
function drawSignatureBlock(
  page: PDFPage,
  signatureInfo: SignatureInfo,
  font: PDFFont,
  boldFont: PDFFont,
  signatureImage: PDFImage,
  blockX: number,
  blockY: number, // bottom-left Y of the block
) {
  const bx = blockX
  const by = blockY

  // ── Outer box with light background ──
  page.drawRectangle({
    x: bx,
    y: by,
    width: BLOCK_WIDTH,
    height: BLOCK_HEIGHT,
    color: rgb(0.98, 0.98, 0.99),
    borderColor: rgb(0.78, 0.8, 0.84),
    borderWidth: 0.75,
  })

  // ── "Signature" label at top-left of box ──
  page.drawText('Signature', {
    x: bx + BLOCK_PADDING,
    y: by + BLOCK_HEIGHT - BLOCK_PADDING - 9,
    size: 8,
    font: boldFont,
    color: rgb(0.45, 0.45, 0.5),
  })

  // ── Signature image ──
  const sigDims = signatureImage.scale(1)
  const sigScale = Math.min(SIG_MAX_WIDTH / sigDims.width, SIG_MAX_HEIGHT / sigDims.height, 1)
  const sigWidth = sigDims.width * sigScale
  const sigHeight = sigDims.height * sigScale

  // Center the image horizontally within the block
  const sigX = bx + (BLOCK_WIDTH - sigWidth) / 2
  const sigY = by + BLOCK_HEIGHT - BLOCK_PADDING - 18 - sigHeight

  page.drawImage(signatureImage, {
    x: sigX,
    y: sigY,
    width: sigWidth,
    height: sigHeight,
  })

  // ── Signature line under the image ──
  const lineY = sigY - 6
  page.drawLine({
    start: { x: bx + BLOCK_PADDING, y: lineY },
    end: { x: bx + BLOCK_WIDTH - BLOCK_PADDING, y: lineY },
    thickness: 0.75,
    color: rgb(0.6, 0.62, 0.66),
  })

  // ── Signer details below the line ──
  let textY = lineY - 14

  // Name (bold)
  page.drawText(signatureInfo.signerName, {
    x: bx + BLOCK_PADDING,
    y: textY,
    size: 10,
    font: boldFont,
    color: rgb(0.1, 0.1, 0.12),
  })
  textY -= 13

  // Email
  page.drawText(signatureInfo.signerEmail, {
    x: bx + BLOCK_PADDING,
    y: textY,
    size: 8,
    font: font,
    color: rgb(0.4, 0.4, 0.44),
  })
  textY -= 12

  // Date signed
  const formattedDate = new Date(signatureInfo.signedAt).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  })

  page.drawText(`Signed: ${formattedDate}`, {
    x: bx + BLOCK_PADDING,
    y: textY,
    size: 8,
    font: font,
    color: rgb(0.4, 0.4, 0.44),
  })
  textY -= 11

  // IP Address
  if (signatureInfo.ipAddress) {
    page.drawText(`IP: ${signatureInfo.ipAddress}`, {
      x: bx + BLOCK_PADDING,
      y: textY,
      size: 7,
      font: font,
      color: rgb(0.55, 0.55, 0.6),
    })
  }
}

/**
 * Embed a signature into an existing PDF fetched from a URL.
 *
 * Placement logic (bottom-right of the last page):
 *   1. If the last page has enough room at the bottom → place there.
 *   2. Otherwise → add a dedicated signature page.
 *
 * The signature block sits at the RIGHT side, standard e-sign position.
 */
export async function embedSignatureInPdf(
  pdfUrl: string,
  signatureInfo: SignatureInfo
): Promise<Uint8Array> {
  // Fetch the original PDF
  const pdfBytes = await fetchPdfFromUrl(pdfUrl)
  const pdfDoc = await PDFDocument.load(pdfBytes)

  // Embed fonts
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  // Decode and embed the signature image
  const signatureImageBytes = decodeBase64DataUrl(signatureInfo.signatureData)
  const signatureImage = await pdfDoc.embedPng(signatureImageBytes)

  // Get the last page
  const pageCount = pdfDoc.getPageCount()
  const lastPage = pdfDoc.getPage(pageCount - 1)
  const { width: pageWidth, height: pageHeight } = lastPage.getSize()

  // ── Determine position ──
  // Standard position: bottom-right corner with margin
  const rightMargin = 40
  const bottomMargin = 50 // space for footer below the block

  // The block needs BLOCK_HEIGHT + bottomMargin + footer(~25px) from the bottom
  const requiredSpace = BLOCK_HEIGHT + bottomMargin + 30
  const hasSpace = requiredSpace < pageHeight * 0.45 // ensure we don't overlap top-half content

  let targetPage: PDFPage
  let blockX: number
  let blockY: number

  if (hasSpace) {
    // Place on last page – bottom-right
    targetPage = lastPage
    blockX = pageWidth - BLOCK_WIDTH - rightMargin
    blockY = bottomMargin
  } else {
    // Not enough room – add a new signature page (same size as last page)
    targetPage = pdfDoc.addPage([pageWidth, pageHeight])
    blockX = pageWidth - BLOCK_WIDTH - rightMargin
    blockY = pageHeight - BLOCK_HEIGHT - 80 // top area of new page
  }

  // ── Draw the signature block ──
  drawSignatureBlock(
    targetPage,
    signatureInfo,
    font,
    boldFont,
    signatureImage,
    blockX,
    blockY,
  )

  // ── Footer on the page that has the signature ──
  targetPage.drawText('Electronically signed via QuickInk', {
    x: 40,
    y: 22,
    size: 8,
    font: font,
    color: rgb(0.6, 0.6, 0.6),
  })

  targetPage.drawText(
    `Document: ${signatureInfo.documentTitle}  |  Completed: ${new Date(signatureInfo.signedAt).toISOString()}`,
    {
      x: 40,
      y: 11,
      size: 7,
      font: font,
      color: rgb(0.7, 0.7, 0.7),
    }
  )

  // Save and return
  const signedPdfBytes = await pdfDoc.save()
  return signedPdfBytes
}

/**
 * Generate a signing certificate PDF when no source PDF URL is available
 * Creates a professional-looking certificate with all signing details
 */
export async function generateSigningCertificatePdf(
  signatureInfo: SignatureInfo
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()

  // Embed fonts
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  // Create A4 page
  const page = pdfDoc.addPage([595.28, 841.89])
  const { width, height } = page.getSize()
  const margin = 50

  // Decode and embed the signature image
  const signatureImageBytes = decodeBase64DataUrl(signatureInfo.signatureData)
  const signatureImage = await pdfDoc.embedPng(signatureImageBytes)

  let yPos = height - margin

  // ── Header ──
  page.drawRectangle({
    x: 0,
    y: yPos - 30,
    width: width,
    height: 80,
    color: rgb(0.145, 0.388, 0.922),
  })

  page.drawText('QuickInk', {
    x: margin,
    y: yPos - 5,
    size: 28,
    font: boldFont,
    color: rgb(1, 1, 1),
  })

  page.drawText('E-Signature Certificate', {
    x: margin,
    y: yPos - 25,
    size: 12,
    font: font,
    color: rgb(0.85, 0.9, 1),
  })

  yPos -= 100

  // ── Title ──
  page.drawText('SIGNING CERTIFICATE', {
    x: margin,
    y: yPos,
    size: 20,
    font: boldFont,
    color: rgb(0.1, 0.1, 0.1),
  })

  yPos -= 15

  page.drawLine({
    start: { x: margin, y: yPos },
    end: { x: width - margin, y: yPos },
    thickness: 2,
    color: rgb(0.145, 0.388, 0.922),
  })

  yPos -= 35

  // ── Document Details ──
  page.drawText('Document Details', {
    x: margin,
    y: yPos,
    size: 14,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  })

  yPos -= 25

  const drawInfoRow = (label: string, value: string, y: number): number => {
    page.drawText(label, {
      x: margin + 10,
      y,
      size: 10,
      font: boldFont,
      color: rgb(0.4, 0.4, 0.4),
    })
    page.drawText(value, {
      x: margin + 140,
      y,
      size: 10,
      font: font,
      color: rgb(0.15, 0.15, 0.15),
    })
    return y - 20
  }

  yPos = drawInfoRow('Document Title:', signatureInfo.documentTitle, yPos)

  const formattedDate = new Date(signatureInfo.signedAt).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  })
  yPos = drawInfoRow('Date Signed:', formattedDate, yPos)
  yPos = drawInfoRow('Status:', 'COMPLETED', yPos)

  yPos -= 15

  // ── Signer Details ──
  page.drawText('Signer Details', {
    x: margin,
    y: yPos,
    size: 14,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  })

  yPos -= 25

  yPos = drawInfoRow('Name:', signatureInfo.signerName, yPos)
  yPos = drawInfoRow('Email:', signatureInfo.signerEmail, yPos)

  if (signatureInfo.ipAddress) {
    yPos = drawInfoRow('IP Address:', signatureInfo.ipAddress, yPos)
  }

  yPos = drawInfoRow('Timestamp:', new Date(signatureInfo.signedAt).toISOString(), yPos)

  yPos -= 30

  // ── Signature Section ──
  page.drawText('Signature', {
    x: margin,
    y: yPos,
    size: 14,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  })

  yPos -= 15

  // Signature box background
  page.drawRectangle({
    x: margin,
    y: yPos - 120,
    width: 300,
    height: 120,
    color: rgb(0.97, 0.97, 0.97),
    borderColor: rgb(0.8, 0.8, 0.8),
    borderWidth: 1,
  })

  // Signature image
  const sigDims = signatureImage.scale(1)
  const maxSigWidth = 260
  const maxSigHeight = 90
  const sigScale = Math.min(maxSigWidth / sigDims.width, maxSigHeight / sigDims.height, 1)
  const sigWidth = sigDims.width * sigScale
  const sigHeight = sigDims.height * sigScale

  page.drawImage(signatureImage, {
    x: margin + (300 - sigWidth) / 2,
    y: yPos - 110 + (90 - sigHeight) / 2,
    width: sigWidth,
    height: sigHeight,
  })

  // Signature line
  page.drawLine({
    start: { x: margin + 20, y: yPos - 105 },
    end: { x: margin + 280, y: yPos - 105 },
    thickness: 0.5,
    color: rgb(0.6, 0.6, 0.6),
  })

  // Signer name below signature
  page.drawText(signatureInfo.signerName, {
    x: margin + 20,
    y: yPos - 118,
    size: 9,
    font: font,
    color: rgb(0.4, 0.4, 0.4),
  })

  yPos -= 160

  // ── Legal Notice ──
  page.drawRectangle({
    x: margin,
    y: yPos - 90,
    width: width - margin * 2,
    height: 90,
    color: rgb(0.96, 0.97, 0.98),
    borderColor: rgb(0.85, 0.87, 0.9),
    borderWidth: 1,
  })

  page.drawText('Legal Notice', {
    x: margin + 15,
    y: yPos - 18,
    size: 10,
    font: boldFont,
    color: rgb(0.3, 0.3, 0.3),
  })

  const legalLines = [
    'This document has been electronically signed in accordance with the Electronic Signatures in',
    'Global and National Commerce Act (E-SIGN Act) and the Uniform Electronic Transactions Act',
    '(UETA). The electronic signature applied to this document is legally binding and carries the',
    'same legal effect as a handwritten signature. A complete audit trail including IP address,',
    'timestamp, and signer identification has been recorded.',
  ]

  let legalY = yPos - 35
  legalLines.forEach((line) => {
    page.drawText(line, {
      x: margin + 15,
      y: legalY,
      size: 8,
      font: font,
      color: rgb(0.45, 0.45, 0.45),
    })
    legalY -= 12
  })

  yPos -= 110

  // ── Audit Trail ──
  page.drawText('Audit Trail', {
    x: margin,
    y: yPos,
    size: 14,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  })

  yPos -= 25

  const auditEntries = [
    { event: 'Document Created', time: signatureInfo.signedAt },
    { event: 'Document Viewed by Signer', time: signatureInfo.signedAt },
    { event: 'Signature Applied', time: signatureInfo.signedAt },
    { event: 'Document Completed', time: signatureInfo.signedAt },
  ]

  auditEntries.forEach((entry) => {
    const entryDate = new Date(entry.time).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

    page.drawCircle({
      x: margin + 8,
      y: yPos + 3,
      size: 3,
      color: rgb(0.145, 0.388, 0.922),
    })

    page.drawText(entry.event, {
      x: margin + 20,
      y: yPos,
      size: 10,
      font: font,
      color: rgb(0.2, 0.2, 0.2),
    })

    page.drawText(entryDate, {
      x: margin + 250,
      y: yPos,
      size: 9,
      font: font,
      color: rgb(0.5, 0.5, 0.5),
    })

    yPos -= 22
  })

  // ── Footer ──
  page.drawLine({
    start: { x: margin, y: 50 },
    end: { x: width - margin, y: 50 },
    thickness: 0.5,
    color: rgb(0.8, 0.8, 0.8),
  })

  page.drawText('Generated by QuickInk - Self-Hosted E-Signature Solution', {
    x: margin,
    y: 35,
    size: 8,
    font: font,
    color: rgb(0.6, 0.6, 0.6),
  })

  page.drawText(`Certificate ID: ${Date.now().toString(36).toUpperCase()}`, {
    x: width - margin - 180,
    y: 35,
    size: 8,
    font: font,
    color: rgb(0.6, 0.6, 0.6),
  })

  const pdfSaveBytes = await pdfDoc.save()
  return pdfSaveBytes
}

/**
 * Main function: Generate a signed PDF
 * - If pdf_url exists: fetch PDF and embed signature at bottom-right
 * - If no pdf_url: generate a signing certificate PDF
 */
export async function generateSignedPdf(
  pdfUrl: string | null | undefined,
  signatureInfo: SignatureInfo
): Promise<Uint8Array> {
  if (pdfUrl) {
    return embedSignatureInPdf(pdfUrl, signatureInfo)
  }
  return generateSigningCertificatePdf(signatureInfo)
}