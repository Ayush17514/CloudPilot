import React, { useState } from "react";
import { Recommendation } from "../types";
import { Check, ShieldCheck, Zap, Sparkles, Scale, Info } from "lucide-react";
import { motion } from "motion/react";

interface RecommendationsListProps {
  id: string;
  recommendations: Recommendation[];
  onApply: (id: string) => void;
}

export const RecommendationsList: React.FC<RecommendationsListProps> = ({
  id,
  recommendations,
  onApply,
}) => {
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

  const handleApplyClick = (recId: string) => {
    setLoadingMap((prev) => ({ ...prev, [recId]: true }));
    // Simulate a pristine technical execution delay
    setTimeout(() => {
      onApply(recId);
      setLoadingMap((prev) => ({ ...prev, [recId]: false }));
    }, 1500);
  };

  const getPriorityStyle = (priority: Recommendation["priority"]) => {
    switch (priority) {
      case "CRITICAL":
        return "bg-rose-500/10 text-rose-400 border-rose-500/30";
      case "HIGH":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "MEDIUM":
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/30";
      default:
        return "bg-slate-800 text-slate-300 border-slate-705/50";
    }
  };

  const getActionIcon = (type: Recommendation["actionType"]) => {
    switch (type) {
      case "terminate":
        return Zap;
      case "right-size":
        return Scale;
      case "delete":
        return ShieldCheck;
      default:
        return Sparkles;
    }
  };

  return (
    <div id={id} className="bg-slate-950/55 backdrop-blur-md border border-slate-900 rounded-xl p-5 flex flex-col gap-5 shadow-[0_8px_30px_rgb(0,0,0,0.4)] shadow-slate-950/50 relative overflow-hidden group">
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent" />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-900/60 pb-4 select-none">
        <div>
          <h4 className="text-[10px] font-mono text-emerald-400 tracking-wider uppercase font-semibold">Ledger Actions</h4>
          <h3 className="text-sm font-black text-white mt-0.5 tracking-tight font-display">Recommended Cost-Optimization Action Deck</h3>
        </div>
        <div className="mt-2 sm:mt-0 font-mono text-[10px] text-slate-400 flex items-center gap-1 bg-slate-950 border border-slate-850 px-2.5 py-1 rounded">
          <Info className="w-3.5 h-3.5 text-indigo-400" />
          <span>Applying items subtracts waste directly from simulated actual costs</span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {recommendations.map((rec) => {
          const ActionIcon = getActionIcon(rec.actionType);
          const isLoading = loadingMap[rec.id];

          return (
            <motion.div
              layout
              key={rec.id}
              className={`border rounded-xl p-4.5 bg-slate-950/70 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 relative overflow-hidden group/item ${
                rec.applied 
                  ? "border-emerald-900/30 bg-emerald-950/5 shadow-[inset_0_1px_0_0_rgba(16,185,129,0.02)]" 
                  : "border-slate-900/80 hover:border-slate-800/80 hover:shadow-lg hover:shadow-black/20"
              }`}
            >
              {/* Card visual accent anchor */}
              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-slate-800/10 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-lg border shrink-0 mt-0.5 ${
                  rec.applied
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-slate-900 text-indigo-400 border-slate-800"
                }`}>
                  <ActionIcon className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className={`text-xs font-bold leading-tight ${rec.applied ? "text-slate-400 line-through" : "text-slate-100"}`}>
                      {rec.title}
                    </h4>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${getPriorityStyle(rec.priority)}`}>
                      {rec.priority}
                    </span>
                    {rec.applied && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-mono">
                        <Check className="w-3 h-3" /> APPLIED
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{rec.description}</p>
                  
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-500 font-mono mt-2.5">
                    <span>Target: <strong className="text-slate-400 font-bold">{rec.resourceName}</strong></span>
                    <span>•</span>
                    <span>Action: <strong className="text-slate-400 font-bold uppercase">{rec.actionType}</strong></span>
                    <span>•</span>
                    <span>Risk: <span className="text-slate-400 font-bold">{rec.impactDescription}</span></span>
                  </div>
                </div>
              </div>

              {/* Cost Action Center */}
              <div className="flex items-center justify-between md:flex-col md:items-end justify-center pt-3 md:pt-0 border-t border-slate-900 md:border-0 shrink-0">
                <div className="text-left md:text-right">
                  <span className="text-[9px] text-slate-500 block uppercase font-mono tracking-wider">MONTHLY SAVINGS</span>
                  <span className="text-base font-bold text-emerald-400 font-mono">
                    +${rec.monthlySavings.toLocaleString()}/mo
                  </span>
                </div>
                
                <div className="mt-0.5 md:mt-3">
                  {rec.applied ? (
                    <div className="text-[10px] text-emerald-400 text-xs font-mono font-bold flex items-center gap-1 bg-emerald-500/5 px-2.5 py-1 rounded border border-emerald-500/10">
                      ✓ Cost Deducted
                    </div>
                  ) : (
                    <button
                      disabled={isLoading}
                      onClick={() => handleApplyClick(rec.id)}
                      className={`text-xs px-3.5 py-1.5 rounded font-bold transition-all flex items-center gap-1.5 ${
                        isLoading
                          ? "bg-indigo-950 border border-indigo-500/30 text-indigo-400 cursor-not-allowed"
                          : "bg-indigo-600 border border-indigo-500 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/10"
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin h-3.5 w-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Deploying API...
                        </>
                      ) : (
                        "Approve & Execute"
                      )}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
        {recommendations.length === 0 && (
          <div className="text-slate-500 border border-slate-800 border-dashed rounded-lg p-10 text-center text-xs">
            No active optimizations found. Execute an investigation sweep to detect resource savings.
          </div>
        )}
      </div>
    </div>
  );
};
