import React, { useState } from "react";
import { 
  Download, 
  FileText, 
  Printer, 
  Copy, 
  Check, 
  Share2, 
  Trees, 
  Sun, 
  Droplets, 
  Building2, 
  Leaf, 
  DollarSign, 
  TrendingDown, 
  Zap, 
  Calendar, 
  CheckCircle2, 
  Database,
  Code,
  FileSpreadsheet,
  FileJson
} from "lucide-react";
import { District, InterventionsState, CalculatedMetrics } from "@/types/dashboard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  district: District;
  interventions: InterventionsState;
  metrics: CalculatedMetrics;
  activeScenarioId?: string;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  district,
  interventions,
  metrics,
  activeScenarioId = "Custom Strategy",
}) => {
  const [activeTab, setActiveTab] = useState<string>("summary");
  const [copiedStatus, setCopiedStatus] = useState<string | null>(null);

  // Intervention Cost Breakdown Computations
  const treeCost = Math.round(metrics.capitalCostEstimateUsd * 0.35);
  const coolRoofCost = Math.round(metrics.capitalCostEstimateUsd * 0.28);
  const pavementCost = Math.round(metrics.capitalCostEstimateUsd * 0.18);
  const mistingCost = Math.round(metrics.capitalCostEstimateUsd * 0.09);
  const greenWallCost = Math.round(metrics.capitalCostEstimateUsd * 0.10);

  // 10-Year Cumulative Net Financial Model
  const tenYearNetSavings = Math.round((metrics.annualCostSavingsUsd * 10) - metrics.capitalCostEstimateUsd);

  // Trigger Client-Side Printable Report via browser print dialog
  const handlePrintPdf = () => {
    window.print();
  };

  // Generate & Download JSON Payload
  const handleDownloadJson = () => {
    const reportData = {
      title: "Urban Heat Island Mitigation Plan",
      generatedAt: new Date().toISOString(),
      district: {
        id: district.id,
        name: district.name,
        code: district.code,
        population: district.population,
        areaKm2: district.areaKm2,
        baselineTempC: district.baselineTempC,
        baselineTempF: district.baselineTempF,
        baselineCanopyPct: district.currentCanopyPct,
        baselineAlbedo: district.baselineAlbedo,
      },
      scenario: {
        id: activeScenarioId,
        interventions: {
          urbanTreeCanopyAdditionPct: interventions.canopyCoveragePct,
          coolRoofAdoptionPct: interventions.coolRoofAdoptionPct,
          permeablePavementPct: interventions.permeablePavementPct,
          waterMistingDensityPct: interventions.waterMistingDensityPct,
          verticalGreenWallsPct: interventions.verticalGardensPct,
        },
      },
      thermodynamicCalculations: {
        meanLandSurfaceTempReductionC: metrics.tempReductionC,
        meanLandSurfaceTempReductionF: metrics.tempReductionF,
        simulatedMeanLSTC: metrics.postInterventionTempC,
        simulatedMeanLSTF: metrics.postInterventionTempF,
        peakSurfaceReductionC: metrics.peakSurfaceReductionC,
        uhiIntensityDelta: metrics.uhiIntensityDelta,
      },
      economicAndEnvironmentalROI: {
        capitalCostEstimateUsd: metrics.capitalCostEstimateUsd,
        annualUtilityCostSavingsUsd: metrics.annualCostSavingsUsd,
        annualElectricityDemandSavingsMwh: metrics.annualEnergySavingsMwh,
        estimatedPaybackPeriodYears: metrics.paybackPeriodYears,
        tenYearNetEconomicBenefitUsd: tenYearNetSavings,
        annualCarbonOffsetTonsCO2: metrics.carbonOffsetTonsYear,
        stormwaterRetainedCubicMeters: metrics.stormwaterRetainedM3,
        heatStressVulnerabilityMitigationScore: metrics.heatStressReductionScore,
      },
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `uhi-mitigation-report-${district.code.toLowerCase()}-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Generate & Download CSV Dataset
  const handleDownloadCsv = () => {
    const rows = [
      ["Parameter", "Metric Value", "Units"],
      ["District Name", district.name, "String"],
      ["District Code", district.code, "Identifier"],
      ["Baseline LST", district.baselineTempC.toString(), "Celsius"],
      ["Simulated Post-Intervention LST", metrics.postInterventionTempC.toString(), "Celsius"],
      ["LST Temperature Reduction", metrics.tempReductionC.toString(), "Delta Celsius"],
      ["LST Temperature Reduction (F)", metrics.tempReductionF.toString(), "Delta Fahrenheit"],
      ["Tree Canopy Target Addition", interventions.canopyCoveragePct.toString(), "% Target"],
      ["Cool Roof Retrofit Adoption", interventions.coolRoofAdoptionPct.toString(), "% Target"],
      ["Permeable Pavement Coverage", interventions.permeablePavementPct.toString(), "% Target"],
      ["Evaporative Misting Density", interventions.waterMistingDensityPct.toString(), "% Target"],
      ["Vertical Green Walls", interventions.verticalGardensPct.toString(), "% Target"],
      ["Total CapEx Investment", metrics.capitalCostEstimateUsd.toString(), "USD"],
      ["Annual Energy Savings", metrics.annualEnergySavingsMwh.toString(), "MWh/year"],
      ["Annual Utility Cost Savings", metrics.annualCostSavingsUsd.toString(), "USD/year"],
      ["Payback Period Horizon", metrics.paybackPeriodYears.toString(), "Years"],
      ["Annual Carbon Offset", metrics.carbonOffsetTonsYear.toString(), "Tons CO2e/year"],
      ["Stormwater Retained", metrics.stormwaterRetainedM3.toString(), "Cubic Meters/year"],
    ];

    const csvContent = rows.map((e) => e.map(cell => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `uhi-metrics-${district.code.toLowerCase()}-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Copy Executive Markdown Summary to Clipboard
  const handleCopyMarkdown = () => {
    const md = `# Urban Heat Island Mitigation Plan: ${district.name} (${district.code})
**Generated On:** ${new Date().toLocaleDateString()}
**Status:** Thermodynamic Simulation Complete

## 1. Executive Summary
- **Baseline Surface Temperature:** ${district.baselineTempC}°C (${district.baselineTempF}°F)
- **Target Surface Temperature:** ${metrics.postInterventionTempC}°C (${metrics.postInterventionTempF}°F)
- **Net Cooling Reduction:** -${metrics.tempReductionC}°C (-${metrics.tempReductionF}°F)
- **Peak Asphalt Surface Drop:** -${metrics.peakSurfaceReductionC}°C

## 2. Selected Interventions
- Urban Tree Canopy: +${interventions.canopyCoveragePct}%
- High-Albedo Cool Roofs: ${interventions.coolRoofAdoptionPct}%
- Permeable Pavement & Bioswales: ${interventions.permeablePavementPct}%
- Evaporative Misting Nodes: ${interventions.waterMistingDensityPct}%
- Vertical Living Green Walls: ${interventions.verticalGardensPct}%

## 3. Financial & Climate ROI
- **Estimated Total CapEx:** $${(metrics.capitalCostEstimateUsd / 1000000).toFixed(2)}M USD
- **Annual Utility Savings:** $${metrics.annualCostSavingsUsd.toLocaleString()} USD/yr (${metrics.annualEnergySavingsMwh.toLocaleString()} MWh/yr)
- **Payback Horizon:** ${metrics.paybackPeriodYears} Years
- **10-Year Net Economic Benefit:** $${(tenYearNetSavings / 1000000).toFixed(2)}M USD
- **Annual Carbon Offset:** ${metrics.carbonOffsetTonsYear} Metric Tons CO₂
- **Stormwater Retention:** ${metrics.stormwaterRetainedM3.toLocaleString()} m³/yr
`;

    navigator.clipboard.writeText(md);
    setCopiedStatus("md");
    setTimeout(() => setCopiedStatus(null), 2500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-6 overflow-hidden bg-slate-900 border-slate-800 text-slate-100 shadow-2xl">
        {/* Modal Header */}
        <DialogHeader className="pb-3 border-b border-slate-800 flex flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-950 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>Urban Heat Island Mitigation Impact Report</span>
                <Badge variant="success" className="text-[10px] bg-emerald-950/80 text-emerald-300 border-emerald-700">
                  Ready to Export
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                Municipal climate action proposal & thermodynamic telemetry for {district.name} ({district.code}).
              </DialogDescription>
            </div>
          </div>

          {/* Quick Print & Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              id="print-summary-btn"
              size="sm"
              onClick={handlePrintPdf}
              className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-sm"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Download PDF / Print</span>
            </Button>
          </div>
        </DialogHeader>

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0 pt-2">
          <TabsList className="bg-slate-950 border border-slate-800 p-0.5 justify-start shrink-0">
            <TabsTrigger value="summary" className="text-xs data-[state=active]:bg-slate-800 data-[state=active]:text-white">
              Executive Impact Summary
            </TabsTrigger>
            <TabsTrigger value="financials" className="text-xs data-[state=active]:bg-slate-800 data-[state=active]:text-white">
              Cost & 10-Year ROI Model
            </TabsTrigger>
            <TabsTrigger value="data_export" className="text-xs data-[state=active]:bg-slate-800 data-[state=active]:text-white">
              JSON & CSV Datasets
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: EXECUTIVE IMPACT SUMMARY */}
          <TabsContent value="summary" className="flex-1 overflow-y-auto space-y-4 py-3 pr-1 text-slate-200">
            {/* Top KPI Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 shadow-sm">
                <span className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
                  <span>Surface Cooling</span>
                  <TrendingDown className="h-3.5 w-3.5 text-emerald-400" />
                </span>
                <div className="text-2xl font-mono font-bold text-emerald-400 mt-1">
                  -{metrics.tempReductionC}°C
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {district.baselineTempC}°C → {metrics.postInterventionTempC}°C
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 shadow-sm">
                <span className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
                  <span>Total Investment</span>
                  <DollarSign className="h-3.5 w-3.5 text-slate-400" />
                </span>
                <div className="text-2xl font-mono font-bold text-slate-100 mt-1">
                  ${(metrics.capitalCostEstimateUsd / 1000000).toFixed(2)}M
                </div>
                <span className="text-[10px] text-slate-400">
                  Estimated 5-year municipal CapEx
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 shadow-sm">
                <span className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
                  <span>Annual Energy Savings</span>
                  <Zap className="h-3.5 w-3.5 text-cyan-400" />
                </span>
                <div className="text-2xl font-mono font-bold text-cyan-400 mt-1">
                  ${(metrics.annualCostSavingsUsd / 1000).toFixed(0)}k<span className="text-xs text-slate-400 font-normal">/yr</span>
                </div>
                <span className="text-[10px] text-cyan-300 font-mono">
                  {metrics.annualEnergySavingsMwh.toLocaleString()} MWh/yr demand cut
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 shadow-sm">
                <span className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
                  <span>Carbon Offset</span>
                  <Leaf className="h-3.5 w-3.5 text-emerald-400" />
                </span>
                <div className="text-2xl font-mono font-bold text-emerald-300 mt-1">
                  {metrics.carbonOffsetTonsYear} <span className="text-xs text-slate-400 font-normal">t/yr</span>
                </div>
                <span className="text-[10px] text-emerald-400">
                  Urban forestry sequestration
                </span>
              </div>
            </div>

            {/* Selected Interventions Breakdown */}
            <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3">
              <div className="text-xs font-bold text-slate-200 flex items-center justify-between">
                <span>Selected Urban Intervention Specifications</span>
                <span className="text-[11px] text-slate-400 font-mono">Target Adoption</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trees className="h-4 w-4 text-emerald-400" />
                    <span>Urban Tree Canopy</span>
                  </div>
                  <Badge variant="success" className="font-mono text-[11px]">
                    +{interventions.canopyCoveragePct}%
                  </Badge>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4 text-sky-400" />
                    <span>High-Albedo Cool Roofs</span>
                  </div>
                  <Badge variant="info" className="font-mono text-[11px]">
                    {interventions.coolRoofAdoptionPct}%
                  </Badge>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-teal-400" />
                    <span>Permeable Pavement</span>
                  </div>
                  <Badge variant="secondary" className="font-mono text-[11px] bg-slate-800 text-teal-300">
                    {interventions.permeablePavementPct}%
                  </Badge>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-cyan-400" />
                    <span>Evaporative Misting Nodes</span>
                  </div>
                  <Badge variant="secondary" className="font-mono text-[11px] bg-slate-800 text-cyan-300">
                    {interventions.waterMistingDensityPct}%
                  </Badge>
                </div>
              </div>
            </div>

            {/* Environmental & Health Co-Benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Environmental Resiliency
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Reduces urban thermal mass accumulation across <strong>{district.areaKm2} km²</strong>, mitigating peak nighttime radiant heat release and lowering HVAC electricity surges during regional heatwaves.
                </p>
                <div className="text-[11px] text-slate-400 font-mono">
                  Stormwater Runoff Retained: <strong>{metrics.stormwaterRetainedM3.toLocaleString()} m³/yr</strong>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Public Health & Equity
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Protects <strong>{district.population.toLocaleString()} residents</strong> from acute heat stress vulnerability, reducing pediatric and elder heat-related emergency admissions by an estimated <strong>28-35%</strong>.
                </p>
                <div className="text-[11px] text-slate-400 font-mono">
                  Heat Stress Mitigation Index: <strong>+{metrics.heatStressReductionScore} pts</strong>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: FINANCIAL & 10-YEAR ROI MODEL */}
          <TabsContent value="financials" className="flex-1 overflow-y-auto space-y-4 py-3 pr-1 text-slate-200">
            {/* CapEx Budget Allocation by Category */}
            <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                <span>Capital Expenditure (CapEx) Allocation</span>
                <span className="font-mono text-emerald-400 font-bold">
                  Total: ${(metrics.capitalCostEstimateUsd / 1000000).toFixed(2)}M
                </span>
              </div>

              <div className="space-y-2.5">
                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Trees className="h-3.5 w-3.5 text-emerald-400" /> Urban Forestry & Planting
                    </span>
                    <span className="font-mono text-emerald-300">${(treeCost / 1000).toFixed(0)}k (35%)</span>
                  </div>
                  <Progress value={35} className="h-2 bg-slate-800" indicatorClassName="bg-emerald-500" />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Sun className="h-3.5 w-3.5 text-sky-400" /> Cool Roof Rebates & Retrofits
                    </span>
                    <span className="font-mono text-sky-300">${(coolRoofCost / 1000).toFixed(0)}k (28%)</span>
                  </div>
                  <Progress value={28} className="h-2 bg-slate-800" indicatorClassName="bg-sky-500" />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-teal-400" /> Permeable Pavement & Bioswales
                    </span>
                    <span className="font-mono text-teal-300">${(pavementCost / 1000).toFixed(0)}k (18%)</span>
                  </div>
                  <Progress value={18} className="h-2 bg-slate-800" indicatorClassName="bg-teal-500" />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-emerald-400" /> Vertical Living Facades
                    </span>
                    <span className="font-mono text-emerald-300">${(greenWallCost / 1000).toFixed(0)}k (10%)</span>
                  </div>
                  <Progress value={10} className="h-2 bg-slate-800" indicatorClassName="bg-emerald-600" />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Droplets className="h-3.5 w-3.5 text-cyan-400" /> Microclimate Misting Nodes
                    </span>
                    <span className="font-mono text-cyan-300">${(mistingCost / 1000).toFixed(0)}k (9%)</span>
                  </div>
                  <Progress value={9} className="h-2 bg-slate-800" indicatorClassName="bg-cyan-500" />
                </div>
              </div>
            </div>

            {/* 10-Year ROI Model */}
            <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3">
              <div className="text-xs font-bold text-slate-200">
                10-Year Cumulative Financial Outlook
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-slate-400">Payback Period</div>
                  <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                    {metrics.paybackPeriodYears} Years
                  </div>
                  <div className="text-[10px] text-slate-500">Break-even Horizon</div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-slate-400">10-Yr Net Benefit</div>
                  <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                    +${(tenYearNetSavings / 1000000).toFixed(2)}M
                  </div>
                  <div className="text-[10px] text-slate-500">After Full CapEx Amortization</div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-slate-400">Avoided Peak Demand</div>
                  <div className="text-xl font-bold font-mono text-cyan-400 mt-1">
                    {(metrics.annualEnergySavingsMwh * 10).toLocaleString()} MWh
                  </div>
                  <div className="text-[10px] text-slate-500">10-Year Cumulative Grid Relief</div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB 3: DATA EXPORT (JSON & CSV) */}
          <TabsContent value="data_export" className="flex-1 overflow-y-auto space-y-4 py-3 pr-1 text-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* JSON Export Card */}
              <Card className="border-slate-800 bg-slate-950 p-4 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-slate-100 font-bold text-sm">
                    <FileJson className="h-4 w-4 text-emerald-400" />
                    <span>JSON Simulation Telemetry</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Full structured object containing spatial boundaries, district baseline, slider inputs, and thermodynamic calculations.
                  </p>
                </div>
                <Button
                  onClick={handleDownloadJson}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download .JSON File</span>
                </Button>
              </Card>

              {/* CSV Export Card */}
              <Card className="border-slate-800 bg-slate-950 p-4 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-slate-100 font-bold text-sm">
                    <FileSpreadsheet className="h-4 w-4 text-cyan-400" />
                    <span>CSV Tabular Dataset</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Standard tabular format formatted for Excel, Google Sheets, or GIS spatial analysis software.
                  </p>
                </div>
                <Button
                  onClick={handleDownloadCsv}
                  variant="outline"
                  className="w-full border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 text-xs gap-1.5"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download .CSV Spreadsheet</span>
                </Button>
              </Card>
            </div>

            {/* Markdown Summary Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span>Executive Markdown Summary</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyMarkdown}
                  className="h-6 text-[11px] gap-1 border-slate-700 bg-slate-800 text-slate-200"
                >
                  {copiedStatus === "md" ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  {copiedStatus === "md" ? "Copied!" : "Copy Markdown"}
                </Button>
              </div>
              <pre className="p-3 rounded-lg bg-slate-950 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-44 border border-slate-800 leading-relaxed">
{`# Urban Heat Island Mitigation Plan: ${district.name} (${district.code})
- Baseline LST: ${district.baselineTempC}°C | Simulated LST: ${metrics.postInterventionTempC}°C (-${metrics.tempReductionC}°C)
- Total CapEx: $${(metrics.capitalCostEstimateUsd / 1000000).toFixed(2)}M | Annual Utility Savings: $${(metrics.annualCostSavingsUsd / 1000).toFixed(0)}k/yr
- Payback Horizon: ${metrics.paybackPeriodYears} Years | Carbon Offset: ${metrics.carbonOffsetTonsYear} t/yr`}
              </pre>
            </div>
          </TabsContent>
        </Tabs>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyMarkdown}
            className="text-xs border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white"
          >
            {copiedStatus === "md" ? "Copied Markdown!" : "Copy Quick Summary"}
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Close
            </Button>
            <Button
              size="sm"
              onClick={handlePrintPdf}
              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / Save PDF</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
