import { createClient } from '@supabase/supabase-js'

const supabaseProjectId = cleanEnv(process.env.SUPABASE_PROJECT_ID)
const supabaseUrl = cleanEnv(process.env.SUPABASE_URL) || (supabaseProjectId ? `https://${supabaseProjectId}.supabase.co` : '')
const supabaseKey = cleanEnv(process.env.SUPABASE_SERVICE_ROLE_KEY) || cleanEnv(process.env.SUPABASE_SECRET_KEY)
const missingEnvVars = [
  ...(!supabaseUrl ? ['SUPABASE_URL or SUPABASE_PROJECT_ID'] : []),
  ...(!supabaseKey ? ['SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SECRET_KEY'] : []),
]

if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variable(s): ${missingEnvVars.join(', ')}`)
  console.error('Create a local .env from .env.example, then add your Supabase project URL and server-only secret key.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const tables = ['guests', 'tickets', 'checkins']
const results = []

for (const table of tables) {
  const { data, error } = await supabase.from(table).select('id').limit(1)

  if (error) {
    console.error(`Supabase check failed for "${table}": ${error.message}`)
    process.exit(1)
  }

  results.push(`${table}: reachable${data.length > 0 ? ', has rows' : ', empty'}`)
}

console.log('Supabase connection ok.')
console.log(`Tables reachable: ${results.join(', ')}`)

function cleanEnv(value) {
  const nextValue = String(value ?? '').trim()

  if (!nextValue || nextValue.includes('replace-with') || nextValue.includes('your-project-ref')) {
    return ''
  }

  return nextValue
}
