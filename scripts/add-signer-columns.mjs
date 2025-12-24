import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://uwbwcmceejjgtmrmfrgw.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required')
  console.error('Run: SUPABASE_SERVICE_ROLE_KEY=your_key node scripts/add-signer-columns.mjs')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const migrationSQL = `
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS signer_name TEXT,
ADD COLUMN IF NOT EXISTS signer_email TEXT;
`

async function checkAndMigrate() {
  console.log('Checking documents table schema...\n')

  // Check if columns already exist by querying the table
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .limit(1)

  if (error) {
    console.error('Error accessing documents table:', error.message)
    process.exit(1)
  }

  const sampleRow = data?.[0] || {}
  const hasSingerName = 'signer_name' in sampleRow
  const hasSignerEmail = 'signer_email' in sampleRow

  if (hasSingerName && hasSignerEmail) {
    console.log('✓ signer_name column exists')
    console.log('✓ signer_email column exists')
    console.log('\nNo migration needed - columns already exist!')
    process.exit(0)
  }

  // Columns don't exist - provide migration SQL
  console.log('Columns need to be added. Run this SQL in the Supabase Dashboard:\n')
  console.log('  1. Go to: https://supabase.com/dashboard/project/uwbwcmceejjgtmrmfrgw/sql')
  console.log('  2. Paste and run the following SQL:\n')
  console.log('─'.repeat(60))
  console.log(migrationSQL)
  console.log('─'.repeat(60))
  console.log('\nAlternatively, use the Supabase CLI:')
  console.log('  supabase db push')

  process.exit(1)
}

checkAndMigrate()
