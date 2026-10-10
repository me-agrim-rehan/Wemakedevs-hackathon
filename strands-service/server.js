import { createServer } from "node:http";
import { Agent, tool } from "@strands-agents/sdk";
import { OpenAIModel } from "@strands-agents/sdk/models/openai";
import { z } from "zod";

// Groq model configuration.
// Keep GROQ_API_KEY in an environment variable, never in this file.
const model = new OpenAIModel({
  api: "chat",
  apiKey: process.env.GROQ_API_KEY,
  clientConfig: {
    baseURL: "https://api.groq.com/openai/v1",
  },
  modelId: "llama-3.3-70b-versatile",
});

const getPartnerNGOs = tool({
  name: "get_partner_ngos",
  description: "Fetch NGO records from the HelpAsOne backend.",
  inputSchema: z.object({}),
  callback: async () => {
    try {
      const response = await fetch("http://127.0.0.1:3000/ngos");
      const data = await response.json();

      if (!response.ok || data.message === "Failed to fetch NGOs") {
        return "NGO data is unavailable. Do not invent NGO details.";
      }

      return JSON.stringify(data);
    } catch {
      return "NGO API could not be reached.";
    }
  },
});

const agent = new Agent({
  model,
  systemPrompt: `
You are the HelpAsOne flood-response assistant.
Analyze flood reports and recommend practical next steps.
Use the NGO tool when relevant.
Never invent NGO data or claim an NGO has confirmed availability.
Recommendations require human approval. Never dispatch resources.
`,
  tools: [getPartnerNGOs],
});

function respond(res, status, data) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });

  res.end(JSON.stringify(data));
}

const server = createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    return respond(res, 204, {});
  }

  const url = new URL(req.url, "http://localhost");

  if (req.method === "GET" && url.pathname === "/health") {
    return respond(res, 200, {
      status: "ok",
      service: "HelpAsOne Strands",
    });
  }

  if (req.method === "POST" && url.pathname === "/analyze-flood") {
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

      const incident = JSON.parse(raw || "{}");

      if (
        !incident.location ||
        !incident.severity ||
        !incident.description
      ) {
        return respond(res, 400, {
          error: "location, severity and description are required",
        });
      }

      const result = await agent.invoke(`
Analyze this flood incident:
${JSON.stringify(incident)}

Use the NGO lookup tool. Suggest response priorities and explain
potential NGO matches using only returned information.
If NGO data is unavailable, say so.
No NGO has been contacted and no resources have been dispatched.
`);

      return respond(res, 200, {
        success: true,
        requiresHumanApproval: true,
        recommendation: result.lastMessage,
      });
    } catch (error) {
      console.error("Flood analysis error:", error);

      return respond(res, 502, {
        error: "Analysis failed. Check the VS Code terminal.",
      });
    }
  }

  return respond(res, 404, {
    error: "Route not found",
  });
});

server.listen(4000, "127.0.0.1", () => {
  console.log("Strands running at http://127.0.0.1:4000");
});