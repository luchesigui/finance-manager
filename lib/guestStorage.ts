import type { Person, Transaction } from "@/lib/types";

const GUEST_COOKIE_NAME = "fp_guest";

type GuestData = {
  people: Array<Pick<Person, "id" | "name" | "income">>;
  defaultPayerId: string | null;
  categoryOverridesByName: Record<string, number>;
  transactions: Transaction[];
};

function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;
  const parts = document.cookie.split(";").map((p) => p.trim());
  for (const part of parts) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    const key = part.slice(0, eq).trim();
    if (key !== name) continue;
    return decodeURIComponent(part.slice(eq + 1));
  }
  return null;
}

function getGuestId(): string | null {
  return getCookieValue(GUEST_COOKIE_NAME);
}

function keyFor(guestId: string, suffix: string): string {
  return `fp_guest_data_v1:${guestId}:${suffix}`;
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore (quota, private mode, etc.)
  }
}

export function getGuestData(): GuestData | null {
  const guestId = getGuestId();
  if (!guestId) return null;

  const people = readJson<GuestData["people"]>(keyFor(guestId, "people"), []);
  const defaultPayerId = readJson<GuestData["defaultPayerId"]>(
    keyFor(guestId, "defaultPayerId"),
    null,
  );
  const categoryOverridesByName = readJson<GuestData["categoryOverridesByName"]>(
    keyFor(guestId, "categoryOverridesByName"),
    {},
  );
  const transactions = readJson<GuestData["transactions"]>(keyFor(guestId, "transactions"), []);

  return { people, defaultPayerId, categoryOverridesByName, transactions };
}

export function ensureGuestPeople(): Array<Pick<Person, "id" | "name" | "income">> {
  const guestId = getGuestId();
  if (!guestId) return [];
  const peopleKey = keyFor(guestId, "people");
  const people = readJson<Array<Pick<Person, "id" | "name" | "income">>>(peopleKey, []);
  if (people.length > 0) return people;

  const defaultPersonId = `g:${crypto.randomUUID()}`;
  const seeded = [{ id: defaultPersonId, name: "Você", income: 0 }];
  writeJson(peopleKey, seeded);
  writeJson(keyFor(guestId, "defaultPayerId"), defaultPersonId);
  return seeded;
}

export function setGuestPeople(people: Array<Pick<Person, "id" | "name" | "income">>) {
  const guestId = getGuestId();
  if (!guestId) return;
  writeJson(keyFor(guestId, "people"), people);
}

export function getGuestDefaultPayerId(): string | null {
  const guestId = getGuestId();
  if (!guestId) return null;
  return readJson<string | null>(keyFor(guestId, "defaultPayerId"), null);
}

export function setGuestDefaultPayerId(personId: string) {
  const guestId = getGuestId();
  if (!guestId) return;
  writeJson(keyFor(guestId, "defaultPayerId"), personId);
}

export function getGuestCategoryOverridesByName(): Record<string, number> {
  const guestId = getGuestId();
  if (!guestId) return {};
  return readJson<Record<string, number>>(keyFor(guestId, "categoryOverridesByName"), {});
}

export function setGuestCategoryOverridesByName(overrides: Record<string, number>) {
  const guestId = getGuestId();
  if (!guestId) return;
  writeJson(keyFor(guestId, "categoryOverridesByName"), overrides);
}

export function getGuestTransactions(): Transaction[] {
  const guestId = getGuestId();
  if (!guestId) return [];
  return readJson<Transaction[]>(keyFor(guestId, "transactions"), []);
}

export function setGuestTransactions(transactions: Transaction[]) {
  const guestId = getGuestId();
  if (!guestId) return;
  writeJson(keyFor(guestId, "transactions"), transactions);
}

export function clearGuestData() {
  const guestId = getGuestId();
  if (!guestId) return;
  try {
    localStorage.removeItem(keyFor(guestId, "people"));
    localStorage.removeItem(keyFor(guestId, "defaultPayerId"));
    localStorage.removeItem(keyFor(guestId, "categoryOverridesByName"));
    localStorage.removeItem(keyFor(guestId, "transactions"));
  } catch {
    // ignore
  }
}
