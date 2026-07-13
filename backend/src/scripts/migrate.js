import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../db/pool.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../..');
const migrationDirCandidates = [
  process.env.MIGRATIONS_DIR,
  path.join(projectRoot, 'database', 'migrations'),
  '/database/migrations'
].filter(Boolean);
const baseline = process.argv.includes('--baseline');

async function resolveMigrationsDir() {
  for (const candidate of migrationDirCandidates) {
    try {
      const stat = await fs.stat(candidate);
      if (stat.isDirectory()) {
        return candidate;
      }
    } catch {
      // Try the next candidate.
    }
  }

  throw new Error(`Migrations directory not found. Tried: ${migrationDirCandidates.join(', ')}`);
}

async function ensureMigrationsTable(connection) {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      filename VARCHAR(255) NOT NULL,
      checksum CHAR(64) NOT NULL,
      applied_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      UNIQUE KEY uq_schema_migrations_filename (filename)
    ) ENGINE=InnoDB
      DEFAULT CHARACTER SET utf8mb4
      COLLATE utf8mb4_unicode_ci
  `);
}

async function appliedMigrations(connection) {
  const [rows] = await connection.query('SELECT filename, checksum FROM schema_migrations');
  return new Map(rows.map((row) => [row.filename, row.checksum]));
}

async function migrationFiles() {
  const migrationsDir = await resolveMigrationsDir();
  const entries = await fs.readdir(migrationsDir);
  return {
    migrationsDir,
    files: entries
    .filter((entry) => entry.endsWith('.sql'))
    .sort((a, b) => a.localeCompare(b))
  };
}

function checksum(sql) {
  return crypto.createHash('sha256').update(sql).digest('hex');
}

function splitStatements(sql) {
  return sql
    .split(/;\s*(?:\r?\n|$)/)
    .map((statement) => statement.trim())
    .filter(Boolean);
}

async function recordMigration(connection, filename, hash) {
  await connection.execute(
    `INSERT INTO schema_migrations (filename, checksum)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE checksum = VALUES(checksum)`,
    [filename, hash]
  );
}

async function run() {
  const connection = await pool.getConnection();

  try {
    await ensureMigrationsTable(connection);
    const applied = await appliedMigrations(connection);
    const { migrationsDir, files } = await migrationFiles();

    for (const filename of files) {
      const sql = await fs.readFile(path.join(migrationsDir, filename), 'utf8');
      const hash = checksum(sql);

      if (applied.has(filename)) {
        if (applied.get(filename) !== hash) {
          throw new Error(`Migration checksum mismatch: ${filename}`);
        }
        console.log(`skip ${filename}`);
        continue;
      }

      if (baseline) {
        await recordMigration(connection, filename, hash);
        console.log(`baseline ${filename}`);
        continue;
      }

      console.log(`apply ${filename}`);
      await connection.beginTransaction();
      try {
        for (const statement of splitStatements(sql)) {
          await connection.query(statement);
        }
        await recordMigration(connection, filename, hash);
        await connection.commit();
      } catch (err) {
        await connection.rollback();
        throw err;
      }
    }
  } finally {
    connection.release();
    await pool.end();
  }
}

run().catch((err) => {
  console.error(err.message);
  process.exitCode = 1;
});
