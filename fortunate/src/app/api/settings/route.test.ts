import { getRequest, jsonRequest } from "@/test/apiHelpers";
import { DEFAULT_PILLAR_TARGETS } from "@/utils/pillars";
import { describe, expect, it } from "vitest";
import { GET, PUT } from "./route";

describe("GET /api/settings", () => {
  it("rejects unauthenticated requests", async () => {
    const res = await GET(new Request("http://localhost/api/settings"));
    expect(res.status).toBe(401);
  });

  it("returns the seeded settings with parsed pillar targets", async () => {
    const res = await GET(getRequest("/api/settings"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe("default");
    expect(body.defaultPayerId).toBe("guilherme");
    expect(body.pillarTargets).toEqual(DEFAULT_PILLAR_TARGETS);
  });
});

describe("PUT /api/settings", () => {
  it("updates emergency fund and default payer", async () => {
    const res = await PUT(
      jsonRequest("/api/settings", {
        method: "PUT",
        body: { emergencyFund: 1000000, defaultPayerId: "amanda" },
      }),
    );
    expect(res.status).toBe(200);

    const body = await (await GET(getRequest("/api/settings"))).json();
    expect(body.emergencyFund).toBe(1000000);
    expect(body.defaultPayerId).toBe("amanda");

    // restaura o pagador padrão para não vazar estado entre testes
    await PUT(
      jsonRequest("/api/settings", {
        method: "PUT",
        body: { defaultPayerId: "guilherme" },
      }),
    );
  });

  it("persists pillar targets that sum to 100", async () => {
    const targets = {
      essenciais: 40,
      conforto: 20,
      prazeres: 10,
      conhecimento: 10,
      planejamento: 10,
      liberdade: 10,
    };
    const res = await PUT(
      jsonRequest("/api/settings", { method: "PUT", body: { pillarTargets: targets } }),
    );
    expect(res.status).toBe(200);

    const body = await (await GET(getRequest("/api/settings"))).json();
    expect(body.pillarTargets).toEqual(targets);
  });

  it("rejects pillar targets that do not sum to 100", async () => {
    const res = await PUT(
      jsonRequest("/api/settings", {
        method: "PUT",
        body: {
          pillarTargets: {
            essenciais: 50,
            conforto: 20,
            prazeres: 10,
            conhecimento: 10,
            planejamento: 10,
            liberdade: 10,
          },
        },
      }),
    );
    expect(res.status).toBe(400);
  });

  it("rejects an unknown default payer", async () => {
    const res = await PUT(
      jsonRequest("/api/settings", {
        method: "PUT",
        body: { defaultPayerId: "desconhecido" },
      }),
    );
    expect(res.status).toBe(400);
  });
});
