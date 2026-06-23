import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  History, 
  Share2, 
  Check, 
  ChevronRight,
  Sparkles,
  AlertCircle
} from "lucide-react";

import Sidebar from "./components/Sidebar";
import KPICards from "./components/KPICards";
import AuditFindings from "./components/AuditFindings";
import OutreachDraft from "./components/OutreachDraft";
import YieldInsights from "./components/YieldInsights";
import BidStream from "./components/BidStream";

import { Finding, EmailOutreach, AnalysisResult } from "./types";

// Baseline design static mock so app is immediately visual and loaded perfectly
const BASELINE_FINDINGS: Finding[] = [
  {
    id: "ERR_092",
    severity: "critical",
    title: "Missing Prebid Ad Unit Mapping",
    description: "32% of requests are failing due to unmapped site ID parameters in the OpenRTB object. This is causing significant fill rate loss.",
    actionViewSource: `// Context impression block lacking site/app parameters:
"imp": [{
  "id": "1",
  "video": {
    "mimes": ["video/mp4"],
    "h": 480,
    "w": 640
  }
}]`,
    actionFix: `{
  "id": "br_938201",
  "site": {
    "id": "site_88291",
    "name": "Minute Media"
  },
  "imp": [{
    "id": "1",
    "video": {
      "mimes": ["video/mp4"],
      "h": 480,
      "w": 640
    }
  }]
}`
  },
  {
    id: "WRN_412",
    severity: "warning",
    title: "Sub-optimal Floor Price",
    description: "Floors are set at $1.50 CPM, but historical bid data suggests a $1.85 CPM floor would increase yield by 14.2% without impacting fill.",
    actionViewSource: `"bidfloor": 1.50`,
    actionFix: `"bidfloor": 1.85`
  },
  {
    id: "OK_101",
    severity: "success",
    title: "App-ads.txt Compliant",
    description: "Publisher's app-ads.txt is perfectly synchronized with authorized programmatic sellers."
  }
];

const BASELINE_OUTREACH: EmailOutreach = {
  to: "publisher-lead@client.com",
  subj: "Revenue Opportunity: Audit Findings for {{Publisher}}",
  body: `Hi Team,

Our Yield Auditor tool just completed a deep-dive analysis into your recent bid requests. We identified a critical mapping error that is currently suppressing about 32% of your available inventory.

Key Recommendation:
Mapping the Prebid ad units correctly could unlock an estimated $12,500 in weekly revenue uplift based on current auction demand.

When can we hop on a quick 5-minute call to discuss the fix?

Best,
Alex Rivera`
};

export default function App() {
  const [activeTab, setActiveTab] = useState<"workspace" | "insights" | "stream">("workspace");
  const [publisherName, setPublisherName] = useState<string>("Minute Media");
  
  // Design default raw JSON text
  const [jsonInput, setJsonInput] = useState<string>(
    `{\n  "id": "br_938201",\n  "imp": [{\n    "id": "1",\n    "video": {\n      "mimes": ["video/mp4"],\n      "h": 480,\n      "w": 640\n    }\n  }]\n}`
  );

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isRefreshingOutreach, setIsRefreshingOutreach] = useState<boolean>(false);
  
  // Main aggregate result
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult>({
    healthScore: 94.2,
    estimatedUplift: "$4.2M",
    fillRateOpt: "-0.8%",
    bidDensity: "12.4",
    findings: BASELINE_FINDINGS,
    emailOutreach: BASELINE_OUTREACH
  });

  // Action states for workspace headers
  const [shared, setShared] = useState<boolean>(false);
  const [showingHistory, setShowingHistory] = useState<boolean>(false);
  const [historyLogs, setHistoryLogs] = useState<Array<{ time: string; pub: string; score: number }>>([
    { time: "10:14 AM", pub: "Minute Media Mobile", score: 94.2 },
    { time: "09:41 AM", pub: "BuzzFeed News Desktop", score: 81.5 },
    { time: "Yesterday", pub: "Yahoo Editorial RTB", score: 98.9 }
  ]);

  // Core Analysis Trigger (Calls fullstack Express -> Gemini model logic)
  const runBidAnalysis = async (customPub?: string, customJson?: string) => {
    setIsAnalyzing(true);
    const targetPub = customPub !== undefined ? customPub : publisherName;
    const targetJson = customJson !== undefined ? customJson : jsonInput;

    try {
      const response = await fetch("/api/analyze-bid", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          publisherName: targetPub,
          bidRequestJson: targetJson
        })
      });

      if (!response.ok) {
        throw new Error("Auditor server returned an exception model code");
      }

      const result: AnalysisResult = await response.json();
      setAnalysisResult(result);

      // Append active run to audit history logs list
      const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setHistoryLogs((prev) => [
        { time: timeNow, pub: targetPub || "Unnamed Pub", score: result.healthScore },
        ...prev
      ]);

    } catch (err) {
      console.error("Analysis API failed. Defaulting safely to simulated yield data structures.", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Regeneration helper for outreach tab
  const handleRefreshOutreach = async () => {
    setIsRefreshingOutreach(true);
    await runBidAnalysis();
    setIsRefreshingOutreach(false);
  };

  // Injects bid request chosen from Bid Stream log page back to primary space
  const handleInjectBid = (publisher: string, payload: string) => {
    setPublisherName(publisher);
    setJsonInput(payload);
    setActiveTab("workspace");
    // Run direct active analysis cascade
    runBidAnalysis(publisher, payload);
  };

  // Programmatic "Apply Fix" behavior updates the client code editor text immediately!
  const handleApplyFix = (finding: Finding) => {
    if (!finding.actionFix) return;

    // Intelligent update: If standard mapping is requested, we swap or insert
    if (finding.id === "ERR_092") {
      setJsonInput(finding.actionFix);
    } else if (finding.id === "WRN_412") {
      // Inline floor exchange
      let updated = jsonInput;
      if (jsonInput.includes('"bidfloor": 1.50')) {
        updated = jsonInput.replace('"bidfloor": 1.50', '"bidfloor": 1.85');
      } else if (jsonInput.includes('"bidfloor"')) {
        // Generic replace
        updated = jsonInput.replace(/"bidfloor":\s*[0-9.]+/g, '"bidfloor": 1.85');
      } else {
        // Insert custom attribute under imp if matched
        updated = jsonInput.replace(/"video":/g, '"bidfloor": 1.85,\n    "video":');
      }
      setJsonInput(updated);
    } else {
      // General code fallback
      setJsonInput(finding.actionFix);
    }
  };

  const handleShare = () => {
    setShared(true);
    setTimeout(() => setShared(false), 2500);
  };

  return (
    <div className="flex bg-[#f8f9ff] text-slate-850 min-h-screen font-sans antialiased selection:bg-blue-100">
      
      {/* 1. Sidebar Panel (Fixed left position) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        publisherName={publisherName}
        setPublisherName={setPublisherName}
        jsonInput={jsonInput}
        setJsonInput={setJsonInput}
        onRunAnalysis={() => runBidAnalysis()}
        isAnalyzing={isAnalyzing}
      />

      {/* 2. Main content area (scrolled container) */}
      <main className="ml-[320px] flex-grow p-8 lg:p-12 transition-all">
        
        {/* Main Content Header */}
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 select-none border-b border-slate-100 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight capitalize">
                Yield {activeTab === "workspace" ? "Workspace" : activeTab === "insights" ? "Insights Core" : "RTB Bid Streams"}
              </h2>
              {isAnalyzing && (
                <div className="flex items-center gap-1.5 bg-blue-50 text-[#1557ff] text-[9.5px] font-black px-2.5 py-0.5 rounded-full animate-pulse uppercase">
                  <Sparkles className="w-3 h-3 animate-spin" />
                  <span>analyzing model...</span>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 font-semibold mt-1">
              {activeTab === "workspace" 
                ? "Real-time auditing of auction configuration structures, duplicate bids, and missing prebid unit variables." 
                : activeTab === "insights"
                ? "Programmatic CPM supply floors and fill optimization forecasting models."
                : "Real-time ingestion pipeline logs capturing active RTB JSON transaction envelopes."
              }
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Audit History Dropdown Trigger */}
            <div className="relative">
              <button
                id="btn-audit-history"
                onClick={() => setShowingHistory(!showingHistory)}
                className="bg-white border border-slate-100 px-4.5 py-2.5 rounded-xl text-[11px] font-bold flex items-center gap-2 hover:bg-slate-50 hover:border-slate-200 transition-colors cursor-pointer"
              >
                <History className="w-4 h-4 text-slate-400" />
                <span>Audit History</span>
              </button>

              {/* Float view history stack */}
              <AnimatePresence>
                {showingHistory && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-72 bg-white rounded-2xl p-4 shadow-xl border border-slate-100 z-50 text-xs text-slate-700"
                  >
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-50 mb-2">
                      <h4 className="font-bold text-slate-800">Workspace History Runs</h4>
                      <button 
                        onClick={() => setShowingHistory(false)}
                        className="text-gray-400 hover:text-slate-700 text-[10px] uppercase font-mono"
                      >
                        close
                      </button>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {historyLogs.map((log, index) => (
                        <div key={index} className="p-2 bg-slate-50 rounded-lg flex items-center justify-between hover:bg-slate-100 transition-colors">
                          <div>
                            <p className="font-extrabold text-slate-800 truncate max-w-[140px]">{log.pub}</p>
                            <p className="text-[9px] text-slate-400 font-mono mt-0.5">{log.time}</p>
                          </div>
                          <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                            log.score >= 90 ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                          }`}>
                            {log.score}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Share report triggered action */}
            <button
              id="btn-share-report"
              onClick={handleShare}
              className="bg-white border border-slate-100 px-4.5 py-2.5 rounded-xl text-[11px] font-bold flex items-center gap-2 hover:bg-slate-50 hover:border-slate-200 transition-colors cursor-pointer"
            >
              {shared ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span className="text-emerald-600">Copied Link!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-slate-400" />
                  <span>Share Report</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* Tab Routing Container switcher */}
        <div id="workspace-dynamic-tabs" className="min-h-[450px]">
          {activeTab === "workspace" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
              id="workspace-tab-view"
            >
              {/* Core KPI metrics Row */}
              <KPICards
                healthScore={analysisResult.healthScore}
                estimatedUplift={analysisResult.estimatedUplift}
                fillRateOpt={analysisResult.fillRateOpt}
                bidDensity={analysisResult.bidDensity}
              />

              {/* 2-Column Split: Findings & Email tool workspace */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                <div className="xl:col-span-7">
                  <AuditFindings
                    findings={analysisResult.findings}
                    onApplyFix={handleApplyFix}
                  />
                </div>
                <div className="xl:col-span-5 h-full">
                  <OutreachDraft
                    outreach={analysisResult.emailOutreach}
                    publisherName={publisherName}
                    onRefreshDraft={handleRefreshOutreach}
                    isRefreshing={isRefreshingOutreach}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "insights" && (
            <YieldInsights />
          )}

          {activeTab === "stream" && (
            <BidStream onInjectBid={handleInjectBid} />
          )}
        </div>
      </main>
    </div>
  );
}
