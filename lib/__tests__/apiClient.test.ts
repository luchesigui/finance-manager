import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, fetchJson, jsonRequestInit } from "../apiClient";

describe("apiClient", () => {
  describe("ApiError", () => {
    it("creates an error with correct properties", () => {
      const error = new ApiError(404, "/api/test", "GET");
      expect(error.status).toBe(404);
      expect(error.url).toBe("/api/test");
      expect(error.method).toBe("GET");
      expect(error.name).toBe("ApiError");
    });

    it("generates default message from status, url, and method", () => {
      const error = new ApiError(500, "/api/users", "POST");
      expect(error.message).toBe("POST /api/users failed with status 500");
    });

    it("uses custom message when provided", () => {
      const error = new ApiError(401, "/api/auth", "GET", "Unauthorized access");
      expect(error.message).toBe("Unauthorized access");
    });

    it("extends Error class", () => {
      const error = new ApiError(400, "/api/test", "PATCH");
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApiError);
    });
  });

  describe("jsonRequestInit", () => {
    it("creates POST request options", () => {
      const body = { name: "Test" };
      const result = jsonRequestInit("POST", body);

      expect(result.method).toBe("POST");
      expect(result.headers).toEqual({ "Content-Type": "application/json" });
      expect(result.body).toBe(JSON.stringify(body));
    });

    it("creates PATCH request options", () => {
      const body = { name: "Updated" };
      const result = jsonRequestInit("PATCH", body);

      expect(result.method).toBe("PATCH");
      expect(result.body).toBe(JSON.stringify(body));
    });

    it("creates PUT request options", () => {
      const body = { id: 1, name: "Test" };
      const result = jsonRequestInit("PUT", body);

      expect(result.method).toBe("PUT");
      expect(result.body).toBe(JSON.stringify(body));
    });

    it("creates DELETE request options", () => {
      const body = { ids: [1, 2, 3] };
      const result = jsonRequestInit("DELETE", body);

      expect(result.method).toBe("DELETE");
      expect(result.body).toBe(JSON.stringify(body));
    });

    it("handles complex nested objects", () => {
      const body = {
        user: {
          name: "Test",
          settings: {
            notifications: true,
            theme: "dark",
          },
        },
        items: [1, 2, 3],
      };
      const result = jsonRequestInit("POST", body);

      expect(JSON.parse(result.body as string)).toEqual(body);
    });

    it("handles arrays as body", () => {
      const body = [1, 2, 3];
      const result = jsonRequestInit("POST", body);

      expect(JSON.parse(result.body as string)).toEqual([1, 2, 3]);
    });
  });

  describe("fetchJson", () => {
    const mockFetch = vi.fn();

    beforeEach(() => {
      vi.stubGlobal("fetch", mockFetch);
      mockFetch.mockReset();
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it("returns parsed JSON on successful response", async () => {
      const responseData = { id: 1, name: "Test" };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(responseData),
      });

      const result = await fetchJson<{ id: number; name: string }>("/api/test");

      expect(result).toEqual(responseData);
      expect(mockFetch).toHaveBeenCalledWith("/api/test", undefined);
    });

    it("passes request options to fetch", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      const options: RequestInit = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test: true }),
      };

      await fetchJson("/api/test", options);

      expect(mockFetch).toHaveBeenCalledWith("/api/test", options);
    });

    it("throws ApiError on non-ok response", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
      });

      await expect(fetchJson("/api/test")).rejects.toThrow(ApiError);
      await expect(fetchJson("/api/test")).rejects.toMatchObject({
        status: 404,
        url: "/api/test",
        method: "GET",
      });
    });

    it("uses correct method in error for non-GET requests", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
      });

      await expect(fetchJson("/api/test", { method: "POST" })).rejects.toMatchObject({
        method: "POST",
      });
    });

    it("handles different HTTP methods", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const methods = ["POST", "PUT", "PATCH", "DELETE"] as const;

      for (const method of methods) {
        await fetchJson("/api/test", { method });
        expect(mockFetch).toHaveBeenLastCalledWith("/api/test", { method });
      }
    });
  });
});
