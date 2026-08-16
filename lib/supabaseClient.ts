/**
 * @file lib/supabaseClient.ts
 * @description Real Supabase client integration point for Urban Heat Island Mitigation Planner.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

export interface SpatialGeometry {
  type: string;
  coordinates: any;
}

export interface SimulationRecord {
  id?: string;
  created_at?: string;
  district_id: string;
  scenario_name: string;
  canopy_coverage_pct: number;
  cool_roof_adoption_pct: number;
  permeable_pavement_pct: number;
  water_misting_density_pct: number;
  vertical_gardens_pct: number;
  temp_reduction_celsius: number;
  temp_reduction_fahrenheit: number;
  energy_savings_mwh: number;
  cost_estimate_usd: number;
  carbon_offset_tons: number;
  health_risk_reduction_pct: number;
  spatial_geojson?: SpatialGeometry | null;
  user_id?: string;
}

export interface UrbanZoneRecord {
  id: string;
  name: string;
  district_code: string;
  baseline_lst_celsius: number;
  target_lst_celsius: number;
  current_canopy_pct: number;
  impervious_surface_pct: number;
  albedo_index: number;
  population_density: number;
  vulnerability_score: number; // 1-100
  boundary_geojson?: SpatialGeometry;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Export direct Supabase client instance
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Utility function to check if environment variables are correctly loaded
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

/**
 * Query historical simulations from the 'simulations' table
 */
export async function getSimulationsByDistrict(
  districtId: string
): Promise<{ data: SimulationRecord[] | null; error: any }> {
  const { data, error } = await supabase
    .from("simulations")
    .select("*")
    .eq("district_id", districtId)
    .order("created_at", { ascending: false });

  return { data, error };
}

/**
 * Persist simulation scenario to Supabase
 */
export async function saveSimulation(
  record: SimulationRecord
): Promise<{ data: SimulationRecord[] | null; error: any }> {
  const { data, error } = await supabase
    .from("simulations")
    .insert([record])
    .select();

  return { data, error };
}

/**
 * Perform spatial PostGIS RPC call for thermal index calculation
 */
export async function calculateSpatialThermalIndex(
  districtCode: string
): Promise<{ data: any; error: any }> {
  const { data, error } = await supabase.rpc("calculate_district_thermal_index", {
    district_code: districtCode,
  });

  return { data, error };
}