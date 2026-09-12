/**
 * CampusHub AI — LLM Connector
 * 
 * Supports Gemini 1.5 Flash and OpenAI generation when API keys are set.
 * Falls back gracefully to the built-in hybrid engines when keys are absent or network calls fail.
 */

export interface LlmPromptParams {
  systemPrompt: string;
  userPrompt: string;
  contextData?: string;
  temperature?: number;
}

export async function generateLlmResponse(params: LlmPromptParams): Promise<string | null> {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const openAiApiKey = process.env.OPENAI_API_KEY;

  // 1. Attempt Gemini Flash
  if (geminiApiKey && !geminiApiKey.includes("placeholder")) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent`;
      const payload = {
        contents: [
          {
            parts: [
              { text: params.systemPrompt },
              { text: `${params.contextData ? `Context:\n${params.contextData}\n\n` : ""}User Question:\n${params.userPrompt}` },
            ],
          },
        ],
        generationConfig: {
          temperature: params.temperature ?? 0.3,
          maxOutputTokens: 1000,
        },
      };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": geminiApiKey.trim(),
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim().length > 0) {
          return text.trim();
        }
      }
    } catch (err) {
      // Graceful fallback to local engine
    }
  }

  // 2. Attempt OpenAI
  if (openAiApiKey && !openAiApiKey.includes("placeholder")) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const endpoint = "https://api.openai.com/v1/chat/completions";
      const payload = {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: params.systemPrompt },
          { role: "user", content: `${params.contextData ? `Context:\n${params.contextData}\n\n` : ""}User Question:\n${params.userPrompt}` },
        ],
        temperature: params.temperature ?? 0.3,
        max_tokens: 1000,
      };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openAiApiKey}`,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const text = data?.choices?.[0]?.message?.content;
        if (text && text.trim().length > 0) {
          return text.trim();
        }
      }
    } catch (err) {
      // Graceful fallback
    }
  }

  return null;
}
