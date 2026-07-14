import { v4 as uuid } from 'uuid';
import { findUserByEmail, createAdminUser } from '../repositories/userRepository.js';
import { hashPassword } from '../security/passwordService.js';
import { pool } from '../db/pool.js';
import {
  FIELD_LIMITS,
  assertEmail,
  assertMaxLength,
  assertRequiredMaxLength
} from '../validation/fieldValidation.js';

async function main() {
  const name = assertRequiredMaxLength(process.env.ADMIN_NAME || 'Admin', FIELD_LIMITS.name, 'Nome');
  const email = assertEmail(process.env.ADMIN_EMAIL, { required: true });
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('ADMIN_EMAIL e ADMIN_PASSWORD são obrigatórios');
  }

  if (password.length < 8) {
    throw new Error('ADMIN_PASSWORD deve ter pelo menos 8 caracteres');
  }
  assertMaxLength(password, FIELD_LIMITS.password, 'Senha');

  const existing = await findUserByEmail(email);
  if (existing) {
    console.log(`Usuário administrador já existe: ${email}`);
    return;
  }

  const user = await createAdminUser({
    id: uuid(),
    name,
    email,
    passwordHash: await hashPassword(password)
  });

  console.log(`Usuário administrador criado: ${user.email}`);
}

main()
  .catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
