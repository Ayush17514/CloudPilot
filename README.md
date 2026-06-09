# CloudPilot AI 🚀
### *Autonomous FinOps Intelligence & Cloud Optimization Engine*

CloudPilot AI is a modern full-stack FinOps platform that operates as an autonomous agent. It is designed to continuously scan multi-cloud infrastructure workloads, detect spend anomalies, perform agent-led root cause investigations, and generate immediate cost-saving recommendations with one-click action execution.

---

## 🎨 Design Philosophy & Concept

CloudPilot AI is built on a dark, aesthetic **Slate & Cosmic Navy** theme. The interface maintains visual focus on high-fidelity telemetry, dynamic charts, real-time agent execution timelines, and rich data tables.

*   **Diagnostic Telemetry**: Tracks active workloads and surfaces real-time utilization profiles across clusters.
*   **Cost Anomaly Sandbox**: Allows developers and platform engineers to select mock real-world incident scenarios (staging sprawl, GKE memory-leak runaway, unattached volumes, database overprovisioning) and deploy autonomous investigation workflows.
*   **The FinOps Ledger**: Action-oriented optimization recommendations synced in real-time with live budget metrics.
*   **Executive Report Center**: High-fidelity balance generation providing CFO-ready audit summaries, CSV export controls, and printable templates.
*   **CFO Chat Terminal**: An interactive continuous-context dialogue channel to review right-sizing rules directly with an AI Cloud CFO.

---

## 🛠️ System Architecture

CloudPilot AI leverages a **full-stack architecture** to securely run AI operations server-side without exposing API keys to the browser.

```
┌────────────────────────────────────────────────────────┐
│                      Client (SPA)                      │
│   React 18 + Vite + Tailwind CSS + Lucie Icons + Motion │
└───────────┬────────────────────────────────┬───────────┘
            │                                │
    REST (Investigation)             REST (CFO Advisory Chat)
            │                                │
┌───────────▼────────────────────────────────▼───────────┐
│                    Express Server                      │
│        Dynamic Routes, CORS, Secure API proxying       │
└──────────────────────────┬─────────────────────────────┘
                           │
             @google/genai TypeScript SDK
                           │
┌──────────────────────────▼─────────────────────────────┐
│          Gemini AI Resiliency Engine (Server)          │
│   ✔ 3-Stage Auto-Retry   ✔ gemini-3.5-flash           │
│   ✔ Expo Backoff         ✔ Fallback: gemini-flash-l   │
│   ✔ Deterministic Local Rules Heuristics               │
└────────────────────────────────────────────────────────┘
```

### 1. Server-Side Secure Design
The backend is powered by **Express** and running on **Node.js**. All request proxying to LLM APIs is handled inside `/server.ts` using `process.env.GEMINI_API_KEY`. No secret headers or bearer tokens are visible inside standard browser DevTools.

### 2. Core Gemini Resiliency Engine
To completely protect the application from 503 model rate-limit overload and temporary peak demand bottlenecks, the server-side proxy features a **dual-layered failover framework**:
*   **Exponential Backoff Retry**: Auto-retries failed queries up to 3 times with progressive delays (`delay = delay * 2`).
*   **Model Failover**: If `gemini-3.5-flash` experiences transient failures, the proxy seamlessly transfers the request payload to `gemini-flash-latest`.
*   **Deterministic Local Heuristics (Zero-Downtime Fallback)**: If both models or network pathways are exhausted, the server redirects processing to pre-compiled local heuristic datasets matching the incident categories. This guarantees high-uptime responsiveness for live demo sandboxes.

---

## 📂 Code Module Map

*   `server.ts` – Full-stack server entrypoint hosting API endpoints, routing rules, static asset mounts, and the **Gemini Resiliency Engine**.
*   `src/App.tsx` – Orchestrator component. Manages application tabs, state variables, budget tracking, and the automated sequence loop for the agent.
*   `src/data.ts` – Comprehensive base datasets, catalog anomalies, mock compute resources, and recommendation definitions.
*   `src/types.ts` – Shared TypeScript interfaces and structures representing resources, spend data points, actions, logs, and agent phases.
*   `src/components/`
    *   `CFOConsole.tsx` – Continuous chat terminal connecting the client safely to the backend advisor.
    *   `CostChart.tsx` – Responsive, beautiful visualization plotting budget limits versus dynamic runtime spend projections.
    *   `ResourceGrid.tsx` – Workload dashboard enabling fast searching, server tag filtering, and one-click scaling/termination actions.
    *   `RecommendationsList.tsx` – Clear operational ledger mapping waste streams to actionable remedies with real-time budget synchronization.
    *   `ExecutiveReportWidget.tsx` – Professional financial summary output with printable PDF formatting and CSV downloader tools.
    *   `MetricCard.tsx` – Diagnostic metrics displaying active monthly burn, realized optimization, and budget cap margins.

---

## 🚀 Getting Started

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18 or higher)
*   An active Google Gemini API Key

### Local Setup Instructions

1.  **Clone the workspace** and navigate to your project directory.
2.  **Add environment keys**:
    Create a `.env` file in the root directory (based on `.env.example`):
    ```env
    # .env
    GEMINI_API_KEY=your_actual_gemini_api_key_here
    ```
3.  **Install dependencies**:
    ```bash
    npm install
    ```
4.  **Run Development Server**:
    We use the integrated full-stack Vite development server proxy:
    ```bash
    npm run dev
    ```
    The application will now be running on `http://localhost:3000`.

5.  **Compile & Build for Production**:
    Our custom production build optimizes server bundle compiling both frontend and server configurations seamlessly:
    ```bash
    npm run build
    ```
    This produces optimized assets inside `/dist` and bundled Node code as `dist/server.cjs`.

6.  **Launch Production Build**:
    ```bash
    npm start
    ```

---

## 💡 Operational Scenarios Available in Sandbox

1.  **Forgotten Staging Sprawl** (`env-forgotten`)
    Staging services deployed for benchmarking runs were never torn down, leading to **$2,250/mo** in wasteful billing at 0% total compute utilization.
2.  **Kubernetes Runaway Autoscale Memory Leak** (`runaway-scaling`)
    An un-optimized container memory stack triggers Horizontal Pod Autoscaling (HPA), scaling clusters to 18 VMs under a CPU throughput of less than 3%.
3.  **Orphaned High-Perf Storage Volumes** (`orphaned-storage`)
    Unattached high-speed solid-state drives measuring 2.8TB continue to consume premium space and accumulate costs at $345/mo without parent instance attachment.
4.  **Database Instance Overprovisioning** (`overprovisioned`)
    Production databases running large standard profiles cost $1,400+ more than scaled database units, despite averaging just 4% CPU utilization.

---

Developed in Google AI Studio. Designed for optimized FinOps excellence. 💡
