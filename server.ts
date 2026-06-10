import dotenv from "dotenv";
dotenv.config();

// --- Arize Phoenix OTel Tracing (Graceful Degradation) ---
// Phoenix tracing is optional. If the collector isn't running or deps fail,
// the server continues with a no-op tracer.
let tracer: any;

interface NoOpSpan {
  setAttributes: (attrs: Record<string, any>) => void;
  setStatus: (status: { code: number; message?: string }) => void;
  end: () => void;
}

const noOpSpan: NoOpSpan = {
  setAttributes: () => {},
  setStatus: () => {},
  end: () => {},
};

const noOpTracer = {
  startActiveSpan: <T>(name: string, fn: (span: NoOpSpan) => T): T => {
    return fn(noOpSpan);
  },
};

const phoenixEnabled = process.env.PHOENIX_ENABLED !== "false";

if (phoenixEnabled) {
  try {
    const phoenixOtel = await import("@arizeai/phoenix-otel");
    const collectorEndpoint = process.env.PHOENIX_COLLECTOR_ENDPOINT || undefined;

    phoenixOtel.register({
      projectName: "cloudpilot-ai",
      ...(collectorEndpoint ? { endpoint: collectorEndpoint } : {}),
    });

    tracer = phoenixOtel.trace.getTracer("cloudpilot-gemini");
    console.log("CloudPilot: ✅ Arize Phoenix OTel tracing initialized successfully.");
  } catch (error: any) {
    console.warn(
      `CloudPilot: ⚠️ Arize Phoenix tracing unavailable (${error?.message || "unknown error"}). Running without tracing.`
    );
    tracer = noOpTracer;
  }
} else {
  console.log("CloudPilot: Phoenix tracing disabled via PHOENIX_ENABLED=false.");
  tracer = noOpTracer;
}

// --- Express Server Setup ---
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
app.use(express.json());

// Use platform-provided PORT (Vercel, Cloud Run, etc.) or default to 3000
const PORT = parseInt(process.env.PORT || "3000", 10);

// --- Security Headers (Production) ---
if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    next();
  });
}

// Initialize Gemini safely
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("CloudPilot backend: ✅ Gemini Client initialized successfully with API key.");
  } catch (error) {
    console.error("CloudPilot backend: ❌ Error initializing Gemini Client:", error);
  }
} else {
  console.log("CloudPilot backend: ⚠️ No GEMINI_API_KEY found. Running in offline fallback mode.");
}

// Define fallback answers for high-fidelity offline operations
const fallbackAnswers: Record<string, { summary: string; rootCauses: string[]; markdown: string }> = {
  "env-forgotten": {
    summary: "CloudPilot discovered a classic 'unattended environment sprawl' signature. Staging services were spun up on May 15 for a performance testing cycle but never cleaned up, burning through $2,250 of monthly budget while running entirely at 0% user throughput.",
    rootCauses: [
      "Multi-node architecture left fully operational containing staging app hosts and databases.",
      "Testing pipeline completed on May 21st but omitted the tear-down staging script in CI/CD block.",
      "Billing records show $75.00 a day wasted since benchmark execution concluded."
    ],
    markdown: `### CloudPilot FinOps Deep-Dive Investigation
**Status: Complete** | **Confidence: 99.4%**

#### 🛰️ Resource Mapping
I scanned all US regions looking for compute nodes containing standard dev or staging labels. I detected a high concentration of active assets in **us-central1** prefixed with \`ghost-stg-\`.

#### 🔍 Zero-Utilization Evidence
* Compute VMs (\`ghost-stg-app-node-01\` & \`ghost-stg-app-node-02\`) show a flat **0.12% CPU utilization** over 14 consecutive days.
* Network ingress traffic shows 0 packets from general public IPs, with only health-check pings registered.
* Staging database (\`ghost-stg-reporting-replica\`) has **zero active customer sessions**.

#### 💡 CloudPilot Recommendations
1. **Automated Teardown**: Shutdown both VMs immediately.
2. **Database Snapshot**: Initiate final database export to Standard GCS Bucket ($3/month storage footprint) and drop the expensive replica node.
3. **Savings Potential**: **$2,232.00 / month saved** immediately after approval.`
  },
  "runaway-scaling": {
    summary: "CloudPilot AI traced GKE runaway scaling to a memory leak in a newly deployed staging container. Standard metrics showed CPU at <3%, but Kubernetes horizontal autoscalers (HPA) mistook memory exhaustion for system traffic, scaling from 3 to 18 active VM worker nodes.",
    rootCauses: [
      "Kubernetes horizontal pod autoscaler (HPA) configured on memory metrics rather than target CPU thresholds.",
      "Memory leak in NodeJS base microservice version v2.4a causing pod containers to consume up to 98% memory cache.",
      "Underlying node pools scaled up to provision the requests, keeping 12 core-heavy compute engines running dry."
    ],
    markdown: `### CloudPilot FinOps Deep-Dive Investigation
**Status: Complete** | **Confidence: 97.11%**

#### 🎡 Cluster Diagnostics
A GKE horizontal pod autoscaler event is scaling the underlying Node Pool in \`europe-west1\` to limits.

#### 📉 The Paradox
* **Total Resource Footprint**: 18 Active VMs.
* **Aggregated CPU Load**: Only **2.4% CPU average**.
* **Reasoning**: The application processes are stuck in infinite memory allocation loops (heap exhaustion). Individual container nodes require restarts, but instead, GKE continues to spin up *new physical VMs* to host redundant pods.

#### 💡 CloudPilot Recommendations
1. **Override Autoscaler**: Enforce a conservative node ceiling on Kubernetes cluster pool (\`max-nodes = 4\`).
2. **Redeploy Node Service**: Force crash pod loops and redeploy container build v2.4b fixing heap leaks.
3. **Expected Savings**: **$2,160.00 / month saved** with zero performance degradation.`
  },
  "orphaned-storage": {
    summary: "CloudPilot detected 3 high-performance SSD volumes measuring 2.8 Terabytes that are fully unattached to any virtual machine. These volumes are billed at top rates despite having 0 Input/Output operations for the last 21 days.",
    rootCauses: [
      "VM instances were deleted via script, but the 'delete disk on termination' variable was falsified.",
      "Unattached block volumes left in 'Available' state with no parent compute infrastructure.",
      "No current system tracks orphaned EBS or Local SSD volumes, draining $345/mo in storage costs."
    ],
    markdown: `### CloudPilot FinOps Deep-Dive Investigation
**Status: Complete** | **Confidence: 100%**

#### 💾 Volume Auditing
I cross-referenced all persistent SSD block units against dynamic mapping tables on our instances:
* Found volume \`stg-backup-volume-temp-nvme\` (2.8 TB SSD).
* **Attachment State**: detached.
* **Last Read/Write IOps**: May 17th, 2026.

#### ⚖️ FinOps Assessment
High-temperature SSD block storage is billed by capacity *regardless of attachment or write activity*. Deleting or switching to cold archival storage is 100% efficient waste control.

#### 💡 CloudPilot Recommendations
1. **Cold Archive**: Export contents to GCS Coldline class (reducing disk fee by 92%).
2. **Purge Disk**: Purge the prime volume from the console immediately.
3. **Expected Savings**: **$345.00 / month saved** instantly.`
  },
  "overprovisioned": {
    summary: "CloudPilot discovered standard production database waste. Core postgres DB replica instance represents an enterprise-grade db-n1-standard-16 profile. However, query requests have averaged less than 1.4 queries per-second, with maximum CPU utilization peaking at 4%.",
    rootCauses: [
      "Database originally sized based on initial load migrations containing historical warehouse files.",
      "Daily production activity relies on read caching pools, bypassing core database layers for queries.",
      "Running db-n1-standard-16 costs $1,400 more than a healthy scaled db-n1-standard-4 node."
    ],
    markdown: `### CloudPilot FinOps Deep-Dive Investigation
**Status: Complete** | **Confidence: 95.8%**

#### 📊 Database CPU/Memory Mapping
* **Current Type**: db-n1-standard-16 (16 vCPU, 60GB Memory).
* **Historical Peak Memory**: 11.2GB.
* **Historical Peak CPU Usage**: 4% (Including monthly batch operations).

#### 🛠️ Right-Sizing Metric Verdict
Active connections are steady at 4. The memory and computation profile is highly underutilized. Downsizing this node to db-n1-standard-4 retains 15GB RAM (leaving a safe 30% overhead) while lowering active spend by 75%.

#### 💡 CloudPilot Recommendations
1. **Instance Resizing**: Schedule standard maintenance trigger to re-scale the SQL database.
2. **Backup Optimizations**: Downshift snapshot frequency from hourly to daily.
3. **Expected Savings**: **$1,215.00 / month saved** with solid uptime preserved.`
  }
};

// Robust helper to perform retry loop with backoff and automatic model failover
async function generateContentWithRetry(
  aiClient: GoogleGenAI,
  params: { contents: any; config?: any; primaryModel?: string; fallbackModel?: string }
) {
  return await tracer.startActiveSpan("generateContentWithRetry", async (parentSpan: any) => {
    const primaryModel = params.primaryModel || "gemini-2.5-flash";
    const fallbackModel = params.fallbackModel || "gemini-2.0-flash";
    
    parentSpan.setAttributes({
      "llm.model_name": primaryModel,
      "input.value": typeof params.contents === "string" ? params.contents : JSON.stringify(params.contents),
    });
    
    const maxRetries = 3;
    let delay = 1000;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const modelToUse = attempt === maxRetries ? fallbackModel : primaryModel;
      try {
        const response = await tracer.startActiveSpan(`gemini-generate-content-attempt-${attempt}`, async (span: any) => {
          try {
            console.log(`CloudPilot API: Attempt ${attempt} of generateContent with ${modelToUse}...`);
            span.setAttributes({
              "llm.model_name": modelToUse,
              "input.value": typeof params.contents === "string" ? params.contents : JSON.stringify(params.contents),
            });
            
            const res = await aiClient.models.generateContent({
              model: modelToUse,
              contents: params.contents,
              config: params.config,
            });
            
            span.setAttributes({
              "output.value": res.text || "",
            });
            span.setStatus({ code: 1 }); // OK
            return res;
          } catch (err: any) {
            span.setStatus({ code: 2, message: err?.message || String(err) });
            throw err;
          } finally {
            span.end();
          }
        });
        
        parentSpan.setAttributes({
          "output.value": response.text || "",
        });
        parentSpan.setStatus({ code: 1 }); // OK
        parentSpan.end();
        return response;
      } catch (err: any) {
        console.warn(`CloudPilot API: Attempt ${attempt} with ${modelToUse} failed. Error:`, err?.message || err);
        
        const is503OrRateLimit = 
          err?.status === 503 || 
          err?.status === 429 ||
          (err?.message && (
            err.message.includes("503") || 
            err.message.includes("high demand") || 
            err.message.includes("UNAVAILABLE") || 
            err.message.includes("ResourceExhausted") || 
            err.message.includes("429")
          ));
        
        if (attempt === maxRetries) {
          parentSpan.setStatus({ code: 2, message: err?.message || String(err) });
          parentSpan.end();
          throw err;
        }
        
        if (is503OrRateLimit) {
          console.log(`CloudPilot API: Transient issue encountered. Retrying in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 2;
        } else {
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
      }
    }
    throw new Error("Failed to generate content after retries");
  });
}

// REST API: Live CloudPilot Analysis with retry and custom diagnostics fallbacks
app.post("/api/cloudpilot/investigate", async (req, res) => {
  const { anomaly, budget, resources } = req.body;

  if (!anomaly) {
    return res.status(400).json({ error: "Missing anomaly details" });
  }

  // If no AI key or AI client initialization failed, let's gracefully return fallback response
  if (!ai) {
    const fallback = fallbackAnswers[anomaly.category] || fallbackAnswers["overprovisioned"];
    return res.json({
      aiMode: "offline-mock",
      ...fallback
    });
  }

  try {
    const prompt = `Analyze the following cloud cost anomaly for a project with an active budget of $${budget}/month.
Anomaly Title: ${anomaly.title}
Category: ${anomaly.category}
Spike Height: +${anomaly.spikePercentage}% cost increase
Estimated Monthly Waste: $${anomaly.wasteAmount}
Description: ${anomaly.description}

Here are the registered infra resources in this environment:
${JSON.stringify(resources, null, 2)}

Please generate a high-profile FinOps Investigation Record.
Return your output STRICTLY as a pre-formatted JSON structure that matches this interface:
{
  "summary": "Deep analytical description of what happened, written as an elite Cloud CFO. (Approx 3 sentences)",
  "rootCauses": [
    "A crisp bullet point of the technical root cause mechanism (e.g. CI pipeline omitted tear-down staging script)",
    "Another technical mechanism",
    "Estimated impact bullet"
  ],
  "markdown": "A detailed, beautiful markdown analysis of the resources. Create sections for: Resource Mapping, Utilization Analysis, Recommendations, and Projected Savings. Use subheadings, bold font, bullet points, and code lines where needed. Be mathematically precise: calculated daily waste, region details, and exact right-sizing numbers."
}

Ensure your output is a single valid JSON string. Do not append any markdown wrappers like \`\`\`json outside of the JSON structure. Returns code as raw string.`;

    const response = await generateContentWithRetry(ai, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
      primaryModel: "gemini-2.5-flash",
      fallbackModel: "gemini-2.0-flash"
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from Gemini API");
    }

    const parsed = JSON.parse(text);
    return res.json({
      aiMode: "gemini-live",
      ...parsed
    });

  } catch (error: any) {
    console.warn(`[Gemini Temporary Issue - Resigned to Heuristics Fallback] Category: "${anomaly.category}". Message: ${error?.message || error}`);
    
    // Serve a perfectly shaped, pristine JSON fallback structure matching the exact requested schema
    const fallback = fallbackAnswers[anomaly.category] || fallbackAnswers["overprovisioned"];
    return res.json({
      aiMode: "offline-mock",
      ...fallback
    });
  }
});

// REST API: CloudPilot Agent Advisory Chat with retry and custom diagnostics fallbacks
app.post("/api/cloudpilot/chat", async (req, res) => {
  const { message, history, budget, anomalyState } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Missing message query" });
  }

  if (!ai) {
    // Offline chat response generator
    const lower = message.toLowerCase();
    let reply = "Hello! I am CloudPilot, your Autonomous FinOps Agent. Here is what I advise: ";
    if (lower.includes("budget") || lower.includes("spend")) {
      reply += `Your current budget target is set to **$${budget || 15000}/mo**. We are currently trending over this budget due to active anomalies like the GKE autoscaling loop and unattached storage nodes. I highly recommend running an **Autonomous Investigation** to resolve this.`;
    } else if (lower.includes("recommend") || lower.includes("save") || lower.includes("recom")) {
      reply += "You can save up to **$4,500/month** by applying our top recommendations: \n- **Terminate staging VMs** ($1,224/mo)\n- **Downsize postgres server model** ($1,215/mo)\n- **Cap GKE node pool nodes to 4** ($2,160/mo). Approve these items directly from the action console!";
    } else if (lower.includes("anomaly") || lower.includes("spike") || lower.includes("waste")) {
      reply += "We detected a sudden **45%+ spend spike** in staging integrations. My investigation discovered 15 idle VMs and 3 detached SSD discs remaining from forgotten performance runs. Clicking 'Investigate' will generate a pristine root-cause trace with step-by-step reasoning.";
    } else {
      reply += `Based on your budget of **$${budget || 15000}/mo**, I am scanning your active infrastructure in us-central1, europe-west1, and us-east4. Overall average utilization is running highly sub-optimal (<10% overall average). What specific sub-system or cluster would you like me to right-size or clean up for you?`;
    }

    return res.json({
      aiMode: "offline-mock",
      text: reply
    });
  }

  try {
    const systemInstruction = `You are CloudPilot AI, an elite Autonomous FinOps Agent, Cloud Architect, and Cloud CFO.
The organization's cloud budget is $${budget || 15000}/month.
The current anomaly state involves: ${anomalyState ? JSON.stringify(anomalyState) : "Monitoring infrastructure stably. No major spike registered."}

Provide crisp, high-value, highly specific suggestions to cloud engineers looking to trim waist, reduce overprovisioning, and implement strict FinOps practices.
Introduce yourself with confidence. Do not speak in abstract generalities, give real-world GCP or AWS naming examples, right-sizing steps, or resource life-cycles.
Keep answers under 3 paragraphs for layout readability, formatted in attractive markdown.`;

    const prompt = `User query: "${message}"\n\nProvide your diagnostic guidance based on the budget of $${budget} and the overall active metrics.`;

    const response = await generateContentWithRetry(ai, {
      contents: prompt,
      config: {
        systemInstruction,
      },
      primaryModel: "gemini-2.5-flash",
      fallbackModel: "gemini-2.0-flash"
    });

    return res.json({
      aiMode: "gemini-live",
      text: response.text
    });

  } catch (error: any) {
    console.warn(`[Gemini Chat Temporary Issue - Resigned to Chat Heuristics Fallback] Message: ${error?.message || error}`);
    
    // Offline chat response generator under extreme 503 high demand or API rate limits
    const lower = message.toLowerCase();
    let reply = "I am CloudPilot AI, your Autonomous FinOps Agent. Our live cloud analyzer is experiencing standard peak demand bottlenecks, so I have initiated our deterministic cloud heuristics engine: \n\n";
    if (lower.includes("budget") || lower.includes("spend")) {
      reply += `Your current budget target is set to **$${budget || 15000}/mo**. We are currently trending over this budget due to active anomalies like the GKE autoscaling loop and unattached storage nodes. I highly recommend running an **Autonomous Investigation** to resolve this.`;
    } else if (lower.includes("recommend") || lower.includes("save") || lower.includes("recom")) {
      reply += "You can save up to **$4,500/month** by applying our top recommendations: \n- **Terminate staging VMs** ($1,224/mo)\n- **Downsize postgres server model** ($1,215/mo)\n- **Cap GKE node pool nodes to 4** ($2,160/mo). Approve these items directly from the action console!";
    } else if (lower.includes("anomaly") || lower.includes("spike") || lower.includes("waste")) {
      reply += "We detected a sudden **45%+ spend spike** in staging integrations. My investigation discovered 15 idle VMs and 3 detached SSD discs remaining from forgotten performance runs. Clicking 'Investigate' will generate a pristine root-cause trace with step-by-step reasoning.";
    } else {
      reply += `Based on your budget of **$${budget || 15000}/mo**, I am scanning your active infrastructure in us-central1, europe-west1, and us-east4. Overall average utilization is running highly sub-optimal (<10% overall average). What specific sub-system or cluster would you like me to right-size or clean up for you?`;
    }

    return res.json({
      aiMode: "offline-mock",
      text: reply
    });
  }
});

// Vite middleware configuration for full-stack integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("CloudPilot: Running in development mode using Vite.");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("CloudPilot: Running in production mode.");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CloudPilot Autonomous FinOps Agent running on http://localhost:${PORT}`);
  });
}

startServer();

export default app;
