import React from "react";
import { LucideIcon } from "lucide-react";
import { motion } from "motion/react";

interface MetricCardProps {
  id: string;
  title: string;
  value: string;
  subtext: string;
  trend?: {
    value: string;
    direction: "up" | "down" | "neutral";
  };
  icon: LucideIcon;
  color: string; // Tailwind tint class e.g., "text-emerald-500 bg-emerald-500/10"
  progressBar?: {
    percentage: number;
    color: string;
  };
}

export const MetricCard: React.FC<MetricCardProps> = ({
  id,
  title,
  value,
  subtext,
  trend,
  icon: Icon,
  color,
  progressBar,
}) => {
  const [iconColorClass, bgClass] = color.split(" ");

  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className="bg-slate-950/55 backdrop-blur-md border border-slate-900 hover:border-slate-800/80 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.4)] shadow-slate-950/50 rounded-xl p-5 flex flex-col justify-between relative overflow-hidden group"
    >
      {/* Soft Hover Glimmer Ambient Lights */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-b from-indigo-500/5 to-transparent rounded-full filter blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Subtle top highlights line */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-slate-800/40 to-transparent pin-t" />

      <div className="flex items-start justify-between">
        <div>
          <span className="text-[10px] font-mono font-medium text-slate-500 uppercase tracking-wider block">{title}</span>
          <h3 className="text-2xl font-black font-display text-white mt-1.5 select-all tracking-tight">{value}</h3>
        </div>
        <div className={`p-2 rounded-lg border border-slate-950 select-none ${bgClass || "bg-slate-900/60"} shadow-md shadow-black/10`}>
          <Icon className={`w-4 h-4 ${iconColorClass || "text-slate-300"}`} />
        </div>
      </div>

      <div className="mt-4">
        {progressBar && (
          <div className="w-full bg-slate-900/80 rounded-full h-1 mb-3.5 overflow-hidden border border-slate-900/40 shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, progressBar.percentage)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full rounded-full ${progressBar.color}`}
            />
          </div>
        )}

        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-slate-400 font-medium tracking-tight leading-none">{subtext}</span>
          {trend && (
            <span
              className={`font-semibold px-2 py-0.5 rounded text-[10px] flex items-center gap-1 leading-none shadow-sm border ${
                trend.direction === "down"
                  ? "text-emerald-400 bg-emerald-950/30 border-emerald-500/20"
                  : trend.direction === "up"
                  ? "text-rose-400 bg-rose-950/30 border-rose-500/20"
                  : "text-slate-400 bg-slate-900 border-slate-800"
              }`}
            >
              <span className="text-[8px]">{trend.direction === "up" ? "▲" : trend.direction === "down" ? "▼" : "•"}</span>{" "}
              {trend.value}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
