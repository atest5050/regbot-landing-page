export interface InspectionQuestion {
  id: string;
  text: string;
  category: string;
  weight: "critical" | "major" | "minor";
}

export interface InspectionRiskItem {
  severity: "critical" | "warning" | "pass";
  area: string;
  issue: string;
  recommendation: string;
}

export interface InspectionReport {
  score: number;
  grade: "A" | "B" | "C" | "D" | "F";
  summary: string;
  readyToPass: boolean;
  risks: InspectionRiskItem[];
  topPriorities: string[];
}
