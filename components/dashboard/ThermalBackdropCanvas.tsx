import React, { useEffect, useRef, useState } from "react";
import { 
  Plus, 
  Minus, 
  Trees, 
  Sun, 
  Droplets, 
  Activity, 
  Sparkles,
  Info,
  Maximize2
} from "lucide-react";
import { District, InterventionsState, CalculatedMetrics, HeatMapHotspot } from "@/types/dashboard";
import { INITIAL_HOTSPOTS } from "@/lib/simulationEngine";
import { SimulationResultsCard } from "./SimulationResultsCard";

interface ThermalBackdropCanvasProps {
  district: District;
  interventions: InterventionsState;
  metrics: CalculatedMetrics;
  isSimulating?: boolean;
}

export const ThermalBackdropCanvas: React.FC<ThermalBackdropCanvasProps> = ({
  district,
  interventions,
  metrics,
  isSimulating,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [activeVisualMode, setActiveVisualMode] = useState<"thermal" | "satellite" | "vegetation">("thermal");
  const [selectedHotspot, setSelectedHotspot] = useState<HeatMapHotspot | null>(null);
  const [showHotspotMarkers, setShowHotspotMarkers] = useState<boolean>(true);

  // Dynamic fluid particle and wave simulation on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 900);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 600);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener("resize", handleResize);

    // Particle nodes representing atmospheric turbulent thermal flux
    const particlesCount = 45;
    const particles: {
      x: number;
      y: number;
      radius: number;
      vx: number;
      vy: number;
      hue: number;
      alpha: number;
    }[] = [];

    for (let i = 0; i < particlesCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 120 + Math.random() * 200,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        hue: 165 + Math.random() * 30, // teal/emerald
        alpha: 0.08 + Math.random() * 0.12,
      });
    }

    let time = 0;

    const render = () => {
      time += 0.008;
      ctx.clearRect(0, 0, width, height);

      // Deep base dark gradient (#05080c to #081119)
      const baseGrad = ctx.createLinearGradient(0, 0, width, height);
      baseGrad.addColorStop(0, "#05080c");
      baseGrad.addColorStop(0.5, "#060d14");
      baseGrad.addColorStop(1, "#07121c");
      ctx.fillStyle = baseGrad;
      ctx.fillRect(0, 0, width, height);

      // Total intervention cooling power factor (0.0 to 1.0)
      const coolingPower = Math.min(
        (interventions.canopyCoveragePct * 0.4 +
          interventions.coolRoofAdoptionPct * 0.3 +
          interventions.permeablePavementPct * 0.2 +
          interventions.waterMistingDensityPct * 0.1) /
          80,
        1.0
      );

      // Fluid ambient aurora flow glow centered on bottom-right/center as shown in user image
      const cx = width * (0.65 + Math.sin(time * 0.5) * 0.05);
      const cy = height * (0.65 + Math.cos(time * 0.4) * 0.05);
      const mainRadius = Math.max(width, height) * (0.55 + coolingPower * 0.25) * zoomLevel;

      // Outer soft cooling wave
      const auroraGrad = ctx.createRadialGradient(
        cx,
        cy,
        mainRadius * 0.05,
        cx,
        cy,
        mainRadius
      );

      if (activeVisualMode === "thermal") {
        // Vibrant mint/cyan cooling glow vs warm ambient
        const mintHue = 160 + coolingPower * 15; // 160 -> 175
        auroraGrad.addColorStop(0, `rgba(45, 212, 191, ${0.42 + coolingPower * 0.28})`);
        auroraGrad.addColorStop(0.3, `rgba(20, 184, 166, ${0.28 + coolingPower * 0.18})`);
        auroraGrad.addColorStop(0.65, `rgba(13, 74, 82, ${0.16 + coolingPower * 0.1})`);
        auroraGrad.addColorStop(1, "rgba(5, 8, 12, 0)");
      } else if (activeVisualMode === "vegetation") {
        // Emerald deep vegetation canopy flow
        auroraGrad.addColorStop(0, `rgba(52, 211, 153, ${0.5 + coolingPower * 0.2})`);
        auroraGrad.addColorStop(0.35, "rgba(16, 185, 129, 0.3)");
        auroraGrad.addColorStop(0.7, "rgba(6, 78, 59, 0.15)");
        auroraGrad.addColorStop(1, "rgba(5, 8, 12, 0)");
      } else {
        // Satellite Spectral Blue / Cyan
        auroraGrad.addColorStop(0, `rgba(56, 189, 248, ${0.45 + coolingPower * 0.2})`);
        auroraGrad.addColorStop(0.35, "rgba(14, 116, 144, 0.28)");
        auroraGrad.addColorStop(0.7, "rgba(8, 47, 73, 0.12)");
        auroraGrad.addColorStop(1, "rgba(5, 8, 12, 0)");
      }

      ctx.fillStyle = auroraGrad;
      ctx.fillRect(0, 0, width, height);

      // Secondary floating thermal plume nodes
      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -100) p.x = width + 100;
        if (p.x > width + 100) p.x = -100;
        if (p.y < -100) p.y = height + 100;
        if (p.y > height + 100) p.y = -100;

        const pGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * zoomLevel);
        const alpha = p.alpha * (0.8 + coolingPower * 0.6);
        pGrad.addColorStop(0, `rgba(45, 212, 191, ${alpha})`);
        pGrad.addColorStop(1, "rgba(5, 8, 12, 0)");

        ctx.fillStyle = pGrad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * zoomLevel, 0, Math.PI * 2);
        ctx.fill();
      });

      // Subtle atmospheric grid lines / coordinates
      ctx.strokeStyle = "rgba(45, 212, 191, 0.035)";
      ctx.lineWidth = 1;
      const gridSize = 60 * zoomLevel;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [interventions, zoomLevel, activeVisualMode]);

  return (
    <div 
      id="thermal-backdrop-container"
      className="relative flex-1 w-full h-full min-h-[480px] bg-[#05080c] overflow-hidden select-none flex flex-col"
    >
      {/* Background Flow Canvas */}
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      />

      {/* Top Center Watermark Title (matches user screenshot) */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 pointer-events-none text-center">
        <h2 className="text-sm sm:text-base font-semibold text-slate-400/70 tracking-wide font-sans drop-shadow-sm">
          EcoCity Heat Planner Dashboard
        </h2>
        <p className="text-[10px] text-emerald-400/60 font-mono mt-0.5 tracking-wider uppercase">
          {district.name} • Microclimate Stream Active
        </p>
      </div>

      {/* Top Right Floating Simulation Results Card */}
      <div className="absolute top-4 right-4 z-20">
        <SimulationResultsCard 
          metrics={metrics} 
          district={district} 
        />
      </div>

      {/* Interactive Microclimate Hotspot Pins (optional telemetry overlay) */}
      {showHotspotMarkers && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {INITIAL_HOTSPOTS.map((hotspot) => {
            const simulatedTemp = (hotspot.baselineTempC - metrics.tempReductionC).toFixed(1);
            const isHovered = selectedHotspot?.id === hotspot.id;

            return (
              <div
                key={hotspot.id}
                style={{ left: `${hotspot.gridX}%`, top: `${hotspot.gridY}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer group"
                onClick={() => setSelectedHotspot(isHovered ? null : hotspot)}
              >
                {/* Glowing Pulse Node */}
                <div className="relative flex items-center justify-center">
                  <span className="absolute w-6 h-6 rounded-full bg-emerald-400/20 animate-ping" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-[#05080c] shadow-lg shadow-emerald-400/50 group-hover:scale-125 transition-transform" />
                </div>

                {/* Hotspot Hover / Active Card */}
                {isHovered && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-48 p-2.5 rounded-lg bg-[#0a1118]/95 border border-[#162738] text-slate-200 shadow-2xl backdrop-blur-md text-[10px] space-y-1 z-30 pointer-events-auto">
                    <p className="font-semibold text-emerald-400 truncate">{hotspot.name}</p>
                    <div className="flex justify-between text-slate-400">
                      <span>LST Temp:</span>
                      <span className="font-mono text-emerald-300 font-bold">{simulatedTemp}°C</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Priority:</span>
                      <span className="font-medium text-amber-300">{hotspot.priorityLevel}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom Right Floating Tool Dock (exact match to screenshot) */}
      <div className="absolute bottom-5 right-5 z-20 flex flex-col items-end gap-3">
        {/* Layer Mode Switchers Vertical Dock */}
        <div className="flex flex-col rounded-lg bg-[#090f16]/90 border border-[#142332] shadow-xl overflow-hidden backdrop-blur-md p-1 space-y-1">
          <button
            id="tool-satellite-btn"
            onClick={() => setActiveVisualMode("satellite")}
            title="Satellite Spectral Layer"
            className={`px-3 py-1.5 rounded text-xs font-mono transition-all text-right cursor-pointer flex items-center gap-2 ${
              activeVisualMode === "satellite"
                ? "bg-[#0e2230] text-sky-400 font-semibold"
                : "text-slate-400 hover:text-slate-200 hover:bg-[#0d1620]"
            }`}
          >
            <span>satellite_alt</span>
          </button>

          <button
            id="tool-thermostat-btn"
            onClick={() => setActiveVisualMode("thermal")}
            title="Thermal Heat Flow"
            className={`px-3 py-1.5 rounded text-xs font-mono transition-all text-right cursor-pointer flex items-center gap-2 ${
              activeVisualMode === "thermal"
                ? "bg-[#0c2420] text-emerald-400 font-semibold"
                : "text-slate-400 hover:text-slate-200 hover:bg-[#0d1620]"
            }`}
          >
            <span>thermostat</span>
          </button>

          <button
            id="tool-park-btn"
            onClick={() => setActiveVisualMode("vegetation")}
            title="Canopy & Nature Layer"
            className={`px-3 py-1.5 rounded text-xs font-mono transition-all text-right cursor-pointer flex items-center gap-2 ${
              activeVisualMode === "vegetation"
                ? "bg-[#0c2420] text-emerald-400 font-semibold"
                : "text-slate-400 hover:text-slate-200 hover:bg-[#0d1620]"
            }`}
          >
            <span>park</span>
          </button>
        </div>

        {/* Zoom Controls Pill Dock */}
        <div className="flex flex-col rounded-lg bg-[#090f16]/90 border border-[#142332] shadow-xl overflow-hidden backdrop-blur-md p-1 space-y-1">
          <button
            id="zoom-in-btn"
            onClick={() => setZoomLevel((z) => Math.min(z + 0.15, 2.0))}
            title="Zoom In"
            className="px-3 py-1.5 rounded text-xs font-mono text-slate-300 hover:text-white hover:bg-[#0d1620] transition-colors cursor-pointer text-center"
          >
            add
          </button>
          <button
            id="zoom-out-btn"
            onClick={() => setZoomLevel((z) => Math.max(z - 0.15, 0.7))}
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
