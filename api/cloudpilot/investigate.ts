import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI } from "@google/genai";

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

// Fallback answers
const fallbackAnswers: Record<string, { summary: string; rootCauses: string[]; markdown: string }> = {
  "env-forgotten": {
    summary: "CloudPilot discovered a classic 'unattended environment sprawl' signature. Staging services were spun up on May 15 for a performance testing cycle but never cleaned up, burning through $2,250 of monthly budget while running entirely at 0% user throughput.",
    rootCauses: [
      "Multi-node architecture left fully operational containing staging app hosts and databases.",
      "Testing pipeline completed on May 21st but omitted the tear-down staging script in CI/CD block.",
      "Billing records show $75.00 a day wasted since benchmark execution concluded.",
    ],
    markdown: "### CloudPilot FinOps Deep-Dive Investigation\n**Status: Complete** | **Confidence: 99.4%**\n\n#### 🛰️ Resource Mapping\nScanned all US regions. Detected active assets in **us-central1** prefixed with `ghost-stg-`.\n\n#### 💡 Recommendations\n1. **Automated Teardown**: Shutdown both VMs immediately.\n2. **Database Snapshot**: Export to Standard GCS Bucket.\n3. **Savings**: **$2,232.00 / month saved**.",
  },
  "runaway-scaling": {
    summary: "CloudPilot AI traced GKE runaway scaling to a memory leak in a newly deployed staging container.",
    rootCauses: [
      "Kubernetes HPA configured on memory metrics rather than CPU thresholds.",
      "Memory leak in NodeJS microservice v2.4a causing 98% memory consumption.",
      "Node pools scaled to 18 VMs running at <3% CPU.",
    ],
    markdown: "### CloudPilot FinOps Deep-Dive\n**Confidence: 97.11%**\n\n#### 💡 Recommendations\n1. Enforce `max-nodes = 4`.\n2. Redeploy container v2.4b.\n3. **$2,160.00/mo saved**.",
  },
  "orphaned-storage": {
    summary: "Detected 2.8TB unattached SSD volumes billed at top rates with 0 I/O for 21 days.",
    rootCauses: [
      "VM instances deleted but 'delete disk on termination' was false.",
      "Unattached volumes in 'Available' state.",
      "$345/mo in wasted storage costs.",
    ],
    markdown: "### CloudPilot FinOps Deep-Dive\n**Confidence: 100%**\n\n#### 💡 Recommendations\n1. Export to GCS Coldline.\n2. Purge disk.\n3. **$345.00/mo saved**.",
  },
  "overprovisioned": {
    summary: "Core postgres DB running db-n1-standard-16 but averaging 1.4 QPS and 4% CPU peak.",
    rootCauses: [
      "Database sized for historical data warehouse migrations.",
      "Production uses read caching, bypassing DB for queries.",
      "Running db-n1-standard-16 costs $1,400 more than db-n1-standard-4.",
    ],
    markdown: "### CloudPilot FinOps Deep-Dive\n**Confidence: 95.8%**\n\n#### 💡 Recommendations\n1. Resize to db-n1-standard-4.\n2. Reduce snapshot frequency.\n3. **$1,215.00/mo saved**.",
  },
};

async function generateWithRetry(
  aiClient: GoogleGenAI,
  params: { contents: any; config?: any; primaryModel?: string; fallbackModel?: string }
) {
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
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { anomaly, budget, resources } = req.body;

  if (!anomaly) {
    return res.status(400).json({ error: "Missing anomaly details" });
  }

  if (!ai) {
    const fallback = fallbackAnswers[anomaly.category] || fallbackAnswers["overprovisioned"];
    return res.json({ aiMode: "offline-mock", ...fallback });
  }

  try {
    const prompt = `Analyze the following cloud cost anomaly for a project with an active budget of $${budget}/month.
Anomaly Title: ${anomaly.title}
Category: ${anomaly.category}
Spike Height: +${anomaly.spikePercentage}% cost increase
Estimated Monthly Waste: $${anomaly.wasteAmount}
Description: ${anomaly.description}

Resources: ${JSON.stringify(resources, null, 2)}

Return STRICTLY as JSON:
{
  "summary": "3-sentence analytical description",
  "rootCauses": ["bullet 1", "bullet 2", "bullet 3"],
  "markdown": "Detailed markdown analysis with Resource Mapping, Utilization Analysis, Recommendations, and Projected Savings sections."
}`;

    const response = await generateWithRetry(ai, {
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });

    const text = response.text;
    if (!text) throw new Error("Empty response");

    return res.json({ aiMode: "gemini-live", ...JSON.parse(text) });
  } catch (error: any) {
    console.warn(`[Gemini Fallback] ${error?.message || error}`);
    const fallback = fallbackAnswers[anomaly.category] || fallbackAnswers["overprovisioned"];
    return res.json({ aiMode: "offline-mock", ...fallback });
  }
}
