import { getRequest } from "@/test/apiHelpers";
import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("GET /api/users", () => {
  it("rejects unauthenticated requests", async () => {
    const res = await GET(new Request("http://localhost/api/users"));
    expect(res.status).toBe(401);
  });

  it("returns the seeded users", async () => {
    const res = await GET(getRequest("/api/users"));
    expect(res.status).toBe(200);
    const list = await res.json();
    expect(list.map((u: any) => u.id).sort()).toEqual(["amanda", "guilherme"]);
    expect(list[0]).toHaveProperty("avatarInitials");
  });
});
