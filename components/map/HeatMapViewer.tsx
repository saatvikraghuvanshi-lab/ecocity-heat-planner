"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { 
  Flame, 
  Trees, 
  Sun, 
  Maximize2, 
  Minimize2, 
  Thermometer, 
  SplitSquareVertical,
  Compass,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Droplets,
  Building,
  Filter,
  Save,
  Loader2
} from "lucide-react";
import { 
  District, 
  HeatMapLayerType, 
  HeatMapHotspot, 
  InterventionsState, 
  CalculatedMetrics 
} from "@/types/dashboard";
import { INITIAL_HOTSPOTS } from "@/lib/simulationEngine";
import { saveSimulationRecord } from "@/lib/simulationService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Dynamically import Leaflet map with SSR disabled to prevent window object errors in Next.js
const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-slate-950 animate-pulse flex flex-col items-center justify-center text-slate-400 gap-2">
      <Compass className="h-8 w-8 animate-spin text-emerald-500" />
      <span className="font-mono text-xs">Initializing GIS Spatial Raster Engine...</span>
    </div>
  ),
});

interface HeatMapViewerProps {
  district: District;
  activeLayer: HeatMapLayerType;
  onChangeLayer?: (layer: HeatMapLayerType) => void;
  interventions: InterventionsState;
  metrics: CalculatedMetrics;
  onSelectHotspot?: (hotspot: HeatMapHotspot) => void;
  selectedHotspot?: HeatMapHotspot | null;
  className?: string;
  isComparisonMode?: boolean;
}

export const HeatMapViewer: React.FC<HeatMapViewerProps> = ({
  district,
  activeLayer,
  onChangeLayer,
  interventions,
  metrics,
  onSelectHotspot,
  selectedHotspot: externalSelectedHotspot,
  className = "",
  isComparisonMode = false,
}) => {
  const [internalSelectedHotspot, setInternalSelectedHotspot] = useState<HeatMapHotspot | null>(INITIAL_HOTSPOTS[0]);
  const selectedHotspot = externalSelectedHotspot !== undefined ? externalSelectedHotspot : internalSelectedHotspot;

  const [isSplitView, setIsSplitView] = useState<boolean>(isComparisonMode);
  const [splitPosition, setSplitPosition] = useState<number>(50); // percentage 0-100
  const [hoveredCoords, setHoveredCoords] = useState<{ x: number; y: number; temp: number; label?: string } | null>(null);
  
  // Database Save Loading State
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Dynamic Map Navigation State (Zoom & Pan)
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Spatial Intervention Overlay Visibility Toggles
  const [showCanopyMarkers, setShowCanopyMarkers] = useState<boolean>(true);
  const [showCoolRoofs, setShowCoolRoofs] = useState<boolean>(true);
  const [showPavements, setShowPavements] = useState<boolean>(true);
  const [showMistingNodes, setShowMistingNodes] = useState<boolean>(true);
  const [showLivingWalls, setShowLivingWalls] = useState<boolean>(true);
  const [showHotspotPins, setShowHotspotPins] = useState<boolean>(true);

  const containerRef = useRef<HTMLDivElement>(null);

 // components/map/HeatMapViewer.tsx

  const handleSaveSimulation = async () => {
    setIsSaving(true);
    const payload = {
      districtId: district.id || district.name,
      scenarioName: `${district.name} - ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      canopyCoveragePct: interventions.canopyCoveragePct,
      coolRoofAdoptionPct: interventions.coolRoofAdoptionPct,
      permeablePavementPct: interventions.permeablePavementPct || 0,
      waterMistingDensityPct: interventions.waterMistingDensityPct || 0,
      verticalGardensPct: interventions.verticalGardensPct || 0,
      tempReductionCelsius: metrics.tempReductionC,
      tempReductionFahrenheit: metrics.tempReductionF,
      energySavingsMwh: metrics.annualEnergySavingsMwh || 0,
      costEstimateUsd: metrics.capitalCostEstimateUsd || 0,
      carbonOffsetTons: metrics.carbonOffsetTonsYear || 0,
      healthRiskReductionPct: metrics.heatStressReductionScore || 0,
      geojson: null
    };

    const result = await saveSimulationRecord(payload);
    setIsSaving(false);

    if (result) {
      alert("Simulation record saved successfully to Supabase!");
    } else {
      alert("Failed to save simulation to database. Please check console or network connection.");
    }
  };

  // Sync split view if parent isComparisonMode prop changes
  useEffect(() => {
    if (isComparisonMode) {
      setIsSplitView(true);
    }
  }, [isComparisonMode]);

  // Dynamic hotspot cooling response based on interventions
  const dynamicHotspots = useMemo(() => {
    return INITIAL_HOTSPOTS.map((hs) => {
      let cooling = 0;
      if (hs.landUse === "Dense Urban Canyon") {
        cooling = (interventions.canopyCoveragePct * 0.05) + (interventions.verticalGardensPct * 0.02);
      } else if (hs.landUse === "Industrial Flat Roof") {
        cooling = (interventions.coolRoofAdoptionPct * 0.042) + (interventions.canopyCoveragePct * 0.015);
      } else if (hs.landUse === "Parking Lagoon" || hs.landUse === "Commercial Asphalt") {
        cooling = (interventions.permeablePavementPct * 0.035) + (interventions.canopyCoveragePct * 0.03);
      } else {
        cooling = (interventions.waterMistingDensityPct * 0.03) + (interventions.canopyCoveragePct * 0.02);
      }
      const currentTempC = parseFloat((hs.baselineTempC - cooling).toFixed(1));
      return {
        ...hs,
        currentTempC,
      };
    });
  }, [interventions]);

  // Handle Zoom In / Out
  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => {
      const next = Math.max(1, Math.min(2.5, prev + delta));
      if (next === 1) {
        setPanOffset({ x: 0, y: 0 });
      }
      return parseFloat(next.toFixed(2));
    });
  };

  const handleResetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Mouse pan handlers when zoomed in
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging && zoomLevel > 1) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    
    // Calculate simulated local surface temperature based on coordinate distance to heat centers
    const centerDist = Math.hypot(x - 48, y - 36);
    const eastDist = Math.hypot(x - 68, y - 32);
    const southDist = Math.hypot(x - 30, y - 65);
    const minDist = Math.min(centerDist, eastDist, southDist);

    const localBaseline = district.baselineTempC + (minDist < 18 ? 3.2 : minDist < 35 ? 1.4 : -1.8);
    const localCooling = metrics.tempReductionC * (1 - Math.min(minDist, 50) / 75);
    const estTemp = parseFloat((localBaseline - (activeLayer === "baseline_lst" ? 0 : localCooling)).toFixed(1));
    
    let label = "Commercial District";
    if (minDist === centerDist && minDist < 20) label = "Downtown Canyon Heat Core";
    else if (minDist === eastDist && minDist < 20) label = "Industrial Flat Roof Hub";
    else if (minDist === southDist && minDist < 20) label = "Logistics Terminal Lagoon";
    else if (x > 80) label = "Riparian River Corridor";

    setHoveredCoords({ 
      x: Math.round(x), 
      y: Math.round(y), 
      temp: estTemp,
      label 
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Spatial intervention markers distribution based on density sliders
  const treeCanopyNodes = useMemo(() => {
    const count = Math.min(12, Math.floor(interventions.canopyCoveragePct / 8));
    const positions = [
      { x: 22, y: 28, radius: 18 + interventions.canopyCoveragePct * 0.15 },
      { x: 38, y: 22, radius: 14 + interventions.canopyCoveragePct * 0.12 },
      { x: 52, y: 44, radius: 22 + interventions.canopyCoveragePct * 0.2 },
      { x: 44, y: 56, radius: 16 + interventions.canopyCoveragePct * 0.14 },
      { x: 62, y: 68, radius: 19 + interventions.canopyCoveragePct * 0.16 },
      { x: 74, y: 48, radius: 15 + interventions.canopyCoveragePct * 0.12 },
      { x: 18, y: 72, radius: 18 + interventions.canopyCoveragePct * 0.14 },
      { x: 82, y: 24, radius: 20 + interventions.canopyCoveragePct * 0.18 },
      { x: 58, y: 16, radius: 14 + interventions.canopyCoveragePct * 0.1 },
      { x: 28, y: 48, radius: 17 + interventions.canopyCoveragePct * 0.15 },
      { x: 86, y: 74, radius: 16 + interventions.canopyCoveragePct * 0.12 },
      { x: 42, y: 82, radius: 15 + interventions.canopyCoveragePct * 0.11 },
    ];
    return positions.slice(0, Math.max(1, count));
  }, [interventions.canopyCoveragePct]);

  const coolRoofBuildings = useMemo(() => {
    const count = Math.min(8, Math.floor(interventions.coolRoofAdoptionPct / 12));
    const buildings = [
      { x: 68, y: 32, w: 12, h: 10, name: "Logistics Hub Roof" },
      { x: 54, y: 26, w: 10, h: 9, name: "Civic Plaza Flat Roof" },
      { x: 78, y: 20, w: 11, h: 10, name: "Tech Campus Bld 4" },
      { x: 34, y: 38, w: 9, h: 8, name: "Metro Station Canopy" },
      { x: 64, y: 52, w: 10, h: 9, name: "Commerce Tower Roof" },
      { x: 24, y: 60, w: 11, h: 8, name: "Health Center Wing" },
      { x: 80, y: 62, w: 10, h: 9, name: "East Terminal Roof" },
      { x: 46, y: 70, w: 12, h: 10, name: "South Distribution Center" },
    ];
    return buildings.slice(0, Math.max(0, count));
  }, [interventions.coolRoofAdoptionPct]);

  const mistingStations = useMemo(() => {
    const count = Math.min(6, Math.floor(interventions.waterMistingDensityPct / 16));
    const stations = [
      { x: 48, y: 38, name: "Central Transit Pavilion Misting Hub" },
      { x: 32, y: 50, name: "West Pedestrian Promenade Misters" },
      { x: 65, y: 44, name: "Financial Plaza Evaporative Ring" },
      { x: 50, y: 62, name: "South Market Fountain Misters" },
      { x: 76, y: 35, name: "Innovation Mall Microclimate Cooler" },
      { x: 26, y: 30, name: "North Gateway Refresh Station" },
    ];
    return stations.slice(0, Math.max(0, count));
  }, [interventions.waterMistingDensityPct]);

  const permeablePavements = useMemo(() => {
    const count = Math.min(5, Math.floor(interventions.permeablePavementPct / 20));
    const zones = [
      { x: 74, y: 43, w: 14, h: 12, name: "East Permeable Parking Basin" },
      { x: 28, y: 64, w: 15, h: 11, name: "South Permeable Boulevard" },
      { x: 42, y: 32, w: 12, h: 9, name: "Central Alley Bioswale Corridor" },
      { x: 60, y: 72, w: 13, h: 10, name: "Depot Porous Asphalt Grid" },
      { x: 18, y: 40, w: 11, h: 10, name: "West Connector Bioswale" },
    ];
    return zones.slice(0, Math.max(0, count));
  }, [interventions.permeablePavementPct]);

  const verticalGreenWalls = useMemo(() => {
    const count = Math.min(6, Math.floor(interventions.verticalGardensPct / 16));
    const walls = [
      { x: 46, y: 35, orientation: "vertical", name: "Canyon Living Wall North" },
      { x: 50, y: 39, orientation: "horizontal", name: "Transit Hub Green Facade" },
      { x: 62, y: 28, orientation: "vertical", name: "Commercial Tower Foliage" },
      { x: 36, y: 52, orientation: "horizontal", name: "West Corridor Bio-wall" },
      { x: 70, y: 48, orientation: "vertical", name: "Innovation Bld Green Screen" },
      { x: 28, y: 26, orientation: "horizontal", name: "Civic Center Living Screen" },
    ];
    return walls.slice(0, Math.max(0, count));
  }, [interventions.verticalGardensPct]);

  return (
    <Card id="heatmap-viewer-card" className={`border-slate-800/90 shadow-md flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden ${className}`}>
      {/* Top Map Toolbar */}
      <CardHeader className="p-3 pb-2.5 border-b border-slate-800/90 flex flex-row items-center justify-between gap-2 shrink-0 bg-slate-900/90">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-rose-950/80 border border-rose-700/50 text-rose-400 flex items-center justify-center">
            <Flame className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>{district.name}</span>
              <Badge variant="outline" className="text-[10px] font-mono py-0 border-slate-700 text-slate-300 bg-slate-800/50">
                10m Thermal LST Grid
              </Badge>
            </CardTitle>
          </div>
        </div>

        {/* Dynamic Controls: Layers, Save & Split View */}
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {/* Quick Layer Switcher */}
          {onChangeLayer && (
            <div className="hidden lg:flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px]">
              <button
                id="layer-btn-thermal"
                onClick={() => onChangeLayer("post_intervention")}
                className={`px-2 py-1 rounded-md transition-colors ${
                  activeLayer === "post_intervention"
                    ? "bg-emerald-600 text-white font-medium shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Simulated LST
              </button>
              <button
                id="layer-btn-baseline"
                onClick={() => onChangeLayer("baseline_lst")}
                className={`px-2 py-1 rounded-md transition-colors ${
                  activeLayer === "baseline_lst"
                    ? "bg-rose-600 text-white font-medium shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Baseline Heat
              </button>
              <button
                id="layer-btn-ndvi"
                onClick={() => onChangeLayer("ndvi_vegetation")}
                className={`px-2 py-1 rounded-md transition-colors ${
                  activeLayer === "ndvi_vegetation"
                    ? "bg-emerald-700 text-white font-medium shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                NDVI Vegetation
              </button>
              <button
                id="layer-btn-delta"
                onClick={() => onChangeLayer("thermal_delta")}
                className={`px-2 py-1 rounded-md transition-colors ${
                  activeLayer === "thermal_delta"
                    ? "bg-cyan-600 text-white font-medium shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Δ°C Delta
              </button>
            </div>
          )}

          {/* Save Simulation to Supabase Button */}
          <Button
            id="save-simulation-btn"
            variant="outline"
            size="sm"
            onClick={handleSaveSimulation}
            disabled={isSaving}
            className="h-7 text-xs px-2.5 gap-1.5 border-emerald-700/60 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/60 hover:text-white transition-colors"
          >
            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{isSaving ? "Saving..." : "Save Scenario"}</span>
          </Button>

          {/* Before/After Split Toggle Button */}
          <Button
            id="toggle-split-view-btn"
            variant={isSplitView ? "default" : "outline"}
            size="sm"
            onClick={() => setIsSplitView(!isSplitView)}
            className={`h-7 text-xs px-2.5 gap-1.5 ${
              isSplitView 
                ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                : "border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700"
            }`}
          >
            <SplitSquareVertical className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{isSplitView ? "Split Active" : "Compare Before/After"}</span>
          </Button>
        </div>
      </CardHeader>

      {/* Map Display Canvas Container */}
      <CardContent className="p-0 flex-1 relative bg-slate-950 overflow-hidden select-none min-h-[380px]">
        {/* Floating Zoom & Map Nav Controls (Top Left) */}
        <div className="absolute top-3 left-3 z-30 flex flex-col gap-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-lg border border-slate-800 shadow-xl">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  id="map-zoom-in-btn"
                  onClick={() => handleZoom(0.25)}
                  disabled={zoomLevel >= 2.5}
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded disabled:opacity-30 transition-colors"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-slate-900 text-slate-200 text-xs border-slate-700">
                Zoom In ({Math.round(zoomLevel * 100)}%)
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  id="map-zoom-out-btn"
                  onClick={() => handleZoom(-0.25)}
                  disabled={zoomLevel <= 1}
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded disabled:opacity-30 transition-colors"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-slate-900 text-slate-200 text-xs border-slate-700">
                Zoom Out
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  id="map-reset-zoom-btn"
                  onClick={handleResetView}
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-slate-900 text-slate-200 text-xs border-slate-700">
                Reset View
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Spatial Layer Toggles HUD (Top Right) */}
        <div className="absolute top-3 right-3 z-30 hidden md:flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-slate-800 text-[11px] text-slate-300 shadow-xl">
          <span className="text-slate-400 font-medium flex items-center gap-1">
            <Filter className="h-3 w-3 text-emerald-400" /> Overlays:
          </span>
          <button
            onClick={() => setShowCanopyMarkers(!showCanopyMarkers)}
            className={`px-1.5 py-0.5 rounded flex items-center gap-1 transition-colors ${
              showCanopyMarkers ? "bg-emerald-950 border border-emerald-600 text-emerald-300" : "opacity-40 hover:opacity-80"
            }`}
          >
            <Trees className="h-3 w-3" /> Canopies ({treeCanopyNodes.length})
          </button>
          <button
            onClick={() => setShowCoolRoofs(!showCoolRoofs)}
            className={`px-1.5 py-0.5 rounded flex items-center gap-1 transition-colors ${
              showCoolRoofs ? "bg-sky-950 border border-sky-600 text-sky-300" : "opacity-40 hover:opacity-80"
            }`}
          >
            <Sun className="h-3 w-3" /> Cool Roofs ({coolRoofBuildings.length})
          </button>
          <button
            onClick={() => setShowMistingNodes(!showMistingNodes)}
            className={`px-1.5 py-0.5 rounded flex items-center gap-1 transition-colors ${
              showMistingNodes ? "bg-cyan-950 border border-cyan-600 text-cyan-300" : "opacity-40 hover:opacity-80"
            }`}
          >
            <Droplets className="h-3 w-3" /> Misting ({mistingStations.length})
          </button>
        </div>

        {/* Map Canvas with Leaflet Base Tile Layer & HTML Overlays */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            setIsDragging(false);
            setHoveredCoords(null);
          }}
          style={{
            transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`,
            transformOrigin: "center center",
            transition: isDragging ? "none" : "transform 0.2s ease-out",
          }}
          className={`w-full h-full relative ${zoomLevel > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-crosshair"}`}
        >
          {/* Dynamic Leaflet Interactive Map Component */}
          <div className="absolute inset-0 z-0">
            <LeafletMap selectedLayer={activeLayer} tempDrop={metrics.tempReductionC} />
          </div>

          {/* Spatial HTML Markers: Tree Canopies */}
          {showCanopyMarkers && treeCanopyNodes.map((node, i) => (
            <div
              key={`tree-marker-${i}`}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 animate-in fade-in zoom-in"
            >
              <div className="h-5 w-5 rounded-full bg-emerald-600/90 text-white flex items-center justify-center shadow-lg border border-emerald-400">
                <Trees className="h-3 w-3" />
              </div>
            </div>
          ))}

          {/* Spatial HTML Markers: Water Misting Stations */}
          {showMistingNodes && mistingStations.map((station, i) => (
            <div
              key={`misting-node-${i}`}
              style={{ left: `${station.x}%`, top: `${station.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-10 group"
            >
              <div className="relative flex items-center justify-center">
                <span className="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-cyan-400 opacity-75" />
                <div className="h-5 w-5 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shadow-lg border border-white text-[10px]">
                  <Droplets className="h-3 w-3" />
                </div>
                <div className="absolute bottom-full mb-1.5 hidden group-hover:flex flex-col bg-slate-900 text-white px-2 py-1 rounded text-[10px] whitespace-nowrap z-30 shadow-xl border border-cyan-500/50">
                  <span className="font-semibold text-cyan-300">{station.name}</span>
                  <span className="text-slate-400">Evaporative cooling zone (-3.2°C microclimate)</span>
                </div>
              </div>
            </div>
          ))}

          {/* Spatial HTML Markers: Vertical Living Walls */}
          {showLivingWalls && verticalGreenWalls.map((wall, i) => (
            <div
              key={`wall-node-${i}`}
              style={{ left: `${wall.x}%`, top: `${wall.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-10 group"
            >
              <div className="h-4 w-4 rounded bg-emerald-500 text-slate-950 flex items-center justify-center shadow border border-emerald-300">
                <Building className="h-2.5 w-2.5 text-slate-950" />
              </div>
            </div>
          ))}

          {/* Hotspot Interactive Markers */}
          {showHotspotPins && dynamicHotspots.map((hs) => {
            const isSelected = selectedHotspot?.id === hs.id;
            return (
              <div
                key={hs.id}
                style={{ left: `${hs.gridX}%`, top: `${hs.gridY}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setInternalSelectedHotspot(hs);
                  if (onSelectHotspot) onSelectHotspot(hs);
                }}
              >
                <div className="relative flex items-center justify-center">
                  {/* Pulsing ring for critical priority */}
                  {hs.priorityLevel === "Critical" && (
                    <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-rose-500 opacity-60" />
                  )}
                  
                  {/* Pin Circle */}
                  <div
                    className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-mono font-bold shadow-xl transition-all ${
                      isSelected
                        ? "bg-emerald-500 text-slate-950 ring-4 ring-white scale-125 z-30"
                        : hs.priorityLevel === "Critical"
                        ? "bg-rose-600 text-white border-2 border-rose-300 hover:scale-110"
                        : "bg-slate-900/90 text-white border border-slate-700 hover:scale-110"
                    }`}
                  >
                    {hs.currentTempC}°
                  </div>

                  {/* Hotspot Hover Mini-Card */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col bg-slate-900/95 text-white p-2.5 rounded-md shadow-2xl border border-slate-700 text-[11px] whitespace-nowrap z-40 pointer-events-none">
                    <span className="font-semibold text-emerald-400">{hs.name}</span>
                    <span className="text-slate-300">Surface LST: {hs.currentTempC}°C (Baseline: {hs.baselineTempC}°C)</span>
                    <span className="text-slate-400">Land Use: {hs.landUse} • Albedo: {hs.albedo}</span>
                    <span className="text-emerald-300 font-mono">Cooling Benefit: -{(hs.baselineTempC - hs.currentTempC).toFixed(1)}°C</span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Split-View Slider Divider */}
          {isSplitView && (
            <div
              style={{ left: `${splitPosition}%` }}
              className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)] z-30 flex items-center justify-center cursor-ew-resize"
              onMouseDown={(e) => {
                e.stopPropagation();
                const handleDrag = (moveEvent: MouseEvent) => {
                  if (!containerRef.current) return;
                  const rect = containerRef.current.getBoundingClientRect();
                  const pos = ((moveEvent.clientX - rect.left) / rect.width) * 100;
                  setSplitPosition(Math.max(10, Math.min(90, pos)));
                };
                const handleUp = () => {
                  window.removeEventListener("mousemove", handleDrag);
                  window.removeEventListener("mouseup", handleUp);
                };
                window.addEventListener("mousemove", handleDrag);
                window.addEventListener("mouseup", handleUp);
              }}
            >
              <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-xl border-2 border-white text-xs font-bold select-none">
                ⬌
              </div>

              {/* Split view labels */}
              <div className="absolute top-4 -left-28 bg-rose-950/90 text-rose-300 border border-rose-700/60 px-2 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap pointer-events-none">
                Baseline ({district.baselineTempC}°C)
              </div>
              <div className="absolute top-4 -right-32 bg-emerald-950/90 text-emerald-300 border border-emerald-700/60 px-2 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap pointer-events-none">
                Simulated ({metrics.postInterventionTempC}°C)
              </div>
            </div>
          )}

          {/* Live Hover Coordinates & Temperature HUD (Bottom Left) */}
          <div className="absolute bottom-3 left-3 bg-slate-900/85 backdrop-blur-md text-white px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] font-mono flex items-center gap-3 z-20 shadow-lg">
            <span className="flex items-center gap-1 text-slate-400">
              <Compass className="h-3.5 w-3.5 text-emerald-400" />
              GIS: {hoveredCoords ? `${hoveredCoords.x}°N, ${hoveredCoords.y}°W` : "40.75°N, 73.98°W"}
            </span>
            <span className="h-3 w-px bg-slate-700" />
            <span className="flex items-center gap-1 font-semibold text-amber-400">
              <Thermometer className="h-3.5 w-3.5" />
              {hoveredCoords ? `${hoveredCoords.temp}°C` : `${district.baselineTempC}°C Base`}
            </span>
            {hoveredCoords?.label && (
              <>
                <span className="h-3 w-px bg-slate-700 hidden sm:inline" />
                <span className="text-slate-400 hidden sm:inline">{hoveredCoords.label}</span>
              </>
            )}
          </div>

          {/* Thermal Palette Scale Legend (Bottom Right) */}
          <div className="absolute bottom-3 right-3 bg-slate-900/85 backdrop-blur-md text-white p-2.5 rounded-lg border border-slate-800 z-20 space-y-1 text-[10px] w-48 shadow-lg">
            <div className="flex justify-between font-semibold text-slate-300">
              <span className="text-emerald-400">Cooler (30°C)</span>
              <span className="text-rose-400">Hotspot (48°C)</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gradient-to-r from-emerald-500 via-cyan-400 via-amber-400 to-rose-600 shadow-inner" />
            <div className="flex justify-between text-slate-400 font-mono text-[9px]">
              <span>-Δ6.0°C</span>
              <span>Baseline</span>
              <span>+Δ8.0°C UHI</span>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Active Hotspot Inspector Footer */}
      {selectedHotspot && (
        <div className="p-3 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={selectedHotspot.priorityLevel === "Critical" ? "danger" : "warning"} className="text-[10px]">
              {selectedHotspot.priorityLevel} Priority Hotspot
            </Badge>
            <span className="font-semibold text-slate-200">{selectedHotspot.name}</span>
            <span className="text-slate-400 hidden md:inline">({selectedHotspot.landUse})</span>
          </div>

          <div className="flex items-center gap-3 font-mono text-slate-300">
            <span>Base: <strong className="text-rose-400">{selectedHotspot.baselineTempC}°C</strong></span>
            <span>→</span>
            <span>Simulated: <strong className="text-emerald-400">{selectedHotspot.currentTempC}°C</strong></span>
            <span className="text-emerald-400 font-semibold bg-emerald-950/70 border border-emerald-800/60 px-1.5 py-0.5 rounded">
              -{(selectedHotspot.baselineTempC - selectedHotspot.currentTempC).toFixed(1)}°C
            </span>
          </div>
        </div>
      )}
    </Card>
  );
};