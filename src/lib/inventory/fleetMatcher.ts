/**
 * @file fleetMatcher.ts
 * @module lib/inventory/fleetMatcher
 * @description Central Dobanovci Hub warehouse fleet matcher and overbooking prevention engine.
 * Matches structural bill of quantities against live yard balances and computes projected
 * fleet utilization with tiered thresholds (80% warning, 90% critical, >100% deficit).
 */

import {
  BillOfQuantitiesItem,
  WarehouseStockRecord,
  FleetInventoryMatchReport,
  InventoryMatchItem,
  StockHealthStatus,
} from "@/types/calculator";

/**
 * Standard live inventory balances for SFS Central Yard (Dobanovci Hub, Privredna zona E-70).
 */
export const DOBANOVCI_CENTRAL_STOCK: WarehouseStockRecord[] = [
  // 1. Zidna Oplata Paneli
  {
    stockId: "STK-PAN-270-90",
    code: "PAN-270-90",
    name: "Čelični ramovski panel Framax 2.70 x 0.90m",
    category: "Zidna oplata",
    totalFleetUnits: 1400,
    currentlyDeployedUnits: 1100,
    reservedUnits: 80,
    availableInYardUnits: 220,
    unit: "kom",
    locationSlot: "Plac A-01 Dobanovci",
  },
  {
    stockId: "STK-PAN-270-60",
    code: "PAN-270-60",
    name: "Čelični ramovski panel Framax 2.70 x 0.60m",
    category: "Zidna oplata",
    totalFleetUnits: 650,
    currentlyDeployedUnits: 490,
    reservedUnits: 40,
    availableInYardUnits: 120,
    unit: "kom",
    locationSlot: "Plac A-02 Dobanovci",
  },
  {
    stockId: "STK-PAN-270-45",
    code: "PAN-270-45",
    name: "Čelični ramovski panel Framax 2.70 x 0.45m",
    category: "Zidna oplata",
    totalFleetUnits: 400,
    currentlyDeployedUnits: 290,
    reservedUnits: 20,
    availableInYardUnits: 90,
    unit: "kom",
    locationSlot: "Plac A-02 Dobanovci",
  },
  {
    stockId: "STK-PAN-270-30",
    code: "PAN-270-30",
    name: "Čelični ramovski panel Framax 2.70 x 0.30m",
    category: "Zidna oplata",
    totalFleetUnits: 300,
    currentlyDeployedUnits: 210,
    reservedUnits: 15,
    availableInYardUnits: 75,
    unit: "kom",
    locationSlot: "Plac A-02 Dobanovci",
  },
  {
    stockId: "STK-PAN-300-90",
    code: "PAN-300-90",
    name: "Čelični ramovski panel Framax 3.00 x 0.90m",
    category: "Zidna oplata",
    totalFleetUnits: 850,
    currentlyDeployedUnits: 680,
    reservedUnits: 60,
    availableInYardUnits: 110,
    unit: "kom",
    locationSlot: "Plac A-03 Dobanovci",
  },
  {
    stockId: "STK-PAN-330-90",
    code: "PAN-330-90",
    name: "Čelični ramovski panel Framax 3.30 x 0.90m",
    category: "Zidna oplata",
    totalFleetUnits: 600,
    currentlyDeployedUnits: 480,
    reservedUnits: 50,
    availableInYardUnits: 70,
    unit: "kom",
    locationSlot: "Plac A-04 Dobanovci",
  },
  {
    stockId: "STK-CNR-INT",
    code: "CNR-INT-270",
    name: "Unutrašnji ugaoni element 0.30x0.30m h=2.70m",
    category: "Zidna oplata",
    totalFleetUnits: 160,
    currentlyDeployedUnits: 118,
    reservedUnits: 12,
    availableInYardUnits: 30,
    unit: "kom",
    locationSlot: "Plac A-01 Dobanovci",
  },
  {
    stockId: "STK-CLM-BF",
    code: "CLM-BF-RU",
    name: "Brze centrirajuće spojke za ramove (kandže)",
    category: "Prateći materijal",
    totalFleetUnits: 6200,
    currentlyDeployedUnits: 4900,
    reservedUnits: 350,
    availableInYardUnits: 950,
    unit: "kom",
    locationSlot: "Magacin alata M-01",
  },
  {
    stockId: "STK-DW15-ROD",
    code: "DW15-HOT-100",
    name: "Toplo valjana DW15 anker šipka L=1.00m (190kN)",
    category: "Prateći materijal",
    totalFleetUnits: 9500,
    currentlyDeployedUnits: 7400,
    reservedUnits: 600,
    availableInYardUnits: 1500,
    unit: "kom",
    locationSlot: "Magacin alata M-02",
  },
  {
    stockId: "STK-STRUT-340",
    code: "STRUT-HD-340",
    name: "Teleskopski kosi potporni šprajc 3.40m",
    category: "Podupirači",
    totalFleetUnits: 450,
    currentlyDeployedUnits: 340,
    reservedUnits: 30,
    availableInYardUnits: 80,
    unit: "kom",
    locationSlot: "Plac B-01 Dobanovci",
  },

  // 2. Plafonska Oplata
  {
    stockId: "STK-BOARD-21",
    code: "BOARD-3P-21",
    name: "Žuta troslojna ploča za šalovanje 21mm",
    category: "Plafonska oplata",
    totalFleetUnits: 12000,
    currentlyDeployedUnits: 9800,
    reservedUnits: 650,
    availableInYardUnits: 1550,
    unit: "kom",
    locationSlot: "Hala 1 Natkriveno Dobanovci",
  },
  {
    stockId: "STK-H20-TIMBER",
    code: "H20-TIMBER-BEAM",
    name: "Drveni nosači H20 (m')",
    category: "Plafonska oplata",
    totalFleetUnits: 18500,
    currentlyDeployedUnits: 14200,
    reservedUnits: 1100,
    availableInYardUnits: 3200,
    unit: "m'",
    locationSlot: "Hala 2 Natkriveno Dobanovci",
  },
  {
    stockId: "STK-PROP-D30",
    code: "PROP-D30",
    name: "Teleskopski čelični podupirač Klasa D-30",
    category: "Podupirači",
    totalFleetUnits: 6500,
    currentlyDeployedUnits: 5350,
    reservedUnits: 420,
    availableInYardUnits: 730,
    unit: "kom",
    locationSlot: "Plac B-02 Paletirano Dobanovci",
  },
  {
    stockId: "STK-PROP-D35",
    code: "PROP-D35",
    name: "Teleskopski čelični podupirač Klasa D-35",
    category: "Podupirači",
    totalFleetUnits: 2000,
    currentlyDeployedUnits: 1620,
    reservedUnits: 110,
    availableInYardUnits: 270,
    unit: "kom",
    locationSlot: "Plac B-03 Dobanovci",
  },
  {
    stockId: "STK-PROP-E45",
    code: "PROP-E45",
    name: "Teški industrijski podupirač Klasa E-45",
    category: "Podupirači",
    totalFleetUnits: 1200,
    currentlyDeployedUnits: 880,
    reservedUnits: 70,
    availableInYardUnits: 250,
    unit: "kom",
    locationSlot: "Plac B-04 Dobanovci",
  },
  {
    stockId: "STK-TRIPOD-ST",
    code: "TRIPOD-ST",
    name: "Tronožac za stabilizaciju podupirača",
    category: "Podupirači",
    totalFleetUnits: 2500,
    currentlyDeployedUnits: 1950,
    reservedUnits: 160,
    availableInYardUnits: 390,
    unit: "kom",
    locationSlot: "Plac B-02 Dobanovci",
  },
  {
    stockId: "STK-FORK-4WAY",
    code: "FORK-4WAY",
    name: "Četvorokrake viljuške za H20 nosače",
    category: "Plafonska oplata",
    totalFleetUnits: 4200,
    currentlyDeployedUnits: 3300,
    reservedUnits: 280,
    availableInYardUnits: 620,
    unit: "kom",
    locationSlot: "Magacin alata M-01",
  },
];

/**
 * Matches a generated bill of quantities against live Dobanovci warehouse inventory,
 * computes projected utilization rates, flags health statuses, and suggests substitutions.
 *
 * @param predmerItems Array of items generated by the structural calculation engine
 * @param currentStock Live stock records (defaults to Dobanovci Central Stock)
 * @returns Fleet Inventory Match Report with utilization analysis and warnings
 */
export function matchFleetInventory(
  predmerItems: BillOfQuantitiesItem[],
  currentStock: WarehouseStockRecord[] = DOBANOVCI_CENTRAL_STOCK
): FleetInventoryMatchReport {
  const stockMap = new Map<string, WarehouseStockRecord>();
  currentStock.forEach((item) => {
    stockMap.set(item.code, item);
  });

  const matchedItems: InventoryMatchItem[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];

  let overallStatus: StockHealthStatus = "AVAILABLE";
  let maxUtilizationItem = { code: "", name: "", rate: 0 };
  let isDispatchable = true;

  for (const requestedItem of predmerItems) {
    // Attempt exact code match or prefix match
    let stockItem = stockMap.get(requestedItem.code);

    if (!stockItem) {
      // Find fallback by category and code substring
      stockItem = currentStock.find(
        (s) =>
          s.category === requestedItem.category &&
          (requestedItem.code.startsWith(s.code.substring(0, 7)) ||
            s.name.toLowerCase().includes(requestedItem.name.toLowerCase().substring(0, 15)))
      );
    }

    if (!stockItem) {
      // Consumables or accessories without strict stock tracking
      matchedItems.push({
        code: requestedItem.code,
        name: requestedItem.name,
        requestedQuantity: requestedItem.quantity,
        availableInYard: 9999,
        currentlyDeployed: 0,
        reserved: 0,
        totalFleet: 9999,
        projectedYardRemaining: 9999 - requestedItem.quantity,
        projectedUtilizationRate: 0,
        healthStatus: "AVAILABLE",
        notes: "Artikal se isporučuje iz tekuće nabavke ili partnerske distribucije",
      });
      continue;
    }

    const availableInYard = stockItem.availableInYardUnits;
    const requestedQty = requestedItem.quantity;
    const projectedYardRemaining = availableInYard - requestedQty;

    // Projected fleet utilization rate: (currently deployed + reserved + newly requested) / total fleet
    const projectedCommitted =
      stockItem.currentlyDeployedUnits + stockItem.reservedUnits + requestedQty;
    const projectedUtilizationRate =
      Math.round((projectedCommitted / stockItem.totalFleetUnits) * 1000) / 10;

    let itemHealth: StockHealthStatus = "AVAILABLE";

    if (projectedYardRemaining < 0) {
      itemHealth = "DEFICIT";
      isDispatchable = false;
      overallStatus = "DEFICIT";
      warnings.push(
        `DEFICIT NA LAGERU: Zahtevano ${requestedQty} ${stockItem.unit} za '${stockItem.name}', ` +
        `a na placu Dobanovci je slobodno samo ${availableInYard} ${stockItem.unit} ` +
        `(Nedostaje: ${Math.abs(projectedYardRemaining)} ${stockItem.unit}).`
      );

      // Modular substitution recommendations
      if (requestedItem.code.includes("-90")) {
        recommendations.push(
          `PREDLOG ZAMENE: Nedostajuće panele širine 0.90m (${stockItem.code}) možete ` +
          `zameniti kombinacijom 2 panela širine 0.45m (PAN-270-45) koji su trenutno dostupni.`
        );
      } else if (requestedItem.code === "PROP-D30") {
        recommendations.push(
          `PREDLOG ZAMENE: Nedostajući podupirači Klasa D-30 mogu se zameniti raspoloživim ` +
          `podupiračima više klase D-35 (PROP-D35) bez doplate za kupca.`
        );
      }
    } else if (projectedUtilizationRate >= 90) {
      itemHealth = "CRITICAL";
      if (overallStatus !== "DEFICIT") overallStatus = "CRITICAL";
      warnings.push(
        `KRITIČNO ZAUZEĆE (${projectedUtilizationRate}%): Artikal '${stockItem.name}' ` +
        `prelazi 90% angažovanosti flote. Preostaje samo ${projectedYardRemaining} ${stockItem.unit} na lageru.`
      );
    } else if (projectedUtilizationRate >= 80) {
      itemHealth = "WARNING";
      if (overallStatus === "AVAILABLE") overallStatus = "WARNING";
      warnings.push(
        `UPOZORENJE NA LAGERU (${projectedUtilizationRate}%): '${stockItem.name}' ulazi u zonu visoke potražnje.`
      );
    }

    if (projectedUtilizationRate > maxUtilizationItem.rate) {
      maxUtilizationItem = {
        code: stockItem.code,
        name: stockItem.name,
        rate: projectedUtilizationRate,
      };
    }

    matchedItems.push({
      code: stockItem.code,
      name: stockItem.name,
      requestedQuantity: requestedQty,
      availableInYard,
      currentlyDeployed: stockItem.currentlyDeployedUnits,
      reserved: stockItem.reservedUnits,
      totalFleet: stockItem.totalFleetUnits,
      projectedYardRemaining,
      projectedUtilizationRate,
      healthStatus: itemHealth,
      notes:
        projectedYardRemaining >= 0
          ? `Lager Dobanovci ${stockItem.locationSlot} pokriva 100% zahteva`
          : `Deficit: preusmeriti sa gradilišta u demobilizaciji ili primeniti zamenu`,
    });
  }

  if (isDispatchable && warnings.length === 0) {
    recommendations.push(
      "Sva tražena oprema je 100% raspoloživa na centralnom placu Dobanovci. Nalog je spreman za automatsku rezervaciju i izdavanje otpremnice."
    );
  }

  return {
    timestamp: new Date().toISOString(),
    isDispatchable,
    overallStatus,
    maxUtilizationItem,
    matchedItems,
    warnings,
    recommendations,
  };
}
