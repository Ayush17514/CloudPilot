import { CloudResource, ResourceType, AnomalyEvent, Recommendation, CostDataPoint } from "./types";

// Generate clean 14-day cost history
export const getInitialCostTrend = (budget: number): CostDataPoint[] => {
  return [
    { date: "May 26", actualCost: 450, projectedCost: 450, budgetCap: budget / 30 },
    { date: "May 27", actualCost: 460, projectedCost: 460, budgetCap: budget / 30 },
    { date: "May 28", actualCost: 440, projectedCost: 440, budgetCap: budget / 30 },
    { date: "May 29", actualCost: 455, projectedCost: 455, budgetCap: budget / 30 },
    { date: "May 30", actualCost: 470, projectedCost: 470, budgetCap: budget / 30 },
    { date: "May 31", actualCost: 450, projectedCost: 450, budgetCap: budget / 30 },
    { date: "Jun 01", actualCost: 465, projectedCost: 465, budgetCap: budget / 30 },
    { date: "Jun 02", actualCost: 480, projectedCost: 480, budgetCap: budget / 30 },
    { date: "Jun 03", actualCost: 490, projectedCost: 495, budgetCap: budget / 30 },
    { date: "Jun 04", actualCost: 510, projectedCost: 520, budgetCap: budget / 30 },
    { date: "Jun 05", actualCost: 780, projectedCost: 810, budgetCap: budget / 30 }, // Spiked!
    { date: "Jun 06", actualCost: 815, projectedCost: 830, budgetCap: budget / 30 }, 
    { date: "Jun 07", actualCost: 840, projectedCost: 855, budgetCap: budget / 30 },
    { date: "Jun 08 (Today)", actualCost: 850, projectedCost: 860, budgetCap: budget / 30 },
  ];
};

export const sampleResources: CloudResource[] = [
  {
    id: "res-gke-prod-01",
    name: "gke-production-core-cluster",
    type: ResourceType.KUBERNETES,
    region: "us-central1",
    costPerHour: 2.85,
    utilization: 74,
    status: "active",
    orphaned: false,
    createdDate: "2025-01-12",
    environment: "Production"
  },
  {
    id: "res-db-sql-prod",
    name: "prod-customer-db-postgresql",
    type: ResourceType.DATABASE,
    region: "us-central1",
    costPerHour: 1.95,
    utilization: 12, // Needs right-sizing!
    status: "active",
    orphaned: false,
    createdDate: "2025-01-15",
    environment: "Production"
  },
  {
    id: "res-vm-dev-worker",
    name: "dev-feature-nlp-train-04",
    type: ResourceType.COMPUTE,
    region: "us-east4",
    costPerHour: 1.45,
    utilization: 1, // Idle! Forgotten GPU training
    status: "active",
    orphaned: false,
    createdDate: "2026-05-24",
    environment: "Development"
  },
  {
    id: "res-vol-orph-stg",
    name: "stg-backup-volume-temp-nvme",
    type: ResourceType.STORAGE,
    region: "us-east4",
    costPerHour: 0.48, // ~$350/mo
    utilization: 0,
    status: "idle",
    orphaned: true, // Orphaned
    createdDate: "2026-04-10",
    environment: "Staging"
  },
  {
    id: "res-gke-dev-scaling",
    name: "dev-sand-gke-cluster",
    type: ResourceType.KUBERNETES,
    region: "europe-west1",
    costPerHour: 3.20, // Runaway spot node count
    utilization: 3,
    status: "active",
    orphaned: false,
    createdDate: "2026-05-28",
    environment: "Development"
  },
  {
    id: "res-vm-ghost-env-01",
    name: "ghost-stg-app-node-01",
    type: ResourceType.COMPUTE,
    region: "us-central1",
    costPerHour: 0.85,
    utilization: 0,
    status: "active",
    orphaned: false,
    createdDate: "2026-05-15",
    environment: "Staging"
  },
  {
    id: "res-vm-ghost-env-02",
    name: "ghost-stg-app-node-02",
    type: ResourceType.COMPUTE,
    region: "us-central1",
    costPerHour: 0.85,
    utilization: 0,
    status: "active",
    orphaned: false,
    createdDate: "2026-05-15",
    environment: "Staging"
  },
  {
    id: "res-db-ghost-env",
    name: "ghost-stg-reporting-replica",
    type: ResourceType.DATABASE,
    region: "us-central1",
    costPerHour: 1.40,
    utilization: 0.5,
    status: "active",
    orphaned: false,
    createdDate: "2026-05-15",
    environment: "Staging"
  },
  {
    id: "res-cache-redis-prod",
    name: "prod-redis-session-store",
    type: ResourceType.CACHING,
    region: "us-central1",
    costPerHour: 0.35,
    utilization: 62,
    status: "active",
    orphaned: false,
    createdDate: "2025-02-01",
    environment: "Production"
  }
];

export const sampleAnomalies: AnomalyEvent[] = [
  {
    id: "anom-ghost-env",
    title: "Forgotten Staging Integration Environment",
    description: "An entire multi-tiered staging integration stack is running at 0% user utilization. It appears to have been left running after performance testing was completed 3 weeks ago.",
    spikePercentage: 45,
    wasteAmount: 2250,
    category: "env-forgotten",
    timestamp: "2026-06-05T08:14:22Z",
    metricSpike: {
      label: "Involved VMs / Average CPU",
      normal: 2.5, // 2.5% idle
      peak: 2.5, // Still 2.5% but costing 45% more due to scale
    },
    resourcesInvolvedCount: 3
  },
  {
    id: "anom-runaway-scaling",
    title: "GKE Cluster Runaway Node Count Scaling",
    description: "The GKE node pool is scaling up automatically due to horizontal autoscaling thresholds triggered by a memory-leaking nightly development build, but maintaining <3% overall CPU use.",
    spikePercentage: 62,
    wasteAmount: 2304,
    category: "runaway-scaling",
    timestamp: "2026-06-05T12:00:00Z",
    metricSpike: {
      label: "Active Cluster Nodes",
      normal: 3,
      peak: 18,
    },
    resourcesInvolvedCount: 1
  },
  {
    id: "anom-orphaned-storage",
    title: "Orphaned High-Perf NVMe Storage Disks",
    description: "High-performance SSD storage volumes are detached and left in 'active' status waiting for VM reconnection that never occurs, resulting in wasted high-tier storage billing.",
    spikePercentage: 18,
    wasteAmount: 345,
    category: "orphaned-storage",
    timestamp: "2026-06-05T15:45:00Z",
    metricSpike: {
      label: "Detached Unused Storage (TB)",
      normal: 0.1,
      peak: 2.8,
    },
    resourcesInvolvedCount: 1
  },
  {
    id: "anom-overprovisioned",
    title: "Over-provisioned Production Postgres Database",
    description: "The core master PostgreSQL database instance is configured to support high-mem extreme enterprise operations (16 CPU, 64GB RAM), but is operating at a flat 4% query loads and 1% CPU utilization.",
    spikePercentage: 25,
    wasteAmount: 1400,
    category: "overprovisioned",
    timestamp: "2026-06-06T00:30:00Z",
    metricSpike: {
      label: "Memory & CPU Utilization (%)",
      normal: 80,
      peak: 4, // Shows waste!
    },
    resourcesInvolvedCount: 1
  }
];

export const sampleRecommendations: Recommendation[] = [
  {
    id: "rec-ghost-env-vm-01",
    title: "Terminate redundant ghost-stg-app-node-01 and 02",
    description: "Identify and clean up staging endpoints left over from previous migration and testing.",
    resourceId: "res-vm-ghost-env-01",
    resourceName: "ghost-stg-app-node-01 & 02",
    monthlySavings: 1224,
    priority: "CRITICAL",
    actionType: "terminate",
    applied: false,
    impactDescription: "Will terminate 2 compute instances. Staged data is verified as replicated."
  },
  {
    id: "rec-ghost-env-db",
    title: "Decommission ghost-stg-reporting-replica",
    description: "Securely backup and decommission staging replication SQL instances that have no write activity and zero query reads since June 1st.",
    resourceId: "res-db-ghost-env",
    resourceName: "ghost-stg-reporting-replica",
    monthlySavings: 1008,
    priority: "CRITICAL",
    actionType: "terminate",
    applied: false,
    impactDescription: "Terminates the Cloud SQL database snapshot. Standard automated weekly export completes first."
  },
  {
    id: "rec-db-rightsize",
    title: "Right-Size prod-customer-db-postgresql",
    description: "Right-size postgres cluster from db-n1-standard-16 (16 cores, 60GB RAM) to db-n1-standard-4 (4 cores, 15GB RAM). Peak memory use was clocked at 11.2GB during heaviest batch integrations.",
    resourceId: "res-db-sql-prod",
    resourceName: "prod-customer-db-postgresql",
    monthlySavings: 1215,
    priority: "HIGH",
    actionType: "right-size",
    applied: false,
    impactDescription: "Changes instance machine type. Database will failover to standby replica causing a brief 3-second read-only period."
  },
  {
    id: "rec-orphaned-delete",
    title: "Permanently Delete detached stg-backup-volume-temp-nvme",
    description: "Purge unattached high-performance NVMe block storage space with zero read/write ops for 21 consecutive days.",
    resourceId: "res-vol-orph-stg",
    resourceName: "stg-backup-volume-temp-nvme",
    monthlySavings: 345,
    priority: "MEDIUM",
    actionType: "delete",
    applied: false,
    impactDescription: "Permanently purges storage. Will create a final cost-optimized cold storage bucket backup ($3/mo) prior to erasure."
  },
  {
    id: "rec-gke-autoscale-fix",
    title: "Configure Dev GKE cluster with Max Node Limits & Autoscale Cool-down",
    description: "Restrict Europe clusters autoscale boundaries from 20 max nodes to 4 max nodes and increase scaling cool-down cooldown duration to patch memory leaking test iterations.",
    resourceId: "res-gke-dev-scaling",
    resourceName: "dev-sand-gke-cluster",
    monthlySavings: 2160,
    priority: "HIGH",
    actionType: "scale-down",
    applied: false,
    impactDescription: "Reduces Kubernetes compute pool and avoids costly GKE scaling loop. GKE will queue non-urgent batch runs safely."
  }
];

export interface HardcodedAIResponse {
  summary: string;
  rootCauses: string[];
  markdown: string;
}

export const getFallbackAIResult = (category: string): HardcodedAIResponse => {
  switch (category) {
    case "env-forgotten":
      return {
        summary: "CloudPilot discovered a classic 'unattended environment sprawl' signature. Staging services were spun up on May 15 for a performance testing cycle but never cleaned up, burning through $2,250 of monthly budget while running entirely at 0% user throughput.",
        rootCauses: [
          "Multi-node architecture left fully operational containing staging app hosts and databases.",
          "Testing pipeline completed on May 21st but omitted the tear-down staging script in CI/CD block.",
          "Billing records show $75.00 a day wasted since benchmark execution concluded."
        ],
        markdown: `### CloudPilot FinOps Deep-Dive Investigation
**Status: Complete** | **Confidence: 99.4%**

#### 🛰️ Resource Mapping
I scanned all US regions looking for compute nodes containing standard dev or staging labels. I detected a high concentration of active assets in **us-central1** prefixed with \`ghost-stg-\`.

#### 🔍 Zero-Utilization Evidence
* Compute VMs (\`ghost-stg-app-node-01\` & \`ghost-stg-app-node-02\`) show a flat **0.12% CPU utilization** over 14 consecutive days.
* Network ingress traffic shows 0 packets from general public IPs, with only health-check pings registered.
* Staging database (\`ghost-stg-reporting-replica\`) has **zero active customer sessions**.

#### 💡 CloudPilot Recommendations
1. **Automated Teardown**: Shutdown both VMs immediately.
2. **Database Snapshot**: Initiate final database export to Standard GCS Bucket ($3/month storage footprint) and drop the expensive replica node.
3. **Savings Potential**: **$2,232.00 / month saved** immediately after approval.`
      };

    case "runaway-scaling":
      return {
        summary: "CloudPilot AI traced GKE runaway scaling to a memory leak in a newly deployed staging container. Standard metrics showed CPU at <3%, but Kubernetes horizontal autoscalers (HPA) mistook memory exhaustion for system traffic, scaling from 3 to 18 active VM worker nodes.",
        rootCauses: [
          "Kubernetes horizontal pod autoscaler (HPA) configured on memory metrics rather than target CPU thresholds.",
          "Memory leak in NodeJS base microservice version v2.4a causing pod containers to consume up to 98% memory cache.",
          "Underlying node pools scaled up to provision the requests, keeping 12 core-heavy compute engines running dry."
        ],
        markdown: `### CloudPilot FinOps Deep-Dive Investigation
**Status: Complete** | **Confidence: 97.11%**

#### 🎡 Cluster Diagnostics
A GKE horizontal pod autoscaler event is scaling the underlying Node Pool in \`europe-west1\` to limits.

#### 📉 The Paradox
* **Total Resource Footprint**: 18 Active VMs.
* **Aggregated CPU Load**: Only **2.4% CPU average**.
* **Reasoning**: The application processes are stuck in infinite memory allocation loops (heap exhaustion). Individual container nodes require restarts, but instead, GKE continues to spin up *new physical VMs* to host redundant pods.

#### 💡 CloudPilot Recommendations
1. **Override Autoscaler**: Enforce a conservative node ceiling on Kubernetes cluster pool (\`max-nodes = 4\`).
2. **Redeploy Node Service**: Force crash pod loops and redeploy container build v2.4b fixing heap leaks.
3. **Expected Savings**: **$2,160.00 / month saved** with zero performance degradation.`
      };

    case "orphaned-storage":
      return {
        summary: "CloudPilot detected 3 high-performance SSD volumes measuring 2.8 Terabytes that are fully unattached to any virtual machine. These volumes are billed at top rates despite having 0 Input/Output operations for the last 21 days.",
        rootCauses: [
          "VM instances were deleted via script, but the 'delete disk on termination' variable was falsified.",
          "Unattached block volumes left in 'Available' state with no parent compute infrastructure.",
          "No current system tracks orphaned EBS or Local SSD volumes, draining $345/mo in storage costs."
        ],
        markdown: `### CloudPilot FinOps Deep-Dive Investigation
**Status: Complete** | **Confidence: 100%**

#### 💾 Volume Auditing
I cross-referenced all persistent SSD block units against dynamic mapping tables on our instances:
* Found volume \`stg-backup-volume-temp-nvme\` (2.8 TB SSD).
* **Attachment State**: detached.
* **Last Read/Write IOps**: May 17th, 2026.

#### ⚖️ FinOps Assessment
High-temperature SSD block storage isbilled by capacity *regardless of attachment or write activity*. Deleting or switching to cold archival storage is 100% efficient waste control.

#### 💡 CloudPilot Recommendations
1. **Cold Archive**: Export contents to GCS Coldline class (reducing disk fee by 92%).
2. **Purge Disk**: Purge the prime volume from the console immediately.
3. **Expected Savings**: **$345.00 / month saved** instantly.`
      };

    case "overprovisioned":
      default:
      return {
        summary: "CloudPilot discovered standard production database waste. Core postgres DB replica instance represents an enterprise-grade db-n1-standard-16 profile. However, query requests have averaged less than 1.4 queries per-second, with maximum CPU utilization peaking at 4%.",
        rootCauses: [
          "Database originally sized based on initial load migrations containing historical warehouse files.",
          "Daily production activity relies on read caching pools, bypassing core database layers for queries.",
          "Running db-n1-standard-16 costs $1,400 more than a healthy scaled db-n1-standard-4 node."
        ],
        markdown: `### CloudPilot FinOps Deep-Dive Investigation
**Status: Complete** | **Confidence: 95.8%**

#### 📊 Database CPU/Memory Mapping
* **Current Type**: db-n1-standard-16 (16 vCPU, 60GB Memory).
* **Historical Peak Memory**: 11.2GB.
* **Historical Peak CPU Usage**: 4% (Including monthly batch operations).

#### 🛠️ Right-Sizing Metric Verdict
Active connections are steady at 4. The memory and computation profile is highly underutilized. Downsizing this node to db-n1-standard-4 retains 15GB RAM (leaving a safe 30% overhead) while lowering active spend by 75%.

#### 💡 CloudPilot Recommendations
1. **Instance Resizing**: Schedule standard maintenance trigger to re-scale the SQL database.
2. **Backup Optimizations**: Downshift snapshot frequency from hourly to daily.
3. **Expected Savings**: **$1,215.00 / month saved** with solid uptime preserved.`
      };
  }
};
