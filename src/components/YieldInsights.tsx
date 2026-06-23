import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  TrendingUp, 
  HelpCircle, 
  Settings2, 
  Calculator, 
  Layers, 
  Zap, 
  Activity, 
  TrendingDown, 
  Target 
} from "lucide-react";

export default function YieldInsights() {
  const [floorCpm, setFloorCpm] = useState<number>(1.85);

  // Dynamic simulation engine based on CPM floor select
  const simulatedYield = (floor: number) => {
    // Basic polynomial curve representing trade-off between price floor and fill rate
    // Peak is around 1.85
    let fillRate = 100 - (floor * 20) - (floor > 1.8 ? (floor - 1.8) * 15 : 0);
    fillRate = Math.max(Math.min(fillRate, 98), 5);
    
    // Revenue is roughly relative to fillRate * floorPrice
    const expectedRevenue = (fillRate * floor * 1500).toFixed(0);
    const revenueFactorIdx = (fillRate * floor) / (85 * 1.5); // relative to standard $1.50 floor
    const yieldUplift = ((revenueFactorIdx - 1) * 100).toFixed(1);

    return {
      fillRate: fillRate.toFixed(1),
      revenue: parseFloat(expectedRevenue).toLocaleString(),
      uplift: parseFloat(yieldUplift) >= 0 ? `+${yieldUplift}%` : `${yieldUplift}%`,
      upliftVal: parseFloat(yieldUplift),
      optStatus: floor === 1.85 ? "Optimal" : floor > 1.85 ? "Aggressive Risk" : "Underpriced Yield Loss"
    };
  };

  const sim = simulatedYield(floorCpm);

  // CPM slider ticks
  const floorOptions = [1.00, 1.30, 1.50, 1.85, 2.20, 2.50];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
      id="yield-insights-view"
    >
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-[#101b3a] p-6 rounded-3xl text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 select-none">
        <div>
          <span className="bg-blue-500/20 text-blue-300 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider font-mono">
            Auditor Simulator Core
          </span>
          <h3 className="text-xl font-black tracking-tight mt-2 text-white">Interactive Floor Pricing Optimizer</h3>
          <p className="text-slate-300 text-xs mt-1 max-w-xl">
             Monetization simulator maps downstream demand curves to identify optimal CPM floor thresholds. Select a floor rate to project auction fill rates.
          </p>
        </div>
        <div className="bg-[#1557ff] p-4 rounded-2xl shadow-lg border border-white/10 shrink-0">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: CPM Optimizer Controls */}
        <div className="lg:col-span-5 bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-6">
          <div className="flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-[#1557ff]" />
            <h4 className="text-xs font-black uppercase text-slate-800 tracking-widest font-mono">Pricing Simulator</h4>
          </div>

          {/* Pricing Selector Buttons */}
          <div className="space-y-3">
            <label className="block text-[11px] text-slate-500 font-bold">Select Active CPM Floor Pricing Rule:</label>
            <div className="grid grid-cols-3 gap-2">
              {floorOptions.map((opt) => (
                <button
                  id={`cpm-opt-btn-${opt.toFixed(2).replace(".", "")}`}
                  key={opt}
                  onClick={() => setFloorCpm(opt)}
                  className={`py-2 px-3 text-xs rounded-xl font-bold border transition-all cursor-pointer ${
                    floorCpm === opt
                      ? "bg-[#1557ff] text-white border-[#1557ff] font-extrabold shadow-sm shadow-blue-500/20"
                      : "bg-white text-slate-600 border-slate-100 hover:border-slate-300"
                  }`}
                >
                  ${opt.toFixed(2)}
                </button>
              ))}
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Core Metrics comparison */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl select-none">
              <div className="flex items-start gap-2 text-xs">
                <Target className="w-4 h-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="font-extrabold text-slate-700">Projected Fill Rate</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Auction clearance success</p>
                </div>
              </div>
              <p className="text-base font-black text-slate-800 font-mono">{sim.fillRate}%</p>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl select-none">
              <div className="flex items-start gap-2 text-xs">
                <Calculator className="w-4 h-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="font-extrabold text-slate-700">Daily Revenue Projection</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Estimated gross output</p>
                </div>
              </div>
              <p className="text-base font-black text-slate-800 font-mono">${sim.revenue}</p>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl select-none">
              <div className="flex items-start gap-2 text-xs">
                <Zap className="w-4 h-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="font-extrabold text-slate-700">Expected Yield Uplift</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Change from $1.50 baseline</p>
                </div>
              </div>
              <p className={`text-base font-black font-mono ${sim.upliftVal >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                {sim.uplift}
              </p>
            </div>
          </div>

          {/* Auditor Tipping Status Alert */}
          <div className={`p-4 rounded-2xl flex items-start gap-3 border text-xs leading-relaxed select-none ${
            floorCpm === 1.85 
              ? "bg-emerald-50 border-emerald-100 text-emerald-800" 
              : floorCpm > 1.85 
              ? "bg-red-50 border-red-100 text-red-800" 
              : "bg-amber-50 border-amber-100 text-amber-800"
          }`}>
            <Activity className="w-4 h-4 shrink-0 mt-0.5 animate-pulse" />
            <div>
              <p className="font-extrabold tracking-tight">Status: {sim.optStatus}</p>
              <p className="mt-1 text-[11px] opacity-90">
                {floorCpm === 1.85 
                  ? "Perfect equilibrium! Maximizes bid density value index while maintaining structural programmatic auction fluid clearing rates."
                  : floorCpm > 1.85
                  ? "Critical Warning: Overpricing floors reduces total bid volume too heavily, resulting in buyers skipping the auction."
                  : "Revenue Leak Warning: Setting CPM floors too low fails to capture premium programmatic demand bids correctly."
                }
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Simulated CPM Curve Visualization */}
        <div className="lg:col-span-7 bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between select-none">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#1557ff]" />
              <h4 className="text-xs font-black uppercase text-slate-800 tracking-widest font-mono">Visual Yield Matrix</h4>
            </div>
            <span className="text-[10px] text-gray-400 bg-slate-50 px-2.5 py-1 rounded-full font-bold">
              Baseline floor: $1.50 CPM
            </span>
          </div>

          {/* Interactive Custom SVG-style visual graph */}
          <div className="my-8 flex items-end justify-between gap-4 h-56 px-4 relative select-none">
            {floorOptions.map((opt) => {
              const res = simulatedYield(opt);
              const heightPct = Math.max(30, (parseFloat(res.revenue.replace(/,/g, "")) / 2100)); // normalized height
              const isSelected = floorCpm === opt;

              return (
                <div key={opt} className="flex-1 flex flex-col items-center group relative cursor-pointer" onClick={() => setFloorCpm(opt)}>
                  {/* Tooltip on Hover */}
                  <div className={`absolute -top-12 bg-slate-900 text-white rounded-lg p-2 text-[10px] font-mono shadow-lg transition-all duration-200 pointer-events-none ${
                    isSelected ? "opacity-100 scale-100" : "opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100"
                  } z-20 whitespace-nowrap`}>
                    <p className="font-bold">Rev: ${res.revenue}/day</p>
                    <p className="text-[9px] text-slate-400">Fill: {res.fillRate}%</p>
                  </div>

                  {/* Visual Bar Column */}
                  <div className="w-full flex items-end justify-center rounded-xl overflow-hidden h-40 bg-slate-50 border border-slate-100/50">
                    <motion.div
                      animate={{ height: `${heightPct}%` }}
                      transition={{ type: "spring", stiffness: 100, damping: 15 }}
                      className={`w-full rounded-t-lg transition-colors ${
                        isSelected 
                          ? "bg-gradient-to-t from-[#1557ff] to-blue-400" 
                          : "bg-slate-200 group-hover:bg-slate-300"
                      }`}
                    />
                  </div>

                  {/* Label */}
                  <p className={`text-[10px] font-bold font-mono mt-2.5 ${isSelected ? "text-[#1557ff]" : "text-slate-500"}`}>
                    ${opt.toFixed(2)}
                  </p>
                  <p className="text-[9px] text-slate-400 font-medium">Floor CPM</p>
                </div>
              );
            })}
          </div>

          {/* Extra Auditor Stats Grid */}
          <div className="grid grid-cols-3 gap-3 border-t border-slate-50 pt-5 text-center select-none">
            <div>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-[9px] font-mono">Request Latency</p>
              <p className="text-sm font-black text-slate-800 font-mono mt-1">118 ms</p>
              <p className="text-[10px] text-emerald-500 font-bold mt-0.5">optimal</p>
            </div>
            <div>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-[9px] font-mono font-bold">Cookie Match</p>
              <p className="text-sm font-black text-slate-800 font-mono mt-1">84.2%</p>
              <p className="text-[10px] text-emerald-500 font-bold mt-0.5">excellent</p>
            </div>
            <div>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-[9px] font-mono">CPM Floor Delta</p>
              <p className="text-sm font-black text-slate-800 font-mono mt-1">+$0.35</p>
              <p className="text-[10px] text-blue-500 font-bold mt-0.5">recommended</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
