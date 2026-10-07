"use client";

import React, { useState, useMemo } from "react";
import {
  Layers,
  Sliders,
  FileText,
  Send,
  Printer,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Building,
  Grid,
  Box,
  Shield,
  Sparkles,
  ArrowRight,
  Info,
} from "lucide-react";
import { FormworkType, ComponentItem, Inquiry } from "@/types";
import { CadBlueprintVisualizer } from "./CadBlueprintVisualizer";
import { useCurrency } from "./CurrencyContext";
import { useToast } from "./ToastContext";

interface EstimatorWizardProps {
  onNewInquirySubmitted: (inquiry: Inquiry) => void;
  onOpenPrintSpec: (specData: any) => void;
}

export function EstimatorWizard({
  onNewInquirySubmitted,
  onOpenPrintSpec,
}: EstimatorWizardProps) {
  const { formatPrice, currency, eurToRsdRate } = useCurrency();
  const { showToast } = useToast();

  // Mode selection
  const [formworkType, setFormworkType] = useState<FormworkType>("wall");

  // Step 1: Geometry Inputs
  // Wall params
  const [wallHeight, setWallHeight] = useState<number>(2.7);
  const [wallLength, setWallLength] = useState<number>(36);
  const [wallCorners, setWallCorners] = useState<number>(4);
  const [wallThickness, setWallThickness] = useState<number>(25);

  // Slab params
  const [slabArea, setSlabArea] = useState<number>(450);
  const [slabThickness, setSlabThickness] = useState<number>(20);
  const [ceilingHeight, setCeilingHeight] = useState<number>(2.9);

  // Scaffold params
  const [scaffoldWidth, setScaffoldWidth] = useState<number>(40);
  const [scaffoldHeight, setScaffoldHeight] = useState<number>(18);
  const [platformLevels, setPlatformLevels] = useState<number>(8);

  // Step 2 & 3: Rental Duration
  const [rentalDays, setRentalDays] = useState<number>(30);
  const [includeTransport, setIncludeTransport] = useState<boolean>(true);
  const [includeAssemblySupport, setIncludeAssemblySupport] = useState<boolean>(false);

  // Submission Form State
  const [companyName, setCompanyName] = useState("");
  const [pib, setPib] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  // Rigorous Architectural & Structural Calculation Engine (DIN 18218 / EN 1065)
  const calculation = useMemo(() => {
    let components: ComponentItem[] = [];
    let surfaceAreaM2 = 0;
    let baseRentalPerDayEur = 0;
    let title = "";
    let systemDescription = "";

    if (formworkType === "wall") {
      title = "Čelična Ramovska Zidna Oplata (Framax kompatibilna)";
      // Formwork covers both sides of the wall
      surfaceAreaM2 = wallLength * wallHeight * 2;
      
      // Panel Decomposition Logic (DIN 18218 Concrete Pressure 60-80 kN/m²)
      const totalFaceLength = wallLength * 2; // obe strane zida
      const primaryPanels = Math.ceil((totalFaceLength * 0.70) / 0.90); // 0.90m paneli nose 70%
      const fillPanels60 = Math.ceil((totalFaceLength * 0.20) / 0.60);  // 0.60m paneli nose 20%
      const fillPanels45 = Math.ceil((totalFaceLength * 0.10) / 0.45);  // 0.45m paneli nose 10%
      const innerCornerCount = wallCorners * 2; // unutrašnji uglovi h=wallHeight
      const outerCornerCount = wallCorners * 2; // spoljni ugaoni profili

      const totalPanels = primaryPanels + fillPanels60 + fillPanels45;
      const clamps = Math.ceil(totalPanels * 2.5); // 2.5 centrirajuće kandže po spoju
      // Anker šipke DW15: za h=2.7m idu 2 nivoa ankera, za h=3.0-3.3m idu 3 nivoa
      const tieLevels = wallHeight > 2.8 ? 3 : 2;
      const tieRods = Math.ceil((totalFaceLength / 0.90) * tieLevels);
      const wingNuts = tieRods * 2;
      const alignmentStruts = Math.ceil(totalFaceLength / 2.8); // kosnik na svakih 2.8m

      components = [
        {
          name: `Čelični ramovski panel h=${wallHeight.toFixed(2)}m x 0.90m`,
          quantity: primaryPanels,
          unit: "kom",
          unitPriceEur: 0.38,
          totalEur: primaryPanels * 0.38 * rentalDays,
          specCode: `PAN-${(wallHeight * 100).toFixed(0)}-90`,
        },
        {
          name: `Dopunski ramovski panel h=${wallHeight.toFixed(2)}m x 0.60m`,
          quantity: fillPanels60,
          unit: "kom",
          unitPriceEur: 0.30,
          totalEur: fillPanels60 * 0.30 * rentalDays,
          specCode: `PAN-${(wallHeight * 100).toFixed(0)}-60`,
        },
        {
          name: `Uklopni panel h=${wallHeight.toFixed(2)}m x 0.45m`,
          quantity: fillPanels45,
          unit: "kom",
          unitPriceEur: 0.26,
          totalEur: fillPanels45 * 0.26 * rentalDays,
          specCode: `PAN-${(wallHeight * 100).toFixed(0)}-45`,
        },
        {
          name: `Unutrašnji ugaoni elementi 0.30x0.30m h=${wallHeight.toFixed(2)}m`,
          quantity: innerCornerCount,
          unit: "kom",
          unitPriceEur: 0.48,
          totalEur: innerCornerCount * 0.48 * rentalDays,
          specCode: `CNR-INT-${(wallHeight * 100).toFixed(0)}`,
        },
        {
          name: `Spoljne ugaone stege h=${wallHeight.toFixed(2)}m`,
          quantity: outerCornerCount,
          unit: "kom",
          unitPriceEur: 0.35,
          totalEur: outerCornerCount * 0.35 * rentalDays,
          specCode: `CNR-EXT-${(wallHeight * 100).toFixed(0)}`,
        },
        {
          name: "Brze centrirajuće spojke (kandže)",
          quantity: clamps,
          unit: "kom",
          unitPriceEur: 0.05,
          totalEur: clamps * 0.05 * rentalDays,
          specCode: "CLM-BF",
        },
        {
          name: "Toplo valjane DW15 anker šipke L=1.00m (190kN)",
          quantity: tieRods,
          unit: "kom",
          unitPriceEur: 0.06,
          totalEur: tieRods * 0.06 * rentalDays,
          specCode: "DW15-HOT-100",
        },
        {
          name: "Leptiraste anker navrtke sa podloškom Ø120mm",
          quantity: wingNuts,
          unit: "kom",
          unitPriceEur: 0.03,
          totalEur: wingNuts * 0.03 * rentalDays,
          specCode: "DW15-NUT-120",
        },
        {
          name: "Kosnici za vertikalisanje i vetrovno opterećenje 3.40m",
          quantity: alignmentStruts,
          unit: "kom",
          unitPriceEur: 0.25,
          totalEur: alignmentStruts * 0.25 * rentalDays,
          specCode: "STRUT-340",
        },
      ];

      baseRentalPerDayEur = surfaceAreaM2 * 0.32;
      systemDescription = `Kompletan dvostrani sistem za ${wallLength}m dužnih zida visine ${wallHeight}m (debljina zida ${wallThickness}cm) sa ${wallCorners} uglova.`;
    } else if (formworkType === "slab") {
      title = "Plafonska Oplata sa H20 Nosačima i Podupiračima (Dokaflex tip)";
      surfaceAreaM2 = slabArea;
      
      // Dokaflex Math (EN 13377 H20 beams & EN 1065 props)
      const yellowBoardsCount = Math.ceil((slabArea * 1.05) / 1.25); // 2.5x0.5 = 1.25m2
      // Za debljinu d > 24cm, sekundarni nosači se zbijaju sa 50cm na 40cm
      const secondarySpacing = slabThickness > 24 ? 0.40 : 0.50;
      const secondaryMeters = Math.ceil(slabArea / secondarySpacing);
      const primaryMeters = Math.ceil(slabArea / 2.2); // primarni nosači na 2.2m
      const totalH20Meters = primaryMeters + secondaryMeters;

      // Nosivost podupirača: težina ploče (d * 25 kN/m3) + oplata + korisno (1.5 kN/m2)
      const loadPerM2 = (slabThickness / 100) * 25 + 0.4 + 1.5; // kN/m2
      const propCapacity = ceilingHeight > 3.2 ? 22 : 28; // kN (EN 1065 kriva)
      const safetyFactor = 1.5;
      const maxAreaPerProp = propCapacity / (loadPerM2 * safetyFactor);
      const propRatio = Math.max(0.9, Math.min(1.4, maxAreaPerProp));

      const propsCount = Math.ceil(slabArea / propRatio);
      const tripodsCount = Math.ceil(propsCount * 0.35);
      const forksCount = Math.ceil(propsCount * 0.65);

      components = [
        {
          name: "Žuta troslojna ploča 21mm (2500x500mm)",
          quantity: yellowBoardsCount,
          unit: "kom",
          unitPriceEur: 0.12,
          totalEur: yellowBoardsCount * 0.12 * rentalDays,
          specCode: "BOARD-3P-21",
        },
        {
          name: "H20 drveni nosači (primarna i sekundarna mreža)",
          quantity: totalH20Meters,
          unit: "m'",
          unitPriceEur: 0.04,
          totalEur: totalH20Meters * 0.04 * rentalDays,
          specCode: "H20-TIMBER",
        },
        {
          name: `Građevinski podupirači Klasa ${ceilingHeight > 3.2 ? "E-45" : "D-30"} (h=${ceilingHeight}m)`,
          quantity: propsCount,
          unit: "kom",
          unitPriceEur: 0.07,
          totalEur: propsCount * 0.07 * rentalDays,
          specCode: ceilingHeight > 3.2 ? "PROP-E45" : "PROP-D30",
        },
        {
          name: "Četvorokrake viljuške za H20 nosače",
          quantity: forksCount,
          unit: "kom",
          unitPriceEur: 0.02,
          totalEur: forksCount * 0.02 * rentalDays,
          specCode: "FORK-4WAY",
        },
        {
          name: "Tronožci za stabilizaciju podupirača",
          quantity: tripodsCount,
          unit: "kom",
          unitPriceEur: 0.04,
          totalEur: tripodsCount * 0.04 * rentalDays,
          specCode: "TRIPOD-ST",
        },
      ];

      baseRentalPerDayEur = slabArea * 0.22;
      systemDescription = `Kompletna plafonska garnitura za ${slabArea} m² ploče debljine d=${slabThickness}cm, svetle spratne visine ${ceilingHeight}m.`;
    } else {
      title = "Fasaderska Tipska Ramovska Skela (Širina 0.73m)";
      surfaceAreaM2 = scaffoldWidth * scaffoldHeight;
      const bayCount = Math.ceil(scaffoldWidth / 2.5);
      const levels = Math.ceil(scaffoldHeight / 2.0);
      
      const verticalFrames = (bayCount + 1) * levels;
      const steelDecks = bayCount * levels * 2;
      const hatchDecks = levels * 2;
      const diagonals = Math.ceil(bayCount * levels * 0.35);
      const wallAnchors = Math.ceil(surfaceAreaM2 / 24);
      const safetyNetting = Math.ceil(surfaceAreaM2 * 1.05);

      components = [
        {
          name: "Vertikalni ramovi čelični 2.00 x 0.73m",
          quantity: verticalFrames,
          unit: "kom",
          unitPriceEur: 0.08,
          totalEur: verticalFrames * 0.08 * rentalDays,
          specCode: "SCAF-FR-20",
        },
        {
          name: "Čelični perforirani patosi 2.50 x 0.32m",
          quantity: steelDecks,
          unit: "kom",
          unitPriceEur: 0.06,
          totalEur: steelDecks * 0.06 * rentalDays,
          specCode: "SCAF-DK-25",
        },
        {
          name: "Alu platforme sa merdevinama i prolaznim otvorom",
          quantity: hatchDecks,
          unit: "kom",
          unitPriceEur: 0.35,
          totalEur: hatchDecks * 0.35 * rentalDays,
          specCode: "SCAF-HATCH",
        },
        {
          name: "Dijagonale za ukrućenje polja 2.50m",
          quantity: diagonals,
          unit: "kom",
          unitPriceEur: 0.05,
          totalEur: diagonals * 0.05 * rentalDays,
          specCode: "SCAF-DIAG",
        },
        {
          name: "Fasadni ankeri sa kukama i vijcima za zid",
          quantity: wallAnchors,
          unit: "kom",
          unitPriceEur: 0.04,
          totalEur: wallAnchors * 0.04 * rentalDays,
          specCode: "SCAF-ANC",
        },
        {
          name: "Gusta zaštitna fasadna mreža (zelena)",
          quantity: safetyNetting,
          unit: "m²",
          unitPriceEur: 0.015,
          totalEur: safetyNetting * 0.015 * rentalDays,
          specCode: "SCAF-NET",
        },
      ];

      baseRentalPerDayEur = surfaceAreaM2 * 0.12;
      systemDescription = `Kompletna tipska fasadna skela fronta ${scaffoldWidth}m x visine ${scaffoldHeight}m (${surfaceAreaM2} m² fasade) sa ${platformLevels} radnih nivoa.`;
    }

    // Financijski obračun
    const rentalNetEur = Math.round(baseRentalPerDayEur * rentalDays);
    const transportEur = includeTransport ? (formworkType === "scaffold" ? 380 : 320) : 0;
    const engineeringFeeEur = includeAssemblySupport ? 250 : 0;
    const cleaningHandlingEur = Math.round(rentalNetEur * 0.08); // 8% rukovanje i priprema
    const consumablesEur = Math.round(surfaceAreaM2 * 0.45); // oplatol ulje, distanceri, PVC
    const depositEur = Math.round(rentalNetEur * 0.40); // 40% kaucija povratna

    const subtotalEur = rentalNetEur + transportEur + engineeringFeeEur + cleaningHandlingEur + consumablesEur;
    const vatEur = Math.round(subtotalEur * 0.20);
    const totalEur = subtotalEur + vatEur;
    const totalRsd = Math.round(totalEur * eurToRsdRate);

    return {
      title,
      systemDescription,
      surfaceAreaM2: Math.round(surfaceAreaM2),
      components,
      rentalDays,
      rentalNetEur,
      transportEur,
      engineeringFeeEur,
      cleaningHandlingEur,
      consumablesEur,
      depositEur,
      subtotalEur,
      vatEur,
      totalEur,
      totalRsd,
    };
  }, [
    formworkType,
    wallHeight,
    wallLength,
    wallCorners,
    wallThickness,
    slabArea,
    slabThickness,
    ceilingHeight,
    scaffoldWidth,
    scaffoldHeight,
    platformLevels,
    rentalDays,
    includeTransport,
    includeAssemblySupport,
    eurToRsdRate,
  ]);

  const handleSubmitInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !contactPerson.trim() || !phone.trim()) {
      showToast("Nepotpuni podaci", "Molimo unesite firmu, kontakt osobu i telefon.", "warning");
      return;
    }

    setIsSubmitting(true);

    const newId = `SFS-${Math.floor(116 + Math.random() * 800)}`;
    const newInquiry: Inquiry = {
      id: newId,
      company: companyName,
      pib: pib || "109887766",
      contactPerson,
      phone,
      email: email || "gradiliste@firma.rs",
      location: location || "Beograd / Srbija",
      category:
        formworkType === "wall"
          ? "Zidna oplata"
          : formworkType === "slab"
          ? "Plafonska oplata"
          : "Skele",
      description: calculation.systemDescription,
      quantitySummary: `${calculation.surfaceAreaM2} m² (${calculation.title})`,
      startDate: new Date().toISOString().split("T")[0],
      durationDays: rentalDays,
      estimatedValueEur: calculation.totalEur,
      status: "U obradi",
      createdAt: new Date().toLocaleString("sr-Latn-RS", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
      components: calculation.components,
      notes: notes || "Zahtev poslat putem SFS Inženjerskog Kalkulatora.",
    };

    setTimeout(() => {
      onNewInquirySubmitted(newInquiry);
      setIsSubmitting(false);
      setSubmissionSuccess(true);
      showToast(
        "Upit Uspešno Poslat!",
        `Predmet ${newId} je prosleđen u dispečerski centar Dobanovci na proveru lagera.`,
        "success"
      );
      setTimeout(() => setSubmissionSuccess(false), 5000);
    }, 700);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Hero Header */}
      <div className="relative rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white via-slate-50 to-amber-50/30 dark:from-slate-900/90 dark:via-slate-950 dark:to-amber-950/20 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mb-20"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              SFS Inženjerski Kalkulator & Dispečerski Predmer
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              Proračun & Najam <span className="text-amber-500">Oplate i Skela</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
              Izaberite tip konstrukcije, podesite dimenzije i dobijte automatsku specifikaciju
              sa tačnim brojem elemenata, nosača, podupirača i zvaničnom procenom troškova.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
            <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
              <span className="block text-2xl font-black text-amber-500 font-mono">15.000+</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">m² oplate na lageru</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
              <span className="block text-2xl font-black text-cyan-500 font-mono">24h</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Mobilizacija na plac</span>
            </div>
            <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-white/70 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
              <span className="block text-2xl font-black text-emerald-500 font-mono">EN 1065</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Sertifikovana oprema</span>
            </div>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="relative z-10 mt-8 pt-6 border-t border-slate-200/70 dark:border-slate-800/80">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => setFormworkType("wall")}
              className={`flex items-center gap-3.5 p-4 rounded-2xl border transition-all text-left ${
                formworkType === "wall"
                  ? "bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/80 text-amber-600 dark:text-amber-400 shadow-md ring-1 ring-amber-500/30"
                  : "bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <div className="p-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold shrink-0">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm sm:text-base">Zidna Oplata</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Čelični ramovi, Framax, uglovi, ankeri
                </div>
              </div>
            </button>

            <button
              onClick={() => setFormworkType("slab")}
              className={`flex items-center gap-3.5 p-4 rounded-2xl border transition-all text-left ${
                formworkType === "slab"
                  ? "bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/80 text-amber-600 dark:text-amber-400 shadow-md ring-1 ring-amber-500/30"
                  : "bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <div className="p-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold shrink-0">
                <Grid className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm sm:text-base">Plafonska Oplata</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  H20 nosači, žute ploče, D/E podupirači
                </div>
              </div>
            </button>

            <button
              onClick={() => setFormworkType("scaffold")}
              className={`flex items-center gap-3.5 p-4 rounded-2xl border transition-all text-left ${
                formworkType === "scaffold"
                  ? "bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/80 text-amber-600 dark:text-amber-400 shadow-md ring-1 ring-amber-500/30"
                  : "bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <div className="p-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold shrink-0">
                <Box className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm sm:text-base">Fasaderske Skele</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Tipska ramovska i ringlock skela, patosi
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols): Parameters & SVG CAD Blueprint */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step 1: Geometry Configuration */}
          <div className="glass-panel p-6 sm:p-7 rounded-3xl space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-extrabold text-xs">
                  1
                </span>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                  Geometrijski Parametri Objekta
                </h3>
              </div>
              <span className="text-xs font-mono px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                {calculation.surfaceAreaM2} m² oplate
              </span>
            </div>

            {/* Geometry Inputs by Mode */}
            {formworkType === "wall" && (
              <div className="space-y-5">
                {/* Wall Height Radio Buttons */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Visina Zida (Panelna konfiguracija)
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[2.7, 3.0, 3.3].map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setWallHeight(h)}
                        className={`py-3 px-4 rounded-xl border text-center font-bold text-sm transition-all ${
                          wallHeight === h
                            ? "bg-amber-500 text-slate-950 border-amber-500 shadow-md shadow-amber-500/20"
                            : "bg-slate-100/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-amber-500/50"
                        }`}
                      >
                        {h.toFixed(2)} m
                        <span className="block text-[10px] font-normal opacity-80">
                          {h === 2.7 ? "Standard" : h === 3.0 ? "Povišeno" : "Industrijski"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Wall Linear Length Slider */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Ukupna Dužina Zidova
                    </label>
                    <span className="font-mono text-base font-extrabold text-amber-500">
                      {wallLength} m'
                    </span>
                  </div>
                  <input
                    type="range"
                    min="6"
                    max="180"
                    step="2"
                    value={wallLength}
                    onChange={(e) => setWallLength(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono">
                    <span>6 m</span>
                    <span>90 m</span>
                    <span>180 m</span>
                  </div>
                </div>

                {/* Corners & Wall Thickness */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Broj Uglova i Preloma
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="24"
                        value={wallCorners}
                        onChange={(e) => setWallCorners(Number(e.target.value))}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:border-amber-500"
                      />
                      <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">uglova</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Debljina AB Zida
                    </label>
                    <select
                      value={wallThickness}
                      onChange={(e) => setWallThickness(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:border-amber-500"
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

            {formworkType === "slab" && (
              <div className="space-y-5">
                {/* Slab Surface Area Slider */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Površina Ploče za Šalovanje
                    </label>
                    <span className="font-mono text-base font-extrabold text-amber-500">
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
                    className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono">
                    <span>50 m²</span>
                    <span>1.000 m²</span>
                    <span>2.000 m²</span>
                  </div>
                </div>

                {/* Slab Thickness & Height */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Debljina Betonske Ploče
                      </label>
                      <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                        d = {slabThickness} cm
                      </span>
                    </div>
                    <input
                      type="range"
                      min="16"
                      max="32"
                      step="2"
                      value={slabThickness}
                      onChange={(e) => setSlabThickness(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Svetla Visina Etaže
                      </label>
                      <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                        h = {ceilingHeight.toFixed(2)} m
                      </span>
                    </div>
                    <input
                      type="range"
                      min="2.5"
                      max="4.5"
                      step="0.1"
                      value={ceilingHeight}
                      onChange={(e) => setCeilingHeight(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {formworkType === "scaffold" && (
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Širina Fronta Fasade
                    </label>
                    <span className="font-mono text-base font-extrabold text-amber-500">
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
                    className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Visina Objekta
                      </label>
                      <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                        H = {scaffoldHeight} m
                      </span>
                    </div>
                    <input
                      type="range"
                      min="6"
                      max="48"
                      step="2"
                      value={scaffoldHeight}
                      onChange={(e) => setScaffoldHeight(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Broj Radnih Nivoa Patosa
                    </label>
                    <input
                      type="number"
                      min="2"
                      max="20"
                      value={platformLevels}
                      onChange={(e) => setPlatformLevels(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Architectural CAD Blueprint SVG */}
          <CadBlueprintVisualizer
            type={formworkType}
            wallParams={{ height: wallHeight, length: wallLength, corners: wallCorners, thickness: wallThickness }}
            slabParams={{ area: slabArea, slabThickness, ceilingHeight }}
            scaffoldParams={{ width: scaffoldWidth, height: scaffoldHeight, platformLevels }}
            surfaceAreaM2={calculation.surfaceAreaM2}
          />

          {/* Rental Duration & Options */}
          <div className="glass-panel p-6 rounded-3xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-extrabold text-xs">
                  2
                </span>
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                  Period Najma & Logistika
                </h3>
              </div>
              <span className="text-xs text-amber-500 font-mono font-bold">
                {rentalDays} kalendarskih dana
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[14, 30, 60].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setRentalDays(days)}
                  className={`py-3 px-3 rounded-2xl border text-center font-bold text-sm transition-all ${
                    rentalDays === days
                      ? "bg-amber-500 text-slate-950 border-amber-500 shadow-md shadow-amber-500/20"
                      : "bg-slate-100/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-amber-500/50"
                  }`}
                >
                  {days} Dana
                  <span className="block text-[10px] font-normal opacity-80">
                    {days === 14 ? "Brzi ciklus" : days === 30 ? "Standardna etaža" : "Dugoročni najam"}
                  </span>
                </button>
              ))}
            </div>

            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeTransport}
                  onChange={(e) => setIncludeTransport(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-500 w-4 h-4"
                />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  SFS kamionski transport (Dobanovci ➔ Gradilište)
                </span>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeAssemblySupport}
                  onChange={(e) => setIncludeAssemblySupport(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-500 w-4 h-4"
                />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Instruktaža i nadzor SFS inženjera na gradilištu
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Automated Structural Spec & Cost Breakdown & Action */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 sm:p-7 rounded-3xl space-y-6 shadow-xl border-amber-500/30">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-extrabold text-xs">
                  3
                </span>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                  Automatski Predmer Opreme
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                {calculation.components.length} stavki
              </span>
            </div>

            {/* List of Structural Components */}
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {calculation.components.map((comp, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 text-xs"
                >
                  <div className="space-y-0.5 max-w-[70%]">
                    <div className="font-bold text-slate-900 dark:text-slate-100">
                      {comp.name}
                    </div>
                    <div className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
                      Šifra: {comp.specCode}
                    </div>
                  </div>
                  <div className="text-right font-mono font-bold text-slate-900 dark:text-amber-400">
                    <span className="text-sm">{comp.quantity}</span> {comp.unit}
                  </div>
                </div>
              ))}
            </div>

            {/* Budget & Price Breakdown (Currency Responsive) */}
            <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex justify-between">
                <span>Finansijska Procena</span>
                <span className="font-mono text-amber-500">Valuta: {currency}</span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Osnovni najam ({rentalDays} dana):</span>
                  <span className="font-mono font-bold">{formatPrice(calculation.rentalNetEur)}</span>
                </div>
                {includeTransport && (
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Doprema i otprema (kamion):</span>
                    <span className="font-mono font-bold">{formatPrice(calculation.transportEur)}</span>
                  </div>
                )}
                {includeAssemblySupport && (
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Inženjerska podrška na placu:</span>
                    <span className="font-mono font-bold">{formatPrice(calculation.engineeringFeeEur)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Priprema i servis oplate (8%):</span>
                  <span className="font-mono font-bold">{formatPrice(calculation.cleaningHandlingEur)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Oplatol ulje & potrošni materijal:</span>
                  <span className="font-mono font-bold">{formatPrice(calculation.consumablesEur)}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px] italic">
                  <span>*Povratna kaucija (depozit):</span>
                  <span className="font-mono">{formatPrice(calculation.depositEur)}</span>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between font-bold text-sm text-slate-900 dark:text-white">
                  <span>Ukupno bez PDV:</span>
                  <span className="font-mono">{formatPrice(calculation.subtotalEur)}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-xs">
                  <span>PDV 20%:</span>
                  <span className="font-mono">{formatPrice(calculation.vatEur)}</span>
                </div>
                <div className="pt-2 border-t-2 border-amber-500/50 flex justify-between items-baseline">
                  <div>
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                      UKUPNO SA PDV:
                    </span>
                    <span className="block text-[11px] text-slate-500 font-mono">
                      {currency === "EUR" ? `≈ ${calculation.totalRsd.toLocaleString()} RSD` : `≈ €${calculation.totalEur.toLocaleString()}`}
                    </span>
                  </div>
                  <span className="text-2xl font-black font-mono text-amber-500">
                    {formatPrice(calculation.totalEur)}
                  </span>
                </div>
              </div>
            </div>

            {/* Print Specification Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() =>
                  onOpenPrintSpec({
                    title: calculation.title,
                    type: formworkType,
                    surfaceAreaM2: calculation.surfaceAreaM2,
                    durationDays: rentalDays,
                    components: calculation.components,
                    pricing: calculation,
                    createdAt: new Date().toLocaleDateString("sr-Latn-RS"),
                  })
                }
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-bold text-xs hover:border-amber-500/60 hover:bg-amber-500/5 transition-all shadow-sm"
              >
                <Printer className="w-4 h-4 text-amber-500" />
                1-Klik Preuzmi / Štampaj PDF Predmer i Specifikaciju
              </button>
            </div>
          </div>

          {/* Inquiry Submission Box */}
          <div className="glass-panel p-6 rounded-3xl space-y-4 border border-amber-500/40">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white">
              <Send className="w-5 h-5 text-amber-500" />
              <h4 className="font-bold text-base">
                Zvaničan Zahtev za Rezervaciju & Ponudu
              </h4>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Podaci se prosleđuju direktno u SFS Dispečerski centar u Dobanovcima radi
              provere lager liste i zaključavanja opreme.
            </p>

            {submissionSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs space-y-1 text-center">
                <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-emerald-500" />
                <div className="font-bold text-sm">Zahtev uspešno poslat!</div>
                <div>Vaš upit je dodeljen u red čekanja SFS Dispečerskog Centra.</div>
              </div>
            ) : (
              <form onSubmit={handleSubmitInquiry} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      placeholder="Naziv Građevinske Firme *"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="PIB (Poreski broj)"
                      value={pib}
                      onChange={(e) => setPib(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      placeholder="Ime i prezime inženjera *"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      placeholder="Broj telefona (npr. 064...) *"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <input
                      type="email"
                      placeholder="Službeni E-mail"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Lokacija Gradilišta (Grad / Opština)"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <textarea
                  placeholder="Napomena za istovar kranom, prilaz šlepera ili faznost betoniranja..."
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                ></textarea>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/25 hover:from-amber-400 hover:to-amber-500 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? "Slanje u magacin Dobanovci..." : "Pošalji Zahtev za Zvaničnu Ponudu & Rezervaciju"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
