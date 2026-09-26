#!/usr/bin/env bash
# ============================================================
#  Checagem de segurança — projetos Concept Digital (v2)
#  Uso (na pasta do projeto):
#     bash scripts/security-check.sh [URL_DO_SITE]
#  Configuração por projeto: scripts/security.config.sh
#
#  Só LÊ: não altera código, banco nem configurações.
#  Nenhum segredo é impresso por inteiro.
# ============================================================

cd "$(git rev-parse --show-toplevel 2>/dev/null || pwd)" || exit 1

# ---- valores padrão (sobrescritos pelo security.config.sh) ----
SITE_URL=""
PROTECTED_ENDPOINTS=""        # caminhos que SEM login devem responder 401/403/redirect (só GET)
SUPABASE_SENSITIVE_TABLES=""  # tabelas que visitante NUNCA pode ler
SUPABASE_PUBLIC_TABLES=""     # tabelas que o site lê de propósito (só informativo)
EXPECT_REDIRECTS=""           # "caminho|trecho-do-destino" separados por espaço
[ -f scripts/security.config.sh ] && . scripts/security.config.sh
[ -n "$1" ] && SITE_URL="$1"
SITE_URL="${SITE_URL%/}"

FAILS=0; WARNS=0
ok()   { printf "  \033[32m[OK]\033[0m %s\n" "$1"; }
warn() { printf "  \033[33m[ATENÇÃO]\033[0m %s\n" "$1"; WARNS=$((WARNS+1)); }
fail() { printf "  \033[31m[FALHA]\033[0m %s\n" "$1"; FAILS=$((FAILS+1)); }
title(){ printf "\n\033[1m%s\033[0m\n" "$1"; }

echo "Pasta: $(pwd)"
echo "Site:  ${SITE_URL:-(não informado)}"

# ------------------------------------------------------------
title "1. Arquivos .env versionados no Git"
TRACKED_ENV=$(git ls-files | grep -E '(^|/)\.env' | grep -vE '\.example$|\.sample$' || true)
if [ -n "$TRACKED_ENV" ]; then
  fail "Arquivos .env estão no Git (remova com git rm --cached e TROQUE as chaves):"
  echo "$TRACKED_ENV" | sed 's/^/      /'
else
  ok "Nenhum .env real versionado."
fi

# ------------------------------------------------------------
title "2. Segredos no código atual"
# 2a. URLs de banco com usuário:senha
DBURL=$(git grep -nIE "(mysql|postgres(ql)?|mongodb(\+srv)?)://[^:/@ \"'\$]+:[^@ \"'\$]{6,}@" -- . ':!*.example' ':!*.md' 2>/dev/null | cut -d: -f1,2 | sort -u)
if [ -n "$DBURL" ]; then fail "Credenciais de banco escritas no código:"; echo "$DBURL" | sed 's/^/      /'; else ok "Nenhuma URL de banco com senha no código."; fi
# 2b. "process.env.X || 'valor fixo'" em variáveis secretas
FALLBACK=$(git grep -nIE "process\.env\.[A-Z_]*(SECRET|TOKEN|KEY|PASSWORD|DATABASE_URL)[A-Z_]*\s*(\|\||\?\?)\s*['\"][^'\"]{8,}" -- 'src' 'lib' 'app' 'middleware.ts' ':!*.example' 2>/dev/null | grep -v "NEXT_PUBLIC_" | cut -d: -f1,2 | sort -u)
if [ -n "$FALLBACK" ]; then fail "Segredo com valor padrão escrito no código (se a variável faltar, o segredo vira público):"; echo "$FALLBACK" | sed 's/^/      /'; else ok "Nenhum segredo com valor padrão no código."; fi
# 2c. Senhas fixas em rotas de login
HARDPW=$(git grep -nIE "(password|senha|hashPassword)\(?\s*[=:(,]\s*['\"][A-Za-z0-9@#!_.-]{5,}['\"]" -- 'src' 'app' ':!**/*.test.*' 2>/dev/null | grep -viE "placeholder|type=|label|example|exemplo" | cut -d: -f1,2 | sort -u | head -10)
if [ -n "$HARDPW" ]; then warn "Possíveis senhas fixas no código (confira):"; echo "$HARDPW" | sed 's/^/      /'; else ok "Nenhuma senha fixa aparente no código."; fi

title "3. Segredos no histórico do Git (o que já foi publicado)"
if command -v gitleaks >/dev/null 2>&1; then
  if gitleaks git . --redact --no-banner >/tmp/gitleaks.out 2>&1 || gitleaks detect --source . --redact --no-banner >/tmp/gitleaks.out 2>&1; then
    ok "gitleaks não encontrou segredos."
  else
    fail "gitleaks encontrou possíveis segredos (valores ocultados):"; tail -40 /tmp/gitleaks.out | sed 's/^/      /'
  fi
else
  echo "  (gitleaks não instalado — busca simples. Para varredura completa: brew install gitleaks)"
fi
HIST=$(git log --all -p 2>/dev/null)
H1=$(echo "$HIST" | grep -oE "(mysql|postgres(ql)?)://[a-z0-9_]{4,}:[^@ \"']{8,}@[a-z0-9.-]+" | sed -E 's#://([^:]{4})[^:]*:[^@]*@#://\1…:****@#' | sort -u)
[ -n "$H1" ] && fail "URL de banco COM SENHA no histórico público — troque a senha do banco:" && echo "$H1" | sed 's/^/      /'
H2=$(echo "$HIST" | grep -oE 'sk-ant-api[0-9A-Za-z_-]{20,}|sk-proj-[0-9A-Za-z_-]{20,}|sk_live_[A-Za-z0-9]{10,}|\$aact_prod_[A-Za-z0-9_]{30,}|AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{30,}|-----BEGIN [A-Z ]*PRIVATE KEY' | sed -E 's/(.{10}).+/\1…/' | sort -u)
[ -n "$H2" ] && fail "Chaves de API no histórico:" && echo "$H2" | sed 's/^/      /'
SR=0
for t in $(echo "$HIST" | grep -oE 'eyJhbGciOi[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+' | sort -u); do
  p=$(echo "$t" | cut -d. -f2 | tr '_-' '/+'); while [ $(( ${#p} % 4 )) -ne 0 ]; do p="$p="; done
  { echo "$p" | base64 -D 2>/dev/null || echo "$p" | base64 -d 2>/dev/null; } | grep -q '"service_role"' && SR=1
done
[ "$SR" = 1 ] && fail "Chave SERVICE_ROLE do Supabase no histórico — troque no painel do Supabase."
[ -z "$H1$H2" ] && [ "$SR" = 0 ] && ok "Nenhum segredo conhecido no histórico."
if git remote -v 2>/dev/null | grep -q github.com; then
  echo "  Dica: se o repositório for público, tudo que já passou pelo histórico deve ser considerado vazado."
fi

# ------------------------------------------------------------
title "4. Dependências com vulnerabilidades conhecidas (npm audit)"
if [ -f package-lock.json ]; then
  AUDIT=$(npm audit --omit=dev 2>&1)
  if echo "$AUDIT" | grep -qiE 'npm error|ERR!'; then warn "npm audit não conseguiu rodar: $(echo "$AUDIT" | grep -iE 'error' | head -1)"
  elif echo "$AUDIT" | grep -q 'found 0 vulnerabilities'; then ok "Nenhuma vulnerabilidade conhecida."
  elif echo "$AUDIT" | grep -qE '[0-9]+ (critical|high)'; then
    fail "Vulnerabilidades altas/críticas: $(echo "$AUDIT" | grep -E 'vulnerabilit' | tail -1)"
    echo "$AUDIT" | grep -E '^[a-z@][^ ]* +[<>=0-9]|Severity' | head -12 | sed 's/^/      /'
  else warn "$(echo "$AUDIT" | grep -E 'vulnerabilit' | tail -1)"; fi
else warn "Sem package-lock.json — npm audit não pôde rodar."; fi

# ------------------------------------------------------------
title "5. Site no ar: cabeçalhos de segurança"
SKIP_SITE=0
if [ -z "$SITE_URL" ]; then warn "URL do site não informada — pulei os testes 5 a 7."; SKIP_SITE=1
else
  CODE=$(curl -s -o /dev/null -L --max-time 15 -w "%{http_code}" "$SITE_URL")
  if [ "$CODE" != "200" ]; then warn "Não consegui acessar $SITE_URL (HTTP $CODE)."; SKIP_SITE=1
  else
    H=$(curl -sIL --max-time 15 "$SITE_URL" | tr 'A-Z' 'a-z')
    for h in strict-transport-security x-content-type-options referrer-policy; do
      echo "$H" | grep -q "^$h:" && ok "$h presente" || warn "$h ausente"
    done
    echo "$H" | grep -qE "^x-frame-options:|frame-ancestors" && ok "proteção contra clickjacking presente" || warn "x-frame-options ausente"
    echo "$H" | grep -q "^x-powered-by:" && warn "x-powered-by exposto (revela a tecnologia do site)"
  fi
fi

title "6. Rotas protegidas (acesso SEM login deve ser bloqueado)"
if [ "$SKIP_SITE" = 1 ] || [ -z "$PROTECTED_ENDPOINTS" ]; then warn "Teste pulado (sem site ou sem rotas configuradas)."
else
  for P in $PROTECTED_ENDPOINTS; do
    C=$(curl -s -o /dev/null --max-time 15 -w "%{http_code}" "$SITE_URL$P")
    case "$C" in
      401|403|404|405|307|308|302|303) ok "$P → $C (bloqueado sem login)";;
      000) warn "$P → sem resposta";;
      *) fail "$P → $C: responde SEM login!";;
    esac
  done
fi
if [ "$SKIP_SITE" = 0 ] && [ -n "$EXPECT_REDIRECTS" ]; then
  for R in $EXPECT_REDIRECTS; do
    P="${R%%|*}"; D="${R#*|}"
    OUT=$(curl -s -o /dev/null --max-time 15 -w "%{http_code} %{redirect_url}" "$SITE_URL$P")
    echo "$OUT" | grep -q "$D" && ok "$P redireciona ($OUT)" || fail "$P não redireciona para $D ($OUT)"
  done
fi

# ------------------------------------------------------------
title "7. Banco Supabase: o que um visitante anônimo consegue ler"
SB_URL=$(grep -hE '^NEXT_PUBLIC_SUPABASE_URL=' .env.local .env 2>/dev/null | head -1 | cut -d= -f2- | tr -d "\"' ")
SB_KEY=$(grep -hE '^NEXT_PUBLIC_SUPABASE_ANON_KEY=' .env.local .env 2>/dev/null | head -1 | cut -d= -f2- | tr -d "\"' ")
if [ -z "$SUPABASE_SENSITIVE_TABLES" ]; then echo "  (projeto sem tabelas Supabase configuradas — pulado)"
elif [ -z "$SB_URL" ] || [ -z "$SB_KEY" ]; then warn "Não achei NEXT_PUBLIC_SUPABASE_URL/ANON_KEY no .env.local — pulado."
else
  echo "  Com a chave pública (anon), como qualquer visitante. Só conta linhas; nada é alterado."
  for T in $SUPABASE_SENSITIVE_TABLES; do
    RESP=$(curl -s -o /dev/null -D - --max-time 15 -w "HTTPCODE:%{http_code}" \
      -H "apikey: $SB_KEY" -H "Authorization: Bearer $SB_KEY" -H "Prefer: count=exact" -H "Range: 0-0" \
      "$SB_URL/rest/v1/$T?select=*" | tr -d '\r')
    C=$(echo "$RESP" | grep -oE 'HTTPCODE:[0-9]+' | cut -d: -f2)
    N=$(echo "$RESP" | grep -i '^content-range:' | sed 's#.*/##')
    case "$C" in
      000) warn "$T: sem conexão";;
      401|403) ok "$T: acesso negado";;
      404) ok "$T: tabela não existe";;
      2??) if [ -z "$N" ] || [ "$N" = "0" ] || [ "$N" = "*" ]; then ok "$T: 0 linhas visíveis"; else fail "$T: $N linhas LEGÍVEIS por qualquer visitante!"; fi;;
      *) warn "$T: resposta inesperada (HTTP $C)";;
    esac
  done
  [ -n "$SUPABASE_PUBLIC_TABLES" ] && echo "  Tabelas públicas por design (não testadas como falha): $SUPABASE_PUBLIC_TABLES"
fi

# ------------------------------------------------------------
title "Resumo"
echo "  Falhas: $FAILS   Atenções: $WARNS"
[ "$FAILS" -gt 0 ] && echo "  Corrija as FALHAS primeiro. Cole este resultado no Claude para ajuda."
exit 0
