import React from "react";
import { 
  Trees, 
  Sun, 
  Layers, 
  Droplets, 
  Flower2, 
  RotateCcw, 
  Play, 
  Sliders, 
  CheckCircle2, 
  Flame, 
  Zap, 
  Coins, 
  Building2,
  Sparkles,
  Building,
  TrendingDown
} from "lucide-react";
import { InterventionsState, CalculatedMetrics, District } from "@/types/dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

interface InterventionPanelProps {
  interventions: InterventionsState;
  onChangeInterventions: (updater: (prev: InterventionsState) => InterventionsState) => void;
  onResetDefaults: () => void;
  metrics: CalculatedMetrics;
  district: District;
  onRunSimulationSync: () => void;
  isSyncing?: boolean;
}

export const InterventionPanel: React.FC<InterventionPanelProps> = ({
  interventions,
  onChangeInterventions,
  onResetDefaults,
  metrics,
  district,
  onRunSimulationSync,
  isSyncing,
}) => {
  const handleSliderChange = (key: keyof InterventionsState, value: number[]) => {
    onChangeInterventions((prev) => ({
      ...prev,
      [key]: value[0],
    }));
  };

  return (
    <Card id="intervention-panel-card" className="border-slate-800/90 shadow-md flex flex-col h-full bg-slate-950 text-slate-100">
      <CardHeader className="p-3.5 pb-2.5 border-b border-slate-800/90 flex flex-row items-center justify-between shrink-0 bg-slate-900/90">
        <div>
          <CardTitle className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-2">
            <Sliders className="h-4 w-4 text-emerald-400" />
            Mitigation Interventions Tuner
          </CardTitle>
          <CardDescription className="text-[11px] text-slate-400">
            Real-time urban nature & surface albedo cooling controls
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button
            id="reset-interventions-btn"
            variant="ghost"
            size="sm"
            onClick={onResetDefaults}
            className="h-7 text-xs text-slate-400 hover:text-slate-100 hover:bg-slate-800 px-2"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
          <Button
            id="sync-simulation-btn"
            size="sm"
            onClick={onRunSimulationSync}
            disabled={isSyncing}
            className="h-7 text-xs px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm"
          >
            {isSyncing ? (
              <>
                <span className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin mr-1.5" />
                Syncing...
              </>
            ) : (
              <>
                <Play className="h-3 w-3 mr-1 fill-current" />
                Run PostGIS Model
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-3.5 flex-1 overflow-y-auto space-y-3">
        <Tabs defaultValue="sliders" className="w-full">
          <TabsList className="grid grid-cols-2 mb-3 bg-slate-900 border border-slate-800 h-8">
            <TabsTrigger value="sliders" className="text-xs data-[state=active]:bg-slate-800 data-[state=active]:text-white">
              Thermodynamic Sliders
            </TabsTrigger>
            <TabsTrigger value="breakdown" className="text-xs data-[state=active]:bg-slate-800 data-[state=active]:text-white">
              CapEx & Payback Matrix
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sliders" className="space-y-3 pt-0.5">
            {/* 1. Tree Canopy Addition */}
            <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/80 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-emerald-950 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                    <Trees className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-100">Urban Tree Canopy Density</h4>
                    <p className="text-[10px] text-slate-400">Street trees, urban forest corridors & pocket groves</p>
                  </div>
                </div>
                <Badge variant="success" className="font-mono text-[11px] bg-emerald-950 text-emerald-300 border-emerald-700">
                  {interventions.canopyCoveragePct}% (+{((interventions.canopyCoveragePct * 0.045)).toFixed(1)}°C)
                </Badge>
              </div>

              <Slider
                id="slider-canopy"
                value={[interventions.canopyCoveragePct]}
                min={0}
                max={100}
                step={1}
                onValueChange={(val) => handleSliderChange("canopyCoveragePct", val)}
                className="py-1"
              />

              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0% (Sparse)</span>
                <span>Current: {district.currentCanopyPct}%</span>
                <span>100% (Dense Canopy)</span>
              </div>
            </div>

            {/* 2. Cool Roof & High-Albedo Surfaces */}
            <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/80 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-sky-950 border border-sky-500/40 text-sky-400 flex items-center justify-center">
                    <Sun className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-100">Cool Roof Retrofit (SRI &gt; 82)</h4>
                    <p className="text-[10px] text-slate-400">High-albedo elastomeric & thermoplastic membranes</p>
                  </div>
                </div>
                <Badge variant="info" className="font-mono text-[11px] bg-sky-950 text-sky-300 border-sky-700">
                  {interventions.coolRoofAdoptionPct}% (+{((interventions.coolRoofAdoptionPct * 0.024)).toFixed(1)}°C)
                </Badge>
              </div>

              <Slider
                id="slider-cool-roof"
                value={[interventions.coolRoofAdoptionPct]}
                min={0}
                max={100}
                step={1}
                onValueChange={(val) => handleSliderChange("coolRoofAdoptionPct", val)}
                className="py-1"
              />

              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0% (Dark Asphalt)</span>
                <span>50% Target</span>
                <span>100% Complete Retrofit</span>
              </div>
            </div>

            {/* 3. Permeable Pavement & Bioswales */}
            <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/80 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-teal-950 border border-teal-500/40 text-teal-400 flex items-center justify-center">
                    <Layers className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-100">Permeable Pavement & Bioswales</h4>
                    <p className="text-[10px] text-slate-400">Porous asphalt, permeable pavers, stormwater channels</p>
                  </div>
                </div>
                <Badge variant="warning" className="font-mono text-[11px] bg-teal-950 text-teal-300 border-teal-700">
                  {interventions.permeablePavementPct}%
                </Badge>
              </div>

              <Slider
                id="slider-permeable-pavement"
                value={[interventions.permeablePavementPct]}
                min={0}
                max={100}
                step={1}
                onValueChange={(val) => handleSliderChange("permeablePavementPct", val)}
                className="py-1"
              />

              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0% (Impervious)</span>
                <span>50%</span>
                <span>100% Porous Grid</span>
              </div>
            </div>

            {/* 4. Evaporative Urban Misting & Water Features */}
            <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/80 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400 flex items-center justify-center">
                    <Droplets className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-100">Microclimate Water & Misting Nodes</h4>
                    <p className="text-[10px] text-slate-400">High-pressure evaporative cooling fountains & plazas</p>
                  </div>
                </div>
                <Badge variant="secondary" className="font-mono text-[11px] bg-cyan-950 text-cyan-300 border-cyan-700">
                  {interventions.waterMistingDensityPct}%
                </Badge>
              </div>

              <Slider
                id="slider-water-misting"
                value={[interventions.waterMistingDensityPct]}
                min={0}
                max={100}
                step={1}
                onValueChange={(val) => handleSliderChange("waterMistingDensityPct", val)}
                className="py-1"
              />

              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0% (None)</span>
                <span>50% Key Nodes</span>
                <span>100% Full Network</span>
              </div>
            </div>

            {/* 5. Vertical Living Green Walls */}
            <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/80 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-emerald-950 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                    <Building className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-100">Vertical Green Facades & Living Walls</h4>
                    <p className="text-[10px] text-slate-400">Building canyon vegetative insulation & bio-screens</p>
                  </div>
                </div>
                <Badge variant="secondary" className="font-mono text-[11px] bg-emerald-950 text-emerald-300 border-emerald-700">
                  {interventions.verticalGardensPct}%
                </Badge>
              </div>

              <Slider
                id="slider-vertical-gardens"
                value={[interventions.verticalGardensPct]}
                min={0}
                max={100}
                step={1}
                onValueChange={(val) => handleSliderChange("verticalGardensPct", val)}
                className="py-1"
              />

              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0%</span>
                <span>50% Canyons</span>
                <span>100% Maximum</span>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: COST & ROI BREAKDOWN */}
          <TabsContent value="breakdown" className="space-y-3 pt-0.5 text-xs text-slate-300">
            <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/80 space-y-2">
              <div className="flex justify-between font-semibold text-slate-200">
                <span>Estimated CapEx Investment:</span>
                <span className="font-mono text-emerald-400 font-bold">${(metrics.capitalCostEstimateUsd / 1000000).toFixed(2)}M USD</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Annual HVAC Grid Savings:</span>
                <span className="font-mono text-cyan-300">${(metrics.annualCostSavingsUsd / 1000).toFixed(0)}k/yr ({metrics.annualEnergySavingsMwh.toLocaleString()} MWh)</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Economic Payback Horizon:</span>
                <span className="font-mono text-emerald-300">~{metrics.paybackPeriodYears} Years</span>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/80 space-y-2">
              <div className="font-semibold text-slate-200">10-Year Amortization Model</div>
              <div className="space-y-1.5 text-[11px] text-slate-400">
                <div className="flex justify-between">
                  <span>Cumulative Energy Savings (10 yr):</span>
                  <span className="font-mono text-slate-200">${((metrics.annualCostSavingsUsd * 10) / 1000000).toFixed(2)}M</span>
                </div>
                <div className="flex justify-between">
                  <span>Carbon Offset Credits (10 yr):</span>
                  <span className="font-mono text-slate-200">{(metrics.carbonOffsetTonsYear * 10).toLocaleString()} tCO₂e</span>
                </div>
                <div className="flex justify-between font-semibold text-emerald-400 pt-1 border-t border-slate-800">
                  <span>Net Municipal Return:</span>
                  <span className="font-mono">+${(((metrics.annualCostSavingsUsd * 10) - metrics.capitalCostEstimateUsd) / 1000000).toFixed(2)}M</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
