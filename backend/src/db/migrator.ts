import fs from 'fs';
import path from 'path';
import { pool, getClient } from './pool';

export async function runMigrations(): Promise<string[]> {
  const client = await getClient();
  const appliedMigrations: string[] = [];

  try {
    console.log('🔄 Checking database migration table...');
    // Create migrations tracking table
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Fetch applied migrations
    const res = await client.query('SELECT name FROM _migrations ORDER BY id ASC;');
    const appliedSet = new Set(res.rows.map((r: { name: string }) => r.name));

    // Read migrations directory
    const migrationsDir = path.resolve(__dirname, 'migrations');
    if (!fs.existsSync(migrationsDir)) {
      console.warn(`⚠️ Migrations directory not found at: ${migrationsDir}`);
      return [];
    }

    const files = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    for (const file of files) {
      if (!appliedSet.has(file)) {
        console.log(`⏳ Applying migration: ${file}...`);
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf-8');

        await client.query('BEGIN');
        try {
          await client.query(sql);
          await client.query('INSERT INTO _migrations (name) VALUES ($1);', [file]);
          await client.query('COMMIT');
          console.log(`✅ Applied migration: ${file}`);
          appliedMigrations.push(file);
        } catch (err) {
          await client.query('ROLLBACK');
          console.error(`❌ Migration failed in ${file}:`, err);
          throw err;
        }
      } else {
        // Already applied
      }
    }

    if (appliedMigrations.length === 0) {
      console.log('✨ All migrations are already up to date.');
    } else {
      console.log(`🎉 Successfully applied ${appliedMigrations.length} migration(s).`);
    }

    return appliedMigrations;
  } finally {
    client.release();
  }
}

// Allow direct CLI execution: tsx src/db/migrator.ts
if (require.main === module) {
  runMigrations()
    .then(async () => {
      await pool.end();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('Fatal error running migrations:', err);
      await pool.end();
      process.exit(1);
    });
}
