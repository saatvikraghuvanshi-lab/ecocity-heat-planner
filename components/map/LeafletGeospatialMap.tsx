"use client";

import React, { useEffect, useRef, useState } from "react";
// Make sure to import types from leaflet directly if needed
import L from "leaflet";

// Updated type imports — adjust relative path if not using path aliases
import type { 
  District, 
  InterventionsState, 
  CalculatedMetrics, 
  SpatialIntervention, 
  HeatMapHotspot, 
  SpatialGridCell, 
  InterventionType,
  LiveLocationData,
  UserPreferences
} from  "@/types/dashboard"; // Or "@/types" based on your tsconfig alias setup

// Simulation engine initial state
import { INITIAL_HOTSPOTS } from "@/lib/simulationEngine";

// Lucide Icons (Falling back to `Building` if `Building2` is unsupported by your lucide version)
// @ts-ignore - Some project setups do not install lucide-react types/deps at build time.
import { 
  Layers, 
  Trees, 
  Sun, 
  Droplets, 
  Plus, 
  Trash2, 
  Info, 
  MapPin, 
  Eye, 
  Compass, 
  Crosshair, 
  Building, // Fallback for Building2
  Sparkles, 
  MousePointerClick, 
  Radio
} from "lucide-react";
import { SimulationResultsCard } from "@/components/dashboard/SimulationResultsCard";

interface LeafletGeospatialMapProps {
  district: District;
  interventions: InterventionsState;
  metrics: CalculatedMetrics;
  spatialInterventions: SpatialIntervention[];
  onAddSpatialIntervention: (intervention: SpatialIntervention) => void;
  onRemoveSpatialIntervention: (id: string) => void;
  isSimulating?: boolean;
  liveLocationData?: LiveLocationData | null;
  onOpenLiveLocation?: () => void;
  preferences?: UserPreferences;
}

type TileProvider = "dark" | "osm" | "satellite";

export const LeafletGeospatialMap: React.FC<LeafletGeospatialMapProps> = ({
  district,
  interventions,
  metrics,
  spatialInterventions,
  onAddSpatialIntervention,
  onRemoveSpatialIntervention,
  isSimulating,
  liveLocationData,
  onOpenLiveLocation,
  preferences,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const liveLocationMarkerRef = useRef<L.Marker | null>(null);
  const liveLocationCircleRef = useRef<L.Circle | null>(null);
  const layerGroupsRef = useRef<{
    heatLayer?: L.LayerGroup;
    gridLayer?: L.LayerGroup;
    interventionsLayer?: L.LayerGroup;
    hotspotsLayer?: L.LayerGroup;
    liveLocationLayer?: L.LayerGroup;
  }>({});

  const [activeTile, setActiveTile] = useState<TileProvider>("dark");
  const [activeLayerMode, setActiveLayerMode] = useState<"thermal" | "satellite" | "vegetation">("thermal");
  const [placementTool, setPlacementTool] = useState<InterventionType | null>(null);
  const [selectedItemInfo, setSelectedItemInfo] = useState<{
    title: string;
    type: string;
    temp: string;
    details: string;
    energy?: string;
  } | null>(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      if ((mapContainerRef.current as any)._leaflet_id) {
        delete (mapContainerRef.current as any)._leaflet_id;
      }

      const map = L.map(mapContainerRef.current, {
        center: district.center,
        zoom: district.zoom,
        zoomControl: false,
        attributionControl: false,
      });

      mapInstanceRef.current = map;

      // Base Dark Tile (CartoDB Dark Matter)
      const tile = L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          maxZoom: 19,
          subdomains: "abcd",
        }
      ).addTo(map);

      tileLayerRef.current = tile;

      // Layer groups
      layerGroupsRef.current.heatLayer = L.layerGroup().addTo(map);
      layerGroupsRef.current.gridLayer = L.layerGroup().addTo(map);
      layerGroupsRef.current.interventionsLayer = L.layerGroup().addTo(map);
      layerGroupsRef.current.hotspotsLayer = L.layerGroup().addTo(map);

      // Attribution
      L.control.attribution({ position: "bottomleft", prefix: "OpenStreetMap | CartoDB" }).addTo(map);

      // Force recalculation of container dimensions
      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    }

    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });

    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update center when district changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(district.center, district.zoom, { duration: 1.2 });
    }
  }, [district]);

  // Update Base Tile Provider
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    mapInstanceRef.current.removeLayer(tileLayerRef.current);

    let url = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
    let sub = "abcd";

    if (activeTile === "osm") {
      url = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
      sub = "abc";
    } else if (activeTile === "satellite") {
      url = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
      sub = "a";
    }

    const newTile = L.tileLayer(url, { maxZoom: 19, subdomains: sub }).addTo(mapInstanceRef.current);
    tileLayerRef.current = newTile;
  }, [activeTile]);

  // Handle Placement Click on Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (!placementTool) return;

      const type = placementTool;
      const names: Record<InterventionType, string> = {
        tree_canopy: "Micro Forest & Shaded Canopy",
        green_roof: "Intensive Sedum Green Roof",
        cool_roof: "High-Albedo Reflective Roof",
        permeable_pavement: "Permeable Bioswale Pavement",
        misting_station: "High-Pressure Misting Column",
        pocket_park: "Urban Bio-Retention Pocket Park",
      };

      const costs: Record<InterventionType, number> = {
        tree_canopy: 18000,
        green_roof: 45000,
        cool_roof: 15000,
        permeable_pavement: 22000,
        misting_station: 9500,
        pocket_park: 38000,
      };

      const cooling: Record<InterventionType, number> = {
        tree_canopy: 2.2,
        green_roof: 2.8,
        cool_roof: 1.9,
        permeable_pavement: 1.6,
        misting_station: 2.5,
        pocket_park: 3.0,
      };

      const energy: Record<InterventionType, number> = {
        tree_canopy: 14000,
        green_roof: 28000,
        cool_roof: 19000,
        permeable_pavement: 12000,
        misting_station: 8000,
        pocket_park: 22000,
      };

      const newIntervention: SpatialIntervention = {
        id: `sp-${Date.now()}`,
        type,
        name: names[type],
        lat: e.latlng.lat,
        lng: e.latlng.lng,
        radiusMeters: type === "tree_canopy" || type === "pocket_park" ? 130 : 90,
        coveragePct: 50,
        coolingEffectC: cooling[type],
        energyReductionKwhYr: energy[type],
        costUsd: costs[type],
        installedAt: new Date().toISOString().split("T")[0],
      };

      onAddSpatialIntervention(newIntervention);
      setPlacementTool(null); // finish placing
    };

    map.on("click", handleMapClick);
    return () => {
      map.off("click", handleMapClick);
    };
  }, [placementTool, onAddSpatialIntervention]);

  // Draw Heat GIS Layers, Spatial Grid, and Interventions
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const heatGroup = layerGroupsRef.current.heatLayer;
    const gridGroup = layerGroupsRef.current.gridLayer;
    const intGroup = layerGroupsRef.current.interventionsLayer;
    const hsGroup = layerGroupsRef.current.hotspotsLayer;

    if (heatGroup) heatGroup.clearLayers();
    if (gridGroup) gridGroup.clearLayers();
    if (intGroup) intGroup.clearLayers();
    if (hsGroup) hsGroup.clearLayers();

    // 1. Render Thermal Heat GIS Cells
    if (gridGroup && district.surfaceGrid) {
      district.surfaceGrid.forEach((cell) => {
        const simulatedCellTemp = cell.baseLST - metrics.tempReductionC;
        
        // Color mapping based on temperature and layer mode
        let fillColor = "#f43f5e"; // rose/hot
        let fillOpacity = 0.28;

        if (activeLayerMode === "vegetation") {
          // Vegetation NDVI map
          const ndvi = cell.vegetationIndex + (interventions.canopyCoveragePct * 0.004);
          if (ndvi > 0.45) fillColor = "#10b981"; // emerald
          else if (ndvi > 0.25) fillColor = "#84cc16"; // lime
          else fillColor = "#eab308"; // amber
          fillOpacity = 0.35;
        } else {
          // Thermal LST
          if (simulatedCellTemp < 32) {
            fillColor = "#2dd4bf"; // teal cool
            fillOpacity = 0.35;
          } else if (simulatedCellTemp < 35) {
            fillColor = "#38bdf8"; // sky
            fillOpacity = 0.32;
          } else if (simulatedCellTemp < 38) {
            fillColor = "#fbbf24"; // amber
            fillOpacity = 0.3;
          } else {
            fillColor = "#f43f5e"; // red high heat
            fillOpacity = 0.38;
          }
        }

        const circle = L.circle([cell.lat, cell.lng], {
          radius: 120,
          color: fillColor,
          weight: 1,
          opacity: 0.5,
          fillColor,
          fillOpacity,
        });

        circle.on("click", () => {
          setSelectedItemInfo({
            title: `Surface Sector Node (${cell.landCover.replace("_", " ")})`,
            type: "Geospatial Surface Cell",
            temp: `${simulatedCellTemp.toFixed(1)}°C (Base: ${cell.baseLST}°C)`,
            details: `Albedo: ${cell.albedo} SRI • Vegetation: ${(cell.vegetationIndex * 100).toFixed(0)}% NDVI • Area: ${cell.buildingFootprintM2}m²`,
            energy: `Cooling Delta: -${metrics.tempReductionC}°C`,
          });
        });

        circle.addTo(gridGroup);
      });
    }

    // 2. Render Placed Spatial Interventions (Trees, Green Roofs, etc.)
    if (intGroup) {
      spatialInterventions.forEach((item) => {
        let color = "#34d399";
        let iconHtml = "🌳";
        if (item.type === "green_roof") {
          color = "#10b981";
          iconHtml = "🌱";
        } else if (item.type === "cool_roof") {
          color = "#38bdf8";
          iconHtml = "☀️";
        } else if (item.type === "misting_station") {
          color = "#06b6d4";
          iconHtml = "💧";
        } else if (item.type === "permeable_pavement") {
          color = "#a7f3d0";
          iconHtml = "🧱";
        }

        // Intervention Radius Circle
        const circle = L.circle([item.lat, item.lng], {
          radius: item.radiusMeters,
          color,
          weight: 2,
          fillColor: color,
          fillOpacity: 0.25,
          dashArray: "4, 6",
        });

        circle.addTo(intGroup);

        // Custom HTML Marker Pin
        const customIcon = L.divIcon({
          className: "custom-intervention-icon",
          html: `<div style="background-color: #07121b; border: 2px solid ${color}; border-radius: 9999px; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 14px; box-shadow: 0 0 12px ${color}88; cursor: pointer;">${iconHtml}</div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });

        const marker = L.marker([item.lat, item.lng], { icon: customIcon });

        marker.on("click", () => {
          setSelectedItemInfo({
            title: item.name,
            type: `Spatial Intervention (${item.type.replace("_", " ")})`,
            temp: `Local Cooling: -${item.coolingEffectC}°C`,
            details: `Installed: ${item.installedAt} • CapEx: $${item.costUsd.toLocaleString()} • Radius: ${item.radiusMeters}m`,
            energy: `Annual Grid Savings: ${item.energyReductionKwhYr.toLocaleString()} kWh/yr`,
          });
        });

        marker.addTo(intGroup);
      });
    }

    // 3. Render Critical Thermal Hotspot Radar Sensors
    if (hsGroup) {
      INITIAL_HOTSPOTS.forEach((hs) => {
        const simulated = (hs.baselineTempC - metrics.tempReductionC).toFixed(1);
        const iconHtml = `<div style="position: relative; display: flex; align-items: center; justify-content: center; width: 28px; height: 28px;">
          <span style="position: absolute; width: 24px; height: 24px; border-radius: 9999px; background: rgba(244,63,94,0.3); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
          <span style="width: 12px; height: 12px; border-radius: 9999px; background: #f43f5e; border: 2px solid #05080c; box-shadow: 0 0 8px #f43f5e;"></span>
        </div>`;

        const hotspotIcon = L.divIcon({
          className: "custom-hotspot-pin",
          html: iconHtml,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([hs.lat, hs.lng], { icon: hotspotIcon });

        marker.on("click", () => {
          setSelectedItemInfo({
            title: hs.name,
            type: `Critical Thermal Hotspot (${hs.priorityLevel})`,
            temp: `Simulated LST: ${simulated}°C (Base: ${hs.baselineTempC}°C)`,
            details: `Land Use: ${hs.landUse} • Base Albedo: ${hs.albedo} SRI • Existing Canopy: ${hs.canopyPct}%`,
            energy: `Mitigation Target: -${metrics.tempReductionC}°C Cooling`,
          });
        });

        marker.addTo(hsGroup);
      });
    }

    // 5. Render Live Location Marker if active
    if (liveLocationData?.isActive && mapInstanceRef.current) {
      if (!layerGroupsRef.current.liveLocationLayer) {
        layerGroupsRef.current.liveLocationLayer = L.layerGroup().addTo(mapInstanceRef.current);
      }
      const liveGroup = layerGroupsRef.current.liveLocationLayer;
      liveGroup.clearLayers();

      const liveIconHtml = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;">
          <span style="position: absolute; width: 32px; height: 32px; border-radius: 9999px; background: rgba(56, 189, 248, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
          <span style="width: 14px; height: 14px; border-radius: 9999px; background: #38bdf8; border: 2px solid #ffffff; box-shadow: 0 0 12px #0284c7;"></span>
        </div>`;

      const liveIcon = L.divIcon({
        className: "custom-live-gps-pin",
        html: liveIconHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const liveMarker = L.marker([liveLocationData.latitude, liveLocationData.longitude], {
        icon: liveIcon,
        zIndexOffset: 1000,
      });

      liveMarker.on("click", () => {
        setSelectedItemInfo({
          title: "My Live Physical Location",
          type: "GPS-Locked Microclimate Sensor",
          temp: `Live Lat: ${liveLocationData.latitude.toFixed(5)}, Lng: ${liveLocationData.longitude.toFixed(5)}`,
          details: `Accuracy: ±${liveLocationData.accuracyMeters || 15}m • Device GPS Telemetry Active`,
          energy: `Simulated Baseline LST: 37.8°C`,
        });
      });

      liveMarker.addTo(liveGroup);

      if (liveLocationData.accuracyMeters) {
        L.circle([liveLocationData.latitude, liveLocationData.longitude], {
          radius: liveLocationData.accuracyMeters,
          color: "#38bdf8",
          weight: 1,
          dashArray: "4, 6",
          fillColor: "#38bdf8",
          fillOpacity: 0.08,
        }).addTo(liveGroup);
      }
    }
  }, [district, interventions, metrics, spatialInterventions, activeLayerMode, liveLocationData]);

  return (
    <div 
      id="leaflet-map-container"
      className="relative flex-1 w-full h-full min-h-[480px] bg-[#05080c] overflow-hidden select-none flex flex-col"
    >
      {/* Leaflet Map Target Element */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-full z-0 cursor-grab active:cursor-grabbing"
      />

      {/* Top Center Title / Watermark Header & Live GPS badge */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-auto text-center flex flex-col items-center gap-1">
        <div className="bg-[#070d14]/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-[#142332] shadow-xl flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <div className="text-left">
            <h2 className="text-xs sm:text-sm font-semibold text-slate-200 tracking-wide font-sans">
              EcoCity OpenStreetMap Geospatial Intelligence
            </h2>
            <p className="text-[10px] text-emerald-400 font-mono tracking-wider uppercase">
              {district.name} • Lat: {district.center[0].toFixed(4)}, Lng: {district.center[1].toFixed(4)}
            </p>
          </div>

          {onOpenLiveLocation && (
            <button
              onClick={onOpenLiveLocation}
              className={`ml-2 px-2.5 py-1 rounded-full text-[10px] font-mono flex items-center gap-1 transition-all cursor-pointer ${
                liveLocationData?.isActive
                  ? "bg-cyan-950/90 text-cyan-300 border border-cyan-500/50 shadow-md shadow-cyan-950/40 animate-pulse"
                  : "bg-[#0d1c28] text-slate-300 hover:text-white hover:bg-[#12283a] border border-[#173046]"
              }`}
              title="Detect device GPS coordinates"
            >
              <Radio className="h-3 w-3 text-cyan-400" />
              <span>{liveLocationData?.isActive ? "GPS Active" : "Use Live GPS"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Top Right Simulation Results Card */}
      <div className="absolute top-4 right-4 z-20">
        <SimulationResultsCard 
          metrics={metrics} 
          district={district} 
        />
      </div>

      {/* Top Left Spatial Intervention Placement Toolbar */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        <div className="bg-[#090f16]/95 backdrop-blur-md border border-[#142332] rounded-xl p-2 shadow-2xl text-xs space-y-2 max-w-xs">
          <div className="flex items-center justify-between pb-1 border-b border-[#142332]">
            <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
              <MousePointerClick className="h-3.5 w-3.5 text-emerald-400" />
              Place Spatial Interventions
            </span>
            {placementTool && (
              <button
                onClick={() => setPlacementTool(null)}
                className="text-[10px] text-rose-400 hover:text-rose-300 font-mono"
              >
                Cancel
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => setPlacementTool(placementTool === "tree_canopy" ? null : "tree_canopy")}
              className={`p-2 rounded-lg text-left text-[11px] font-medium transition-all flex items-center gap-2 cursor-pointer ${
                placementTool === "tree_canopy"
                  ? "bg-[#0c2420] text-emerald-400 border border-emerald-400 shadow-md"
                  : "bg-[#0c141e] text-slate-300 hover:bg-[#101b27] border border-[#162738]"
              }`}
            >
              <Trees className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">Tree Canopy</span>
            </button>

            <button
              onClick={() => setPlacementTool(placementTool === "green_roof" ? null : "green_roof")}
              className={`p-2 rounded-lg text-left text-[11px] font-medium transition-all flex items-center gap-2 cursor-pointer ${
                placementTool === "green_roof"
                  ? "bg-[#0c2420] text-emerald-400 border border-emerald-400 shadow-md"
                  : "bg-[#0c141e] text-slate-300 hover:bg-[#101b27] border border-[#162738]"
              }`}
            >
              <Building className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">Green Roof</span>
            </button>

            <button
              onClick={() => setPlacementTool(placementTool === "cool_roof" ? null : "cool_roof")}
              className={`p-2 rounded-lg text-left text-[11px] font-medium transition-all flex items-center gap-2 cursor-pointer ${
                placementTool === "cool_roof"
                  ? "bg-[#0e2230] text-sky-400 border border-sky-400 shadow-md"
                  : "bg-[#0c141e] text-slate-300 hover:bg-[#101b27] border border-[#162738]"
              }`}
            >
              <Sun className="h-3.5 w-3.5 text-sky-400 shrink-0" />
              <span className="truncate">Cool Roof</span>
            </button>

            <button
              onClick={() => setPlacementTool(placementTool === "misting_station" ? null : "misting_station")}
              className={`p-2 rounded-lg text-left text-[11px] font-medium transition-all flex items-center gap-2 cursor-pointer ${
                placementTool === "misting_station"
                  ? "bg-[#0e2230] text-cyan-400 border border-cyan-400 shadow-md"
                  : "bg-[#0c141e] text-slate-300 hover:bg-[#101b27] border border-[#162738]"
              }`}
            >
              <Droplets className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
              <span className="truncate">Misting Node</span>
            </button>
          </div>

          {placementTool ? (
            <div className="p-2 rounded bg-[#071714] border border-emerald-500/50 text-[10px] text-emerald-300 flex items-center gap-1.5 animate-pulse">
              <Crosshair className="h-3.5 w-3.5 shrink-0" />
              <span>Click anywhere on the map to deploy {placementTool.replace("_", " ")}</span>
            </div>
          ) : (
            <p className="text-[10px] text-slate-500">
              {spatialInterventions.length} spatial interventions deployed in {district.name}
            </p>
          )}
        </div>
      </div>

      {/* Selected Item Telemetry Popover (When clicking a cell or pin) */}
      {selectedItemInfo && (
        <div className="absolute bottom-5 left-5 z-30 max-w-sm w-full bg-[#081018]/95 backdrop-blur-md border border-[#192f44] rounded-xl p-3.5 shadow-2xl text-slate-200 space-y-2 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider block">
                {selectedItemInfo.type}
              </span>
              <h4 className="text-xs font-bold text-slate-100">{selectedItemInfo.title}</h4>
            </div>
            <button
              onClick={() => setSelectedItemInfo(null)}
              className="text-slate-400 hover:text-white p-1 text-xs font-bold"
            >
              ✕
            </button>
          </div>

          <div className="p-2 rounded bg-[#050b10] border border-[#12202e] space-y-1 text-[11px] font-mono">
            <div className="flex justify-between text-emerald-300 font-bold">
              <span>Status:</span>
              <span>{selectedItemInfo.temp}</span>
            </div>
            {selectedItemInfo.energy && (
              <div className="flex justify-between text-cyan-300">
                <span>Impact:</span>
                <span>{selectedItemInfo.energy}</span>
              </div>
            )}
            <p className="text-[10px] font-sans text-slate-400 pt-1 border-t border-[#12202e]">
              {selectedItemInfo.details}
            </p>
          </div>
        </div>
      )}

      {/* Bottom Right Floating Tool Dock (Matches user design) */}
      <div className="absolute bottom-5 right-5 z-20 flex flex-col items-end gap-3">
        {/* Tile Provider & Visual Layer Switcher */}
        <div className="flex flex-col rounded-lg bg-[#090f16]/95 border border-[#142332] shadow-xl overflow-hidden backdrop-blur-md p-1 space-y-1">
          <button
            id="tool-satellite-btn"
            onClick={() => {
              setActiveLayerMode("satellite");
              setActiveTile("satellite");
            }}
            title="Satellite Spectral Imagery"
            className={`px-3 py-1.5 rounded text-xs font-mono transition-all text-right cursor-pointer flex items-center justify-end gap-2 ${
              activeTile === "satellite"
                ? "bg-[#0e2230] text-sky-400 font-semibold"
                : "text-slate-400 hover:text-slate-200 hover:bg-[#0d1620]"
            }`}
          >
            <span>satellite_alt</span>
          </button>

          <button
            id="tool-thermostat-btn"
            onClick={() => {
              setActiveLayerMode("thermal");
              setActiveTile("dark");
            }}
            title="Thermal LST Heat Map"
            className={`px-3 py-1.5 rounded text-xs font-mono transition-all text-right cursor-pointer flex items-center justify-end gap-2 ${
              activeLayerMode === "thermal" && activeTile === "dark"
                ? "bg-[#0c2420] text-emerald-400 font-semibold"
                : "text-slate-400 hover:text-slate-200 hover:bg-[#0d1620]"
            }`}
          >
            <span>thermostat</span>
          </button>

          <button
            id="tool-park-btn"
            onClick={() => {
              setActiveLayerMode("vegetation");
              setActiveTile("dark");
            }}
            title="Vegetation & NDVI Canopy Layer"
            className={`px-3 py-1.5 rounded text-xs font-mono transition-all text-right cursor-pointer flex items-center justify-end gap-2 ${
              activeLayerMode === "vegetation"
                ? "bg-[#0c2420] text-emerald-400 font-semibold"
                : "text-slate-400 hover:text-slate-200 hover:bg-[#0d1620]"
            }`}
          >
            <span>park</span>
          </button>
        </div>

        {/* Map Zoom & Center Controls */}
        <div className="flex flex-col rounded-lg bg-[#090f16]/95 border border-[#142332] shadow-xl overflow-hidden backdrop-blur-md p-1 space-y-1">
          <button
            id="zoom-in-btn"
            onClick={() => mapInstanceRef.current?.zoomIn()}
            title="Zoom In"
            className="px-3 py-1.5 rounded text-xs font-mono text-slate-300 hover:text-white hover:bg-[#0d1620] transition-colors cursor-pointer text-center"
          >
            add
          </button>
          <button
            id="zoom-out-btn"
            onClick={() => mapInstanceRef.current?.zoomOut()}
            title="Zoom Out"
            className="px-3 py-1.5 rounded text-xs font-mono text-slate-300 hover:text-white hover:bg-[#0d1620] transition-colors cursor-pointer text-center"
          >
            remove
          </button>
        </div>
      </div>
    </div>
  );
};
