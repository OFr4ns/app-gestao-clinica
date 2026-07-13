import { v4 as uuid } from 'uuid';
import { findUserByEmail, createAdminUser } from '../repositories/userRepository.js';
import { hashPassword } from '../security/passwordService.js';
import { pool } from '../db/pool.js';

async function main() {
  const name = process.env.ADMIN_NAME || 'Admin';
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required');
  }

  if (password.length < 8) {
    throw new Error('ADMIN_PASSWORD must have at least 8 characters');
  }

  const existing = await findUserByEmail(email);
  if (existing) {
    console.log(`Admin user already exists: ${email}`);
    return;
  }

  const user = await createAdminUser({
    id: uuid(),
    name,
    email,
    passwordHash: await hashPassword(password)
  });

  console.log(`Admin user created: ${user.email}`);
}

main()
  .catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
