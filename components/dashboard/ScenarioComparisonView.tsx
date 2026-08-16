import React, { useState } from "react";
import { 
  ArrowRight, 
  TrendingDown, 
  Zap, 
  Trees, 
  Sun, 
  ShieldAlert, 
  ShieldCheck, 
  Flame, 
  Droplets, 
  DollarSign, 
  Leaf, 
  Clock, 
  Building2, 
  SplitSquareVertical, 
  CheckCircle2, 
  BarChart3,
  Sliders,
  Compass
} from "lucide-react";
import { District, InterventionsState, CalculatedMetrics, ScenarioPreset } from "@/types/dashboard";
import { SCENARIO_PRESETS } from "@/lib/simulationEngine";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { HeatMapViewer } from "@/components/map/HeatMapViewer";

interface ScenarioComparisonViewProps {
  district: District;
  interventions: InterventionsState;
  metrics: CalculatedMetrics;
  onSelectScenarioPreset: (preset: ScenarioPreset) => void;
  onSwitchToSimulator: () => void;
  onOpenExportReport: () => void;
}

export const ScenarioComparisonView: React.FC<ScenarioComparisonViewProps> = ({
  district,
  interventions,
  metrics,
  onSelectScenarioPreset,
  onSwitchToSimulator,
  onOpenExportReport,
}) => {
  const [activeTab, setActiveTab] = useState<"side_by_side" | "map_split">("side_by_side");

  // Calculate percentage energy reduction
  const baselineEnergyMwh = 12400; // Average district annual cooling load
  const energySavingsPct = Math.min(38, Math.max(0, Math.round((metrics.annualEnergySavingsMwh / baselineEnergyMwh) * 100)));
  const baselineHotspots = district.hotspotsCount || 14;
  const mitigatedHotspots = Math.max(1, Math.round(baselineHotspots * (1 - (metrics.tempReductionC / 6.0))));

  return (
    <div className="space-y-4 flex flex-col flex-1 min-h-0 animate-in fade-in duration-300">
      {/* Top Comparison Subheader & Quick Preset Pills */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-emerald-950 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
            <SplitSquareVertical className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>Before vs. After Scenario Comparison</span>
              <Badge variant="success" className="text-[10px] py-0 bg-emerald-950/80 text-emerald-300 border-emerald-700">
                Live Dynamic Model
              </Badge>
            </h2>
            <p className="text-xs text-slate-400">
              Evaluating baseline unmitigated thermal dome against current multi-intervention strategy for {district.name}.
            </p>
          </div>
        </div>

        {/* View Mode Toggle & Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab("side_by_side")}
              className={`px-3 py-1 rounded-md transition-colors ${
                activeTab === "side_by_side"
                  ? "bg-emerald-600 text-white font-medium shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Side-by-Side Matrix
            </button>
            <button
              onClick={() => setActiveTab("map_split")}
              className={`px-3 py-1 rounded-md transition-colors ${
                activeTab === "map_split"
                  ? "bg-emerald-600 text-white font-medium shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Spatial Split Map
            </button>
          </div>

          <Button
            size="sm"
            onClick={onOpenExportReport}
            className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Export Impact Report
          </Button>
        </div>
      </div>

      {/* Delta Highlight Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {/* Temp Delta */}
        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl shadow">
          <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>Surface Temp Δ</span>
            <Flame className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-mono font-bold text-emerald-400 mt-1">
            -{metrics.tempReductionC}°C
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            -{metrics.tempReductionF}°F cooler LST
          </div>
        </div>

        {/* Energy Savings */}
        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl shadow">
          <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>Energy Grid Load</span>
            <Zap className="h-3.5 w-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-mono font-bold text-cyan-400 mt-1">
            -{energySavingsPct}%
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            {metrics.annualEnergySavingsMwh.toLocaleString()} MWh/yr saved
          </div>
        </div>

        {/* Annual Utility Savings */}
        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl shadow">
          <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>Annual Savings</span>
            <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-mono font-bold text-emerald-400 mt-1">
            ${(metrics.annualCostSavingsUsd / 1000).toFixed(0)}k<span className="text-xs text-slate-400 font-normal">/yr</span>
          </div>
          <div className="text-[10px] text-slate-400">
            Payback in {metrics.paybackPeriodYears} yrs
          </div>
        </div>

        {/* Hotspots Mitigated */}
        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl shadow">
          <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>Critical Hotspots</span>
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-mono font-bold text-slate-100 mt-1">
            {mitigatedHotspots} <span className="text-xs text-slate-400 font-normal">of {baselineHotspots}</span>
          </div>
          <div className="text-[10px] text-emerald-400">
            {baselineHotspots - mitigatedHotspots} severe sites stabilized
          </div>
        </div>

        {/* Carbon Offset */}
        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl shadow">
          <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>Carbon Offset</span>
            <Leaf className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-mono font-bold text-emerald-300 mt-1">
            {metrics.carbonOffsetTonsYear} <span className="text-xs text-slate-400 font-normal">t/yr</span>
          </div>
          <div className="text-[10px] text-slate-400">
            Urban sequestration
          </div>
        </div>

        {/* Stormwater Retained */}
        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl shadow">
          <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>Runoff Retention</span>
            <Droplets className="h-3.5 w-3.5 text-blue-400" />
          </div>
          <div className="text-xl font-mono font-bold text-blue-300 mt-1">
            +{(metrics.stormwaterRetainedM3 / 1000).toFixed(1)}k <span className="text-xs text-slate-400 font-normal">m³</span>
          </div>
          <div className="text-[10px] text-slate-400">
            Bioswales & porous grids
          </div>
        </div>
      </div>

      {/* Main Content: Side-by-Side Cards or Split Map */}
      {activeTab === "side_by_side" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
          {/* Card 1: Baseline Status (Red/Amber Accents) */}
          <Card className="border-rose-900/40 bg-slate-900/90 text-slate-100 shadow-md flex flex-col">
            <CardHeader className="p-4 pb-3 border-b border-rose-950/60 bg-gradient-to-r from-rose-950/40 to-transparent flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-md bg-rose-900/50 border border-rose-600/60 text-rose-400 flex items-center justify-center">
                  <Flame className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-rose-300">
                    Baseline Status (Current Urban Canopy)
                  </CardTitle>
                  <p className="text-[11px] text-slate-400">
                    Unmitigated urban heat island conditions during summer peak
                  </p>
                </div>
              </div>
              <Badge variant="danger" className="text-[10px] font-mono">
                High Risk Dome
              </Badge>
            </CardHeader>

            <CardContent className="p-4 space-y-4 flex-1">
              {/* Core Thermal Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-950/80 border border-rose-900/30">
                  <span className="text-[11px] text-slate-400">Mean Land Surface Temp</span>
                  <div className="text-2xl font-mono font-bold text-rose-400 mt-0.5">
                    {district.baselineTempC}°C
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">({district.baselineTempF}°F)</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/80 border border-rose-900/30">
                  <span className="text-[11px] text-slate-400">Peak Asphalt & Roof Surface</span>
                  <div className="text-2xl font-mono font-bold text-rose-500 mt-0.5">
                    {(district.baselineTempC + 16.4).toFixed(1)}°C
                  </div>
                  <span className="text-[10px] text-rose-400/80">Extreme solar heat retention</span>
                </div>
              </div>

              {/* Status Progress Bars */}
              <div className="space-y-3 pt-1">
                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Trees className="h-3.5 w-3.5 text-slate-400" /> Tree Canopy Coverage
                    </span>
                    <span className="font-mono text-rose-400 font-semibold">{district.currentCanopyPct}% (Deficit)</span>
                  </div>
                  <Progress value={district.currentCanopyPct} className="h-2 bg-slate-800" indicatorClassName="bg-rose-500" />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Sun className="h-3.5 w-3.5 text-slate-400" /> Surface Albedo Reflectance
                    </span>
                    <span className="font-mono text-slate-300 font-semibold">{district.baselineAlbedo} (Low)</span>
                  </div>
                  <Progress value={district.baselineAlbedo * 100} className="h-2 bg-slate-800" indicatorClassName="bg-amber-600" />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span className="flex items-center gap-1.5">
                      <ShieldAlert className="h-3.5 w-3.5 text-rose-400" /> Heat Vulnerability Index
                    </span>
                    <span className="font-mono text-rose-400 font-semibold">{district.vulnerabilityScore} / 100 (Severe)</span>
                  </div>
                  <Progress value={district.vulnerabilityScore} className="h-2 bg-slate-800" indicatorClassName="bg-rose-600" />
                </div>
              </div>

              {/* Baseline Qualitative Assessment */}
              <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/30 text-xs text-slate-300 space-y-1.5">
                <div className="font-semibold text-rose-300 flex items-center gap-1.5">
                  <ShieldAlert className="h-3.5 w-3.5 text-rose-400" /> Critical Vulnerability Factors
                </div>
                <ul className="space-y-1 text-slate-400 text-[11px] list-disc list-inside">
                  <li>{district.imperviousSurfacePct}% impervious concrete and asphalt ground cover</li>
                  <li>Over {district.hotspotsCount} critical heat micro-canyons exceeding 45°C surface heat</li>
                  <li>Peak HVAC cooling demand strains local electrical distribution grid</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Simulated Strategy (Emerald/Cyan Accents) */}
          <Card className="border-emerald-800/50 bg-slate-900/90 text-slate-100 shadow-md flex flex-col">
            <CardHeader className="p-4 pb-3 border-b border-emerald-950/60 bg-gradient-to-r from-emerald-950/40 to-transparent flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-md bg-emerald-900/50 border border-emerald-500/60 text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-emerald-300">
                    Simulated Mitigation Strategy (Active Plan)
                  </CardTitle>
                  <p className="text-[11px] text-slate-400">
                    Targeted cooling through multi-layer urban nature & high-albedo materials
                  </p>
                </div>
              </div>
              <Badge variant="success" className="text-[10px] font-mono bg-emerald-950 border-emerald-600 text-emerald-300">
                Optimized Plan
              </Badge>
            </CardHeader>

            <CardContent className="p-4 space-y-4 flex-1">
              {/* Core Simulated Thermal Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-950/80 border border-emerald-800/40">
                  <span className="text-[11px] text-slate-400">Simulated Land Surface Temp</span>
                  <div className="text-2xl font-mono font-bold text-emerald-400 mt-0.5">
                    {metrics.postInterventionTempC}°C
                  </div>
                  <span className="text-[10px] text-emerald-300 font-mono">
                    (-{metrics.tempReductionC}°C reduction / {metrics.postInterventionTempF}°F)
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/80 border border-emerald-800/40">
                  <span className="text-[11px] text-slate-400">Peak Asphalt & Roof Surface</span>
                  <div className="text-2xl font-mono font-bold text-cyan-400 mt-0.5">
                    {(district.baselineTempC + 16.4 - metrics.peakSurfaceReductionC).toFixed(1)}°C
                  </div>
                  <span className="text-[10px] text-cyan-300">(-{metrics.peakSurfaceReductionC}°C surface drop)</span>
                </div>
              </div>

              {/* Simulated Progress Bars */}
              <div className="space-y-3 pt-1">
                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Trees className="h-3.5 w-3.5 text-emerald-400" /> Target Tree Canopy Coverage
                    </span>
                    <span className="font-mono text-emerald-400 font-semibold">
                      {district.currentCanopyPct + Math.round(interventions.canopyCoveragePct * 0.35)}% (+{interventions.canopyCoveragePct}%)
                    </span>
                  </div>
                  <Progress 
                    value={district.currentCanopyPct + interventions.canopyCoveragePct * 0.35} 
                    className="h-2 bg-slate-800" 
                    indicatorClassName="bg-emerald-500" 
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Sun className="h-3.5 w-3.5 text-sky-400" /> High-Albedo Retrofit
                    </span>
                    <span className="font-mono text-sky-300 font-semibold">
                      {(district.baselineAlbedo + interventions.coolRoofAdoptionPct * 0.004).toFixed(2)} Reflectance
                    </span>
                  </div>
                  <Progress 
                    value={(district.baselineAlbedo + interventions.coolRoofAdoptionPct * 0.004) * 100} 
                    className="h-2 bg-slate-800" 
                    indicatorClassName="bg-sky-500" 
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Heat Vulnerability Index
                    </span>
                    <span className="font-mono text-emerald-400 font-semibold">
                      {Math.max(15, Math.round(district.vulnerabilityScore - metrics.heatStressReductionScore))} / 100 (Safe)
                    </span>
                  </div>
                  <Progress 
                    value={Math.max(15, district.vulnerabilityScore - metrics.heatStressReductionScore)} 
                    className="h-2 bg-slate-800" 
                    indicatorClassName="bg-emerald-500" 
                  />
                </div>
              </div>

              {/* Strategy Highlights & Economic ROI */}
              <div className="p-3 rounded-lg bg-emerald-950/25 border border-emerald-800/40 text-xs text-slate-300 space-y-1.5">
                <div className="font-semibold text-emerald-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Net Strategy Outcomes
                  </span>
                  <span className="text-emerald-400 font-mono text-[11px]">
                    ROI: {metrics.paybackPeriodYears} yr payback
                  </span>
                </div>
                <ul className="space-y-1 text-slate-400 text-[11px] list-disc list-inside">
                  <li>Est. CapEx: <strong>${(metrics.capitalCostEstimateUsd / 1000000).toFixed(2)}M</strong> yielding <strong>${(metrics.annualCostSavingsUsd / 1000).toFixed(0)}k/yr</strong> ongoing savings</li>
                  <li>Over {metrics.carbonOffsetTonsYear} metric tons of CO₂ sequestered annually</li>
                  <li>Runoff mitigation capacity increased by +{metrics.stormwaterRetainedM3.toLocaleString()} m³/yr</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Spatial Split Map Comparison */
        <div className="h-[460px] rounded-xl overflow-hidden border border-slate-800 shadow-xl">
          <HeatMapViewer
            district={district}
            activeLayer="post_intervention"
            interventions={interventions}
            metrics={metrics}
            isComparisonMode={true}
          />
        </div>
      )}

      {/* Preset Fast-Comparison Triggers */}
      <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="text-slate-400 flex items-center gap-1.5">
          <Sliders className="h-3.5 w-3.5 text-emerald-400" />
          <span>Test Pre-Configured Climate Action Scenarios:</span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {SCENARIO_PRESETS.map((preset) => (
            <Button
              key={preset.id}
              variant="outline"
              size="sm"
              onClick={() => onSelectScenarioPreset(preset)}
              className="h-7 text-xs border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700"
            >
              {preset.title}
            </Button>
          ))}
          <Button
            size="sm"
            onClick={onSwitchToSimulator}
            className="h-7 text-xs bg-slate-800 text-emerald-400 hover:bg-slate-700 border border-emerald-500/30"
          >
            Open Slider Tuner →
          </Button>
        </div>
      </div>
    </div>
  );
};
