import { callOpenRouter, setCors, stripMarkdownJson } from "./_lib/openrouter.js";

export default async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed", status: "error" });
  }

  try {
    const { calculatorId, calculatorName, inputs, outputs, unitSystem, customQuestion } =
      req.body || {};

    const dataSummary = `
Calculator: ${calculatorName} (${calculatorId})
Unit System: ${unitSystem}
Inputs: ${JSON.stringify(inputs, null, 2)}
Computed Results: ${JSON.stringify(outputs, null, 2)}
User Query: ${customQuestion || "Requesting general engineering analysis, safety warnings, and structural optimizations for this calculation result."}
`;

    const systemInstruction = `You are an elite principal structural civil engineer assistant. Provide accurate, safety-focused, and formula-grounded advice in a strict JSON schema structure. Always respect standard building codes (ACI, ASTM, AISC, Eurocode).
IMPORTANT: You MUST return a single valid JSON object. Do not wrap it in markdown code blocks like \`\`\`json. Return only the raw JSON.
The JSON object must match this schema structure:
{
  "explanation": "A detailed, clear scientific and engineering review/explanation of the calculation parameters and the physical meaning of results.",
  "recommendations": [
    "highly actionable design recommendation 1",
    "highly actionable design recommendation 2",
    "highly actionable design recommendation 3"
  ],
  "safetyNotes": "Critical safety warnings with references to typical code guidelines (ACI 318, IBC, Eurocode)."
}`;

    const userMessage = `Analyze the following civil engineering computation data and user query:

${dataSummary}

Provide a production-ready, peer-reviewed engineering review with explanation, recommendations, and safetyNotes in the requested JSON structure.`;

    const content = await callOpenRouter({
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: userMessage },
      ],
      temperature: 0.3,
      jsonObject: true,
      title: "CivilMath AI Assistant",
    });

    const resultJson = JSON.parse(stripMarkdownJson(content));
    if (!resultJson.explanation || !resultJson.recommendations || !resultJson.safetyNotes) {
      throw new Error("JSON structure parsed but lacked expected properties");
    }

    return res.status(200).json({ ...resultJson, status: "success" });
  } catch (error) {
    if (error?.code === "NO_KEY") {
      return res.status(500).json({
        error: "OpenRouter API Key not configured.",
        status: "error",
      });
    }
    console.error("OpenRouter AI API Error:", error);
    return res.status(500).json({
      error: "Error processing the computation with OpenRouter AI engine.",
      details: error.message || String(error),
      status: "error",
    });
  }
}
