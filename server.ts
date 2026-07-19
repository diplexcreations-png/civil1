import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

// Load environment variables (.env.local overrides .env when present)
dotenv.config();
dotenv.config({ path: ".env.local", override: true });

// Initialize Express
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Health Check API
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// AI Explanation endpoint
app.post("/api/explain", async (req, res) => {
  const { calculatorId, calculatorName, inputs, outputs, unitSystem, customQuestion } = req.body;

  try {
    const openrouterKey = process.env.OPENROUTER_API_KEY;

    if (!openrouterKey) {
      return res.status(500).json({
        error: "OpenRouter API Key not configured.",
        status: "error"
      });
    }

    // Format the calculator state into a text block for prompt grounding
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

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    let resultJson: any = null;
    const models = ["google/gemini-2.5-flash", "openai/gpt-4o-mini", "meta-llama/llama-3.1-8b-instruct:free"];

    for (let i = 0; i < models.length; i++) {
      const currentModel = models[i];
      let success = false;
      
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          console.log(`Sending of request to OpenRouter. Model: ${currentModel}, Attempt: ${attempt}`);
          
          const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${openrouterKey}`,
              "HTTP-Referer": process.env.APP_URL || "https://ai.studio/build",
              "X-Title": "CiviCore AI Assistant",
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              model: currentModel,
              messages: [
                { role: "system", content: systemInstruction },
                { role: "user", content: userMessage }
              ],
              response_format: { type: "json_object" },
              temperature: 0.3
            })
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenRouter HTTP ${response.status}: ${errorText}`);
          }

          const data = await response.json();
          const content = data?.choices?.[0]?.message?.content?.trim();
          
          if (!content) {
            throw new Error(`OpenRouter returned empty content on model ${currentModel}`);
          }

          // Strip potential markdown wrappers
          let cleanContent = content;
          if (cleanContent.startsWith("```json")) {
            cleanContent = cleanContent.slice(7);
          } else if (cleanContent.startsWith("```")) {
            cleanContent = cleanContent.slice(3);
          }
          if (cleanContent.endsWith("```")) {
            cleanContent = cleanContent.slice(0, -3);
          }
          cleanContent = cleanContent.trim();

          try {
            resultJson = JSON.parse(cleanContent);
            if (resultJson.explanation && resultJson.recommendations && resultJson.safetyNotes) {
              success = true;
              break;
            } else {
              throw new Error("JSON structure parsed but lacked expected properties ('explanation', 'recommendations', or 'safetyNotes')");
            }
          } catch (jsonErr: any) {
            console.warn("Raw response was not valid JSON or lacked schema:", cleanContent);
            throw jsonErr;
          }

        } catch (err: any) {
          console.warn(`Attempt ${attempt} on model ${currentModel} failed:`, err.message || err);
          if (attempt < 2) {
            await sleep(1000);
          }
        }
      }

      if (success && resultJson) {
        break;
      }
    }

    if (!resultJson) {
      throw new Error("Unable to get valid structured review from OpenRouter after trying multiple models.");
    }

    return res.json({ ...resultJson, status: "success" });

  } catch (error: any) {
    console.error("OpenRouter AI API Error:", error);
    return res.status(500).json({
      error: "Error processing the computation with OpenRouter AI engine.",
      details: error.message || error,
      status: "error"
    });
  }
});

// AI Chatbot endpoint
app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid request. 'messages' array is required." });
  }

  try {
    const openrouterKey = process.env.OPENROUTER_API_KEY;

    if (!openrouterKey) {
      return res.status(500).json({
        error: "OpenRouter API Key not configured.",
        status: "error"
      });
    }

    const systemMessage = {
      role: "system",
      content: "You are CiviCore AI, an elite principal structural civil engineer assistant. Provide accurate, professional, safety-focused, and formula-grounded advice. Always respect standard building codes (ACI, ASTM, AISC, Eurocode). Keep your responses concise, clear, and well-formatted in markdown. You can answer general civil engineering questions or analyze calculations if context is provided."
    };

    const apiMessages = [systemMessage, ...messages];

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    let resultText = "";
    const models = ["google/gemini-2.5-flash", "openai/gpt-4o-mini", "meta-llama/llama-3.1-8b-instruct:free"];

    for (let i = 0; i < models.length; i++) {
      const currentModel = models[i];
      let success = false;

      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          console.log(`Sending chat request to OpenRouter. Model: ${currentModel}, Attempt: ${attempt}`);

          const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${openrouterKey}`,
              "HTTP-Referer": process.env.APP_URL || "https://ai.studio/build",
              "X-Title": "CiviCore AI Assistant Chat",
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              model: currentModel,
              messages: apiMessages,
              temperature: 0.7
            })
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenRouter HTTP ${response.status}: ${errorText}`);
          }

          const data = await response.json();
          const content = data?.choices?.[0]?.message?.content?.trim();

          if (content) {
            resultText = content;
            success = true;
            break;
          } else {
            throw new Error(`OpenRouter returned empty content on model ${currentModel}`);
          }

        } catch (err: any) {
          console.warn(`Chat attempt ${attempt} on model ${currentModel} failed:`, err.message || err);
          if (attempt < 2) {
            await sleep(1000);
          }
        }
      }

      if (success && resultText) {
        break;
      }
    }

    if (!resultText) {
      throw new Error("Unable to get valid chat response from OpenRouter after trying multiple models.");
    }

    return res.json({ response: resultText, status: "success" });

  } catch (error: any) {
    console.error("OpenRouter AI Chat Error:", error);
    return res.status(500).json({
      error: "Error processing the chat with OpenRouter AI engine.",
      details: error.message || error,
      status: "error"
    });
  }
});

// Setup Vite & Static Assets Handlers
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Vite Middlewares in development mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CiviCore Full-Stack server booted at http://localhost:${PORT}`);
  });
}

startServer();
