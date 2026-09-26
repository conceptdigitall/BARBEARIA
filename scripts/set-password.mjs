// Troca a senha de um usuário do painel (grava em scrypt + salt).
// Uso (na pasta do projeto, com o DATABASE_URL NOVO no .env):
//   node --env-file=.env scripts/set-password.mjs alemao@barbearia.com 'NovaSenhaForte!2026'
import crypto from 'node:crypto';
import { PrismaClient } from '@prisma/client';

const [email, password] = process.argv.slice(2);
if (!email || !password || password.length < 10) {
  console.error("Uso: node --env-file=.env scripts/set-password.mjs <email> '<senha com 10+ caracteres>'");
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL não encontrada. Rode com --env-file=.env');
  process.exit(1);
}

const salt = crypto.randomBytes(16).toString('hex');
const hash = crypto.scryptSync(password, salt, 64).toString('hex');

const prisma = new PrismaClient();
try {
  const user = await prisma.user.update({
    where: { email: email.trim().toLowerCase() },
    data: { passwordHash: `scrypt$${salt}$${hash}` },
    select: { email: true, name: true },
  });
  console.log(`Senha atualizada para ${user.name} (${user.email}).`);
} catch (e) {
  console.error('Não consegui atualizar:', e.message);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
