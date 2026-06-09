import React from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import { CostDataPoint } from "../types";

interface CostChartProps {
  id: string;
  data: CostDataPoint[];
  budget: number;
}

export const CostChart: React.FC<CostChartProps> = ({ id, data, budget }) => {
  // Custom tooltip styling
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-lg p-3.5 shadow-[0_12px_40px_rgba(0,0,0,0.6)] text-[11px] font-mono leading-relaxed">
          <p className="text-slate-400 font-extrabold mb-1.5 border-b border-slate-900 pb-1.5 uppercase tracking-wider">{label}</p>
          <div className="space-y-1">
            <p className="text-rose-400 flex items-center justify-between gap-4">
              <span>Actual Spend:</span>
              <span className="font-extrabold font-mono">${payload[0].value.toFixed(2)}</span>
            </p>
            {payload[1] && (
              <p className="text-indigo-400 flex items-center justify-between gap-4">
                <span>Forecast Spend:</span>
                <span className="font-extrabold font-mono">${payload[1].value.toFixed(2)}</span>
              </p>
            )}
            <p className="text-emerald-400 flex items-center justify-between gap-4 border-t border-slate-900/60 pt-1 mt-1">
              <span>Budget Cap Rate:</span>
              <span className="font-extrabold font-mono">${payload[2]?.value?.toFixed(2) || (budget / 30).toFixed(2)}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div id={id} className="w-full h-[320px] bg-slate-950/55 backdrop-blur-md border border-slate-900 rounded-xl p-5 flex flex-col justify-between shadow-[0_8px_30px_rgb(0,0,0,0.4)] shadow-slate-950/40 relative overflow-hidden group">
      {/* Subtle top decoration line */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-slate-800/20 to-transparent" />
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4 select-none">
        <div>
          <h4 className="text-xs font-mono text-indigo-400 tracking-wider uppercase font-semibold">Telemetry Feed</h4>
          <h3 className="text-base font-black font-display text-white tracking-tight mt-0.5">Spend Correlation & Cap Boundaries</h3>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[10px] font-mono shrink-0">
          <div className="flex items-center gap-1.5 text-rose-400">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
            Actual Daily Cost
          </div>
          <div className="flex items-center gap-1.5 text-indigo-400">
            <span className="w-2.5 h-0.5 border-t-2 border-dashed border-indigo-400" />
            Adaptive Forecast
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2.5 h-0.5 border-t-2 border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            Budget Threshold
          </div>
        </div>
      </div>

      <div className="w-full h-full min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#0f172a" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#475569"
              fontSize={9}
              fontFamily="JetBrains Mono"
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#475569"
              fontSize={9}
              fontFamily="JetBrains Mono"
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#1e293b', strokeWidth: 1 }} />
            
            {/* Standard Budget Constraint */}
            <ReferenceLine
              y={budget / 30}
              stroke="#10b981"
              strokeDasharray="4 4"
              strokeWidth={1.5}
            />

            {/* Simulated actual cost area */}
            <Area
              type="monotone"
              name="Actual Spend"
              dataKey="actualCost"
              stroke="#f43f5e"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorActual)"
            />

            {/* Projected Cost overlay line */}
            <Area
              type="monotone"
              name="Projected Trend"
              dataKey="projectedCost"
              stroke="#6366f1"
              strokeWidth={1.5}
              strokeDasharray="5 5"
              fillOpacity={1}
              fill="url(#colorProjected)"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
