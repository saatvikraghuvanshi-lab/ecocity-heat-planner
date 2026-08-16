"use client";

import React from "react";
import { InterventionsState } from "@/types/dashboard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Trees, Sun, Droplets, Grid, Building, RotateCcw, Zap } from "lucide-react";

interface InterventionControlsProps {
  interventions: InterventionsState;
  onChange: (interventions: InterventionsState) => void;
  className?: string;
}

export const InterventionControls: React.FC<InterventionControlsProps> = ({
  interventions,
  onChange,
  className = "",
}) => {
  const handleSliderChange = (key: keyof InterventionsState, value: number[]) => {
    onChange({
      ...interventions,
      [key]: value[0],
    });
  };

  const applyPreset = (preset: "max_green" | "cool_roofs" | "balanced" | "reset") => {
    switch (preset) {
      case "max_green":
        onChange({ canopyCoveragePct: 60, coolRoofAdoptionPct: 20, waterMistingDensityPct: 15, permeablePavementPct: 30, verticalGardensPct: 45 });
        break;
      case "cool_roofs":
        onChange({ canopyCoveragePct: 15, coolRoofAdoptionPct: 80, waterMistingDensityPct: 10, permeablePavementPct: 25, verticalGardensPct: 20 });
        break;
      case "balanced":
        onChange({ canopyCoveragePct: 35, coolRoofAdoptionPct: 40, waterMistingDensityPct: 25, permeablePavementPct: 35, verticalGardensPct: 30 });
        break;
      case "reset":
      default:
        onChange({ canopyCoveragePct: 10, coolRoofAdoptionPct: 10, waterMistingDensityPct: 0, permeablePavementPct: 5, verticalGardensPct: 5 });
        break;
    }
  };

  const sliders = [
    {
      id: "canopyCoveragePct",
      label: "Tree Canopy Coverage",
      icon: <Trees className="h-4 w-4 text-emerald-400" />,
      value: interventions.canopyCoveragePct,
      color: "bg-emerald-500",
      description: "Urban forest shade & evapotranspiration",
    },
    {
      id: "coolRoofAdoptionPct",
      label: "Cool Roof Adoption",
      icon: <Sun className="h-4 w-4 text-amber-400" />,
      value: interventions.coolRoofAdoptionPct,
      color: "bg-amber-500",
      description: "High-albedo solar reflective coatings",
    },
    {
      id: "waterMistingDensityPct",
      label: "Evaporative Misting Density",
      icon: <Droplets className="h-4 w-4 text-cyan-400" />,
      value: interventions.waterMistingDensityPct,
      color: "bg-cyan-500",
      description: "Active high-pressure microclimate misters",
    },
    {
      id: "permeablePavementPct",
      label: "Permeable Pavements",
      icon: <Grid className="h-4 w-4 text-indigo-400" />,
      value: interventions.permeablePavementPct,
      color: "bg-indigo-500",
      description: "Porous asphalt & grass pavers",
    },
    {
      id: "verticalGardensPct",
      label: "Vertical Living Walls",
      icon: <Building className="h-4 w-4 text-teal-400" />,
      value: interventions.verticalGardensPct,
      color: "bg-teal-500",
      description: "Building envelope green facades",
    },
  ];

  return (
    <Card className={`border-slate-800 bg-slate-950 text-slate-100 flex flex-col h-full ${className}`}>
      <CardHeader className="p-4 border-b border-slate-800/80 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Zap className="h-4 w-4 text-emerald-400" />
          <span>Intervention Parameters</span>
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => applyPreset("reset")}
          className="h-7 text-xs text-slate-400 hover:text-white px-2 gap-1"
        >
          <RotateCcw className="h-3 w-3" /> Reset
        </Button>
      </CardHeader>

      <CardContent className="p-4 space-y-5 overflow-y-auto flex-1">
        {/* Scenario Quick Presets */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-medium text-slate-400">Quick Presets:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => applyPreset("balanced")} className="h-6 text-[11px] px-2 border-slate-700 bg-slate-900 text-slate-300">
              Balanced Eco
            </Button>
            <Button variant="outline" size="sm" onClick={() => applyPreset("max_green")} className="h-6 text-[11px] px-2 border-slate-700 bg-slate-900 text-emerald-300">
              Max Reforestation
            </Button>
            <Button variant="outline" size="sm" onClick={() => applyPreset("cool_roofs")} className="h-6 text-[11px] px-2 border-slate-700 bg-slate-900 text-amber-300">
              High Albedo
            </Button>
          </div>
        </div>

        <div className="h-px bg-slate-800" />

        {/* Dynamic Sliders */}
        {sliders.map((s) => (
          <div key={s.id} className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-medium text-slate-200">
                {s.icon} {s.label}
              </span>
              <span className="font-mono font-bold text-emerald-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                {s.value}%
              </span>
            </div>
            <Slider
              value={[s.value]}
              min={0}
              max={100}
              step={1}
              onValueChange={(val) => handleSliderChange(s.id as keyof InterventionsState, val)}
              className="cursor-pointer"
            />
            <p className="text-[10px] text-slate-500 font-sans">{s.description}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};