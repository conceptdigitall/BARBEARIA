# [TASK-08] Simulação de Lembretes Ativos via WhatsApp

## Descrição
Implementar a funcionalidade de simulação de envio de lembretes ativos a partir do Painel do Barbeiro. Isso permite que o barbeiro force o disparo do lembrete de WhatsApp para um cliente específico de forma manual para testes ou preventivamente.

## Checklist
- [x] Criar a rota de API `src/app/api/admin/simulate-whatsapp/route.ts`:
  - `POST`: Recebe o `appointmentId`.
  - Busca o agendamento no banco (carregando dados do cliente, serviço e barbeiro).
  - Simula o envio gerando a string da mensagem de WhatsApp que seria enviada.
  - Retorna um JSON contendo o status da simulação e o texto exato da mensagem disparada.
- [x] No painel do barbeiro (`src/app/admin/dashboard/page.tsx`), adicionar um botão com o ícone do WhatsApp ("Simular Lembrete") ao lado de cada agendamento.
- [x] Ao clicar no botão, disparar a requisição para a API de simulação e exibir um modal ou toast na tela contendo:
  - O status do disparo (sucesso simulado).
  - O conteúdo da mensagem que seria enviada no celular do cliente.
  - Exemplo de texto: *"Fala, João! Seu horário com o barbeiro Alemão para o serviço Corte Premium está confirmado para hoje às 15:30?..."*

## Critérios de Aceite (Definition of Done)
- O botão de simulação deve estar funcional no painel do barbeiro.
- O clique no botão deve exibir a mensagem simulada formatada corretamente com os dados dinâmicos do cliente, barbeiro, serviço e horário.
- A simulação não deve falhar caso o agendamento não possua telefone válido.
