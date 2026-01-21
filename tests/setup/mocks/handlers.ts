import { http, HttpResponse } from "msw";
import { mockCategories, mockPeople } from "../test-utils";

// Get current year/month for mock transactions
const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = String(now.getMonth() + 1).padStart(2, "0");

// Mock transactions with current date
const mockTransactionsWithCurrentDate = [
  {
    id: 1,
    description: "Aluguel",
    amount: 1500,
    categoryId: "cat-1",
    paidBy: "person-1",
    isRecurring: true,
    isCreditCard: false,
    excludeFromSplit: false,
    isForecast: false,
    date: `${currentYear}-${currentMonth}-01`,
    type: "expense" as const,
    isIncrement: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    description: "Mercado",
    amount: 500,
    categoryId: "cat-1",
    paidBy: "person-2",
    isRecurring: false,
    isCreditCard: false,
    excludeFromSplit: false,
    isForecast: false,
    date: `${currentYear}-${currentMonth}-15`,
    type: "expense" as const,
    isIncrement: true,
    createdAt: new Date().toISOString(),
  },
];

// ============================================================================
// MSW Handlers for API Mocking
// ============================================================================

export const handlers = [
  // People endpoints
  http.get("/api/people", () => {
    return HttpResponse.json(mockPeople);
  }),

  http.post("/api/people", async ({ request }) => {
    const body = (await request.json()) as { name: string; income: number };
    const newPerson = {
      id: `person-${Date.now()}`,
      name: body.name,
      income: body.income,
    };
    return HttpResponse.json(newPerson);
  }),

  http.patch("/api/people", async ({ request }) => {
    const body = (await request.json()) as {
      personId: string;
      patch: { name?: string; income?: number };
    };
    const person = mockPeople.find((p) => p.id === body.personId);
    if (!person) {
      return HttpResponse.json({ error: "Person not found" }, { status: 404 });
    }
    return HttpResponse.json({ ...person, ...body.patch });
  }),

  http.delete("/api/people", ({ request }) => {
    const url = new URL(request.url);
    const personId = url.searchParams.get("personId");
    if (!personId) {
      return HttpResponse.json({ error: "personId required" }, { status: 400 });
    }
    return HttpResponse.json({ success: true });
  }),

  // Categories endpoints
  http.get("/api/categories", () => {
    return HttpResponse.json(mockCategories);
  }),

  http.patch("/api/categories", async ({ request }) => {
    const body = (await request.json()) as {
      categoryId: string;
      patch: { name?: string; targetPercent?: number };
    };
    const category = mockCategories.find((c) => c.id === body.categoryId);
    if (!category) {
      return HttpResponse.json({ error: "Category not found" }, { status: 404 });
    }
    return HttpResponse.json({ ...category, ...body.patch });
  }),

  // Transactions endpoints
  http.get("/api/transactions", () => {
    // Always return the mock transactions with current date
    return HttpResponse.json(mockTransactionsWithCurrentDate);
  }),

  http.post("/api/transactions", async ({ request }) => {
    const body = await request.json();
    const transactions = Array.isArray(body) ? body : [body];

    const created = transactions.map((t, index) => ({
      id: Date.now() + index,
      ...t,
      createdAt: new Date().toISOString(),
    }));

    return HttpResponse.json(created.length === 1 ? created[0] : created);
  }),

  http.patch("/api/transactions/:id", async ({ params, request }) => {
    const { id } = params;
    const body = (await request.json()) as { patch: Record<string, unknown> };
    const transaction = mockTransactionsWithCurrentDate.find((t) => t.id === Number(id));

    if (!transaction) {
      return HttpResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    return HttpResponse.json({ ...transaction, ...body.patch });
  }),

  http.delete("/api/transactions/:id", ({ params }) => {
    const { id } = params;
    const transaction = mockTransactionsWithCurrentDate.find((t) => t.id === Number(id));

    if (!transaction) {
      return HttpResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    return new HttpResponse(null, { status: 204 });
  }),

  // Bulk operations
  http.patch("/api/transactions/bulk", async ({ request }) => {
    const body = (await request.json()) as {
      ids: number[];
      patch: Record<string, unknown>;
    };

    const updated = mockTransactionsWithCurrentDate
      .filter((t) => body.ids.includes(t.id))
      .map((t) => ({ ...t, ...body.patch }));

    return HttpResponse.json(updated);
  }),

  http.delete("/api/transactions/bulk", async ({ request }) => {
    const body = (await request.json()) as { ids: number[] };
    if (!body.ids || body.ids.length === 0) {
      return HttpResponse.json({ error: "No ids provided" }, { status: 400 });
    }
    return HttpResponse.json({ success: true, deleted: body.ids.length });
  }),

  // Default payer endpoints
  http.get("/api/default-payer", () => {
    return HttpResponse.json({ defaultPayerId: "person-1" });
  }),

  http.patch("/api/default-payer", async ({ request }) => {
    const body = (await request.json()) as { personId: string };
    return HttpResponse.json({ defaultPayerId: body.personId });
  }),

  // User endpoint
  http.get("/api/user", () => {
    return HttpResponse.json({ userId: "user-123" });
  }),
];
