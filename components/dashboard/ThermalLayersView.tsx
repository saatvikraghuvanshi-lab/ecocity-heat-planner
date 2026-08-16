import React, { useState } from "react";
import { 
  Layers, 
  Flame, 
  Trees, 
  Sun, 
  Droplets, 
  Sparkles, 
  Thermometer, 
  Activity, 
  Eye, 
  Sliders
} from "lucide-react";
import { District, InterventionsState, CalculatedMetrics } from "@/types/dashboard";
import { INITIAL_HOTSPOTS } from "@/lib/simulationEngine";

interface ThermalLayersViewProps {
  district: District;
  interventions: InterventionsState;
  metrics: CalculatedMetrics;
}

export const ThermalLayersView: React.FC<ThermalLayersViewProps> = ({
  district,
  interventions,
  metrics,
}) => {
  const [selectedLayer, setSelectedLayer] = useState<string>("lst");

  const layers = [
    {
      id: "lst",
      name: "Land Surface Temperature (LST)",
      desc: "High-resolution thermal radiation surface telemetry with simulated nature cooling",
      icon: Flame,
      color: "text-rose-400",
      activeValue: `${metrics.postInterventionTempC}°C (Simulated)`,
      baselineValue: `${district.baselineTempC}°C (Baseline)`,
    },
    {
      id: "albedo",
      name: "Surface Albedo Reflectivity",
      desc: "Solar reflectance index across flat roofs, roadways and public plaza pavements",
      icon: Sun,
      color: "text-sky-400",
      activeValue: `${(district.baselineAlbedo + interventions.coolRoofAdoptionPct * 0.0035 + interventions.permeablePavementPct * 0.002).toFixed(2)} SRI`,
      baselineValue: `${district.baselineAlbedo} Base SRI`,
    },
    {
      id: "ndvi",
      name: "NDVI Vegetation & Canopy Index",
      desc: "Normalized Difference Vegetation Index tracking photosynthetic biomass density",
      icon: Trees,
      color: "text-emerald-400",
      activeValue: `${(district.currentCanopyPct + interventions.canopyCoveragePct * 0.55).toFixed(1)}% Canopy`,
      baselineValue: `${district.currentCanopyPct}% Base Canopy`,
    },
    {
      id: "misting",
      name: "Evaporative Microclimate Nodes",
      desc: "Active latent heat dissipation networks and urban misting moisture vectors",
      icon: Droplets,
      color: "text-cyan-400",
      activeValue: `${interventions.waterMistingDensityPct}% Node Density`,
      baselineValue: "0% Baseline Nodes",
    },
  ];

  return (
    <div className="flex-1 h-full overflow-y-auto p-6 bg-[#05080c] text-slate-100 space-y-6 select-none">
      {/* Top Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#142332] pb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
            <Layers className="h-5 w-5 text-emerald-400" />
            <span>Thermal & Spectral GIS Layers</span>
          </h2>
          <p className="text-xs text-slate-400">
            Spatial breakdown of thermal radiation, surface albedo, and microclimate vegetative cover for {district.name} ({district.code}).
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Net Delta:</span>
          <span className="font-mono font-bold text-emerald-400 px-2.5 py-1 rounded bg-[#0c2420] border border-[#164e3f]">
            -{metrics.tempReductionC}°C / -{metrics.tempReductionF}°F
          </span>
        </div>
      </div>

      {/* Layer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {layers.map((layer) => {
          const Icon = layer.icon;
          const isSelected = selectedLayer === layer.id;

          return (
            <div
              key={layer.id}
              onClick={() => setSelectedLayer(layer.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer space-y-3 ${
                isSelected
                  ? "bg-[#091520] border-emerald-400/80 shadow-lg shadow-emerald-950/30 ring-1 ring-emerald-500/30"
                  : "bg-[#080e15] border-[#142332] hover:bg-[#0c1622] hover:border-slate-700 text-slate-300"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-lg bg-[#070b10] border border-[#162738] ${layer.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-slate-100">{layer.name}</h3>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{layer.desc}</p>
                  </div>
                </div>
                {isSelected && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-700">
                    Active
                  </span>
                )}
              </div>

              <div className="pt-2 border-t border-[#121f2d] flex justify-between items-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block">Baseline</span>
                  <span className="font-mono text-slate-400">{layer.baselineValue}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-emerald-400/80 block">Simulated Output</span>
                  <span className="font-mono font-bold text-emerald-300">{layer.activeValue}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Hotspot Vulnerability Table */}
      <div className="p-4 rounded-xl bg-[#080e15] border border-[#142332] space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
          <span className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-400" />
            Critical Microclimate Hotspot Telemetry
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            {INITIAL_HOTSPOTS.length} Monitored Sensor Nodes
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="border-b border-[#142332] text-[10px] text-slate-500 uppercase font-mono">
                <th className="py-2 px-3">Location / Facility</th>
                <th className="py-2 px-3">Land Use</th>
                <th className="py-2 px-3">Baseline LST</th>
                <th className="py-2 px-3">Simulated LST</th>
                <th className="py-2 px-3">Cooling Delta</th>
                <th className="py-2 px-3">Vulnerability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#101b27]">
              {INITIAL_HOTSPOTS.map((hs) => {
                const simulated = (hs.baselineTempC - metrics.tempReductionC).toFixed(1);
                return (
                  <tr key={hs.id} className="hover:bg-[#0c1622]/60 transition-colors font-mono text-[11px]">
                    <td className="py-2 px-3 font-sans font-medium text-slate-200">{hs.name}</td>
                    <td className="py-2 px-3 text-slate-400">{hs.landUse}</td>
                    <td className="py-2 px-3 text-rose-400">{hs.baselineTempC}°C</td>
                    <td className="py-2 px-3 text-emerald-400 font-bold">{simulated}°C</td>
                    <td className="py-2 px-3 text-cyan-300">-{metrics.tempReductionC}°C</td>
                    <td className="py-2 px-3 font-sans">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        hs.priorityLevel === "Critical" 
                          ? "bg-rose-950/80 text-rose-300 border border-rose-800" 
                          : "bg-amber-950/80 text-amber-300 border border-amber-800"
                      }`}>
                        {hs.priorityLevel}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
