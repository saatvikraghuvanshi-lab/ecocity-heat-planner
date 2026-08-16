import React from "react";
import { 
  Building2, 
  MapPin, 
  Share2, 
  Download, 
  Sun, 
  Database, 
  Sparkles,
  RefreshCw,
  Layers,
  ThermometerSun,
  SplitSquareVertical,
  Sliders,
  FileText
} from "lucide-react";
import { District, CalculatedMetrics } from "@/types/dashboard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  district: District;
  metrics: CalculatedMetrics;
  activeViewMode: "simulator" | "comparison";
  onChangeViewMode: (mode: "simulator" | "comparison") => void;
  onOpenSupabaseModal: () => void;
  onOpenExportReportModal: () => void;
  onOpenExportProjectModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  district,
  metrics,
  activeViewMode,
  onChangeViewMode,
  onOpenSupabaseModal,
  onOpenExportReportModal,
  onOpenExportProjectModal,
}) => {
  return (
    <header id="dashboard-header" className="h-14 border-b border-slate-800 bg-slate-900 px-4 flex items-center justify-between gap-3 shrink-0 text-slate-100 shadow-sm">
      {/* Left: District & Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <ThermometerSun className="h-4 w-4" />
          </div>
          <span className="font-bold text-slate-100 text-sm hidden sm:inline">
            Urban Heat Island Mitigation Planner
          </span>
        </div>
        <span className="text-slate-700 hidden sm:inline">|</span>
        <div className="flex items-center gap-1.5 text-xs text-slate-300">
          <MapPin className="h-3.5 w-3.5 text-emerald-400" />
          <span className="font-semibold text-slate-100">{district.name}</span>
          <span className="text-slate-400 font-mono">({district.code})</span>
        </div>
      </div>

      {/* Center: View Switcher */}
      <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs">
        <button
          id="mode-toggle-simulator"
          onClick={() => onChangeViewMode("simulator")}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all font-medium cursor-pointer ${
            activeViewMode === "simulator"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Sliders className="h-3.5 w-3.5" />
          <span>Interactive Planner</span>
        </button>
        <button
          id="mode-toggle-comparison"
          onClick={() => onChangeViewMode("comparison")}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all font-medium cursor-pointer ${
            activeViewMode === "comparison"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <SplitSquareVertical className="h-3.5 w-3.5" />
          <span>Compare Scenarios</span>
        </button>
      </div>

      {/* Right: Real-time status & Actions */}
      <div className="flex items-center gap-2">
        {/* Heat Island Severity Badge */}
        <Badge variant="warning" className="hidden xl:flex items-center gap-1 text-[11px] font-normal py-0.5 bg-amber-950/80 text-amber-300 border-amber-800">
          <Sun className="h-3 w-3 text-amber-400" />
          <span>Heatwave Advisory ({district.baselineTempC}°C Base)</span>
        </Badge>

        <Button
          id="header-supabase-btn"
          variant="outline"
          size="sm"
          onClick={onOpenSupabaseModal}
          className="h-8 text-xs gap-1.5 border-slate-700 bg-slate-800/90 text-slate-200 hover:text-white hover:bg-slate-700 hidden md:flex"
        >
          <Database className="h-3.5 w-3.5 text-emerald-400" />
          <span>Supabase / PostGIS</span>
        </Button>

        <Button
          id="header-export-report-btn"
          size="sm"
          onClick={onOpenExportReportModal}
          className="h-8 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm font-medium"
        >
          <FileText className="h-3.5 w-3.5" />
          <span>Export Report</span>
        </Button>
      </div>
    </header>
  );
};
