/**
 * @file calculator.ts
 * @module types/calculator
 * @description Domain types and data models for SFS Oplate structural engineering
 * calculation engine, bill of quantities (Predmer & Specifikacija), and warehouse fleet matching.
 *
 * Engineering Standards Compliance:
 * - DIN 18218: Pritisak svežeg betona na vertikalnu oplatu (Fresh concrete pressure on vertical formwork)
 * - DIN 18216: Anker pribor za oplatu (Formwork tie systems DW15)
 * - EN 1065: Teleskopski čelični podupirači (Telescopic steel props class D/E)
 * - EN 13377: Prefabrikovani drveni nosači H20 (Timber formwork beams H20)
 * - EN 12812: Noseća skela i oplatni sistemi (Falsework - performance requirements)
 */

export type WallHeightVariant = 2.70 | 3.00 | 3.30;

export type FormworkSystemCategory =
  | "Zidna oplata"
  | "Plafonska oplata"
  | "Podupirači"
  | "Skele"
  | "Prateći materijal";

export type ComponentUnit = "kom" | "m²" | "m'" | "pak" | "kg" | "L";

export type StockHealthStatus = "AVAILABLE" | "WARNING" | "CRITICAL" | "DEFICIT";

/**
 * Geometric and operational input parameters for Wall Formwork (Zidna Oplata).
 */
export interface WallCalculationInput {
  /**
   * Vertical formwork panel height in meters (2.70m, 3.00m, or 3.30m).
   */
  wallHeight: WallHeightVariant;

  /**
   * Total linear length of walls to formwork simultaneously in running meters (m').
   * Minimum: 6m, Maximum: 180m.
   */
  totalLength: number;

  /**
   * Total count of right-angle and acute/obtuse corners or wall junctions.
   * Dictates the number of inside and outside corner sets (CNR-INT / CNR-EXT).
   */
  cornersCount: number;

  /**
   * Reinforced concrete wall thickness in centimeters (e.g. 20, 25, 30, 40 cm).
   * Determines tie-rod length requirements and concrete hydrostatic lateral thrust.
   */
  wallThickness: number;

  /**
   * Planned rental duration in calendar days.
   * Default standard billing cycles: 14, 30, or 60 days.
   */
  durationDays?: number;

  /**
   * Maximum allowable concrete placement speed / rate (m/h) or design pressure.
   * Default: 60 kN/m² for standard slump concrete, up to 80 kN/m² for SCC / high-fluidity concrete.
   */
  designConcretePressureKnM2?: 60 | 70 | 80;
}

/**
 * Geometric and operational input parameters for Slab Formwork (Plafonska Oplata).
 */
export interface SlabCalculationInput {
  /**
   * Net floor surface area to shutter in square meters (m²).
   */
  slabArea: number;

  /**
   * Reinforced concrete slab thickness in centimeters (typically 16cm - 35cm).
   * Direct influence on primary/secondary beam spacing and prop load.
   */
  slabThickness: number;

  /**
   * Clear floor-to-ceiling working height in meters (typically 2.50m - 4.50m).
   * Dictates prop selection: Class D-30 (up to 3.0m), Class D-35 (up to 3.5m), or Class E-45 (up to 4.5m).
   */
  ceilingHeight: number;

  /**
   * Planned rental duration in calendar days.
   */
  durationDays?: number;
}

/**
 * Individual bill-of-quantities line item (Predmerska stavka opreme).
 */
export interface BillOfQuantitiesItem {
  /** Unique item identifier */
  id: string;

  /** Standard SFS catalog code (e.g. 'PAN-270-90', 'DW15-HOT-100') */
  code: string;

  /** Human-readable technical description in Serbian construction terminology */
  name: string;

  /** Equipment category */
  category: FormworkSystemCategory;

  /** Calculated required quantity */
  quantity: number;

  /** Physical unit of measurement */
  unit: ComponentUnit;

  /** Indicative rental price per unit per calendar day (EUR) */
  unitPricePerDay: number;

  /** Total rental price for specified rental duration (EUR) */
  totalRentalPriceEur: number;

  /** Total replacement value in case of loss or total destruction (EUR) */
  replacementValue: number;

  /** Approximate weight per individual unit in kilograms (kg) */
  weightPerUnitKg: number;

  /** Total weight of this item lot in kilograms (kg) */
  totalWeightKg: number;

  /** Technical engineering notes (e.g. DIN norm, allowable capacity) */
  engineeringNotes?: string;
}

/**
 * Aggregate structural, logistical, and financial metrics.
 */
export interface AggregateMetrics {
  /** Total formwork contact surface area (m²) */
  totalContactAreaM2: number;

  /** Linear length covered (m') */
  linearMeters: number;

  /** Total physical mass of the equipment lot in kilograms (kg) */
  totalEstimatedWeightKg: number;

  /** Total weight in metric tons (t) for logistics & crane calculation */
  totalWeightTons: number;

  /** Recommended minimum tie rod assemblies (DW15 šipke + matice) */
  recommendedTieRodsCount: number;

  /** Recommended minimum diagonal alignment struts (kose potpore / šprajcevi) */
  recommendedAlignmentStrutsCount: number;

  /** Recommended minimum panel alignment clamps (kandže / spone) */
  recommendedClampsCount: number;

  /** Daily rental run rate in EUR */
  dailyRentalCostEur: number;

  /** Daily rental run rate in RSD (indexed via NBS middle rate) */
  dailyRentalCostRsd: number;

  /** Subtotal rental cost for the requested duration before tax (EUR) */
  subtotalRentalEur: number;

  /** Standard refundable security deposit / collateral value (40% of rental) */
  refundableDepositEur: number;

  /** Total replacement insurance value for the full equipment lot (EUR) */
  totalLotReplacementValueEur: number;
}

/**
 * Complete calculation result payload for Wall or Slab formwork.
 */
export interface StructuralCalculationResult {
  /** Type of structural module evaluated */
  systemType: "wall" | "slab";

  /** High-level system title */
  systemTitle: string;

  /** Detailed engineering narrative summarizing structural assumptions */
  engineeringSummary: string;

  /** Itemized Bill of Quantities (Predmer i specifikacija) */
  lineItems: BillOfQuantitiesItem[];

  /** Aggregated structural, logistical, and financial metrics */
  metrics: AggregateMetrics;

  /** Applied design standards */
  designStandards: string[];
}

/**
 * Central Dobanovci warehouse inventory item record.
 */
export interface WarehouseStockRecord {
  /** Unique stock identifier */
  stockId: string;

  /** Catalog part code */
  code: string;

  /** Equipment name */
  name: string;

  /** Product category */
  category: FormworkSystemCategory;

  /** Total physical fleet size owned by SFS Oplate */
  totalFleetUnits: number;

  /** Units currently deployed on active construction sites */
  currentlyDeployedUnits: number;

  /** Units earmarked for pending approved contracts */
  reservedUnits: number;

  /** Physical stock currently sitting in Dobanovci Central Yard available for dispatch */
  availableInYardUnits: number;

  /** Unit of measurement */
  unit: ComponentUnit;

  /** Yard physical storage slot (e.g. 'Sektor A-02 Dobanovci') */
  locationSlot: string;
}

/**
 * Line-item inventory availability check result.
 */
export interface InventoryMatchItem {
  code: string;
  name: string;
  requestedQuantity: number;
  availableInYard: number;
  currentlyDeployed: number;
  reserved: number;
  totalFleet: number;
  projectedYardRemaining: number;
  projectedUtilizationRate: number;
  healthStatus: StockHealthStatus;
  notes?: string;
}

/**
 * Comprehensive inventory check result for an entire inquiry predmer.
 */
export interface FleetInventoryMatchReport {
  timestamp: string;
  isDispatchable: boolean;
  overallStatus: StockHealthStatus;
  maxUtilizationItem: {
    code: string;
    name: string;
    rate: number;
  };
  matchedItems: InventoryMatchItem[];
  warnings: string[];
  recommendations: string[];
}
