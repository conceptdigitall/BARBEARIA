# Configuração do security-check.sh — Barbearia do Alemão
SITE_URL="https://COLOQUE-A-URL-DA-BARBEARIA.vercel.app"

# Sem login, estas rotas devem responder 401 (APIs) ou redirecionar para o login (páginas). Só GET.
PROTECTED_ENDPOINTS="/api/admin/appointments /api/admin/clients /api/admin/reports /api/admin/crm-config /api/admin/availability /api/admin/crm/leads /api/admin/site-config /admin/dashboard"

# Banco MySQL (Prisma) — não há teste de Supabase aqui.
SUPABASE_SENSITIVE_TABLES=""
