// Crea la tabla `orders` en Neon. Se corre una sola vez:
//   pnpm db:init
// (usa --env-file=.env.local para leer DATABASE_URL)

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { neon } from '@neondatabase/serverless'

const url = process.env.DATABASE_URL
if (!url) {
  console.error('✗ Falta DATABASE_URL. Corré con: pnpm db:init')
  process.exit(1)
}

const __dirname = dirname(fileURLToPath(import.meta.url))
const schema = readFileSync(join(__dirname, '..', 'lib', 'db', 'schema.sql'), 'utf8')

// El driver HTTP corre una sentencia por vez: quitamos comentarios y separamos por ';'.
const statements = schema
  .split('\n')
  .filter((line) => !line.trim().startsWith('--'))
  .join('\n')
  .split(';')
  .map((s) => s.trim())
  .filter(Boolean)

const sql = neon(url)

try {
  for (const stmt of statements) {
    await sql.query(stmt)
    console.log('OK:', stmt.split('\n')[0].slice(0, 60))
  }
  console.log('✓ Schema aplicado correctamente.')
} catch (err) {
  console.error('✗ Error aplicando el schema:', err.message)
  process.exit(1)
}
