export type MetricType = 'hours' | 'km';

export type VehicleCategory = 
  | 'road_moto' 
  | 'enduro_pit' 
  | 'marine' 
  | 'car' 
  | 'power_equipment';

export interface QuickSpecs {
  engineOil?: string;
  engineOilCapacity?: string;
  oilFilter?: string;
  airFilter?: string;
  sparkPlugs?: string;
  gearOil?: string;
  drainPlugTorque?: string;
  pressures?: string;
  fuelMix?: string;
  notes?: string;
}

export interface MaintenanceRule {
  id: string;
  name: string;
  intervalHours?: number;
  intervalKm?: number;
  intervalMonths?: number;
  lastPerformedDate: string; // ISO date YYYY-MM-DD
  lastPerformedHours?: number;
  lastPerformedKm?: number;
}

export interface Vehicle {
  id: string;
  name: string;
  year?: number;
  category: VehicleCategory;
  primaryMetric: MetricType;
  currentHours?: number;
  currentKm?: number;
  lastUpdatedDate: string;
  isArchived?: boolean;
  archivedDate?: string;
  specs: QuickSpecs;
  rules: MaintenanceRule[];
}

export interface ServiceRecord {
  id: string;
  vehicleId: string;
  vehicleName: string;
  date: string;
  hours?: number;
  km?: number;
  servicedRuleIds: string[];
  servicedTitles: string[];
  type: 'diy' | 'service'; // DIY (В гараже) или Мастерская
  cost?: number;
  partsUsed?: string;
  notes?: string;
}

export type UrgencyStatus = 'overdue' | 'due_soon' | 'ok';

export interface RuleStatusInfo {
  rule: MaintenanceRule;
  status: UrgencyStatus;
  remainingUnits: number; // negative if overdue
  unitLabel: string;
  description: string;
}
