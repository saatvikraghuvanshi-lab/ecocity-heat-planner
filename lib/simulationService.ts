// lib/simulationService.ts

export interface SaveSimulationPayload {
  districtId: string;
  scenarioName: string;
  canopyCoveragePct: number;
  coolRoofAdoptionPct: number;
  permeablePavementPct?: number;
  waterMistingDensityPct?: number;
  verticalGardensPct?: number;
  tempReductionCelsius: number;
  tempReductionFahrenheit: number;
  energySavingsMwh?: number;
  costEstimateUsd?: number;
  carbonOffsetTons?: number;
  healthRiskReductionPct?: number;
  geojson?: any;
}

export async function saveSimulationRecord(payload: SaveSimulationPayload) {
  try {
    const response = await fetch("/api/simulation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to save simulation record:", error);
    return null;
  }
}