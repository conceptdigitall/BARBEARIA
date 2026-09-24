# [TASK-06] Sistema de Agendamento Sem Atrito (Frictionless Booking)

## Descrição
Implementar o formulário de agendamento em 3 etapas simples (sem necessidade de e-mail/senha). O cliente seleciona o serviço, o barbeiro, a data/hora, insere seu nome e WhatsApp, e confirma.

## Fluxo do Formulário (3 Passos)
1. **Passo 1: Serviço** (Se já veio pré-selecionado da seção de Serviços, avança ou exibe selecionado).
2. **Passo 2: Profissional e Data/Hora** (Exibe os barbeiros cadastrados no banco e um calendário simplificado com horários disponíveis).
3. **Passo 3: Identificação** (Campos: Nome Completo e WhatsApp).

## Checklist
- [x] Criar o componente `src/components/BookingForm.tsx`.
- [x] Criar a rota de API `src/app/api/appointments/route.ts`:
  - `GET`: Para buscar a lista de barbeiros e horários disponíveis para uma data específica.
  - `POST`: Para receber o agendamento, verificar conflito de horários (double-booking), criar o cliente (caso ainda não exista no banco com aquele número de telefone) e registrar o agendamento com status `PENDING_CONFIRMATION`.
- [x] No frontend, gerenciar o estado do formulário em etapas utilizando transições suaves (ex: `framer-motion`).
- [x] Validar o número de WhatsApp (máscara de telefone brasileiro `(99) 99999-9999`).
- [x] Integrar o formulário na página principal (`src/app/page.tsx`).

## Critérios de Aceite (Definition of Done)
- O cliente deve conseguir completar o agendamento sem precisar criar uma conta ou digitar senha.
- A validação de horários no backend deve impedir agendamentos duplicados para o mesmo barbeiro no mesmo horário.
- Agendamento salvo com sucesso deve exibir uma mensagem de confirmação amigável na tela e limpar o formulário.
