import { db } from "@/db/db";
import * as schema from "@/db/schema";
import { getRequest, jsonRequest } from "@/test/apiHelpers";
import { describe, expect, it } from "vitest";
import { GET, POST } from "./route";

function allReserves() {
  return db.select().from(schema.reserves).all();
}

describe("GET /api/reserves", () => {
  it("rejects unauthorized requests", async () => {
    const res = await GET(new Request("http://localhost/api/reserves"));
    expect(res.status).toBe(401);
  });

  it("returns reserves and essential avg", async () => {
    // Seed some essential expenses
    db.insert(schema.categories)
      .values({ id: "c1", name: "Essencial", slug: "essencial", pillarSlug: "essenciais" })
      .run();
    db.insert(schema.transactions)
      .values({
        id: "t1",
        description: "Mercado",
        amount: 100000, // 1000.00
        date: "2026-06-10",
        categoryId: "c1",
        transactionType: "expense",
        createdByUserId: "guilherme",
        assignedToUserId: "guilherme",
      })
      .run();

    const res = await GET(getRequest("/api/reserves?month=2026-07"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.reserves).toBeInstanceOf(Array);
    expect(body.essentialAvg).toBeGreaterThan(0);
  });
});

describe("POST /api/reserves", () => {
  it("creates a reserve", async () => {
    const res = await POST(
      jsonRequest("/api/reserves", {
        body: {
          name: "Reserva de Emergência",
          type: "emergency",
          currentAmount: 500000,
          targetAmount: 3000000,
          monthlyContribution: 100000,
        },
      }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);

    const rows = allReserves();
    expect(rows).toHaveLength(1);
    expect(rows[0].name).toBe("Reserva de Emergência");
    expect(rows[0].type).toBe("emergency");
  });

  it("validates input", async () => {
    const res = await POST(
      jsonRequest("/api/reserves", {
        body: { name: "", type: "invalid" as any },
      }),
    );
    expect(res.status).toBe(400);
  });
});
