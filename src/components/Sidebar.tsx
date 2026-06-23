import React, { useRef } from "react";
import { 
  BarChart3, 
  Layers, 
  Terminal, 
  Play, 
  Upload, 
  ChevronRight,
  ShieldAlert
} from "lucide-react";

interface SidebarProps {
  activeTab: "workspace" | "insights" | "stream";
  setActiveTab: (tab: "workspace" | "insights" | "stream") => void;
  publisherName: string;
  setPublisherName: (name: string) => void;
  jsonInput: string;
  setJsonInput: (json: string) => void;
  onRunAnalysis: () => void;
  isAnalyzing: boolean;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  publisherName,
  setPublisherName,
  jsonInput,
  setJsonInput,
  onRunAnalysis,
  isAnalyzing
}: SidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manage JSON editor input changes
  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonInput(e.target.value);
  };

  // Generate numbered lines dynamically
  const linesCount = jsonInput.split("\n").length;
  const lineNumbers = Array.from({ length: Math.max(linesCount, 12) }, (_, i) => i + 1);

  // Handle uploaded JSON file drag & drop or click
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        try {
          // Format it beautifully
          const formatted = JSON.stringify(JSON.parse(text), null, 2);
          setJsonInput(formatted);
        } catch {
          setJsonInput(text);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        try {
          const formatted = JSON.stringify(JSON.parse(text), null, 2);
          setJsonInput(formatted);
        } catch {
          setJsonInput(text);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <aside 
      id="sidebar-container"
      className="w-[320px] bg-white border-r border-[#e8ecf8] p-6 flex flex-col h-screen fixed top-0 left-0 overflow-y-auto select-none"
    >
      {/* Brand Header */}
      <div className="mb-8" id="sidebar-header">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-[#1557ff] rounded-xl flex items-center justify-center text-white font-black shadow-md shadow-blue-500/20">
            <span className="text-xl font-mono">μ</span>
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-[#1557ff]">Minute Media</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Yield Auditor</p>
          </div>
        </div>
        <p className="mt-3 text-xs text-gray-500 leading-relaxed font-normal">
          Analyze OpenRTB bid request structures, uncover hidden integration anomalies, and recover programmatic ad yield deficits.
        </p>
      </div>

      {/* Navigation */}
      <nav className="space-y-1.5 mb-8" id="sidebar-nav">
        <button
          id="nav-workspace-btn"
          onClick={() => setActiveTab("workspace")}
          className={`w-full flex items-center justify-between p-3 text-xs font-bold transition-all duration-200 rounded-xl ${
            activeTab === "workspace"
              ? "bg-blue-50 text-[#1557ff] font-extrabold"
              : "text-gray-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Layers className="w-4 h-4" />
            <span>Workspace</span>
          </div>
          {activeTab === "workspace" && <div className="w-1.5 h-1.5 bg-[#1557ff] rounded-full" />}
        </button>

        <button
          id="nav-insights-btn"
          onClick={() => setActiveTab("insights")}
          className={`w-full flex items-center justify-between p-3 text-xs font-bold transition-all duration-200 rounded-xl ${
            activeTab === "insights"
              ? "bg-blue-50 text-[#1557ff] font-extrabold"
              : "text-gray-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <BarChart3 className="w-4 h-4" />
            <span>Yield Insights</span>
          </div>
          {activeTab === "insights" && <div className="w-1.5 h-1.5 bg-[#1557ff] rounded-full" />}
        </button>

        <button
          id="nav-stream-btn"
          onClick={() => setActiveTab("stream")}
          className={`w-full flex items-center justify-between p-3 text-xs font-bold transition-all duration-200 rounded-xl ${
            activeTab === "stream"
              ? "bg-blue-50 text-[#1557ff] font-extrabold"
              : "text-gray-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Terminal className="w-4 h-4" />
            <span>Bid Stream</span>
          </div>
          {activeTab === "stream" && <div className="w-1.5 h-1.5 bg-[#1557ff] rounded-full" />}
        </button>
      </nav>

      {/* Input Form Fields Card */}
      <div className="flex-1 flex flex-col gap-6" id="sidebar-form-container">
        {/* Publisher Name Input */}
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 font-mono">
            Publisher Name
          </label>
          <input
            id="publisher-name-input"
            type="text"
            value={publisherName}
            onChange={(e) => setPublisherName(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all font-medium"
            placeholder="Enter Publisher Name"
          />
        </div>

        {/* Raw JSON Bid Request Drag & Paste Code Editor */}
        <div className="flex-1 flex flex-col">
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 font-mono flex items-center justify-between">
            <span>Raw JSON Bid Request</span>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="text-[#1557ff] text-[10px] lowercase font-bold flex items-center gap-1 hover:underline hover:opacity-80"
              title="Upload JSON"
            >
              <Upload className="w-2.5 h-2.5" />
              upload file
            </button>
          </label>

          <input 
            type="file" 
            accept=".json,.txt" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
          />

          <div 
            id="code-editor-dropzone"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="relative flex-1 bg-[#0b0f19] border border-slate-800 rounded-xl text-xs overflow-hidden flex group min-h-[180px]"
          >
            {/* Column Line Numbers */}
            <div className="select-none bg-[#070b13] px-2.5 py-4 text-[10px] text-slate-600 font-mono text-center border-r border-[#0e1423] leading-5">
              {lineNumbers.map((num) => (
                <div key={num}>{num}</div>
              ))}
            </div>

            {/* Editable Text Area overlapping/matching same-size text */}
            <textarea
              id="raw-json-textarea"
              value={jsonInput}
              onChange={handleJsonChange}
              spellCheck={false}
              placeholder='// Paste OpenRTB payload here'
              className="flex-1 bg-transparent text-[#94a3b8] p-4 font-mono text-xs resize-none focus:outline-none overflow-y-auto leading-5 focus:text-emerald-400 transition-colors whitespace-pre"
            />

            {/* Upload Hover Overlay */}
            <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 border border-[#1557ff]/40 rounded-xl">
              <Upload className="w-6 h-6 text-[#1557ff] mb-2 animate-bounce" />
              <span className="text-white text-[11px] font-bold">Drag & Drop JSON file or click</span>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 bg-[#1557ff] hover:bg-blue-600 text-white text-[9px] font-black uppercase px-2.5 py-1 rounded"
              >
                Browse Files
              </button>
            </div>
          </div>
        </div>

        {/* Action Button: Run Analysis */}
        <button
          id="run-analysis-btn"
          onClick={onRunAnalysis}
          disabled={isAnalyzing}
          className="w-full text-white font-extrabold text-xs py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 bg-gradient-to-r from-[#1557ff] to-[#0040e6] shadow-md shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-75 disabled:pointer-events-none disabled:transform-none transition-all duration-300 select-none cursor-pointer"
        >
          {isAnalyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Analyzing bid density...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>Run Yield Analysis</span>
            </>
          )}
        </button>
      </div>

      {/* Footer Profile */}
      <div 
        id="profile-footer"
        className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3"
      >
        <img 
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" 
          alt="Alex Rivera" 
          className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm"
        />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-extrabold text-slate-800 truncate leading-none">Alex Rivera</p>
          <p className="text-[10px] text-gray-500 font-medium mt-0.5">Lead Yield Analyst</p>
        </div>
      </div>
    </aside>
  );
}
