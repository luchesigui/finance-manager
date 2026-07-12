import { describe, expect, it, beforeEach } from "vitest";
import { db } from "./db";
import * as schema from "./schema";
import { getEssentialExpensesAverage } from "./queries";

describe("getEssentialExpensesAverage", () => {
  beforeEach(() => {
    db.delete(schema.transactions).run();
    db.delete(schema.recurrenceTemplates).run();
    db.delete(schema.settings).run();
    db.delete(schema.categories).run();
    db.delete(schema.users).run();
    db.insert(schema.users)
      .values({ id: "u1", name: "User 1", avatarInitials: "U1" })
      .run();
    db.insert(schema.categories)
      .values({ id: "c1", name: "Aluguel", slug: "aluguel", pillarSlug: "essenciais" })
      .run();
  });

  it("calculates average based on 3 previous months and ignores current month", async () => {
    // Current month: 2026-07
    // Window: 2026-06, 2026-05, 2026-04

    // Transaction in current month (should be ignored)
    db.insert(schema.transactions).values({
      id: "t1",
      description: "Current",
      amount: 100000,
      date: "2026-07-10",
      categoryId: "c1",
      transactionType: "expense",
      createdByUserId: "u1",
      assignedToUserId: "u1",
    }).run();

    // Transaction in 2026-06
    db.insert(schema.transactions).values({
      id: "t2",
      description: "June",
      amount: 300000,
      date: "2026-06-15",
      categoryId: "c1",
      transactionType: "expense",
      createdByUserId: "u1",
      assignedToUserId: "u1",
    }).run();

    // Transaction in 2026-05
    db.insert(schema.transactions).values({
      id: "t3",
      description: "May",
      amount: 100000,
      date: "2026-05-15",
      categoryId: "c1",
      transactionType: "expense",
      createdByUserId: "u1",
      assignedToUserId: "u1",
    }).run();

    const avg = await getEssentialExpensesAverage("2026-07");
    // Average of 2026-06 (3000) and 2026-05 (1000) = 2000. 
    // Divided by 2 (months with data), not 3.
    expect(avg).toBe(200000);
  });

  it("divides by 1 if only one previous month has data", async () => {
    db.insert(schema.transactions).values({
      id: "t4",
      description: "June",
      amount: 500000,
      date: "2026-06-15",
      categoryId: "c1",
      transactionType: "expense",
      createdByUserId: "u1",
      assignedToUserId: "u1",
    }).run();

    const avg = await getEssentialExpensesAverage("2026-07");
    expect(avg).toBe(500000);
  });

  it("returns 0 if no previous months have data", async () => {
    const avg = await getEssentialExpensesAverage("2026-07");
    expect(avg).toBe(0);
  });
});
