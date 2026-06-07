// Applies supabase/migrations/*.sql in order, each in its own transaction.
// Run with: npm run migrate   (loads .env.local via node --env-file)
import { readdir, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import pg from 'pg'

const { Client } = pg
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations')

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error('✗ DATABASE_URL not set. Run via `npm run migrate` so .env.local is loaded.')
  process.exit(1)
}

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
})

async function main() {
  console.log('→ Connecting to the database…')
  await client.connect()
  const { rows } = await client.query('select current_database() as db, now() as now')
  console.log(`✓ Connected to "${rows[0].db}" (${rows[0].now.toISOString()})`)

  const files = (await readdir(migrationsDir)).filter((f) => f.endsWith('.sql')).sort()
  console.log(`→ ${files.length} migration file(s) found.\n`)

  for (const file of files) {
    process.stdout.write(`  ${file} … `)
    const sql = await readFile(path.join(migrationsDir, file), 'utf8')
    try {
      await client.query('begin')
      await client.query(sql)
      await client.query('commit')
      console.log('done')
    } catch (err) {
      await client.query('rollback').catch(() => {})
      console.log('FAILED')
      console.error(`\n✗ ${file}:\n${err.message}\n`)
      throw err
    }
  }
  console.log('\n✓ All migrations applied successfully.')
}

main()
  .catch((err) => {
    console.error(err.message || err)
    process.exitCode = 1
  })
  .finally(async () => {
    await client.end().catch(() => {})
  })
