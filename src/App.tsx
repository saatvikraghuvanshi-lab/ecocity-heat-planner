/**
 * @file src/App.tsx
 * @description EcoCity Heat Planner Dashboard with Leaflet geospatial intelligence,
 * simulation run history timeline & side-by-side comparison, live GPS microclimate location,
 * user authentication/account management, and global system settings.
 */

import React, { useState, useMemo } from "react";
import { 
  District, 
  InterventionsState, 
  SpatialIntervention, 
  SavedSimulationPlan,
  SimulationRunRecord,
  UserProfile,
  LiveLocationData,
  UserPreferences
} from "@/types/dashboard";
import { 
  DISTRICTS, 
  INITIAL_SPATIAL_INTERVENTIONS, 
  calculateUhiMetrics,
  loadSimulationHistoryFromDB,
  saveSimulationRunToDB,
  deleteSimulationRunFromDB,
  clearSimulationHistoryDB,
  loadUserProfileFromDB,
  saveUserProfileToDB
} from "@/lib/simulationEngine";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { LeafletGeospatialMap } from "@/components/map/LeafletGeospatialMap";
import { ThermalLayersView } from "@/components/dashboard/ThermalLayersView";
import { AnalyticsView } from "@/components/dashboard/AnalyticsView";
import { ExportView } from "@/components/dashboard/ExportView";
import { HistoryTimelineView } from "@/components/dashboard/HistoryTimelineView";
import { AuthModal } from "@/components/auth/AuthModal";
import { UserProfileModal } from "@/components/auth/UserProfileModal";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { LiveLocationModal } from "@/components/map/LiveLocationModal";

function playMicroclimateAcousticChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(540, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(820, ctx.currentTime + 0.22);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch {
    // Graceful fallback for non-interacted audio context
  }
}

export default function App() {
  const [activeDistrict, setActiveDistrict] = useState<District>(DISTRICTS[0]);
  
  const [activeNavTab, setActiveNavTab] = useState<"dashboard" | "layers" | "analytics" | "history" | "export">("dashboard");
  const [spatialInterventions, setSpatialInterventions] = useState<SpatialIntervention[]>(INITIAL_SPATIAL_INTERVENTIONS || []);

  const [interventions, setInterventions] = useState<InterventionsState>({
    canopyCoveragePct: 15,
    coolRoofAdoptionPct: 30,
    permeablePavementPct: 25,
    waterMistingDensityPct: 15,
    verticalGardensPct: 20,
  });

  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // History Runs State
  const [historyRuns, setHistoryRuns] = useState<SimulationRunRecord[]>(() => loadSimulationHistoryFromDB?.() || []);

  // User Profile & Settings State
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const loaded = loadUserProfileFromDB?.();
    if (loaded) return loaded;
    return {
      id: "usr_default",
      name: "Urban Planner",
      email: "planner@ecocity.gov",
      role: "Lead Environmental Architect",
      avatar: "/avatars/default.png",
      organization: "EcoCity Planning Dept",
      joinedAt: "2026-01-01",
      simulationsRunCount: 12,
      preferences: {
        audioEffects: true,
        autoSaveHistory: true,
        mapTileStyle: "dark",
        temperatureUnit: "C",
        tempUnit: "C",
        defaultTile: "dark",
        gridResolution: "standard",
        currency: "USD",
        showLivePulse: true,
      }
    };
  });
  // Live Location State
  const [liveLocationData, setLiveLocationData] = useState<LiveLocationData | null>(null);

  // Modal Dialog States
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [isLiveLocationModalOpen, setIsLiveLocationModalOpen] = useState<boolean>(false);

  const metrics = useMemo(() => {
    return calculateUhiMetrics(activeDistrict, interventions, spatialInterventions);
  }, [activeDistrict, interventions, spatialInterventions]);

  const handleResetDefaults = () => {
    setInterventions({
      canopyCoveragePct: 0,
      coolRoofAdoptionPct: 0,
      permeablePavementPct: 0,
      waterMistingDensityPct: 0,
      verticalGardensPct: 0,
    });
    setSpatialInterventions([]);
    setToastMessage("Controls and spatial pins reset to baseline");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setToastMessage("Simulating microclimate thermodynamic response...");

    setTimeout(() => {
      setIsSimulating(false);
      
      if (currentUser?.preferences?.audioEffects) {
        playMicroclimateAcousticChime();
      }

      // Automatically record simulation run to history timeline
      if (currentUser?.preferences?.autoSaveHistory) {
        const nextRunNum = (historyRuns[0]?.runNumber || 0) + 1;
        const newRun: SimulationRunRecord = {
          id: `run-${Date.now()}`,
          runNumber: nextRunNum,
          name: `Simulation Run #${nextRunNum} • ${activeDistrict.code || activeDistrict.name}`,
          timestamp: new Date().toISOString(),
          districtId: activeDistrict.id,
          districtName: activeDistrict.name,
          districtCode: activeDistrict.code || "CUSTOM",
          interventions: { ...interventions },
          spatialInterventions: [...spatialInterventions],
          metrics: { ...metrics },
          tags: [
            interventions.canopyCoveragePct >= 30 ? "High Canopy" : null,
            interventions.coolRoofAdoptionPct >= 40 ? "Cool Roofs" : null,
            interventions.permeablePavementPct >= 30 ? "Sponge City" : null,
          ].filter(Boolean) as string[],
          notes: `Achieved -${metrics.tempReductionC}°C cooling across ${activeDistrict.name} with $${(metrics.annualCostSavingsUsd || 0).toLocaleString()}/yr avoided energy costs.`,
        };

        const updatedHistory = saveSimulationRunToDB(newRun);
        setHistoryRuns(updatedHistory || [newRun, ...historyRuns]);
      }

      setToastMessage(
        `Simulation Run logged for ${activeDistrict.name}: -${metrics.tempReductionC}°C cooling achieved!`
      );
      setTimeout(() => setToastMessage(null), 4000);
    }, 600);
  };

  const handleAddSpatialIntervention = (item: SpatialIntervention) => {
    setSpatialInterventions((prev) => [item, ...prev]);
    setToastMessage(`Deployed ${item.name} on map (-${item.coolingEffectC}°C local cooling)`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleRemoveSpatialIntervention = (id: string) => {
    setSpatialInterventions((prev) => prev.filter((item) => item.id !== id));
  };

  const handleLoadPlan = (plan: SavedSimulationPlan) => {
    const d = DISTRICTS.find((item) => item.id === plan.districtId) || DISTRICTS[0];
    if (d) setActiveDistrict(d);
    setInterventions(plan.interventions);
    if (plan.spatialInterventions) setSpatialInterventions(plan.spatialInterventions);
    setActiveNavTab("dashboard");
    setToastMessage(`Loaded saved scenario: "${plan.title}"`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleApplyHistoryRun = (run: SimulationRunRecord) => {
    const foundDistrict = DISTRICTS.find((d) => d.id === run.districtId);
    if (foundDistrict) {
      setActiveDistrict(foundDistrict);
    }
    setInterventions(run.interventions);
    setSpatialInterventions(run.spatialInterventions || []);
    setActiveNavTab("dashboard");
    setToastMessage(`Restored parameters from Run #${run.runNumber}: "${run.name}"`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDeleteHistoryRun = (runId: string) => {
    const updated = deleteSimulationRunFromDB(runId);
    setHistoryRuns(updated);
    setToastMessage("Simulation run removed from history");
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleClearAllHistoryRuns = () => {
    clearSimulationHistoryDB();
    setHistoryRuns([]);
    setToastMessage("All simulation history cleared");
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleImportHistory = (importedRuns: SimulationRunRecord[]) => {
    setHistoryRuns(importedRuns);
    try {
      localStorage.setItem("ecocity_simulation_history_v2", JSON.stringify(importedRuns));
    } catch {}
    setToastMessage(`Imported ${importedRuns.length} simulation runs`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleChangePreferences = (prefs: UserPreferences) => {
    const updatedUser = {
      ...currentUser,
      preferences: prefs,
    };
    setCurrentUser(updatedUser);
    saveUserProfileToDB(updatedUser);
  };

  const handleSelectLiveDistrict = (district: District, liveData: LiveLocationData) => {
    setActiveDistrict(district);
    setLiveLocationData(liveData);
    setActiveNavTab("dashboard");
    setToastMessage(`📍 Centered map on physical location: [${liveData.latitude.toFixed(4)}, ${liveData.longitude.toFixed(4)}]`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#05080c] text-slate-100 antialiased font-sans select-none">
      {/* Left Sidebar Controls */}
      <Sidebar
        activeDistrict={activeDistrict}
        onSelectDistrict={(dist) => setActiveDistrict(dist)}
        activeNavTab={activeNavTab}
        onChangeNavTab={setActiveNavTab}
        interventions={interventions}
        onChangeInterventions={setInterventions}
        onRunSimulation={handleRunSimulation}
        isSimulating={isSimulating}
        onResetDefaults={handleResetDefaults}
        metrics={metrics}
        historyRuns={historyRuns}
        onApplyHistoryRun={handleApplyHistoryRun}
        user={currentUser}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenLiveLocation={() => setIsLiveLocationModalOpen(true)}
        liveLocationData={liveLocationData}
      />

      {/* Center Dynamic Stage View */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-[#05080c]">
        {activeNavTab === "dashboard" && (
          <LeafletGeospatialMap
            district={activeDistrict}
            interventions={interventions}
            metrics={metrics}
            spatialInterventions={spatialInterventions}
            onAddSpatialIntervention={handleAddSpatialIntervention}
            onRemoveSpatialIntervention={handleRemoveSpatialIntervention}
            isSimulating={isSimulating}
            liveLocationData={liveLocationData}
            onOpenLiveLocation={() => setIsLiveLocationModalOpen(true)}
            preferences={currentUser.preferences}
          />
        )}

        {activeNavTab === "history" && (
          <HistoryTimelineView
            historyRuns={historyRuns}
            onApplyRun={handleApplyHistoryRun}
            onDeleteRun={handleDeleteHistoryRun}
            onClearAllRuns={handleClearAllHistoryRuns}
            preferences={currentUser.preferences}
          />
        )}

        {activeNavTab === "layers" && (
          <ThermalLayersView
            district={activeDistrict}
            interventions={interventions}
            metrics={metrics}
          />
        )}

        {activeNavTab === "analytics" && (
          <AnalyticsView
            district={activeDistrict}
            interventions={interventions}
            metrics={metrics}
          />
        )}

        {activeNavTab === "export" && (
          <ExportView
            district={activeDistrict}
            interventions={interventions}
            metrics={metrics}
            spatialInterventions={spatialInterventions}
            onLoadPlan={handleLoadPlan}
          />
        )}
      </main>

      {/* Auth, Profile, and Settings Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={(profile) => setCurrentUser(profile)}
      />

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={currentUser}
        onUpdateUser={(updated) => setCurrentUser(updated)}
        onOpenAuthModal={() => {
          setIsProfileModalOpen(false);
          setIsAuthModalOpen(true);
        }}
        simulationHistory={historyRuns}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        preferences={currentUser.preferences}
        onChangePreferences={handleChangePreferences}
        simulationHistory={historyRuns}
        onImportHistory={handleImportHistory}
        onClearHistory={handleClearAllHistoryRuns}
      />

      <LiveLocationModal
        isOpen={isLiveLocationModalOpen}
        onClose={() => setIsLiveLocationModalOpen(false)}
        onSelectLiveDistrict={handleSelectLiveDistrict}
      />

      {/* Floating System Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-[#091520]/95 text-slate-200 text-xs px-4 py-2.5 rounded-lg shadow-2xl border border-emerald-500/50 flex items-center gap-2 z-50 animate-in fade-in slide-in-from-bottom-2 backdrop-blur-md font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}