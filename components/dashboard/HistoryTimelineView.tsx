import React, { useState } from "react";
import { 
  History, 
  Play, 
  Trash2, 
  ArrowRight, 
  CheckSquare, 
  Square, 
  TrendingDown, 
  Zap, 
  DollarSign, 
  Trees, 
  Sun, 
  Droplets, 
  ShieldCheck, 
  Clock, 
  Sparkles, 
  BarChart3, 
  FileSpreadsheet, 
  Layers, 
  Check, 
  Copy,
  ChevronRight,
  Filter,
  PlusCircle,
  Tag
} from "lucide-react";
import { 
  District, 
  InterventionsState, 
  CalculatedMetrics, 
  SpatialIntervention, 
  SimulationRunRecord,
  UserPreferences
} from "@/types/dashboard";

interface HistoryTimelineViewProps {
  historyRuns: SimulationRunRecord[];
  onApplyRun: (run: SimulationRunRecord) => void;
  onDeleteRun: (runId: string) => void;
  onClearAllRuns: () => void;
  preferences: UserPreferences;
}

export const HistoryTimelineView: React.FC<HistoryTimelineViewProps> = ({
  historyRuns,
  onApplyRun,
  onDeleteRun,
  onClearAllRuns,
  preferences,
}) => {
  const [selectedRunIds, setSelectedRunIds] = useState<string[]>(
    historyRuns.slice(0, 2).map((r) => r.id)
  );
  const [filterDistrict, setFilterDistrict] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copiedMemo, setCopiedMemo] = useState<boolean>(false);

  const toggleSelectRun = (id: string) => {
    setSelectedRunIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        if (prev.length >= 4) return [...prev.slice(1), id]; // Cap at 4 comparison slots
        return [...prev, id];
      }
    });
  };

  const filteredRuns = historyRuns.filter((run) => {
    if (filterDistrict !== "all" && run.districtId !== filterDistrict) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = run.name.toLowerCase().includes(q);
      const matchDistrict = run.districtName.toLowerCase().includes(q);
      const matchNotes = run.notes?.toLowerCase().includes(q);
      return matchName || matchDistrict || matchNotes;
    }
    return true;
  });

  const comparedRuns = historyRuns.filter((run) => selectedRunIds.includes(run.id));

  const formatTemp = (tempC: number, tempF: number) => {
    return preferences.tempUnit === "F" ? `${tempF}°F` : `${tempC}°C`;
  };

  const formatDeltaTemp = (deltaC: number, deltaF: number) => {
    return preferences.tempUnit === "F" ? `-${deltaF}°F` : `-${deltaC}°C`;
  };

  const formatCurrency = (amount: number) => {
    const sym = preferences.currency === "EUR" ? "€" : preferences.currency === "GBP" ? "£" : "$";
    return `${sym}${amount.toLocaleString()}`;
  };

  const handleCopyComparisonReport = () => {
    if (comparedRuns.length === 0) return;
    let text = `# EcoCity Heat Planner — Simulation Runs Side-by-Side Comparison\n`;
    text += `Generated on ${new Date().toLocaleString()}\n\n`;

    comparedRuns.forEach((run, idx) => {
      text += `### Run #${run.runNumber}: ${run.name} (${run.districtName})\n`;
      text += `- Date: ${new Date(run.timestamp).toLocaleString()}\n`;
      text += `- Net Cooling: -${run.metrics.tempReductionC}°C / -${run.metrics.tempReductionF}°F\n`;
      text += `- Simulated LST: ${run.metrics.postInterventionTempC}°C\n`;
      text += `- Annual Grid Savings: ${run.metrics.annualEnergySavingsMwh.toLocaleString()} MWh ($${run.metrics.annualCostSavingsUsd.toLocaleString()}/yr)\n`;
      text += `- Estimated CapEx: $${run.metrics.capitalCostEstimateUsd.toLocaleString()} (Payback: ${run.metrics.paybackPeriodYears} yrs)\n`;
      text += `- Carbon Offset: ${run.metrics.carbonOffsetTonsYear.toLocaleString()} tCO2e/yr\n`;
      text += `- Interventions: Canopy +${run.interventions.canopyCoveragePct}%, Cool Roofs +${run.interventions.coolRoofAdoptionPct}%, Permeable +${run.interventions.permeablePavementPct}%, Misting +${run.interventions.waterMistingDensityPct}%\n\n`;
    });

    navigator.clipboard.writeText(text);
    setCopiedMemo(true);
    setTimeout(() => setCopiedMemo(false), 2500);
  };

  return (
    <div className="flex-1 h-full overflow-y-auto p-4 sm:p-6 bg-[#05080c] text-slate-100 space-y-6 select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#142332] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#0a1824] border border-[#162e44] text-emerald-400">
              <History className="h-5 w-5" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-100">
              Simulation Runs History & Timeline Comparison
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Track consecutive microclimate runs, analyze thermodynamic divergence, and compare up to 4 scenarios side-by-side.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {comparedRuns.length >= 2 && (
            <button
              onClick={handleCopyComparisonReport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0e2621] hover:bg-[#13352e] text-emerald-400 border border-emerald-500/40 text-xs font-semibold transition-all cursor-pointer shadow-md"
            >
              {copiedMemo ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedMemo ? "Copied Diff!" : "Export Comparison"}</span>
            </button>
          )}

          {historyRuns.length > 0 && (
            <button
              onClick={onClearAllRuns}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#140b0f] hover:bg-[#201016] text-rose-400 border border-rose-500/30 text-xs font-medium transition-colors cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>

      {/* Side-by-Side Comparison Panel (If 2+ runs selected) */}
      {comparedRuns.length >= 2 ? (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#080f17] border border-[#182c40] space-y-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-[#142332] pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-emerald-400" />
              <span className="text-xs sm:text-sm font-bold text-slate-100">
                Side-by-Side Outcome Comparison ({comparedRuns.length} Scenarios Selected)
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Select/Deselect checkboxes in the timeline below to change comparison slots
            </span>
          </div>

          {/* Comparison Cards Grid */}
          <div className={`grid grid-cols-1 md:grid-cols-${comparedRuns.length} gap-3`}>
            {comparedRuns.map((run, idx) => (
              <div
                key={run.id}
                className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                  idx === 0
                    ? "bg-[#07131e] border-cyan-500/50 shadow-lg shadow-cyan-950/20"
                    : idx === 1
                    ? "bg-[#071a17] border-emerald-500/50 shadow-lg shadow-emerald-950/20"
                    : "bg-[#0b131c] border-[#182a3c]"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#0e202f] text-slate-300 border border-[#183248]">
                          Run #{run.runNumber}
                        </span>
                        {run.isBaseline && (
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#201015] text-rose-300 border border-rose-500/30">
                            Baseline
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-slate-100 mt-1 leading-snug">
                        {run.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono">{run.districtName}</p>
                    </div>

                    <button
                      onClick={() => onApplyRun(run)}
                      className="px-2 py-1 rounded bg-[#0d2822] hover:bg-[#133e35] text-emerald-400 text-[10px] font-bold border border-emerald-500/40 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <Play className="h-3 w-3 fill-current" />
                      <span>Apply</span>
                    </button>
                  </div>

                  {/* High Level Key Metric Stat */}
                  <div className="p-3 rounded-lg bg-[#050b10] border border-[#12202e] space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                      Net Cooling Delta
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold font-mono text-emerald-400">
                        {formatDeltaTemp(run.metrics.tempReductionC, run.metrics.tempReductionF)}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        (Sim: {formatTemp(run.metrics.postInterventionTempC, run.metrics.postInterventionTempF)})
                      </span>
                    </div>
                  </div>

                  {/* Metric Comparison Table */}
                  <div className="space-y-2 text-[11px] font-mono">
                    <div className="flex justify-between py-1 border-b border-[#12202e]">
                      <span className="text-slate-400">Avoided Energy:</span>
                      <span className="text-cyan-300 font-bold">
                        {run.metrics.annualEnergySavingsMwh.toLocaleString()} MWh/yr
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-[#12202e]">
                      <span className="text-slate-400">Annual Savings:</span>
                      <span className="text-emerald-300 font-bold">
                        {formatCurrency(run.metrics.annualCostSavingsUsd)}/yr
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-[#12202e]">
                      <span className="text-slate-400">Estimated CapEx:</span>
                      <span className="text-slate-200">
                        {formatCurrency(run.metrics.capitalCostEstimateUsd)}
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-[#12202e]">
                      <span className="text-slate-400">Simple Payback:</span>
                      <span className="text-amber-300 font-bold">
                        {run.metrics.paybackPeriodYears} Years
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-[#12202e]">
                      <span className="text-slate-400">Carbon Offset:</span>
                      <span className="text-emerald-400 font-bold">
                        {run.metrics.carbonOffsetTonsYear.toLocaleString()} tCO₂e
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-[#12202e]">
                      <span className="text-slate-400">Vulnerability:</span>
                      <span className="text-slate-200">
                        {run.metrics.heatStressReductionScore} / 100
                      </span>
                    </div>
                  </div>

                  {/* Interventions Profile Bar */}
                  <div className="pt-1 space-y-1.5">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans font-semibold">
                      Interventions Applied
                    </span>
                    <div className="grid grid-cols-2 gap-1 text-[10px] font-mono text-slate-300">
                      <div className="p-1 rounded bg-[#050b10] border border-[#12202e]">
                        🌳 Trees: <span className="text-emerald-400 font-bold">+{run.interventions.canopyCoveragePct}%</span>
                      </div>
                      <div className="p-1 rounded bg-[#050b10] border border-[#12202e]">
                        ☀️ Roofs: <span className="text-sky-400 font-bold">+{run.interventions.coolRoofAdoptionPct}%</span>
                      </div>
                      <div className="p-1 rounded bg-[#050b10] border border-[#12202e]">
                        🧱 Pave: <span className="text-teal-400 font-bold">+{run.interventions.permeablePavementPct}%</span>
                      </div>
                      <div className="p-1 rounded bg-[#050b10] border border-[#12202e]">
                        💧 Mist: <span className="text-cyan-400 font-bold">+{run.interventions.waterMistingDensityPct}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-[#12202e] flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>{new Date(run.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span>{run.spatialInterventions.length} spatial pins</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-[#081018] border border-[#142332] text-xs text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CheckSquare className="h-4 w-4 text-emerald-400" />
            <span>Select at least 2 simulation runs below using the checkboxes to trigger side-by-side comparison.</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            {selectedRunIds.length} of 4 slots selected
          </span>
        </div>
      )}

      {/* Timeline Controls & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#080e15] p-3 rounded-xl border border-[#142332]">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search runs by title or district..."
            className="bg-[#050b10] border border-[#162738] rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-400 w-full sm:w-64 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 w-full sm:w-auto justify-end">
          <span>{filteredRuns.length} Simulation Runs Logged</span>
        </div>
      </div>

      {/* History Timeline Stream */}
      <div className="relative border-l-2 border-[#162738] ml-4 pl-6 space-y-4">
        {filteredRuns.map((run, index) => {
          const isSelected = selectedRunIds.includes(run.id);

          return (
            <div key={run.id} className="relative group">
              {/* Timeline Node Icon Pin */}
              <div
                onClick={() => toggleSelectRun(run.id)}
                className={`absolute -left-[35px] top-3.5 w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all ${
                  isSelected
                    ? "bg-emerald-500 border-[#05080c] text-[#05080c] shadow-lg shadow-emerald-500/30 scale-110"
                    : "bg-[#091520] border-[#1f374e] text-slate-400 group-hover:border-emerald-400 group-hover:text-white"
                }`}
                title="Toggle comparison checkbox"
              >
                {isSelected ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : <span className="text-[10px] font-mono">{run.runNumber}</span>}
              </div>

              {/* Run Card Box */}
              <div className={`p-4 rounded-xl border transition-all ${
                isSelected
                  ? "bg-[#07131d] border-emerald-500/60 shadow-xl"
                  : "bg-[#080e15] border-[#142332] hover:border-[#1d354c] hover:bg-[#0b141f]"
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => toggleSelectRun(run.id)}
                      className="text-slate-400 hover:text-emerald-400 cursor-pointer"
                      title="Select for comparison"
                    >
                      {isSelected ? (
                        <CheckSquare className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <Square className="h-4 w-4 text-slate-500" />
                      )}
                    </button>

                    <span className="text-xs font-mono font-bold text-slate-300 px-2 py-0.5 rounded bg-[#0d1b28] border border-[#162e44]">
                      Run #{run.runNumber}
                    </span>

                    <h3 className="text-xs sm:text-sm font-bold text-slate-100">
                      {run.name}
                    </h3>

                    {run.isBaseline && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-800/40">
                        Baseline Reference
                      </span>
                    )}

                    {run.tags && run.tags.map((tag) => (
                      <span key={tag} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#0a1824] text-cyan-300 border border-[#142e44]">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="h-3 w-3 text-slate-500" />
                      {new Date(run.timestamp).toLocaleDateString()} {new Date(run.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    <button
                      onClick={() => onApplyRun(run)}
                      className="px-2.5 py-1 rounded-lg bg-[#0e2721] hover:bg-[#143a31] text-emerald-400 text-xs font-bold border border-emerald-500/40 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Restore parameters and pins into the live simulator"
                    >
                      <Play className="h-3 w-3 fill-current" />
                      <span>Load Scenario</span>
                    </button>

                    <button
                      onClick={() => onDeleteRun(run.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-[#140b0f] transition-colors cursor-pointer"
                      title="Delete run from history"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Metrics Summary Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-[#12202e] text-[11px] font-mono">
                  <div className="p-2 rounded bg-[#050b10] border border-[#111f2d]">
                    <span className="text-slate-500 block text-[10px]">Net Cooling:</span>
                    <span className="text-emerald-400 font-bold">
                      {formatDeltaTemp(run.metrics.tempReductionC, run.metrics.tempReductionF)}
                    </span>
                  </div>

                  <div className="p-2 rounded bg-[#050b10] border border-[#111f2d]">
                    <span className="text-slate-500 block text-[10px]">Avoided Energy:</span>
                    <span className="text-cyan-300 font-bold">
                      {run.metrics.annualEnergySavingsMwh.toLocaleString()} MWh/yr
                    </span>
                  </div>

                  <div className="p-2 rounded bg-[#050b10] border border-[#111f2d]">
                    <span className="text-slate-500 block text-[10px]">CapEx Estimate:</span>
                    <span className="text-slate-200">
                      {formatCurrency(run.metrics.capitalCostEstimateUsd)}
                    </span>
                  </div>

                  <div className="p-2 rounded bg-[#050b10] border border-[#111f2d]">
                    <span className="text-slate-500 block text-[10px]">Target District:</span>
                    <span className="text-slate-300 truncate block">
                      {run.districtName}
                    </span>
                  </div>
                </div>

                {run.notes && (
                  <p className="text-[11px] text-slate-400 mt-2 italic font-sans">
                    "{run.notes}"
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
