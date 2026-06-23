import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Terminal, 
  ArrowRight,
  Eye,
  Check,
  Code
} from "lucide-react";
import { Finding } from "../types";

interface AuditFindingsProps {
  findings: Finding[];
  onApplyFix: (finding: Finding) => void;
}

export default function AuditFindings({
  findings,
  onApplyFix
}: AuditFindingsProps) {
  const [activeCodeView, setActiveCodeView] = useState<string | null>(null);
  const [appliedFixIds, setAppliedFixIds] = useState<string[]>([]);

  // Count severities dynamically
  const criticalCount = findings.filter((f) => f.severity === "critical").length;
  const warningCount = findings.filter((f) => f.severity === "warning").length;

  const handleFixClick = (finding: Finding) => {
    onApplyFix(finding);
    setAppliedFixIds((prev) => [...prev, finding.id]);
    setTimeout(() => {
      // Clear after visual feedback
      setAppliedFixIds((prev) => prev.filter((id) => id !== finding.id));
    }, 2000);
  };

  return (
    <div id="audit-findings-panel" className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
      {/* Panel Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2.5">
          <Terminal className="w-5 h-5 text-[#1557ff]" />
          <h3 className="text-base font-bold text-slate-800">Audit Findings</h3>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] font-mono">
          <span className="bg-red-50 text-red-600 px-2.5 py-1 rounded-full font-black uppercase tracking-wider">
            {criticalCount} Critical
          </span>
          <span className="bg-amber-50 text-amber-600 px-2.5 py-1 rounded-full font-black uppercase tracking-wider">
            {warningCount} Warnings
          </span>
        </div>
      </div>

      {/* Findings list */}
      <div id="findings-list-container" className="space-y-4">
        {findings.map((f, idx) => {
          const isCritical = f.severity === "critical";
          const isWarning = f.severity === "warning";
          const isSuccess = f.severity === "success";

          // Select color palettes
          let containerClass = "bg-slate-50 border-slate-100";
          let iconBgClass = "bg-slate-500";
          let titleColor = "text-slate-900";
          let bodyColor = "text-slate-700";
          let idColor = "text-slate-400";
          let IconComp = CheckCircle2;

          if (isCritical) {
            containerClass = "bg-red-50/40 border border-red-1k/10 border-red-100";
            iconBgClass = "bg-red-600 shadow-sm shadow-red-500/20";
            titleColor = "text-red-950 font-extrabold";
            bodyColor = "text-red-900/80";
            idColor = "text-red-400";
            IconComp = ShieldAlert;
          } else if (isWarning) {
            containerClass = "bg-amber-50/40 border border-amber-1k/10 border-amber-100";
            iconBgClass = "bg-amber-500 shadow-sm shadow-amber-500/20";
            titleColor = "text-amber-950 font-extrabold";
            bodyColor = "text-amber-900/85";
            idColor = "text-amber-500/60";
            IconComp = AlertTriangle;
          } else if (isSuccess) {
            containerClass = "bg-emerald-50/40 border border-emerald-1k/10 border-emerald-100";
            iconBgClass = "bg-emerald-500 shadow-sm shadow-emerald-500/20";
            titleColor = "text-emerald-950 font-extrabold";
            bodyColor = "text-emerald-900/80";
            idColor = "text-emerald-400";
            IconComp = CheckCircle2;
          }

          const hasCodeView = !!f.actionViewSource;
          const hasFix = !!f.actionFix;
          const isFixApplied = appliedFixIds.includes(f.id);

          return (
            <motion.div
              id={`finding-card-${f.id.toLowerCase()}`}
              key={f.id || idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.04 }}
              className={`p-5 rounded-2xl leading-relaxed flex flex-col gap-4 ${containerClass}`}
            >
              {/* Header inside finding */}
              <div className="flex items-start gap-3.5">
                <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-white ${iconBgClass}`}>
                  <IconComp className="w-5 h-5 stroke-[2]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`text-sm font-bold truncate leading-snug ${titleColor}`}>
                    {f.title}
                  </h4>
                  <p className={`text-[10px] font-mono tracking-wider font-semibold uppercase mt-0.5 ${idColor}`}>
                    ID: {f.id}
                  </p>
                </div>
              </div>

              {/* Description Body */}
              <p className={`text-xs ${bodyColor} leading-relaxed`}>
                {f.description}
              </p>

              {/* Custom Warning status bar matching screenshot exactly */}
              {isWarning && f.id === "WRN_412" && (
                <div className="w-full bg-amber-200/30 h-1.5 rounded-full overflow-hidden mt-1 select-none">
                  <div className="bg-amber-500 h-full w-3/4 rounded-full" />
                </div>
              )}

              {/* Action row (Except success status unless we want debug logs) */}
              {!isSuccess && (hasCodeView || hasFix) && (
                <div className="flex flex-wrap gap-2.5 pt-1.5">
                  {hasCodeView && (
                    <button
                      id={`btn-viewsrc-${f.id}`}
                      onClick={() => setActiveCodeView(activeCodeView === f.id ? null : f.id)}
                      className={`text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 border transition-all cursor-pointer ${
                        activeCodeView === f.id
                          ? "bg-slate-800 text-white border-slate-800"
                          : isCritical
                          ? "bg-white border-red-200 text-red-700 hover:bg-red-50/50"
                          : "bg-white border-amber-200 text-amber-700 hover:bg-amber-50/50"
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{activeCodeView === f.id ? "Hide Source" : "View Source"}</span>
                    </button>
                  )}

                  {hasFix && (
                    <button
                      id={`btn-applyfix-${f.id}`}
                      onClick={() => handleFixClick(f)}
                      disabled={isFixApplied}
                      className={`text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 border transition-all cursor-pointer ${
                        isFixApplied
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : isCritical
                          ? "bg-red-600 text-white border-red-600 hover:bg-red-700"
                          : "bg-amber-600 text-white border-amber-600 hover:bg-amber-700"
                      }`}
                    >
                      {isFixApplied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Applied!</span>
                        </>
                      ) : (
                        <>
                          <Code className="w-3.5 h-3.5" />
                          <span>Apply Fix</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}

              {/* Code visual drawer */}
              <AnimatePresence>
                {activeCodeView === f.id && f.actionViewSource && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden bg-slate-900 border border-slate-800 rounded-xl leading-normal mt-1"
                  >
                    <div className="flex items-center justify-between px-3.5 py-2 border-b border-slate-800 select-none">
                      <span className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-wider">
                        Source Payload Snippet
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">JSON</span>
                    </div>
                    <pre className="p-4 overflow-x-auto text-[11px] font-mono text-slate-300 whitespace-pre">
                      {f.actionViewSource}
                    </pre>

                    {f.actionFix && (
                      <div className="border-t border-slate-800 bg-[#0e172a] p-3.5 flex flex-col gap-2">
                        <div className="text-[10px] font-black text-emerald-400 tracking-wider uppercase font-mono flex items-center gap-1">
                          <span>Correction Suggestion</span>
                          <ArrowRight className="w-3 h-3" />
                        </div>
                        <pre className="text-[11px] font-mono text-emerald-300 overflow-x-auto p-2 bg-[#0c201d] border border-[#143e35] rounded-lg">
                          {f.actionFix}
                        </pre>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        {findings.length === 0 && (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-500">No findings logged.</p>
            <p className="text-[11px] text-slate-400 mt-1">Run an analysis on your bid requests to parse yield audits.</p>
          </div>
        )}
      </div>
    </div>
  );
}
