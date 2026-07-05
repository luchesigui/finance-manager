import { getRequest, jsonRequest } from "@/test/apiHelpers";
import { describe, expect, it } from "vitest";
import { GET, POST } from "./route";

describe("GET /api/categories", () => {
  it("rejects unauthenticated requests", async () => {
    const res = await GET(new Request("http://localhost/api/categories"));
    expect(res.status).toBe(401);
  });

  it("returns the seeded categories", async () => {
    const res = await GET(getRequest("/api/categories"));
    expect(res.status).toBe(200);
    const list = await res.json();
    expect(list.length).toBeGreaterThan(0);
    expect(list.map((c: any) => c.id)).toContain("alimentacao");
  });
});

describe("POST /api/categories", () => {
  it("creates a category and returns its id", async () => {
    const res = await POST(
      jsonRequest("/api/categories", {
        body: { name: "Pets", slug: "pets", pillarSlug: "conforto" },
      }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);

    const list = await (await GET(getRequest("/api/categories"))).json();
    const created = list.find((c: any) => c.id === body.id);
    expect(created).toMatchObject({ name: "Pets", slug: "pets", pillarSlug: "conforto" });
  });

  it("rejects an unknown pillar", async () => {
    const res = await POST(
      jsonRequest("/api/categories", {
        body: { name: "Estranha", slug: "estranha", pillarSlug: "inexistente" },
      }),
    );
    expect(res.status).toBe(400);
  });

  it("rejects an empty name", async () => {
    const res = await POST(
      jsonRequest("/api/categories", {
        body: { name: "", slug: "vazia", pillarSlug: "conforto" },
      }),
    );
    expect(res.status).toBe(400);
  });
});
