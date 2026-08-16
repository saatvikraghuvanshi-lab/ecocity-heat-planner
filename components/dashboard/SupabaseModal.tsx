import React, { useState } from "react";
import { 
  Database, 
  Copy, 
  Check, 
  Code, 
  Layers, 
  Sparkles, 
  Server, 
  Key,
  ExternalLink
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState<boolean>(false);

  const sqlSchema = `-- Supabase PostGIS Urban Heat Island Schema & Tables
-- Enable PostGIS extension for spatial polygon queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Districts Master Table
CREATE TABLE IF NOT EXISTS urban_districts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  district_code TEXT UNIQUE NOT NULL,
  baseline_lst_celsius NUMERIC(4, 2) NOT NULL,
  current_canopy_pct NUMERIC(4, 2) NOT NULL,
  impervious_surface_pct NUMERIC(4, 2) NOT NULL,
  vulnerability_score INTEGER NOT NULL,
  boundary_geom GEOMETRY(Polygon, 4326),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Simulation Runs Table
CREATE TABLE IF NOT EXISTS simulations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  district_id TEXT REFERENCES urban_districts(id),
  scenario_name TEXT NOT NULL,
  canopy_coverage_pct NUMERIC(4, 2) NOT NULL,
  cool_roof_adoption_pct NUMERIC(4, 2) NOT NULL,
  permeable_pavement_pct NUMERIC(4, 2) NOT NULL,
  water_misting_density_pct NUMERIC(4, 2) NOT NULL,
  vertical_gardens_pct NUMERIC(4, 2) NOT NULL,
  temp_reduction_celsius NUMERIC(4, 2) NOT NULL,
  energy_savings_mwh INTEGER NOT NULL,
  cost_estimate_usd INTEGER NOT NULL,
  carbon_offset_tons INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PostGIS RPC Function for Spatial Thermal Hotspot Intersections
CREATE OR REPLACE FUNCTION get_district_thermal_summary(p_district_id TEXT)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'district_id', id,
    'mean_temp', baseline_lst_celsius,
    'area_sqkm', ST_Area(boundary_geom::geography) / 1000000
  ) INTO result
  FROM urban_districts
  WHERE id = p_district_id;
  RETURN result;
END;
$$ LANGUAGE plpgsql;`;

  const routeHandlerSnippet = `// /app/api/simulation/route.ts (Next.js App Router)
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  const { districtId, interventions, scenarioName } = await req.json();
  
  // Thermodynamic calculation & PostGIS database save
  const { data, error } = await supabase.saveSimulation({
    district_id: districtId,
    scenario_name: scenarioName || "Active Model",
    ...interventions,
    temp_reduction_celsius: calculateCooling(interventions),
  });

  return Response.json({ success: true, record: data });
}`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-6 overflow-hidden">
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Database className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900">
                Supabase & PostGIS Integration Points
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Placeholder client configured in <code className="font-mono text-emerald-700 font-semibold">/lib/supabaseClient.ts</code> with Next.js App Router routes.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-2">
          <Tabs defaultValue="schema" className="w-full">
            <TabsList className="grid grid-cols-2 bg-slate-100 h-9">
              <TabsTrigger value="schema" className="text-xs">PostGIS SQL Schema</TabsTrigger>
              <TabsTrigger value="api" className="text-xs">App Router API Handler</TabsTrigger>
            </TabsList>

            <TabsContent value="schema" className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Run this SQL in Supabase SQL Editor:</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(sqlSchema)}
                  className="h-7 text-xs gap-1 border-slate-200"
                >
                  {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                  {copied ? "Copied!" : "Copy SQL"}
                </Button>
              </div>
              <pre className="p-3 rounded-lg bg-slate-950 text-slate-100 text-[11px] font-mono overflow-x-auto max-h-60 border border-slate-800 leading-relaxed">
                {sqlSchema}
              </pre>
            </TabsContent>

            <TabsContent value="api" className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Next.js App Router Handler in <code className="font-mono text-emerald-700">/app/api/simulation/route.ts</code>:</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(routeHandlerSnippet)}
                  className="h-7 text-xs gap-1 border-slate-200"
                >
                  {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                  {copied ? "Copied!" : "Copy Route"}
                </Button>
              </div>
              <pre className="p-3 rounded-lg bg-slate-950 text-emerald-300 text-[11px] font-mono overflow-x-auto max-h-60 border border-slate-800 leading-relaxed">
                {routeHandlerSnippet}
              </pre>
            </TabsContent>
          </Tabs>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2">
            <h4 className="font-semibold text-slate-800 flex items-center gap-1.5">
              <Key className="h-3.5 w-3.5 text-amber-600" />
              Environment Variables for Local Development (.env.local)
            </h4>
            <div className="p-2 rounded bg-white border border-slate-200 font-mono text-[11px] text-slate-700 select-all space-y-1">
              <div>NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co</div>
              <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...</div>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <Button onClick={onClose} size="sm" className="bg-slate-900 text-white text-xs px-4">
            Close Inspector
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
