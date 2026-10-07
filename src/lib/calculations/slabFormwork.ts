/**
 * @file slabFormwork.ts
 * @module lib/calculations/slabFormwork
 * @description Senior Structural Engineering calculation engine for slab formwork systems
 * (Dokaflex compatible: H20 timber beams, EN 1065 D/E shoring props, 3-ply 21mm yellow panels).
 *
 * Engineering Standards & References:
 * - EN 1065: Baustützen aus Stahl mit Ausziehvorrichtung (Građevinski teleskopski podupirači)
 * - EN 13377: Schalungsträger aus Holz (Prefabrikovani drveni I-nosači H20)
 * - ÖNORM B 3023: 3-Schicht-Schalungsplatten (Troslojne ploče za oplatu)
 * - EN 12812: Traggerüste - Bemessung und Konstruktion (Noseće oplatne skele)
 */

import {
  SlabCalculationInput,
  StructuralCalculationResult,
  BillOfQuantitiesItem,
  AggregateMetrics,
} from "@/types/calculator";

const EUR_TO_RSD_RATE = 117.2;

const SLAB_PRICE_BOOK = {
  yellowBoard21mm: {
    unitPriceDailyEur: 0.12,
    replacementValueEur: 24.5,
    weightKgPerM2: 10.5,
  },
  h20BeamTimber: {
    unitPriceDailyEur: 0.04,
    replacementValueEur: 14.8,
    weightKgPerMeter: 4.8,
  },
  propClassD30: {
    unitPriceDailyEur: 0.07,
    replacementValueEur: 42.0,
    weightKgPerUnit: 17.5,
  },
  propClassD35: {
    unitPriceDailyEur: 0.08,
    replacementValueEur: 48.0,
    weightKgPerUnit: 19.8,
  },
  propClassE45: {
    unitPriceDailyEur: 0.12,
    replacementValueEur: 75.0,
    weightKgPerUnit: 28.5,
  },
  forkHead4Way: {
    unitPriceDailyEur: 0.02,
    replacementValueEur: 12.0,
    weightKgPerUnit: 2.4,
  },
  tripodFolding: {
    unitPriceDailyEur: 0.04,
    replacementValueEur: 24.0,
    weightKgPerUnit: 8.5,
  },
  oplatolOil20L: {
    unitPriceDailyEur: 0.0,
    replacementValueEur: 65.0,
    weightKgPerUnit: 18.0,
  },
};

/**
 * Calculates complete bill of quantities and statics for floor slab formwork.
 *
 * @param input Geometric and load parameters of the floor slab
 * @returns Comprehensive structural calculation result and itemized predmer
 */
export function calculateSlabFormwork(
  input: SlabCalculationInput
): StructuralCalculationResult {
  const {
    slabArea,
    slabThickness,
    ceilingHeight,
    durationDays = 30,
  } = input;

  // 1. Shuttering Plywood Boards (Žuta troslojna ploča 21mm, 2500x500mm = 1.25 m²)
  const boardAreaM2 = 1.25;
  const boardAllowanceFactor = 1.05; // 5% otpad i sečenje
  const yellowBoardsCount = Math.ceil((slabArea * boardAllowanceFactor) / boardAreaM2);

  // 2. Structural Loading Analysis (Opterećenje betona prema EN 12812)
  // - Sopstvena težina armiranog betona: d (m) * 25.0 kN/m³
  // - Težina oplate (ploče + H20 nosači): cca 0.35 kN/m²
  // - Izvođačko radno opterećenje radnika i opreme (live load): 1.50 kN/m²
  const concreteDeadLoadKnM2 = (slabThickness / 100) * 25.0;
  const formworkDeadLoadKnM2 = 0.35;
  const executionLiveLoadKnM2 = 1.50;
  const totalCharacteristicLoadKnM2 =
    concreteDeadLoadKnM2 + formworkDeadLoadKnM2 + executionLiveLoadKnM2;

  // 3. H20 Beam Grid Geometry (Dokaflex mrežni raster)
  // Spacing of secondary cross beams (e2) depends on slab thickness to control deflection (L/500):
  let secondarySpacingM = 0.50;
  if (slabThickness > 26) {
    secondarySpacingM = 0.40;
  } else if (slabThickness > 20) {
    secondarySpacingM = 0.45;
  }

  // Spacing of primary main beams (e1) carrying the cross beams:
  const primarySpacingM = slabThickness > 26 ? 2.0 : 2.25;

  const secondaryMeters = Math.ceil(slabArea / secondarySpacingM);
  const primaryMeters = Math.ceil(slabArea / primarySpacingM);
  const totalH20BeamsMeters = secondaryMeters + primaryMeters;

  // 4. Shoring Props Capacity & Selection (EN 1065 krive nosivosti)
  let propCode = "PROP-D30";
  let propName = "Teleskopski čelični podupirač Klasa D-30 (1.80 - 3.00m, EN 1065)";
  let propPriceDaily = SLAB_PRICE_BOOK.propClassD30.unitPriceDailyEur;
  let propReplValue = SLAB_PRICE_BOOK.propClassD30.replacementValueEur;
  let propWeightKg = SLAB_PRICE_BOOK.propClassD30.weightKgPerUnit;
  let safePropCapacityKn = 26.0;

  if (ceilingHeight > 3.5) {
    propCode = "PROP-E45";
    propName = "Teški industrijski podupirač Klasa E-45 (2.50 - 4.50m, EN 1065)";
    propPriceDaily = SLAB_PRICE_BOOK.propClassE45.unitPriceDailyEur;
    propReplValue = SLAB_PRICE_BOOK.propClassE45.replacementValueEur;
    propWeightKg = SLAB_PRICE_BOOK.propClassE45.weightKgPerUnit;
    safePropCapacityKn = 30.0;
  } else if (ceilingHeight > 3.0) {
    propCode = "PROP-D35";
    propName = "Teleskopski čelični podupirač Klasa D-35 (2.00 - 3.50m, EN 1065)";
    propPriceDaily = SLAB_PRICE_BOOK.propClassD35.unitPriceDailyEur;
    propReplValue = SLAB_PRICE_BOOK.propClassD35.replacementValueEur;
    propWeightKg = SLAB_PRICE_BOOK.propClassD35.weightKgPerUnit;
    safePropCapacityKn = 22.0;
  }

  // Allowable tributary area per prop: A = N_allow / q_total
  const maxTributaryAreaPerPropM2 = safePropCapacityKn / totalCharacteristicLoadKnM2;
  // Bounded between 0.9m² (thick industrial slab) and 1.35m² (standard residential slab)
  const actualTributaryAreaM2 = Math.max(0.85, Math.min(1.35, maxTributaryAreaPerPropM2));
  const recommendedPropsCount = Math.ceil(slabArea / actualTributaryAreaM2);

  // 5. Tripods and Fork Heads
  // 35% of props are stabilized with tripods during assembly
  const recommendedTripodsCount = Math.ceil(recommendedPropsCount * 0.35);
  // 65% of props carry the primary H20 beams with 4-way forks
  const recommendedForksCount = Math.ceil(recommendedPropsCount * 0.65);

  // 6. Release Agent
  const oplatolLiters = Math.ceil(slabArea / 15);
  const oplatolCans20L = Math.max(1, Math.ceil(oplatolLiters / 20));

  // 7. Line Items Compilation
  const lineItems: BillOfQuantitiesItem[] = [
    {
      id: "ITM-SLAB-BOARD",
      code: "BOARD-3P-21",
      name: "Žuta troslojna ploča za šalovanje 21mm (2500 x 500mm)",
      category: "Plafonska oplata",
      quantity: yellowBoardsCount,
      unit: "kom",
      unitPricePerDay: SLAB_PRICE_BOOK.yellowBoard21mm.unitPriceDailyEur,
      totalRentalPriceEur:
        yellowBoardsCount * SLAB_PRICE_BOOK.yellowBoard21mm.unitPriceDailyEur * durationDays,
      replacementValue:
        yellowBoardsCount * SLAB_PRICE_BOOK.yellowBoard21mm.replacementValueEur,
      weightPerUnitKg: Math.round(boardAreaM2 * SLAB_PRICE_BOOK.yellowBoard21mm.weightKgPerM2 * 10) / 10,
      totalWeightKg: Math.round(
        yellowBoardsCount * boardAreaM2 * SLAB_PRICE_BOOK.yellowBoard21mm.weightKgPerM2
      ),
      engineeringNotes: "ÖNORM B 3023 melaminska zaštita, debljina 21mm",
    },
    {
      id: "ITM-SLAB-H20",
      code: "H20-TIMBER-BEAM",
      name: "Drveni nosači H20 (primarna i sekundarna mreža)",
      category: "Plafonska oplata",
      quantity: totalH20BeamsMeters,
      unit: "m'",
      unitPricePerDay: SLAB_PRICE_BOOK.h20BeamTimber.unitPriceDailyEur,
      totalRentalPriceEur:
        totalH20BeamsMeters * SLAB_PRICE_BOOK.h20BeamTimber.unitPriceDailyEur * durationDays,
      replacementValue:
        totalH20BeamsMeters * SLAB_PRICE_BOOK.h20BeamTimber.replacementValueEur,
      weightPerUnitKg: SLAB_PRICE_BOOK.h20BeamTimber.weightKgPerMeter,
      totalWeightKg: Math.round(
        totalH20BeamsMeters * SLAB_PRICE_BOOK.h20BeamTimber.weightKgPerMeter
      ),
      engineeringNotes: `EN 13377 I-profil, M=5kNm, raspored: primarni @${primarySpacingM}m, sekundarni @${secondarySpacingM}m`,
    },
    {
      id: "ITM-SLAB-PROP",
      code: propCode,
      name: propName,
      category: "Podupirači",
      quantity: recommendedPropsCount,
      unit: "kom",
      unitPricePerDay: propPriceDaily,
      totalRentalPriceEur: recommendedPropsCount * propPriceDaily * durationDays,
      replacementValue: recommendedPropsCount * propReplValue,
      weightPerUnitKg: propWeightKg,
      totalWeightKg: recommendedPropsCount * propWeightKg,
      engineeringNotes: `EN 1065 sertifikat, garantovana nosivost ${safePropCapacityKn} kN pri h=${ceilingHeight.toFixed(2)}m`,
    },
    {
      id: "ITM-SLAB-FORK",
      code: "FORK-4WAY",
      name: "Četvorokrake viljuške za H20 nosače",
      category: "Plafonska oplata",
      quantity: recommendedForksCount,
      unit: "kom",
      unitPricePerDay: SLAB_PRICE_BOOK.forkHead4Way.unitPriceDailyEur,
      totalRentalPriceEur:
        recommendedForksCount * SLAB_PRICE_BOOK.forkHead4Way.unitPriceDailyEur * durationDays,
      replacementValue: recommendedForksCount * SLAB_PRICE_BOOK.forkHead4Way.replacementValueEur,
      weightPerUnitKg: SLAB_PRICE_BOOK.forkHead4Way.weightKgPerUnit,
      totalWeightKg: recommendedForksCount * SLAB_PRICE_BOOK.forkHead4Way.weightKgPerUnit,
      engineeringNotes: "Povezuje podupirač i primarni H20 nosač, sprečava izvrtanje",
    },
    {
      id: "ITM-SLAB-TRIPOD",
      code: "TRIPOD-ST",
      name: "Tronožac za stabilizaciju podupirača pri montaži",
      category: "Podupirači",
      quantity: recommendedTripodsCount,
      unit: "kom",
      unitPricePerDay: SLAB_PRICE_BOOK.tripodFolding.unitPriceDailyEur,
      totalRentalPriceEur:
        recommendedTripodsCount * SLAB_PRICE_BOOK.tripodFolding.unitPriceDailyEur * durationDays,
      replacementValue:
        recommendedTripodsCount * SLAB_PRICE_BOOK.tripodFolding.replacementValueEur,
      weightPerUnitKg: SLAB_PRICE_BOOK.tripodFolding.weightKgPerUnit,
      totalWeightKg: recommendedTripodsCount * SLAB_PRICE_BOOK.tripodFolding.weightKgPerUnit,
      engineeringNotes: "Preklopne stope za brzo osiguranje vertikalnosti podupirača",
    },
    {
      id: "ITM-SLAB-OPL",
      code: "OPL-ECO-20L",
      name: "SFS Oplatol Eko ulje za žutu oplatu (Kanta 20L)",
      category: "Prateći materijal",
      quantity: oplatolCans20L,
      unit: "kom",
      unitPricePerDay: 0.0,
      totalRentalPriceEur: oplatolCans20L * 65.0,
      replacementValue: oplatolCans20L * 65.0,
      weightPerUnitKg: 18.0,
      totalWeightKg: oplatolCans20L * 18.0,
      engineeringNotes: "Čuva drvo od cementnog mleka i obezbeđuje čist vidni beton",
    },
  ];

  // 8. Metrics Compilation
  const totalWeightKg = lineItems.reduce((acc, item) => acc + item.totalWeightKg, 0);
  const totalWeightTons = Math.round((totalWeightKg / 1000) * 100) / 100;

  const dailyRentalCostEur = lineItems.reduce(
    (acc, item) => acc + item.quantity * item.unitPricePerDay,
    0
  );
  const dailyRentalCostRsd = Math.round(dailyRentalCostEur * EUR_TO_RSD_RATE);

  const subtotalRentalEur = lineItems.reduce(
    (acc, item) => acc + item.totalRentalPriceEur,
    0
  );
  const refundableDepositEur = Math.round(subtotalRentalEur * 0.40);
  const totalLotReplacementValueEur = lineItems.reduce(
    (acc, item) => acc + item.replacementValue,
    0
  );

  const metrics: AggregateMetrics = {
    totalContactAreaM2: slabArea,
    linearMeters: totalH20BeamsMeters,
    totalEstimatedWeightKg: Math.round(totalWeightKg),
    totalWeightTons,
    recommendedTieRodsCount: 0, // pločna oplata nema anker šipke
    recommendedAlignmentStrutsCount: recommendedTripodsCount,
    recommendedClampsCount: 0,
    dailyRentalCostEur: Math.round(dailyRentalCostEur * 100) / 100,
    dailyRentalCostRsd,
    subtotalRentalEur: Math.round(subtotalRentalEur),
    refundableDepositEur,
    totalLotReplacementValueEur: Math.round(totalLotReplacementValueEur),
  };

  const engineeringSummary =
    `Dokaflex plafonski sklop za ${slabArea} m² ploče debljine d=${slabThickness}cm na visini h=${ceilingHeight.toFixed(2)}m. ` +
    `Ukupno opterećenje svežeg betona i radnika: ${totalCharacteristicLoadKnM2.toFixed(2)} kN/m². ` +
    `Raspored: primarni H20 nosači @${primarySpacingM}m (${primaryMeters}m'), poprečni H20 nosači @${secondarySpacingM}m (${secondaryMeters}m'). ` +
    `Podupiranje obezbeđuje ${recommendedPropsCount} podupirača ${propCode} (raster ${actualTributaryAreaM2.toFixed(2)} m²/kom).`;

  return {
    systemType: "slab",
    systemTitle: `SFS Dokaflex Plafonska Oplata sa H20 Nosačima (${slabArea} m²)`,
    engineeringSummary,
    lineItems,
    metrics,
    designStandards: ["EN 1065", "EN 13377", "ÖNORM B 3023", "EN 12812"],
  };
}
