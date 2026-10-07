"use client";

import React, { useState } from "react";
import {
  Layers,
  FileCheck2,
  Shield,
  Download,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Weight,
  Cpu,
} from "lucide-react";
import { ProductCategory } from "@/types";
import { useCurrency } from "./CurrencyContext";

export function TechnicalCatalog() {
  const [selectedCat, setSelectedCat] = useState<ProductCategory>("Zidna oplata");
  const { formatPrice } = useCurrency();

  const catalogItems = [
    // 1. Zidna oplata
    {
      category: "Zidna oplata" as ProductCategory,
      title: "SFS Framax Čelična Ramovska Oplata (Kompatibilna Doka/PERI)",
      norm: "DIN 18218 / EN 12812",
      standardLoad: "Dozvoljeni bočni pritisak svežeg betona: 60 - 80 kN/m²",
      weight: "cca 45 kg/m²",
      sheathing: "Visokokvalitetni finski brezov šper 21mm (220 g/m² fenolni film)",
      description:
        "Visokoučinkoviti čelični ramovi vruće cinkovani sa ojačanim profilima. Predviđeni za brzu montažu bez krupnog alata uz pomoć centrirajućih brzih spojki (kandži).",
      specs: [
        { name: "Visine panela", val: "2.70m, 3.00m, 3.30m" },
        { name: "Standardne širine", val: "0.90m, 0.60m, 0.45m, 0.30m" },
        { name: "Profil rama", val: "Čelični šuplji profil 123mm ojačan na ivicama" },
        { name: "Ankerisanje", val: "DW15 toplo valjana šipka sa maticom Ø120mm" },
      ],
      atest: "Atest Instituta IMS br. M-1049/24 (Nosivost i deformacije)",
      dailyRentEur: 0.32,
    },
    // 2. Plafonska oplata
    {
      category: "Plafonska oplata" as ProductCategory,
      title: "SFS Dokaflex H20 Nosači & Troslojne Žute Ploče 21mm",
      norm: "EN 13377 / ÖNORM B 3023",
      standardLoad: "Maksimalni moment savijanja H20: M = 5.0 kNm, Transverzalna sila: Q = 11.0 kN",
      weight: "Žuta ploča: 10.5 kg/m² | H20 greda: 4.8 kg/m'",
      sheathing: "Troslojna puno drvo smreka/jela sa zaštitnim melaminskim slojem i PUR zaptivanjem ivica",
      description:
        "Fleksibilni sistem za plafone debljine od 16 do 50cm. Prilagođava se svakom tlocrtnom obliku bez obzira na grede, prepuste i padove.",
      specs: [
        { name: "Dužine H20 nosača", val: "2.45m, 2.90m, 3.90m, 4.90m" },
        { name: "Dimenzije žute oplate", val: "2000x500mm i 2500x500mm, debljina 21mm" },
        { name: "Krajevi H20", val: "Zaštićeni čeličnim ili plastičnim kapama protiv cepanja" },
        { name: "Podupiranje", val: "Viljuške i preklopni tronošci sa brzim zaključavanjem" },
      ],
      atest: "Sertifikat o kvalitetu šumarskog fakulteta i CE oznaka",
      dailyRentEur: 0.22,
    },
    // 3. Građevinski podupirači
    {
      category: "Podupirači" as ProductCategory,
      title: "Teleskopski Čelični Podupirači Klasa D-30 i E-45 (EN 1065)",
      norm: "EN 1065 Klasa D / E",
      standardLoad: "Nosivost: 20 kN do 35 kN garantovano pri svakom stepenu izvlačenja",
      weight: "D-30: 17.5 kg | E-45: 28.5 kg",
      sheathing: "Vruće cinkovana zaštita celog tela (minimalno 60 µm cinka)",
      description:
        "Konstruisani u potpunosti po evropskom standardu EN 1065. Opremljeni sistemom protiv prignječenja šaka (sigurnosni razmak 10cm) i osiguranjem protiv ispadanja unutrašnje cevi.",
      specs: [
        { name: "Klasa D-30 raspon", val: "1.80m - 3.00m (EN 1065 D)" },
        { name: "Klasa D-35 raspon", val: "2.00m - 3.50m (EN 1065 D)" },
        { name: "Klasa E-45 teška serija", val: "2.50m - 4.50m (EN 1065 E, visoka nosivost)" },
        { name: "Navoj", val: "Samočisteći spoljni kovani navoj sa livenom navrtkom" },
      ],
      atest: "TÜV Rheinland tipski atest i IMS sertifikat o statičkoj nosivosti",
      dailyRentEur: 0.08,
    },
    // 4. Skele
    {
      category: "Skele" as ProductCategory,
      title: "Fasadna Ramovska 0.73m & Modularna Ringlock Skela",
      norm: "EN 12810 / EN 12811 (Klasa opterećenja 3 - 200 kg/m² do 450 kg/m²)",
      standardLoad: "Dozvoljeno korisno opterećenje radnog nivoa: 2.0 kN/m² do 4.5 kN/m²",
      weight: "cca 18 kg/m² montirane skele",
      sheathing: "Čelični perforirani protivklizni patosi i aluminijumski prolazi sa merdevinama",
      description:
        "Standardna tipska skela širine 0.73m za brzo postavljanje fasade, kao i Ringlock sistem za industrijska postrojenja, nepravilne kružne objekte i teška opterećenja.",
      specs: [
        { name: "Dužina polja", val: "2.50m i 3.00m" },
        { name: "Širina gazišta", val: "0.32m (dupli patos) i 0.64m" },
        { name: "Zaštita radnika", val: "Dvostruke ograde, ivične daske i zelena mreža" },
        { name: "Ankerisanje", val: "Fasadni vijak Ø14 sa uškom i skelskom spojnicom" },
      ],
      atest: "Atest o bezbednosti na radu i statički proračun za vetar do 120 km/h",
      dailyRentEur: 0.12,
    },
    // 5. Prateći materijal
    {
      category: "Prateći materijal" as ProductCategory,
      title: "Anker Pribor DW15, Kravate za Stubove & Biorazgradivi Oplatol",
      norm: "DIN 18216 (DW15 zatezna sila > 190 kN)",
      standardLoad: "Zatezna čvrstoća šipke: 190 kN • Dozvoljena radna sila: 90 kN",
      weight: "DW15: 1.44 kg/m' | Oplatol: 0.88 kg/L",
      sheathing: "Visoko legirani čelik toplo valjan (nije varen, otporan na dinamičke udare)",
      description:
        "Sveobuhvatan program prateće opreme za betoniranje: toplo valjane anker šipke DW15, leptiraste matice, podesivi stezači za stubove do 45x45cm i ekološko ulje za odvajanje betona.",
      specs: [
        { name: "Anker šipka DW15", val: "Toplo valjana sa atestom na zatezanje" },
        { name: "Leptiraste matice", val: "Kovano liveno gvožđe sa podloškom Ø120mm" },
        { name: "Stezači za stubove", val: "Podesivi čelični vinkli sa klinom za 15-45cm" },
        { name: "SFS Oplatol Eko", val: "Biorazgradivo, potrošnja 1L na 15 m²" },
      ],
      atest: "Hemijski atest o biorazgradivosti & Mašinski atest zatezanja",
      dailyRentEur: 0.05,
    },
  ];

  const categories: ProductCategory[] = [
    "Zidna oplata",
    "Plafonska oplata",
    "Podupirači",
    "Skele",
    "Prateći materijal",
  ];

  const currentItem = catalogItems.find((i) => i.category === selectedCat) || catalogItems[0];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 mb-2">
            <FileCheck2 className="w-3.5 h-3.5" />
            Standardizovana Oprema & Tehnički Listovi
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Katalog Proizvoda, <span className="text-amber-500">Nosivosti & Atesti</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            Sva oprema SFS Oplate poseduje zvanične sertifikate instituta IMS i usaglašena je
            sa evropskim standardima EN 1065, EN 12810 i DIN 18218.
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedCat === cat
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                  : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Product Detail Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Technical Specs & Overview (8 cols) */}
        <div className="lg:col-span-8 glass-panel p-6 sm:p-8 rounded-3xl space-y-6 border border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <span className="text-xs font-bold font-mono text-amber-500 uppercase">
              {currentItem.norm}
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
              {currentItem.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2">
              {currentItem.description}
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">
                Dozvoljeno Statičko Opterećenje
              </span>
              <div className="font-bold text-slate-900 dark:text-white">
                {currentItem.standardLoad}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">
                Masa Konstrukcije
              </span>
              <div className="font-bold text-slate-900 dark:text-white">
                {currentItem.weight}
              </div>
            </div>
          </div>

          {/* Specification Grid */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Tehnički Detalji & Dimenzije Sistema
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {currentItem.specs.map((s, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center p-2.5 rounded-xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60"
                >
                  <span className="text-slate-500">{s.name}:</span>
                  <span className="font-bold font-mono text-slate-900 dark:text-slate-200">
                    {s.val}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Official Atest Badge */}
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-3 text-xs">
            <Shield className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-emerald-700 dark:text-emerald-400">
                Zvanični Sertifikat & Atest
              </div>
              <div className="text-slate-600 dark:text-slate-300 mt-0.5">
                {currentItem.atest}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Pricing & Download Action (4 cols) */}
        <div className="lg:col-span-4 glass-panel p-6 sm:p-7 rounded-3xl space-y-6 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Indikativna Tarifa Najma
            </span>
            <div>
              <span className="text-3xl font-black font-mono text-amber-500">
                {formatPrice(currentItem.dailyRentEur)}
              </span>
              <span className="text-xs text-slate-500 block mt-1">
                po m² / komadu na dan (bez PDV)
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5 text-slate-600 dark:text-slate-400">
              <div className="font-bold text-slate-900 dark:text-white">Uključeno u cenu najma:</div>
              <ul className="list-disc pl-4 space-y-1 text-[11px]">
                <li>Mašinsko čišćenje i nanošenje zaštitnog oplatola pre izdavanja</li>
                <li>Paletirani utovar kranom u Dobanovcima</li>
                <li>Izdavanje fabričkih atesta za gradilišni nadzor</li>
              </ul>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={() => {
                alert(`Preuzimanje zvaničnog tehničkog lista za: ${currentItem.title}`);
              }}
              className="w-full py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-bold text-xs hover:border-amber-500 transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4 text-amber-500" />
              Preuzmi PDF Tehnički List (Katalog)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
