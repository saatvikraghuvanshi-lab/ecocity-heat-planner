import React, { useState } from "react";
import { 
  ChevronDown, 
  ChevronUp, 
  Zap, 
  TrendingDown, 
  Thermometer, 
  Leaf, 
  Droplets,
  DollarSign,
  Info
} from "lucide-react";
import { CalculatedMetrics, District } from "@/types/dashboard";

interface SimulationResultsCardProps {
  metrics: CalculatedMetrics;
  district: District;
}

export const SimulationResultsCard: React.FC<SimulationResultsCardProps> = ({
  metrics,
  district,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Compute energy percentage saved (e.g. +18.5%)
  const energySavedPct = Math.min(parseFloat((metrics.tempReductionC * 7.7).toFixed(1)), 42.0);

  // Determine Heat Index Severity based on post-intervention temperature
  const getHeatIndexStatus = (tempC: number) => {
    if (tempC >= 39) {
      return { label: "Extreme", dotColor: "bg-rose-500", textCol: "text-rose-400" };
    } else if (tempC >= 36) {
      return { label: "High", dotColor: "bg-amber-500", textCol: "text-amber-400" };
    } else if (tempC >= 33) {
      return { label: "Moderate", dotColor: "bg-amber-400", textCol: "text-amber-300" };
    } else {
      return { label: "Low / Optimal", dotColor: "bg-emerald-400", textCol: "text-emerald-400" };
    }
  };

  const heatStatus = getHeatIndexStatus(metrics.postInterventionTempC);

  return (
    <div 
      id="simulation-results-floating-card"
      className="w-72 sm:w-80 rounded-xl bg-[#090f16]/90 backdrop-blur-md border border-[#142332] shadow-2xl text-slate-100 overflow-hidden select-none transition-all duration-300 z-20"
    >
      {/* Card Header */}
      <div 
        className="px-4 py-3 border-b border-[#142332]/80 flex items-center justify-between cursor-pointer hover:bg-[#0c1622]/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="text-xs sm:text-sm font-bold text-slate-100 tracking-tight">
          Simulation Results
        </span>
        <button 
          className="text-slate-400 hover:text-emerald-400 transition-colors p-0.5"
          aria-label="Toggle details"
        >
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Primary KPI Metrics (exact match to screenshot) */}
      <div className="p-3.5 space-y-2.5">
        {/* 1. Temp Drop */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-300 font-normal">Temp Drop</span>
          <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded bg-[#0e1d2c] text-[#38bdf8] border border-[#1d3c58]">
            -{metrics.tempReductionC} °C
          </span>
        </div>

        {/* 2. Energy Saved */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-300 font-normal">Energy Saved</span>
          <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded bg-[#0c2420] text-[#34d399] border border-[#164e3f]">
            +{energySavedPct}%
          </span>
        </div>

        {/* 3. Heat Index */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-300 font-normal">Heat Index</span>
          <div className="flex items-center gap-1.5 font-mono text-xs font-semibold px-2.5 py-1 rounded bg-[#20180d] text-amber-300 border border-[#483315]">
            <span className={`w-2 h-2 rounded-full ${heatStatus.dotColor} animate-pulse`} />
            <span>{heatStatus.label}</span>
          </div>
        </div>
      </div>

      {/* Expandable In-Depth Climate & Economic ROI Telemetry */}
      {isExpanded && (
        <div className="px-3.5 pb-3.5 pt-1 border-t border-[#142332]/80 space-y-2.5 text-[11px] bg-[#070c12]/60 animate-in fade-in slide-in-from-top-1">
          <div className="flex justify-between text-slate-400 pt-1">
            <span>Simulated LST:</span>
            <span className="font-mono font-medium text-slate-200">
              {metrics.postInterventionTempC}°C <span className="text-slate-500">({district.baselineTempC}°C base)</span>
            </span>
          </div>

          <div className="flex justify-between text-slate-400">
            <span>Peak Asphalt Cooling:</span>
            <span className="font-mono font-medium text-emerald-400">
              -{metrics.peakSurfaceReductionC}°C
            </span>
          </div>

          <div className="flex justify-between text-slate-400">
            <span>HVAC Grid Savings:</span>
            <span className="font-mono font-medium text-cyan-300">
              ${(metrics.annualCostSavingsUsd / 1000).toFixed(0)}k / yr
            </span>
          </div>

          <div className="flex justify-between text-slate-400">
            <span>Estimated CapEx:</span>
            <span className="font-mono font-medium text-slate-300">
              ${(metrics.capitalCostEstimateUsd / 1000).toFixed(0)}k USD
            </span>
          </div>

          <div className="flex justify-between text-slate-400">
            <span>Carbon Offset:</span>
            <span className="font-mono font-medium text-emerald-400">
              {metrics.carbonOffsetTonsYear} tCO₂e / yr
            </span>
          </div>

          <div className="flex justify-between text-slate-400">
            <span>Economic Payback:</span>
            <span className="font-mono font-medium text-emerald-300">
              ~{metrics.paybackPeriodYears} Years
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
