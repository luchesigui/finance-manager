import { vi } from "vitest";

/** Shape of a transaction as returned by GET /api/transactions (DB row). */
export interface ApiTransaction {
  id: string;
  createdByUserId: string;
  transactionType: "expense" | "income" | "transfer";
  description: string;
  amount: number; // cents
  categoryId: string | null;
  date: string; // YYYY-MM-DD
  assignedToUserId: string;
  paraQuemUserId: string | null;
  isCreditCard: number;
  nextInvoice: number;
  naoEntraDivisao: number;
  isPrevisao: number;
  isRecorrente: number;
  isParcelado: number;
  numParcelas: number | null;
  parcelaNumero: number | null;
  recurrenceTemplateId: string | null;
  isOverridden: number;
  isDeleted: number;
}

let txCounter = 0;

export function makeApiTransaction(overrides: Partial<ApiTransaction> = {}): ApiTransaction {
  txCounter += 1;
  const d = new Date();
  const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return {
    id: `tx-${txCounter}`,
    createdByUserId: "guilherme",
    transactionType: "expense",
    description: `Transação ${txCounter}`,
    amount: 1000,
    categoryId: "alimentacao",
    date: today,
    assignedToUserId: "guilherme",
    paraQuemUserId: null,
    isCreditCard: 0,
    nextInvoice: 0,
    naoEntraDivisao: 0,
    isPrevisao: 0,
    isRecorrente: 0,
    isParcelado: 0,
    numParcelas: null,
    parcelaNumero: null,
    recurrenceTemplateId: null,
    isOverridden: 0,
    isDeleted: 0,
    ...overrides,
  };
}

export const DEFAULT_CATEGORIES = [
  { id: "alimentacao", name: "Alimentação", slug: "alimentacao", pillarSlug: "essenciais" },
  { id: "moradia", name: "Moradia", slug: "moradia", pillarSlug: "essenciais" },
  { id: "lazer", name: "Lazer e Entretenimento", slug: "lazer", pillarSlug: "prazeres" },
];

export const DEFAULT_USERS = [
  { id: "guilherme", name: "Guilherme", avatarInitials: "GU" },
  { id: "amanda", name: "Amanda", avatarInitials: "AM" },
];

export const DEFAULT_SETTINGS = {
  id: "default",
  defaultPayerId: "guilherme",
  emergencyFund: 3500000,
  openrouterKey: null,
  theme: "dark",
  pillarTargets: {
    essenciais: 50,
    conforto: 15,
    prazeres: 10,
    conhecimento: 5,
    planejamento: 10,
    liberdade: 10,
  },
};

export interface RecordedCall {
  url: string;
  method: string;
  body?: any;
}

/**
 * Stubs global fetch with an in-memory API. Returns the recorded calls so
 * tests can assert on the payloads the component sent.
 */
export function installFetchMock(
  options: {
    transactions?: ApiTransaction[];
    categories?: typeof DEFAULT_CATEGORIES;
  } = {},
) {
  const { transactions = [], categories = DEFAULT_CATEGORIES } = options;
  const calls: RecordedCall[] = [];

  const respond = (data: unknown) => ({
    ok: true,
    status: 200,
    json: async () => data,
  });

  const fetchMock = vi.fn(async (input: unknown, init?: RequestInit) => {
    const url = String(input);
    const method = init?.method ?? "GET";
    const body = typeof init?.body === "string" ? JSON.parse(init.body) : undefined;
    calls.push({ url, method, body });

    if (url.startsWith("/api/categories")) {
      if (method === "GET") return respond(categories);
      return respond({ success: true, id: body?.slug ?? "nova-categoria" });
    }
    if (url.startsWith("/api/transactions")) {
      if (method === "GET") return respond(transactions);
      return respond({ success: true });
    }
    if (url.startsWith("/api/users")) {
      return respond(DEFAULT_USERS);
    }
    if (url.startsWith("/api/settings")) {
      if (method === "GET") return respond(DEFAULT_SETTINGS);
      return respond({ success: true });
    }
    return respond({});
  });

  vi.stubGlobal("fetch", fetchMock);
  return { calls, fetchMock };
}

export function findCall(
  calls: RecordedCall[],
  method: string,
  urlPart: string,
): RecordedCall | undefined {
  return calls.find((c) => c.method === method && c.url.includes(urlPart));
}
