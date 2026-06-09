import React, { useRef } from "react";
import { CloudResource, Recommendation } from "../types";
import { Printer, Download, Landmark, FileText, BadgeCheck, TrendingDown, FileSpreadsheet, FileJson } from "lucide-react";
import { motion } from "motion/react";
import { jsPDF } from "jspdf";

interface ExecutiveReportWidgetProps {
  id: string;
  budget: number;
  resources: CloudResource[];
  recommendations: Recommendation[];
}

export const ExecutiveReportWidget: React.FC<ExecutiveReportWidgetProps> = ({
  id,
  budget,
  resources,
  recommendations,
}) => {
  const reportRef = useRef<HTMLDivElement>(null);

  // Math helper metrics
  const activeResources = resources.filter((r) => r.status !== "terminated");
  const actualMonthlySpend = activeResources.reduce((acc, r) => acc + r.costPerHour * 24 * 30, 0);
  const totalPotentialSavings = recommendations.reduce((acc, r) => acc + (r.applied ? 0 : r.monthlySavings), 0);
  const totalAppliedSavings = recommendations.reduce((acc, r) => acc + (r.applied ? r.monthlySavings : 0), 0);
  const projectedFutureSpend = actualMonthlySpend;

  const handlePrint = () => {
    const printContent = reportRef.current?.innerHTML;
    const originalContent = document.body.innerHTML;

    if (printContent) {
      // Open clean system print layout safely
      const win = window.open("", "_blank");
      if (win) {
        win.document.write(`
          <html>
            <head>
              <title>CloudPilot FinOps Executive Report</title>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1e293b; padding: 40px; }
                h1 { font-size: 24px; font-weight: bold; margin-bottom: 5px; color: #0f172a; }
                header { border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; }
                .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
                .card { border: 1px solid #e1e8ed; padding: 15px; rounded: 8px; background: #fafbfd; }
                .card-title { font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 600; }
                .card-value { font-size: 20px; font-weight: bold; margin-top: 5px; color: #0f172a; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; margin-bottom: 30px; }
                th { text-align: left; padding: 10px; background-color: #f1f5f9; border-bottom: 2px solid #cbd5e1; font-weight: bold; font-size: 12px; }
                td { padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; }
                .badge { padding: 3px 8px; border-radius: 9999px; font-size: 10px; font-weight: bold; }
                .badge-applied { background-color: #d1fae5; color: #065f46; }
                .badge-pending { background-color: #fef3c7; color: #92400e; }
                .footer { display: flex; justify-content: space-between; font-size: 10px; margin-top: 50px; border-top: 1px solid #e2e8f0; padding-top: 20px; color: #94a3b8; }
              </style>
            </head>
            <body>
              ${printContent}
            </body>
          </html>
        `);
        win.document.close();
        win.print();
      }
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");
    let y = 20;

    const checkPageReady = (neededHeight: number) => {
      if (y + neededHeight > 275) {
        doc.addPage();
        y = 20;
        // Draw basic header on new page
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text("CLOUDPILOT AI — EXECUTIVE FINOPS AUDIT REPORT", 15, 10);
        doc.setDrawColor(226, 232, 240); // #e2e8f0
        doc.setLineWidth(0.2);
        doc.line(15, 12, 195, 12);
        y = 20;
      }
    };

    // --- Header Block ---
    // Deep blue background box for branding accent
    doc.setFillColor(67, 56, 202); // indigo-700
    doc.roundedRect(15, y, 10, 10, 2, 2, "F");
    
    // Draw "CP" letters in the box
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.text("CP", 18.5, y + 6.5);

    // BRAND TITLE
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(67, 56, 202); // indigo-700
    doc.text("CLOUDPILOT AI", 28, y + 6);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text("AUTONOMOUS FINOPS AUDIT REGISTRY", 28, y + 9.5);

    // Metadata Right-side block
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text("REPORT UNIQ: CPAI-2026-62184", 195, y + 3, { align: "right" });
    doc.text("GENERATED: 2026-06-08 18:44 UTC", 195, y + 6.5, { align: "right" });
    doc.text("TARGET ENTITY: ORGANIZATIONAL MASTER", 195, y + 10, { align: "right" });

    y += 18;

    // Segment divider
    doc.setDrawColor(241, 245, 249); // slate-100
    doc.setLineWidth(0.5);
    doc.line(15, y, 195, y);

    y += 8;

    // --- Section Header: Overview ---
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text("FINANCIAL WASTE ANALYSIS & AUDIT OVERVIEW", 18, y);
    
    // Left Accent bar
    doc.setDrawColor(67, 56, 202); // indigo-700
    doc.setLineWidth(1);
    doc.line(15, y - 3, 15, y + 1.5);

    y += 6;

    // Overview Statement Paragraph text wrapped
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105); // slate-600
    const overviewLines = doc.splitTextToSize(
      "This executive statement provides a consolidated diagnostic map of active multi-cloud accounts and services. The audits focus on measuring structural idle ratios, rightsizing capabilities, and identifying orphaned units within our environments. All cost savings recommendations are formulated to maintain peak end-user service agreements while removing systemic waste.",
      180
    );
    doc.text(overviewLines, 15, y);
    
    y += (overviewLines.length * 4) + 6;

    // --- Metrics Grid (4 columns) ---
    // Calculate metric cards width and bounding geometry
    const cardWidth = 42;
    const cardHeight = 22;
    const cardGap = 4;
    const cardXStart = 15;

    // Card 1: CURRENT RUN RATE
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.2);
    
    // Card 1
    doc.roundedRect(cardXStart, y, cardWidth, cardHeight, 1.5, 1.5, "FD");
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text("CURRENT RUN RATE", cardXStart + 4, y + 5);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(`$${actualMonthlySpend.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo`, cardXStart + 4, y + 12);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text("Active inventory spend", cardXStart + 4, y + 17);

    // Card 2: BUDGET BOUNDARY
    const x2 = cardXStart + cardWidth + cardGap;
    doc.roundedRect(x2, y, cardWidth, cardHeight, 1.5, 1.5, "FD");
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text("BUDGET BOUNDARY", x2 + 4, y + 5);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text(`$${budget.toLocaleString()}/mo`, x2 + 4, y + 12);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text("Monthly ceiling limit", x2 + 4, y + 17);

    // Card 3: POTENTIAL SAVINGS
    const x3 = x2 + cardWidth + cardGap;
    doc.roundedRect(x3, y, cardWidth, cardHeight, 1.5, 1.5, "FD");
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text("POTENTIAL SAVINGS", x3 + 4, y + 5);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(16, 185, 129); // emerald-500
    doc.text(`$${totalPotentialSavings.toLocaleString()}/mo`, x3 + 4, y + 12);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(16, 185, 129);
    doc.text("Pending actions", x3 + 4, y + 17);

    // Card 4: DEDUCTED SAVINGS
    const x4 = x3 + cardWidth + cardGap;
    doc.roundedRect(x4, y, cardWidth, cardHeight, 1.5, 1.5, "FD");
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text("DEDUCTED SAVINGS", x4 + 4, y + 5);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(79, 70, 229); // indigo-600
    doc.text(`$${totalAppliedSavings.toLocaleString()}/mo`, x4 + 4, y + 12);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(79, 70, 229);
    doc.text("Realized optimization", x4 + 4, y + 17);

    y += cardHeight + 10;

    // --- Section A: Active Inventory Table ---
    checkPageReady(30);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text("A. ACTIVE CLOUD COMPONENT INVENTORY", 15, y);
    y += 4;

    // Draw Table Header
    doc.setFillColor(248, 250, 252); // slate-50
    doc.rect(15, y, 180, 7, "F");
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139); // slate-500

    doc.text("RESOURCE ID", 17, y + 5);
    doc.text("SERVICE CLASS", 67, y + 5);
    doc.text("REGION", 92, y + 5);
    doc.text("ENVIRONMENT", 117, y + 5);
    doc.text("HEALTH STATUS", 142, y + 5);
    doc.text("MONTHLY EXP.", 193, y + 5, { align: "right" });

    // Table divider line
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.4);
    doc.line(15, y + 7, 195, y + 7);
    
    y += 7;

    // Resource rows
    resources.forEach((res) => {
      checkPageReady(10);
      const rowVal = res.status === "terminated" ? 0 : res.costPerHour * 24 * 30;

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(30, 41, 59); // slate-800

      // Column 1: Resource ID
      doc.setFont("Helvetica", "bold");
      doc.text(res.name, 17, y + 5.5);

      // Column 2: Service Type
      doc.setFont("Helvetica", "normal");
      doc.text(res.type, 67, y + 5.5);

      // Column 3: Region
      doc.text(res.region, 92, y + 5.5);

      // Column 4: Environment
      doc.text(res.environment, 117, y + 5.5);

      // Column 5: Health
      if (res.status === "terminated") {
        doc.setTextColor(148, 163, 184);
        doc.text("Terminated", 142, y + 5.5);
        doc.setTextColor(30, 41, 59);
      } else {
        doc.text(`${res.utilization}% CPU`, 142, y + 5.5);
      }

      // Column 6: Monthly Exp
      doc.setFont("Helvetica", "bold");
      doc.text(`$${rowVal.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, 193, y + 5.5, { align: "right" });

      // Minor divider
      doc.setDrawColor(241, 245, 249); // slate-100
      doc.setLineWidth(0.2);
      doc.line(15, y + 8, 195, y + 8);

      y += 8;
    });

    y += 6;

    // --- Section B: Optimization Ledger Table ---
    checkPageReady(30);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text("B. RECIPE CONSOLIDATION LEDGER", 15, y);
    y += 4;

    // Draw Table Header
    doc.setFillColor(248, 250, 252); // slate-50
    doc.rect(15, y, 180, 7, "F");
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139); // slate-500

    doc.text("OPTIMIZATION OPPORTUNITY", 17, y + 5);
    doc.text("TARGET HOST", 82, y + 5);
    doc.text("PRIORITY", 117, y + 5);
    doc.text("AUDIT STATUS", 142, y + 5);
    doc.text("EST. MONTHLY SAVED", 193, y + 5, { align: "right" });

    // Table divider line
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.4);
    doc.line(15, y + 7, 195, y + 7);
    
    y += 7;

    // Recommendation rows
    recommendations.forEach((rec) => {
      checkPageReady(10);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(30, 41, 59); // slate-800

      // Column 1: Opportunity
      doc.setFont("Helvetica", "bold");
      doc.text(rec.title, 17, y + 5.5);

      // Column 2: Target Host
      doc.setFont("Helvetica", "normal");
      doc.text(rec.resourceName, 82, y + 5.5);

      // Column 3: Priority
      if (rec.priority === "CRITICAL") {
        doc.setTextColor(244, 63, 94); // rose-500
        doc.setFont("Helvetica", "bold");
      }
      doc.text(rec.priority, 117, y + 5.5);
      doc.setTextColor(30, 41, 59);
      doc.setFont("Helvetica", "normal");

      // Column 4: Audit Status
      if (rec.applied) {
        doc.setTextColor(16, 185, 129); // emerald-500
        doc.setFont("Helvetica", "bold");
        doc.text("Applied", 142, y + 5.5);
      } else {
        doc.setTextColor(245, 158, 11); // amber-500
        doc.text("Pending Approval", 142, y + 5.5);
      }
      doc.setTextColor(30, 41, 59);
      doc.setFont("Helvetica", "normal");

      // Column 5: Est savings
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(16, 185, 129); // emerald-500
      doc.text(`+$${rec.monthlySavings.toLocaleString()}/mo`, 193, y + 5.5, { align: "right" });

      // Minor divider
      doc.setDrawColor(241, 245, 249); // slate-100
      doc.setLineWidth(0.2);
      doc.line(15, y + 8, 195, y + 8);

      y += 8;
    });

    y += 8;

    // --- Section C: Sign-off Stamp Block ---
    checkPageReady(28);
    doc.setDrawColor(241, 245, 249); // slate-100
    doc.setLineWidth(0.5);
    doc.line(15, y, 195, y);

    y += 6;

    // Security Trust icon place block
    doc.setFillColor(239, 246, 255); // blue-50
    doc.setDrawColor(219, 234, 254); // blue-100
    doc.roundedRect(15, y, 10, 10, 1.5, 1.5, "FD");

    // Draw check sig symbol
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(37, 99, 235); // blue-600
    doc.text("S", 19, y + 7);

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(67, 56, 202); // indigo-700
    doc.text("SECURITY TRUST SIGNATURE", 29, y + 4);
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text("CloudPilot Autonomic Cost-Containment Protocol Verified", 29, y + 8);

    // Signature stamp lines on the right
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text("AUTHENTICATION OFFICER", 195, y + 3, { align: "right" });

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(67, 56, 202); // indigo-700
    doc.text("CloudPilot AI CFO", 195, y + 7, { align: "right" });

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text("AUTONOMIC DIGITAL SECURE KEY [STAMP v2.1]", 195, y + 10.5, { align: "right" });

    // Download PDF document trigger
    doc.save("CloudPilot_FinOps_Executive_Report.pdf");
  };

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add header metadata
    csvContent += "CLOUDPILOT AI — EXECUTIVE FINOPS AUDIT REPORT\r\n";
    csvContent += `Report Unique ID,CPAI-2026-62184\r\n`;
    csvContent += `Generated At,2026-06-08 18:44 UTC\r\n`;
    csvContent += `Target Entity,Organizational Master Account\r\n`;
    csvContent += `Monthly Budget ceiling,$${budget}\r\n`;
    csvContent += `Current Actual Run Rate Spend,$${actualMonthlySpend.toFixed(2)}/mo\r\n`;
    csvContent += `Potential Monthly Savings Available,$${totalPotentialSavings.toFixed(2)}/mo\r\n`;
    csvContent += `Realized Monthly Savings Applied,$${totalAppliedSavings.toFixed(2)}/mo\r\n\r\n`;
    
    // Section A headers & details
    csvContent += "SECTION A: ACTIVE CLOUD COMPONENT INVENTORY\r\n";
    csvContent += "Resource ID,Service Class,Region,Environment,Health Status / CPU,Monthly Spend\r\n";
    resources.forEach((res) => {
      const rowVal = res.status === "terminated" ? 0 : res.costPerHour * 24 * 30;
      const health = res.status === "terminated" ? "Terminated" : `${res.utilization}% CPU`;
      csvContent += `"${res.name}","${res.type}","${res.region}","${res.environment}","${health}",$${rowVal.toFixed(2)}\r\n`;
    });
    
    csvContent += "\r\n";
    
    // Section B headers & details
    csvContent += "SECTION B: RECIPE CONSOLIDATION LEDGER\r\n";
    csvContent += "Optimization Opportunity,Target Host,Priority,Audit Status,Est. Monthly Savings Saved\r\n";
    recommendations.forEach((rec) => {
      const status = rec.applied ? "Applied" : "Pending Approval";
      csvContent += `"${rec.title}","${rec.resourceName}","${rec.priority}","${status}",$${rec.monthlySavings.toFixed(2)}/mo\r\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `CloudPilot_FinOps_Audit_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const reportData = {
      reportId: "CPAI-2026-62184",
      generatedAt: "2026-06-08 18:44 UTC",
      targetEntity: "Organizational Master Account",
      summaryMetrics: {
        budget,
        actualMonthlySpend,
        totalPotentialSavings,
        totalAppliedSavings,
      },
      resources: resources.map(res => ({
        id: res.id,
        name: res.name,
        type: res.type,
        region: res.region,
        environment: res.environment,
        status: res.status,
        utilization: res.utilization,
        costPerHour: res.costPerHour,
        monthlyCost: res.status === "terminated" ? 0 : res.costPerHour * 24 * 30
      })),
      recommendations: recommendations.map(rec => ({
        id: rec.id,
        title: rec.title,
        description: rec.description,
        resourceId: rec.resourceId,
        resourceName: rec.resourceName,
        priority: rec.priority,
        applied: rec.applied,
        monthlySavings: rec.monthlySavings,
        actionType: rec.actionType
      }))
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", `CloudPilot_FinOps_Data_Export_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id={id} className="flex flex-col gap-5">
      {/* Visual Report Actions Bar */}
      <div className="bg-slate-950/55 backdrop-blur-md border border-slate-900 rounded-xl p-5 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.4)] shadow-slate-950/50 shrink-0 relative overflow-hidden group">
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent" />
        <div>
          <h4 className="text-[10px] font-mono text-cyan-400 tracking-wider uppercase font-semibold">Ledger Generators</h4>
          <h3 className="text-sm font-black font-display text-white mt-0.5 tracking-tight flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            Executive FinOps Balance Generation Engine
          </h3>
        </div>

        <div className="flex flex-wrap gap-2.5 w-full sm:w-auto">
          <button
            id="btn-print-report"
            onClick={handlePrint}
            className="flex-1 sm:flex-none border border-slate-700 bg-slate-950 hover:bg-slate-900 text-slate-200 hover:text-white px-4 py-2 rounded text-xs font-bold font-sans transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            Print Report
          </button>
          
          <button
            id="btn-export-csv"
            onClick={handleExportCSV}
            className="flex-1 sm:flex-none border border-emerald-850 bg-emerald-950/30 hover:bg-emerald-900/30 text-emerald-400 hover:text-emerald-300 px-4 py-2 rounded text-xs font-bold font-sans transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Export CSV
          </button>

          <button
            id="btn-export-json"
            onClick={handleExportJSON}
            className="flex-1 sm:flex-none border border-cyan-850 bg-cyan-950/30 hover:bg-cyan-900/30 text-cyan-400 hover:text-cyan-300 px-4 py-2 rounded text-xs font-bold font-sans transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <FileJson className="w-3.5 h-3.5" />
            Export JSON
          </button>

          <button
            id="btn-download-pdf"
            onClick={handleDownloadPDF}
            className="flex-1 sm:flex-none bg-indigo-600 border border-indigo-500 hover:bg-indigo-500 text-white px-4 py-2 rounded text-xs font-bold font-sans transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/15"
          >
            <Download className="w-3.5 h-3.5" />
            Download PDF
          </button>
        </div>
      </div>

      {/* C-Suite Printable Document Frame */}
      <div
        ref={reportRef}
        className="bg-white text-slate-800 border border-slate-300 rounded-xl p-8 sm:p-12 shadow-2xl relative select-all"
        style={{ contentVisibility: "auto" }}
      >
        {/* Subtle Watermark Stamp */}
        <div className="absolute top-10 right-10 opacity-[0.03] pointer-events-none select-none">
          <Landmark className="w-96 h-96" />
        </div>

        {/* Brand Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b-2 border-slate-100 pb-8 mb-8 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-indigo-700 font-black tracking-tighter text-xl">
              <span className="p-1.5 bg-indigo-700 text-white rounded">CP</span>
              <span>CLOUDPILOT AI</span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-mono uppercase tracking-widest">Autonomous FinOps Audit Registry</p>
          </div>

          <div className="md:text-right text-xs text-slate-500 font-mono space-y-0.5">
            <p>REPORT UNIQ: <strong className="text-slate-800">CPAI-2026-62184</strong></p>
            <p>GENERATED: <strong>2026-06-08 18:44 UTC</strong></p>
            <p>TARGET ENTITY: <strong>Organizational Master Account</strong></p>
          </div>
        </div>

        {/* Overview Statement */}
        <div className="mb-8 relative z-10">
          <h2 className="text-lg font-bold text-slate-900 border-l-4 border-indigo-700 pl-3">FINANCIAL WASTE ANALYSIS & AUDIT OVERVIEW</h2>
          <p className="text-xs text-slate-600 mt-3.5 leading-relaxed">
            This executive statement provides a consolidated diagnostic map of active multi-cloud accounts and services. 
            The audits focus on measuring structural idle ratios, rightsizing capabilities, and identifying orphaned units within our environments. 
            All cost savings recommendations are formulated to maintain peak end-user service agreements while removing systemic waste.
          </p>
        </div>

        {/* 4 Block C-Suite Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 relative z-10">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">CURRENT RUN RATE</span>
            <span className="text-lg font-black text-slate-900 font-mono mt-1 block">
              ${actualMonthlySpend.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 block leading-none">Measured from active inventory</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">BUDGET BOUNDARY</span>
            <span className="text-lg font-black text-slate-900 font-mono mt-1 block">
              ${budget.toLocaleString()}/mo
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 block leading-none">Target threshold limit</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">POTENTIAL SAVINGS</span>
            <span className="text-lg font-black text-emerald-600 font-mono mt-1 block">
              ${totalPotentialSavings.toLocaleString()}/mo
            </span>
            <span className="text-[10px] text-emerald-700/80 mt-0.5 block font-semibold leading-none flex items-center gap-0.5">
              <TrendingDown className="w-3 h-3" />
              Not yet applied
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">DEDUCTED SAVINGS</span>
            <span className="text-lg font-black text-indigo-700 font-mono mt-1 block">
              ${totalAppliedSavings.toLocaleString()}/mo
            </span>
            <span className="text-[10px] text-indigo-700 mt-0.5 block font-semibold leading-none flex items-center gap-0.5">
              ✓ Applied to accounts
            </span>
          </div>
        </div>

        {/* Detailed Cost Breakdown Table */}
        <div className="mb-8 relative z-10">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3 pl-1">A. ACTIVE CLOUD COMPONENT INVENTORY</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border-slate-200">
              <thead>
                <tr className="border-b-2 border-slate-100 bg-slate-50 text-slate-500 font-mono text-[10px] leading-tight select-none">
                  <th className="py-2.5 px-3">RESOURCE ID</th>
                  <th className="py-2.5 px-3">SERVICE CLASS</th>
                  <th className="py-2.5 px-3">REGION</th>
                  <th className="py-2.5 px-3">ENVIRONMENT</th>
                  <th className="py-2.5 px-3">HEALTH RATIO</th>
                  <th className="py-2.5 px-3 text-right">MONTHLY EXPENDITURE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {resources.map((res) => {
                  const monthlyVal = res.status === "terminated" ? 0 : res.costPerHour * 24 * 30;
                  return (
                    <tr key={res.id} className="text-xs text-slate-700 hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900 select-all">{res.name}</td>
                      <td className="py-2.5 px-3">{res.type}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px]">{res.region}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${
                          res.environment === "Production" ? "bg-rose-50 text-rose-700" : "bg-blue-50 text-blue-700"
                        }`}>
                          {res.environment}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        {res.status === "terminated" ? (
                          <span className="text-slate-400 font-mono">Terminated</span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                            <span>{res.utilization}% CPU</span>
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-950">
                        ${monthlyVal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Savings Opportunities Recommendations Table */}
        <div className="mb-8 relative z-10">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3 pl-1">B. RECIPE CONSOLIDATION LEDGER</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border-slate-200">
              <thead>
                <tr className="border-b-2 border-slate-100 bg-slate-50 text-slate-500 font-mono text-[10px] leading-tight select-none">
                  <th className="py-2.5 px-3">OPTIMIZATION OPPORTUNITY</th>
                  <th className="py-2.5 px-3">TARGET HOST</th>
                  <th className="py-2.5 px-3">PRIORITY</th>
                  <th className="py-2.5 px-3">AUDIT STATUS</th>
                  <th className="py-2.5 px-3 text-right">ESTIMATED ESTIMATES SAVED</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recommendations.map((rec) => (
                  <tr key={rec.id} className="text-xs text-slate-700 hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{rec.title}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-[11px] text-slate-600">{rec.resourceName}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        rec.priority === "CRITICAL" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"
                      }`}>
                        {rec.priority}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px]">
                      {rec.applied ? (
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">Applied</span>
                      ) : (
                        <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-bold">Pending Approval</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600">
                      +${rec.monthlySavings.toLocaleString()}/mo
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Signoff Stamp */}
        <div className="flex justify-between items-center border-t border-slate-100 pt-8 relative z-10">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full">
              <BadgeCheck className="w-5 h-5 text-indigo-750" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block">SECURITY TRUST SIGNATURE</span>
              <p className="text-xs font-bold text-slate-900">CloudPilot Autonomic Cost-Containment Protocol</p>
            </div>
          </div>

          <div className="text-right flex flex-col items-end">
            <div className="font-serif italic text-lg text-indigo-800 mr-2 border-b border-indigo-100">CloudPilot AI CFO</div>
            <span className="text-[9px] text-slate-400 font-mono tracking-widest uppercase mt-1">Autonomous FinOps Agent Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
};
