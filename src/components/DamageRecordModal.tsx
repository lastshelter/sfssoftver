"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  X,
  Plus,
  Minus,
  Trash2,
  Upload,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Building2,
  Truck,
  Calendar,
  Clock,
  Camera,
  Coins,
  FileCheck,
} from "lucide-react";
import { DamageReport, Inquiry } from "@/types";
import { useCurrency } from "./CurrencyContext";
import { useToast } from "./ToastContext";

interface DamageRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  inquiries: Inquiry[];
  onSaveReport: (report: DamageReport) => void;
}

interface DamagePresetItem {
  id: string;
  name: string;
  description: string;
  unitPriceEur: number;
  unit: string;
  count: number;
}

const DEFAULT_DAMAGE_PRESETS: DamagePresetItem[] = [
  {
    id: "dp-1",
    name: "Oštećena / probijena šperploča na ramu",
    description: "Čišćenje / krpljenje ili zamena špera",
    unitPriceEur: 45,
    unit: "kom",
    count: 2,
  },
  {
    id: "dp-2",
    name: "Kriv / deformisan čelični profil rama",
    description: "Ispravljanje ili totalna šteta na ramu",
    unitPriceEur: 120,
    unit: "kom",
    count: 1,
  },
  {
    id: "dp-3",
    name: "Kriv teleskopski podupirač EN 1065",
    description: "Trajna deformacija cevi (otpis i zamena)",
    unitPriceEur: 28,
    unit: "kom",
    count: 4,
  },
  {
    id: "dp-4",
    name: "Neoprana oprema / zapekao beton na bravicama i ramovima",
    description: "Hemijsko pranje pod visokim pritiskom",
    unitPriceEur: 4.5,
    unit: "m²",
    count: 25,
  },
  {
    id: "dp-5",
    name: "Deformisana / polomljena anker šipka DW15",
    description: "Oštećen navoj ili polomljena šipka",
    unitPriceEur: 9,
    unit: "kom",
    count: 6,
  },
];

export function DamageRecordModal({
  isOpen,
  onClose,
  inquiries,
  onSaveReport,
}: DamageRecordModalProps) {
  const { formatPrice } = useCurrency();
  const { showToast } = useToast();

  // Header state
  const [recordNumber] = useState(
    () => `ZAP-2026-${Math.floor(80 + Math.random() * 800).toString().padStart(3, "0")}`
  );

  const [selectedContract, setSelectedContract] = useState("Energoprojekt - Kula Kragujevac");
  const [receiveDateTime, setReceiveDateTime] = useState(() => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  });

  const [warehouseInspector, setWarehouseInspector] = useState(
    "Goran Jovanović (Šef magacina Dobanovci)"
  );
  const [carrierDriver, setCarrierDriver] = useState(
    "Miloš Ilić (Trans-Beton d.o.o. - BG 452-XX)"
  );

  // Damage items checklist
  const [damageItems, setDamageItems] = useState<DamagePresetItem[]>(DEFAULT_DAMAGE_PRESETS);

  // Custom added items
  const [customItems, setCustomItems] = useState<
    Array<{ id: string; name: string; unitPriceEur: number; unit: string; count: number }>
  >([]);

  // Notes and photos
  const [inspectionNotes, setInspectionNotes] = useState(
    "Istovar i prijem izvršeni na placu Dobanovci (Plac A-02). Pregledom utvrđeni ostaci betona na panelima i savijeni podupirači. Vozač potpisao zapisnik na licu mesta."
  );

  const [photos, setPhotos] = useState<string[]>([
    "ostecenje_ram_doka_01.jpg",
    "kriv_podupirac_d30.jpg",
    "zapekao_beton_bravice.jpg",
  ]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Calculate totals
  const presetTotalEur = damageItems.reduce(
    (sum, item) => sum + item.count * item.unitPriceEur,
    0
  );
  const customTotalEur = customItems.reduce(
    (sum, item) => sum + item.count * item.unitPriceEur,
    0
  );
  const totalPenaltyEur = Math.round(presetTotalEur + customTotalEur);
  const totalPenaltyRsd = Math.round(totalPenaltyEur * 117.2);

  // Counter updates
  const handlePresetCountChange = (id: string, delta: number) => {
    setDamageItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, count: Math.max(0, item.count + delta) } : item
      )
    );
  };

  const handleAddCustomItem = () => {
    const newItem = {
      id: `custom-${Date.now()}`,
      name: "Dodatno specifično oštećenje / nedostajući element",
      unitPriceEur: 35,
      unit: "kom",
      count: 1,
    };
    setCustomItems((prev) => [...prev, newItem]);
  };

  const handleRemoveCustomItem = (id: string) => {
    setCustomItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleRemovePhoto = (name: string) => {
    setPhotos((prev) => prev.filter((p) => p !== name));
  };

  const handleAddMockPhoto = () => {
    const newName = `foto_kontrole_${Date.now().toString().slice(-4)}.jpg`;
    setPhotos((prev) => [...prev, newName]);
    showToast("Fotografija Dodata", `Uspešno priložena ${newName}`, "info");
  };

  // Submit handler
  const handleSaveAndCharge = () => {
    const damagedList = [
      ...damageItems
        .filter((item) => item.count > 0)
        .map((item) => ({
          item: item.name,
          count: item.count,
          issue: item.description,
          penalty: Math.round(item.count * item.unitPriceEur),
        })),
      ...customItems
        .filter((item) => item.count > 0)
        .map((item) => ({
          item: item.name,
          count: item.count,
          issue: "Nestandardno oštećenje pri povratu",
          penalty: Math.round(item.count * item.unitPriceEur),
        })),
    ];

    const contractorParts = selectedContract.split(" - ");
    const contractorName = contractorParts[0] || "Ugovorni Izvođač";
    const jobsite = contractorParts[1] || "Centralni Magacin Dobanovci";

    const report: DamageReport = {
      id: recordNumber,
      inquiryId: inquiries[0]?.id || "SFS-101",
      contractorName,
      jobsite,
      returnDate: receiveDateTime.split("T")[0] || new Date().toISOString().split("T")[0],
      inspector: warehouseInspector,
      condition:
        totalPenaltyEur > 0
          ? "Kombinovano oštećenje i manjak elemenata"
          : "Uredno razduženo (očišćeno)",
      cleaningFeeEur: Math.round(
        (damageItems.find((d) => d.id === "dp-4")?.count || 0) * 4.5
      ),
      damageFeeEur: Math.max(0, totalPenaltyEur - 110),
      missingFeeEur: 0,
      totalPenaltyEur,
      notes: `${inspectionNotes} (Priloženo ${photos.length} fotografija. Vozač: ${carrierDriver})`,
      itemsDamaged: damagedList,
    };

    onSaveReport(report);
    showToast(
      "Zapisnik o Štetama Zaveden",
      `Zapisnik ${recordNumber} za izvođača ${contractorName} je zaveden sa penalom od €${totalPenaltyEur} (${totalPenaltyRsd.toLocaleString()} RSD).`,
      "warning"
    );
    onClose();
  };

  // Build contract dropdown list
  const contractOptions = [
    "Energoprojekt - Kula Kragujevac",
    "Grading d.o.o. - Novi Dorćol",
    "Modulor d.o.o. - Poslovni Objekat Blok 65",
    "Jadran d.o.o. - Voždovac Centar",
    "ZOP Inženjering - Lekino Brdo",
    "Gradina d.o.o. - Stambeni Kompleks Mirijevo",
    ...inquiries.map((inq) => `${inq.company} - ${inq.location}`),
  ];
  // Remove duplicates
  const uniqueContractOptions = Array.from(new Set(contractOptions));

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-4xl bg-[#0F172A] text-slate-100 rounded-3xl shadow-2xl border border-slate-800 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/80 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-lg shadow-amber-500/10">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg sm:text-xl font-black text-white">
                  Novi Zapisnik o Oštećenjima (Prijem)
                </h2>
                <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-lg bg-amber-500 text-slate-950">
                  {recordNumber}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Prijemna primopredajna kontrola i teret izvođača na placu SFS Dobanovci
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Section 1: Zaglavlje (Header Information) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Building2 className="w-4 h-4" /> 1. Osnovni Podaci o Prijemu i Izvođaču
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Izbor Ugovora / Gradilista */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="block font-bold text-slate-300 uppercase tracking-wide text-[11px]">
                  Izbor Ugovora / Gradilišta (Razduženje)
                </label>
                <select
                  value={selectedContract}
                  onChange={(e) => setSelectedContract(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white font-bold focus:border-amber-500 focus:outline-none"
                >
                  {uniqueContractOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Datum i vreme prijema */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-300 uppercase tracking-wide text-[11px] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Datum i Vreme Prijema
                </label>
                <input
                  type="datetime-local"
                  value={receiveDateTime}
                  onChange={(e) => setReceiveDateTime(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-950 font-mono text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Broj zapisnika (read-only verification) */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-300 uppercase tracking-wide text-[11px] flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" /> Broj Zapisnika (Automatski)
                </label>
                <input
                  type="text"
                  readOnly
                  value={recordNumber}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-800 bg-slate-950/60 font-mono font-bold text-amber-400 cursor-not-allowed"
                />
              </div>

              {/* Ime magacionera */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-300 uppercase tracking-wide text-[11px]">
                  Magacioner / Kontrolor u Dobanovcima
                </label>
                <input
                  type="text"
                  value={warehouseInspector}
                  onChange={(e) => setWarehouseInspector(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white font-medium focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Ime vozaca / prevoznika */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-300 uppercase tracking-wide text-[11px] flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-slate-400" /> Ime Vozača / Prevoznik (Registracija)
                </label>
                <input
                  type="text"
                  value={carrierDriver}
                  onChange={(e) => setCarrierDriver(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white font-medium focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Tabela / Lista Oštećenih Stavki */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <Coins className="w-4 h-4" /> 2. Tabela Oštećenih i Neopranih Elemenata (Cenovnik Sanacije)
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Predefinisani industrijski normativi za popravku, čišćenje i zamenu elemenata oplate
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddCustomItem}
                className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-bold px-3 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10"
              >
                <Plus className="w-3.5 h-3.5" /> Dodaj Stavku
              </button>
            </div>

            <div className="space-y-2.5">
              {damageItems.map((item) => {
                const rowTotal = Math.round(item.count * item.unitPriceEur);
                return (
                  <div
                    key={item.id}
                    className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-2xl border transition-all ${
                      item.count > 0
                        ? "bg-slate-900 border-amber-500/40 shadow-sm"
                        : "bg-slate-950/40 border-slate-800/80 opacity-70"
                    }`}
                  >
                    <div className="space-y-0.5 flex-1">
                      <div className="font-extrabold text-xs sm:text-sm text-white">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {item.description} • Normativ:{" "}
                        <span className="font-mono font-bold text-amber-400">
                          €{item.unitPriceEur.toFixed(2)} / {item.unit}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                      {/* Stepper counter */}
                      <div className="flex items-center rounded-xl border border-slate-700 bg-slate-950 p-1">
                        <button
                          type="button"
                          onClick={() => handlePresetCountChange(item.id, -1)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-12 text-center font-mono font-black text-xs sm:text-sm text-white">
                          {item.count}
                        </span>
                        <button
                          type="button"
                          onClick={() => handlePresetCountChange(item.id, 1)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Row total */}
                      <div className="text-right w-24 shrink-0 font-mono">
                        <div className="font-black text-sm text-amber-400">
                          €{rowTotal}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          ~{Math.round(rowTotal * 117.2).toLocaleString()} RSD
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Custom items */}
              {customItems.map((item) => {
                const rowTotal = Math.round(item.count * item.unitPriceEur);
                return (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-cyan-500/40 bg-slate-900"
                  >
                    <div className="flex-1 space-y-1">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) =>
                          setCustomItems((prev) =>
                            prev.map((c) =>
                              c.id === item.id ? { ...c, name: e.target.value } : c
                            )
                          )
                        }
                        className="w-full text-xs font-bold bg-transparent text-white border-b border-slate-700 focus:outline-none focus:border-cyan-400"
                      />
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span>Cena po kom (€):</span>
                        <input
                          type="number"
                          value={item.unitPriceEur}
                          onChange={(e) =>
                            setCustomItems((prev) =>
                              prev.map((c) =>
                                c.id === item.id
                                  ? { ...c, unitPriceEur: Number(e.target.value) }
                                  : c
                              )
                            )
                          }
                          className="w-16 px-1.5 py-0.5 rounded bg-slate-950 font-mono text-cyan-400 border border-slate-700"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center rounded-xl border border-slate-700 bg-slate-950 p-1">
                        <button
                          type="button"
                          onClick={() =>
                            setCustomItems((prev) =>
                              prev.map((c) =>
                                c.id === item.id ? { ...c, count: Math.max(0, c.count - 1) } : c
                              )
                            )
                          }
                          className="p-1 rounded text-slate-400 hover:text-white"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-10 text-center font-mono font-bold text-xs text-white">
                          {item.count}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setCustomItems((prev) =>
                              prev.map((c) =>
                                c.id === item.id ? { ...c, count: c.count + 1 } : c
                              )
                            )
                          }
                          className="p-1 rounded text-slate-400 hover:text-white"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right w-20 font-mono font-black text-xs text-cyan-400">
                        €{rowTotal}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveCustomItem(item.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Subtotal Banner */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-white block">
                  Ukupna naknada za oštećenja & penali sanacije:
                </span>
                <span className="text-[11px] text-slate-400">
                  Iznos se direktno tereti na depozit/kauciju ili fakturiše izvođaču radova
                </span>
              </div>
              <div className="text-left sm:text-right font-mono">
                <div className="text-2xl sm:text-3xl font-black text-amber-400">
                  €{totalPenaltyEur.toLocaleString()}
                </div>
                <div className="text-xs font-bold text-slate-300">
                  = {totalPenaltyRsd.toLocaleString()} RSD
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Dodatne napomene & Foto-dokumentacija */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Camera className="w-4 h-4" /> 3. Zapažanja Inspektora & Foto-Dokumentacija
            </h3>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">
                Opis zatečenog stanja pri istovaru:
              </label>
              <textarea
                rows={3}
                value={inspectionNotes}
                onChange={(e) => setInspectionNotes(e.target.value)}
                placeholder="Unesite detalje o zatečenom stanju, stepenu zaprljanosti ili odgovornosti..."
                className="w-full p-3 text-xs rounded-xl border border-slate-700 bg-slate-950 text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none"
              ></textarea>
            </div>

            {/* Photo upload dropzone */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">
                Priložene fotografije oštećenja (Terenski dokazni materijal):
              </label>

              <div
                onClick={handleAddMockPhoto}
                className="p-5 border-2 border-dashed border-slate-700 hover:border-amber-500 rounded-2xl bg-slate-950/50 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:bg-slate-950 text-center"
              >
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">
                    Kliknite za prilaganje fotografija sa telefona / drona
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Podržani formati: JPG, PNG, HEIC (do 25 MB po slici)
                  </span>
                </div>
              </div>

              {/* Photo chips list */}
              {photos.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {photos.map((photo) => (
                    <div
                      key={photo}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 text-xs text-slate-200 border border-slate-700"
                    >
                      <Camera className="w-3.5 h-3.5 text-amber-400" />
                      <span className="font-mono text-[11px]">{photo}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemovePhoto(photo);
                        }}
                        className="text-slate-400 hover:text-rose-400 transition-colors ml-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Action Buttons */}
        <div className="p-5 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="sm:w-1/3 py-3 px-4 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold text-xs transition-colors text-center"
          >
            Odustani
          </button>

          <button
            type="button"
            onClick={handleSaveAndCharge}
            className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <ShieldAlert className="w-4 h-4" />
            Zavedi Zapisnik & Tereti Izvođača (€{totalPenaltyEur})
          </button>
        </div>
      </div>
    </div>
  );
}
