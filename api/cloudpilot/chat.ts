import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI } from "@google/genai";
import { getTracer } from "./telemetry";

const tracerPromise = getTracer();

// Initialize Gemini safely
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  } catch (error) {
    console.error("Gemini init error:", error);
  }
}

async function generateWithRetry(
  aiClient: GoogleGenAI,
  params: { contents: any; config?: any; primaryModel?: string; fallbackModel?: string }
) {
  const tracer = await tracerPromise;
  return await tracer.startActiveSpan("generateContentWithRetry", async (parentSpan: any) => {
    const primaryModel = params.primaryModel || "gemini-2.5-flash";
    const fallbackModel = params.fallbackModel || "gemini-2.0-flash";
    const maxRetries = 3;
    let delay = 1000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const modelToUse = attempt === maxRetries ? fallbackModel : primaryModel;
      try {
        return await aiClient.models.generateContent({
          model: modelToUse,
          contents: params.contents,
          config: params.config,
        });
      } catch (err: any) {
        if (attempt === maxRetries) throw err;
        const isTransient =
          err?.status === 503 || err?.status === 429 || err?.message?.includes("503") || err?.message?.includes("429");
        await new Promise((r) => setTimeout(r, isTransient ? delay : 300));
        delay *= 2;
      }
    }
    throw new Error("Failed after retries");
  });
}

function getOfflineReply(message: string, budget: number): string {
  const lower = message.toLowerCase();
  let reply = "Hello! I am CloudPilot, your Autonomous FinOps Agent. Here is what I advise: ";
  if (lower.includes("budget") || lower.includes("spend")) {
    reply += `Your current budget target is set to **$${budget}/mo**. We are currently trending over this budget due to active anomalies like the GKE autoscaling loop and unattached storage nodes. I highly recommend running an **Autonomous Investigation** to resolve this.`;
  } else if (lower.includes("recommend") || lower.includes("save") || lower.includes("recom")) {
    reply += "You can save up to **$4,500/month** by applying our top recommendations: \n- **Terminate staging VMs** ($1,224/mo)\n- **Downsize postgres server model** ($1,215/mo)\n- **Cap GKE node pool nodes to 4** ($2,160/mo).";
  } else if (lower.includes("anomaly") || lower.includes("spike") || lower.includes("waste")) {
    reply += "We detected a sudden **45%+ spend spike** in staging integrations. My investigation discovered 15 idle VMs and 3 detached SSD discs.";
  } else {
    reply += `Based on your budget of **$${budget}/mo**, I am scanning your active infrastructure. Overall average utilization is running sub-optimal (<10% average).`;
  }
  return reply;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message, history, budget, anomalyState } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Missing message query" });
  }

  const effectiveBudget = budget || 15000;

  if (!ai) {
    return res.json({ aiMode: "offline-mock", text: getOfflineReply(message, effectiveBudget) });
  }

  try {
    const systemInstruction = `You are CloudPilot AI, an elite Autonomous FinOps Agent, Cloud Architect, and Cloud CFO.
The organization's cloud budget is $${effectiveBudget}/month.
The current anomaly state involves: ${anomalyState ? JSON.stringify(anomalyState) : "Monitoring infrastructure stably."}

Provide crisp, highly specific suggestions. Give real-world GCP or AWS naming examples, right-sizing steps, or resource life-cycles.
Keep answers under 3 paragraphs, formatted in attractive markdown.`;

    const prompt = `User query: "${message}"\n\nProvide your diagnostic guidance based on the budget of $${effectiveBudget}.`;

    const response = await generateWithRetry(ai, {
      contents: prompt,
      config: { systemInstruction },
    });

    return res.json({ aiMode: "gemini-live", text: response.text });
  } catch (error: any) {
    console.warn(`[Gemini Chat Fallback] ${error?.message || error}`);
    return res.json({ aiMode: "offline-mock", text: getOfflineReply(message, effectiveBudget) });
  }
}
