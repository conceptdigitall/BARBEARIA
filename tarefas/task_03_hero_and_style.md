# [TASK-03] Landing Page - Hero e Estilo Visual (Dark/Bronze)

## Descrição
Configurar o design system (cores, tipografia) no Tailwind CSS de acordo com a proposta premium (dark mode, tons grafite e bronze/dourado) e implementar a seção **Hero** da Landing Page.

## Cores de Referência
- **Fundo (Grafite Escuro)**: `#121214` ou `#1A1A1E`
- **Acentuação (Dourado Bronze)**: `#D4AF37` (Gold) e `#C5A880` (Bronze)
- **Texto Principal**: `#FFFFFF`
- **Texto Secundário**: `#A8A8B3` (Cinza claro)

## Checklist
- [x] Configurar as cores premium e fontes personalizadas (ex: *Cinzel* e *Montserrat*) no arquivo `tailwind.config.ts`.
- [x] Importar as fontes do Google Fonts no arquivo `src/app/layout.tsx`.
- [x] Limpar o arquivo `src/app/page.tsx` e o CSS padrão em `src/app/globals.css` para aplicar o fundo grafite como padrão do body.
- [x] Criar o componente `src/components/Hero.tsx` contendo:
  - Título serifado elegante (ex: "A Arte da Barbearia Clássica").
  - Subtítulo convidativo destacando a experiência premium.
  - Botão de Ação (CTA) "Agendar Horário" com micro-animações (hover/scale) usando `framer-motion`.
- [x] Integrar o `Hero` na página principal (`src/app/page.tsx`).

## Critérios de Aceite (Definition of Done)
- A página inicial deve carregar com fundo grafite escuro sem barras de rolagem horizontais.
- O botão de CTA deve rolar suavemente a tela (scroll suave) até a seção onde ficará o formulário.
- O design deve ser 100% responsivo (mobile-first).
