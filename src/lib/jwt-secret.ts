/**
 * Segredo usado para assinar/validar o login do painel.
 * NUNCA tenha valor padrão no código: se JWT_SECRET não estiver configurado
 * (mínimo 32 caracteres), ninguém consegue logar — em vez de qualquer um conseguir forjar um login.
 */
export function getJwtSecret(): Uint8Array | null {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    console.error('[Auth] JWT_SECRET ausente ou curto demais (mínimo 32 caracteres).');
    return null;
  }
  return new TextEncoder().encode(secret);
}
