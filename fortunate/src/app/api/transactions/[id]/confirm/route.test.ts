import { db } from "@/db/db";
import * as schema from "@/db/schema";
import { jsonRequest, routeParams } from "@/test/apiHelpers";
import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { POST } from "./route";

describe("POST /api/transactions/[id]/confirm", () => {
  it("rejects unauthenticated requests", async () => {
    const res = await POST(
      new Request("http://localhost/api/transactions/tx-1/confirm", { method: "POST" }),
      routeParams("tx-1"),
    );
    expect(res.status).toBe(401);
  });

  it("turns a previsão into a confirmed transaction", async () => {
    db.insert(schema.transactions)
      .values({
        id: "tx-previsao",
        createdByUserId: "guilherme",
        transactionType: "expense",
        description: "Conta de luz",
        amount: 18000,
        date: "2026-07-20",
        assignedToUserId: "guilherme",
        isPrevisao: 1,
      })
      .run();

    const res = await POST(
      jsonRequest("/api/transactions/tx-previsao/confirm", { method: "POST" }),
      routeParams("tx-previsao"),
    );
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);

    const tx = db
      .select()
      .from(schema.transactions)
      .where(eq(schema.transactions.id, "tx-previsao"))
      .get();
    expect(tx?.isPrevisao).toBe(0);
  });
});
