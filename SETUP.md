# QuickInk Setup Guide

Complete setup instructions for getting QuickInk running locally or in production.

## Quick Start (Demo Mode)

The fastest way to see QuickInk in action without setting up a database:

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Visit http://localhost:3000 and click "Try Demo" to test the signature functionality without any backend setup.

## Full Setup with Supabase

For a complete working application with persistent data:

### 1. Create a Supabase Project

1. Go to https://supabase.com and create a free account
2. Create a new project
3. Wait for the project to finish setting up (this takes about 2 minutes)

### 2. Set Up Database Schema

1. In your Supabase dashboard, go to the SQL Editor
2. Copy the contents of `supabase/schema.sql`
3. Paste and run the SQL to create all tables and policies

### 3. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Get your Supabase credentials from the project settings:
   - Go to Settings > API in your Supabase dashboard
   - Copy the Project URL
   - Copy the anon/public key
   - Copy the service_role key (keep this secret!)

3. Update `.env.local` with your credentials:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

### 4. Install and Run

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Visit http://localhost:3000 to see your application.

## Using the Application

### Creating Documents for Signing

You can create signature requests via the API:

```bash
curl -X POST http://localhost:3000/api/documents \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Employment Agreement",
    "description": "Offer letter for new employee",
    "pdf_url": "https://example.com/document.pdf"
  }'
```

This will return a document ID. Share the signing URL with the signer:
```
http://localhost:3000/sign/{document-id}
```

### Signing Documents

1. Visit the signing URL
2. Enter your name and email
3. Draw your signature in the signature pad
4. Click "Sign Document"

The signature will be saved with a complete audit trail including:
- IP address
- User agent
- Timestamp
- Signature image (base64 PNG)

## Production Deployment

### Deploy to Vercel

The easiest way to deploy QuickInk:

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add your environment variables in Vercel project settings
4. Deploy!

Vercel will automatically:
- Build your Next.js application
- Set up serverless functions for API routes
- Provide a production URL

### Environment Variables for Production

Make sure to set these in your hosting platform:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Storage Configuration (Optional)

To use actual PDF documents instead of demos:

### 1. Enable Storage in Supabase

1. Go to Storage in your Supabase dashboard
2. Create a new bucket called `documents`
3. Set the bucket to public or configure access policies

### 2. Upload PDFs

Upload PDFs via the Supabase dashboard or programmatically:

```typescript
const { data, error } = await supabase.storage
  .from('documents')
  .upload('path/to/document.pdf', file)
```

### 3. Get Public URL

```typescript
const { data } = supabase.storage
  .from('documents')
  .getPublicUrl('path/to/document.pdf')

const pdfUrl = data.publicUrl
```

Use this URL when creating documents via the API.

## Advanced Features (TODO)

The following features are planned but not yet implemented:

### PDF Signature Embedding

To actually embed signatures into PDFs (currently signatures are just saved as data):

1. Install PDF manipulation library:
   ```bash
   npm install pdf-lib
   ```

2. Create a PDF generation service in `src/lib/pdf/generator.ts`

3. Update the sign API to:
   - Fetch original PDF
   - Add signature image to PDF
   - Upload signed PDF to storage
   - Update document with signed_pdf_url

### Email Notifications

To send emails when documents need signing:

1. Add an email service (SendGrid, Resend, etc.)
2. Create email templates
3. Send emails on document creation
4. Send reminders for pending signatures

### Multiple Signers

To support multiple signers per document:

1. Update schema to support multiple signature requests per document
2. Add workflow logic to track completion
3. Only mark document as "signed" when all signers complete

## Troubleshooting

### "Document not found" error

Make sure your document exists in the database or use the demo URL: `/sign/demo`

### Signature not saving

Check your Supabase connection and RLS policies. The demo mode should work without any database setup.

### Build errors

Make sure all dependencies are installed:
```bash
rm -rf node_modules package-lock.json
npm install
```

### TypeScript errors

Regenerate the Next.js types:
```bash
npm run dev
```

This will create the `.next` directory with type definitions.

## Support

For issues or questions:
- Check the README.md for architecture overview
- Review the database schema in `supabase/schema.sql`
- Examine the API routes in `src/app/api/`

## Cost Estimation

Running QuickInk is very affordable:

- **Supabase Free Tier**: 500MB database, 1GB storage, 50MB file uploads
- **Vercel Free Tier**: Unlimited deployments, serverless functions
- **Total Cost for Low Volume**: $0/month

For higher volume:
- **Supabase Pro**: $25/month (8GB database, 100GB storage)
- **Vercel Pro**: $20/month (if needed)
- **Total Cost**: ~$45/month for thousands of signatures

Compare this to:
- DocuSign: $15-40/user/month + per-envelope fees
- SignWell: $8-24/user/month
- HelloSign: $15-30/user/month

QuickInk can save thousands per year for medium-volume usage.
