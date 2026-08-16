import React, { useState, useEffect } from "react";
import { 
  Share2, 
  Download, 
  FileText, 
  Check, 
  Copy, 
  Printer, 
  FileSpreadsheet, 
  Database,
  Save,
  Trash2,
  BookmarkPlus,
  ArrowRight,
  TrendingDown,
  Zap,
  Building
} from "lucide-react";
import { District, InterventionsState, CalculatedMetrics, SpatialIntervention, SavedSimulationPlan } from "@/types/dashboard";
import { loadSavedPlansFromDB, savePlanToDB, deletePlanFromDB } from "@/lib/simulationEngine";

interface ExportViewProps {
  district: District;
  interventions: InterventionsState;
  metrics: CalculatedMetrics;
  spatialInterventions: SpatialIntervention[];
  onLoadPlan?: (plan: SavedSimulationPlan) => void;
}

export const ExportView: React.FC<ExportViewProps> = ({
  district,
  interventions,
  metrics,
  spatialInterventions,
  onLoadPlan,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [savedPlans, setSavedPlans] = useState<SavedSimulationPlan[]>([]);
  const [planTitleInput, setPlanTitleInput] = useState<string>(
    `${district.name} — ${new Date().toLocaleDateString()} Mitigation Scenario`
  );
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  useEffect(() => {
    setSavedPlans(loadSavedPlansFromDB());
  }, []);

  const handleSaveToDatabase = () => {
    const newPlan: SavedSimulationPlan = {
      id: `plan-${Date.now()}`,
      title: planTitleInput || `${district.name} Eco Plan`,
      districtId: district.id,
      districtName: district.name,
      interventions,
      spatialInterventions,
      metrics,
      createdAt: new Date().toISOString(),
      notes: `Spatial interventions deployed: ${spatialInterventions.length}. Target temp drop: -${metrics.tempReductionC}°C.`,
    };

    const updated = savePlanToDB(newPlan);
    setSavedPlans(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleDeletePlan = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deletePlanFromDB(id);
    setSavedPlans(updated);
  };

  const generateMarkdownReport = () => {
    return `# EcoCity Heat Planner — Comprehensive Geospatial Heat & Energy Impact Report
**District / Target:** ${district.name} (${district.code})
**Coordinates:** Latitude ${district.center[0]}, Longitude ${district.center[1]}
**Population:** ${district.population.toLocaleString()} | **District Area:** ${district.areaKm2} km²
**Date of Assessment:** ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
**Prepared By:** Urban Heat Mitigation Specialist & Climate Adaptation Team

---

### Executive Summary & Key Milestones
- **Baseline Land Surface Temperature (LST):** ${district.baselineTempC}°C (${district.baselineTempF}°F)
- **Simulated Post-Intervention Temperature:** ${metrics.postInterventionTempC}°C (${metrics.postInterventionTempF}°F)
- **Net Cooling Differential:** -${metrics.tempReductionC}°C (-${metrics.tempReductionF}°F)
- **Peak Asphalt Roadway & Roof Cooling:** -${metrics.peakSurfaceReductionC}°C
- **Critical Hotspots Alleviated:** ${metrics.simulatedHotspotsCooled} of ${district.hotspotsCount} priority nodes

---

### Nature-Based Spatial Interventions
- **Urban Tree Canopy Addition:** +${interventions.canopyCoveragePct}% (+${metrics.greenAreaAddedM2.toLocaleString()} m² green area)
- **Cool Reflective Roof Retrofits:** +${interventions.coolRoofAdoptionPct}% (+${metrics.buildingAreaReflectedM2.toLocaleString()} m² surface albedo)
- **Permeable Pavements & Bioswales:** +${interventions.permeablePavementPct}%
- **Evaporative Misting Networks:** +${interventions.waterMistingDensityPct}%
- **Vertical Living Walls & Facades:** +${interventions.verticalGardensPct}%
- **Pinned Geospatial Interventions:** ${spatialInterventions.length} custom-sited coordinates

---

### Energy Consumption & Economic ROI Impact
- **Annual Avoided Grid Electricity:** ${metrics.annualEnergySavingsMwh.toLocaleString()} MWh / year
- **Annual Utility Cost Savings:** $${metrics.annualCostSavingsUsd.toLocaleString()} USD / year
- **Estimated Municipal CapEx:** $${metrics.capitalCostEstimateUsd.toLocaleString()} USD
- **Payback Horizon:** ~${metrics.paybackPeriodYears} Years
- **10-Year Cumulative Net Financial Dividend:** $${Math.round((metrics.annualCostSavingsUsd * 10) - metrics.capitalCostEstimateUsd).toLocaleString()} USD

---

### Environmental & Human Co-Benefits
- **Carbon Offset (Grid Displacement + Tree Sequestration):** ${metrics.carbonOffsetTonsYear.toLocaleString()} tCO₂e / year
- **Stormwater Retention Volume:** ${metrics.stormwaterRetainedM3.toLocaleString()} m³ / year
- **Air Quality Improvement Delta (PM2.5 / Ozone):** +${metrics.airQualityIndexDeltaPct}%
- **Heat Vulnerability Index Score:** Reduced to ${metrics.heatStressReductionScore} / 100

*Generated and verified with OpenStreetMap & Leaflet Geospatial Intelligence Engine.*
`;
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(generateMarkdownReport());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadJSON = () => {
    const data = {
      district,
      interventions,
      spatialInterventions,
      metrics,
      timestamp: new Date().toISOString(),
      generator: "EcoCity Heat Planner Geospatial Engine",
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `EcoCity_Geospatial_${district.code}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCSV = () => {
    const rows = [
      ["Metric Category", "Parameter", "Value", "Unit"],
      ["Geospatial", "District Name", district.name, ""],
      ["Geospatial", "District Code", district.code, ""],
      ["Geospatial", "Center Latitude", district.center[0], "deg"],
      ["Geospatial", "Center Longitude", district.center[1], "deg"],
      ["Thermal", "Baseline Land Surface Temp", district.baselineTempC, "°C"],
      ["Thermal", "Simulated Post-Intervention Temp", metrics.postInterventionTempC, "°C"],
      ["Thermal", "Net Temp Reduction", `-${metrics.tempReductionC}`, "°C"],
      ["Intervention", "Tree Canopy Expansion", interventions.canopyCoveragePct, "%"],
      ["Intervention", "Cool Roof Retrofit", interventions.coolRoofAdoptionPct, "%"],
      ["Intervention", "Permeable Pavement", interventions.permeablePavementPct, "%"],
      ["Intervention", "Water Misting Nodes", interventions.waterMistingDensityPct, "%"],
      ["Intervention", "Vertical Green Walls", interventions.verticalGardensPct, "%"],
      ["Intervention", "Custom Geospatial Points Placed", spatialInterventions.length, "sites"],
      ["Energy & Cost", "Annual Electricity Saved", metrics.annualEnergySavingsMwh, "MWh/yr"],
      ["Energy & Cost", "Annual Cost Savings", metrics.annualCostSavingsUsd, "USD/yr"],
      ["Energy & Cost", "Estimated Total CapEx", metrics.capitalCostEstimateUsd, "USD"],
      ["Energy & Cost", "Simple Payback Period", metrics.paybackPeriodYears, "Years"],
      ["Co-Benefits", "Carbon Offset", metrics.carbonOffsetTonsYear, "tCO2e/yr"],
      ["Co-Benefits", "Stormwater Retained", metrics.stormwaterRetainedM3, "m3/yr"],
      ["Co-Benefits", "Air Quality Index Improvement", metrics.airQualityIndexDeltaPct, "%"],
    ];
    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `EcoCity_ImpactReport_${district.code}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 h-full overflow-y-auto p-6 bg-[#05080c] text-slate-100 space-y-6 select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#142332] pb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
            <Share2 className="h-5 w-5 text-emerald-400" />
            <span>Impact Reports & Scenario Database</span>
          </h2>
          <p className="text-xs text-slate-400">
            Generate and export climate action proposals, datasets, and persistent simulation scenarios.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0c1622] hover:bg-[#101e2e] text-slate-200 border border-[#162738] text-xs font-medium transition-colors cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Report</span>
          </button>

          <button
            onClick={handleCopyMarkdown}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2dd4bf] hover:bg-[#34d399] text-[#041c16] text-xs font-bold transition-all shadow-md shadow-emerald-950/40 cursor-pointer"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? "Copied Memo!" : "Copy Full Report"}</span>
          </button>
        </div>
      </div>

      {/* Database Save Card */}
      <div className="p-4 rounded-xl bg-[#081018] border border-[#182c40] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-200 flex items-center gap-2">
            <Database className="h-4 w-4 text-emerald-400" />
            <span>Save Simulation Scenario to Database</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {savedPlans.length} Scenarios Saved in Storage
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={planTitleInput}
            onChange={(e) => setPlanTitleInput(e.target.value)}
            placeholder="Scenario Title..."
            className="flex-1 bg-[#050b10] border border-[#162738] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-400 font-medium"
          />
          <button
            onClick={handleSaveToDatabase}
            className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-[#05080c] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            {saveSuccess ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
            <span>{saveSuccess ? "Saved to DB!" : "Save Current Run"}</span>
          </button>
        </div>

        {/* List of Saved Database Plans */}
        {savedPlans.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-[#122232]">
            {savedPlans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => onLoadPlan && onLoadPlan(plan)}
                className="p-2.5 rounded-lg bg-[#050b10] border border-[#142332] hover:border-emerald-500/50 transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="overflow-hidden">
                  <p className="text-xs font-semibold text-slate-200 truncate group-hover:text-emerald-400 transition-colors">
                    {plan.title}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    {plan.districtName} • -{plan.metrics.tempReductionC}°C • {new Date(plan.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <button
                    onClick={(e) => handleDeletePlan(plan.id, e)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Delete saved scenario"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Export Format Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={handleDownloadJSON}
          className="p-4 rounded-xl bg-[#080e15] border border-[#142332] hover:bg-[#0c1622] hover:border-emerald-500/50 transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-[#070b10] border border-[#162738] text-cyan-400">
              <Database className="h-4 w-4" />
            </div>
            <Download className="h-4 w-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
          </div>
          <h3 className="text-xs sm:text-sm font-semibold text-slate-100">Full Geospatial JSON</h3>
          <p className="text-[11px] text-slate-400">Export coordinates, spatial intervention nodes, and thermodynamic metrics.</p>
        </div>

        <div
          onClick={handleDownloadCSV}
          className="p-4 rounded-xl bg-[#080e15] border border-[#142332] hover:bg-[#0c1622] hover:border-emerald-500/50 transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-[#070b10] border border-[#162738] text-emerald-400">
              <FileSpreadsheet className="h-4 w-4" />
            </div>
            <Download className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
          </div>
          <h3 className="text-xs sm:text-sm font-semibold text-slate-100">Impact Analysis CSV</h3>
          <p className="text-[11px] text-slate-400">Tabular format for ArcGIS, QGIS, municipal planning sheets, and energy models.</p>
        </div>

        <div
          onClick={handleCopyMarkdown}
          className="p-4 rounded-xl bg-[#080e15] border border-[#142332] hover:bg-[#0c1622] hover:border-emerald-500/50 transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-[#070b10] border border-[#162738] text-emerald-300">
              <FileText className="h-4 w-4" />
            </div>
            <Copy className="h-4 w-4 text-slate-500 group-hover:text-emerald-300 transition-colors" />
          </div>
          <h3 className="text-xs sm:text-sm font-semibold text-slate-100">Executive Briefing</h3>
          <p className="text-[11px] text-slate-400">Copy formatted memo for city council presentations and policy grant applications.</p>
        </div>
      </div>

      {/* Live Document Preview Box */}
      <div className="p-5 rounded-xl bg-[#080e15] border border-[#142332] space-y-4">
        <div className="flex items-center justify-between border-b border-[#142332] pb-3">
          <span className="text-xs font-semibold text-slate-200">
            Document Preview: EcoCity Heat & Energy Impact Report
          </span>
          <span className="text-[11px] font-mono text-emerald-400">Leaflet Geospatial Verified</span>
        </div>

        <div className="bg-[#05080c] p-4 rounded-lg border border-[#101b27] font-mono text-xs text-slate-300 space-y-3 leading-relaxed">
          <p className="text-emerald-400 font-bold">
            # EcoCity Heat Planner — Climate Mitigation & Energy Optimization Report
          </p>
          <p className="text-slate-400">
            Target: {district.name} ({district.code}) | Center: {district.center[0]}, {district.center[1]} | Population: {district.population.toLocaleString()}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px]">
            <div className="p-2 rounded bg-[#091119] border border-[#142230]">
              <span className="text-slate-500 block">Baseline LST:</span>
              <span className="text-rose-400 font-bold">{district.baselineTempC}°C</span>
            </div>
            <div className="p-2 rounded bg-[#091119] border border-[#142230]">
              <span className="text-slate-500 block">Simulated LST:</span>
              <span className="text-emerald-400 font-bold">{metrics.postInterventionTempC}°C</span>
            </div>
            <div className="p-2 rounded bg-[#091119] border border-[#142230]">
              <span className="text-slate-500 block">Net Temp Drop:</span>
              <span className="text-cyan-400 font-bold">-{metrics.tempReductionC}°C</span>
            </div>
            <div className="p-2 rounded bg-[#091119] border border-[#142230]">
              <span className="text-slate-500 block">Annual Energy Cut:</span>
              <span className="text-emerald-300 font-bold">{metrics.annualEnergySavingsMwh.toLocaleString()} MWh</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
