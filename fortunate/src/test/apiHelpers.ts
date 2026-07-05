// Headers that make checkAuth treat the request as an internal same-origin call.
export const INTERNAL_HEADERS = { "sec-fetch-site": "same-origin" };

export function getRequest(
  url: string,
  headers: Record<string, string> = INTERNAL_HEADERS,
): Request {
  return new Request(`http://localhost${url}`, { headers });
}

export function jsonRequest(
  url: string,
  options: {
    method?: string;
    body?: unknown;
    headers?: Record<string, string>;
  } = {},
): Request {
  const { method = "POST", body, headers = {} } = options;
  return new Request(`http://localhost${url}`, {
    method,
    headers: {
      "content-type": "application/json",
      ...INTERNAL_HEADERS,
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export function routeParams(id: string): { params: Promise<{ id: string }> } {
  return { params: Promise.resolve({ id }) };
}
