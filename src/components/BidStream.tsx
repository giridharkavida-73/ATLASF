import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Play, 
  Square, 
  Terminal, 
  Zap, 
  Copy, 
  Search, 
  Code2, 
  FileCheck2,
  Trash2
} from "lucide-react";
import { BidRequestSimulation } from "../types";

interface BidStreamProps {
  onInjectBid: (publisher: string, payload: string) => void;
}

const PRESET_BIDS: BidRequestSimulation[] = [
  {
    id: "bid_vol_40912",
    timestamp: "LIVE",
    publisher: "Daily Mail Plc",
    type: "video",
    status: "unmapped",
    payload: {
      id: "br_938201",
      device: {
        ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        ip: "192.168.1.1"
      },
      imp: [{
        id: "1",
        video: {
          mimes: ["video/mp4"],
          h: 480,
          w: 640
        }
      }]
    }
  },
  {
    id: "bid_vol_11202",
    timestamp: "LIVE",
    publisher: "BuzzFeed News",
    type: "video",
    status: "error",
    payload: {
      id: "br_001928",
      site: {
        id: "site_bf_99a",
        name: "BuzzFeed News Desktop"
      },
      imp: [{
        id: "v_20a3",
        bidfloor: 1.50,
        video: {
          mimes: ["video/mp4", "video/webm"],
          h: 720,
          w: 1280
        }
      }]
    }
  },
  {
    id: "bid_vol_58112",
    timestamp: "LIVE",
    publisher: "WeGames Pub",
    type: "native",
    status: "healthy",
    payload: {
      id: "br_wg_mobile",
      app: {
        id: "app_wegames_99",
        name: "WeGames",
        bundle: "com.wegames.play"
      },
      imp: [{
        id: "n_1",
        native: {
          request: "{\\n  \\\"assets\\\": [\\n    { \\\"id\\\": 1, \\\"required\\\": 1, \\\"title\\\": { \\\"len\\\": 80 } }\\n  ]\\n}"
        }
      }]
    }
  },
  {
    id: "bid_vol_77192",
    timestamp: "LIVE",
    publisher: "TechCrunch",
    type: "display",
    status: "optimized",
    payload: {
      id: "br_tc_desk",
      site: {
        id: "site_tc_912",
        name: "TechCrunch Editorial"
      },
      imp: [{
        id: "d_1",
        bidfloor: 2.10,
        banner: {
          w: 300,
          h: 250,
          pos: 1
        }
      }]
    }
  }
];

export default function BidStream({ onInjectBid }: BidStreamProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [streamLogs, setStreamLogs] = useState<BidRequestSimulation[]>([]);
  const [selectedBid, setSelectedBid] = useState<BidRequestSimulation | null>(null);

  // Auto populate mock bid logs every few seconds if playing
  useEffect(() => {
    if (!isPlaying) return;

    // Initial logs load
    if (streamLogs.length === 0) {
      setStreamLogs(PRESET_BIDS.map(b => ({
        ...b,
        timestamp: new Date().toLocaleTimeString()
      })));
    }

    const interval = setInterval(() => {
      const randomPreset = PRESET_BIDS[Math.floor(Math.random() * PRESET_BIDS.length)];
      const seedNum = Math.floor(Math.random() * 90000) + 10000;
      const newBid: BidRequestSimulation = {
        ...randomPreset,
        id: `bid_vol_${seedNum}`,
        timestamp: new Date().toLocaleTimeString()
      };

      setStreamLogs((prev) => [newBid, ...prev.slice(0, 19)]); // Keep last 20 logs
    }, 4000);

    return () => clearInterval(interval);
  }, [isPlaying, streamLogs]);

  const handleCopyPayload = (payload: any) => {
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
  };

  const clearLogs = () => {
    setStreamLogs([]);
    setSelectedBid(null);
  };

  return (
    <div id="bid-stream-workspace" className="grid grid-cols-1 lg:grid-cols-12 gap-6 select-none">
      {/* Simulation Feed Panel */}
      <div className="lg:col-span-7 bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col h-[600px]">
        {/* Panel Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-50 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-[#1557ff]" />
            <div>
              <h3 className="text-sm font-bold text-slate-800">Programmatic Bid Request Log</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Capturing live OpenRTB requests over HTTP/WS</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-stream-toggle"
              onClick={() => setIsPlaying(!isPlaying)}
              className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 text-[10px] uppercase font-mono font-bold ${
                isPlaying 
                  ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                  : "bg-[#0b0f19] text-slate-400 border-slate-800"
              }`}
            >
              {isPlaying ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Streaming</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 fill-slate-400 text-slate-400" />
                  <span>Paused</span>
                </>
              )}
            </button>

            <button
              id="btn-clear-logs"
              onClick={clearLogs}
              title="Clear log feed"
              className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:border-red-100 border border-slate-100 bg-white transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* List of Simulated incoming transactions */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-2">
          {streamLogs.map((log) => {
            const isSelected = selectedBid?.id === log.id;
            
            // Layout styling for severities
            let badgeStyle = "bg-slate-50 text-slate-600";
            if (log.status === "unmapped") badgeStyle = "bg-red-50 text-red-600";
            if (log.status === "error") badgeStyle = "bg-amber-50 text-amber-600";
            if (log.status === "healthy") badgeStyle = "bg-emerald-50 text-emerald-600";
            if (log.status === "optimized") badgeStyle = "bg-purple-50 text-purple-600";

            return (
              <div
                id={`bid-log-card-${log.id}`}
                key={log.id}
                onClick={() => setSelectedBid(log)}
                className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between gap-4 transition-all ${
                  isSelected 
                    ? "bg-blue-50/50 border-[#1557ff] shadow-sm transform translate-x-1" 
                    : "bg-white border-slate-100/60 hover:bg-slate-50/50 hover:border-slate-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="font-mono text-[9px] text-gray-400 font-bold block">{log.timestamp}</span>
                    <span className="font-mono text-[9px] text-[#1557ff] font-medium block mt-0.5">{log.id.split("_")[2]}</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800 leading-snug">{log.publisher}</h4>
                    <p className="text-[10px] text-slate-400 font-medium capitalize flex items-center gap-1.5 mt-0.5">
                      <Zap className="w-3 h-3 text-emerald-400" />
                      {log.type} request
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-mono font-bold uppercase py-0.5 px-2 rounded-full ${badgeStyle}`}>
                    {log.status}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onInjectBid(log.publisher, JSON.stringify(log.payload, null, 2));
                    }}
                    className="p-1.5 text-xs font-bold text-[#1557ff] bg-blue-50 hover:bg-[#1557ff] hover:text-white rounded-lg transition-all"
                    title="Load this bid into Yield Workspace"
                  >
                    <Search className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}

          {streamLogs.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400 border border-dashed border-slate-100 rounded-3xl">
              <Code2 className="w-10 h-10 stroke-[1.2] opacity-50 mb-3" />
              <p className="text-xs font-bold text-slate-500">Log feed is empty</p>
              <p className="text-[11px] text-slate-400 max-w-xs mt-1 leading-normal">
                Traffic is currently active. Play stream in the header options to begin listening for OpenRTB bid entries.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Selected Payload Inspector on the right */}
      <div className="lg:col-span-5 flex flex-col h-[600px] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between select-none">
          <div className="flex items-center gap-2.5">
            <Code2 className="w-4 h-4 text-[#1557ff]" />
            <h3 className="text-xs text-slate-200 font-extrabold uppercase tracking-wider font-mono">Payload Inspector</h3>
          </div>
          {selectedBid && (
            <button
              onClick={() => handleCopyPayload(selectedBid.payload)}
              className="text-slate-400 hover:text-white transition-all cursor-pointer p-1 rounded hover:bg-slate-800"
              title="Copy JSON Payload"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex-1 p-5 overflow-y-auto leading-normal">
          {selectedBid ? (
            <div className="space-y-4">
              <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-800 select-none">
                <p className="text-[10px] text-[#1557ff] font-mono font-bold uppercase tracking-wider">Target Domain Channel</p>
                <h4 className="text-sm font-black text-white mt-1">{selectedBid.publisher}</h4>
                <p className="text-[11px] text-slate-400 mt-1">Transaction Identity: <span className="font-mono text-emerald-400">{selectedBid.id}</span></p>
              </div>

              <div className="space-y-1.5">
                <p className="text-[9px] text-slate-500 font-mono font-bold uppercase tracking-widest pl-1">Raw OpenRTB body</p>
                <pre className="text-[11px] font-mono text-emerald-400 bg-slate-950 p-4 border border-slate-800 rounded-xl overflow-x-auto whitespace-pre leading-5">
                  {JSON.stringify(selectedBid.payload, null, 2)}
                </pre>
              </div>

              <button
                id="btn-inspect-workspace"
                onClick={() => onInjectBid(selectedBid.publisher, JSON.stringify(selectedBid.payload, null, 2))}
                className="w-full text-center py-3 px-4 bg-[#1557ff] hover:bg-blue-600 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer select-none"
              >
                <FileCheck2 className="w-4 h-4" />
                <span>Inject to Yield Workspace</span>
              </button>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 p-6 select-none border border-dashed border-slate-800/60 rounded-2xl">
              <Terminal className="w-8 h-8 opacity-40 mb-2 stroke-[1.2]" />
              <p className="text-xs font-bold text-slate-400">No transaction selected</p>
              <p className="text-[11px] text-slate-500 max-w-xs mt-1 leading-normal">
                Click on any programmatic log entry in the feed to inspect header values and export to code sandbox fields.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
