"use client";

import React, { useState, useMemo } from "react";
import { HeatMapViewer } from "@/components/map/HeatMapViewer";
import { InterventionControls } from "@/components/dashboard/InterventionControls";
import { District, InterventionsState, HeatMapLayerType } from "@/types/dashboard";
import { DISTRICTS, calculateUhiMetrics } from "@/lib/simulationEngine";

export default function DashboardPage() {
  const [activeDistrict] = useState<District>(DISTRICTS[0]);
  const [activeLayer, setActiveLayer] = useState<HeatMapLayerType>("post_intervention");
  
  const [interventions, setInterventions] = useState<InterventionsState>({
    canopyCoveragePct: 15,
    coolRoofAdoptionPct: 20,
    waterMistingDensityPct: 5,
    permeablePavementPct: 10,
    verticalGardensPct: 5,
  });

  const metrics = useMemo(() => {
    return calculateUhiMetrics(activeDistrict, interventions, []);
  }, [activeDistrict, interventions]);

  return (
    <main className="flex flex-col lg:flex-row h-screen w-screen bg-slate-950 p-4 gap-4 overflow-hidden">
      <div className="w-full lg:w-80 shrink-0 h-full">
        <InterventionControls
          interventions={interventions}
          onChange={setInterventions}
        />
      </div>

      <div className="flex-1 h-full">
        <HeatMapViewer
          district={activeDistrict}
          activeLayer={activeLayer}
          onChangeLayer={setActiveLayer}
          interventions={interventions}
          metrics={metrics}
        />
      </div>
    </main>
  );
}