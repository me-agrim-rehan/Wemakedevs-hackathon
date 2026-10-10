import "dotenv/config";
import { createServer } from "node:http";
import { Agent, tool } from "@strands-agents/sdk";
import { OpenAIModel } from "@strands-agents/sdk/models/openai";
import { z } from "zod";

// Groq model configuration
const model = new OpenAIModel({
  api: "chat",
  apiKey: process.env.GROQ_API_KEY,
  clientConfig: {
    baseURL: "https://api.groq.com/openai/v1",
  },
  modelId: "openai/gpt-oss-120b",
});

// Tool to fetch NGOs from the existing backend
const getPartnerNGOs = tool({
  name: "get_partner_ngos",
  description: "Fetch NGO records from the HelpAsOne backend.",
  inputSchema: z.object({}),
  callback: async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:3000/ngos"
      );

      const data = await response.json();

      if (
        !response.ok ||
        data.message === "Failed to fetch NGOs"
      ) {
        return "NGO data is unavailable. Do not invent NGO details.";
      }

      return JSON.stringify(data);
    } catch (error) {
      console.error("NGO lookup error:", error);
      return "NGO API could not be reached.";
    }
  },
});

// Create the Strands Agent
const agent = new Agent({
  model,
  systemPrompt: `
You are the HelpAsOne flood-response assistant.

Your responsibilities:
1. Analyze flood reports.
2. Identify urgent response priorities.
3. Recommend practical next steps.
4. Use the NGO lookup tool when relevant.
5. Use only actual NGO data returned by the tool.
6. Never invent NGO names, contact details, or availability.
7. Never claim that an NGO has been contacted.
8. Never dispatch resources or claim that help is confirmed.
9. All recommendations require human approval.
`,
  tools: [getPartnerNGOs],
});

// JSON response helper
function respond(res, status, data) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });

  res.end(JSON.stringify(data));
}

// HTTP server
const server = createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    return respond(res, 204, {});
  }

  const url = new URL(req.url, "http://localhost");

  // Health check
  if (req.method === "GET" && url.pathname === "/health") {
    return respond(res, 200, {
      status: "ok",
      service: "HelpAsOne Strands",
    });
  }

  // Flood analysis endpoint
  if (
    req.method === "POST" &&
    url.pathname === "/analyze-flood"
  ) {
    try {
      let raw = "";

      for await (const chunk of req) {
        raw += chunk;

        if (raw.length > 100000) {
          return respond(res, 413, {
            error: "Request too large",
          });
        }
      }

      let incident;

      try {
        incident = JSON.parse(raw || "{}");
      } catch {
        return respond(res, 400, {
          error: "Invalid JSON request body",
        });
      }

      if (
        !incident.location ||
        !incident.severity ||
        !incident.description
      ) {
        return respond(res, 400, {
          error:
            "location, severity and description are required",
        });
      }

      const result = await agent.invoke(`
Analyze this flood incident:

${JSON.stringify(incident)}

Please:
- Summarize the incident.
- Identify immediate response priorities.
- Recommend practical safety and relief steps.
- Use the NGO lookup tool and explain possible NGO matches
  using only the data it returns.
- If NGO data is unavailable, clearly say so.
- Do not claim anyone has been contacted or resources dispatched.
- State that recommendations require human approval.
`);

      return respond(res, 200, {
        success: true,
        requiresHumanApproval: true,
        incident,
        recommendation: result.lastMessage,
      });
    } catch (error) {
      console.error("Flood analysis error:", error);

      return respond(res, 502, {
        error: "Analysis failed. Check the Strands terminal.",
      });
    }
  }

  return respond(res, 404, {
    error: "Route not found",
  });
});

// Start server
server.listen(4000, "127.0.0.1", () => {
  console.log(
    "Strands running at http://127.0.0.1:4000"
  );
});
