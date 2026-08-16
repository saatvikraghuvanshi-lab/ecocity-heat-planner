// lib/simulationService.ts
import { supabase } from '@/lib/supabaseClient';

export async function saveSimulationRecord(simulationData: any) {
  const { data, error } = await supabase
    .from('simulations')
    .insert([
      {
        district_id: simulationData.districtId,
        scenario_name: simulationData.scenarioName,
        canopy_coverage_pct: simulationData.canopyCoveragePct,
        cool_roof_adoption_pct: simulationData.coolRoofAdoptionPct,
        temp_reduction_celsius: simulationData.tempReductionCelsius,
        temp_reduction_fahrenheit: simulationData.tempReductionFahrenheit,
        spatial_geojson: simulationData.geojson || null,
      },
    ])
    .select();

  if (error) {
    console.error('Error saving simulation:', error.message);
    return null;
  }
  return data;
}

export async function getSimulations() {
  const { data, error } = await supabase
    .from('simulations')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching simulations:', error.message);
    return [];
  }
  return data;
}