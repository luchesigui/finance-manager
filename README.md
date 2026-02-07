# FinançasPro

Gestão financeira estratégica para quem valoriza eficiência acima de microgerenciamento. Não é sobre contar centavos, é sobre **Health Score**, tendências macro e progresso rumo à liberdade financeira.

> _"Quem entende o conceito, não precisa de continha."_

## Funcionalidades

- **Health Score (0–100)**: visão consolidada da saúde financeira
- **Divisão proporcional de despesas familiares**: metodologia Cerbasi (_Casais Inteligentes Enriquecem Juntos_)
- **Calculadora de reserva de emergência**: quantos meses de runway você tem
- **Detecção inteligente de outliers**: identifica gastos fora do padrão
- **Simulador de cenários**: projete o impacto de decisões financeiras

## Tech Stack

Next.js 16 · React 19 · Supabase (PostgreSQL + Auth + RLS) · Zustand · React Query · Tailwind CSS · TypeScript · Biome · Vitest

## Getting Started

### Pré-requisitos

- Node.js
- npm

### Caminho A — Supabase Local (recomendado para desenvolvimento)

Requer [Docker](https://www.docker.com/) instalado.

```bash
npm install
npm run dev
```

`npm run dev` inicia automaticamente o Supabase local via `db:start`. Na primeira execução, copie as credenciais exibidas no terminal e adicione ao `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<valor exibido no terminal>
SUPABASE_SERVICE_ROLE_KEY=<valor exibido no terminal>
```

Você também pode rodar `npm run db:start` manualmente para ver as credenciais.

**Usuário de teste:** `dev@example.com` / `password123`

### Caminho B — Supabase Cloud

Obtenha as credenciais no [Supabase Dashboard](https://supabase.com/dashboard) → Project Settings → API e adicione ao `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<projeto>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<valor encontrado no dashboard>
SUPABASE_SERVICE_ROLE_KEY=<valor encontrado no dashboard>
```

```bash
npm install
npm run dev
```

> Consulte [`infra/README.md`](infra/README.md) para setup completo do banco, migrations e comandos.

## Scripts

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia Supabase local + servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run test` | Testes em modo watch |
| `npm run test:run` | Testes (execução única) |
| `npm run test:coverage` | Testes com cobertura |
| `npm run verify` | Lint + typecheck + build |
| `npm run format` | Formata código com Biome |
| `npm run lint` | Lint com Biome |
| `npm run typecheck` | Checagem de tipos TypeScript |

## Estrutura do Projeto

```
app/          → Rotas e layouts (Next.js App Router)
features/     → Módulos de domínio (dashboard, despesas, simulador, etc.)
lib/          → Utilitários, stores Zustand, clients Supabase
components/   → Componentes de UI compartilhados
infra/        → Banco de dados, migrations e configuração Supabase
test/         → Setup e utilitários de teste
```
