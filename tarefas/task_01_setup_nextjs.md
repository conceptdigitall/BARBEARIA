# [TASK-01] Setup do Projeto Next.js e Instalação de Dependências

## Descrição
Inicializar o projeto Next.js com TypeScript e Tailwind CSS no diretório raiz do projeto. Como a pasta já contém arquivos do Prisma e o arquivo `.env`, é necessário realizar uma movimentação temporária para que o instalador do Next.js não falhe ao detectar uma pasta não vazia.

## Checklist
- [x] Criar uma pasta temporária externa (ex: `/tmp/barbearia-temp`) e mover temporariamente:
  - `.env`
  - Pasta `prisma/`
  - Pasta `node_modules/` (se existir)
  - Arquivos `package.json` e `package-lock.json` (se existirem)
- [x] Rodar o comando de inicialização do Next.js no diretório atual:
  ```bash
  npx -y create-next-app@latest ./ --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --disable-git --yes
  ```
- [x] Mover de volta os arquivos da pasta temporária para a raiz do projeto:
  - `.env`
  - Pasta `prisma/`
- [x] Instalar as dependências adicionais necessárias para o projeto:
  ```bash
  npm install @prisma/client framer-motion lucide-react
  npm install -D ts-node @types/node
  ```
- [x] Configurar o arquivo `tsconfig.json` se necessário para garantir suporte ao Prisma.

## Critérios de Aceite (Definition of Done)
- O projeto Next.js deve estar inicializado com a estrutura `src/app`.
- O comando `npm run dev` deve iniciar o servidor de desenvolvimento sem erros.
- O Prisma deve conseguir carregar o schema a partir da pasta original `prisma/schema.prisma`.
