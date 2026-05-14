export interface ComplianceFinding {
  severity: "critical" | "warning" | "info" | "pass";
  category: string;
  description: string;
  action?: string;
}

export interface PhotoComplianceResult {
  ok: boolean;
  overallStatus: "compliant" | "issues-found" | "error";
  summary: string;
  findings: ComplianceFinding[];
  error?: string;
}
