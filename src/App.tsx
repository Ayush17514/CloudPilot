import { useState, useEffect } from "react";
import {
  Sparkles,
  TrendingUp,
  AlertOctagon,
  Scale,
  DollarSign,
  Layers,
  BotOff,
  Bot,
  Activity,
  Sliders,
  Play,
  RotateCcw,
  CheckCircle,
  HelpCircle,
  ChevronRight,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { CostDataPoint, CloudResource, Recommendation, AnomalyEvent, AgentStep, AgentLog, InvestigationState } from "./types";
import { sampleResources, sampleAnomalies, sampleRecommendations, getInitialCostTrend, getFallbackAIResult } from "./data";
import { MetricCard } from "./components/MetricCard";
import { CostChart } from "./components/CostChart";
import { AgentTimelineWidget } from "./components/AgentTimelineWidget";
import { ResourceGrid } from "./components/ResourceGrid";
import { RecommendationsList } from "./components/RecommendationsList";
import { CFOConsole } from "./components/CFOConsole";
import { ExecutiveReportWidget } from "./components/ExecutiveReportWidget";
import ReactMarkdown from "react-markdown";

export default function App() {
  // --- Persistent States ---
  const [activeTab, setActiveTab] = useState<"dashboard" | "investigation" | "recommendations" | "reporting" | "cfo">("dashboard");
  const [budget, setBudget] = useState<number>(15000);
  const [resources, setResources] = useState<CloudResource[]>(sampleResources);
  const [recommendations, setRecommendations] = useState<Recommendation[]>(sampleRecommendations);
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyEvent>(sampleAnomalies[0]);
  
  // --- Agent & Investigation Engine State ---
  const [investigation, setInvestigation] = useState<InvestigationState>({
    currentStep: AgentStep.MONITORING,
    status: "idle",
    progress: 0,
    logs: [],
    selectedAnomaly: null,
    findings: null,
  });

  // --- Dynamic Live Metrics (Recalculated dynamically) ---
  const [currentMonthlySpend, setCurrentMonthlySpend] = useState<number>(18216); // starting default
  const [potentialSavings, setPotentialSavings] = useState<number>(5152); // starting default
  const [costTrend, setCostTrend] = useState<CostDataPoint[]>(getInitialCostTrend(15000));

  // Sync metrics whenever resources or recommendations are changed (e.g. terminating/right-sizing resources)
  useEffect(() => {
    // Recalculates current monthly spend from active resources
    const activeRes = resources.filter((r) => r.status !== "terminated");
    const sumMonthlyCost = activeRes.reduce((acc, r) => {
      return acc + (r.costPerHour * 24 * 30);
    }, 0);
    
    // Calculates pending (unapplied) savings
    const pendingSavings = recommendations
      .filter((r) => !r.applied)
      .reduce((acc, r) => acc + r.monthlySavings, 0);

    setCurrentMonthlySpend(sumMonthlyCost);
    setPotentialSavings(pendingSavings);

    // Rebuild trend graph based on dynamic actual costs and budget ceilings
    const calculatedDaily = sumMonthlyCost / 30;
    const initialTrend = getInitialCostTrend(budget);
    
    // Dynamically align the active last 4 days on the chart with our interactive state updates
    const updatedTrend = initialTrend.map((pt, idx) => {
      if (idx >= 10) {
        // Impacted anomaly period shows customized, responsive scales
        const scaledVal = calculatedDaily * (pt.actualCost / 607); // proportional adjustment
        return {
          ...pt,
          actualCost: scaledVal,
          projectedCost: scaledVal * 1.02,
          budgetCap: budget / 30,
        };
      }
      return {
        ...pt,
        budgetCap: budget / 30,
      };
    });
    setCostTrend(updatedTrend);
  }, [resources, recommendations, budget]);

  // --- Sequential Autonomous Agent Loop Trigger ---
  const deployCloudPilotAgent = async (anomaly: AnomalyEvent) => {
    // Initialize investigation state
    setInvestigation({
      currentStep: AgentStep.MONITORING,
      status: "investigating",
      progress: 5,
      logs: [
        {
          timestamp: new Date().toLocaleTimeString(),
          step: AgentStep.MONITORING,
          message: "Deploying CloudPilot AI Autonomous FinOps Agent telemetry scan loop...",
          status: "info"
        }
      ],
      selectedAnomaly: anomaly,
      findings: null,
    });
    
    // Switch to active tab to show agent sequence
    setActiveTab("investigation");

    const delays = [1500, 1800, 2000, 2500, 2000, 1500, 1500];
    const steps = [
      { step: AgentStep.MONITORING, progress: 15, msg: "Inspecting multi-cloud accounts... Discovered 9 active clusters in europe-west1 and us-central1.", status: "info" as const },
      { step: AgentStep.DETECTION, progress: 30, msg: `ALERT TRIGGERED: System cost spike of +${anomaly.spikePercentage}% detected. Actual spend exceeds budget of $${budget} by $${(18216 - budget).toFixed(0)}.`, status: "warning" as const },
      { step: AgentStep.INVESTIGATION, progress: 50, msg: "Inspecting metadata tags: Scanned 12 VMs, 3 databases, and detached SSD storage modules...", status: "running" as const },
      { step: AgentStep.ROOT_CAUSE, progress: 70, msg: "Root cause found: Extracted unneeded high-performance configurations.", status: "success" as const },
      { step: AgentStep.SAVINGS_ANALYSIS, progress: 85, msg: `Quantifying optimization balances: Pinpointed up to $${anomaly.wasteAmount.toLocaleString()}/mo in potential organizational savings.`, status: "success" as const },
      { step: AgentStep.RECOMMENDATIONS, progress: 95, msg: "Generating automated rightsizing templates and shutdown instructions...", status: "info" as const },
      { step: AgentStep.REPORT, progress: 100, msg: "Compiling executive summary statement. Fetching custom LLM CFO review...", status: "success" as const },
    ];

    // Helper sleep function
    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    for (let i = 0; i < steps.length; i++) {
      await sleep(delays[i]);
      const current = steps[i];

      // On ROOT_CAUSE step, let's call the server-side Gemini endpoint or use simulated results
      let aiFindings = null;
      if (current.step === AgentStep.REPORT) {
        // Trigger server Gemini AI request if possible, else gracefully fallback
        try {
          const res = await fetch("/api/cloudpilot/investigate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              anomaly,
              budget,
              resources
            })
          });
          const data = await res.json();
          if (data && data.summary) {
            aiFindings = {
              summary: data.summary,
              rootCauses: data.rootCauses,
              affectedResources: resources.filter(r => 
                (anomaly.category === "env-forgotten" && r.name.includes("ghost-stg")) ||
                (anomaly.category === "runaway-scaling" && r.name.includes("dev-sand-gke")) ||
                (anomaly.category === "orphaned-storage" && r.orphaned) ||
                (anomaly.category === "overprovisioned" && r.name.includes("postgres"))
              ),
              detailedAnalysisMarkdown: data.markdown
            };
          }
        } catch (error) {
          console.error("Agent failed fetching live Gemini results, engaging custom rules engine: ", error);
        }

        // Standard rules-based fallback
        if (!aiFindings) {
          const fallback = getFallbackAIResult(anomaly.category);
          aiFindings = {
            summary: fallback.summary,
            rootCauses: fallback.rootCauses,
            affectedResources: resources.filter(r => 
              (anomaly.category === "env-forgotten" && r.name.includes("ghost-stg")) ||
              (anomaly.category === "runaway-scaling" && r.name.includes("dev-sand-gke")) ||
              (anomaly.category === "orphaned-storage" && r.orphaned) ||
              (anomaly.category === "overprovisioned" && r.name.includes("postgres"))
            ),
            detailedAnalysisMarkdown: fallback.markdown
          };
        }
      }

      setInvestigation((prev) => {
        const updatedLogs = [
          ...prev.logs,
          {
            timestamp: new Date().toLocaleTimeString(),
            step: current.step,
            message: current.msg,
            status: current.status,
          },
        ];

        return {
          ...prev,
          currentStep: current.step,
          progress: current.progress,
          logs: updatedLogs,
          findings: aiFindings ? aiFindings : prev.findings,
          status: current.step === AgentStep.REPORT ? "completed" as const : "investigating" as const,
        };
      });
    }
  };

  // --- Interactive Recommendation Impact Actions ---
  const handleApplyRecommendation = (recId: string) => {
    // 1. Mark recommendation as applied
    setRecommendations((prev) =>
      prev.map((r) => (r.id === recId ? { ...r, applied: true } : r))
    );

    // 2. Shut down or resize the target resources
    const matchedRec = recommendations.find((r) => r.id === recId);
    if (matchedRec) {
      setResources((prev) =>
        prev.map((res) => {
          if (res.id === matchedRec.resourceId) {
            // Apply corresponding technical action
            if (matchedRec.actionType === "terminate" || matchedRec.actionType === "delete") {
              return { ...res, status: "terminated", costPerHour: 0, utilization: 0 };
            } else if (matchedRec.actionType === "right-size" || matchedRec.actionType === "scale-down") {
              return { ...res, status: "scaled-down", costPerHour: res.costPerHour / 4, utilization: 45 };
            }
          }
          // Special edge-case container grouping
          if (matchedRec.resourceName.includes("ghost-stg-app-node") && res.name.includes("ghost-stg")) {
            return { ...res, status: "terminated", costPerHour: 0, utilization: 0 };
          }
          return res;
        })
      );
    }
  };

  const handleShutdownResource = (resId: string) => {
    setResources((prev) =>
      prev.map((r) => (r.id === resId ? { ...r, status: "terminated", costPerHour: 0, utilization: 0 } : r))
    );
    // Sync recommendations too
    setRecommendations((prev) =>
      prev.map((rec) => (rec.resourceId === resId ? { ...rec, applied: true } : rec))
    );
  };

  const handleScaleResource = (resId: string, multiplier: number) => {
    setResources((prev) =>
      prev.map((r) =>
        r.id === resId
          ? { ...r, status: "scaled-down", costPerHour: r.costPerHour * multiplier, utilization: 45 }
          : r
      )
    );
    // Sync recommendations too
    setRecommendations((prev) =>
      prev.map((rec) => (rec.resourceId === resId ? { ...rec, applied: true } : rec))
    );
  };

  const resetSimulation = () => {
    setResources(sampleResources);
    setRecommendations(sampleRecommendations);
    setInvestigation({
      currentStep: AgentStep.MONITORING,
      status: "idle",
      progress: 0,
      logs: [],
      selectedAnomaly: null,
      findings: null,
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 flex flex-col justify-between">
      
      {/* 🚀 Top Navigation Banner */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur sticky top-0 z-30 select-none">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-indigo-700 to-blue-600 rounded-xl shadow-lg border border-indigo-500/20">
              <Bot className="w-5.5 h-5.5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black tracking-tight text-white font-sans bg-clip-text">CLOUDPILOT AI</h1>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-widest font-mono">
                  Autonomous CFO
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-none mt-1">Autonomous FinOps Agent for Multi-cloud Cost Containment</p>
            </div>
          </div>

          {/* Quick Active Anomaly Widget */}
          <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-1.5 text-xs">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
            <div className="leading-tight">
              <span className="text-[10px] text-slate-500 block">ACTIVE ANOMALY SPIKE:</span>
              <span className="font-bold text-rose-400 font-mono text-[11px] select-all">{selectedAnomaly.title}</span>
            </div>
            <button
              onClick={() => deployCloudPilotAgent(selectedAnomaly)}
              className="ml-3 bg-rose-500/15 text-rose-400 hover:bg-rose-500 hover:text-white transition-all text-[10px] px-2.5 py-1 rounded font-bold uppercase border border-rose-500/30 font-sans"
            >
              Investigate
            </button>
          </div>
        </div>
      </header>

      {/* 📊 Main Content Area */}
      <main className="w-full max-w-7xl mx-auto px-4 md:px-6 py-6 flex-1 flex flex-col lg:flex-row gap-6 relative">
        
        {/* SIDE BAR BUTTON NAVIGATION */}
        <nav className="w-full lg:w-[240px] shrink-0 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible py-1 lg:py-0 border-b border-slate-900 lg:border-0 select-none">
          <span className="hidden lg:block text-[10px] text-slate-500 px-3 py-1.5 uppercase font-mono tracking-widest font-bold">
            FinOps Terminals
          </span>
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 select-none ${
              activeTab === "dashboard"
                ? "bg-slate-900/80 bg-gradient-to-b from-slate-900/50 to-slate-950/50 text-white border border-slate-850/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_4px_12px_rgba(0,0,0,0.5)]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Activity className="w-4 h-4 text-indigo-400" />
            Control Center
          </button>
          
          <button
            onClick={() => setActiveTab("investigation")}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 select-none ${
              activeTab === "investigation"
                ? "bg-slate-900/80 bg-gradient-to-b from-slate-900/50 to-slate-950/50 text-white border border-slate-850/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_4px_12px_rgba(0,0,0,0.5)]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Bot className="w-4 h-4 text-purple-400" />
            Autonomous Agent
            {investigation.status === "investigating" && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping ml-auto" />
            )}
          </button>
          
          <button
            onClick={() => setActiveTab("recommendations")}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 select-none ${
              activeTab === "recommendations"
                ? "bg-slate-900/80 bg-gradient-to-b from-slate-900/50 to-slate-950/50 text-white border border-slate-850/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_4px_12px_rgba(0,0,0,0.5)]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Scale className="w-4 h-4 text-amber-400" />
            Optimization Center
            {potentialSavings > 0 && (
              <span className="text-[9px] font-bold px-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded ml-auto">
                {recommendations.filter(r => !r.applied).length}
              </span>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab("reporting")}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 select-none ${
              activeTab === "reporting"
                ? "bg-slate-900/80 bg-gradient-to-b from-slate-900/50 to-slate-950/50 text-white border border-slate-850/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_4px_12px_rgba(0,0,0,0.5)]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Layers className="w-4 h-4 text-cyan-400" />
            Executive Statements
          </button>

          <button
            onClick={() => setActiveTab("cfo")}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 select-none ${
              activeTab === "cfo"
                ? "bg-slate-900/80 bg-gradient-to-b from-slate-900/50 to-slate-950/50 text-white border border-slate-850/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_4px_12px_rgba(0,0,0,0.5)]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-4 h-4 text-rose-400 animate-pulse" />
            Audit Advisor
          </button>

          {/* 🔍 Arize Observability Telemetry Link */}
          <a
            href="http://localhost:6006"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold tracking-wide text-emerald-400 hover:text-emerald-300 border border-emerald-500/10 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all select-none mt-1"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
            <span>Arize Tracing</span>
            <ExternalLink className="w-3.5 h-3.5 ml-auto text-emerald-500/70" />
          </a>

          <div className="hidden lg:block mt-8 border-t border-slate-900 pt-5 px-3">
            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono uppercase tracking-widest font-bold">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              <span>Target Budget</span>
            </div>
            {/* Real-time Budget Slider */}
            <div className="mt-3">
              <div className="flex justify-between text-xs text-white font-mono mb-2">
                <span>Budget Limit</span>
                <span className="font-bold">${budget.toLocaleString()}/mo</span>
              </div>
              <input
                type="range"
                min="10000"
                max="30000"
                step="1000"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1">
                <span>$10k</span>
                <span>$30k</span>
              </div>
            </div>

            <button
              onClick={resetSimulation}
              className="mt-8 w-full border border-slate-800 hover:border-slate-700 bg-slate-900/40 text-[10px] text-slate-400 hover:text-white py-2 rounded font-mono flex items-center justify-center gap-1.5 transition-all"
            >
              <RotateCcw className="w-3 h-3" />
              RESET SIMULATOR STATE
            </button>
          </div>
        </nav>

        {/* DETAILED WORKSPACE VIEWPANE */}
        <div className="flex-1 min-w-0 flex flex-col gap-6">
          
          <AnimatePresence mode="wait">
            
            {/* 1. CONTROL CENTER / DASHBOARD PAGE */}
            {activeTab === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-6"
              >
                {/* 4 Core Financial KPI Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <MetricCard
                    id="spend-card"
                    title="Current Actual Spend"
                    value={`$${currentMonthlySpend.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo`}
                    subtext={`${currentMonthlySpend > budget ? "Wasting budget resources" : "Under budget guidelines"}`}
                    trend={{
                      value: `${((currentMonthlySpend / budget) * 100 - 100).toFixed(0)}%`,
                      direction: currentMonthlySpend > budget ? "up" : "down"
                    }}
                    icon={DollarSign}
                    color="text-rose-400 bg-rose-500/10"
                    progressBar={{
                      percentage: (currentMonthlySpend / budget) * 100,
                      color: currentMonthlySpend > budget ? "bg-rose-500 animate-pulse" : "bg-emerald-500"
                    }}
                  />

                  <MetricCard
                    id="budget-card"
                    title="Active Budget Boundary"
                    value={`$${budget.toLocaleString()}/mo`}
                    subtext="Adjustable in advisor side rail"
                    icon={Sliders}
                    color="text-emerald-400 bg-emerald-500/10"
                  />

                  <MetricCard
                    id="savings-card"
                    title="Potential Savings Ledger"
                    value={`$${potentialSavings.toLocaleString()}/mo`}
                    subtext="Available via rightsizing approval"
                    trend={{
                      value: `${recommendations.filter(r => !r.applied).length} items`,
                      direction: "down"
                    }}
                    icon={Scale}
                    color="text-amber-400 bg-amber-500/10"
                  />

                  <MetricCard
                    id="forecast-card"
                    title="Cost Trend Forecast"
                    value={`$${(currentMonthlySpend * 1.05).toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo`}
                    subtext="Next 30-day projection calculation"
                    trend={{
                      value: "System Risk High",
                      direction: "up"
                    }}
                    icon={TrendingUp}
                    color="text-indigo-400 bg-indigo-500/10"
                  />
                </div>

                {/* Main Trend Line Area and Scenario selector */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <CostChart id="cost-dashboard-chart" data={costTrend} budget={budget} />
                  </div>

                  {/* Active Anomaly Scenarios Selection Terminal */}
                  <div className="bg-slate-950/55 backdrop-blur-md border border-slate-900 rounded-xl p-5 flex flex-col justify-between shadow-[0_8px_30px_rgb(0,0,0,0.4)] shadow-slate-950/50 relative overflow-hidden group">
                    <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-rose-500/10 to-transparent" />
                    <div>
                      <h3 className="text-white text-xs font-bold uppercase tracking-widest font-mono flex items-center gap-1.5 select-none">
                        <AlertOctagon className="w-4 h-4 text-rose-500 animate-pulse" />
                        Cost Anomaly Sandbox
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-1 select-none">Select an active incident scenario to test CloudPilot's autonomous agent logic:</p>
                    </div>

                    <div className="flex flex-col gap-2.5 my-4">
                      {sampleAnomalies.map((anom) => {
                        const isSelected = selectedAnomaly.id === anom.id;
                        return (
                          <div
                            key={anom.id}
                            onClick={() => setSelectedAnomaly(anom)}
                            className={`border rounded-xl p-3 cursor-pointer transition-all duration-200 select-none ${
                              isSelected
                                ? "border-rose-500/40 bg-rose-500/5 shadow-md shadow-rose-950/20"
                                : "border-slate-900/60 bg-slate-950/30 hover:bg-slate-950/50 hover:border-slate-800"
                            }`}
                          >
                            <div className="flex justify-between items-start gap-1">
                              <span className="text-xs font-bold text-slate-200 leading-tight tracking-tight">{anom.title}</span>
                              <span className="text-[10px] font-mono font-bold text-rose-400">
                                +{anom.spikePercentage}%
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-relaxed mt-1 line-clamp-1">{anom.description}</p>
                            <div className="flex justify-between text-[9px] text-slate-500 mt-2 font-mono">
                              <span>Waste: <strong className="text-rose-400">${anom.wasteAmount}/mo</strong></span>
                              <span className="text-indigo-400 hover:text-indigo-300 transition-colors">Select Anomaly</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => deployCloudPilotAgent(selectedAnomaly)}
                      className="w-full bg-rose-600 hover:bg-rose-500 font-bold text-xs py-2.5 text-white font-sans rounded-xl shadow-lg shadow-rose-600/15 flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 border border-rose-500/50"
                    >
                      <Play className="w-3.5 h-3.5 shrink-0" />
                      DEPLOY AUTONOMOUS INVESTIGATION
                    </button>
                  </div>
                </div>

                {/* Live Resources Map Grid */}
                <ResourceGrid
                  id="live-telemetry-inventory"
                  resources={resources}
                  onTerminate={handleShutdownResource}
                  onScale={handleScaleResource}
                />
              </motion.div>
            )}

            {/* 2. AUTONOMOUS INVESTIGATION PAGE */}
            {activeTab === "investigation" && (
              <motion.div
                key="investigation"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-6"
              >
                {/* Visual workflow timeline and live run terminal */}
                <AgentTimelineWidget
                  id="autonomous-timeline-panel"
                  currentStep={investigation.currentStep}
                  status={investigation.status}
                  progress={investigation.progress}
                  logs={investigation.logs}
                />

                {/* Display compiled AI investigation diagnostic conclusions */}
                {investigation.findings ? (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                  >
                    {/* Left Column: Root Cause and Impact */}
                    <div className="lg:col-span-1 flex flex-col gap-5">
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
                        <span className="text-[10px] text-indigo-400 font-bold font-mono uppercase tracking-widest">AI Summary Verdict</span>
                        <h3 className="text-white text-base font-bold mt-1 max-w-sm font-sans">Root Cause Identified</h3>
                        <p className="text-xs text-slate-300 leading-relaxed mt-3 bg-slate-950 p-3.5 border border-slate-850 rounded-lg">
                          {investigation.findings.summary}
                        </p>
                      </div>

                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex-1">
                        <span className="text-[10px] text-rose-400 font-bold font-mono uppercase tracking-widest">Wastage Anchors Found</span>
                        <div className="flex flex-col gap-3 mt-3.5">
                          {investigation.findings.rootCauses.map((rc, idx) => (
                            <div key={idx} className="flex gap-2.5 items-start">
                              <span className="w-5 h-5 rounded-full bg-rose-500/10 text-rose-400 font-bold border border-rose-500/20 shrink-0 text-xs flex items-center justify-center font-mono">
                                {idx + 1}
                              </span>
                              <p className="text-xs text-slate-300 leading-relaxed leading-snug">{rc}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Column: In-depth Markdown Log File */}
                    <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6.5 shadow-lg select-all max-h-[600px] overflow-y-auto">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4 shrink-0">
                        <div>
                          <span className="text-[10px] text-emerald-400 font-bold font-mono uppercase tracking-widest">Diagnostic Report</span>
                          <h3 className="text-white text-sm font-bold">CloudPilot CFO Markdown ledger</h3>
                        </div>
                        <div className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono uppercase tracking-widest">
                          ✓ SECURE PROTOCOL
                        </div>
                      </div>
                      
                      <div className="markdown-body prose prose-invert max-w-none text-xs text-slate-300 space-y-4 font-sans leading-relaxed">
                        <ReactMarkdown>
                          {investigation.findings.detailedAnalysisMarkdown || "Generating logs content..."}
                        </ReactMarkdown>
                      </div>

                      <div className="mt-8 pt-4 border-t border-slate-800 flex justify-end gap-3 shrink-0">
                        <button
                          onClick={() => setActiveTab("recommendations")}
                          className="px-5 py-2 hover:bg-slate-850 border border-slate-700 hover:text-white rounded text-xs font-bold transition-all text-slate-300"
                        >
                          View Optimization Actions
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="border border-slate-900 rounded-xl bg-slate-950/40 p-12 text-center text-xs text-slate-500 flex flex-col items-center gap-3">
                    <HelpCircle className="w-8 h-8 text-slate-600 animate-bounce" />
                    <div>
                      <p className="font-bold text-slate-400">Autonomous Agent Inactive</p>
                      <p className="mt-1">Deploy the autonomous FinOps agent loop using one of the sandbox cost anomalies on the Control Center.</p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* 3. RECOMMENDATIONS PAGE */}
            {activeTab === "recommendations" && (
              <motion.div
                key="recommendations"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <RecommendationsList
                  id="active-recommendations-ledger"
                  recommendations={recommendations}
                  onApply={handleApplyRecommendation}
                />
              </motion.div>
            )}

            {/* 4. REPORTING EXECUTIVE STATEMENTS */}
            {activeTab === "reporting" && (
              <motion.div
                key="reporting"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <ExecutiveReportWidget
                  id="executive-statement-sheet"
                  budget={budget}
                  resources={resources}
                  recommendations={recommendations}
                />
              </motion.div>
            )}

            {/* 5. CFO ADVISORY CHAT */}
            {activeTab === "cfo" && (
              <motion.div
                key="cfo"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <CFOConsole
                  id="interactive-cfo-advisor"
                  budget={budget}
                  activeAnomaly={selectedAnomaly}
                />
              </motion.div>
            )}

          </AnimatePresence>

        </div>
      </main>

      {/* 🔮 Aesthetic Footer */}
      <footer className="border-t border-slate-950 bg-slate-950/80 px-4 py-4 select-none">
        <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-[10px] text-slate-500 font-mono gap-2 text-center md:text-left">
          <p>© 2026 CLOUDPILOT AI ENGINE. CLOUD CFO CORE ENGINE v1.2.9-ALPHA.</p>
          <p>BUILT SECURELY WITH SERVER-SIDE @GOOGLE/GENAI SDK • ENFORCING ENTERPRISE FINOPS FRAMEWORK V2.0</p>
        </div>
      </footer>

    </div>
  );
}
