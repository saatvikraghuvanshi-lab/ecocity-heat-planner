import { District, InterventionsState, CalculatedMetrics, ScenarioPreset, HeatMapHotspot, SpatialIntervention, SpatialGridCell, SavedSimulationPlan, SimulationRunRecord, UserProfile } from "@/types/dashboard";

// Geospatial Sector Definitions with real coordinate bounds
export const DISTRICTS: District[] = [
  {
    id: "downtown-sector-a",
    name: "Downtown Sector A",
    code: "SEC-A",
    description: "High-density commercial core with 84% impervious surface and severe canyon heat trapping.",
    center: [37.7749, -122.4194], // San Francisco Market St corridor / Urban core
    zoom: 15,
    bounds: [[37.768, -122.428], [37.782, -122.410]],
    baselineTempC: 38.4,
    baselineTempF: 101.1,
    currentCanopyPct: 12.0,
    imperviousSurfacePct: 84.0,
    baselineAlbedo: 0.12,
    vulnerabilityScore: 88,
    population: 74200,
    areaKm2: 8.4,
    hotspotsCount: 8,
    surfaceGrid: generateSpatialGrid(37.7749, -122.4194, 38.4, 0.12, 0.14),
  },
  {
    id: "commercial-sector-b",
    name: "Commercial Sector B",
    code: "SEC-B",
    description: "Retail corridor with wide multi-lane boulevards and expansive flat dark rooftops.",
    center: [37.7833, -122.4045], // SoMa / Financial fringe
    zoom: 15,
    bounds: [[37.776, -122.414], [37.790, -122.395]],
    baselineTempC: 39.6,
    baselineTempF: 103.3,
    currentCanopyPct: 8.5,
    imperviousSurfacePct: 88.5,
    baselineAlbedo: 0.14,
    vulnerabilityScore: 82,
    population: 52000,
    areaKm2: 9.8,
    hotspotsCount: 11,
    surfaceGrid: generateSpatialGrid(37.7833, -122.4045, 39.6, 0.14, 0.08),
  },
  {
    id: "industrial-sector-c",
    name: "Industrial Sector C",
    code: "SEC-C",
    description: "Logistics facilities and manufacturing plants with high thermal radiation asphalt lots.",
    center: [37.7550, -122.3900], // Bayview / Dogpatch logistics hub
    zoom: 14,
    bounds: [[37.745, -122.405], [37.765, -122.375]],
    baselineTempC: 41.2,
    baselineTempF: 106.2,
    currentCanopyPct: 4.8,
    imperviousSurfacePct: 91.0,
    baselineAlbedo: 0.11,
    vulnerabilityScore: 79,
    population: 28400,
    areaKm2: 14.2,
    hotspotsCount: 14,
    surfaceGrid: generateSpatialGrid(37.7550, -122.3900, 41.2, 0.11, 0.05),
  },
  {
    id: "waterfront-sector-d",
    name: "Waterfront Basin D",
    code: "SEC-D",
    description: "Mixed port and coastal promenade with maritime humidity interaction and breeze corridors.",
    center: [37.7980, -122.3980], // Embarcadero Waterfront
    zoom: 15,
    bounds: [[37.790, -122.408], [37.806, -122.388]],
    baselineTempC: 34.8,
    baselineTempF: 94.6,
    currentCanopyPct: 18.0,
    imperviousSurfacePct: 62.0,
    baselineAlbedo: 0.19,
    vulnerabilityScore: 54,
    population: 41000,
    areaKm2: 7.6,
    hotspotsCount: 5,
    surfaceGrid: generateSpatialGrid(37.7980, -122.3980, 34.8, 0.19, 0.22),
  },
  {
    id: "residential-sector-e",
    name: "Residential Sector E",
    code: "SEC-E",
    description: "Medium-density residential neighborhood with aging canopy and school ground heat islands.",
    center: [37.7600, -122.4350], // Mission / Castro perimeter
    zoom: 15,
    bounds: [[37.750, -122.445], [37.770, -122.425]],
    baselineTempC: 36.2,
    baselineTempF: 97.2,
    currentCanopyPct: 22.4,
    imperviousSurfacePct: 56.0,
    baselineAlbedo: 0.20,
    vulnerabilityScore: 71,
    population: 86500,
    areaKm2: 11.5,
    hotspotsCount: 7,
    surfaceGrid: generateSpatialGrid(37.7600, -122.4350, 36.2, 0.20, 0.28),
  },
];

// Helper to generate a spatial grid array of geospatial surface points
function generateSpatialGrid(
  centerLat: number,
  centerLng: number,
  baseTemp: number,
  baseAlbedo: number,
  baseNDVI: number
): SpatialGridCell[] {
  const cells: SpatialGridCell[] = [];
  const rows = 6;
  const cols = 6;
  const dLat = 0.0022;
  const dLng = 0.0032;

  const landTypes: ("asphalt_canyon" | "commercial_roof" | "parking_lot" | "urban_park" | "residential_dense")[] = [
    "asphalt_canyon",
    "commercial_roof",
    "parking_lot",
    "residential_dense",
    "commercial_roof",
    "asphalt_canyon"
  ];

  let idCounter = 1;
  for (let r = -rows / 2; r < rows / 2; r++) {
    for (let c = -cols / 2; c < cols / 2; c++) {
      const lat = centerLat + r * dLat + (Math.random() - 0.5) * 0.0006;
      const lng = centerLng + c * dLng + (Math.random() - 0.5) * 0.0006;
      const variation = (Math.sin(r) + Math.cos(c) * 1.5) * 1.4;
      const cellLST = parseFloat((baseTemp + variation).toFixed(1));
      const type = landTypes[Math.abs(r * cols + c) % landTypes.length];

      cells.push({
        id: `grid-${idCounter++}`,
        lat,
        lng,
        baseLST: cellLST,
        albedo: parseFloat((baseAlbedo + (type === "urban_park" ? 0.08 : -0.02)).toFixed(2)),
        vegetationIndex: type === "urban_park" ? 0.65 : Math.max(0.04, baseNDVI + (Math.random() * 0.08)),
        landCover: type,
        buildingFootprintM2: Math.round(1200 + Math.random() * 3500),
      });
    }
  }
  return cells;
}

export const INITIAL_HOTSPOTS: HeatMapHotspot[] = [
  {
    id: "hs-1",
    name: "Central Transit Plaza & Bus Terminal",
    lat: 37.7765,
    lng: -122.4172,
    gridX: 48,
    gridY: 36,
    baselineTempC: 43.6,
    currentTempC: 43.6,
    landUse: "Dense Urban Canyon",
    albedo: 0.10,
    canopyPct: 4,
    priorityLevel: "Critical",
  },
  {
    id: "hs-2",
    name: "Commercial Center Flat Asphalt Roofs",
    lat: 37.7788,
    lng: -122.4120,
    gridX: 62,
    gridY: 28,
    baselineTempC: 44.8,
    currentTempC: 44.8,
    landUse: "Industrial Flat Roof",
    albedo: 0.09,
    canopyPct: 2,
    priorityLevel: "Critical",
  },
  {
    id: "hs-3",
    name: "Grand Boulevard Multi-Lane Highway Intersect",
    lat: 37.7715,
    lng: -122.4230,
    gridX: 30,
    gridY: 65,
    baselineTempC: 42.1,
    currentTempC: 42.1,
    landUse: "Commercial Asphalt",
    albedo: 0.12,
    canopyPct: 8,
    priorityLevel: "High",
  },
  {
    id: "hs-4",
    name: "North Logistics Surface Parking Lagoon",
    lat: 37.7798,
    lng: -122.4245,
    gridX: 74,
    gridY: 72,
    baselineTempC: 41.5,
    currentTempC: 41.5,
    landUse: "Parking Lagoon",
    albedo: 0.11,
    canopyPct: 6,
    priorityLevel: "High",
  },
  {
    id: "hs-5",
    name: "Financial District Deep Canyon",
    lat: 37.7812,
    lng: -122.4160,
    gridX: 25,
    gridY: 32,
    baselineTempC: 39.8,
    currentTempC: 39.8,
    landUse: "Dense Urban Canyon",
    albedo: 0.15,
    canopyPct: 12,
    priorityLevel: "Moderate",
  },
];

export const INITIAL_SPATIAL_INTERVENTIONS: SpatialIntervention[] = [
  {
    id: "sp-1",
    type: "tree_canopy",
    name: "Boulevard Green Canopy Corridor",
    lat: 37.7758,
    lng: -122.4180,
    radiusMeters: 140,
    coveragePct: 45,
    coolingEffectC: 2.8,
    energyReductionKwhYr: 38000,
    costUsd: 65000,
    installedAt: "2026-04-10",
  },
  {
    id: "sp-2",
    type: "green_roof",
    name: "Transit Terminal Biosolar Roof",
    lat: 37.7766,
    lng: -122.4168,
    radiusMeters: 90,
    coveragePct: 60,
    coolingEffectC: 3.4,
    energyReductionKwhYr: 52000,
    costUsd: 110000,
    installedAt: "2026-05-18",
  },
  {
    id: "sp-3",
    type: "cool_roof",
    name: "Civic Center High-Albedo White Membrane",
    lat: 37.7792,
    lng: -122.4132,
    radiusMeters: 110,
    coveragePct: 75,
    coolingEffectC: 2.4,
    energyReductionKwhYr: 41000,
    costUsd: 48000,
    installedAt: "2026-06-01",
  },
  {
    id: "sp-4",
    type: "misting_station",
    name: "Pedestrian Plaza Microclimate Misting Array",
    lat: 37.7745,
    lng: -122.4205,
    radiusMeters: 75,
    coveragePct: 50,
    coolingEffectC: 3.1,
    energyReductionKwhYr: 18000,
    costUsd: 28000,
    installedAt: "2026-07-12",
  },
];

export const SCENARIO_PRESETS: ScenarioPreset[] = [
  {
    id: "preset-moderate-greening",
    title: "Urban Forest Expansion",
    tagline: "Prioritizes street tree canopy and pocket park network",
    iconName: "Trees",
    color: "emerald",
    interventions: {
      canopyCoveragePct: 45,
      coolRoofAdoptionPct: 20,
      permeablePavementPct: 25,
      waterMistingDensityPct: 10,
      verticalGardensPct: 15,
    },
  },
  {
    id: "preset-cool-roofs",
    title: "High-Albedo Reflective Retrofit",
    tagline: "Aggressive cool roof deployment on industrial and commercial flat roofs",
    iconName: "Sun",
    color: "sky",
    interventions: {
      canopyCoveragePct: 15,
      coolRoofAdoptionPct: 75,
      permeablePavementPct: 35,
      waterMistingDensityPct: 10,
      verticalGardensPct: 10,
    },
  },
  {
    id: "preset-sponge-city",
    title: "Sponge City & Hydrological Cooling",
    tagline: "Permeable pavements, bioswales, and evaporative misting networks",
    iconName: "Droplets",
    color: "cyan",
    interventions: {
      canopyCoveragePct: 25,
      coolRoofAdoptionPct: 30,
      permeablePavementPct: 65,
      waterMistingDensityPct: 40,
      verticalGardensPct: 25,
    },
  },
  {
    id: "preset-net-zero-extreme",
    title: "Maximum Comprehensive Resilience",
    tagline: "Combined multi-layered intervention for maximum temperature reduction",
    iconName: "ShieldCheck",
    color: "teal",
    interventions: {
      canopyCoveragePct: 60,
      coolRoofAdoptionPct: 70,
      permeablePavementPct: 50,
      waterMistingDensityPct: 35,
      verticalGardensPct: 45,
    },
  },
];

/**
 * Thermodynamic Urban Cooling Calculation Engine
 */
export function calculateUhiMetrics(
  district: District,
  interventions: InterventionsState,
  customSpatialInterventions: SpatialIntervention[] = []
): CalculatedMetrics {
  const {
    canopyCoveragePct,
    coolRoofAdoptionPct,
    permeablePavementPct,
    waterMistingDensityPct,
    verticalGardensPct,
  } = interventions;

  // Evapotranspiration cooling curve
  const canopyEffect = (canopyCoveragePct * 0.046) * (1 - (canopyCoveragePct * 0.0015));
  // High albedo radiation deflection
  const coolRoofEffect = (coolRoofAdoptionPct * 0.026) * (district.imperviousSurfacePct / 70);
  // Ground heat flux reduction via permeable pores
  const pavementEffect = (permeablePavementPct * 0.018);
  // Direct evaporative micro-cooling
  const mistingEffect = (waterMistingDensityPct * 0.016);
  // Vertical thermal buffer
  const verticalEffect = (verticalGardensPct * 0.012);

  // Additional boost from user-placed spatial pins
  const spatialBoost = customSpatialInterventions.reduce((sum, item) => sum + item.coolingEffectC * 0.08, 0);

  const rawDeltaC = canopyEffect + coolRoofEffect + pavementEffect + mistingEffect + verticalEffect + spatialBoost;
  const tempReductionC = parseFloat(Math.min(rawDeltaC, 7.5).toFixed(1));
  const tempReductionF = parseFloat((tempReductionC * 1.8).toFixed(1));

  const postInterventionTempC = parseFloat((district.baselineTempC - tempReductionC).toFixed(1));
  const postInterventionTempF = parseFloat((postInterventionTempC * 1.8 + 32).toFixed(1));
  const peakSurfaceReductionC = parseFloat((tempReductionC * 2.2).toFixed(1));

  // HVAC load drops ~1.3% per °F
  const baselineDistrictMwh = district.population * 0.65 * (district.imperviousSurfacePct / 50);
  const energySavingsRatio = (tempReductionF * 0.0135);
  const annualEnergySavingsMwh = Math.round(baselineDistrictMwh * energySavingsRatio);
  const annualCostSavingsUsd = Math.round(annualEnergySavingsMwh * 1000 * 0.165);

  // Capital costs estimation
  const spatialCost = customSpatialInterventions.reduce((sum, item) => sum + item.costUsd, 0);
  const capitalCostEstimateUsd = Math.round(
    canopyCoveragePct * 24000 * (district.areaKm2 / 8) +
    coolRoofAdoptionPct * 18000 * (district.areaKm2 / 8) +
    permeablePavementPct * 14500 * (district.areaKm2 / 8) +
    waterMistingDensityPct * 9000 +
    verticalGardensPct * 11000 +
    spatialCost
  );

  const paybackPeriodYears = parseFloat(
    (capitalCostEstimateUsd / Math.max(annualCostSavingsUsd, 2500)).toFixed(1)
  );

  // Carbon
  const avoidedGridCo2Tons = (annualEnergySavingsMwh * 1000 * 0.385) / 1000;
  const treeBiomassCo2Tons = (canopyCoveragePct * 4.8 * (district.areaKm2 / 6));
  const carbonOffsetTonsYear = Math.round(avoidedGridCo2Tons + treeBiomassCo2Tons);

  // Stormwater
  const stormwaterRetainedM3 = Math.round(
    (canopyCoveragePct * 175 + permeablePavementPct * 410) * (district.areaKm2 / 8)
  );

  const airQualityIndexDeltaPct = Math.min(
    Math.round(canopyCoveragePct * 0.45 + verticalGardensPct * 0.25),
    55
  );

  const heatStressReductionScore = Math.min(
    Math.round(district.vulnerabilityScore * (1 - (tempReductionC / 8.5))),
    100
  );

  const uhiIntensityDelta = -parseFloat((tempReductionC * 0.88).toFixed(1));

  // Spatial metrics
  const greenAreaAddedM2 = Math.round(canopyCoveragePct * 4200 * district.areaKm2);
  const buildingAreaReflectedM2 = Math.round(coolRoofAdoptionPct * 3100 * district.areaKm2);
  const simulatedHotspotsCooled = Math.min(
    district.hotspotsCount,
    Math.ceil((tempReductionC / district.baselineTempC) * district.hotspotsCount * 3.5)
  );

  return {
    tempReductionC,
    tempReductionF,
    postInterventionTempC,
    postInterventionTempF,
    peakSurfaceReductionC,
    annualEnergySavingsMwh,
    annualCostSavingsUsd,
    capitalCostEstimateUsd,
    carbonOffsetTonsYear,
    stormwaterRetainedM3,
    airQualityIndexDeltaPct,
    paybackPeriodYears,
    heatStressReductionScore,
    uhiIntensityDelta,
    simulatedHotspotsCooled,
    greenAreaAddedM2,
    buildingAreaReflectedM2,
  };
}

// Database helper functions for simulation persistence in LocalStorage / IndexedDB
const STORAGE_KEY_PLANS = "ecocity_heat_plans_db_v1";

export function loadSavedPlansFromDB(): SavedSimulationPlan[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PLANS);
    if (!raw) return getDefaultSavedPlans();
    return JSON.parse(raw);
  } catch {
    return getDefaultSavedPlans();
  }
}

export function savePlanToDB(plan: SavedSimulationPlan): SavedSimulationPlan[] {
  try {
    const existing = loadSavedPlansFromDB();
    const updated = [plan, ...existing.filter((p) => p.id !== plan.id)];
    localStorage.setItem(STORAGE_KEY_PLANS, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error("Failed to save plan to DB:", err);
    return loadSavedPlansFromDB();
  }
}

export function deletePlanFromDB(planId: string): SavedSimulationPlan[] {
  try {
    const existing = loadSavedPlansFromDB();
    const filtered = existing.filter((p) => p.id !== planId);
    localStorage.setItem(STORAGE_KEY_PLANS, JSON.stringify(filtered));
    return filtered;
  } catch (err) {
    console.error("Failed to delete plan from DB:", err);
    return loadSavedPlansFromDB();
  }
}

function getDefaultSavedPlans(): SavedSimulationPlan[] {
  const d = DISTRICTS[0];
  const iv: InterventionsState = {
    canopyCoveragePct: 25,
    coolRoofAdoptionPct: 40,
    permeablePavementPct: 30,
    waterMistingDensityPct: 20,
    verticalGardensPct: 20,
  };
  return [
    {
      id: "plan-default-2030",
      title: "2030 Downtown Resilient Canopy Plan",
      districtId: d.id,
      districtName: d.name,
      interventions: iv,
      spatialInterventions: INITIAL_SPATIAL_INTERVENTIONS,
      metrics: calculateUhiMetrics(d, iv, INITIAL_SPATIAL_INTERVENTIONS),
      createdAt: "2026-08-10T10:30:00.000Z",
      notes: "Approved proposal for municipal heat mitigation grant submission with OpenStreetMap geospatial validation.",
    },
  ];
}

// ----------------------------------------------------
// SIMULATION RUNS HISTORY TIMELINE PERSISTENCE
// ----------------------------------------------------
const STORAGE_KEY_HISTORY = "ecocity_simulation_history_v2";

export function loadSimulationHistoryFromDB(): SimulationRunRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (!raw) return getDefaultSimulationHistory();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : getDefaultSimulationHistory();
  } catch {
    return getDefaultSimulationHistory();
  }
}

export function saveSimulationRunToDB(run: SimulationRunRecord): SimulationRunRecord[] {
  try {
    const existing = loadSimulationHistoryFromDB();
    // Prepend new run to keep chronological order (newest first)
    const updated = [run, ...existing.filter((r) => r.id !== run.id)];
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error("Failed to save simulation run:", err);
    return loadSimulationHistoryFromDB();
  }
}

export function deleteSimulationRunFromDB(runId: string): SimulationRunRecord[] {
  try {
    const existing = loadSimulationHistoryFromDB();
    const filtered = existing.filter((r) => r.id !== runId);
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(filtered));
    return filtered;
  } catch (err) {
    console.error("Failed to delete simulation run:", err);
    return loadSimulationHistoryFromDB();
  }
}

export function clearSimulationHistoryDB(): SimulationRunRecord[] {
  try {
    localStorage.removeItem(STORAGE_KEY_HISTORY);
    return [];
  } catch (err) {
    console.error("Failed to clear simulation history:", err);
    return [];
  }
}

export function getDefaultSimulationHistory(): SimulationRunRecord[] {
  const d0 = DISTRICTS[0];
  const d1 = DISTRICTS[1];
  
  // Baseline Run #1
  const run1Interventions: InterventionsState = {
    canopyCoveragePct: 0,
    coolRoofAdoptionPct: 0,
    permeablePavementPct: 0,
    waterMistingDensityPct: 0,
    verticalGardensPct: 0,
  };
  const run1Metrics = calculateUhiMetrics(d0, run1Interventions, []);

  // Run #2: Street Tree Canopy Expansion
  const run2Interventions: InterventionsState = {
    canopyCoveragePct: 35,
    coolRoofAdoptionPct: 15,
    permeablePavementPct: 20,
    waterMistingDensityPct: 10,
    verticalGardensPct: 10,
  };
  const run2Metrics = calculateUhiMetrics(d0, run2Interventions, [INITIAL_SPATIAL_INTERVENTIONS[0]]);

  // Run #3: Cool Roofs & High Albedo
  const run3Interventions: InterventionsState = {
    canopyCoveragePct: 20,
    coolRoofAdoptionPct: 65,
    permeablePavementPct: 35,
    waterMistingDensityPct: 15,
    verticalGardensPct: 15,
  };
  const run3Metrics = calculateUhiMetrics(d1, run3Interventions, [INITIAL_SPATIAL_INTERVENTIONS[2]]);

  // Run #4: Comprehensive 2030 Resilience Portfolio
  const run4Interventions: InterventionsState = {
    canopyCoveragePct: 50,
    coolRoofAdoptionPct: 55,
    permeablePavementPct: 45,
    waterMistingDensityPct: 30,
    verticalGardensPct: 35,
  };
  const run4Metrics = calculateUhiMetrics(d0, run4Interventions, INITIAL_SPATIAL_INTERVENTIONS);

  return [
    {
      id: "run-4-comprehensive",
      runNumber: 4,
      name: "Comprehensive 2030 Climate Adaptation",
      timestamp: "2026-08-15T14:45:00.000Z",
      districtId: d0.id,
      districtName: d0.name,
      districtCode: d0.code,
      interventions: run4Interventions,
      spatialInterventions: INITIAL_SPATIAL_INTERVENTIONS,
      metrics: run4Metrics,
      tags: ["Optimal", "Grant Target", "2030 Plan"],
      notes: "Balanced intervention portfolio achieving -4.6°C cooling with 9.2yr payback.",
    },
    {
      id: "run-3-cool-roofs",
      runNumber: 3,
      name: "High-Albedo Reflective Roof Retrofit",
      timestamp: "2026-08-14T11:20:00.000Z",
      districtId: d1.id,
      districtName: d1.name,
      districtCode: d1.code,
      interventions: run3Interventions,
      spatialInterventions: [INITIAL_SPATIAL_INTERVENTIONS[2]],
      metrics: run3Metrics,
      tags: ["Roofing", "High ROI"],
      notes: "Commercial flat roof coating program across retail boulevard.",
    },
    {
      id: "run-2-canopy",
      runNumber: 2,
      name: "Urban Tree Canopy Priority Network",
      timestamp: "2026-08-12T09:15:00.000Z",
      districtId: d0.id,
      districtName: d0.name,
      districtCode: d0.code,
      interventions: run2Interventions,
      spatialInterventions: [INITIAL_SPATIAL_INTERVENTIONS[0]],
      metrics: run2Metrics,
      tags: ["Green Infrastructure"],
      notes: "Initial boulevard shade tree planting pilot.",
    },
    {
      id: "run-1-baseline",
      runNumber: 1,
      name: "Historical Baseline Simulation",
      timestamp: "2026-08-10T08:00:00.000Z",
      districtId: d0.id,
      districtName: d0.name,
      districtCode: d0.code,
      interventions: run1Interventions,
      spatialInterventions: [],
      metrics: run1Metrics,
      tags: ["Baseline", "Control"],
      isBaseline: true,
      notes: "Existing conditions before any nature-based heat mitigation interventions.",
    },
  ];
}

// ----------------------------------------------------
// USER PROFILE & PREFERENCES PERSISTENCE
// ----------------------------------------------------
const STORAGE_KEY_USER = "ecocity_user_profile_v2";

export const DEFAULT_USER_PROFILE: UserProfile = {
  id: "usr-saatvik-2026",
  email: "saatvik@climate.ecocity.gov",
  name: "Dr. Saatvik Raghuvanshi",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  role: "Lead Climate Scientist & Urban Modeler",
  organization: "Department of Environment & Resilient Cities",
  location: "San Francisco, CA",
  bio: "Specializing in microclimate thermodynamics, urban heat island attenuation, and spatial GIS intervention modeling.",
  joinedAt: "2025-03-15",
  simulationsRunCount: 42,
  preferences: {
    tempUnit: "C",
    defaultTile: "dark",
    gridResolution: "standard",
    currency: "USD",
    audioEffects: true,
    autoSaveHistory: true,
    showLivePulse: true,
  },
};

export function loadUserProfileFromDB(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    if (!raw) return DEFAULT_USER_PROFILE;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_USER_PROFILE;
  }
}

export function saveUserProfileToDB(profile: UserProfile): UserProfile {
  try {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(profile));
    return profile;
  } catch (err) {
    console.error("Failed to save user profile:", err);
    return profile;
  }
}

// ----------------------------------------------------
// DYNAMIC LIVE LOCATION DISTRICT GENERATOR
// ----------------------------------------------------
export function createLiveDistrictFromCoordinates(
  lat: number,
  lng: number,
  customName?: string
): District {
  const dLat = 0.007;
  const dLng = 0.009;
  const roundedLat = parseFloat(lat.toFixed(4));
  const roundedLng = parseFloat(lng.toFixed(4));

  const baseTempC = 37.8;
  const baseTempF = parseFloat((baseTempC * 1.8 + 32).toFixed(1));

  return {
    id: `live-location-district-${Date.now()}`,
    name: customName || `Live Location (${roundedLat}, ${roundedLng})`,
    code: "GPS-LIVE",
    description: `Dynamic microclimate sector generated from live browser GPS positioning [${roundedLat}, ${roundedLng}].`,
    center: [roundedLat, roundedLng],
    zoom: 15,
    bounds: [
      [roundedLat - dLat, roundedLng - dLng],
      [roundedLat + dLat, roundedLng + dLng],
    ],
    baselineTempC: baseTempC,
    baselineTempF: baseTempF,
    currentCanopyPct: 14.5,
    imperviousSurfacePct: 78.0,
    baselineAlbedo: 0.14,
    vulnerabilityScore: 76,
    population: 48500,
    areaKm2: 9.2,
    hotspotsCount: 6,
    surfaceGrid: generateSpatialGrid(roundedLat, roundedLng, baseTempC, 0.14, 0.16),
  };
}

