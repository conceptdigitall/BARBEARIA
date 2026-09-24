# [TASK-07] Painel do Barbeiro - Métricas e Agenda (/admin/dashboard)

## Descrição
Criar o Painel de Controle (/admin/dashboard) onde o barbeiro pode visualizar sua agenda do dia, faturamento estimado e métricas de ocupação em tempo real a partir dos dados do banco MySQL.

## Checklist
- [x] Criar a página `src/app/admin/dashboard/page.tsx`.
- [x] Implementar a busca de dados (Server Component ou via API interna) para buscar todos os agendamentos do dia atual.
- [x] Criar os cards de métricas no topo do painel:
  - **Faturamento Estimado**: Soma do preço de todos os serviços agendados para o dia que estão com status `CONFIRMED` ou `COMPLETED`.
  - **Taxa de Ocupação**: Porcentagem de horas agendadas em relação ao horário de trabalho disponível (ex: 8 horas totais de trabalho).
  - **Total de Agendamentos**: Quantidade de clientes agendados no dia.
- [x] Desenvolver a tabela ou lista cronológica dos agendamentos do dia exibindo:
  - Horário.
  - Nome do Cliente.
  - WhatsApp (com link direto para abrir no WhatsApp Web: `https://wa.me/55...`).
  - Serviço selecionado.
  - Barbeiro responsável.
  - Badge de status (`Pendente`, `Confirmado`, `Cancelado`, `Finalizado`).
- [x] Adicionar ações rápidas em cada linha da tabela para alterar o status do agendamento (ex: marcar como `COMPLETED` ou `CANCELED`).

## Critérios de Aceite (Definition of Done)
- As métricas financeiras e de ocupação devem refletir fielmente os dados cadastrados no banco de dados.
- O painel deve ser atualizado ao alterar o status de um agendamento.
- O layout do painel administrativo deve ser limpo, funcional e responsivo.
