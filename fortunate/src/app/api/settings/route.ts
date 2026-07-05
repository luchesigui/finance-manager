import { NextResponse } from "next/server";
import { z } from "zod";
import { getSettings, getUsers, updateSettings } from "../../../db/queries";
import { checkAuth } from "../../../utils/auth";
import { PILLAR_SLUGS, parsePillarTargets } from "../../../utils/pillars";

const pillarTargetsSchema = z
  .object(
    Object.fromEntries(PILLAR_SLUGS.map((slug) => [slug, z.number().min(0).max(100)])) as Record<
      (typeof PILLAR_SLUGS)[number],
      z.ZodNumber
    >,
  )
  .refine((targets) => Object.values(targets).reduce((sum, v) => sum + v, 0) === 100, {
    message: "A soma dos percentuais dos pilares deve ser exatamente 100",
  });

const updateSettingsSchema = z.object({
  defaultPayerId: z.string().min(1).optional(),
  emergencyFund: z.number().int().min(0).optional(),
  openrouterKey: z.string().nullable().optional(),
  pillarTargets: pillarTargetsSchema.optional(),
});

// GET /api/settings
export async function GET(request: Request) {
  try {
    const auth = await checkAuth(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const settings = await getSettings();
    return NextResponse.json({
      ...settings,
      pillarTargets: parsePillarTargets(settings?.pillarTargets),
    });
  } catch (error: any) {
    console.error("Error in GET /api/settings:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

// PUT /api/settings
export async function PUT(request: Request) {
  try {
    const auth = await checkAuth(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const body = await request.json();

    const validation = updateSettingsSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation Error", details: validation.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { defaultPayerId, emergencyFund, openrouterKey, pillarTargets } = validation.data;

    if (defaultPayerId !== undefined) {
      const users = await getUsers();
      if (!users.some((u) => u.id === defaultPayerId)) {
        return NextResponse.json(
          { error: "Validation Error", details: { defaultPayerId: ["Usuário não encontrado"] } },
          { status: 400 },
        );
      }
    }

    await updateSettings({
      ...(defaultPayerId !== undefined && { defaultPayerId }),
      ...(emergencyFund !== undefined && { emergencyFund }),
      ...(openrouterKey !== undefined && { openrouterKey }),
      ...(pillarTargets !== undefined && { pillarTargets: JSON.stringify(pillarTargets) }),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in PUT /api/settings:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
