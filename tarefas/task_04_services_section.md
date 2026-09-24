# [TASK-04] Seção de Serviços e Preços (Integração MySQL)

## Descrição
Criar um componente de grid de serviços que busca as opções de corte diretamente do banco de dados MySQL através do Prisma e exibe os preços formatados em Real (R$). Cada card de serviço deve possuir um botão que direciona o usuário para o fluxo de agendamento.

## Checklist
- [x] Criar o componente `src/components/Services.tsx` como um React Server Component (para buscar dados diretamente do banco sem APIs intermediárias no cliente).
- [x] Fazer a consulta ao banco de dados usando o Prisma Client:
  ```typescript
  const services = await prisma.service.findMany({
    where: { isActive: true }
  });
  ```
- [x] Implementar o grid responsivo de serviços contendo:
  - Nome do serviço.
  - Descrição.
  - Duração em minutos (ex: `30 min`).
  - Preço formatado em BRL (ex: `R$ 60,00`).
  - Botão "Agendar Este".
- [x] Implementar a lógica no botão: ao clicar, deve rolar a tela até o formulário de agendamento e passar o `serviceId` correspondente para pré-selecionar o serviço no formulário.
- [x] Integrar a seção de serviços na página principal (`src/app/page.tsx`).

## Critérios de Aceite (Definition of Done)
- Os serviços exibidos em tela devem vir dinamicamente do banco MySQL.
- O preço deve estar devidamente formatado (`pt-BR`, `BRL`).
- Clicar em "Agendar Este" deve rolar a tela para a seção de agendamento e pré-selecionar o serviço correspondente de forma automática.
