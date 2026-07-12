import { db } from "@/db/db";
import { getTransactionsForMonth } from "@/db/queries";
import * as schema from "@/db/schema";
import { getRequest, jsonRequest } from "@/test/apiHelpers";
import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { GET, POST } from "./route";

function allTransactions() {
  return db.select().from(schema.transactions).all();
}

function allTemplates() {
  return db.select().from(schema.recurrenceTemplates).all();
}

describe("GET /api/transactions — auth", () => {
  it("rejects requests without credentials", async () => {
    const res = await GET(new Request("http://localhost/api/transactions?month=2026-07"));
    expect(res.status).toBe(401);
  });

  it("rejects an invalid API key", async () => {
    const res = await GET(
      new Request("http://localhost/api/transactions?month=2026-07", {
        headers: { "x-api-key": "wrong-key" },
      }),
    );
    expect(res.status).toBe(401);
  });

  it("accepts a valid API key", async () => {
    db.insert(schema.apiKeys)
      .values({ id: "k1", name: "test", key: "secret-key", createdAt: "2026-07-01" })
      .run();

    const res = await GET(
      new Request("http://localhost/api/transactions?month=2026-07", {
        headers: { "x-api-key": "secret-key" },
      }),
    );
    expect(res.status).toBe(200);
  });

  it("accepts internal same-origin requests", async () => {
    const res = await GET(getRequest("/api/transactions?month=2026-07"));
    expect(res.status).toBe(200);
  });
});

describe("GET /api/transactions — validation and filtering", () => {
  it("rejects a malformed month", async () => {
    const res = await GET(getRequest("/api/transactions?month=julho"));
    expect(res.status).toBe(400);
  });

  it("returns only transactions belonging to the requested month", async () => {
    await POST(
      jsonRequest("/api/transactions", {
        body: { description: "Mercado julho", amount: 15000, date: "2026-07-10" },
      }),
    );
    await POST(
      jsonRequest("/api/transactions", {
        body: { description: "Mercado agosto", amount: 20000, date: "2026-08-10" },
      }),
    );

    const res = await GET(getRequest("/api/transactions?month=2026-07"));
    const list = await res.json();
    expect(list).toHaveLength(1);
    expect(list[0].description).toBe("Mercado julho");
  });

  it("returns transactions ordered by launch date descending", async () => {
    await POST(
      jsonRequest("/api/transactions", {
        body: { description: "Mais recente", amount: 1000, date: "2026-07-20" },
      }),
    );
    await POST(
      jsonRequest("/api/transactions", {
        body: { description: "Mais antiga", amount: 1000, date: "2026-07-01" },
      }),
    );

    const res = await GET(getRequest("/api/transactions?month=2026-07"));
    const list = await res.json();
    expect(list.map((tx: any) => tx.description)).toEqual(["Mais recente", "Mais antiga"]);
  });

  it("counts a next-invoice purchase in the following month", async () => {
    await POST(
      jsonRequest("/api/transactions", {
        body: {
          description: "Compra fatura seguinte",
          amount: 9900,
          date: "2026-06-20",
          isCreditCard: true,
          nextInvoice: true,
        },
      }),
    );

    const june = await (await GET(getRequest("/api/transactions?month=2026-06"))).json();
    const july = await (await GET(getRequest("/api/transactions?month=2026-07"))).json();

    expect(june).toHaveLength(0);
    expect(july).toHaveLength(1);
    expect(july[0].description).toBe("Compra fatura seguinte");
  });
});

describe("POST /api/transactions — validation", () => {
  it("rejects a missing description", async () => {
    const res = await POST(
      jsonRequest("/api/transactions", { body: { amount: 1000, date: "2026-07-10" } }),
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Validation Error");
  });

  it("rejects a non-positive amount", async () => {
    const res = await POST(
      jsonRequest("/api/transactions", {
        body: { description: "Grátis", amount: 0, date: "2026-07-10" },
      }),
    );
    expect(res.status).toBe(400);
  });

  it("rejects a malformed date", async () => {
    const res = await POST(
      jsonRequest("/api/transactions", {
        body: { description: "Data ruim", amount: 1000, date: "10/07/2026" },
      }),
    );
    expect(res.status).toBe(400);
  });

  it("rejects unknown user ids with 400", async () => {
    const res = await POST(
      jsonRequest("/api/transactions", {
        body: {
          description: "Usuário fantasma",
          amount: 1000,
          date: "2026-07-10",
          assignedToUserId: "nao-existe",
        },
      }),
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(JSON.stringify(body.details)).toContain("nao-existe");
  });
});

describe("POST /api/transactions — single transaction", () => {
  it("creates an expense and defaults the payer from settings", async () => {
    const res = await POST(
      jsonRequest("/api/transactions", {
        body: {
          description: "Padaria",
          amount: 2550,
          date: "2026-07-03",
          categoryId: "alimentacao",
        },
      }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);

    const rows = allTransactions();
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      description: "Padaria",
      amount: 2550,
      transactionType: "expense",
      assignedToUserId: "guilherme", // default payer from seeded settings
      isRecorrente: 0,
      isParcelado: 0,
    });
  });

  it("creates an expense with a custom pillarSlug override", async () => {
    const res = await POST(
      jsonRequest("/api/transactions", {
        body: {
          description: "Padaria Especial",
          amount: 2550,
          date: "2026-07-03",
          categoryId: "alimentacao",
          pillarSlug: "conforto",
        },
      }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);

    const rows = allTransactions();
    const padaria = rows.find((r) => r.description === "Padaria Especial");
    expect(padaria).toBeTruthy();
    expect(padaria?.pillarSlug).toBe("conforto");
  });
});

describe("POST /api/transactions — installments (parcelado)", () => {
  it("creates one transaction per installment with numbered descriptions", async () => {
    const res = await POST(
      jsonRequest("/api/transactions", {
        body: {
          description: "TV nova",
          amount: 100000,
          date: "2026-07-15",
          isParcelado: true,
          numParcelas: 3,
        },
      }),
    );
    const body = await res.json();
    expect(body).toMatchObject({ success: true, count: 3 });

    const rows = allTransactions().sort((a, b) => a.date.localeCompare(b.date));
    expect(rows.map((r) => r.description)).toEqual([
      "TV nova (1/3)",
      "TV nova (2/3)",
      "TV nova (3/3)",
    ]);
    expect(rows.map((r) => r.date)).toEqual(["2026-07-15", "2026-08-15", "2026-09-15"]);
    expect(rows.every((r) => r.amount === 33333 && r.isParcelado === 1)).toBe(true);
    expect(new Set(rows.map((r) => r.recurrenceTemplateId)).size).toBe(1);

    expect(allTemplates()).toMatchObject([
      {
        description: "TV nova",
        amount: 33333,
        startDate: "2026-07-15",
        endDate: "2026-09-15",
        isActive: 0,
      },
    ]);
  });

  it("caps installment dates at the end of shorter months", async () => {
    await POST(
      jsonRequest("/api/transactions", {
        body: {
          description: "Compra dia 31",
          amount: 30000,
          date: "2026-01-31",
          isParcelado: true,
          numParcelas: 3,
        },
      }),
    );

    const rows = allTransactions().sort((a, b) => a.date.localeCompare(b.date));
    expect(rows.map((r) => r.date)).toEqual(["2026-01-31", "2026-02-28", "2026-03-31"]);
  });
});

describe("POST /api/transactions — recurring (recorrente)", () => {
  it("creates a recurrence template instead of a transaction", async () => {
    const res = await POST(
      jsonRequest("/api/transactions", {
        body: {
          description: "Netflix",
          amount: 3990,
          date: "2026-07-15",
          categoryId: "assinaturas",
          isRecorrente: true,
        },
      }),
    );
    const body = await res.json();
    expect(body).toMatchObject({ success: true, type: "recorrente" });
    expect(body.templateId).toBeTruthy();

    expect(allTransactions()).toHaveLength(0);
    const templates = allTemplates();
    expect(templates).toHaveLength(1);
    expect(templates[0]).toMatchObject({
      description: "Netflix",
      amount: 3990,
      dayOfMonth: 15,
      startDate: "2026-07-15",
      isActive: 1,
    });
  });

  it("materializes one instance per month on GET, without duplicating", async () => {
    await POST(
      jsonRequest("/api/transactions", {
        body: {
          description: "Academia",
          amount: 12000,
          date: "2026-07-10",
          isRecorrente: true,
        },
      }),
    );

    const july1 = await (await GET(getRequest("/api/transactions?month=2026-07"))).json();
    expect(july1).toHaveLength(1);
    expect(july1[0]).toMatchObject({
      description: "Academia",
      amount: 12000,
      date: "2026-07-10",
      isRecorrente: 1,
    });
    expect(july1[0].recurrenceTemplateId).toBeTruthy();

    // Fetching the same month again must not duplicate the instance
    const july2 = await (await GET(getRequest("/api/transactions?month=2026-07"))).json();
    expect(july2).toHaveLength(1);

    // A later month gets its own instance
    const august = await (await GET(getRequest("/api/transactions?month=2026-08"))).json();
    expect(august).toHaveLength(1);
    expect(august[0].date).toBe("2026-08-10");
  });

  it("deduplicates existing instances for the same recurring template month", async () => {
    await POST(
      jsonRequest("/api/transactions", {
        body: {
          description: "Apple One",
          amount: 6690,
          date: "2026-06-29",
          isRecorrente: true,
          isCreditCard: true,
          nextInvoice: true,
        },
      }),
    );

    const [first] = await getTransactionsForMonth("2026-07");
    db.insert(schema.transactions)
      .values({ ...first, id: "apple-one-duplicate" })
      .run();

    const july = await (await GET(getRequest("/api/transactions?month=2026-07"))).json();
    expect(july.filter((tx: any) => tx.description === "Apple One")).toHaveLength(1);
    expect(db.select().from(schema.transactions).where(eq(schema.transactions.id, "apple-one-duplicate")).get()?.isDeleted).toBe(1);
  });

  it("does not materialize next-invoice purchases before their purchase start date", async () => {
    await POST(
      jsonRequest("/api/transactions", {
        body: {
          description: "Apple One",
          amount: 6690,
          date: "2026-06-29",
          isRecorrente: true,
          isCreditCard: true,
          nextInvoice: true,
        },
      }),
    );

    const june = await (await GET(getRequest("/api/transactions?month=2026-06"))).json();
    const july = await (await GET(getRequest("/api/transactions?month=2026-07"))).json();

    expect(june).toHaveLength(0);
    expect(july).toHaveLength(1);
    expect(july[0]).toMatchObject({ description: "Apple One", date: "2026-06-29" });
  });

  it("does not materialize before the template start date", async () => {
    await POST(
      jsonRequest("/api/transactions", {
        body: {
          description: "Spotify",
          amount: 2190,
          date: "2026-07-05",
          isRecorrente: true,
        },
      }),
    );

    const june = await (await GET(getRequest("/api/transactions?month=2026-06"))).json();
    expect(june).toHaveLength(0);
  });

  it("caps the recurrence day in shorter months", async () => {
    await POST(
      jsonRequest("/api/transactions", {
        body: {
          description: "Aluguel",
          amount: 250000,
          date: "2026-01-31",
          isRecorrente: true,
        },
      }),
    );

    const feb = await (await GET(getRequest("/api/transactions?month=2026-02"))).json();
    expect(feb).toHaveLength(1);
    expect(feb[0].date).toBe("2026-02-28");
  });

  it("keeps a previsão template generating previsão instances", async () => {
    await POST(
      jsonRequest("/api/transactions", {
        body: {
          description: "Conta de luz",
          amount: 18000,
          date: "2026-07-20",
          isRecorrente: true,
          isPrevisao: true,
        },
      }),
    );

    const july = await (await GET(getRequest("/api/transactions?month=2026-07"))).json();
    expect(july[0].isPrevisao).toBe(1);
  });
});
