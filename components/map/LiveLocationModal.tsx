import React, { useState } from "react";
import { 
  MapPin, 
  Crosshair, 
  Navigation, 
  Radio, 
  Check, 
  X, 
  Sparkles, 
  AlertCircle, 
  Thermometer, 
  Building2, 
  ArrowRight 
} from "lucide-react";
import { District, LiveLocationData } from "@/types/dashboard";
import { createLiveDistrictFromCoordinates } from "@/lib/simulationEngine";

interface LiveLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLiveDistrict: (district: District, liveData: LiveLocationData) => void;
}

export const LiveLocationModal: React.FC<LiveLocationModalProps> = ({
  isOpen,
  onClose,
  onSelectLiveDistrict,
}) => {
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [customLat, setCustomLat] = useState<string>("37.7749");
  const [customLng, setCustomLng] = useState<string>("-122.4194");
  const [locationLabel, setLocationLabel] = useState<string>("My Live Urban Microclimate");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [liveSuccessData, setLiveSuccessData] = useState<LiveLocationData | null>(null);

  if (!isOpen) return null;

  const handleDetectGPS = () => {
    setIsDetecting(true);
    setErrorMsg(null);

    if (!("geolocation" in navigator)) {
      setErrorMsg("Geolocation API is not supported in this browser environment. You can enter custom coordinates below.");
      setIsDetecting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy, altitude } = position.coords;
        setCustomLat(latitude.toFixed(5));
        setCustomLng(longitude.toFixed(5));
        
        const liveData: LiveLocationData = {
          isActive: true,
          latitude,
          longitude,
          accuracyMeters: accuracy || 15,
          altitudeMeters: altitude || undefined,
          cityName: "Current GPS Neighborhood",
          timestamp: new Date().toISOString(),
        };

        setLiveSuccessData(liveData);
        setIsDetecting(false);
      },
      (err) => {
        console.warn("Geolocation prompt warning/fallback:", err.message);
        // Fallback with realistic coordinates
        const fallbackLat = 37.7749;
        const fallbackLng = -122.4194;
        setCustomLat(fallbackLat.toString());
        setCustomLng(fallbackLng.toString());
        setErrorMsg(`GPS permission notice: ${err.message}. Showing coordinate configurator below.`);
        setIsDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  const handleApplyLocation = () => {
    const lat = parseFloat(customLat);
    const lng = parseFloat(customLng);

    if (isNaN(lat) || isNaN(lng)) {
      setErrorMsg("Please provide valid latitude and longitude numbers.");
      return;
    }

    const liveData: LiveLocationData = {
      isActive: true,
      latitude: lat,
      longitude: lng,
      accuracyMeters: liveSuccessData?.accuracyMeters || 20,
      cityName: locationLabel,
      timestamp: new Date().toISOString(),
    };

    const district = createLiveDistrictFromCoordinates(lat, lng, locationLabel);
    onSelectLiveDistrict(district, liveData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in select-none">
      <div className="relative w-full max-w-md bg-[#070e16] border border-[#182c40] rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#142332] flex items-center justify-between bg-[#091420]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#0e2a22] border border-emerald-500/40 text-emerald-400">
              <Crosshair className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Live GPS Location Simulator</h3>
              <p className="text-[11px] text-slate-400">
                Detect your physical coordinates to simulate microclimate cooling on your real street
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

        {/* Body */}
        <div className="p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-[#1a0f12] border border-rose-900/50 text-rose-300 text-[11px] flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Detect GPS Button */}
          <button
            type="button"
            onClick={handleDetectGPS}
            disabled={isDetecting}
            className="w-full py-3 px-4 rounded-xl bg-[#0e2721] hover:bg-[#143a31] text-emerald-300 border border-emerald-500/50 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-950/40"
          >
            {isDetecting ? (
              <>
                <span className="w-3.5 h-3.5 rounded-full border-2 border-emerald-300 border-t-transparent animate-spin" />
                <span>Acquiring High-Precision GPS Lock...</span>
              </>
            ) : (
              <>
                <Radio className="h-4 w-4 text-emerald-400 animate-pulse" />
                <span>Auto-Detect Current GPS Coordinates</span>
              </>
            )}
          </button>

          {liveSuccessData && (
            <div className="p-3 rounded-xl bg-[#07191e] border border-cyan-500/40 space-y-1.5 font-mono text-[11px]">
              <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
                <Check className="h-3.5 w-3.5 text-cyan-400" />
                <span>GPS Lock Established!</span>
              </div>
              <div className="text-slate-300 grid grid-cols-2 gap-1 pt-1">
                <span>Lat: {liveSuccessData.latitude.toFixed(5)}</span>
                <span>Lng: {liveSuccessData.longitude.toFixed(5)}</span>
                <span>Accuracy: ±{liveSuccessData.accuracyMeters}m</span>
                <span className="text-emerald-400">Status: High Precision</span>
              </div>
            </div>
          )}

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-[#142332]"></div>
            <span className="flex-shrink mx-3 text-[10px] text-slate-500 uppercase tracking-widest font-mono">
              Or Customize Target Site
            </span>
            <div className="flex-grow border-t border-[#142332]"></div>
          </div>

          {/* Custom Lat / Lng inputs */}
          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-medium text-slate-300 block mb-1">
                Microclimate Site Label
              </label>
              <input
                type="text"
                value={locationLabel}
                onChange={(e) => setLocationLabel(e.target.value)}
                placeholder="e.g. My Neighborhood Block"
                className="w-full bg-[#050b10] border border-[#162738] rounded-lg py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-400 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                  Latitude
                </label>
                <input
                  type="text"
                  value={customLat}
                  onChange={(e) => setCustomLat(e.target.value)}
                  placeholder="37.7749"
                  className="w-full bg-[#050b10] border border-[#162738] rounded-lg py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-400 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                  Longitude
                </label>
                <input
                  type="text"
                  value={customLng}
                  onChange={(e) => setCustomLng(e.target.value)}
                  placeholder="-122.4194"
                  className="w-full bg-[#050b10] border border-[#162738] rounded-lg py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-400 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={handleApplyLocation}
            className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-[#05080c] font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg shadow-emerald-950/40 pt-2"
          >
            <span>Fly Map & Simulate This Location</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
