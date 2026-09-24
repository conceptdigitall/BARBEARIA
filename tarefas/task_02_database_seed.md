# [TASK-02] Seed do Banco de Dados MySQL (Clever Cloud)

## Descrição
Criar um script de semente (seed) no Prisma para popular o banco de dados MySQL hospedado no Clever Cloud com dados de teste premium. Isso garantirá que a Landing Page e o Painel Administrativo tenham dados reais (serviços, barbeiros e horários) para exibir logo após a inicialização.

## Checklist
- [x] Criar o arquivo `prisma/seed.ts`.
- [x] Escrever a lógica de seed no arquivo usando o `@prisma/client` para inserir:
  - **1 Tenant**: "Barbearia do Alemão" (slug: `barbearia-do-alemao`).
  - **2 Barbeiros (Users)**:
    - "Alemão" (Função: `OWNER`, Email: `alemao@barbearia.com`, Senha criptografada).
    - "Johann" (Função: `BARBER`, Email: `johann@barbearia.com`, Senha criptografada).
  - **4 Serviços Premium**:
    - *Corte de Cabelo Premium* (R$ 60,00 - 30 min)
    - *Barba com Toalha Quente* (R$ 45,00 - 30 min)
    - *Combo Alemão (Cabelo + Barba)* (R$ 95,00 - 60 min)
    - *Pigmentação & Finalização* (R$ 30,00 - 20 min)
  - **Horários de Disponibilidade**: Inserir registros na tabela `Availability` para ambos os barbeiros (Segunda a Sábado, 09:00 às 19:00).
- [x] Adicionar a configuração de seed no `package.json`:
  ```json
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
  ```
- [x] Executar o seed utilizando o comando:
  ```bash
  npx prisma db seed
  ```

## Critérios de Aceite (Definition of Done)
- O comando `npx prisma db seed` deve rodar com sucesso.
- Ao inspecionar o banco de dados (via Prisma Studio ou query), as tabelas de `Tenant`, `User`, `Service` e `Availability` devem estar populadas com os dados especificados.
