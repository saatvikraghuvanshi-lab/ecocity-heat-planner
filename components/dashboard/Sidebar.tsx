import React, { useState } from "react";
import { 
  Trees, 
  Sun, 
  Layers, 
  Sparkles, 
  RotateCcw, 
  Play, 
  ChevronDown,
  ChevronUp,
  LayoutDashboard,
  BarChart3,
  Share2,
  Sliders,
  User,
  CheckCircle2,
  Droplets,
  Building2,
  ChevronRight,
  History,
  MapPin,
  Settings as SettingsIcon,
  Radio,
  Clock,
  ArrowRight,
  Plus
} from "lucide-react";
import { 
  District, 
  InterventionsState, 
  CalculatedMetrics, 
  SimulationRunRecord, 
  UserProfile, 
  LiveLocationData 
} from "@/types/dashboard";
import { DISTRICTS } from "@/lib/simulationEngine";

interface SidebarProps {
  activeDistrict: District;
  onSelectDistrict: (district: District) => void;
  activeNavTab: "dashboard" | "layers" | "analytics" | "history" | "export";
  onChangeNavTab: (tab: "dashboard" | "layers" | "analytics" | "history" | "export") => void;
  interventions: InterventionsState;
  onChangeInterventions: (updater: (prev: InterventionsState) => InterventionsState) => void;
  onRunSimulation: () => void;
  isSimulating: boolean;
  onResetDefaults: () => void;
  metrics: CalculatedMetrics;
  historyRuns: SimulationRunRecord[];
  onApplyHistoryRun: (run: SimulationRunRecord) => void;
  user: UserProfile;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  onOpenLiveLocation: () => void;
  liveLocationData: LiveLocationData | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeDistrict,
  onSelectDistrict,
  activeNavTab,
  onChangeNavTab,
  interventions,
  onChangeInterventions,
  onRunSimulation,
  isSimulating,
  onResetDefaults,
  metrics,
  historyRuns,
  onApplyHistoryRun,
  user,
  onOpenProfile,
  onOpenSettings,
  onOpenLiveLocation,
  liveLocationData,
}) => {
  const [showHistoryAccordion, setShowHistoryAccordion] = useState<boolean>(true);

  const handleSliderChange = (key: keyof InterventionsState, value: number) => {
    onChangeInterventions((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <aside 
      id="ecocity-sidebar"
      className="w-72 sm:w-80 bg-[#070b10] border-r border-[#111923] flex flex-col h-full shrink-0 text-slate-200 z-30 select-none"
    >
      {/* Top Brand Header & Settings Gear */}
      <div className="p-4 pb-2 flex items-center justify-between border-b border-[#0f1722]">
        <div className="flex items-center gap-2.5">
          <span className="text-emerald-400 font-serif font-bold text-lg tracking-tight lowercase">
            eco
          </span>
          <h1 className="text-emerald-400 font-semibold text-base tracking-tight">
            EcoCity Heat Planner
          </h1>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onOpenSettings}
            title="Settings & Units"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#121f2d] transition-colors cursor-pointer"
          >
            <SettingsIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* District / Sector Dropdown & Live GPS Trigger */}
      <div className="px-4 pt-3 pb-2 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
            Target Sector
          </span>
          <button
            onClick={onOpenLiveLocation}
            className={`text-[10px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1 transition-all cursor-pointer ${
              liveLocationData?.isActive
                ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 animate-pulse"
                : "bg-[#0c1822] text-cyan-400 hover:bg-[#112536] border border-[#162d42]"
            }`}
            title="Use device GPS coordinates"
          >
            <MapPin className="h-3 w-3" />
            <span>{liveLocationData?.isActive ? "Live GPS Active" : "📍 Live Location"}</span>
          </button>
        </div>

        <div className="relative">
          <select
            id="sector-dropdown-select"
            value={activeDistrict.id}
            onChange={(e) => {
              const found = DISTRICTS.find((d) => d.id === e.target.value);
              if (found) onSelectDistrict(found);
            }}
            className="w-full appearance-none bg-[#0c131a] hover:bg-[#101924] text-slate-100 text-xs font-medium py-2.5 px-3 pr-8 rounded-lg border border-[#162330] focus:outline-none focus:border-emerald-500/50 transition-colors cursor-pointer"
          >
            {DISTRICTS.map((d) => (
              <option key={d.id} value={d.id} className="bg-[#0c131a] text-slate-200">
                {d.name}
              </option>
            ))}
            {activeDistrict.code === "GPS-LIVE" && (
              <option value={activeDistrict.id} className="bg-[#0c131a] text-emerald-400 font-bold">
                📍 {activeDistrict.name}
              </option>
            )}
          </select>
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 flex items-center gap-1">
            <span className="text-[10px] text-slate-500 font-mono">{activeDistrict.code}</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>

      {/* Main Navigation Links */}
      <nav className="px-3 py-2 space-y-1">
        <button
          id="nav-dashboard-btn"
          onClick={() => onChangeNavTab("dashboard")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
            activeNavTab === "dashboard"
              ? "bg-[#0f1d1f] text-emerald-400 border-l-2 border-emerald-400 font-semibold shadow-inner"
              : "text-slate-400 hover:text-slate-200 hover:bg-[#0c131c]"
          }`}
        >
          <LayoutDashboard className="h-4 w-4" />
          <span>Dashboard</span>
        </button>

        <button
          id="nav-history-btn"
          onClick={() => onChangeNavTab("history")}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
            activeNavTab === "history"
              ? "bg-[#0f1d1f] text-emerald-400 border-l-2 border-emerald-400 font-semibold shadow-inner"
              : "text-slate-400 hover:text-slate-200 hover:bg-[#0c131c]"
          }`}
        >
          <div className="flex items-center gap-3">
            <History className="h-4 w-4" />
            <span>Run History & Compare</span>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[#112432] text-slate-300">
            {historyRuns.length}
          </span>
        </button>

        <button
          id="nav-layers-btn"
          onClick={() => onChangeNavTab("layers")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
            activeNavTab === "layers"
              ? "bg-[#0f1d1f] text-emerald-400 border-l-2 border-emerald-400 font-semibold shadow-inner"
              : "text-slate-400 hover:text-slate-200 hover:bg-[#0c131c]"
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Thermal Layers</span>
        </button>

        <button
          id="nav-analytics-btn"
          onClick={() => onChangeNavTab("analytics")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
            activeNavTab === "analytics"
              ? "bg-[#0f1d1f] text-emerald-400 border-l-2 border-emerald-400 font-semibold shadow-inner"
              : "text-slate-400 hover:text-slate-200 hover:bg-[#0c131c]"
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          <span>Analytics</span>
        </button>

        <button
          id="nav-export-btn"
          onClick={() => onChangeNavTab("export")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
            activeNavTab === "export"
              ? "bg-[#0f1d1f] text-emerald-400 border-l-2 border-emerald-400 font-semibold shadow-inner"
              : "text-slate-400 hover:text-slate-200 hover:bg-[#0c131c]"
          }`}
        >
          <Share2 className="h-4 w-4" />
          <span>Export</span>
        </button>
      </nav>

      {/* Subtle Horizontal Divider */}
      <div className="px-4 my-1">
        <div className="h-[1px] bg-[#141f2b] w-full" />
      </div>

      {/* Scrollable Center: Simulation Controls & Quick Runs Log */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4">
        {/* Simulation Controls Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
              Simulation Controls
            </span>
            <button
              onClick={onResetDefaults}
              title="Reset controls"
              className="text-[10px] text-slate-500 hover:text-emerald-400 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* 1. Tree Canopy Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-normal">Tree Canopy</span>
              <span className="font-mono text-emerald-400 font-semibold">
                +{interventions.canopyCoveragePct}%
              </span>
            </div>
            <input
              id="slider-tree-canopy"
              type="range"
              min={0}
              max={100}
              step={1}
              value={interventions.canopyCoveragePct}
              onChange={(e) => handleSliderChange("canopyCoveragePct", Number(e.target.value))}
              className="w-full h-1 bg-[#14202c] rounded-lg appearance-none cursor-pointer accent-emerald-400 focus:outline-none"
            />
          </div>

          {/* 2. Green Roofs Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-normal">Green Roofs</span>
              <span className="font-mono text-emerald-400 font-semibold">
                +{interventions.coolRoofAdoptionPct}%
              </span>
            </div>
            <input
              id="slider-green-roofs"
              type="range"
              min={0}
              max={100}
              step={1}
              value={interventions.coolRoofAdoptionPct}
              onChange={(e) => handleSliderChange("coolRoofAdoptionPct", Number(e.target.value))}
              className="w-full h-1 bg-[#14202c] rounded-lg appearance-none cursor-pointer accent-emerald-400 focus:outline-none"
            />
          </div>

          {/* 3. Albedo Pavements Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-normal">Albedo Pavements</span>
              <span className="font-mono text-emerald-400 font-semibold">
                +{interventions.permeablePavementPct}%
              </span>
            </div>
            <input
              id="slider-albedo-pavements"
              type="range"
              min={0}
              max={100}
              step={1}
              value={interventions.permeablePavementPct}
              onChange={(e) => handleSliderChange("permeablePavementPct", Number(e.target.value))}
              className="w-full h-1 bg-[#14202c] rounded-lg appearance-none cursor-pointer accent-emerald-400 focus:outline-none"
            />
          </div>

          {/* Secondary Controls */}
          <div className="pt-2 border-t border-[#121b24] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">Evaporative Misting</span>
              <span className="font-mono text-cyan-400 text-xs">
                +{interventions.waterMistingDensityPct}%
              </span>
            </div>
            <input
              id="slider-water-misting"
              type="range"
              min={0}
              max={100}
              step={1}
              value={interventions.waterMistingDensityPct}
              onChange={(e) => handleSliderChange("waterMistingDensityPct", Number(e.target.value))}
              className="w-full h-1 bg-[#14202c] rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-400 text-[11px]">Vertical Living Walls</span>
              <span className="font-mono text-emerald-300 text-xs">
                +{interventions.verticalGardensPct}%
              </span>
            </div>
            <input
              id="slider-vertical-gardens"
              type="range"
              min={0}
              max={100}
              step={1}
              value={interventions.verticalGardensPct}
              onChange={(e) => handleSliderChange("verticalGardensPct", Number(e.target.value))}
              className="w-full h-1 bg-[#14202c] rounded-lg appearance-none cursor-pointer accent-emerald-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Sidebar Section: Previous Simulation Runs Quick Log */}
        <div className="pt-2 border-t border-[#141f2b] space-y-2">
          <div 
            onClick={() => setShowHistoryAccordion(!showHistoryAccordion)}
            className="flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-1.5">
              <History className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-[11px] font-semibold text-slate-300 tracking-wider uppercase group-hover:text-emerald-300">
                Previous Runs Log
              </span>
            </div>
            <div className="flex items-center gap-1 text-slate-500">
              <span className="text-[10px] font-mono">{historyRuns.length}</span>
              {showHistoryAccordion ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </div>
          </div>

          {showHistoryAccordion && (
            <div className="space-y-1.5">
              {historyRuns.slice(0, 3).map((run) => (
                <div
                  key={run.id}
                  className="p-2 rounded-lg bg-[#0a121a] hover:bg-[#0f1b26] border border-[#132230] transition-all flex items-center justify-between group"
                >
                  <div className="space-y-0.5 overflow-hidden pr-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-mono font-bold px-1 rounded bg-[#070e16] text-slate-400">
                        #{run.runNumber}
                      </span>
                      <span className="text-[11px] font-medium text-slate-200 truncate block">
                        {run.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                      <span className="text-emerald-400 font-bold">
                        -{run.metrics.tempReductionC}°C
                      </span>
                      <span>• {run.districtCode}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onApplyHistoryRun(run)}
                    className="p-1 rounded bg-[#0e2721] text-emerald-400 hover:bg-[#143a31] transition-colors cursor-pointer shrink-0 opacity-80 group-hover:opacity-100"
                    title="Load run into simulator"
                  >
                    <Play className="h-3 w-3 fill-current" />
                  </button>
                </div>
              ))}

              <button
                onClick={() => onChangeNavTab("history")}
                className="w-full py-1 text-center text-[10px] text-emerald-400 hover:underline flex items-center justify-center gap-1 cursor-pointer font-medium"
              >
                <span>View Full Timeline & Compare</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Action Button & User Profile Footer */}
      <div className="p-4 border-t border-[#111923] space-y-3 bg-[#060a0e]">
        {/* Main CTA Button: Run Heat Simulation */}
        <button
          id="run-simulation-main-btn"
          onClick={onRunSimulation}
          disabled={isSimulating}
          className="w-full py-3 px-4 rounded-lg bg-[#2dd4bf] hover:bg-[#34d399] active:bg-[#22c55e] text-[#041c16] font-bold text-xs tracking-wide shadow-lg shadow-emerald-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
        >
          {isSimulating ? (
            <>
              <span className="w-3.5 h-3.5 rounded-full border-2 border-[#041c16] border-t-transparent animate-spin" />
              <span>Simulating Microclimate...</span>
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Run Heat Simulation</span>
            </>
          )}
        </button>

        {/* User Account / Profile Footer */}
        <div 
          onClick={onOpenProfile}
          className="flex items-center gap-2.5 pt-1 text-slate-300 hover:bg-[#0c1520] p-1.5 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-[#162738]"
          title="Manage user account & profile"
        >
          <img
            src={user.avatar}
            alt={user.name}
            className="w-7 h-7 rounded-full object-cover border border-emerald-400 shrink-0"
          />
          <div className="leading-tight overflow-hidden flex-1">
            <p className="text-[11px] font-medium text-slate-200 truncate">
              {user.name}
            </p>
            <p className="text-[10px] text-slate-500 font-medium truncate">
              {user.role}
            </p>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-slate-500 shrink-0" />
        </div>
      </div>
    </aside>
  );
};
