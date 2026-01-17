/**
 * Shared API client for making HTTP requests with consistent error handling.
 * Eliminates code duplication across context files.
 */

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly url: string,
    public readonly method: string,
    message?: string,
  ) {
    super(message ?? `${method} ${url} failed with status ${status}`);
    this.name = "ApiError";
  }
}

/**
 * Type-safe fetch wrapper with automatic JSON parsing and error handling.
 * @param url - The URL to fetch
 * @param requestInit - Optional fetch init options
 * @returns Parsed JSON response
 * @throws ApiError on non-2xx responses
 */
export async function fetchJson<T>(url: string, requestInit?: RequestInit): Promise<T> {
  const method = requestInit?.method ?? "GET";

  const response = await fetch(url, requestInit);

  if (!response.ok) {
    throw new ApiError(response.status, url, method);
  }

  return (await response.json()) as T;
}

/**
 * Helper to build JSON request options
 */
export function jsonRequestInit(
  method: "POST" | "PATCH" | "PUT" | "DELETE",
  body: unknown,
): RequestInit {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}
