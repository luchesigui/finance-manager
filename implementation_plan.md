# Plano de Implementação - Nova Página de Configuração

> [!NOTE]
> **Status: Concluído com Sucesso**
> Todos os princípios de desenvolvimento limpo foram seguidos, eliminando códigos duplicados, implementando utilitários centrais, e removendo 100% de estilização inline estática em favor de arquivos CSS Modules específicos para cada componente e view. Os testes de compilação Next.js e Storybook passaram com 100% de sucesso.

---

Este plano detalha o design técnico e as mudanças necessárias para adicionar as novas funcionalidades à página de Configurações, conforme solicitado.

## Resumo dos Requisitos
1. **Configurações do Perfil**: Atualização de nome (full_name), e-mail e senha.
2. **Participantes & Responsável Padrão**: Manter/melhorar a gestão de participantes e a escolha do pagador padrão.
3. **Reserva de Emergência**: Configuração do valor da reserva de emergência.
4. **Categorias Customizadas & Pilares**:
   - Criação de novas categorias associadas a um pilar.
   - Configuração de metas (%) para cada um dos 6 pilares de divisão financeira (essenciais, prazeres, etc.), somando exatamente 100%.
   - Atualização das fórmulas de cálculo financeiro no Dashboard/Health Score para agregar gastos das subcategorias customizadas dentro do seu respectivo pilar.
5. **Integração com IA**: Chave de API do OpenRouter.
6. **Múltiplas Chaves de API da Aplicação**: Criação de chaves nomeadas e revogação das mesmas.

---

## Modificações no Banco de Dados (Supabase)

### 1. Migração para Mapeamento de Categorias aos Pilares
Adicionaremos um relacionamento de hierarquia na tabela `household_categories`, permitindo que categorias customizadas apontem para o seu pilar pai (que também é um registro em `household_categories`).

```sql
-- Arquivo: 20260630000000_add_category_pillars.sql
ALTER TABLE public.household_categories
ADD COLUMN parent_category_id uuid REFERENCES public.household_categories(id) ON DELETE SET NULL;
```

### 2. Migração para Múltiplas Chaves de API
Criaremos a tabela `public.api_keys` para permitir que o usuário cadastre e gerencie múltiplos tokens/chaves de API nomeados.

```sql
-- Arquivo: 20260630010000_add_api_keys_table.sql
CREATE TABLE public.api_keys (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  token_salt uuid DEFAULT gen_random_uuid() NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own API keys" ON public.api_keys
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

---

## Modificações no Backend (Rotas e Helpers)

### 1. Atualização em `lib/types.ts`
Adicionar `parentCategoryId` ao tipo `Category` e `CategoryRow`, e criar tipos para chaves de API.

```typescript
export type Category = {
  readonly id: string;
  name: string;
  targetPercent: number;
  householdId?: string;
  parentCategoryId?: string | null;
};
```

### 2. Mapeamento de Linhas do Banco (`lib/server/dbMappers.ts`)
Atualizar `mapCategoryRow` para ler `parent_category_id`.

### 3. API de Categorias (`app/api/categories/route.ts`)
- **GET**: Retorna todas as categorias do household (incluindo `parentCategoryId`).
- **POST**: Cria uma nova categoria e vincula-a ao pilar especificado (parentCategoryId).
- **DELETE**: Remove uma categoria customizada (bloqueando a exclusão de pilares principais e retornando erro amigável se houver transações associadas).

### 4. API de Gerenciamento de Chaves (`app/api/api-keys/route.ts`)
- **GET**: Retorna a lista de chaves de API cadastradas para o usuário logado (id, name, created_at).
- **POST**: Cria um novo registro em `api_keys` com o nome fornecido, gera o JWT correspondente usando o `token_salt` específico dessa chave e retorna o JWT apenas uma vez ao usuário.
- **DELETE**: Revoga a chave de API excluindo o registro do banco.

### 5. Middleware de Autenticação (`app/api/transactions/route.ts`)
Ajustar `authenticateRequest` para que, além da validação legada na tabela `profiles`, consulte a tabela `api_keys` buscando a chave que possua `user_id = payload.userId` e `token_salt = payload.salt`. Isso mantém retrocompatibilidade e permite múltiplos tokens.

### 6. Atualização nos Cálculos Financeiros (`lib/server/calculations.ts` e `features/dashboard/hooks/useHealthScore.ts`)
- Atualizar `calculateCategorySummary` para que o total de gastos de cada pilar (onde `parentCategoryId` é nulo) inclua a soma de gastos de todas as suas subcategorias vinculadas.
- Atualizar a verificação das metas em `useHealthScore.ts` para ignorar subcategorias (que têm meta de 0%) e avaliar apenas os pilares principais.

---

## Modificações no Frontend (UI e Componentes)

Propomos refatorar o arquivo único `SettingsView.tsx` em componentes modulares e focados para garantir organização e visual de alto nível.

```
/features/settings/components/
  ├── SettingsView.tsx             (Container/Orquestrador)
  ├── ProfileSection.tsx           (Alteração de Nome, E-mail e Senha)
  ├── ParticipantsSection.tsx      (Participantes & Pagador Padrão)
  ├── EmergencyFundSection.tsx     (Valor da Reserva de Emergência)
  ├── PillarsAndCategories.tsx     (Configuração de Metas dos Pilares e Gerenciador de Categorias)
  ├── ApiKeysSection.tsx           (Gerenciamento de chaves de API da aplicação)
  ├── AiSettingsSection.tsx        (Configurações OpenRouter e contexto de IA)
  └── AppearanceSection.tsx        (Tema claro/escuro)
```

### Visual Premium e UX
- Uso de componentes Radix UI e Lucide Icons.
- Mensagens de erro em linha com validações do TanStack Form.
- Micro-animações na transição de abas ou ao exibir novas chaves criadas.
- Agrupamento no dropdown de seleção de categoria em transações para exibir subcategorias debaixo de seus respectivos pilares.

---

## Plano de Verificação

### Testes Automatizados
- Executar os testes existentes do vitest: `npm run test`
- Validar se a rota de transações continua aceitando autenticação por Bearer Token.

### Verificação Manual
- **Perfil**: Atualizar nome e testar troca de e-mail e senha.
- **Pilares e Categorias**:
  - Ajustar metas dos pilares e verificar se a validação obriga a soma ser 100%.
  - Criar subcategorias e associá-las a um pilar.
  - Criar transações na subcategoria e verificar se o dashboard acumula o valor no pilar correspondente.
- **Chaves de API**:
  - Criar uma chave nomeada, copiar o token gerado.
  - Fazer uma requisição POST na API de transações usando a nova chave e conferir o sucesso.
  - Deletar a chave de API e garantir que a autenticação passe a ser recusada (401).
