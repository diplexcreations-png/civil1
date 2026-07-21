import { callOpenRouter, handleOptions, jsonResponse } from "./openrouter.mjs";

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return handleOptions();
  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { error: "Method not allowed", status: "error" });
  }

  try {
    const { messages } = JSON.parse(event.body || "{}");

    if (!messages || !Array.isArray(messages)) {
      return jsonResponse(400, {
        error: "Invalid request. 'messages' array is required.",
        status: "error",
      });
    }

    const systemMessage = {
      role: "system",
      content:
        "You are CiviCore AI, an elite principal structural civil engineer assistant. Provide accurate, professional, safety-focused, and formula-grounded advice. Always respect standard building codes (ACI, ASTM, AISC, Eurocode). Keep your responses concise, clear, and well-formatted in markdown. IMPORTANT: You must ONLY answer questions related to mathematics, structural engineering, and civil engineering. If the user asks a question about any other topic (e.g., programming, general knowledge, history, everyday advice), politely decline and state that you can only assist with math and civil engineering.",
    };

    const content = await callOpenRouter({
      messages: [systemMessage, ...messages],
      temperature: 0.7,
      title: "CiviCore AI Assistant Chat",
    });

    return jsonResponse(200, { response: content, status: "success" });
  } catch (error) {
    if (error?.code === "NO_KEY") {
      return jsonResponse(500, {
        error: "OpenRouter API Key not configured.",
        status: "error",
      });
    }
    console.error("OpenRouter AI Chat Error:", error);
    return jsonResponse(500, {
      error: "Error processing the chat with OpenRouter AI engine.",
      details: error.message || String(error),
      status: "error",
    });
  }
};
