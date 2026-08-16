export interface District {
  id: string;
  name: string;
  code: string;
  description: string;
  center: [number, number]; // [lat, lng]
  zoom: number;
  bounds: [[number, number], [number, number]];
  baselineTempC: number;
  baselineTempF: number;
  currentCanopyPct: number;
  imperviousSurfacePct: number;
  baselineAlbedo: number;
  vulnerabilityScore: number;
  population: number;
  areaKm2: number;
  hotspotsCount: number;
  surfaceGrid: SpatialGridCell[];
}

export interface SpatialGridCell {
  id: string;
  lat: number;
  lng: number;
  baseLST: number; // Land Surface Temp
  albedo: number;
  vegetationIndex: number; // 0 to 1 NDVI
  landCover: "asphalt_canyon" | "commercial_roof" | "parking_lot" | "urban_park" | "residential_dense";
  buildingFootprintM2: number;
}

export type InterventionType = "tree_canopy" | "green_roof" | "cool_roof" | "permeable_pavement" | "misting_station" | "pocket_park";

export interface SpatialIntervention {
  id: string;
  type: InterventionType;
  name: string;
  lat: number;
  lng: number;
  radiusMeters: number;
  coveragePct: number; // e.g. 50%
  coolingEffectC: number;
  energyReductionKwhYr: number;
  costUsd: number;
  installedAt: string;
}

export interface InterventionsState {
  canopyCoveragePct: number;      // Urban tree canopy addition (0 - 100%)
  coolRoofAdoptionPct: number;    // High-albedo cool roof retrofit (0 - 100%)
  permeablePavementPct: number;   // Permeable asphalt & bioswales (0 - 100%)
  waterMistingDensityPct: number; // Evaporative cooling & fountains (0 - 100%)
  verticalGardensPct: number;     // Green facades & living walls (0 - 100%)
}

export interface CalculatedMetrics {
  tempReductionC: number;
  tempReductionF: number;
  postInterventionTempC: number;
  postInterventionTempF: number;
  peakSurfaceReductionC: number;
  annualEnergySavingsMwh: number;
  annualCostSavingsUsd: number;
  capitalCostEstimateUsd: number;
  carbonOffsetTonsYear: number;
  stormwaterRetainedM3: number;
  airQualityIndexDeltaPct: number;
  paybackPeriodYears: number;
  heatStressReductionScore: number;
  uhiIntensityDelta: number;
  // Spatial aggregates
  simulatedHotspotsCooled: number;
  greenAreaAddedM2: number;
  buildingAreaReflectedM2: number;
}

export type HeatMapLayerType = 
  | "post_intervention" 
  | "baseline_lst" 
  | "thermal_delta" 
  | "surface_temp" 
  | "air_temp" 
  | "cooling_effect"
  | "ndvi_vegetation";

export interface HeatMapHotspot {
  id: string;
  name: string;
  lat: number;
  lng: number;
  gridX: number; // 0-100%
  gridY: number; // 0-100%
  baselineTempC: number;
  currentTempC: number;
  landUse: "Commercial Asphalt" | "Industrial Flat Roof" | "Parking Lagoon" | "Dense Urban Canyon" | "Transit Hub";
  albedo: number;
  canopyPct: number;
  priorityLevel: "Critical" | "High" | "Moderate";
}

export interface ScenarioPreset {
  id: string;
  title: string;
  tagline: string;
  iconName: string;
  color: string;
  interventions: InterventionsState;
}

export interface SavedSimulationPlan {
  id: string;
  title: string;
  districtId: string;
  districtName: string;
  interventions: InterventionsState;
  spatialInterventions: SpatialIntervention[];
  metrics: CalculatedMetrics;
  createdAt: string;
  notes?: string;
}

export interface SimulationRunRecord {
  id: string;
  runNumber: number;
  name: string;
  timestamp: string;
  districtId: string;
  districtName: string;
  districtCode: string;
  interventions: InterventionsState;
  spatialInterventions: SpatialIntervention[];
  metrics: CalculatedMetrics;
  notes?: string;
  tags?: string[];
  isBaseline?: boolean;
}

export interface UserPreferences {
  tempUnit: "C" | "F";
  defaultTile: "dark" | "osm" | "satellite";
  gridResolution: "standard" | "high";
  currency: "USD" | "EUR" | "GBP";
  audioEffects: boolean;
  autoSaveHistory: boolean;
  showLivePulse: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar: string;
  role: string;
  organization: string;
  location?: string;
  bio?: string;
  joinedAt: string;
  simulationsRunCount: number;
  preferences: UserPreferences;
}

export interface LiveLocationData {
  isActive: boolean;
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  altitudeMeters?: number;
  cityName?: string;
  timestamp: string;
  error?: string;
}

