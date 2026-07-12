import crypto from "node:crypto";
import { and, desc, eq, gte, lte, or, sql } from "drizzle-orm";
import { db } from "./db";
import * as schema from "./schema";

// Helper: Get previous month string (e.g., "2026-07" -> "2026-06")
export function getPrevMonth(monthStr: string): string {
  const [yearStr, monthNumStr] = monthStr.split("-");
  let year = Number.parseInt(yearStr, 10);
  let month = Number.parseInt(monthNumStr, 10);

  month -= 1;
  if (month === 0) {
    month = 12;
    year -= 1;
  }

  return `${year}-${String(month).padStart(2, "0")}`;
}

// Helper: Get next month string (e.g., "2026-07" -> "2026-08")
export function getNextMonth(monthStr: string): string {
  const [yearStr, monthNumStr] = monthStr.split("-");
  let year = Number.parseInt(yearStr, 10);
  let month = Number.parseInt(monthNumStr, 10);

  month += 1;
  if (month === 13) {
    month = 1;
    year += 1;
  }

  return `${year}-${String(month).padStart(2, "0")}`;
}

// Helper: Get total days in a month
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

// Helper: Format day of month properly capping at max days (e.g., 31 for Feb -> 28)
export function formatDayOfMonth(monthStr: string, day: number): string {
  const [yearStr, monthNumStr] = monthStr.split("-");
  const year = Number.parseInt(yearStr, 10);
  const month = Number.parseInt(monthNumStr, 10);
  const maxDays = getDaysInMonth(year, month);
  const cappedDay = Math.min(day, maxDays);
  return `${monthStr}-${String(cappedDay).padStart(2, "0")}`;
}

function addMonths(dateStr: string, monthsToAdd: number): string {
  const [yearStr, monthStr, dayStr] = dateStr.split("-");
  const date = new Date(Number(yearStr), Number(monthStr) - 1 + monthsToAdd, 1);
  return formatDayOfMonth(
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
    Number(dayStr),
  );
}

// Get all categories
export async function getCategories() {
  return db.select().from(schema.categories).all();
}

// Get all users
export async function getUsers() {
  return db.select().from(schema.users).all();
}

// Query transactions for a given month reference (including recurring instantiations and fatura mappings)
export async function getTransactionsForMonth(monthStr: string) {
  const prevMonthStr = getPrevMonth(monthStr);

  // 1. Materialize recurring transactions if they don't exist yet for monthStr
  await materializeRecurringForMonth(monthStr);

  // 2. Fetch transactions for monthStr
  // A transaction belongs to monthStr if:
  // - date starts with monthStr AND nextInvoice = 0
  // - OR date starts with prevMonthStr AND nextInvoice = 1
  const allTxs = db
    .select()
    .from(schema.transactions)
    .where(
      and(
        eq(schema.transactions.isDeleted, 0),
        or(
          and(
            sql`strftime('%Y-%m', ${schema.transactions.date}) = ${monthStr}`,
            eq(schema.transactions.nextInvoice, 0),
          ),
          and(
            sql`strftime('%Y-%m', ${schema.transactions.date}) = ${prevMonthStr}`,
            eq(schema.transactions.nextInvoice, 1),
          ),
        ),
      ),
    )
    .orderBy(desc(schema.transactions.date))
    .all();

  return allTxs;
}

// Materialize recurring template instances for a specific month
async function materializeRecurringForMonth(monthStr: string) {
  const prevMonthStr = getPrevMonth(monthStr);

  // Get active templates for monthStr
  // An active template must have:
  // - startDate <= last day of monthStr
  // - endDate is null or >= first day of monthStr
  // - isActive = 1
  const firstDay = `${monthStr}-01`;
  const lastDay = `${monthStr}-31`; // sqlite text comparison works well enough for dates YYYY-MM-DD

  const templates = db
    .select()
    .from(schema.recurrenceTemplates)
    .where(
      and(
        eq(schema.recurrenceTemplates.isActive, 1),
        lte(schema.recurrenceTemplates.startDate, lastDay),
        or(
          sql`${schema.recurrenceTemplates.endDate} IS NULL`,
          gte(schema.recurrenceTemplates.endDate, firstDay),
        ),
      ),
    )
    .all();

  for (const template of templates) {
    // Determine the month in which the transaction is actually registered/saved
    // If the template has nextInvoice = 1, it counts for monthStr, which means it occurred in prevMonthStr!
    // If nextInvoice = 0, it counts for monthStr and occurred in monthStr.
    const purchaseMonth = template.nextInvoice === 1 ? prevMonthStr : monthStr;
    const purchaseDate = formatDayOfMonth(purchaseMonth, template.dayOfMonth);
    if (
      purchaseDate < template.startDate ||
      (template.endDate && purchaseDate > template.endDate)
    ) {
      continue;
    }

    // Check if we already have a transaction instance for this template in monthStr
    // That means:
    // - associated with the template ID
    // - AND counts for monthStr (either date in monthStr with nextInvoice=0, or date in prevMonthStr with nextInvoice=1)
    const existing = db
      .select()
      .from(schema.transactions)
      .where(
        and(
          eq(schema.transactions.recurrenceTemplateId, template.id),
          or(
            and(
              sql`strftime('%Y-%m', ${schema.transactions.date}) = ${monthStr}`,
              eq(schema.transactions.nextInvoice, 0),
            ),
            and(
              sql`strftime('%Y-%m', ${schema.transactions.date}) = ${prevMonthStr}`,
              eq(schema.transactions.nextInvoice, 1),
            ),
          ),
        ),
      )
      .all();
    const activeExisting = existing.filter((tx) => tx.isDeleted === 0);

    for (const duplicate of activeExisting.slice(1)) {
      db.update(schema.transactions)
        .set({ isDeleted: 1 })
        .where(eq(schema.transactions.id, duplicate.id))
        .run();
    }

    if (existing.length === 0) {
      // Create the transaction instance
      db.insert(schema.transactions)
        .values({
          id: crypto.randomUUID(),
          createdByUserId: template.createdByUserId,
          transactionType: template.transactionType,
          description: template.description,
          amount: template.amount,
          categoryId: template.categoryId,
          pillarSlug: template.pillarSlug,
          date: purchaseDate,
          assignedToUserId: template.assignedToUserId,
          paraQuemUserId: template.paraQuemUserId,
          isCreditCard: template.isCreditCard,
          nextInvoice: template.nextInvoice,
          naoEntraDivisao: template.naoEntraDivisao,
          isPrevisao: template.isPrevisao, // starts as forecast if template specifies it
          isRecorrente: 1,
          isParcelado: 0,
          recurrenceTemplateId: template.id,
          isOverridden: 0,
          isDeleted: 0,
        })
        .run();
    }
  }
}

// Create a new transaction
export async function createTransaction(data: {
  createdByUserId?: string | null;
  transactionType: "expense" | "income" | "transfer";
  description: string;
  amount: number; // in cents
  categoryId?: string | null;
  pillarSlug?: string | null;
  date: string; // YYYY-MM-DD
  assignedToUserId?: string | null;
  paraQuemUserId?: string | null;
  isCreditCard?: boolean;
  nextInvoice?: boolean;
  naoEntraDivisao?: boolean;
  isPrevisao?: boolean;
  isRecorrente?: boolean;
  isParcelado?: boolean;
  numParcelas?: number | null;
  recurrenceTemplateId?: string | null;
}) {
  const defaultPayerId = await getDefaultPayerId();
  const createdBy = data.createdByUserId || defaultPayerId;
  const assignedTo = data.assignedToUserId || defaultPayerId;

  const isParcelado = !!data.isParcelado;
  const numParcelas = data.numParcelas || 1;

  if (isParcelado && numParcelas > 1) {
    // Generate all N installments and link them to a finite template used as the group id.
    const templateId = crypto.randomUUID();
    const installmentAmount = Math.round(data.amount / numParcelas);
    const endDate = addMonths(data.date, numParcelas - 1);

    db.insert(schema.recurrenceTemplates)
      .values({
        id: templateId,
        createdByUserId: createdBy,
        transactionType: data.transactionType,
        description: data.description,
        amount: installmentAmount,
        categoryId: data.categoryId || null,
        pillarSlug: data.pillarSlug || null,
        assignedToUserId: assignedTo,
        paraQuemUserId: data.paraQuemUserId || null,
        dayOfMonth: Number.parseInt(data.date.split("-")[2], 10),
        startDate: data.date,
        endDate,
        isActive: 0,
        isCreditCard: data.isCreditCard ? 1 : 0,
        nextInvoice: data.nextInvoice ? 1 : 0,
        naoEntraDivisao: data.naoEntraDivisao ? 1 : 0,
        isPrevisao: data.isPrevisao ? 1 : 0,
      })
      .run();

    for (let i = 1; i <= numParcelas; i++) {
      const installmentDate = addMonths(data.date, i - 1);

      // If nextInvoice is checked, the first installment is shifted to next month,
      // and subsequent installments are shifted accordingly.
      // In Drizzle, we store the actual date and let nextInvoice push it visually.
      db.insert(schema.transactions)
        .values({
          id: crypto.randomUUID(),
          createdByUserId: createdBy,
          transactionType: data.transactionType,
          description: `${data.description} (${i}/${numParcelas})`,
          amount: installmentAmount,
          categoryId: data.categoryId || null,
          pillarSlug: data.pillarSlug || null,
          date: installmentDate,
          assignedToUserId: assignedTo,
          paraQuemUserId: data.paraQuemUserId || null,
          isCreditCard: data.isCreditCard ? 1 : 0,
          nextInvoice: data.nextInvoice ? 1 : 0,
          naoEntraDivisao: data.naoEntraDivisao ? 1 : 0,
          isPrevisao: data.isPrevisao ? 1 : 0,
          isRecorrente: 0,
          isParcelado: 1,
          numParcelas: numParcelas,
          parcelaNumero: i,
          recurrenceTemplateId: templateId,
          isOverridden: 0,
          isDeleted: 0,
        })
        .run();
    }
    return { success: true, count: numParcelas };
  }
  // Single transaction
  const txId = crypto.randomUUID();
  db.insert(schema.transactions)
    .values({
      id: txId,
      createdByUserId: createdBy,
      transactionType: data.transactionType,
      description: data.description,
      amount: data.amount,
      categoryId: data.categoryId || null,
      pillarSlug: data.pillarSlug || null,
      date: data.date,
      assignedToUserId: assignedTo,
      paraQuemUserId: data.paraQuemUserId || null,
      isCreditCard: data.isCreditCard ? 1 : 0,
      nextInvoice: data.nextInvoice ? 1 : 0,
      naoEntraDivisao: data.naoEntraDivisao ? 1 : 0,
      isPrevisao: data.isPrevisao ? 1 : 0,
      isRecorrente: data.isRecorrente ? 1 : 0,
      isParcelado: 0,
      recurrenceTemplateId: data.recurrenceTemplateId || null,
      isOverridden: 0,
      isDeleted: 0,
    })
    .run();

  return { success: true, id: txId };
}

// Create a recurrence template
export async function createRecurrenceTemplate(data: {
  createdByUserId?: string | null;
  transactionType: "expense" | "income" | "transfer";
  description: string;
  amount: number;
  categoryId?: string | null;
  pillarSlug?: string | null;
  assignedToUserId?: string | null;
  paraQuemUserId?: string | null;
  dayOfMonth: number;
  startDate: string; // YYYY-MM-DD
  isCreditCard?: boolean;
  nextInvoice?: boolean;
  naoEntraDivisao?: boolean;
  isPrevisao?: boolean;
}) {
  const defaultPayerId = await getDefaultPayerId();
  const createdBy = data.createdByUserId || defaultPayerId;
  const assignedTo = data.assignedToUserId || defaultPayerId;

  const templateId = crypto.randomUUID();
  db.insert(schema.recurrenceTemplates)
    .values({
      id: templateId,
      createdByUserId: createdBy,
      transactionType: data.transactionType,
      description: data.description,
      amount: data.amount,
      categoryId: data.categoryId || null,
      pillarSlug: data.pillarSlug || null,
      assignedToUserId: assignedTo,
      paraQuemUserId: data.paraQuemUserId || null,
      dayOfMonth: data.dayOfMonth,
      startDate: data.startDate,
      isCreditCard: data.isCreditCard ? 1 : 0,
      nextInvoice: data.nextInvoice ? 1 : 0,
      naoEntraDivisao: data.naoEntraDivisao ? 1 : 0,
      isPrevisao: data.isPrevisao ? 1 : 0,
      isActive: 1,
    })
    .run();

  return templateId;
}

// Confirm forecast transaction
export async function confirmTransaction(id: string) {
  db.update(schema.transactions).set({ isPrevisao: 0 }).where(eq(schema.transactions.id, id)).run();
  return { success: true };
}

// Delete transaction with options for recurrence
export async function deleteTransaction(
  id: string,
  option: "only_this" | "all" | "future" = "only_this",
) {
  const tx = db.select().from(schema.transactions).where(eq(schema.transactions.id, id)).get();

  if (!tx) throw new Error("Transaction not found");

  if (tx.isParcelado && tx.recurrenceTemplateId) {
    if (option === "only_this") {
      db.update(schema.transactions)
        .set({ isDeleted: 1 })
        .where(eq(schema.transactions.id, id))
        .run();
    } else if (option === "all") {
      db.update(schema.transactions)
        .set({ isDeleted: 1 })
        .where(eq(schema.transactions.recurrenceTemplateId, tx.recurrenceTemplateId))
        .run();
      db.update(schema.recurrenceTemplates)
        .set({ isActive: 0 })
        .where(eq(schema.recurrenceTemplates.id, tx.recurrenceTemplateId))
        .run();
    } else if (option === "future") {
      db.update(schema.transactions)
        .set({ isDeleted: 1 })
        .where(
          and(
            eq(schema.transactions.recurrenceTemplateId, tx.recurrenceTemplateId),
            gte(schema.transactions.parcelaNumero, tx.parcelaNumero || 0),
          ),
        )
        .run();
    }
    return { success: true };
  }

  if (!tx.recurrenceTemplateId) {
    // Non-recurring transaction, simple soft delete
    db.update(schema.transactions)
      .set({ isDeleted: 1 })
      .where(eq(schema.transactions.id, id))
      .run();
    return { success: true };
  }

  const templateId = tx.recurrenceTemplateId;

  if (option === "only_this") {
    // Soft delete only this transaction
    db.update(schema.transactions)
      .set({ isDeleted: 1 })
      .where(eq(schema.transactions.id, id))
      .run();
  } else if (option === "all") {
    // Soft delete all transactions of this template
    db.update(schema.transactions)
      .set({ isDeleted: 1 })
      .where(eq(schema.transactions.recurrenceTemplateId, templateId))
      .run();

    // Deactivate the template
    db.update(schema.recurrenceTemplates)
      .set({ isActive: 0 })
      .where(eq(schema.recurrenceTemplates.id, templateId))
      .run();
  } else if (option === "future") {
    // Soft delete this and all future transactions of this template (date >= current date)
    db.update(schema.transactions)
      .set({ isDeleted: 1 })
      .where(
        and(
          eq(schema.transactions.recurrenceTemplateId, templateId),
          gte(schema.transactions.date, tx.date),
        ),
      )
      .run();

    // End the template validation before this date
    // end_date becomes previous day of current transaction
    const [yearStr, monthStr, dayStr] = tx.date.split("-");
    const year = Number.parseInt(yearStr, 10);
    const month = Number.parseInt(monthStr, 10);
    const day = Number.parseInt(dayStr, 10);
    const prevDate = new Date(year, month - 1, day - 1);
    const prevDateStr = prevDate.toISOString().split("T")[0];

    db.update(schema.recurrenceTemplates)
      .set({ endDate: prevDateStr, isActive: 0 })
      .where(eq(schema.recurrenceTemplates.id, templateId))
      .run();
  }

  return { success: true };
}

// Update transaction with options for recurrence
export async function updateTransaction(
  id: string,
  updatedFields: {
    description?: string;
    amount?: number; // in cents
    categoryId?: string | null;
    pillarSlug?: string | null;
    date?: string; // YYYY-MM-DD
    assignedToUserId?: string;
    paraQuemUserId?: string | null;
    isCreditCard?: boolean;
    nextInvoice?: boolean;
    naoEntraDivisao?: boolean;
    isPrevisao?: boolean;
    transactionType?: "expense" | "income" | "transfer";
    ignored?: boolean;
  },
  option: "only_this" | "all" | "future" = "only_this",
) {
  const tx = db.select().from(schema.transactions).where(eq(schema.transactions.id, id)).get();

  if (!tx) throw new Error("Transaction not found");

  const mappedFields: Record<string, unknown> = { ...updatedFields };
  if (updatedFields.isCreditCard !== undefined)
    mappedFields.isCreditCard = updatedFields.isCreditCard ? 1 : 0;
  if (updatedFields.nextInvoice !== undefined)
    mappedFields.nextInvoice = updatedFields.nextInvoice ? 1 : 0;
  if (updatedFields.naoEntraDivisao !== undefined)
    mappedFields.naoEntraDivisao = updatedFields.naoEntraDivisao ? 1 : 0;
  if (updatedFields.isPrevisao !== undefined)
    mappedFields.isPrevisao = updatedFields.isPrevisao ? 1 : 0;
  if (updatedFields.ignored !== undefined) mappedFields.ignored = updatedFields.ignored ? 1 : 0;

  const installmentMatch = tx.description.match(/^(.*) \((\d+)\/(\d+)\)$/);
  if (tx.isParcelado && tx.numParcelas && tx.parcelaNumero && installmentMatch) {
    const [, currentBase] = installmentMatch;
    const newBase =
      updatedFields.description?.match(/^(.*) \((\d+)\/(\d+)\)$/)?.[1] ?? updatedFields.description;
    const installments = tx.recurrenceTemplateId
      ? db
          .select()
          .from(schema.transactions)
          .where(
            and(
              eq(schema.transactions.recurrenceTemplateId, tx.recurrenceTemplateId),
              eq(schema.transactions.isDeleted, 0),
            ),
          )
          .all()
      : db
          .select()
          .from(schema.transactions)
          .where(
            and(
              eq(schema.transactions.isParcelado, 1),
              eq(schema.transactions.numParcelas, tx.numParcelas),
              eq(schema.transactions.createdByUserId, tx.createdByUserId),
              eq(schema.transactions.isDeleted, 0),
            ),
          )
          .all()
          .filter(
            (candidate) =>
              candidate.description.match(/^(.*) \((\d+)\/(\d+)\)$/)?.[1] === currentBase,
          );

    for (const installment of installments) {
      const fields = { ...mappedFields };
      if (newBase)
        fields.description = `${newBase} (${installment.parcelaNumero}/${tx.numParcelas})`;
      if (updatedFields.date && installment.parcelaNumero) {
        fields.date = addMonths(updatedFields.date, installment.parcelaNumero - tx.parcelaNumero);
      }
      db.update(schema.transactions)
        .set(fields)
        .where(eq(schema.transactions.id, installment.id))
        .run();
    }

    if (tx.recurrenceTemplateId) {
      const templateFields: Record<string, unknown> = {};
      if (newBase) templateFields.description = newBase;
      if (updatedFields.amount !== undefined) templateFields.amount = updatedFields.amount;
      if (updatedFields.categoryId !== undefined)
        templateFields.categoryId = updatedFields.categoryId;
      if (updatedFields.pillarSlug !== undefined)
        templateFields.pillarSlug = updatedFields.pillarSlug;
      if (updatedFields.assignedToUserId !== undefined)
        templateFields.assignedToUserId = updatedFields.assignedToUserId;
      if (updatedFields.paraQuemUserId !== undefined)
        templateFields.paraQuemUserId = updatedFields.paraQuemUserId;
      if (updatedFields.isCreditCard !== undefined)
        templateFields.isCreditCard = mappedFields.isCreditCard;
      if (updatedFields.nextInvoice !== undefined)
        templateFields.nextInvoice = mappedFields.nextInvoice;
      if (updatedFields.naoEntraDivisao !== undefined)
        templateFields.naoEntraDivisao = mappedFields.naoEntraDivisao;
      if (updatedFields.isPrevisao !== undefined)
        templateFields.isPrevisao = mappedFields.isPrevisao;
      if (updatedFields.transactionType !== undefined)
        templateFields.transactionType = updatedFields.transactionType;
      if (updatedFields.date) {
        const startDate = addMonths(updatedFields.date, 1 - tx.parcelaNumero);
        templateFields.startDate = startDate;
        templateFields.endDate = addMonths(startDate, tx.numParcelas - 1);
        templateFields.dayOfMonth = Number.parseInt(startDate.split("-")[2], 10);
      }
      if (Object.keys(templateFields).length > 0) {
        db.update(schema.recurrenceTemplates)
          .set(templateFields)
          .where(eq(schema.recurrenceTemplates.id, tx.recurrenceTemplateId))
          .run();
      }
    }

    return { success: true };
  }

  if (!tx.recurrenceTemplateId) {
    // Non-recurring transaction, simple update
    db.update(schema.transactions).set(mappedFields).where(eq(schema.transactions.id, id)).run();
    return { success: true };
  }

  const templateId = tx.recurrenceTemplateId;

  if (option === "only_this") {
    // Update only this transaction and set isOverridden = 1
    db.update(schema.transactions)
      .set({ ...mappedFields, isOverridden: 1 })
      .where(eq(schema.transactions.id, id))
      .run();
  } else if (option === "all") {
    // 1. Update the template
    const templateFields: Record<string, unknown> = {};
    if (updatedFields.description !== undefined)
      templateFields.description = updatedFields.description;
    if (updatedFields.amount !== undefined) templateFields.amount = updatedFields.amount;
    if (updatedFields.categoryId !== undefined)
      templateFields.categoryId = updatedFields.categoryId;
    if (updatedFields.pillarSlug !== undefined)
      templateFields.pillarSlug = updatedFields.pillarSlug;
    if (updatedFields.assignedToUserId !== undefined)
      templateFields.assignedToUserId = updatedFields.assignedToUserId;
    if (updatedFields.paraQuemUserId !== undefined)
      templateFields.paraQuemUserId = updatedFields.paraQuemUserId;
    if (updatedFields.isCreditCard !== undefined)
      templateFields.isCreditCard = mappedFields.isCreditCard;
    if (updatedFields.nextInvoice !== undefined)
      templateFields.nextInvoice = mappedFields.nextInvoice;
    if (updatedFields.naoEntraDivisao !== undefined)
      templateFields.naoEntraDivisao = mappedFields.naoEntraDivisao;
    if (updatedFields.isPrevisao !== undefined) templateFields.isPrevisao = mappedFields.isPrevisao;

    if (Object.keys(templateFields).length > 0) {
      db.update(schema.recurrenceTemplates)
        .set(templateFields)
        .where(eq(schema.recurrenceTemplates.id, templateId))
        .run();
    }

    // 2. Update all non-overridden, non-deleted instances of this template
    // We update values but keep their dates original (only date in updatedFields will be ignored for other instances)
    const bulkFields = { ...mappedFields };
    bulkFields.date = undefined; // do not bulk update date

    db.update(schema.transactions)
      .set(bulkFields)
      .where(
        and(
          eq(schema.transactions.recurrenceTemplateId, templateId),
          eq(schema.transactions.isOverridden, 0),
          eq(schema.transactions.isDeleted, 0),
        ),
      )
      .run();

    // Make sure we update the specific transaction itself even if it has overrides or date changes
    db.update(schema.transactions).set(mappedFields).where(eq(schema.transactions.id, id)).run();
  } else if (option === "future") {
    // 1. End validity of current template RT before the current transaction's date
    const [yearStr, monthStr, dayStr] = tx.date.split("-");
    const year = Number.parseInt(yearStr, 10);
    const month = Number.parseInt(monthStr, 10);
    const day = Number.parseInt(dayStr, 10);
    const prevDate = new Date(year, month - 1, day - 1);
    const prevDateStr = prevDate.toISOString().split("T")[0];

    db.update(schema.recurrenceTemplates)
      .set({ endDate: prevDateStr, isActive: 0 })
      .where(eq(schema.recurrenceTemplates.id, templateId))
      .run();

    // Fetch current template to copy values
    const currentTemplate = db
      .select()
      .from(schema.recurrenceTemplates)
      .where(eq(schema.recurrenceTemplates.id, templateId))
      .get();

    if (!currentTemplate) throw new Error("Template not found");

    // 2. Create new template RT_new with updated values and startDate = current transaction date
    const newTemplateId = crypto.randomUUID();
    const newTemplate = {
      id: newTemplateId,
      createdByUserId: currentTemplate.createdByUserId,
      transactionType: updatedFields.transactionType || currentTemplate.transactionType,
      description:
        updatedFields.description !== undefined
          ? updatedFields.description
          : currentTemplate.description,
      amount: updatedFields.amount !== undefined ? updatedFields.amount : currentTemplate.amount,
      categoryId:
        updatedFields.categoryId !== undefined
          ? updatedFields.categoryId
          : currentTemplate.categoryId,
      pillarSlug:
        updatedFields.pillarSlug !== undefined
          ? updatedFields.pillarSlug
          : currentTemplate.pillarSlug,
      assignedToUserId:
        updatedFields.assignedToUserId !== undefined
          ? updatedFields.assignedToUserId
          : currentTemplate.assignedToUserId,
      paraQuemUserId:
        updatedFields.paraQuemUserId !== undefined
          ? updatedFields.paraQuemUserId
          : currentTemplate.paraQuemUserId,
      dayOfMonth: updatedFields.date
        ? Number.parseInt(updatedFields.date.split("-")[2], 10)
        : currentTemplate.dayOfMonth,
      startDate: updatedFields.date || tx.date,
      isCreditCard:
        updatedFields.isCreditCard !== undefined
          ? updatedFields.isCreditCard
            ? 1
            : 0
          : currentTemplate.isCreditCard,
      nextInvoice:
        updatedFields.nextInvoice !== undefined
          ? updatedFields.nextInvoice
            ? 1
            : 0
          : currentTemplate.nextInvoice,
      naoEntraDivisao:
        updatedFields.naoEntraDivisao !== undefined
          ? updatedFields.naoEntraDivisao
            ? 1
            : 0
          : currentTemplate.naoEntraDivisao,
      isPrevisao:
        updatedFields.isPrevisao !== undefined
          ? updatedFields.isPrevisao
            ? 1
            : 0
          : currentTemplate.isPrevisao,
      isActive: 1,
    };

    db.insert(schema.recurrenceTemplates).values(newTemplate).run();

    // 3. Update future transactions of current template (date >= current transaction date)
    // Point their recurrenceTemplateId to RT_new.id
    // If they are not overridden, also update their values
    const bulkFields = { ...mappedFields, recurrenceTemplateId: newTemplateId };
    const bulkFieldsWithoutValues = { recurrenceTemplateId: newTemplateId };

    // Update non-overridden future transactions with new values
    db.update(schema.transactions)
      .set(bulkFields)
      .where(
        and(
          eq(schema.transactions.recurrenceTemplateId, templateId),
          gte(schema.transactions.date, tx.date),
          eq(schema.transactions.isOverridden, 0),
          eq(schema.transactions.isDeleted, 0),
        ),
      )
      .run();

    // For overridden future transactions, just change their template ID link so they don't break,
    // but keep their custom values
    db.update(schema.transactions)
      .set(bulkFieldsWithoutValues)
      .where(
        and(
          eq(schema.transactions.recurrenceTemplateId, templateId),
          gte(schema.transactions.date, tx.date),
          eq(schema.transactions.isOverridden, 1),
          eq(schema.transactions.isDeleted, 0),
        ),
      )
      .run();

    // Finally update this specific transaction to apply all requested edits
    db.update(schema.transactions)
      .set({ ...mappedFields, recurrenceTemplateId: newTemplateId })
      .where(eq(schema.transactions.id, id))
      .run();
  }

  return { success: true };
}

// Get all recurrence templates
export async function getRecurrenceTemplates() {
  return db.select().from(schema.recurrenceTemplates).all();
}

// Create a new category
export async function createCategory(name: string, slug: string, pillarSlug: string) {
  const id = crypto.randomUUID();
  db.insert(schema.categories).values({ id, name, slug, pillarSlug }).run();
  return id;
}

// Delete a category, cleaning up references first (FKs are not enforced by better-sqlite3 here)
export async function deleteCategory(id: string) {
  db.update(schema.transactions)
    .set({ categoryId: null })
    .where(eq(schema.transactions.categoryId, id))
    .run();
  db.update(schema.recurrenceTemplates)
    .set({ categoryId: null })
    .where(eq(schema.recurrenceTemplates.categoryId, id))
    .run();
  db.delete(schema.categories).where(eq(schema.categories.id, id)).run();
  return { success: true };
}

// Get settings
export async function getSettings() {
  return db.select().from(schema.settings).where(eq(schema.settings.id, "default")).get();
}

// Update settings
export async function updateSettings(fields: {
  defaultPayerId?: string;
  emergencyFund?: number;
  openrouterKey?: string | null;
  theme?: string;
  pillarTargets?: string; // JSON: { [pillarSlug]: percent }
}) {
  db.update(schema.settings).set(fields).where(eq(schema.settings.id, "default")).run();
  return { success: true };
}

// Get default payer ID
export async function getDefaultPayerId(): Promise<string> {
  const row = await getSettings();
  return row?.defaultPayerId || "guilherme";
}

// Get all API keys
export async function getApiKeys() {
  return db.select().from(schema.apiKeys).all();
}

// Create named API key
export async function createApiKey(name: string, key: string) {
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  db.insert(schema.apiKeys).values({ id, name, key, createdAt }).run();
  return { id, name, key, createdAt };
}

// Delete API key
export async function deleteApiKey(id: string) {
  db.delete(schema.apiKeys).where(eq(schema.apiKeys.id, id)).run();
  return { success: true };
}

// Validate API key token
export async function validateApiKey(key: string): Promise<boolean> {
  const row = db.select().from(schema.apiKeys).where(eq(schema.apiKeys.key, key)).get();
  return !!row;
}

// Reserves
export async function getReserves() {
  return db.select().from(schema.reserves).all();
}

export async function createReserve(data: {
  name: string;
  type: string;
  currentAmount: number;
  targetAmount?: number | null;
  monthlyContribution?: number | null;
  targetDate?: string | null;
  status?: string;
}) {
  const id = crypto.randomUUID();
  db.insert(schema.reserves)
    .values({
      id,
      name: data.name,
      type: data.type,
      currentAmount: data.currentAmount,
      targetAmount: data.targetAmount ?? null,
      monthlyContribution: data.monthlyContribution ?? null,
      targetDate: data.targetDate ?? null,
      status: data.status ?? "active",
      updatedAt: new Date().toISOString(),
    })
    .run();
  return { success: true, id };
}

export async function updateReserve(id: string, data: any) {
  db.update(schema.reserves)
    .set({
      ...data,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(schema.reserves.id, id))
    .run();
  return { success: true };
}

export async function deleteReserve(id: string) {
  db.delete(schema.reserves).where(eq(schema.reserves.id, id)).run();
  return { success: true };
}

export async function getEssentialExpensesAverage(currentMonth: string, windowMonths = 3) {
  const monthsToFetch: string[] = [];
  let tempMonth = currentMonth;
  for (let i = 0; i < windowMonths; i++) {
    tempMonth = getPrevMonth(tempMonth);
    monthsToFetch.push(tempMonth);
  }

  const categories = await getCategories();
  const essentialCategoryIds = new Set(
    categories.filter((c) => c.pillarSlug === "essenciais").map((c) => c.id),
  );

  let totalAmount = 0;
  let monthsWithData = 0;

  for (const m of monthsToFetch) {
    const txs = await getTransactionsForMonth(m);
    const essentialTxs = txs.filter(
      (tx) =>
        tx.transactionType === "expense" &&
        (tx.pillarSlug === "essenciais" ||
          (!tx.pillarSlug && tx.categoryId && essentialCategoryIds.has(tx.categoryId))) &&
        !tx.ignored,
    );

    if (txs.length > 0) {
      const monthTotal = essentialTxs.reduce((sum, tx) => sum + tx.amount, 0);
      totalAmount += monthTotal;
      monthsWithData++;
    }
  }

  return monthsWithData > 0 ? Math.round(totalAmount / monthsWithData) : 0;
}
