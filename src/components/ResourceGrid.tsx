import React, { useState } from "react";
import { CloudResource, ResourceType } from "../types";
import { Server, Database, Disc, Network, HardDrive, BadgeCheck, ShieldAlert } from "lucide-react";
import { motion } from "motion/react";

interface ResourceGridProps {
  id: string;
  resources: CloudResource[];
  onTerminate: (id: string) => void;
  onScale: (id: string, multiplier: number) => void;
}

export const ResourceGrid: React.FC<ResourceGridProps> = ({
  id,
  resources,
  onTerminate,
  onScale,
}) => {
  const [filterEnv, setFilterEnv] = useState<string>("All");
  const [filterType, setFilterType] = useState<string>("All");

  const filtered = resources.filter((res) => {
    const matchesEnv = filterEnv === "All" || res.environment === filterEnv;
    const matchesType = filterType === "All" || res.type === filterType;
    return matchesEnv && matchesType;
  });

  const getIcon = (type: ResourceType) => {
    switch (type) {
      case ResourceType.COMPUTE:
        return Server;
      case ResourceType.DATABASE:
        return Database;
      case ResourceType.STORAGE:
        return Disc;
      case ResourceType.KUBERNETES:
        return Network;
      default:
        return HardDrive;
    }
  };

  return (
    <div id={id} className="bg-slate-950/55 backdrop-blur-md border border-slate-900 rounded-xl p-5 md:p-6 flex flex-col gap-5 shadow-[0_8px_30px_rgb(0,0,0,0.4)] shadow-slate-950/50 relative overflow-hidden group">
      {/* Top ambient highlight anchor */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-slate-800/20 to-transparent" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900/60 pb-4 select-none">
        <div>
          <h4 className="text-[10px] font-mono text-indigo-400 tracking-wider uppercase font-semibold">Diagnostic Telemetry</h4>
          <h3 className="text-sm font-black font-display text-white mt-0.5 tracking-tight">Active Infrastructure Workloads Scan</h3>
        </div>
        
        {/* Resource Filtering Bar */}
        <div className="flex gap-2.5">
          <select
            value={filterEnv}
            onChange={(e) => setFilterEnv(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded px-2.5 py-1.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          >
            <option value="All">All Envs</option>
            <option value="Production">Production</option>
            <option value="Staging">Staging</option>
            <option value="Development">Development</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded px-2.5 py-1.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          >
            <option value="All">All Types</option>
            {Object.values(ResourceType).map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((res) => {
          const Icon = getIcon(res.type);
          
          // Compute status colors
          let statusColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
          if (res.status === "idle") {
            statusColor = "bg-amber-500/10 text-amber-400 border-amber-500/20";
          } else if (res.status === "terminated") {
            statusColor = "bg-slate-800 text-slate-500 border-slate-700/50";
          } else if (res.status === "scaled-down") {
            statusColor = "bg-indigo-500/10 text-indigo-400 border-indigo-500/30";
          }

          // Environmental badge styles
          let envColor = "bg-blue-500/10 text-blue-400";
          if (res.environment === "Production") {
            envColor = "bg-rose-500/10 text-rose-400";
          } else if (res.environment === "Staging") {
            envColor = "bg-amber-500/10 text-amber-400";
          }

          return (
            <motion.div
              layout
              key={res.id}
              className={`bg-slate-950/75 border rounded-xl p-4.5 flex flex-col justify-between transition-all duration-300 relative overflow-hidden group/card ${
                res.status === "terminated" 
                  ? "opacity-40 border-slate-950" 
                  : "border-slate-900/80 hover:border-slate-800/80 hover:shadow-lg hover:shadow-black/20"
              }`}
            >
              {/* Card top edge micro light highlight */}
              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-slate-800/10 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded bg-slate-900 border border-slate-800 ${res.status === "terminated" ? "text-slate-600" : "text-indigo-400"}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-white font-mono break-all line-clamp-1">{res.name}</h4>
                      <p className="text-[10px] text-slate-500 leading-tight">{res.type} • {res.region}</p>
                    </div>
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-mono uppercase border ${statusColor}`}>
                    {res.status}
                  </span>
                </div>

                <div className="mt-4 flex gap-2">
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${envColor}`}>
                    {res.environment}
                  </span>
                  {res.orphaned && (
                    <span className="text-[9px] px-2 py-0.5 rounded-full font-medium bg-purple-500/10 text-purple-400 flex items-center gap-1 border border-purple-500/20">
                      <ShieldAlert className="w-2.5 h-2.5" />
                      Orphaned Volume
                    </span>
                  )}
                  {res.utilization > 50 && res.status === "active" && (
                    <span className="text-[9px] px-2 py-0.5 rounded-full font-medium bg-emerald-500/10 text-emerald-400 flex items-center gap-0.5 border border-emerald-500/20">
                      <BadgeCheck className="w-2.5 h-2.5" />
                      Efficient
                    </span>
                  )}
                </div>

                {/* Utilization gauge */}
                {res.status !== "terminated" && (
                  <div className="mt-4">
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-mono">
                      <span>Telemetry Activity</span>
                      <span className={res.utilization < 10 ? "text-amber-400 font-bold" : "text-slate-300"}>
                        {res.utilization}% CPU
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          res.utilization < 10
                            ? "bg-amber-400"
                            : res.utilization > 70
                            ? "bg-emerald-400"
                            : "bg-indigo-400"
                        }`}
                        style={{ width: `${res.utilization}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Back-end Pricing & Interactive Action Box */}
              <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-mono tracking-wider">Hourly Cost</span>
                  <span className="text-sm font-bold text-slate-200 mt-0.5 font-mono">
                    ${res.status === "terminated" ? "0.00" : res.costPerHour.toFixed(2)}/hr
                  </span>
                </div>
                {res.status !== "terminated" && (
                  <div className="flex gap-2">
                    {res.type === ResourceType.DATABASE && res.status === "active" && (
                      <button
                        onClick={() => onScale(res.id, 0.25)}
                        className="text-[10px] px-2 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500-20 font-semibold"
                      >
                        Rightsize HP
                      </button>
                    )}
                    <button
                      onClick={() => onTerminate(res.id)}
                      className="text-[10px] px-2 py-1 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 font-semibold"
                    >
                      Shutdown
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full text-slate-500 border border-slate-800 border-dashed rounded-lg p-10 text-center text-xs">
            No active resources match your current selection filter. Try selecting different environment limits.
          </div>
        )}
      </div>
    </div>
  );
};
