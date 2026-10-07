export type ProductCategory =
  | "Zidna oplata"
  | "Plafonska oplata"
  | "Podupirači"
  | "Skele"
  | "Prateći materijal";

export type RentalStatus =
  | "U obradi"
  | "Poslata Ponuda"
  | "Ugovor Potpisan"
  | "Izdato na Plac";

export interface ComponentItem {
  name: string;
  quantity: number;
  unit: string;
  unitPriceEur?: number;
  totalEur?: number;
  specCode?: string;
}

export interface Inquiry {
  id: string; // SFS-101 .. SFS-115
  company: string;
  pib: string;
  contactPerson: string;
  phone: string;
  email: string;
  location: string;
  category: ProductCategory;
  description: string;
  quantitySummary: string;
  startDate: string;
  durationDays: number;
  estimatedValueEur: number;
  status: RentalStatus;
  createdAt: string;
  components: ComponentItem[];
  notes?: string;
}

export interface WarehouseItem {
  id: string;
  category: ProductCategory;
  name: string;
  totalUnits: number;
  rentedUnits: number;
  availableUnits: number;
  reservedUnits: number;
  unit: string;
  utilizationRate: number; // 0 - 100
  status: "optimal" | "warning" | "critical";
  locationSlot: string; // npr. Plac A-04 Dobanovci
}

export interface DeployedEquipment {
  name: string;
  category: ProductCategory;
  quantity: number;
  unit: string;
}

export interface Jobsite {
  id: string;
  name: string;
  contractor: string;
  pib: string;
  address: string;
  activeSince: string;
  expectedReturn: string;
  dailyRateEur: number;
  totalDepositedEur: number;
  equipment: DeployedEquipment[];
  contactSupervisor: string;
  phone: string;
  status: "Aktivno" | "Najavljen povrat" | "Završeno";
}

export interface DamageReport {
  id: string;
  inquiryId: string;
  contractorName: string;
  jobsite: string;
  returnDate: string;
  inspector: string;
  condition:
    | "Uredno razduženo (očišćeno)"
    | "Oštećeno / Savijeni podupirači (-12 kom)"
    | "Neoprana oplata od betona (+ penal za pranje)"
    | "Kombinovano oštećenje i manjak elemenata";
  cleaningFeeEur: number;
  damageFeeEur: number;
  missingFeeEur: number;
  totalPenaltyEur: number;
  notes: string;
  itemsDamaged: Array<{
    item: string;
    count: number;
    issue: string;
    penalty: number;
  }>;
}

export type FormworkType = "wall" | "slab" | "scaffold";

export interface WallParams {
  height: number; // 2.70, 3.00, 3.30
  length: number; // m
  corners: number;
  thickness: number; // cm (20, 25, 30...)
}

export interface SlabParams {
  area: number; // m2
  slabThickness: number; // cm (16 - 30)
  ceilingHeight: number; // m (2.7 - 4.5)
}

export interface ScaffoldParams {
  width: number; // m
  height: number; // m
  platformLevels: number;
}

export * from "./calculator";
