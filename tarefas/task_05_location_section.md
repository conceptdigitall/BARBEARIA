# [TASK-05] Seção de Localização e Diferenciais (Google Maps & Waze)

## Descrição
Criar a seção de localização e diferenciais da barbearia, mantendo o padrão visual premium em tons grafite e bronze. O objetivo é fornecer atrito zero para o cliente chegar até o estabelecimento, oferecendo links diretos de GPS.

## Informações da Barbearia (Exemplo)
- **Endereço**: Rua dos Barbeiros, 1923 - Bairro Centro, Blumenau - SC
- **Coordenadas para Google Maps**: `-26.9189, -49.0660` (Exemplo)

## Checklist
- [x] Criar o componente `src/components/Location.tsx`.
- [x] Estruturar o layout visual com:
  - Informações de contato e horário de funcionamento.
  - Diferenciais da barbearia (ex: Cerveja cortesia, Espaço climatizado, Atendimento com hora marcada).
- [x] Adicionar os botões de GPS com links diretos:
  - **Google Maps**: `https://www.google.com/maps/dir/?api=1&destination=-26.9189,-49.0660`
  - **Waze**: `https://waze.com/ul?ll=-26.9189,-49.0660&navigate=yes`
- [x] Garantir que os links abram em uma nova aba (`target="_blank" rel="noopener noreferrer"`).
- [x] Integrar a seção de localização na página principal (`src/app/page.tsx`).

## Critérios de Aceite (Definition of Done)
- A seção de localização deve seguir a paleta de cores grafite/bronze.
- Os botões do Google Maps e Waze devem funcionar perfeitamente, abrindo o aplicativo de GPS ou a página web de rotas direto no ponto de destino.
- Responsividade testada em dispositivos móveis.
