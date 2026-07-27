import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi3";

using TypeSpec.Http;
using TypeSpec.Rest;

/**
 * API do Fortunate Finance Manager.
 * Gerencia lançamentos (transações), categorias, reservas financeiras, templates de recorrência,
 * configurações do sistema e chaves de acesso (API Keys).
 * 
 * Autenticação:
 * A API requer autenticação para todas as rotas externas. A autenticação pode ser feita de duas formas:
 * 1. Cabeçalho `Authorization: Bearer <API_KEY>`
 * 2. Cabeçalho `x-api-key: <API_KEY>`
 */
@service({
  title: "Fortunate Finance Manager API",
})
@server("http://localhost:3000", "Servidor de Desenvolvimento Local")
namespace Fortunate;

// --- MODELOS ---

@doc("Representa um usuário cadastrado no sistema.")
model User {
  @doc("Identificador único do usuário.")
  id: string;

  @doc("Nome de exibição do usuário.")
  name: string;

  @doc("Iniciais do usuário para exibição de avatar.")
  avatarInitials: string;
}

@doc("Pilares financeiros da metodologia de divisão de gastos.")
enum PillarSlug {
  essenciais: "essenciais",
  conforto: "conforto",
  prazeres: "prazeres",
  conhecimento: "conhecimento",
  planejamento: "planejamento",
  liberdade: "liberdade",
}

@doc("Categoria de gastos ou receitas.")
model Category {
  @doc("Identificador único da categoria.")
  id: string;

  @doc("Nome da categoria (ex: Alimentação, Transporte).")
  name: string;

  @doc("Slug único para a categoria (ex: alimentacao).")
  slug: string;

  @doc("Pilar financeiro associado a esta categoria.")
  pillarSlug: PillarSlug;
}

@doc("Tipo de transação financeira.")
enum TransactionType {
  expense: "expense",
  income: "income",
  transfer: "transfer",
}

@doc("Opções de modificação ou exclusão de transações recorrentes.")
enum RecurrenceOption {
  only_this: "only_this",
  all: "all",
  future: "future",
}

@doc("Representa um lançamento ou transação financeira.")
model Transaction {
  @doc("Identificador único do lançamento.")
  id: string;

  @doc("ID do usuário que criou o lançamento.")
  createdByUserId: string;

  @doc("Tipo de transação: despesa, receita ou transferência.")
  transactionType: TransactionType;

  @doc("Descrição textual do lançamento.")
  description: string;

  @doc("Valor em centavos (ex: 1000 representa R$ 10,00).")
  amount: int32;

  @doc("ID da categoria associada, se houver.")
  categoryId: string | null;

  @doc("Pilar financeiro associado (derivado ou explicitado).")
  pillarSlug: PillarSlug | null;

  @doc("Data de ocorrência da transação no formato YYYY-MM-DD.")
  date: string;

  @doc("ID do usuário a quem esta transação foi atribuída/paga.")
  assignedToUserId: string;

  @doc("ID do usuário beneficiário da transação, se aplicável.")
  paraQuemUserId: string | null;

  @doc("Indica se a transação foi feita no cartão de crédito.")
  isCreditCard: boolean;

  @doc("Indica se a transação pertence à próxima fatura do cartão.")
  nextInvoice: boolean;

  @doc("Se verdadeiro, esta transação não entra na divisão comum de gastos entre os usuários.")
  naoEntraDivisao: boolean;

  @doc("Indica se é apenas uma previsão/lançamento planejado (ainda não confirmado).")
  isPrevisao: boolean;

  @doc("Indica se este lançamento foi gerado a partir de uma recorrência.")
  isRecorrente: boolean;

  @doc("Indica se é um lançamento parcelado.")
  isParcelado: boolean;

  @doc("Quantidade total de parcelas (apenas se isParcelado for true).")
  numParcelas: int32 | null;

  @doc("Número desta parcela específica (ex: 2 para parcela 2 de 5).")
  parcelaNumero: int32 | null;

  @doc("ID do template de recorrência que originou este lançamento, se aplicável.")
  recurrenceTemplateId: string | null;

  @doc("Indica se o lançamento recorrente foi sobrescrito manualmente.")
  isOverridden: boolean;

  @doc("Indica se o lançamento foi marcado como excluído.")
  isDeleted: boolean;

  @doc("Indica se o lançamento foi ignorado dos cálculos de fechamento.")
  ignored: boolean;
}

@doc("Template para geração automática de transações recorrentes.")
model RecurrenceTemplate {
  @doc("Identificador único do template de recorrência.")
  id: string;

  @doc("ID do usuário criador.")
  createdByUserId: string;

  @doc("Tipo do lançamento.")
  transactionType: TransactionType;

  @doc("Descrição das transações geradas.")
  description: string;

  @doc("Valor em centavos.")
  amount: int32;

  @doc("ID da categoria associada.")
  categoryId: string | null;

  @doc("Pilar financeiro associado.")
  pillarSlug: PillarSlug | null;

  @doc("ID do usuário responsável pelo pagamento.")
  assignedToUserId: string;

  @doc("ID do usuário beneficiário.")
  paraQuemUserId: string | null;

  @doc("Dia do mês para vencimento/geração da transação (1-31).")
  dayOfMonth: int32;

  @doc("Data de início da recorrência (YYYY-MM-DD).")
  startDate: string;

  @doc("Data de término da recorrência (YYYY-MM-DD), opcional.")
  endDate: string | null;

  @doc("Indica se o template está ativo para gerar novas transações.")
  isActive: boolean;

  @doc("Indica se é uma transação de cartão de crédito.")
  isCreditCard: boolean;

  @doc("Indica se pertence à próxima fatura.")
  nextInvoice: boolean;

  @doc("Indica se deve ser ignorado na divisão comum.")
  naoEntraDivisao: boolean;

  @doc("Indica se os lançamentos criados nascerão como previsão.")
  isPrevisao: boolean;
}

@doc("Reserva financeira (ex: Reserva de Emergência, Metas, Investimentos).")
model Reserve {
  @doc("Identificador único da reserva.")
  id: string;

  @doc("Nome descritivo da reserva (ex: Viagem de Férias).")
  name: string;

  @doc("Tipo da reserva: emergency, goal ou investment.")
  type: "emergency" | "goal" | "investment";

  @doc("Valor atualmente poupado em centavos.")
  currentAmount: int32;

  @doc("Valor meta em centavos (opcional).")
  targetAmount: int32 | null;

  @doc("Contribuição mensal planejada em centavos (opcional).")
  monthlyContribution: int32 | null;

  @doc("Data limite para atingir a meta (YYYY-MM-DD), opcional.")
  targetDate: string | null;

  @doc("Status atual da reserva.")
  status: "active" | "paused" | "completed";

  @doc("Data da última atualização (YYYY-MM-DD HH:MM:SS).")
  updatedAt: string;
}

@doc("Configurações gerais do sistema.")
model Settings {
  @doc("Identificador único, sempre 'default'.")
  id: string;

  @doc("ID do pagador padrão para novos lançamentos.")
  defaultPayerId: string | null;

  @doc("Meta da reserva de emergência (ex: 6 meses de gastos essenciais).")
  emergencyFund: int32 | null;

  @doc("Chave de API do OpenRouter para integrações de IA.")
  openrouterKey: string | null;

  @doc("Tema visual do sistema (ex: dark, light).")
  theme: string;

  @doc("Distribuição alvo em percentuais para cada pilar (JSON no formato { [pillar]: percent } onde a soma é 100).")
  pillarTargets: Record<int32>;
}

@doc("Chave de acesso para APIs externas.")
model ApiKey {
  @doc("Identificador único da API Key.")
  id: string;

  @doc("Nome de identificação da chave (ex: Integração Planilha).")
  name: string;

  @doc("Data de criação da chave.")
  createdAt: string;

  @doc("Visualização parcial da chave (ex: fortunate_k…).")
  keyPreview: string;
}

@doc("Resposta de criação de API Key contendo a chave completa gerada. Mostrada apenas uma vez.")
model ApiKeyCreated {
  success: boolean;
  id: string;
  name: string;
  key: string;
  createdAt: string;
}

// --- PARÂMETROS / PAYLOADS ---

model CreateCategoryPayload {
  name: string;
  slug: string;
  pillarSlug: PillarSlug;
}

model CreateTransactionPayload {
  description: string;
  amount: int32;
  categoryId: string | null;
  pillarSlug: PillarSlug | null;
  date: string;
  createdByUserId?: string | null;
  assignedToUserId: string;
  paraQuemUserId?: string | null;
  isCreditCard?: boolean;
  nextInvoice?: boolean;
  naoEntraDivisao?: boolean;
  isPrevisao?: boolean;
  isRecorrente?: boolean;
  isParcelado?: boolean;
  numParcelas?: int32 | string | null;
  transactionType?: TransactionType;
}

model UpdateTransactionPayload {
  updatedFields: {
    description?: string;
    amount?: int32;
    categoryId?: string | null;
    pillarSlug?: string | null;
    date?: string;
    assignedToUserId?: string;
    paraQuemUserId?: string | null;
    isCreditCard?: boolean;
    nextInvoice?: boolean;
    naoEntraDivisao?: boolean;
    isPrevisao?: boolean;
    transactionType?: TransactionType;
    ignored?: boolean;
  };
  option?: RecurrenceOption;
}

model CreateRecurrenceTemplatePayload {
  description: string;
  amount: int32;
  categoryId?: string | null;
  createdByUserId?: string | null;
  assignedToUserId: string;
  paraQuemUserId?: string | null;
  dayOfMonth: int32;
  startDate: string;
  isCreditCard?: boolean;
  nextInvoice?: boolean;
  naoEntraDivisao?: boolean;
  isPrevisao?: boolean;
  transactionType?: TransactionType;
}

model CreateReservePayload {
  name: string;
  type: "emergency" | "goal" | "investment";
  currentAmount: int32;
  targetAmount?: int32 | null;
  monthlyContribution?: int32 | null;
  targetDate?: string | null;
  status?: "active" | "paused" | "completed";
}

model UpdateReservePayload {
  name?: string;
  type?: "emergency" | "goal" | "investment";
  currentAmount?: int32;
  targetAmount?: int32 | null;
  monthlyContribution?: int32 | null;
  targetDate?: string | null;
  status?: "active" | "paused" | "completed";
}

model UpdateSettingsPayload {
  defaultPayerId?: string;
  emergencyFund?: int32;
  openrouterKey?: string | null;
  pillarTargets?: Record<int32>;
}

// --- OPERAÇÕES ---

@route("/api")
namespace Routes {
  
  @route("/users")
  namespace Users {
    @doc("Obtém a lista de usuários cadastrados no sistema.")
    @get op list(): User[] | { error: string };
  }

  @route("/categories")
  namespace Categories {
    @doc("Obtém todas as categorias de transações cadastradas.")
    @get op list(): Category[] | { error: string };

    @doc("Cria uma nova categoria para classificação de lançamentos.")
    @post op create(@body body: CreateCategoryPayload): { success: boolean, id: string } | { error: string };

    @route("/{id}")
    @doc("Deleta uma categoria pelo ID.")
    @delete op delete(@path id: string): { success: boolean } | { error: string };
  }

  @route("/transactions")
  namespace Transactions {
    @doc("Obtém a lista de transações de um determinado mês.")
    @get op list(
      @query @doc("Mês de referência no formato YYYY-MM. Se omitido, assume o mês atual.") month?: string
    ): Transaction[] | { error: string };

    @doc("Cadastra um novo lançamento ou gera um template de recorrência.")
    @post op create(@body body: CreateTransactionPayload): { success: boolean, id?: string, type?: string, templateId?: string } | { error: string };

    @route("/{id}")
    namespace Item {
      @doc("Atualiza um lançamento existente. Para lançamentos recorrentes, permite escolher a abrangência.")
      @put op update(
        @path id: string, 
        @body body: UpdateTransactionPayload
      ): { success: boolean } | { error: string };

      @doc("Deleta um lançamento. Para lançamentos recorrentes, é possível passar o parâmetro 'option'.")
      @delete op delete(
        @path id: string, 
        @query @doc("Opção de exclusão para recorrências: only_this, all, future.") option?: RecurrenceOption
      ): { success: boolean } | { error: string };

      @route("/confirm")
      @doc("Confirma um lançamento marcado como previsão (isPrevisao: true), tornando-o efetivo.")
      @post op confirm(@path id: string): { success: boolean } | { error: string };
    }
  }

  @route("/recurrence-templates")
  namespace RecurrenceTemplates {
    @doc("Obtém todos os templates de transações recorrentes cadastrados.")
    @get op list(): RecurrenceTemplate[] | { error: string };

    @doc("Cria um novo template de transação recorrente.")
    @post op create(@body body: CreateRecurrenceTemplatePayload): { success: boolean, id: string } | { error: string };
  }

  @route("/reserves")
  namespace Reserves {
    @doc("Obtém as reservas cadastradas e a média dos gastos essenciais daquele mês.")
    @get op list(
      @query @doc("Mês de referência no formato YYYY-MM. Se omitido, assume o mês atual.") month?: string
    ): { reserves: Reserve[], essentialAvg: int32 } | { error: string };

    @doc("Cria uma nova reserva financeira.")
    @post op create(@body body: CreateReservePayload): { success: boolean, id: string } | { error: string };

    @route("/{id}")
    namespace Item {
      @doc("Atualiza campos de uma reserva pelo ID.")
      @patch op update(@path id: string, @body body: UpdateReservePayload): { success: boolean } | { error: string };

      @doc("Deleta uma reserva financeira pelo ID.")
      @delete op delete(@path id: string): { success: boolean } | { error: string };
    }
  }

  @route("/settings")
  namespace Settings {
    @doc("Obtém as configurações gerais do sistema.")
    @get op get(): Settings | { error: string };

    @doc("Atualiza as configurações gerais.")
    @put op update(@body body: UpdateSettingsPayload): { success: boolean } | { error: string };
  }

  @route("/api-keys")
  namespace ApiKeys {
    @doc("Lista os previews das chaves de API cadastradas (as chaves completas não são expostas aqui).")
    @get op list(): ApiKey[] | { error: string };

    @doc("Gera uma nova chave de API (esta rota retorna a chave completa uma única vez na resposta).")
    @post op create(@body body: { name: string }): ApiKeyCreated | { error: string };

    @route("/{id}")
    @doc("Revoga/exclui uma chave de API existente pelo ID.")
    @delete op delete(@path id: string): { success: boolean } | { error: string };
  }
}
