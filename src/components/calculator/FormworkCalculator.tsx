"use client";

import React, { useState, useMemo } from "react";
import {
  Building2,
  Grid,
  Box,
  Layers,
  Sparkles,
  ShieldCheck,
  Truck,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  FileText,
  Send,
  Plus,
  Minus,
  Scale,
  Compass,
  ArrowRight,
  Anchor,
  Clock,
  Printer,
} from "lucide-react";
import {
  WallCalculationInput,
  WallHeightVariant,
  StructuralCalculationResult,
  BillOfQuantitiesItem,
  FleetInventoryMatchReport,
} from "@/types/calculator";
import { calculateWallFormwork } from "@/lib/calculations/wallFormwork";
import { calculateSlabFormwork } from "@/lib/calculations/slabFormwork";
import { matchFleetInventory } from "@/lib/inventory/fleetMatcher";
import { useCurrency } from "@/components/CurrencyContext";
import { useToast } from "@/components/ToastContext";

interface FormworkCalculatorProps {
  onGenerateOffer?: (result: StructuralCalculationResult) => void;
  onSubmitInquiry?: (inquiryData: any) => void;
}

export function FormworkCalculator({
  onGenerateOffer,
  onSubmitInquiry,
}: FormworkCalculatorProps) {
  const { formatPrice, currency } = useCurrency();
  const { showToast } = useToast();

  // Active formwork system tab
  const [activeTab, setActiveTab] = useState<"wall" | "slab" | "scaffold">("wall");

  // --- ZIDNA OPLATA STATE ---
  const [wallHeight, setWallHeight] = useState<WallHeightVariant>(2.70);
  const [wallLength, setWallLength] = useState<number>(36);
  const [cornersCount, setCornersCount] = useState<number>(4);
  const [wallThickness, setWallThickness] = useState<number>(25);
  const [durationDays, setDurationDays] = useState<number>(30);

  // --- PLAFONSKA OPLATA STATE ---
  const [slabArea, setSlabArea] = useState<number>(450);
  const [slabThickness, setSlabThickness] = useState<number>(20);
  const [ceilingHeight, setCeilingHeight] = useState<number>(2.90);

  // --- FASADERSKA SKELA STATE ---
  const [scaffoldWidth, setScaffoldWidth] = useState<number>(40);
  const [scaffoldHeight, setScaffoldHeight] = useState<number>(18);

  // Quick submission modal state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- 1. WALL CALCULATION MEMO ---
  const wallCalculationResult: StructuralCalculationResult = useMemo(() => {
    const input: WallCalculationInput = {
      wallHeight,
      totalLength: wallLength,
      cornersCount,
      wallThickness,
      durationDays,
    };
    return calculateWallFormwork(input);
  }, [wallHeight, wallLength, cornersCount, wallThickness, durationDays]);

  // --- 2. SLAB CALCULATION MEMO ---
  const slabCalculationResult: StructuralCalculationResult = useMemo(() => {
    return calculateSlabFormwork({
      slabArea,
      slabThickness,
      ceilingHeight,
      durationDays,
    });
  }, [slabArea, slabThickness, ceilingHeight, durationDays]);

  // Current calculation according to active tab
  const currentResult: StructuralCalculationResult = useMemo(() => {
    if (activeTab === "wall") return wallCalculationResult;
    if (activeTab === "slab") return slabCalculationResult;

    // Fallback simple calc for scaffold if selected
    const surfaceM2 = scaffoldWidth * scaffoldHeight;
    const dummyWall = calculateWallFormwork({
      wallHeight: 2.70,
      totalLength: Math.round(scaffoldWidth / 2),
      cornersCount: 2,
      wallThickness: 20,
      durationDays,
    });
    return {
      ...dummyWall,
      systemType: "wall",
      systemTitle: `Fasaderska Ramovska Skela š=0.73m (${surfaceM2} m²)`,
      metrics: {
        ...dummyWall.metrics,
        totalContactAreaM2: surfaceM2,
      },
    };
  }, [activeTab, wallCalculationResult, slabCalculationResult, scaffoldWidth, scaffoldHeight, durationDays]);

  // --- 3. FLEET INVENTORY MATCHING MEMO ---
  const inventoryReport: FleetInventoryMatchReport = useMemo(() => {
    return matchFleetInventory(currentResult.lineItems);
  }, [currentResult.lineItems]);

  // Actions
  const handleGeneratePdf = () => {
    if (onGenerateOffer) {
      onGenerateOffer(currentResult);
    } else {
      window.print();
    }
    showToast(
      "Zvanična Ponuda Generisana",
      `Tehnički predmer za ${currentResult.systemTitle} je spreman za štampu/preuzimanje.`,
      "success"
    );
  };

  const handleDispatchInquiry = () => {
    setIsSubmitting(true);
    const mockInquiry = {
      id: `SFS-${Math.floor(120 + Math.random() * 800)}`,
      company: "Direktan nalog sa Inženjerskog Kalkulatora",
      pib: "109887766",
      contactPerson: "Glavni inženjer gradilišta",
      phone: "+381 64 844 3322",
      email: "dispecer@gradiliste.rs",
      location: "Beograd / Srbija",
      category: activeTab === "wall" ? "Zidna oplata" : activeTab === "slab" ? "Plafonska oplata" : "Skele",
      description: currentResult.engineeringSummary,
      quantitySummary: `${currentResult.metrics.totalContactAreaM2} m² (${currentResult.systemTitle})`,
      startDate: new Date().toISOString().split("T")[0],
      durationDays,
      estimatedValueEur: Math.round(currentResult.metrics.subtotalRentalEur * 1.2),
      status: "U obradi" as const,
      createdAt: new Date().toLocaleDateString("sr-Latn-RS"),
      components: currentResult.lineItems.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        unitPriceEur: item.unitPricePerDay,
        totalEur: item.totalRentalPriceEur,
        specCode: item.code,
      })),
      notes: `Automatski proračun DIN 18218 / EN 1065. Zauzeće lagera: ${inventoryReport.overallStatus}.`,
    };

    setTimeout(() => {
      setIsSubmitting(false);
      if (onSubmitInquiry) {
        onSubmitInquiry(mockInquiry);
      }
      showToast(
        "Nalog Prosleđen u Dobanovce",
        `Predmet ${mockInquiry.id} je uspešno poslat u SFS Dispečerski centar.`,
        "success"
      );
    }, 300);
  };

  // Stock Badge Helpers
  const getStockBadge = () => {
    if (inventoryReport.overallStatus === "DEFICIT") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
          <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
          Deficit na placu Dobanovci
        </span>
      );
    }
    if (inventoryReport.overallStatus === "CRITICAL") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          Kritično zauzeće (&gt;90% flote)
        </span>
      );
    }
    if (inventoryReport.overallStatus === "WARNING") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          Upozorenje (80-90% zauzeto)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        Optimalno • Lager Dobanovci 100% pokriva
      </span>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8 text-white">
      {/* 1. Header & Context Bar */}
      <div className="relative rounded-3xl p-6 sm:p-10 border border-[#1E2C4A] bg-gradient-to-br from-[#0D1527] via-[#111C33] to-[#16223D] shadow-2xl overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mb-20"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              SFS INŽENJERSKI KALKULATOR & DISPEČERSKI PREDMER
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
              Proračun & Najam <span className="text-[#F59E0B]">Oplate i Skela</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              Izaberite tip konstrukcije, podesite dimenzije i dobijte automatsku specifikaciju
              sa tačnim brojem elemenata, nosača, podupirača i zvaničnom procenom troškova.
            </p>
          </div>

          {/* Top-Right Trust Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
            <div className="p-3.5 rounded-2xl bg-[#0B111E]/80 border border-[#1E2C4A] text-center shadow-lg">
              <span className="block text-2xl font-black text-[#F59E0B] font-mono">15.000+</span>
              <span className="text-xs text-slate-400 font-medium">m² oplate na lageru</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#0B111E]/80 border border-[#1E2C4A] text-center shadow-lg">
              <span className="block text-2xl font-black text-cyan-400 font-mono">24h</span>
              <span className="text-xs text-slate-400 font-medium">Mobilizacija na plac</span>
            </div>
            <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-[#0B111E]/80 border border-[#1E2C4A] text-center shadow-lg">
              <span className="block text-2xl font-black text-emerald-400 font-mono">EN 1065</span>
              <span className="text-xs text-slate-400 font-medium">Sertifikovana oprema</span>
            </div>
          </div>
        </div>

        {/* 2. System Navigation Tabs */}
        <div className="relative z-10 mt-8 pt-6 border-t border-[#1E2C4A]">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => setActiveTab("wall")}
              className={`flex items-center gap-3.5 p-4 rounded-2xl border transition-all text-left ${
                activeTab === "wall"
                  ? "bg-amber-500/15 border-[#F59E0B] text-amber-400 shadow-xl ring-1 ring-amber-500/40"
                  : "bg-[#0B111E]/60 border-[#1E2C4A] text-slate-300 hover:border-slate-600"
              }`}
            >
              <div className="p-2.5 rounded-xl bg-[#F59E0B] text-[#0B111E] font-black shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="font-extrabold text-sm sm:text-base text-white">Zidna Oplata</div>
                <div className="text-xs text-slate-400">
                  Čelični ramovi Framax, unutrašnji uglovi, ankeri
                </div>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("slab")}
              className={`flex items-center gap-3.5 p-4 rounded-2xl border transition-all text-left ${
                activeTab === "slab"
                  ? "bg-amber-500/15 border-[#F59E0B] text-amber-400 shadow-xl ring-1 ring-amber-500/40"
                  : "bg-[#0B111E]/60 border-[#1E2C4A] text-slate-300 hover:border-slate-600"
              }`}
            >
              <div className="p-2.5 rounded-xl bg-[#F59E0B] text-[#0B111E] font-black shrink-0">
                <Grid className="w-5 h-5" />
              </div>
              <div>
                <div className="font-extrabold text-sm sm:text-base text-white">Plafonska Oplata</div>
                <div className="text-xs text-slate-400">
                  H20 drveni nosači, žute ploče 21mm, D/E podupirači
                </div>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("scaffold")}
              className={`flex items-center gap-3.5 p-4 rounded-2xl border transition-all text-left ${
                activeTab === "scaffold"
                  ? "bg-amber-500/15 border-[#F59E0B] text-amber-400 shadow-xl ring-1 ring-amber-500/40"
                  : "bg-[#0B111E]/60 border-[#1E2C4A] text-slate-300 hover:border-slate-600"
              }`}
            >
              <div className="p-2.5 rounded-xl bg-[#F59E0B] text-[#0B111E] font-black shrink-0">
                <Box className="w-5 h-5" />
              </div>
              <div>
                <div className="font-extrabold text-sm sm:text-base text-white">Fasaderske Skele</div>
                <div className="text-xs text-slate-400">
                  Tipska ramovska š=0.73m i modularni Ringlock
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Two-Column Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ================= LEFT COLUMN: 1. Geometrijski Parametri Objekta ================= */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-6 sm:p-7 rounded-3xl bg-[#111C33] border border-[#1E2C4A] shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-[#1E2C4A] pb-4">
              <div className="flex items-center gap-2.5">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#F59E0B] text-[#0B111E] font-black text-xs">
                  1
                </span>
                <h3 className="font-black text-lg text-white">
                  Geometrijski Parametri Objekta
                </h3>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-[#0B111E] text-amber-400 border border-[#1E2C4A]">
                {currentResult.metrics.totalContactAreaM2} m² oplate
              </span>
            </div>

            {/* TAB: ZIDNA OPLATA INPUTS */}
            {activeTab === "wall" && (
              <div className="space-y-6">
                {/* Wall Height Segmented Buttons */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                    Visina Zida (Panelna konfiguracija)
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { h: 2.70 as WallHeightVariant, label: "Standard" },
                      { h: 3.00 as WallHeightVariant, label: "Povišeno" },
                      { h: 3.30 as WallHeightVariant, label: "Industrijski" },
                    ].map(({ h, label }) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setWallHeight(h)}
                        className={`py-3 px-3 rounded-2xl border text-center font-bold text-sm transition-all ${
                          wallHeight === h
                            ? "bg-[#F59E0B] text-[#0B111E] border-[#F59E0B] shadow-lg shadow-amber-500/20 font-black"
                            : "bg-[#0B111E] border-[#1E2C4A] text-slate-300 hover:border-slate-500"
                        }`}
                      >
                        {h.toFixed(2)} m
                        <span className="block text-[10px] font-normal opacity-80">
                          {label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Wall Total Length Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Ukupna Dužina Zidova
                    </label>
                    <span className="font-mono text-base font-black text-[#F59E0B]">
                      {wallLength} m'
                    </span>
                  </div>
                  <input
                    type="range"
                    min="6"
                    max="180"
                    step="1"
                    value={wallLength}
                    onChange={(e) => setWallLength(Number(e.target.value))}
                    className="w-full h-2.5 bg-[#0B111E] rounded-lg appearance-none cursor-pointer accent-[#F59E0B] border border-[#1E2C4A]"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                    <span>min 6 m</span>
                    <span>90 m</span>
                    <span>max 180 m</span>
                  </div>
                </div>

                {/* Secondary Inputs Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Stepper for Corners Count */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                      Broj Uglova i Preloma
                    </label>
                    <div className="flex items-center rounded-xl border border-[#1E2C4A] bg-[#0B111E] p-1">
                      <button
                        type="button"
                        onClick={() => setCornersCount(Math.max(0, cornersCount - 1))}
                        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#16223D] transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        min="0"
                        max="30"
                        value={cornersCount}
                        onChange={(e) => setCornersCount(Math.max(0, Math.min(30, Number(e.target.value))))}
                        className="w-full text-center bg-transparent font-mono font-black text-sm text-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setCornersCount(Math.min(30, cornersCount + 1))}
                        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#16223D] transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Select for Wall Thickness */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                      Debljina AB Zida
                    </label>
                    <select
                      value={wallThickness}
                      onChange={(e) => setWallThickness(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl border border-[#1E2C4A] bg-[#0B111E] text-white text-xs font-bold focus:outline-none focus:border-[#F59E0B]"
                    >
                      <option value={20}>20 cm (Pregradni / podrum)</option>
                      <option value={25}>25 cm (Standardni nosivi)</option>
                      <option value={30}>30 cm (Jezgro lifta)</option>
                      <option value={40}>40 cm (Industrijski potporni)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: PLAFONSKA OPLATA INPUTS */}
            {activeTab === "slab" && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Površina Ploče za Šalovanje
                    </label>
                    <span className="font-mono text-base font-black text-[#F59E0B]">
                      {slabArea} m²
                    </span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="2000"
                    step="25"
                    value={slabArea}
                    onChange={(e) => setSlabArea(Number(e.target.value))}
                    className="w-full h-2.5 bg-[#0B111E] rounded-lg appearance-none cursor-pointer accent-[#F59E0B] border border-[#1E2C4A]"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                    <span>50 m²</span>
                    <span>1.000 m²</span>
                    <span>2.000 m²</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                      Debljina Ploče: {slabThickness} cm
                    </label>
                    <input
                      type="range"
                      min="16"
                      max="35"
                      step="1"
                      value={slabThickness}
                      onChange={(e) => setSlabThickness(Number(e.target.value))}
                      className="w-full h-2.5 bg-[#0B111E] rounded-lg appearance-none cursor-pointer accent-[#F59E0B] border border-[#1E2C4A]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                      Svetla Visina: {ceilingHeight.toFixed(2)} m
                    </label>
                    <input
                      type="range"
                      min="2.5"
                      max="4.5"
                      step="0.1"
                      value={ceilingHeight}
                      onChange={(e) => setCeilingHeight(Number(e.target.value))}
                      className="w-full h-2.5 bg-[#0B111E] rounded-lg appearance-none cursor-pointer accent-[#F59E0B] border border-[#1E2C4A]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB: FASADERSKA SKELA INPUTS */}
            {activeTab === "scaffold" && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Širina Fronta Fasade
                    </label>
                    <span className="font-mono text-base font-black text-[#F59E0B]">
                      {scaffoldWidth} m
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="120"
                    step="2.5"
                    value={scaffoldWidth}
                    onChange={(e) => setScaffoldWidth(Number(e.target.value))}
                    className="w-full h-2.5 bg-[#0B111E] rounded-lg appearance-none cursor-pointer accent-[#F59E0B] border border-[#1E2C4A]"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Visina Objekta
                    </label>
                    <span className="font-mono text-base font-black text-[#F59E0B]">
                      {scaffoldHeight} m
                    </span>
                  </div>
                  <input
                    type="range"
                    min="6"
                    max="48"
                    step="2"
                    value={scaffoldHeight}
                    onChange={(e) => setScaffoldHeight(Number(e.target.value))}
                    className="w-full h-2.5 bg-[#0B111E] rounded-lg appearance-none cursor-pointer accent-[#F59E0B] border border-[#1E2C4A]"
                  />
                </div>
              </div>
            )}

            {/* Rental Duration Selector */}
            <div className="pt-2 border-t border-[#1E2C4A]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Planirani Period Najma
                </span>
                <span className="text-xs font-mono font-bold text-amber-400">
                  {durationDays} kalendarskih dana
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {[14, 30, 60].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDurationDays(d)}
                    className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all ${
                      durationDays === d
                        ? "bg-[#F59E0B] text-[#0B111E] border-[#F59E0B]"
                        : "bg-[#0B111E] border-[#1E2C4A] text-slate-400 hover:text-white"
                    }`}
                  >
                    {d} Dana
                  </button>
                ))}
              </div>
            </div>

            {/* Live Aggregate KPIs Card */}
            <div className="p-4 rounded-2xl bg-[#0B111E] border border-[#1E2C4A] space-y-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-[#F59E0B]" />
                Ključni Statički & Logistički Pokazatelji
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-[#111C33] border border-[#1E2C4A]/80">
                  <span className="block text-xs text-slate-400">Dnevni najam</span>
                  <span className="font-mono font-black text-sm text-[#F59E0B]">
                    {formatPrice(currentResult.metrics.dailyRentalCostEur)}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#111C33] border border-[#1E2C4A]/80">
                  <span className="block text-xs text-slate-400">Ukupna masa</span>
                  <span className="font-mono font-black text-sm text-cyan-400">
                    {currentResult.metrics.totalWeightTons} t
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#111C33] border border-[#1E2C4A]/80">
                  <span className="block text-xs text-slate-400">DW15 Ankeri</span>
                  <span className="font-mono font-black text-sm text-white">
                    {currentResult.metrics.recommendedTieRodsCount} kom
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#111C33] border border-[#1E2C4A]/80">
                  <span className="block text-xs text-slate-400">Kosi šprajcevi</span>
                  <span className="font-mono font-black text-sm text-white">
                    {currentResult.metrics.recommendedAlignmentStrutsCount} kom
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: 3. Automatski Predmer Opreme & Lager Provera ================= */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-6 sm:p-7 rounded-3xl bg-[#111C33] border border-[#1E2C4A] shadow-xl space-y-5 flex flex-col justify-between min-h-[580px]">
            <div className="space-y-4">
              {/* Header with Badges */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#1E2C4A] pb-4">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#F59E0B] text-[#0B111E] font-black text-xs">
                    3
                  </span>
                  <div>
                    <h3 className="font-black text-lg text-white">
                      Automatski Predmer & Lager
                    </h3>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {currentResult.lineItems.length} stavki u specifikaciji
                    </span>
                  </div>
                </div>

                {/* Stock Status Pill Badge from fleetMatcher */}
                {getStockBadge()}
              </div>

              {/* Warnings & Suggestions if Any */}
              {inventoryReport.warnings.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    Obaveštenje dispečerskog centra:
                  </div>
                  <ul className="list-disc pl-5 space-y-0.5 text-[11px]">
                    {inventoryReport.warnings.slice(0, 2).map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Itemized Equipment List */}
              <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                {currentResult.lineItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-[#0B111E]/80 border border-[#1E2C4A] hover:border-slate-600 transition-colors flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5 max-w-[65%]">
                      <div className="font-bold text-white line-clamp-1">
                        {item.name}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                        <span>Šifra: {item.code}</span>
                        <span>•</span>
                        <span>{item.weightPerUnitKg} kg/jed</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="inline-block px-2.5 py-1 rounded-xl bg-[#16223D] border border-[#1E2C4A] font-mono font-black text-amber-400 text-xs shadow-inner">
                        {item.quantity} {item.unit}
                      </span>
                      <span className="block text-[10px] font-mono text-slate-400 mt-0.5">
                        {formatPrice(item.unitPricePerDay)}/dan
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Financial Summary Strip */}
              <div className="pt-3 border-t border-[#1E2C4A] space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Osnovni najam ({durationDays} dana):</span>
                  <span className="font-mono font-bold text-white">
                    {formatPrice(currentResult.metrics.subtotalRentalEur)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Povratna kaucija (40%):</span>
                  <span className="font-mono text-slate-400">
                    {formatPrice(currentResult.metrics.refundableDepositEur)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>PDV 20%:</span>
                  <span className="font-mono text-slate-400">
                    {formatPrice(Math.round(currentResult.metrics.subtotalRentalEur * 0.20))}
                  </span>
                </div>
                <div className="pt-2 border-t border-[#1E2C4A] flex justify-between items-baseline font-black">
                  <span className="text-sm text-white">UKUPNO ZA NAJAM:</span>
                  <span className="text-xl font-mono text-[#F59E0B]">
                    {formatPrice(Math.round(currentResult.metrics.subtotalRentalEur * 1.20))}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Footer Buttons */}
            <div className="pt-4 border-t border-[#1E2C4A] grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleGeneratePdf}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#FBBF24] hover:to-[#F59E0B] text-[#0B111E] font-black text-xs sm:text-sm shadow-xl shadow-amber-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Generiši Zvaničnu Ponudu (PDF)
              </button>

              <button
                type="button"
                onClick={handleDispatchInquiry}
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl border border-[#F59E0B]/50 hover:bg-[#F59E0B]/10 text-amber-400 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? "Slanje..." : "Pošalji u Dispečerski Centar"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
