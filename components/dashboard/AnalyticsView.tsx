import React from "react";
import { 
  BarChart3, 
  TrendingDown, 
  DollarSign, 
  Zap, 
  Leaf, 
  CloudRain, 
  ShieldCheck, 
  Calendar,
  Clock,
  ArrowUpRight
} from "lucide-react";
import { District, InterventionsState, CalculatedMetrics } from "@/types/dashboard";

interface AnalyticsViewProps {
  district: District;
  interventions: InterventionsState;
  metrics: CalculatedMetrics;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  district,
  interventions,
  metrics,
}) => {
  // Generate 24-Hour Diurnal Temperature Profile Simulation
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const getDiurnalTemp = (base: number, hour: number) => {
    // Peak temperature around 15:00 (3 PM), minimum around 05:00 (5 AM)
    const factor = Math.sin(((hour - 9) / 24) * 2 * Math.PI);
    return base + factor * 6.2;
  };

  const tenYearNetSavings = Math.round((metrics.annualCostSavingsUsd * 10) - metrics.capitalCostEstimateUsd);

  return (
    <div className="flex-1 h-full overflow-y-auto p-6 bg-[#05080c] text-slate-100 space-y-6 select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#142332] pb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-emerald-400" />
            <span>Thermodynamic & ROI Analytics</span>
          </h2>
          <p className="text-xs text-slate-400">
            Long-term economic amortization, peak grid load alleviation, and carbon offset models for {district.name}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-emerald-400 px-3 py-1.5 rounded-lg bg-[#0c2420] border border-[#164e3f]">
            Payback Horizon: ~{metrics.paybackPeriodYears} Years
          </span>
        </div>
      </div>

      {/* KPI Cards Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-3.5 rounded-xl bg-[#080e15] border border-[#142332] space-y-1">
          <span className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>Mean Surface Cooling</span>
            <TrendingDown className="h-3.5 w-3.5 text-emerald-400" />
          </span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            -{metrics.tempReductionC}°C
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            {district.baselineTempC}°C → {metrics.postInterventionTempC}°C
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#080e15] border border-[#142332] space-y-1">
          <span className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>Annual HVAC Savings</span>
            <Zap className="h-3.5 w-3.5 text-cyan-400" />
          </span>
          <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
            ${(metrics.annualCostSavingsUsd / 1000).toFixed(0)}k<span className="text-xs font-normal text-slate-500">/yr</span>
          </div>
          <span className="text-[10px] text-cyan-300 font-mono">
            {metrics.annualEnergySavingsMwh.toLocaleString()} MWh electricity cut
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#080e15] border border-[#142332] space-y-1">
          <span className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>Total CapEx Amortization</span>
            <DollarSign className="h-3.5 w-3.5 text-slate-400" />
          </span>
          <div className="text-2xl font-bold font-mono text-slate-100 mt-1">
            ${(metrics.capitalCostEstimateUsd / 1000000).toFixed(2)}M
          </div>
          <span className="text-[10px] text-emerald-400 font-mono">
            Break-even in {metrics.paybackPeriodYears} yrs
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#080e15] border border-[#142332] space-y-1">
          <span className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>Carbon Offsets</span>
            <Leaf className="h-3.5 w-3.5 text-emerald-400" />
          </span>
          <div className="text-2xl font-bold font-mono text-emerald-300 mt-1">
            {metrics.carbonOffsetTonsYear} <span className="text-xs font-normal text-slate-500">t/yr</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono">
            {metrics.stormwaterRetainedM3.toLocaleString()} m³ runoff retained
          </span>
        </div>
      </div>

      {/* Diurnal Temperature Curve Simulation */}
      <div className="p-4 rounded-xl bg-[#080e15] border border-[#142332] space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-emerald-400" />
            24-Hour Diurnal Heat Cycle (Baseline vs. Simulated Strategy)
          </span>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-slate-400">Baseline Heat Wave</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-slate-200 font-semibold">Simulated Eco Strategy</span>
            </div>
          </div>
        </div>

        {/* CSS/SVG Diurnal Bar Graph */}
        <div className="h-44 w-full flex items-end gap-1 sm:gap-2 pt-6 px-2 border-b border-[#142332]">
          {hours.map((hour) => {
            const baseT = getDiurnalTemp(district.baselineTempC, hour);
            const simT = baseT - metrics.tempReductionC;
            const heightBase = ((baseT - 25) / 25) * 100;
            const heightSim = ((simT - 25) / 25) * 100;

            return (
              <div key={hour} className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end">
                {/* Tooltip */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-[#060b11] border border-[#162738] text-slate-200 text-[9px] font-mono px-1.5 py-0.5 rounded shadow-xl pointer-events-none transition-opacity z-20 whitespace-nowrap">
                  {hour}:00 — Base: {baseT.toFixed(1)}°C | Sim: {simT.toFixed(1)}°C
                </div>

                <div className="w-full flex items-end justify-center gap-0.5 h-full">
                  {/* Baseline bar */}
                  <div
                    style={{ height: `${Math.max(heightBase, 10)}%` }}
                    className="w-1/2 bg-rose-950/60 border-t border-rose-500/80 rounded-t-sm group-hover:bg-rose-900 transition-all"
                  />
                  {/* Simulated bar */}
                  <div
                    style={{ height: `${Math.max(heightSim, 10)}%` }}
                    className="w-1/2 bg-emerald-500/80 rounded-t-sm shadow-sm group-hover:bg-emerald-400 transition-all"
                  />
                </div>
                <span className="text-[9px] font-mono text-slate-500">{hour % 4 === 0 ? `${hour}h` : ""}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 10-Year ROI Amortization Model */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-[#080e15] border border-[#142332] space-y-3">
          <h3 className="text-xs font-semibold text-slate-200 flex items-center justify-between">
            <span>10-Year Cumulative Net Financial Return</span>
            <span className="font-mono text-emerald-400 font-bold">
              +${(tenYearNetSavings / 1000000).toFixed(2)}M Net Benefit
            </span>
          </h3>

          <div className="space-y-2 text-xs text-slate-300">
            <div className="p-2.5 rounded-lg bg-[#0c131a] border border-[#14202c] flex justify-between">
              <span className="text-slate-400">Total 5-Yr Municipal CapEx:</span>
              <span className="font-mono text-slate-200 font-semibold">${(metrics.capitalCostEstimateUsd / 1000000).toFixed(2)}M</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#0c131a] border border-[#14202c] flex justify-between">
              <span className="text-slate-400">10-Yr Avoided HVAC Utility Bills:</span>
              <span className="font-mono text-cyan-300 font-semibold">${((metrics.annualCostSavingsUsd * 10) / 1000000).toFixed(2)}M</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#0c131a] border border-[#14202c] flex justify-between">
              <span className="text-slate-400">Avoided Peak Grid Surges:</span>
              <span className="font-mono text-emerald-400 font-semibold">{(metrics.annualEnergySavingsMwh * 10).toLocaleString()} MWh</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#080e15] border border-[#142332] space-y-3">
          <h3 className="text-xs font-semibold text-slate-200 flex items-center justify-between">
            <span>Ecological & Human Health Impact</span>
            <span className="font-mono text-emerald-400 font-bold">High Equity Score</span>
          </h3>

          <div className="space-y-2 text-xs text-slate-300">
            <div className="p-2.5 rounded-lg bg-[#0c131a] border border-[#14202c] flex justify-between">
              <span className="text-slate-400">Heat Stress Vulnerability Mitigation:</span>
              <span className="font-mono text-emerald-300 font-semibold">+{metrics.heatStressReductionScore} pts / 100</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#0c131a] border border-[#14202c] flex justify-between">
              <span className="text-slate-400">Annual Stormwater Runoff Retained:</span>
              <span className="font-mono text-violet-300 font-semibold">{metrics.stormwaterRetainedM3.toLocaleString()} m³/yr</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#0c131a] border border-[#14202c] flex justify-between">
              <span className="text-slate-400">Urban Canopy Biosequestration:</span>
              <span className="font-mono text-emerald-400 font-semibold">{metrics.carbonOffsetTonsYear} tCO₂e/yr</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
