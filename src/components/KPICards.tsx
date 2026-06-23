import { motion } from "motion/react";
import { 
  Activity, 
  DollarSign, 
  Percent, 
  Users 
} from "lucide-react";

interface KPICardsProps {
  healthScore: number;
  estimatedUplift: string;
  fillRateOpt: string;
  bidDensity: string;
}

export default function KPICards({
  healthScore,
  estimatedUplift,
  fillRateOpt,
  bidDensity
}: KPICardsProps) {
  
  // Custom metadata for active visualizations
  const metrics = [
    {
      label: "Health Score",
      value: healthScore.toFixed(1),
      pillText: "+2.4%",
      pillColor: "bg-emerald-50 text-emerald-600",
      icon: Activity,
      borderColor: "hover:border-emerald-300",
      bars: [
        { h: "h-2", color: "bg-emerald-100" },
        { h: "h-3", color: "bg-emerald-200" },
        { h: "h-4", color: "bg-emerald-300" },
        { h: "h-5", color: "bg-emerald-400" },
        { h: "h-7", color: "bg-emerald-500" }
      ]
    },
    {
      label: "Estimated Uplift",
      value: estimatedUplift,
      pillText: "+$12.5k",
      pillColor: "bg-blue-50 text-blue-600",
      icon: DollarSign,
      borderColor: "hover:border-blue-300",
      bars: [
        { h: "h-1", color: "bg-blue-100" },
        { h: "h-2", color: "bg-blue-200" },
        { h: "h-4", color: "bg-blue-300" },
        { h: "h-6", color: "bg-blue-400" },
        { h: "h-8", color: "bg-blue-600" }
      ]
    },
    {
      label: "Fill Rate Opt.",
      value: fillRateOpt,
      pillText: "-0.8%",
      pillColor: "bg-amber-50 text-amber-600",
      icon: Percent,
      borderColor: "hover:border-amber-300",
      bars: [
        { h: "h-5", color: "bg-amber-100" },
        { h: "h-5", color: "bg-amber-200" },
        { h: "h-5", color: "bg-amber-300" },
        { h: "h-4", color: "bg-amber-400" },
        { h: "h-4", color: "bg-amber-500" }
      ]
    },
    {
      label: "Bid Density",
      value: bidDensity,
      pillText: "+18.2%",
      pillColor: "bg-purple-50 text-purple-600",
      icon: Users,
      borderColor: "hover:border-purple-300",
      bars: [
        { h: "h-2", color: "bg-purple-50" },
        { h: "h-2", color: "bg-purple-100" },
        { h: "h-4", color: "bg-purple-200" },
        { h: "h-6", color: "bg-purple-400" },
        { h: "h-7", color: "bg-purple-600" }
      ]
    }
  ];

  return (
    <div id="kpi-cards-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {metrics.map((m, i) => {
        const Icon = m.icon;
        return (
          <motion.div
            id={`kpi-card-${m.label.toLowerCase().replace(/[^a-z]/g, "")}`}
            key={m.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            whileHover={{ y: -4 }}
            className={`p-5 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 select-none flex flex-col justify-between overflow-hidden relative group/kpi ${m.borderColor}`}
          >
            {/* Top row */}
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">
                {m.label}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${m.pillColor}`}>
                {m.pillText}
              </span>
            </div>

            {/* Middle value & dynamic glow */}
            <div className="flex items-center gap-2">
              <p className="text-3xl font-black text-slate-800 tracking-tight leading-none group-hover/kpi:text-slate-950 transition-colors">
                {m.value}
              </p>
              <div className="text-slate-200 group-hover/kpi:text-slate-400/40 ml-auto transition-colors">
                <Icon className="w-5 h-5 stroke-[1.5]" />
              </div>
            </div>

            {/* Bottom visual columns progress matching screenshot exactly */}
            <div className="mt-5 flex items-end gap-[3px] h-8 relative">
              {m.bars.map((bar, idx) => (
                <div
                  key={idx}
                  className={`w-full rounded-full transition-all duration-700 ${bar.h} ${bar.color} group-hover/kpi:opacity-90`}
                  style={{
                    transformOrigin: "bottom",
                    transform: "scaleY(1)"
                  }}
                />
              ))}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
