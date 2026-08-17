import { neon } from '@neondatabase/serverless'
import fs from 'fs'
import path from 'path'

const connectionString = "postgresql://neondb_owner:npg_HeZYmnNo50Fy@ep-solitary-butterfly-avk45iz8-pooler.c-11.us-east-1.aws.neon.tech/neondb?sslmode=require"

async function runMigration() {
  console.log('Connecting to Neon PostgreSQL...')
  const sql = neon(connectionString)

  const schemaPath = path.join(process.cwd(), 'schema.sql')
  const schemaSql = fs.readFileSync(schemaPath, 'utf8')

  console.log('Applying schema and seed data to Neon DB...')
  
  const statements = schemaSql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0)

  for (const statement of statements) {
    try {
      await sql.query(statement)
      console.log('✓ Executed statement successfully.')
    } catch (err) {
      console.error('Error executing statement:', err.message)
    }
  }

  console.log('Testing SELECT count from mentores and sesiones in Neon...')
  const mentores = await sql.query('SELECT * FROM mentores')
  console.log(`✓ Mentores in Neon DB: ${mentores.length}`)
  const sesiones = await sql.query('SELECT * FROM sesiones')
  console.log(`✓ Sesiones in Neon DB: ${sesiones.length}`)
  const certificados = await sql.query('SELECT * FROM certificados_cuv')
  console.log(`✓ Certificados CUV in Neon DB: ${certificados.length}`)

  console.log('\n🎉 Neon database migration and seed completed successfully!')
}

runMigration().catch(err => {
  console.error('Migration failed:', err)
  process.exit(1)
})
