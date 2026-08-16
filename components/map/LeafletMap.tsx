"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Circle, Popup, useMap } from "react-leaflet";
import L from "leaflet";

// Fix default marker icon assets breaking in Next.js SSR bundlers
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface MapProps {
  selectedLayer: string;
  tempDrop: number;
}

// Controller component to invalidate container size on dynamic mounts
const MapController: React.FC<{ selectedLayer: string }> = ({ selectedLayer }) => {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();
  }, [map, selectedLayer]);

  return null;
};

export default function LeafletMap({ selectedLayer, tempDrop }: MapProps) {
  // Center coordinates [lat, lng]
  const center: [number, number] = [40.7128, -74.0060];

  // Map layer strings (supports both raw IDs and display names)
  const getZoneColor = () => {
    switch (selectedLayer) {
      case "baseline_lst":
      case "Baseline Land Surface Temp":
        return "#EF4444"; // Red (Baseline Heat)
      case "ndvi_vegetation":
      case "NDVI Vegetation & Canopy":
        return "#10B981"; // Green (Vegetation Cover)
      case "thermal_delta":
      case "Thermal Delta":
        return "#06B6D4"; // Cyan/Blue (Delta Cool)
      case "post_intervention":
      default:
        return "#3B82F6"; // Blue (Simulated Heat Map)
    }
  };

  // Base Map Tile layer switcher
  const getTileUrl = () => {
    if (
      selectedLayer === "ndvi_vegetation" || 
      selectedLayer === "NDVI Vegetation & Canopy"
    ) {
      return "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png";
    }
    return "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
  };

  const activeColor = getZoneColor();

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={false}
        zoomControl={false}
        attributionControl={false}
        className="h-full w-full rounded-xl z-0"
      >
        <MapController selectedLayer={selectedLayer} />
        
        <TileLayer
          url={getTileUrl()}
          maxZoom={19}
        />

        {/* Hotspot Circle Raster Zone Layer */}
        <Circle
          center={center}
          radius={1200}
          pathOptions={{
            color: activeColor,
            fillColor: activeColor,
            fillOpacity: 0.45,
            weight: 2,
          }}
        >
          <Popup className="custom-leaflet-popup">
            <div className="p-1 font-sans text-xs">
              <strong className="text-slate-900 block border-b border-slate-200 pb-1 mb-1">
                Spatial Analysis Overlay
              </strong>
              <div className="text-slate-700">
                <strong>Active Layer:</strong> {selectedLayer}
              </div>
              <div className="text-emerald-700 font-semibold mt-0.5">
                <strong>Simulated Temp Reduction:</strong> -{tempDrop.toFixed(1)}°C
              </div>
            </div>
          </Popup>
        </Circle>
      </MapContainer>

      {/* Dynamic Heat Gradient Filter Overlay */}
      <div 
        className={`absolute inset-0 pointer-events-none transition-opacity duration-500 z-10 ${
          selectedLayer === "baseline_lst" || selectedLayer === "Baseline Land Surface Temp"
            ? "bg-gradient-to-tr from-rose-600/30 via-amber-500/20 to-transparent mix-blend-color-burn"
            : selectedLayer === "post_intervention"
            ? "bg-gradient-to-tr from-emerald-600/20 via-cyan-500/15 to-transparent mix-blend-overlay"
            : selectedLayer === "ndvi_vegetation" || selectedLayer === "NDVI Vegetation & Canopy"
            ? "bg-emerald-950/20 mix-blend-multiply"
            : "bg-cyan-900/30 mix-blend-difference"
        }`}
      />
    </div>
  );
}