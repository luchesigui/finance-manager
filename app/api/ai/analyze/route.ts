import { dayjs } from "@/lib/dateUtils";
import { readJsonBody, requireAuthWithHousehold } from "@/lib/server/requestBodyValidation";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function cleanAndParseJson(text: string) {
  let cleaned = text.trim();
  // Remove markdown code blocks if present (e.g. ```json ... ``` or ``` ... ```)
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```[a-zA-Z]*\n/, "").replace(/\n```$/, "");
  }
  return JSON.parse(cleaned.trim());
}

export async function POST(request: Request) {
  const auth = await requireAuthWithHousehold();
  if (!auth.success) return auth.response;

  const body = await readJsonBody(request);
  const { month } = (body || {}) as { month?: string }; // Format: YYYY-MM

  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json({ error: "Missing or invalid month format" }, { status: 400 });
  }

  try {
    const supabase = await createClient();

    // 1. Fetch user's OpenRouter configuration
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("openrouter_api_key, ai_analysis_months, ai_custom_context")
      .eq("id", auth.userId)
      .single();

    if (profileError || !profile) {
      console.error("Error fetching user profile:", profileError);
      return NextResponse.json({ error: "User profile not found" }, { status: 400 });
    }

    const apiKey = profile.openrouter_api_key;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenRouter API Key is not configured. Please add it in settings." },
        { status: 400 },
      );
    }

    const aiAnalysisMonths = profile.ai_analysis_months ?? 3;

    // 2. Fetch household information (emergency fund)
    const { data: household, error: householdError } = await supabase
      .from("households")
      .select("emergency_fund")
      .eq("id", auth.householdId)
      .single();

    if (householdError) throw householdError;

    // 3. Fetch people in household
    const { data: people, error: peopleError } = await supabase
      .from("people")
      .select("id, name, income")
      .eq("household_id", auth.householdId);

    if (peopleError) throw peopleError;

    // 4. Fetch household categories to map category UUIDs to names
    const { data: categories, error: categoriesError } = await supabase
      .from("household_categories")
      .select(`
        id,
        categories (
          name
        )
      `)
      .eq("household_id", auth.householdId);

    if (categoriesError) throw categoriesError;

    // 5. Calculate date range (start date = X months before target month)
    const refMonth = dayjs(`${month}-01`);
    const endDate = refMonth.endOf("month").format("YYYY-MM-DD");
    const startDate = refMonth
      .subtract(aiAnalysisMonths - 1, "month")
      .startOf("month")
      .format("YYYY-MM-DD");

    // 6. Fetch realized transactions in date range
    const { data: transactions, error: transactionsError } = await supabase
      .from("transactions")
      .select("*")
      .eq("household_id", auth.householdId)
      .eq("is_forecast", false)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: false });

    if (transactionsError) throw transactionsError;

    // 7. Map people and categories to build readable payloads
    const peopleMap = new Map((people || []).map((p) => [p.id, p.name]));
    const categoriesMap = new Map(
      (categories || []).map((c) => {
        const catData = c.categories as unknown as { name: string } | { name: string }[] | null;
        const name = Array.isArray(catData) ? catData[0]?.name : catData?.name;
        return [c.id, name || "Sem categoria"];
      }),
    );

    const mappedTransactions = (transactions || []).map((tx) => ({
      date: tx.date,
      description: tx.description,
      amount: Number(tx.amount),
      type: tx.type,
      paid_by: tx.paid_by ? peopleMap.get(tx.paid_by) || "Desconhecido" : "Desconhecido",
      category: tx.category_id
        ? categoriesMap.get(tx.category_id) || "Sem categoria"
        : "Sem categoria",
      is_recurring: tx.is_recurring ?? false,
    }));

    // 8. Assemble prompt payload
    const payload = {
      contexto_usuario: profile.ai_custom_context || "Nenhum contexto pessoal configurado.",
      resumo_financeiro: {
        salarios_individuais: (people || []).map((p) => ({
          nome: p.name,
          salario: Number(p.income),
        })),
        reserva_de_emergencia_atual: Number(household?.emergency_fund || 0),
      },
      transacoes: mappedTransactions,
    };

    const systemPrompt = `
Você é um consultor financeiro analítico de alto nível.
Analise a lista crua de transações dos últimos meses, o salário dos indivíduos e a reserva de emergência atual do household.

Você deve responder estritamente com um JSON que contenha um array de insights estruturados. Cada insight deve ter:
- "type": "positive" (para metas batidas, recordes ou economias), "negative" (para alertas de gastos excessivos, anomalias ou despesas muito altas), "warning" (para itens que exigem atenção ou monitoramento) ou "info" (para despesas pontuais explicativas ou notas informativas).
- "title": Um título curto em negrito resumindo o insight (máximo 60 caracteres).
- "description": Detalhes do insight com valores comparativos, percentuais de mudança e recomendações acionáveis.

Exemplo de formato esperado:
{
  "insights": [
    {
      "type": "positive",
      "title": "Terceiro mês positivo consecutivo",
      "description": "Superavit médio de +R$ 5,2k no período analisado. Reserva de emergência subiu 12%."
    },
    {
      "type": "negative",
      "title": "Gastos com Alimentação dispararam +45%",
      "description": "Aumento significativo saindo de R$ 1,2k para R$ 1,74k de média mensal. Principais responsáveis: Delivery fora do horário comercial."
    }
  ]
}

Responda APENAS com o JSON, sem explicações adicionais, sem marcas de markdown (não inclua blocos de código com a tag \`\`\`json).
`;

    // 9. Call OpenRouter
    const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://finance-manager.local",
        "X-Title": "Gestor Financeiro",
      },
      body: JSON.stringify({
        model: "openrouter/owl-alpha",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: JSON.stringify(payload) },
        ],
      }),
    });

    if (!openRouterResponse.ok) {
      const errorText = await openRouterResponse.text();
      console.error("OpenRouter API error:", errorText);
      return NextResponse.json(
        { error: `OpenRouter error (${openRouterResponse.status}): ${errorText}` },
        { status: 502 },
      );
    }

    const responseJson = await openRouterResponse.json();
    const modelOutputText = responseJson.choices?.[0]?.message?.content;

    if (!modelOutputText) {
      console.error("Empty model output received:", responseJson);
      return NextResponse.json({ error: "Empty output from OpenRouter" }, { status: 502 });
    }

    // 10. Clean and parse output
    let parsedJson: { insights: Array<{ type: string; title: string; description: string }> };
    try {
      parsedJson = cleanAndParseJson(modelOutputText);
    } catch (parseError) {
      console.error("Failed to parse AI JSON response:", modelOutputText, parseError);
      return NextResponse.json(
        { error: "Model did not return valid JSON format. Try again." },
        { status: 502 },
      );
    }

    if (!parsedJson || !Array.isArray(parsedJson.insights)) {
      console.error("Invalid JSON content shape:", parsedJson);
      return NextResponse.json({ error: "Invalid JSON response shape from AI" }, { status: 502 });
    }

    // 11. Store monthly analysis in DB (transaction block)
    // Create or update monthly analysis set
    const { data: analysisData, error: analysisError } = await supabase
      .from("ai_analyses")
      .upsert(
        {
          household_id: auth.householdId,
          reference_month: month,
          created_by: auth.userId,
        },
        { onConflict: "household_id,reference_month" },
      )
      .select("id")
      .single();

    if (analysisError) throw analysisError;
    const analysisId = analysisData.id;

    // Delete existing insights for this analysis
    const { error: deleteError } = await supabase
      .from("ai_insights")
      .delete()
      .eq("analysis_id", analysisId);

    if (deleteError) throw deleteError;

    // Insert new insights
    const insightsPayload = parsedJson.insights.map((insight) => ({
      analysis_id: analysisId,
      type: insight.type,
      title: insight.title,
      description: insight.description,
    }));

    if (insightsPayload.length > 0) {
      const { error: insertError } = await supabase.from("ai_insights").insert(insightsPayload);
      if (insertError) throw insertError;
    }

    // 12. Return full response matching AiAnalysis type
    const { data: finalAnalysis, error: finalError } = await supabase
      .from("ai_analyses")
      .select(`
        id,
        household_id,
        reference_month,
        created_by,
        created_at,
        ai_insights (
          id,
          type,
          title,
          description
        )
      `)
      .eq("id", analysisId)
      .single();

    if (finalError) throw finalError;

    return NextResponse.json({
      id: finalAnalysis.id,
      householdId: finalAnalysis.household_id,
      referenceMonth: finalAnalysis.reference_month,
      createdBy: finalAnalysis.created_by,
      createdAt: finalAnalysis.created_at,
      insights: (finalAnalysis.ai_insights || []).map(
        (insight: {
          id: string;
          type: string;
          title: string;
          description: string;
        }) => ({
          id: insight.id,
          type: insight.type,
          title: insight.title,
          description: insight.description,
        }),
      ),
    });
  } catch (error) {
    console.error("AI Analysis execution error:", error);
    return NextResponse.json({ error: "Failed to perform AI analysis" }, { status: 500 });
  }
}
