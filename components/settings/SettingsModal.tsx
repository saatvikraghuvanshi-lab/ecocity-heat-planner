import React, { useState, useRef } from "react";
import { 
  Settings, 
  X, 
  Sliders, 
  Map, 
  DollarSign, 
  Thermometer, 
  Volume2, 
  VolumeX, 
  Download, 
  Upload, 
  Trash2, 
  RotateCcw, 
  Check, 
  ShieldCheck, 
  Radio, 
  Layers, 
  Activity 
} from "lucide-react";
import { UserPreferences, SimulationRunRecord } from "@/types/dashboard";
import { saveUserProfileToDB } from "@/lib/simulationEngine";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences;
  onChangePreferences: (prefs: UserPreferences) => void;
  simulationHistory: SimulationRunRecord[];
  onImportHistory: (importedRuns: SimulationRunRecord[]) => void;
  onClearHistory: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  preferences,
  onChangePreferences,
  simulationHistory,
  onImportHistory,
  onClearHistory,
}) => {
  const [activeTab, setActiveTab] = useState<"general" | "simulation" | "data">("general");
  const [toastFeedback, setToastFeedback] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleUpdate = <K extends keyof UserPreferences>(key: K, val: UserPreferences[K]) => {
    const updated = {
      ...preferences,
      [key]: val,
    };
    onChangePreferences(updated);
    setToastFeedback("Preferences updated");
    setTimeout(() => setToastFeedback(null), 2000);
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(simulationHistory, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `ecocity_simulation_history_${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setToastFeedback("History exported to JSON file");
    setTimeout(() => setToastFeedback(null), 2500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onImportHistory(parsed);
          setToastFeedback(`Imported ${parsed.length} simulation runs`);
        } else {
          setToastFeedback("Invalid JSON format");
        }
      } catch {
        setToastFeedback("Failed to parse JSON file");
      }
      setTimeout(() => setToastFeedback(null), 3000);
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in select-none">
      <div className="relative w-full max-w-md sm:max-w-lg bg-[#070e16] border border-[#182c40] rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#142332] flex items-center justify-between bg-[#091420]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#0d2232] border border-[#183955] text-cyan-400">
              <Settings className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Application Settings</h3>
              <p className="text-[11px] text-slate-400">
                Thermodynamic parameters, units, geospatial rendering, and data backup
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#12202e] transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#142332] bg-[#050b10] px-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("general")}
            className={`py-3 border-b-2 transition-all mr-6 cursor-pointer ${
              activeTab === "general"
                ? "border-cyan-400 text-cyan-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Units & Display
          </button>
          <button
            onClick={() => setActiveTab("simulation")}
            className={`py-3 border-b-2 transition-all mr-6 cursor-pointer ${
              activeTab === "simulation"
                ? "border-cyan-400 text-cyan-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Simulation & Map
          </button>
          <button
            onClick={() => setActiveTab("data")}
            className={`py-3 border-b-2 transition-all mr-6 cursor-pointer ${
              activeTab === "data"
                ? "border-cyan-400 text-cyan-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Data & Backup
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {toastFeedback && (
            <div className="p-2.5 rounded-lg bg-[#09221b] border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-400" />
              <span>{toastFeedback}</span>
            </div>
          )}

          {activeTab === "general" && (
            <div className="space-y-4">
              {/* Temperature Unit */}
              <div className="p-3.5 rounded-xl bg-[#050b10] border border-[#142332] flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 font-semibold text-slate-200">
                    <Thermometer className="h-4 w-4 text-emerald-400" />
                    <span>Temperature Metric Unit</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Global temperature unit used across maps, metrics, and cards
                  </p>
                </div>
                <div className="flex rounded-lg bg-[#0a1520] border border-[#162a3e] p-0.5">
                  <button
                    onClick={() => handleUpdate("tempUnit", "C")}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                      preferences.tempUnit === "C"
                        ? "bg-emerald-500 text-[#05080c] shadow"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    °C Celsius
                  </button>
                  <button
                    onClick={() => handleUpdate("tempUnit", "F")}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                      preferences.tempUnit === "F"
                        ? "bg-emerald-500 text-[#05080c] shadow"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    °F Fahrenheit
                  </button>
                </div>
              </div>

              {/* Currency Selector */}
              <div className="p-3.5 rounded-xl bg-[#050b10] border border-[#142332] flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 font-semibold text-slate-200">
                    <DollarSign className="h-4 w-4 text-cyan-400" />
                    <span>Cost & CapEx Currency</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Currency denomination for capital expenditure and energy ROI
                  </p>
                </div>
                <select
                  value={preferences.currency}
                  onChange={(e) => handleUpdate("currency", e.target.value as any)}
                  className="bg-[#0a1520] border border-[#162a3e] rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 font-mono cursor-pointer"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>

              {/* Audio & Haptic Cues */}
              <div className="p-3.5 rounded-xl bg-[#050b10] border border-[#142332] flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 font-semibold text-slate-200">
                    {preferences.audioEffects ? <Volume2 className="h-4 w-4 text-emerald-400" /> : <VolumeX className="h-4 w-4 text-slate-500" />}
                    <span>Sound & Simulation Cues</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Acoustic feedback tone when thermodynamic runs complete
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.audioEffects}
                  onChange={(e) => handleUpdate("audioEffects", e.target.checked)}
                  className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>
          )}

          {activeTab === "simulation" && (
            <div className="space-y-4">
              {/* Default Tile Style */}
              <div className="p-3.5 rounded-xl bg-[#050b10] border border-[#142332] space-y-2">
                <div className="flex items-center gap-2 font-semibold text-slate-200">
                  <Map className="h-4 w-4 text-emerald-400" />
                  <span>Default Basemap Style</span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {[
                    { id: "dark", label: "CartoDB Dark" },
                    { id: "osm", label: "OpenStreetMap" },
                    { id: "satellite", label: "ESRI Satellite" },
                  ].map((style) => (
                    <button
                      key={style.id}
                      onClick={() => handleUpdate("defaultTile", style.id as any)}
                      className={`p-2.5 rounded-lg border text-center font-medium transition-all cursor-pointer ${
                        preferences.defaultTile === style.id
                          ? "bg-[#0c2232] border-cyan-400 text-cyan-300 font-bold"
                          : "bg-[#060c12] border-[#142332] text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid Resolution */}
              <div className="p-3.5 rounded-xl bg-[#050b10] border border-[#142332] flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 font-semibold text-slate-200">
                    <Layers className="h-4 w-4 text-cyan-400" />
                    <span>Spatial Grid Mesh Density</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Fine mesh (50m) provides granular thermodynamic micro-eddies
                  </p>
                </div>
                <select
                  value={preferences.gridResolution}
                  onChange={(e) => handleUpdate("gridResolution", e.target.value as any)}
                  className="bg-[#0a1520] border border-[#162a3e] rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  <option value="standard">Standard (150m)</option>
                  <option value="high">Ultra-Fine (50m)</option>
                </select>
              </div>

              {/* Auto Save History */}
              <div className="p-3.5 rounded-xl bg-[#050b10] border border-[#142332] flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 font-semibold text-slate-200">
                    <Activity className="h-4 w-4 text-emerald-400" />
                    <span>Auto-Log Simulation Runs</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Automatically append runs to the timeline comparison log
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.autoSaveHistory}
                  onChange={(e) => handleUpdate("autoSaveHistory", e.target.checked)}
                  className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>
          )}

          {activeTab === "data" && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[#050b10] border border-[#142332] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">Backup Simulation Runs</span>
                  <span className="text-[11px] font-mono text-slate-400">{simulationHistory.length} runs stored</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Export complete simulation records and thermodynamic parameters to a standalone JSON file.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleExportJSON}
                    className="flex-1 py-2 rounded-lg bg-[#0e2721] hover:bg-[#143a31] text-emerald-400 border border-emerald-500/40 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Export History JSON</span>
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-2 rounded-lg bg-[#0d1e2d] hover:bg-[#132c42] text-cyan-400 border border-cyan-500/40 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>Import JSON</span>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".json"
                    className="hidden"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#12080c] border border-rose-900/40 space-y-2">
                <span className="font-semibold text-rose-300">Clear Local Database</span>
                <p className="text-[11px] text-slate-400">
                  Erase stored simulation history and reset simulator state to initial defaults.
                </p>
                <button
                  onClick={onClearHistory}
                  className="w-full py-2 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/50 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Clear Simulation History</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
