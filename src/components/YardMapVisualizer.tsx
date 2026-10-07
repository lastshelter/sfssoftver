"use client";

import React, { useState } from "react";
import { WarehouseItem } from "@/types";
import {
  MapPin,
  Truck,
  Box,
  Layers,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
} from "lucide-react";

interface YardMapVisualizerProps {
  stock: WarehouseItem[];
}

export function YardMapVisualizer({ stock }: YardMapVisualizerProps) {
  const [activeSector, setActiveSector] = useState<string>("A");

  const sectors = [
    {
      id: "A",
      name: "Sektor A — Zidna Ramovska Oplata",
      description: "Plac A-01 do A-04: Framax kompatibilni čelični ramovi 2.70m, 3.00m, 3.30m, unutrašnji i spoljni uglovi, centrirajuće spojke.",
      category: "Zidna oplata",
      capacityM2: 4500,
      occupiedM2: 3820,
      availableM2: 680,
      trucksLoading: 2,
      manager: "Marko Simić (Viljuškar 1)",
      color: "amber",
    },
    {
      id: "B",
      name: "Sektor B — Građevinski Podupirači",
      description: "Plac B-01 do B-04: Čelični paletirani podupirači Klasa D-30 (1.8-3.0m) i Klasa E-45 (2.5-4.5m) vruće cinkovani.",
      category: "Podupirači",
      capacityM2: 9700,
      occupiedM2: 8060,
      availableM2: 1640,
      trucksLoading: 1,
      manager: "Nikola Petrović (Šef lagera)",
      color: "cyan",
    },
    {
      id: "C",
      name: "Sektor C — Fasadne & Ringlock Skele",
      description: "Plac C-01 do C-06: Tipska ramovska skela š=0.73m i modularna Ringlock industrijska skela sa perforiranim patosima.",
      category: "Skele",
      capacityM2: 20500,
      occupiedM2: 16400,
      availableM2: 4100,
      trucksLoading: 3,
      manager: "Dejan Jovanović",
      color: "indigo",
    },
    {
      id: "H",
      name: "Hale 1 & 2 — Drveni H20 Nosači & Žuta Ploča",
      description: "Natkriveni magacini H-01 i H-02: H20 gredice (L=2.45m - 4.90m) i troslojna žuta oplata 21mm (2500x500mm).",
      category: "Plafonska oplata",
      capacityM2: 30500,
      occupiedM2: 24000,
      availableM2: 6500,
      trucksLoading: 1,
      manager: "Igor Vasić",
      color: "emerald",
    },
    {
      id: "E",
      name: "Eko-Zona — Oplatol, Prateći Pribor & Perionica",
      description: "Zona E: Biorazgradivi Oplatol ECO-Release, DW15 anker šipke, kravate za stubove, stanica za pranje oplate pod pritiskom.",
      category: "Prateći materijal",
      capacityM2: 12000,
      occupiedM2: 9500,
      availableM2: 2500,
      trucksLoading: 0,
      manager: "Slobodan Lukić",
      color: "rose",
    },
  ];

  const currentSector = sectors.find((s) => s.id === activeSector) || sectors[0];
  const occupancyPercent = Math.round((currentSector.occupiedM2 / currentSector.capacityM2) * 100);

  return (
    <div className="glass-panel p-6 sm:p-7 rounded-3xl space-y-5 border border-slate-200 dark:border-slate-800 shadow-xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-500">
              <MapPin className="w-4 h-4" />
            </span>
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
              Interaktivna Mapa Placa Dobanovci (Centralni Hub)
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Privredna Zona Dobanovci (E-70) • Površina placa: 28.000 m² sa kran stazom
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-slate-600 dark:text-slate-300 font-bold">Vaga & Rampa: Aktivno</span>
        </div>
      </div>

      {/* Visual Yard Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Graphical Map Blueprint (8 cols) */}
        <div className="lg:col-span-8 p-4 rounded-2xl bg-slate-950 border border-slate-800 relative space-y-3">
          {/* Dispatch Gate Header */}
          <div className="flex justify-between items-center px-2 text-[11px] font-mono text-slate-400 border-b border-slate-800/80 pb-2">
            <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
              <Truck className="w-3.5 h-3.5" /> Glavni Ulaz & Šleperska Vaga (Kapija 1)
            </span>
            <span>Utovar kranom 06:00 - 18:00h</span>
          </div>

          {/* Graphical Yard Sectors */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* Sector A */}
            <div
              onClick={() => setActiveSector("A")}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                activeSector === "A"
                  ? "bg-amber-500/20 border-amber-500 ring-2 ring-amber-500/30"
                  : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex justify-between items-center text-xs font-bold text-amber-400 mb-1">
                <span>SEKTOR A</span>
                <span className="font-mono text-[10px]">85%</span>
              </div>
              <div className="text-xs font-bold text-white">Zidna Oplata</div>
              <div className="text-[10px] text-slate-400 mt-1">Framax paneli h=2.7-3.3m</div>
              <div className="mt-2 w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="w-[85%] h-full bg-amber-500 rounded-full"></div>
              </div>
            </div>

            {/* Sector B */}
            <div
              onClick={() => setActiveSector("B")}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                activeSector === "B"
                  ? "bg-cyan-500/20 border-cyan-500 ring-2 ring-cyan-500/30"
                  : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex justify-between items-center text-xs font-bold text-cyan-400 mb-1">
                <span>SEKTOR B</span>
                <span className="font-mono text-[10px]">83%</span>
              </div>
              <div className="text-xs font-bold text-white">Podupirači</div>
              <div className="text-[10px] text-slate-400 mt-1">Palete D-30 & E-45</div>
              <div className="mt-2 w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="w-[83%] h-full bg-cyan-500 rounded-full"></div>
              </div>
            </div>

            {/* Sector C */}
            <div
              onClick={() => setActiveSector("C")}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                activeSector === "C"
                  ? "bg-indigo-500/20 border-indigo-500 ring-2 ring-indigo-500/30"
                  : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex justify-between items-center text-xs font-bold text-indigo-400 mb-1">
                <span>SEKTOR C</span>
                <span className="font-mono text-[10px]">80%</span>
              </div>
              <div className="text-xs font-bold text-white">Skele & Ringlock</div>
              <div className="text-[10px] text-slate-400 mt-1">Ramovske i modularne</div>
              <div className="mt-2 w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="w-[80%] h-full bg-indigo-500 rounded-full"></div>
              </div>
            </div>

            {/* Hale 1 & 2 */}
            <div
              onClick={() => setActiveSector("H")}
              className={`sm:col-span-2 p-3.5 rounded-xl border cursor-pointer transition-all ${
                activeSector === "H"
                  ? "bg-emerald-500/20 border-emerald-500 ring-2 ring-emerald-500/30"
                  : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex justify-between items-center text-xs font-bold text-emerald-400 mb-1">
                <span>HALE 1 & 2 (Natkriveno)</span>
                <span className="font-mono text-[10px]">78%</span>
              </div>
              <div className="text-xs font-bold text-white">H20 Nosači & Troslojne Žute Ploče</div>
              <div className="text-[10px] text-slate-400 mt-1">Klimatski zaštićeno skladište drvne građe</div>
              <div className="mt-2 w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="w-[78%] h-full bg-emerald-500 rounded-full"></div>
              </div>
            </div>

            {/* Eko Zona */}
            <div
              onClick={() => setActiveSector("E")}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                activeSector === "E"
                  ? "bg-rose-500/20 border-rose-500 ring-2 ring-rose-500/30"
                  : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex justify-between items-center text-xs font-bold text-rose-400 mb-1">
                <span>EKO-ZONA & ALAT</span>
                <span className="font-mono text-[10px]">79%</span>
              </div>
              <div className="text-xs font-bold text-white">Oplatol & Perionica</div>
              <div className="text-[10px] text-slate-400 mt-1">Pranje i hemija za beton</div>
              <div className="mt-2 w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="w-[79%] h-full bg-rose-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Selected Sector Live Telemetry Card (4 cols) */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 font-mono">
              Sektor {currentSector.id}
            </span>
            <h4 className="font-black text-base text-slate-900 dark:text-white mt-1.5">
              {currentSector.name}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {currentSector.description}
            </p>
          </div>

          <div className="space-y-2 text-xs pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex justify-between">
              <span className="text-slate-500">Iskorišćenost sektora:</span>
              <span className="font-mono font-black text-amber-500">{occupancyPercent}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Zauzeto na gradilištima:</span>
              <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                {currentSector.occupiedM2.toLocaleString()} jed.
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Slobodno za utovar:</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {currentSector.availableM2.toLocaleString()} jed.
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Trenutno kamiona na rampi:</span>
              <span className="font-mono font-bold text-cyan-500">
                {currentSector.trucksLoading} šlepera
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Odgovorno lice / rukovalac:</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {currentSector.manager}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
