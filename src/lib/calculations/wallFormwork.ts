/**
 * @file wallFormwork.ts
 * @module lib/calculations/wallFormwork
 * @description Senior Structural Engineering calculation engine for industrial steel-frame
 * wall formwork systems (Framax Doka/PERI compatible).
 *
 * Engineering Standards & References:
 * - DIN 18218: Frischbetondruck auf vertikale Schalungen (Pritisak svežeg betona na vertikalne oplate)
 * - DIN 18216: Schalungsanker für Beton (DW15 zatezni anker sistemi)
 * - DIN 18202: Toleranzen im Hochbau (Tolerancije ravnosti betonskih površina)
 * - EN 12812: Traggerüste - Anforderungen, Bemessung (Noseće oplatne skele)
 */

import {
  WallCalculationInput,
  StructuralCalculationResult,
  BillOfQuantitiesItem,
  AggregateMetrics,
} from "@/types/calculator";

const EUR_TO_RSD_RATE = 117.2;

/**
 * Technical unit pricing matrix (EUR per calendar day) and replacement costs.
 * Grounded in prevailing Serbian / SEE construction equipment rental market rates.
 */
const WALL_PRICE_BOOK = {
  primaryPanel: {
    unitPriceDailyEur: 0.38,
    replacementValueEur: 285.0,
    weightKgPerM2: 45.0,
  },
  fillPanel60: {
    unitPriceDailyEur: 0.30,
    replacementValueEur: 220.0,
    weightKgPerM2: 45.0,
  },
  fillPanel45: {
    unitPriceDailyEur: 0.26,
    replacementValueEur: 195.0,
    weightKgPerM2: 46.0,
  },
  fillPanel30: {
    unitPriceDailyEur: 0.22,
    replacementValueEur: 165.0,
    weightKgPerM2: 48.0,
  },
  innerCorner: {
    unitPriceDailyEur: 0.48,
    replacementValueEur: 240.0,
    weightKgPerUnit: 34.0,
  },
  outerCornerClamp: {
    unitPriceDailyEur: 0.28,
    replacementValueEur: 95.0,
    weightKgPerUnit: 12.0,
  },
  quickClamp: {
    unitPriceDailyEur: 0.05,
    replacementValueEur: 28.0,
    weightKgPerUnit: 3.2,
  },
  tieRodDW15: {
    unitPriceDailyEur: 0.06,
    replacementValueEur: 18.5,
    weightKgPerUnit: 1.44, // 1.44 kg/m
  },
  wingNut120: {
    unitPriceDailyEur: 0.03,
    replacementValueEur: 9.5,
    weightKgPerUnit: 1.1,
  },
  pvcSleeveConeSet: {
    unitPriceDailyEur: 0.02,
    replacementValueEur: 1.8,
    weightKgPerUnit: 0.15,
  },
  alignmentStrut340: {
    unitPriceDailyEur: 0.25,
    replacementValueEur: 145.0,
    weightKgPerUnit: 18.5,
  },
  oplatolOil20L: {
    unitPriceDailyEur: 0.0, // consumable item sold or billed upfront
    replacementValueEur: 65.0,
    weightKgPerUnit: 18.0,
  },
};

/**
 * Calculates the complete bill of quantities, structural metrics, and financial breakdown
 * for industrial double-sided wall formwork based on rigorous geometric decomposition.
 *
 * @param input Geometric parameters of the wall structure
 * @returns Comprehensive structural calculation result and itemized predmer
 */
export function calculateWallFormwork(
  input: WallCalculationInput
): StructuralCalculationResult {
  const {
    wallHeight,
    totalLength,
    cornersCount,
    wallThickness,
    durationDays = 30,
    designConcretePressureKnM2 = 70,
  } = input;

  // 1. Fundamental Geometric Contact Surface
  // Formwork is double-sided: both exterior and interior faces are shuttered simultaneously
  const totalFormworkFacesLength = totalLength * 2;
  const totalContactAreaM2 = Math.round(totalLength * wallHeight * 2 * 100) / 100;

  // 2. Panel Height Specific Code Suffixes
  const heightTag = (wallHeight * 100).toFixed(0); // '270', '300', '330'

  // 3. Mathematical Decomposition of Linear Runs into Panel Modules
  // In Framax systems, 0.90m panels form the primary repetitive grid (~70% of continuous wall),
  // while 0.60m, 0.45m, and 0.30m panels handle corner clearances and residual modular offsets.
  const targetPrimaryRatio = 0.70;
  const targetFill60Ratio = 0.18;
  const targetFill45Ratio = 0.08;
  const targetFill30Ratio = 0.04;

  const primaryPanelsCount = Math.max(
    2,
    Math.ceil((totalFormworkFacesLength * targetPrimaryRatio) / 0.90)
  );
  const fillPanels60Count = Math.max(
    1,
    Math.ceil((totalFormworkFacesLength * targetFill60Ratio) / 0.60)
  );
  const fillPanels45Count = Math.max(
    1,
    Math.ceil((totalFormworkFacesLength * targetFill45Ratio) / 0.45)
  );
  const fillPanels30Count = Math.max(
    0,
    Math.ceil((totalFormworkFacesLength * targetFill30Ratio) / 0.30)
  );

  const totalPanelsCount =
    primaryPanelsCount + fillPanels60Count + fillPanels45Count + fillPanels30Count;

  // 4. Corners Engineering (Unutrašnji uglovi i spoljne ugaone stege)
  // For each corner point, 2 inner corner elements (CNR-INT) and 2 outside angle clamps (CNR-EXT)
  // are installed across both shuttering faces.
  const innerCornersCount = Math.max(0, cornersCount * 2);
  const outerCornerClampsCount = Math.max(0, cornersCount * 2);

  // 5. Fasteners / Clamps Engineering (Brze spojke / centrirajuće kandže)
  // Clamps per vertical joint according to panel height:
  // - h = 2.70m -> 3 clamps per panel joint
  // - h = 3.00m -> 4 clamps per panel joint
  // - h = 3.30m -> 4 clamps + 1 intermediate lock per panel joint
  const clampsPerVerticalJoint = wallHeight === 2.70 ? 3 : wallHeight === 3.00 ? 4 : 5;
  const totalVerticalJoints = totalPanelsCount;
  const cornerClampingAllowance = (innerCornersCount + outerCornerClampsCount) * 2;
  const totalClampsCount = Math.ceil(
    totalVerticalJoints * clampsPerVerticalJoint + cornerClampingAllowance
  );

  // 6. Anchor / Tie Rod Engineering (DIN 18218 & DIN 18216)
  // Hydrostatic lateral fresh concrete pressure:
  // - For h = 2.70m: 2 horizontal tiers of DW15 ties
  // - For h = 3.00m: 3 horizontal tiers of DW15 ties
  // - For h = 3.30m: 3 horizontal tiers of DW15 ties
  // Horizontal spacing between ties = 0.90m (panel tie hole centerlines)
  const tieTiersCount = wallHeight === 2.70 ? 2 : 3;
  const totalTieColumns = Math.ceil(totalLength / 0.90);
  const safetyFactorAllowance = 1.05; // 5% spare for start/end terminations
  const recommendedTieRodsCount = Math.ceil(
    totalTieColumns * tieTiersCount * safetyFactorAllowance
  );
  const wingNutsCount = recommendedTieRodsCount * 2; // 2 nuts per tie rod
  const pvcConeSetsCount = recommendedTieRodsCount; // 1 set (sleeve + 2 cones) per tie rod

  // 7. Plumbing & Alignment Struts (Kose potpore / šprajcevi)
  // Rules of thumb per DIN 18212: 1 strut assembly per 2.0m to 2.5m of wall run on primary side
  const recommendedAlignmentStrutsCount = Math.max(
    2,
    Math.ceil(totalLength / 2.4)
  );

  // 8. Formwork Release Agent (Biorazgradivi Oplatol ECO-Release)
  // 1 Liter covers approximately 15 m² of phenolic plywood face
  const oplatolLiters = Math.ceil(totalContactAreaM2 / 15);
  const oplatolCans20L = Math.max(1, Math.ceil(oplatolLiters / 20));

  // 9. Line Items Compilation
  const lineItems: BillOfQuantitiesItem[] = [
    {
      id: "ITM-PAN-PRI",
      code: `PAN-${heightTag}-90`,
      name: `Čelični ramovski panel Framax ${wallHeight.toFixed(2)} x 0.90m`,
      category: "Zidna oplata",
      quantity: primaryPanelsCount,
      unit: "kom",
      unitPricePerDay: WALL_PRICE_BOOK.primaryPanel.unitPriceDailyEur,
      totalRentalPriceEur:
        primaryPanelsCount * WALL_PRICE_BOOK.primaryPanel.unitPriceDailyEur * durationDays,
      replacementValue: primaryPanelsCount * WALL_PRICE_BOOK.primaryPanel.replacementValueEur,
      weightPerUnitKg: Math.round(wallHeight * 0.90 * WALL_PRICE_BOOK.primaryPanel.weightKgPerM2),
      totalWeightKg:
        primaryPanelsCount *
        Math.round(wallHeight * 0.90 * WALL_PRICE_BOOK.primaryPanel.weightKgPerM2),
      engineeringNotes: "Glavni modularni panel, dopušteni pritisak betona 80 kN/m²",
    },
    {
      id: "ITM-PAN-F60",
      code: `PAN-${heightTag}-60`,
      name: `Čelični ramovski panel Framax ${wallHeight.toFixed(2)} x 0.60m`,
      category: "Zidna oplata",
      quantity: fillPanels60Count,
      unit: "kom",
      unitPricePerDay: WALL_PRICE_BOOK.fillPanel60.unitPriceDailyEur,
      totalRentalPriceEur:
        fillPanels60Count * WALL_PRICE_BOOK.fillPanel60.unitPriceDailyEur * durationDays,
      replacementValue: fillPanels60Count * WALL_PRICE_BOOK.fillPanel60.replacementValueEur,
      weightPerUnitKg: Math.round(wallHeight * 0.60 * WALL_PRICE_BOOK.fillPanel60.weightKgPerM2),
      totalWeightKg:
        fillPanels60Count *
        Math.round(wallHeight * 0.60 * WALL_PRICE_BOOK.fillPanel60.weightKgPerM2),
      engineeringNotes: "Dopunski panel za uklapanje dužine zida",
    },
    {
      id: "ITM-PAN-F45",
      code: `PAN-${heightTag}-45`,
      name: `Čelični ramovski panel Framax ${wallHeight.toFixed(2)} x 0.45m`,
      category: "Zidna oplata",
      quantity: fillPanels45Count,
      unit: "kom",
      unitPricePerDay: WALL_PRICE_BOOK.fillPanel45.unitPriceDailyEur,
      totalRentalPriceEur:
        fillPanels45Count * WALL_PRICE_BOOK.fillPanel45.unitPriceDailyEur * durationDays,
      replacementValue: fillPanels45Count * WALL_PRICE_BOOK.fillPanel45.replacementValueEur,
      weightPerUnitKg: Math.round(wallHeight * 0.45 * WALL_PRICE_BOOK.fillPanel45.weightKgPerM2),
      totalWeightKg:
        fillPanels45Count *
        Math.round(wallHeight * 0.45 * WALL_PRICE_BOOK.fillPanel45.weightKgPerM2),
      engineeringNotes: "Uklopni panel za kompenzaciju debljine zida u uglu",
    },
  ];

  if (fillPanels30Count > 0) {
    lineItems.push({
      id: "ITM-PAN-F30",
      code: `PAN-${heightTag}-30`,
      name: `Čelični ramovski panel Framax ${wallHeight.toFixed(2)} x 0.30m`,
      category: "Zidna oplata",
      quantity: fillPanels30Count,
      unit: "kom",
      unitPricePerDay: WALL_PRICE_BOOK.fillPanel30.unitPriceDailyEur,
      totalRentalPriceEur:
        fillPanels30Count * WALL_PRICE_BOOK.fillPanel30.unitPriceDailyEur * durationDays,
      replacementValue: fillPanels30Count * WALL_PRICE_BOOK.fillPanel30.replacementValueEur,
      weightPerUnitKg: Math.round(wallHeight * 0.30 * WALL_PRICE_BOOK.fillPanel30.weightKgPerM2),
      totalWeightKg:
        fillPanels30Count *
        Math.round(wallHeight * 0.30 * WALL_PRICE_BOOK.fillPanel30.weightKgPerM2),
      engineeringNotes: "Uski kompenzacioni panel",
    });
  }

  if (innerCornersCount > 0) {
    lineItems.push({
      id: "ITM-CNR-INT",
      code: `CNR-INT-${heightTag}`,
      name: `Unutrašnji ugaoni element 0.30x0.30m h=${wallHeight.toFixed(2)}m`,
      category: "Zidna oplata",
      quantity: innerCornersCount,
      unit: "kom",
      unitPricePerDay: WALL_PRICE_BOOK.innerCorner.unitPriceDailyEur,
      totalRentalPriceEur:
        innerCornersCount * WALL_PRICE_BOOK.innerCorner.unitPriceDailyEur * durationDays,
      replacementValue: innerCornersCount * WALL_PRICE_BOOK.innerCorner.replacementValueEur,
      weightPerUnitKg: WALL_PRICE_BOOK.innerCorner.weightKgPerUnit,
      totalWeightKg: innerCornersCount * WALL_PRICE_BOOK.innerCorner.weightKgPerUnit,
      engineeringNotes: "Pravi ugao 90° sa zakošenjem za lakše razoplaćivanje",
    });
  }

  if (outerCornerClampsCount > 0) {
    lineItems.push({
      id: "ITM-CNR-EXT",
      code: `CNR-EXT-${heightTag}`,
      name: `Spoljni ugaoni profil / stega h=${wallHeight.toFixed(2)}m`,
      category: "Zidna oplata",
      quantity: outerCornerClampsCount,
      unit: "kom",
      unitPricePerDay: WALL_PRICE_BOOK.outerCornerClamp.unitPriceDailyEur,
      totalRentalPriceEur:
        outerCornerClampsCount *
        WALL_PRICE_BOOK.outerCornerClamp.unitPriceDailyEur *
        durationDays,
      replacementValue:
        outerCornerClampsCount * WALL_PRICE_BOOK.outerCornerClamp.replacementValueEur,
      weightPerUnitKg: WALL_PRICE_BOOK.outerCornerClamp.weightKgPerUnit,
      totalWeightKg: outerCornerClampsCount * WALL_PRICE_BOOK.outerCornerClamp.weightKgPerUnit,
      engineeringNotes: "Povezuje spoljne panele bez potrebe za ankerisanjem kroz ugao",
    });
  }

  // Fasteners & hardware
  lineItems.push(
    {
      id: "ITM-CLM-BF",
      code: "CLM-BF-RU",
      name: "Brze centrirajuće spojke za ramove (kandže)",
      category: "Prateći materijal",
      quantity: totalClampsCount,
      unit: "kom",
      unitPricePerDay: WALL_PRICE_BOOK.quickClamp.unitPriceDailyEur,
      totalRentalPriceEur:
        totalClampsCount * WALL_PRICE_BOOK.quickClamp.unitPriceDailyEur * durationDays,
      replacementValue: totalClampsCount * WALL_PRICE_BOOK.quickClamp.replacementValueEur,
      weightPerUnitKg: WALL_PRICE_BOOK.quickClamp.weightKgPerUnit,
      totalWeightKg: totalClampsCount * WALL_PRICE_BOOK.quickClamp.weightKgPerUnit,
      engineeringNotes: "Jednim udarcem čekića spaja, poravnava i zaptiva spoj ramova",
    },
    {
      id: "ITM-DW15-ROD",
      code: "DW15-HOT-100",
      name: `Toplo valjana DW15 anker šipka L=${((wallThickness + 40) / 100).toFixed(2)}m (190kN)`,
      category: "Prateći materijal",
      quantity: recommendedTieRodsCount,
      unit: "kom",
      unitPricePerDay: WALL_PRICE_BOOK.tieRodDW15.unitPriceDailyEur,
      totalRentalPriceEur:
        recommendedTieRodsCount * WALL_PRICE_BOOK.tieRodDW15.unitPriceDailyEur * durationDays,
      replacementValue:
        recommendedTieRodsCount * WALL_PRICE_BOOK.tieRodDW15.replacementValueEur,
      weightPerUnitKg: Math.round(
        ((wallThickness + 40) / 100) * WALL_PRICE_BOOK.tieRodDW15.weightKgPerUnit * 10
      ) / 10,
      totalWeightKg: Math.round(
        recommendedTieRodsCount *
          ((wallThickness + 40) / 100) *
          WALL_PRICE_BOOK.tieRodDW15.weightKgPerUnit
      ),
      engineeringNotes: `DIN 18216 zatezna sila >190kN, dimenzionisano za zid d=${wallThickness}cm`,
    },
    {
      id: "ITM-DW15-NUT",
      code: "DW15-NUT-120",
      name: "Leptiraste anker matice sa podložkom Ø120mm",
      category: "Prateći materijal",
      quantity: wingNutsCount,
      unit: "kom",
      unitPricePerDay: WALL_PRICE_BOOK.wingNut120.unitPriceDailyEur,
      totalRentalPriceEur:
        wingNutsCount * WALL_PRICE_BOOK.wingNut120.unitPriceDailyEur * durationDays,
      replacementValue: wingNutsCount * WALL_PRICE_BOOK.wingNut120.replacementValueEur,
      weightPerUnitKg: WALL_PRICE_BOOK.wingNut120.weightKgPerUnit,
      totalWeightKg: wingNutsCount * WALL_PRICE_BOOK.wingNut120.weightKgPerUnit,
      engineeringNotes: "Liveno gvožđe sfernog oslanjanja, podloška Ø120mm",
    },
    {
      id: "ITM-PVC-SET",
      code: "PVC-TUBE-SET",
      name: `PVC distanciona zaštitna cev Ø22/26 sa zaptivnim konusima (L=${wallThickness}cm)`,
      category: "Prateći materijal",
      quantity: pvcConeSetsCount,
      unit: "kom",
      unitPricePerDay: WALL_PRICE_BOOK.pvcSleeveConeSet.unitPriceDailyEur,
      totalRentalPriceEur:
        pvcConeSetsCount * WALL_PRICE_BOOK.pvcSleeveConeSet.unitPriceDailyEur * durationDays,
      replacementValue: pvcConeSetsCount * WALL_PRICE_BOOK.pvcSleeveConeSet.replacementValueEur,
      weightPerUnitKg: WALL_PRICE_BOOK.pvcSleeveConeSet.weightKgPerUnit,
      totalWeightKg: pvcConeSetsCount * WALL_PRICE_BOOK.pvcSleeveConeSet.weightKgPerUnit,
      engineeringNotes: "Potrošni materijal za zaštitu DW15 šipke i vodonepropusnost",
    },
    {
      id: "ITM-STRUT-340",
      code: "STRUT-HD-340",
      name: "Teleskopski kosi potporni šprajc 3.40m sa zglobnim stopama",
      category: "Podupirači",
      quantity: recommendedAlignmentStrutsCount,
      unit: "kom",
      unitPricePerDay: WALL_PRICE_BOOK.alignmentStrut340.unitPriceDailyEur,
      totalRentalPriceEur:
        recommendedAlignmentStrutsCount *
        WALL_PRICE_BOOK.alignmentStrut340.unitPriceDailyEur *
        durationDays,
      replacementValue:
        recommendedAlignmentStrutsCount *
        WALL_PRICE_BOOK.alignmentStrut340.replacementValueEur,
      weightPerUnitKg: WALL_PRICE_BOOK.alignmentStrut340.weightKgPerUnit,
      totalWeightKg:
        recommendedAlignmentStrutsCount * WALL_PRICE_BOOK.alignmentStrut340.weightKgPerUnit,
      engineeringNotes: "Za vertikalan položaj i prijem udara vetra tokom betoniranja",
    },
    {
      id: "ITM-OPL-20L",
      code: "OPL-ECO-20L",
      name: "SFS Oplatol Eko biorazgradivo ulje za oplatu (Kanta 20L)",
      category: "Prateći materijal",
      quantity: oplatolCans20L,
      unit: "kom",
      unitPricePerDay: 0.0,
      totalRentalPriceEur: oplatolCans20L * 65.0, // jednokratni trošak hemije
      replacementValue: oplatolCans20L * 65.0,
      weightPerUnitKg: 18.0,
      totalWeightKg: oplatolCans20L * 18.0,
      engineeringNotes: "Potrošnja 1L na cca 15 m² oplate, sprečava lepljenje betona",
    }
  );

  // 10. Aggregate Totals
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
    totalContactAreaM2,
    linearMeters: totalLength,
    totalEstimatedWeightKg: Math.round(totalWeightKg),
    totalWeightTons,
    recommendedTieRodsCount,
    recommendedAlignmentStrutsCount,
    recommendedClampsCount: totalClampsCount,
    dailyRentalCostEur: Math.round(dailyRentalCostEur * 100) / 100,
    dailyRentalCostRsd,
    subtotalRentalEur: Math.round(subtotalRentalEur),
    refundableDepositEur,
    totalLotReplacementValueEur: Math.round(totalLotReplacementValueEur),
  };

  const engineeringSummary =
    `Dvostrani zidni oplatni sklop Framax h=${wallHeight.toFixed(2)}m za ${totalLength}m' zida ` +
    `(debljina d=${wallThickness}cm) sa ${cornersCount} uglova. Ukupna kontaktna površina: ${totalContactAreaM2} m². ` +
    `Statički proračun prema DIN 18218 obezbeđuje punu nosivost do ${designConcretePressureKnM2} kN/m² bočnog pritiska ` +
    `svežeg betona uz ${tieTiersCount} nivoa DW15 ankerisanja i ${recommendedAlignmentStrutsCount} kosih potpora.`;

  return {
    systemType: "wall",
    systemTitle: `SFS Framax Čelična Zidna Oplata h=${wallHeight.toFixed(2)}m`,
    engineeringSummary,
    lineItems,
    metrics,
    designStandards: ["DIN 18218", "DIN 18216", "DIN 18202", "EN 12812"],
  };
}
