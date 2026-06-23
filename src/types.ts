export interface Finding {
  id: string;
  severity: "critical" | "warning" | "success";
  title: string;
  description: string;
  actionViewSource?: string;
  actionFix?: string;
}

export interface EmailOutreach {
  to: string;
  subj: string;
  body: string;
}

export interface AnalysisResult {
  healthScore: number;
  estimatedUplift: string;
  fillRateOpt: string;
  bidDensity: string;
  findings: Finding[];
  emailOutreach: EmailOutreach;
}

export interface BidRequestSimulation {
  id: string;
  timestamp: string;
  publisher: string;
  type: "video" | "display" | "native";
  status: "unmapped" | "optimized" | "error" | "healthy";
  payload: any;
}
