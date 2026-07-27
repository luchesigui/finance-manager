# Documentação de API - Fortunate Finance Manager

Esta documentação foi elaborada com **Descrições Semânticas** detalhadas para permitir que outros agentes de inteligência artificial (IAs), LLMs e sistemas integradores entendam a arquitetura, regras de negócio e como interagir com a API do **Fortunate Finance Manager**.

A definição formal dos tipos e endpoints da API está descrita utilizando a linguagem **TypeSpec** no arquivo [api.tsp](./api.tsp) na raiz do projeto.

---

## 1. Autenticação (Bearer Token & API Key)

Todas as requisições externas para as APIs devem ser autenticadas. A lógica de autenticação aceita dois métodos de envio no cabeçalho HTTP:

### Opção A: Bearer Token (Recomendado)
Envie o token no cabeçalho `Authorization` precedido por `Bearer `:
```http
Authorization: Bearer fortunate_key_...
```

### Opção B: Custom Header
Envie o token diretamente no cabeçalho `x-api-key`:
```http
x-api-key: fortunate_key_...
```

---

## 2. Regras Semânticas Gerais (Importante para IAs)

Ao construir payloads ou interpretar retornos da API, observe as seguintes regras de negócio:

1. **Valores Monetários em Centavos (`amount`, `currentAmount`, `targetAmount`):**
   * Todos os campos que representam quantias em dinheiro são tratados como números inteiros em **centavos**.
   * *Exemplo:* R$ 150,00 deve ser enviado/interpretado como `15000`.
   
2. **Formato de Datas e Mês:**
   * Todas as datas completas (`date`, `startDate`, `targetDate`) seguem estritamente o formato ISO `YYYY-MM-DD` (ex: `2026-07-12`).
   * Parâmetros de filtro de mês (como o query param `month`) utilizam o formato `YYYY-MM` (ex: `2026-07`).

3. **Pilar Financeiro (`pillarSlug`):**
   * Os gastos/receitas no Fortunate são organizados com base em uma metodologia de divisão de gastos chamada "Pilares".
   * Os valores aceitos são: `"essenciais"`, `"conforto"`, `"prazeres"`, `"conhecimento"`, `"planejamento"` e `"liberdade"`.

4. **Divisão de Despesas comum (`naoEntraDivisao`):**
   * Lançamentos comuns são somados e divididos proporcionalmente entre os usuários.
   * Se o campo `naoEntraDivisao` for `true` (ou `1` no banco de dados), a transação é considerada estritamente pessoal e excluída dos cálculos da divisão de gastos.

5. **Lançamentos Previstos (`isPrevisao`):**
   * Transações que representam orçamentos ou lançamentos planejados que ainda não foram confirmados. Elas aparecem na interface como previsões e podem ser convertidas em lançamentos definitivos através do endpoint `POST /api/transactions/{id}/confirm`.

---

## 3. Estrutura de Endpoints e Recursos

Os endpoints estão organizados nos seguintes namespaces em [api.tsp](./api.tsp):

### 3.1. Transações (`/api/transactions`)
Gerencia o registro de movimentações financeiras.

* `GET /api/transactions?month=YYYY-MM`: Retorna os lançamentos do mês informado.
* `POST /api/transactions`: Cria uma nova transação. Se `isRecorrente` for `true`, o sistema cria um template de recorrência em vez de um lançamento único.
* `PUT /api/transactions/{id}`: Atualiza a transação. Para transações recorrentes, deve ser passada a propriedade `option` no payload:
  * `only_this`: Atualiza apenas o lançamento do mês atual.
  * `all`: Atualiza todos os lançamentos gerados e o próprio template.
  * `future`: Atualiza o lançamento atual e todos os futuros.
* `DELETE /api/transactions/{id}?option=...`: Remove a transação. Aceita as mesmas opções (`only_this`, `all`, `future`) na query string.
* `POST /api/transactions/{id}/confirm`: Altera o estado de uma transação de `isPrevisao: true` para `false` (confirmado).

### 3.2. Categorias (`/api/categories`)
Configura a taxonomia de classificação.

* `GET /api/categories`: Lista as categorias cadastradas.
* `POST /api/categories`: Cria uma nova categoria. Requer `name`, `slug` e um `pillarSlug` válido.
* `DELETE /api/categories/{id}`: Deleta uma categoria se não houver registros dependentes.

### 3.3. Reservas (`/api/reserves`)
Metas financeiras, fundos e investimentos de médio/longo prazo.

* `GET /api/reserves?month=YYYY-MM`: Lista as reservas e também fornece a média dos gastos essenciais (`essentialAvg`) no mês fornecido para cálculo automático da reserva de emergência ideal.
* `POST /api/reserves`: Cria uma meta de reserva.
* `PATCH /api/reserves/{id}`: Permite atualização parcial das metas e do valor atual guardado.
* `DELETE /api/reserves/{id}`: Remove a reserva.

### 3.4. Configurações (`/api/settings`)
Armazena preferências e metas globais de orçamento.

* `GET /api/settings`: Retorna a configuração global de percentual alvo de cada pilar (`pillarTargets`), o pagador padrão (`defaultPayerId`) e chaves externas.
* `PUT /api/settings`: Atualiza as configurações. A soma dos percentuais dos pilares em `pillarTargets` precisa totalizar exatamente `100`.

### 3.5. Chaves de API (`/api/api-keys`)
* `GET /api/api-keys`: Lista as chaves registradas de forma segura (retorna apenas um preview do token `keyPreview`).
* `POST /api/api-keys`: Cria uma nova chave e retorna a chave secreta completa (`key`) **apenas uma vez** na resposta.
* `DELETE /api/api-keys/{id}`: Revoga o acesso de uma chave pelo seu ID.

---

## 4. Como interagir programmaticamente via IA

Para ler as definições completas e os tipos de dados exatos estruturados para TypeScript/OpenAPI, direcione sua análise para o arquivo de especificação formal:

* [api.tsp](./api.tsp)

Este arquivo pode ser compilado para OpenAPI v3 ou Swagger usando a CLI do TypeSpec (`@typespec/compiler`) com o comando:
```bash
npx tsp compile api.tsp
```
Isso gerará os esquemas OpenAPI detalhados na pasta `tsp-output/`.
