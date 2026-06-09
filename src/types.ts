export enum ResourceType {
  COMPUTE = "Compute VM",
  DATABASE = "Cloud SQL Database",
  STORAGE = "Persistent Storage",
  KUBERNETES = "GKE Cluster",
  CACHING = "Cloud Memorystore",
}

export interface CloudResource {
  id: string;
  name: string;
  type: ResourceType;
  region: string;
  costPerHour: number;
  utilization: number; // 0 to 100
  status: "active" | "idle" | "terminated" | "scaled-down";
  orphaned: boolean; // Storage volume with no owner
  createdDate: string;
  environment: "Production" | "Staging" | "Development";
}

export interface CostDataPoint {
  date: string;
  actualCost: number;
  projectedCost: number;
  budgetCap: number;
}

export interface AnomalyEvent {
  id: string;
  title: string;
  description: string;
  spikePercentage: number;
  wasteAmount: number; // monthly
  category: "env-forgotten" | "runaway-scaling" | "orphaned-storage" | "overprovisioned";
  timestamp: string;
  metricSpike: {
    label: string; // e.g. "Active Instances" or "Daily Read Ops"
    normal: number;
    peak: number;
  };
  resourcesInvolvedCount: number;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  resourceId: string;
  resourceName: string;
  monthlySavings: number;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  actionType: "terminate" | "delete" | "scale-down" | "right-size";
  applied: boolean;
  impactDescription: string;
}

export enum AgentStep {
  MONITORING = "monitoring",
  DETECTION = "detection",
  INVESTIGATION = "investigation",
  ROOT_CAUSE = "root_cause",
  SAVINGS_ANALYSIS = "savings_analysis",
  RECOMMENDATIONS = "recommendations",
  REPORT = "report",
}

export interface AgentLog {
  timestamp: string;
  step: AgentStep;
  message: string;
  status: "info" | "warning" | "success" | "running";
}

export interface InvestigationState {
  currentStep: AgentStep;
  status: "idle" | "investigating" | "completed";
  progress: number; // 0 to 100
  logs: AgentLog[];
  selectedAnomaly: AnomalyEvent | null;
  findings: {
    summary: string;
    rootCauses: string[];
    affectedResources: CloudResource[];
    detailedAnalysisMarkdown?: string;
  } | null;
}
