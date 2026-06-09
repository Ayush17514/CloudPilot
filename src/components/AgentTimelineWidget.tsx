import React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Activity,
  AlertTriangle,
  Search,
  Cpu,
  TrendingDown,
  Sparkles,
  FileSpreadsheet,
  Terminal,
} from "lucide-react";
import { AgentStep, AgentLog } from "../types";

interface AgentTimelineWidgetProps {
  id: string;
  currentStep: AgentStep;
  status: "idle" | "investigating" | "completed";
  progress: number;
  logs: AgentLog[];
}

interface TimelineNode {
  step: AgentStep;
  label: string;
  icon: React.ComponentType<any>;
  description: string;
  color: string;
}

const TIMELINE_NODES: TimelineNode[] = [
  {
    step: AgentStep.MONITORING,
    label: "Monitoring",
    icon: Activity,
    description: "Inspecting billing matrices & resources",
    color: "from-blue-500 to-sky-400",
  },
  {
    step: AgentStep.DETECTION,
    label: "Anomaly Detection",
    icon: AlertTriangle,
    description: "Scanning cost spikes & metrics",
    color: "from-amber-500 to-amber-400",
  },
  {
    step: AgentStep.INVESTIGATION,
    label: "Investigation",
    icon: Search,
    description: "Scrutinizing node pools & clusters",
    color: "from-purple-500 to-indigo-400",
  },
  {
    step: AgentStep.ROOT_CAUSE,
    label: "Root Cause Discovery",
    icon: Cpu,
    description: "Debugging waste ownership",
    color: "from-rose-500 to-pink-400",
  },
  {
    step: AgentStep.SAVINGS_ANALYSIS,
    label: "Savings Analysis",
    icon: TrendingDown,
    description: "Calculating sizing efficiencies",
    color: "from-emerald-500 to-teal-400",
  },
  {
    step: AgentStep.RECOMMENDATIONS,
    label: "Recommendations",
    icon: Sparkles,
    description: "Formulating architectural fixes",
    color: "from-indigo-500 to-blue-400",
  },
  {
    step: AgentStep.REPORT,
    label: "Executive Report",
    icon: FileSpreadsheet,
    description: "Compiling CFO summary reports",
    color: "from-cyan-500 to-teal-400",
  },
];

export const AgentTimelineWidget: React.FC<AgentTimelineWidgetProps> = ({
  id,
  currentStep,
  status,
  progress,
  logs,
}) => {
  const activeIdx = TIMELINE_NODES.findIndex((n) => n.step === currentStep);

  return (
    <div id={id} className="bg-slate-950/55 backdrop-blur-md border border-slate-900 rounded-xl p-5 md:p-6 flex flex-col gap-6 shadow-[0_8px_30px_rgb(0,0,0,0.4)] shadow-slate-950/50 overflow-hidden relative group">
      {/* Subtle styling accent line */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/15 to-transparent" />

      {/* Target Timeline Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
            <Cpu className="w-5 h-5 text-indigo-400 animate-pulse" />
          </div>
          <div>
            <h4 className="text-[10px] font-mono text-indigo-400 tracking-wider uppercase font-semibold">Autonomous FinOps Agent</h4>
            <h3 className="text-base font-black font-display text-white tracking-tight mt-0.5">Davis Diagnostic Reasoning Loop</h3>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs shrink-0">
          {status === "investigating" && (
            <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/55 border border-indigo-500/30 text-indigo-400 font-mono font-extrabold text-[11px] shadow-[0_0_12px_rgba(99,102,241,0.2)] animate-pulse">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping inline-block shadow-[0_0_8px_rgb(129,140,248)]" />
              ANALYZING ({progress}%)
            </span>
          )}
          {status === "completed" && (
            <span className="px-3 py-1 rounded-full bg-emerald-950/55 border border-emerald-500/30 text-emerald-400 font-bold font-mono text-[11px] flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              VERDICT COMPILED
            </span>
          )}
          {status === "idle" && (
            <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-850 text-slate-400 font-mono text-[11px] tracking-wider uppercase">
              ○ standby
            </span>
          )}
        </div>
      </div>

      {/* Visual Workflow Node Loop */}
      <div className="relative pt-3 pb-5">
        {/* Connection Background Line */}
        <div className="absolute top-[34px] left-[5%] right-[5%] h-[2px] bg-slate-900/60 z-0 hidden lg:block" />
        
        {/* Glowing Progress Line */}
        {status !== "idle" && (
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: `${(activeIdx / (TIMELINE_NODES.length - 1)) * 90}%` }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute top-[34px] left-[5%] h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 z-0 hidden lg:block shadow-[0_0_8px_rgba(99,102,241,0.5)]"
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-6 relative z-10">
          {TIMELINE_NODES.map((node, idx) => {
            const isCompleted = activeIdx > idx || status === "completed";
            const isActive = activeIdx === idx && status === "investigating";
            
            const Icon = node.icon;

            return (
              <div key={node.step} className="flex flex-col items-center text-center group cursor-default">
                <div className="relative">
                  {/* Status Ring */}
                  <motion.div
                    animate={isActive ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                    transition={{ repeat: Infinity, duration: 2.5 }}
                    className={`w-11 h-11 rounded-full flex items-center justify-center border transition-all duration-300 ${
                      isActive
                        ? `bg-indigo-950 text-indigo-400 border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.35)]`
                        : isCompleted
                        ? "bg-slate-900/90 text-emerald-400 border-emerald-500/80 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                        : "bg-slate-950 text-slate-600 border-slate-900"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </motion.div>

                  {/* Complete Checkmark Ring */}
                  {isCompleted && (
                    <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 text-slate-950 rounded-full flex items-center justify-center text-[8px] font-black border border-slate-950 select-none">
                      ✓
                    </div>
                  )}
                </div>

                <div className="mt-3 select-none">
                  <p className={`text-[11px] font-bold tracking-tight transition-all duration-200 ${
                    isActive ? "text-indigo-400 font-extrabold" : isCompleted ? "text-slate-200" : "text-slate-500"
                  }`}>
                    {node.label}
                  </p>
                  <p className="text-[9px] text-slate-500 mt-0.5 leading-tight max-w-[120px] mx-auto opacity-80 md:opacity-100 transition-opacity">
                    {node.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Terminal Agent Logs Window */}
      <div className="bg-slate-950 border border-slate-900 rounded-lg p-4 flex flex-col gap-2.5 shadow-inner">
        <div className="flex items-center justify-between pb-2 border-b border-slate-900/60 select-none">
          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            <Terminal className="w-3.5 h-3.5" />
            <span>Telemetry Diagnostic Console Logs</span>
          </div>
          <span className="text-[9px] font-mono text-slate-600">SYS_SECURE_SWEEP v1.1.0</span>
        </div>
        
        <div className="h-[140px] overflow-y-auto flex flex-col-reverse gap-2 font-mono text-xs pr-2 scrollbar-thin scrollbar-thumb-slate-900 scrollbar-track-transparent">
          {logs.length === 0 ? (
            <div className="text-slate-600 italic text-center py-10 text-[11px] select-none">
              FinOps autonomous controller standby. Select an anomaly scenario below and deploy the diagnostic AI trace sweep.
            </div>
          ) : (
            [...logs].reverse().map((log, i) => {
              let statusColor = "text-slate-400";
              let statusBadge = "INFO";
              let badgeBg = "bg-slate-900 text-slate-400 border-slate-800";
              if (log.status === "warning") {
                statusColor = "text-amber-400 bg-amber-950/20";
                statusBadge = "WARN";
                badgeBg = "bg-amber-950/40 text-amber-400 border-amber-500/20";
              } else if (log.status === "success") {
                statusColor = "text-emerald-400 bg-emerald-950/10";
                statusBadge = "OK";
                badgeBg = "bg-emerald-950/40 text-emerald-400 border-emerald-500/20";
              } else if (log.status === "running") {
                statusColor = "text-indigo-400 animate-pulse";
                statusBadge = "RUN";
                badgeBg = "bg-indigo-950/50 text-indigo-400 border-indigo-500/20";
              }

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-start gap-3 p-1.5 rounded border border-transparent hover:border-slate-900/60 hover:bg-slate-900/10 transition-colors ${statusColor}`}
                >
                  <span className="text-[9px] text-slate-600 shrink-0 select-none pt-0.5">
                    {log.timestamp}
                  </span>
                  <span className={`text-[8px] font-black tracking-widest px-1.5 py-0.5 rounded border shrink-0 text-center font-mono ${badgeBg}`}>
                    {statusBadge}
                  </span>
                  <span className="font-mono text-[11px] leading-relaxed break-all select-all">{log.message}</span>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
