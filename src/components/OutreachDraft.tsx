import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Mail, 
  RefreshCw, 
  Copy, 
  Send, 
  Check, 
  CheckCircle2, 
  ExternalLink 
} from "lucide-react";
import { EmailOutreach } from "../types";

interface OutreachDraftProps {
  outreach: EmailOutreach;
  publisherName: string;
  onRefreshDraft: () => void;
  isRefreshing: boolean;
}

export default function OutreachDraft({
  outreach,
  publisherName,
  onRefreshDraft,
  isRefreshing
}: OutreachDraftProps) {
  // Local state to support custom text tuning/editing
  const [editableTo, setEditableTo] = useState(outreach.to);
  const [editableSubj, setEditableSubj] = useState(outreach.subj);
  const [editableBody, setEditableBody] = useState(outreach.body);

  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);

  // Sync edits if outreach object updates from parent
  useEffect(() => {
    setEditableTo(outreach.to);
    // Replace placeholder variables dynamically for presentation
    const parsedSubj = outreach.subj.replace(/\{\{Publisher\}\}/g, publisherName);
    const parsedBody = outreach.body.replace(/\{\{Publisher\}\}/g, publisherName);
    setEditableSubj(parsedSubj);
    setEditableBody(parsedBody);
  }, [outreach, publisherName]);

  const handleCopy = async () => {
    const fullText = `To: ${editableTo}\nSubject: ${editableSubj}\n\n${editableBody}`;
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      // Fallback
    }
  };

  const handleSend = () => {
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div id="outreach-draft-panel" className="bg-white border border-slate-100 rounded-3xl shadow-sm flex flex-col h-full relative overflow-hidden">
      
      {/* Card Header */}
      <div className="p-6 border-b border-slate-50 flex items-center justify-between select-none">
        <div className="flex items-center gap-2.5">
          <Mail className="text-[#1557ff] w-5 h-5" />
          <h3 className="text-base font-bold text-slate-800">Outreach Draft</h3>
        </div>
        <button
          id="btn-refresh-outreach"
          onClick={onRefreshDraft}
          disabled={isRefreshing}
          className="text-slate-400 hover:text-[#1557ff] transition-all cursor-pointer disabled:opacity-50"
          title="Regenerate Outreach"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-blue-600" : ""}`} />
        </button>
      </div>

      {/* Recipient Details & Subject fields */}
      <div className="p-5 border-b border-slate-50 space-y-3 bg-slate-50/20 select-none">
        <div className="flex items-center gap-3 text-xs">
          <span className="font-mono text-gray-400 font-bold w-10 uppercase tracking-wider text-[10px]">To:</span>
          <input
            id="outreach-to-field"
            type="text"
            value={editableTo}
            onChange={(e) => setEditableTo(e.target.value)}
            className="bg-blue-50/75 border border-blue-100/50 text-[#1557ff] font-semibold font-mono text-xs px-2.5 py-1 rounded-lg w-full focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500/20"
          />
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="font-mono text-gray-400 font-bold w-10 uppercase tracking-wider text-[10px]">Subj:</span>
          <input
            id="outreach-subj-field"
            type="text"
            value={editableSubj}
            onChange={(e) => setEditableSubj(e.target.value)}
            className="font-bold text-slate-800 bg-transparent border-0 w-full focus:outline-none focus:ring-1 focus:ring-blue-500/10 focus:bg-slate-50/50 p-1 rounded-md"
          />
        </div>
      </div>

      {/* Email Body Workspace */}
      <div className="p-5 flex-1 flex flex-col leading-relaxed min-h-[350px]">
        <textarea
          id="outreach-body-textarea"
          value={editableBody}
          onChange={(e) => setEditableBody(e.target.value)}
          className="w-full flex-1 text-slate-600 text-xs p-3 bg-slate-50/50 border border-slate-100/50 focus:border-slate-200 rounded-2xl resize-none focus:outline-none focus:bg-white leading-5 transition-all font-sans"
          placeholder="Crafting email draft..."
        />

        {/* Embedded Key Recommendation display card */}
        <div className="mt-4 border border-blue-100/50 bg-blue-50/10 p-4 rounded-xl select-none">
          <p className="text-blue-800 text-xs font-bold italic mb-1">Key Recommendation:</p>
          <p className="text-[11px] text-blue-900/80 leading-normal">
            Addressing unmapped parameters can resolve up to <strong className="text-blue-900 font-extrabold">32% of current auction losses</strong> and reclaim an estimated $12,500 weekly uplift for this channel.
          </p>
        </div>
      </div>

      {/* Footer trigger button action row */}
      <div className="p-5 border-t border-slate-50 flex items-center gap-3 bg-white">
        <button
          id="btn-copy-outreach"
          onClick={handleCopy}
          className="flex-1 bg-white border border-slate-200/80 text-xs font-extrabold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 active:bg-slate-100 text-slate-700 transition-colors cursor-pointer select-none"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-500" />
              <span className="text-emerald-600">Copied Payload!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy Draft</span>
            </>
          )}
        </button>

        <button
          id="btn-send-outreach"
          onClick={handleSend}
          disabled={sent}
          className="flex-1 bg-gradient-to-r from-[#1557ff] to-[#0040e6] text-white text-xs font-extrabold py-3 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/15 hover:shadow-blue-500/35 transition-all duration-300 cursor-pointer disabled:pointer-events-none select-none"
        >
          {sent ? (
            <>
              <Check className="w-4 h-4" />
              <span>Dispatched!</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Send Email</span>
            </>
          )}
        </button>
      </div>

      {/* Dispatch Simulation Success Modal overlay */}
      <AnimatePresence>
        {sent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center select-none z-30"
          >
            <motion.div
              initial={{ scale: 0.85, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 10 }}
              className="bg-white p-6 rounded-2xl max-w-xs shadow-xl flex flex-col items-center"
            >
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-3">
                <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h4 className="text-sm font-black text-slate-800">Email Dispatched!</h4>
              <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                 monetize outreach draft has been queued and successfully transmitted to <strong>{editableTo}</strong>.
              </p>
              <button 
                onClick={() => setSent(false)}
                className="mt-4 bg-[#1557ff] hover:bg-blue-600 text-white text-[10px] font-black uppercase px-4 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                Close View
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
