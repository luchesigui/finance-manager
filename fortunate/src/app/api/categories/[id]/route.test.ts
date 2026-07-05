import { createTransaction, getTransactionsForMonth } from "@/db/queries";
import { getRequest, jsonRequest, routeParams } from "@/test/apiHelpers";
import { describe, expect, it } from "vitest";
import { GET, POST } from "../route";
import { DELETE } from "./route";

describe("DELETE /api/categories/[id]", () => {
  it("rejects unauthenticated requests", async () => {
    const res = await DELETE(
      new Request("http://localhost/api/categories/x", { method: "DELETE" }),
      routeParams("x"),
    );
    expect(res.status).toBe(401);
  });

  it("deletes the category and nulls references on transactions", async () => {
    const created = await (
      await POST(
        jsonRequest("/api/categories", {
          body: { name: "Temporária", slug: "temporaria", pillarSlug: "prazeres" },
        }),
      )
    ).json();

    await createTransaction({
      transactionType: "expense",
      description: "Gasto na categoria temporária",
      amount: 1234,
      categoryId: created.id,
      date: "2026-07-10",
    });

    const res = await DELETE(
      jsonRequest(`/api/categories/${created.id}`, { method: "DELETE" }),
      routeParams(created.id),
    );
    expect(res.status).toBe(200);

    const list = await (await GET(getRequest("/api/categories"))).json();
    expect(list.find((c: any) => c.id === created.id)).toBeUndefined();

    const txs = await getTransactionsForMonth("2026-07");
    const tx = txs.find((t) => t.description === "Gasto na categoria temporária");
    expect(tx).toBeDefined();
    expect(tx?.categoryId).toBeNull();
  });
});
