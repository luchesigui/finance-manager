import { db } from "@/db/db";
import { createRecurrenceTemplate, getTransactionsForMonth } from "@/db/queries";
import * as schema from "@/db/schema";
import { jsonRequest, routeParams } from "@/test/apiHelpers";
import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { DELETE, PUT } from "./route";

interface Instances {
  templateId: string;
  july: any;
  august: any;
  september: any;
}

/** Creates an "Academia" recurring expense and materializes Jul–Sep 2026. */
async function seedRecurringExpense(): Promise<Instances> {
  const templateId = await createRecurrenceTemplate({
    transactionType: "expense",
    description: "Academia",
    amount: 10000,
    categoryId: "saude",
    dayOfMonth: 10,
    startDate: "2026-07-10",
  });

  const [july] = await getTransactionsForMonth("2026-07");
  const [august] = await getTransactionsForMonth("2026-08");
  const [september] = await getTransactionsForMonth("2026-09");

  return { templateId, july, august, september };
}

function getTx(id: string) {
  return db.select().from(schema.transactions).where(eq(schema.transactions.id, id)).get();
}

function getTemplate(id: string) {
  return db
    .select()
    .from(schema.recurrenceTemplates)
    .where(eq(schema.recurrenceTemplates.id, id))
    .get();
}

function putRequest(id: string, updatedFields: object, option: string) {
  return PUT(
    jsonRequest(`/api/transactions/${id}`, {
      method: "PUT",
      body: { updatedFields, option },
    }),
    routeParams(id),
  );
}

function deleteRequest(id: string, option?: string) {
  const qs = option ? `?option=${option}` : "";
  return DELETE(jsonRequest(`/api/transactions/${id}${qs}`, { method: "DELETE" }), routeParams(id));
}

describe("PUT /api/transactions/[id] — validation", () => {
  it("rejects an invalid payload", async () => {
    const res = await putRequest("whatever", { amount: -5 }, "only_this");
    expect(res.status).toBe(400);
  });

  it("returns 500 for a transaction that does not exist", async () => {
    const res = await putRequest("nao-existe", { amount: 5000 }, "only_this");
    expect(res.status).toBe(500);
  });
});

describe("PUT /api/transactions/[id] — non-recurring", () => {
  it("updates the transaction directly", async () => {
    db.insert(schema.transactions)
      .values({
        id: "tx-simple",
        createdByUserId: "guilherme",
        transactionType: "expense",
        description: "Padaria",
        amount: 2000,
        date: "2026-07-03",
        assignedToUserId: "guilherme",
      })
      .run();

    const res = await putRequest(
      "tx-simple",
      { amount: 2500, description: "Padaria da esquina" },
      "only_this",
    );
    expect(res.status).toBe(200);
    expect(getTx("tx-simple")).toMatchObject({
      amount: 2500,
      description: "Padaria da esquina",
      isOverridden: 0,
    });
  });
});

describe("PUT /api/transactions/[id] — recurring scopes", () => {
  it("only_this: overrides a single occurrence and leaves the rest untouched", async () => {
    const { templateId, july, august, september } = await seedRecurringExpense();

    const res = await putRequest(august.id, { amount: 12000 }, "only_this");
    expect(res.status).toBe(200);

    expect(getTx(august.id)).toMatchObject({ amount: 12000, isOverridden: 1 });
    expect(getTx(july.id)).toMatchObject({ amount: 10000, isOverridden: 0 });
    expect(getTx(september.id)).toMatchObject({ amount: 10000, isOverridden: 0 });
    expect(getTemplate(templateId)).toMatchObject({ amount: 10000, isActive: 1 });
  });

  it("all: updates the template and every non-overridden instance", async () => {
    const { templateId, july, august, september } = await seedRecurringExpense();

    const res = await putRequest(
      august.id,
      { amount: 15000, description: "Academia Premium" },
      "all",
    );
    expect(res.status).toBe(200);

    expect(getTemplate(templateId)).toMatchObject({
      amount: 15000,
      description: "Academia Premium",
    });
    for (const tx of [july, august, september]) {
      expect(getTx(tx.id)).toMatchObject({ amount: 15000, description: "Academia Premium" });
    }
  });

  it("all: preserves the custom values of previously overridden occurrences", async () => {
    const { july, august } = await seedRecurringExpense();

    await putRequest(july.id, { amount: 9000 }, "only_this");
    await putRequest(august.id, { description: "Academia Anual" }, "all");

    // July was overridden before, so the bulk update must not touch it…
    expect(getTx(july.id)).toMatchObject({ amount: 9000 });
    // …but August (the edited one) gets the new description.
    expect(getTx(august.id)).toMatchObject({ description: "Academia Anual" });
  });

  it("future: closes the old template and moves this and future occurrences to a new one", async () => {
    const { templateId, july, august, september } = await seedRecurringExpense();

    const res = await putRequest(august.id, { amount: 20000 }, "future");
    expect(res.status).toBe(200);

    // Old template is closed the day before the edited occurrence
    expect(getTemplate(templateId)).toMatchObject({ isActive: 0, endDate: "2026-08-09" });

    // July keeps the old value and template link
    expect(getTx(july.id)).toMatchObject({ amount: 10000, recurrenceTemplateId: templateId });

    // August and September moved to the new template with the new value
    const updatedAugust = getTx(august.id)!;
    const updatedSeptember = getTx(september.id)!;
    expect(updatedAugust.amount).toBe(20000);
    expect(updatedSeptember.amount).toBe(20000);
    expect(updatedAugust.recurrenceTemplateId).not.toBe(templateId);
    expect(updatedSeptember.recurrenceTemplateId).toBe(updatedAugust.recurrenceTemplateId);
    expect(getTemplate(updatedAugust.recurrenceTemplateId!)).toMatchObject({
      amount: 20000,
      isActive: 1,
    });
  });

  it("future: later months materialize from the new template with the new value", async () => {
    const { august } = await seedRecurringExpense();

    await putRequest(august.id, { amount: 20000 }, "future");

    const october = await getTransactionsForMonth("2026-10");
    expect(october).toHaveLength(1);
    expect(october[0].amount).toBe(20000);

    // No duplicate is created for already-materialized months
    const september = await getTransactionsForMonth("2026-09");
    expect(september).toHaveLength(1);
    expect(september[0].amount).toBe(20000);
  });
});

describe("DELETE /api/transactions/[id]", () => {
  it("rejects an invalid option", async () => {
    const res = await deleteRequest("qualquer", "everything");
    expect(res.status).toBe(400);
  });

  it("soft deletes a non-recurring transaction", async () => {
    db.insert(schema.transactions)
      .values({
        id: "tx-del",
        createdByUserId: "guilherme",
        transactionType: "expense",
        description: "Cinema",
        amount: 4000,
        date: "2026-07-08",
        assignedToUserId: "guilherme",
      })
      .run();

    const res = await deleteRequest("tx-del");
    expect(res.status).toBe(200);
    expect(getTx("tx-del")?.isDeleted).toBe(1);

    const july = await getTransactionsForMonth("2026-07");
    expect(july).toHaveLength(0);
  });

  it("only_this: removes one occurrence and does not re-materialize it", async () => {
    const { july, august, september } = await seedRecurringExpense();

    await deleteRequest(august.id, "only_this");

    expect(getTx(august.id)?.isDeleted).toBe(1);
    expect(getTx(july.id)?.isDeleted).toBe(0);
    expect(getTx(september.id)?.isDeleted).toBe(0);

    // Fetching August again must not resurrect the deleted occurrence
    const augustList = await getTransactionsForMonth("2026-08");
    expect(augustList).toHaveLength(0);
  });

  it("future: removes this and later occurrences and closes the template", async () => {
    const { templateId, july, august, september } = await seedRecurringExpense();

    await deleteRequest(august.id, "future");

    expect(getTx(july.id)?.isDeleted).toBe(0);
    expect(getTx(august.id)?.isDeleted).toBe(1);
    expect(getTx(september.id)?.isDeleted).toBe(1);
    expect(getTemplate(templateId)).toMatchObject({ isActive: 0, endDate: "2026-08-09" });

    // Later months must not materialize new occurrences
    const october = await getTransactionsForMonth("2026-10");
    expect(october).toHaveLength(0);
  });

  it("all: removes every occurrence and deactivates the template", async () => {
    const { templateId, july, august, september } = await seedRecurringExpense();

    await deleteRequest(july.id, "all");

    for (const tx of [july, august, september]) {
      expect(getTx(tx.id)?.isDeleted).toBe(1);
    }
    expect(getTemplate(templateId)?.isActive).toBe(0);
  });
});
