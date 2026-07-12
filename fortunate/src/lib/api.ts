export class ApiError extends Error {
  status: number;
  details?: Record<string, string[]>;

  constructor(status: number, message: string, details?: Record<string, string[]>) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `Erro ${res.status}`;
    let details: Record<string, string[]> | undefined;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
      if (body?.details) details = body.details;
    } catch {
      // corpo não-JSON; mantém a mensagem genérica
    }
    throw new ApiError(res.status, message, details);
  }
  return res.json() as Promise<T>;
}

export const fetcher = <T = unknown>(url: string): Promise<T> =>
  fetch(url).then((res) => handleResponse<T>(res));

const jsonRequest =
  <T>(method: string) =>
  (url: string, body?: unknown): Promise<T> =>
    fetch(url, {
      method,
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }).then((res) => handleResponse<T>(res));

export const apiPost = <T = { success: boolean }>(url: string, body?: unknown) =>
  jsonRequest<T>("POST")(url, body);

export const apiPut = <T = { success: boolean }>(url: string, body?: unknown) =>
  jsonRequest<T>("PUT")(url, body);

export const apiPatch = <T = { success: boolean }>(url: string, body?: unknown) =>
  jsonRequest<T>("PATCH")(url, body);

export const apiDelete = <T = { success: boolean }>(url: string) => jsonRequest<T>("DELETE")(url);
