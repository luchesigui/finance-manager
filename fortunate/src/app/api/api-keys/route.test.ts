import { getRequest, jsonRequest, routeParams } from "@/test/apiHelpers";
import { describe, expect, it } from "vitest";
import { DELETE } from "./[id]/route";
import { GET, POST } from "./route";

describe("GET /api/api-keys", () => {
  it("rejects unauthenticated requests", async () => {
    const res = await GET(new Request("http://localhost/api/api-keys"));
    expect(res.status).toBe(401);
  });

  it("lists keys masked, never the full key", async () => {
    const createRes = await POST(jsonRequest("/api/api-keys", { body: { name: "n8n" } }));
    const created = await createRes.json();

    const res = await GET(getRequest("/api/api-keys"));
    expect(res.status).toBe(200);
    const list = await res.json();
    const row = list.find((k: any) => k.id === created.id);
    expect(row).toBeDefined();
    expect(row.keyPreview).toBe(`${created.key.slice(0, 12)}…`);
    expect(row.key).toBeUndefined();
  });
});

describe("POST /api/api-keys", () => {
  it("generates a server-side key and returns it once", async () => {
    const res = await POST(jsonRequest("/api/api-keys", { body: { name: "cli" } }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.key).toMatch(/^fortunate_key_[0-9a-f]{48}$/);
    expect(body.name).toBe("cli");
  });

  it("rejects an empty name", async () => {
    const res = await POST(jsonRequest("/api/api-keys", { body: { name: "" } }));
    expect(res.status).toBe(400);
  });
});

describe("DELETE /api/api-keys/[id]", () => {
  it("revokes a key", async () => {
    const created = await (
      await POST(jsonRequest("/api/api-keys", { body: { name: "temp" } }))
    ).json();

    const res = await DELETE(
      jsonRequest(`/api/api-keys/${created.id}`, { method: "DELETE" }),
      routeParams(created.id),
    );
    expect(res.status).toBe(200);

    const list = await (await GET(getRequest("/api/api-keys"))).json();
    expect(list.find((k: any) => k.id === created.id)).toBeUndefined();
  });
});
