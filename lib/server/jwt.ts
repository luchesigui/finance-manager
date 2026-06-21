import crypto from "node:crypto";

function base64UrlEncode(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function signJwt(payload: Record<string, unknown>, secret: string): string {
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = base64UrlEncode(Buffer.from(JSON.stringify(header)));
  const encodedPayload = base64UrlEncode(Buffer.from(JSON.stringify(payload)));
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto.createHmac("sha256", secret).update(dataToSign).digest();

  const encodedSignature = base64UrlEncode(signature);
  return `${dataToSign}.${encodedSignature}`;
}

export function verifyJwt(token: string, secret: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const dataToSign = `${encodedHeader}.${encodedPayload}`;

    const expectedSignature = crypto.createHmac("sha256", secret).update(dataToSign).digest();
    const expectedSignatureEncoded = base64UrlEncode(expectedSignature);

    const bufferExpected = Buffer.from(expectedSignatureEncoded);
    const bufferActual = Buffer.from(encodedSignature);

    if (
      bufferExpected.length !== bufferActual.length ||
      !crypto.timingSafeEqual(bufferExpected, bufferActual)
    ) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(encodedPayload, "base64").toString("utf8"));
    return payload;
  } catch {
    return null;
  }
}
