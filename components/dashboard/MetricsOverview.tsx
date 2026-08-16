import React from "react";
import { 
  Thermometer, 
  Zap, 
  DollarSign, 
  Leaf, 
  CloudRain, 
  Wind, 
  TrendingDown, 
  Clock, 
  ShieldCheck,
  Flame,
  ArrowDownRight
} from "lucide-react";
import { CalculatedMetrics, District } from "@/types/dashboard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MetricsOverviewProps {
  metrics: CalculatedMetrics;
  district: District;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({
  metrics,
  district,
}) => {
  return (
    <div id="metrics-overview-container" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {/* Metric Card 1: Temperature Reduction */}
      <Card id="metric-temp-reduction" className="relative overflow-hidden border-slate-800 bg-slate-900/90 text-slate-100 shadow-sm">
        <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none">
          <Thermometer className="h-16 w-16 text-emerald-400" />
        </div>
        <CardContent className="p-3.5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Thermometer className="h-3.5 w-3.5" />
              Surface Cooling (LST)
            </span>
            <Badge variant="success" className="text-[10px] font-mono px-1.5 py-0 bg-emerald-950 text-emerald-300 border-emerald-700">
              <TrendingDown className="h-3 w-3 mr-0.5 inline" />
              -{metrics.tempReductionC}°C
            </Badge>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-slate-100">
              -{metrics.tempReductionC}°C
            </span>
            <span className="text-xs font-semibold font-mono text-emerald-400">
              (-{metrics.tempReductionF}°F)
            </span>
          </div>

          <div className="pt-1.5 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800">
            <span>Simulated LST:</span>
            <span className="font-mono font-semibold text-emerald-300">
              {metrics.postInterventionTempC}°C
              <span className="text-[10px] text-slate-500 font-normal ml-1">({district.baselineTempC}°C base)</span>
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Metric Card 2: Energy & Electricity Demand Reduction */}
      <Card id="metric-energy-savings" className="relative overflow-hidden border-slate-800 bg-slate-900/90 text-slate-100 shadow-sm">
        <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none">
          <Zap className="h-16 w-16 text-cyan-400" />
        </div>
        <CardContent className="p-3.5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5" />
              HVAC Electricity Savings
            </span>
            <Badge variant="info" className="text-[10px] font-mono px-1.5 py-0 bg-sky-950 text-sky-300 border-sky-700">
              Annual
            </Badge>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-slate-100">
              {metrics.annualEnergySavingsMwh.toLocaleString()}
            </span>
            <span className="text-xs font-medium text-slate-400">MWh / yr</span>
          </div>

          <div className="pt-1.5 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800">
            <span>Cost Savings:</span>
            <span className="font-mono font-semibold text-cyan-300">
              ${metrics.annualCostSavingsUsd.toLocaleString()} USD/yr
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Metric Card 3: Capital Expenditure & ROI Payback */}
      <Card id="metric-cost-roi" className="relative overflow-hidden border-slate-800 bg-slate-900/90 text-slate-100 shadow-sm">
        <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none">
          <DollarSign className="h-16 w-16 text-slate-600" />
        </div>
        <CardContent className="p-3.5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5 text-slate-400" />
              Estimated CapEx
            </span>
            <Badge variant="secondary" className="text-[10px] font-mono px-1.5 py-0 bg-slate-800 text-slate-300 border-slate-700">
              <Clock className="h-3 w-3 mr-0.5 inline" />
              {metrics.paybackPeriodYears} yr ROI
            </Badge>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-slate-100">
              ${(metrics.capitalCostEstimateUsd / 1000).toFixed(0)}k
            </span>
            <span className="text-xs text-slate-400 font-medium">USD Est.</span>
          </div>

          <div className="pt-1.5 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800">
            <span>Payback Horizon:</span>
            <span className="font-mono font-medium text-emerald-400">
              ~{metrics.paybackPeriodYears} years
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Metric Card 4: Environmental & Social Co-Benefits */}
      <Card id="metric-carbon-equity" className="relative overflow-hidden border-slate-800 bg-slate-900/90 text-slate-100 shadow-sm">
        <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none">
          <Leaf className="h-16 w-16 text-violet-400" />
        </div>
        <CardContent className="p-3.5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-violet-400 uppercase tracking-wider flex items-center gap-1.5">
              <Leaf className="h-3.5 w-3.5" />
              Carbon & Resiliency
            </span>
            <Badge variant="purple" className="text-[10px] font-mono px-1.5 py-0 bg-violet-950 text-violet-300 border-violet-700">
              Co-Benefits
            </Badge>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-slate-100">
              {metrics.carbonOffsetTonsYear.toLocaleString()}
            </span>
            <span className="text-xs font-medium text-slate-400">tCO₂e / yr</span>
          </div>

          <div className="pt-1.5 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800">
            <span>Runoff Retained:</span>
            <span className="font-mono font-medium text-violet-300">
              {metrics.stormwaterRetainedM3.toLocaleString()} m³/yr
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
