import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createApiKey, getApiKeys } from "../../../db/queries";
import { checkAuth } from "../../../utils/auth";

const createApiKeySchema = z.object({
  name: z.string().min(1, "O nome é obrigatório"),
});

// GET /api/api-keys — nunca expõe a chave completa, só um preview
export async function GET(request: Request) {
  try {
    const auth = await checkAuth(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const keys = await getApiKeys();
    return NextResponse.json(
      keys.map(({ id, name, key, createdAt }) => ({
        id,
        name,
        createdAt,
        keyPreview: `${key.slice(0, 12)}…`,
      })),
    );
  } catch (error: any) {
    console.error("Error in GET /api/api-keys:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/api-keys — gera a chave no servidor e a retorna completa uma única vez
export async function POST(request: Request) {
  try {
    const auth = await checkAuth(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const body = await request.json();

    const validation = createApiKeySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation Error", details: validation.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const key = `fortunate_key_${crypto.randomBytes(24).toString("hex")}`;
    const created = await createApiKey(validation.data.name, key);
    return NextResponse.json({ success: true, ...created });
  } catch (error: any) {
    console.error("Error in POST /api/api-keys:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
