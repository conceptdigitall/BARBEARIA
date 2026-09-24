# 💈 Barbearia do Alemão 777 - BarberConnect

Plataforma Web Premium e Painel Administrativo de Gestão para a **Barbearia do Alemão 777**, desenvolvida com **Next.js 16**, **TypeScript**, **TailwindCSS**, **Framer Motion** e **Prisma ORM**.

---

## 🚀 Sobre o Projeto

O **BarberConnect** é uma solução completa de agendamento e gerenciamento para barbearias de alto padrão. Ele une uma **Landing Page de Alta Conversão** (com design sofisticado em tons Dark & Gold, animações fluidas e agendamento instantâneo sem atrito) a um **Painel Administrativo Completo** para os barbeiros e proprietários gerenciarem seu negócio em tempo real.

### 🎯 Principais Funcionalidades

#### 🌟 Landing Page Pública (Cliente)
- **Hero Section Premium**: Apresentação visual de alto padrão com foto realista do proprietário e logo oficial 3D em PNG transparente.
- **Tabela de Serviços & Preços Dinâmica**: Exibição dos serviços cadastrados com identificação visual de **Promoções Ativas**, preços com desconto, durações e miniaturas de imagem.
- **Agendamento Online de Atrito Zero**: Escolha de serviço, profissional, data e horário com confirmação automática sem necessidade de cadastro burocrático.
- **Carrossel do Instagram e Galeria de Estilos**: Integração visual com cortes, degradês, barbas e transformações.
- **Localização e Contato**: Endereço interativo, horários de funcionamento e mapa em Cubatão/SP.
- **Botão Flutuante do WhatsApp**: Canal direto de comunicação com o cliente.

#### ⚙️ Painel Administrativo (`/admin/dashboard`)
- **Agenda & Horários em Tempo Real**:
  - Visualização em tabela e linha do tempo dos atendimentos do dia.
  - Sincronização em tempo real (polling a cada 30 segundos ou atualização manual).
  - Indicadores diários: Faturamento previsto, taxa de ocupação da grade, total de agendamentos e contador de acessos ao site.
- **Gestão e Edição Completa de Serviços**:
  - Cadastro, edição e exclusão de serviços no catálogo.
  - **Promoções Programadas**: Definição de preços promocionais com data/hora de início e término (desativação automática de promoção expirada sem ação manual).
  - **Upload de Imagens**: Envio direto de fotos ilustrativas com preview em tempo real e limite de 5MB.
  - Multi-seleção de barbeiros habilitados por serviço.
  - Controle de ordem na lista e status Ativo/Inativo.
- **Notificações & Central de Lembretes**:
  - Lista de agendamentos pendentes de confirmação ou com envio de lembrete pendente.
- **Relatórios & Finanças Mensais**:
  - Relatórios de faturamento mensal, ticket médio e gráfico por mês/ano.
- **Escala Horária de Atendimento**:
  - Configuração da jornada de trabalho e intervalo de almoço por dia da semana (Domingo a Sábado).
- **Disparos & Simulação de WhatsApp**:
  - Envio de mensagens personalizadas e lembretes com 1 clique diretamente via API do WhatsApp.
- **CMS & Configurações do Site**:
  - Alteração de nome da marca, WhatsApp de atendimento, endereço físico, links do Instagram e imagens da galeria.

---

## 🛠️ Tecnologias Utilizadas

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Linguagem**: [TypeScript](https://www.typescript.org/)
- **Estilização**: [TailwindCSS 4](https://tailwindcss.com/) + CSS Vanilla
- **Animações**: [Framer Motion](https://www.framer.com/motion/)
- **Banco de Dados & ORM**: [Prisma ORM](https://www.prisma.io/)
- **Processamento de Imagens**: [Sharp](https://sharp.pixelplumbing.com/)
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Autenticação**: JWT com `jose` e cookies HttpOnly estritamente seguros

---

## 💻 Como Rodar Localmente

### Pré-requisitos
- **Node.js** v18+ instalado
- **npm**, **yarn** ou **pnpm**

### Passos

1. **Clonar o Repositório**:
   ```bash
   git clone https://github.com/conceptdigitall/BARBEARIA.git
   cd BARBEARIA
   ```

2. **Instalar as Dependências**:
   ```bash
   npm install
   ```

3. **Configurar as Variáveis de Ambiente**:
   Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis (ou utilize os fallbacks padrão de desenvolvimento):
   ```env
   DATABASE_URL="mysql://usuario:senha@localhost:3306/barbearia"
   JWT_SECRET="sua-chave-secreta-jwt-com-pelo-menos-32-caracteres"
   ```

4. **Gerar o Cliente Prisma (Opcional se conectar ao MySQL)**:
   ```bash
   npx prisma generate
   ```

5. **Iniciar o Servidor de Desenvolvimento**:
   ```bash
   npm run dev
   ```

6. **Acessar a Aplicação**:
   - **Landing Page Pública**: [http://localhost:3000](http://localhost:3000)
   - **Painel Administrativo**: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
     - **E-mail de acesso**: `alemao@barbearia.com`
     - **Senha**: `alemao123`

---

## 📜 Licença e Propriedade

Desenvolvido exclusivamente para a **Barbearia do Alemão 777**. Todos os direitos reservados.
