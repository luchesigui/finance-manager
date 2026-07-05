import { validateApiKey } from "../db/queries";

export async function checkAuth(
  request: Request,
): Promise<{ authorized: boolean; error?: string }> {
  const apiKey =
    request.headers.get("x-api-key") ||
    request.headers.get("Authorization")?.replace("Bearer ", "");

  if (apiKey) {
    const isValid = await validateApiKey(apiKey);
    if (!isValid) {
      return { authorized: false, error: "Invalid API key" };
    }
    return { authorized: true };
  }

  // Bypass for local same-origin/internal requests
  const referer = request.headers.get("referer");
  const secFetchSite = request.headers.get("sec-fetch-site");
  const host = request.headers.get("host");

  const isInternal = secFetchSite === "same-origin" || referer?.includes(host || "localhost");

  if (isInternal) {
    return { authorized: true };
  }

  return { authorized: false, error: "Missing API Key header (x-api-key or Authorization)" };
}
