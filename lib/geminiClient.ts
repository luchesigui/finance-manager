export async function generateGeminiContent(prompt: string): Promise<string | null> {
  try {
    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = (await response.json()) as { text?: string };
    return data.text ?? "Não foi possível gerar uma resposta.";
  } catch (error) {
    console.error("Erro ao chamar Gemini:", error);
    return null;
  }
}
