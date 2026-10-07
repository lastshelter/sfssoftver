"use client";

import React, { useState } from "react";
import {
  Truck,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  FileText,
  AlertTriangle,
  Building2,
  Phone,
  ArrowRight,
  ShieldAlert,
  Printer,
  ChevronRight,
  ChevronDown,
  Send,
  FileCheck2,
  Boxes,
  Activity,
  Layers,
  Sparkles,
  RefreshCw,
  Download,
  MapPin,
} from "lucide-react";
import {
  Inquiry,
  WarehouseItem,
  DamageReport,
  RentalStatus,
  ProductCategory,
} from "@/types";
import { YardMapVisualizer } from "./YardMapVisualizer";
import { useCurrency } from "./CurrencyContext";
import { useToast } from "./ToastContext";

interface SupplierDeskProps {
  inquiries: Inquiry[];
  warehouseStock: WarehouseItem[];
  damageReports: DamageReport[];
  onSelectInquiry: (inquiry: Inquiry) => void;
  onStatusChange: (id: string, newStatus: RentalStatus) => void;
  onOpenDamageProtocolModal: () => void;
  onGenerateFormalOffer: (inquiry: Inquiry) => void;
}

export function SupplierDesk({
  inquiries,
  warehouseStock,
  damageReports,
  onSelectInquiry,
  onStatusChange,
  onOpenDamageProtocolModal,
  onGenerateFormalOffer,
}: SupplierDeskProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("Sve");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("Sve");
  const [activeSubTab, setActiveSubTab] = useState<"queue" | "yard">("queue");

  const { formatPrice, currency } = useCurrency();
  const { showToast } = useToast();

  // Filtering logic
  const filteredInquiries = inquiries.filter((inq) => {
    const matchesSearch =
      inq.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inq.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inq.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inq.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatusFilter === "Sve" || inq.status === selectedStatusFilter;

    const matchesCategory =
      selectedCategoryFilter === "Sve" || inq.category === selectedCategoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Aggregate metrics
  const totalInquiriesValue = inquiries.reduce(
    (sum, inq) => sum + inq.estimatedValueEur,
    0
  );
  const activeContractsCount = inquiries.filter(
    (inq) => inq.status === "Izdato na Plac" || inq.status === "Ugovor Potpisan"
  ).length;

  // Export Daily Dispatch CSV
  const handleExportDispatchCSV = () => {
    const headers = [
      "ID Predmeta",
      "Kompanija",
      "PIB",
      "Kontakt",
      "Telefon",
      "Gradiliste",
      "Kategorija",
      "Obim Opreme",
      "Pocetak Najma",
      "Period (dana)",
      "Vrednost EUR",
      "Status",
    ];

    const rows = inquiries.map((inq) => [
      inq.id,
      `"${inq.company}"`,
      inq.pib,
      `"${inq.contactPerson}"`,
      inq.phone,
      `"${inq.location}"`,
      `"${inq.category}"`,
      `"${inq.quantitySummary}"`,
      inq.startDate,
      inq.durationDays,
      inq.estimatedValueEur,
      `"${inq.status}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `SFS_Dnevni_Otpremni_Nalog_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(
      "CSV Otpremnica Preuzeta",
      "Dnevni izveštaj dispečera Dobanovci je sačuvan na vaš računar.",
      "success"
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Supplier Operations Header Bar */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
            <Truck className="w-3.5 h-3.5" />
            SFS Operativni Centar Dobanovci
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Dispečerski Centar & <span className="text-cyan-500">Upravljanje Flotom</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl">
            Pregled svih otvorenih komercijalnih upita, praćenje nivoa lagera u
            Dobanovcima i kontrola digitalnih zapisnika o primopredaji.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportDispatchCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:border-cyan-500 font-bold text-xs transition-all shadow-sm"
          >
            <Download className="w-4 h-4 text-cyan-500" />
            Izvezi Otpremni Nalog (CSV)
          </button>

          <button
            onClick={onOpenDamageProtocolModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-slate-950 font-bold text-xs transition-all shadow-sm"
          >
            <ShieldAlert className="w-4 h-4" />
            Novi Zapisnik o Oštećenjima (Prijem)
          </button>
        </div>
      </div>

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Ukupno Predmeta
          </span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white">
            {inquiries.length}
          </div>
          <span className="text-[11px] text-emerald-500 font-medium">
            15 aktivnih građevinskih firmi
          </span>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Aktivni Ugovori / Plac
          </span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-cyan-500">
            {activeContractsCount}
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Oprema raspoređena na terenu
          </span>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Vrednost Portfolija
          </span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-amber-500">
            {formatPrice(totalInquiriesValue)}
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Ugovoreni i potencijalni najam
          </span>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Zapisnici o Štetama
          </span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-500">
            {damageReports.length}
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Evidentirana razduženja
          </span>
        </div>
      </div>

      {/* Sub-Tabs: Red Čekanja vs Interaktivna Mapa Placa Dobanovci */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveSubTab("queue")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeSubTab === "queue"
              ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          Red Čekanja & Komercijalni Predmeti
        </button>

        <button
          onClick={() => setActiveSubTab("yard")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
            activeSubTab === "yard"
              ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          Interaktivna Mapa Placa Dobanovci
        </button>
      </div>

      {activeSubTab === "yard" ? (
        <YardMapVisualizer stock={warehouseStock} />
      ) : (
        <>
          {/* Warehouse Inventory & Yard Utilization Gauges */}
          <div className="glass-panel p-6 sm:p-7 rounded-3xl space-y-5 border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                  <Boxes className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                    Stanje Centralnog Magacina Dobanovci & Iskorišćenost Lagera
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Ukupan lager vs. Izdato na gradilišta vs. Rezervisano i Raspoloživo
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Optimalno (&lt;80%)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Upozorenje (80-90%)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Kritično (&gt;90%)
                </span>
              </div>
            </div>

            {/* Stock gauges grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {warehouseStock.slice(0, 4).map((item) => {
                const isCritical = item.utilizationRate >= 88;
                const isWarning = item.utilizationRate >= 80 && item.utilizationRate < 88;

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {item.category}
                      </span>
                      <span
                        className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                          isCritical
                            ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                            : isWarning
                            ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                            : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        }`}
                      >
                        {item.utilizationRate.toFixed(1)}% zauzeto
                      </span>
                    </div>

                    <div>
                      <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-1">
                        {item.name}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                        {item.locationSlot}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isCritical
                              ? "bg-rose-500"
                              : isWarning
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                          style={{ width: `${Math.min(100, item.utilizationRate)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-[10px] font-mono text-slate-500">
                        <span>Izdato: {item.rentedUnits} {item.unit}</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          Slobodno: {item.availableUnits} {item.unit}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Inquiries Queue */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6 border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Red Čekanja & Komercijalni Predmeti</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-mono">
                    {filteredInquiries.length} upita
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Kliknite na bilo koji upit za pregled specifikacije, promenu statusa ili generisanje ponude.
                </p>
              </div>

              {/* Search Input */}
              <div className="relative w-full lg:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Pretraži firmu, grad, SFS ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
                  <Filter className="w-3 h-3" /> Status:
                </span>
                {["Sve", "U obradi", "Poslata Ponuda", "Ugovor Potpisan", "Izdato na Plac"].map(
                  (st) => {
                    const count =
                      st === "Sve"
                        ? inquiries.length
                        : inquiries.filter((i) => i.status === st).length;
                    return (
                      <button
                        key={st}
                        onClick={() => setSelectedStatusFilter(st)}
                        className={`px-3 py-1 text-xs rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                          selectedStatusFilter === st
                            ? "bg-amber-500 text-slate-950 shadow-sm"
                            : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        <span>{st}</span>
                        <span
                          className={`px-1.5 py-0.2 text-[10px] rounded-full font-mono font-bold ${
                            selectedStatusFilter === st
                              ? "bg-slate-950 text-amber-400"
                              : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  }
                )}
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold focus:border-amber-500"
                >
                  <option value="Sve">Sve Kategorije Opreme</option>
                  <option value="Zidna oplata">Zidna oplata</option>
                  <option value="Plafonska oplata">Plafonska oplata</option>
                  <option value="Podupirači">Građevinski podupirači</option>
                  <option value="Skele">Fasaderske skele</option>
                  <option value="Prateći materijal">Prateći materijal</option>
                </select>
              </div>
            </div>

            {/* Inquiries Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/90 dark:bg-slate-950/80 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3.5 w-24">ID</th>
                    <th className="p-3.5">Kompanija / Naručilac</th>
                    <th className="p-3.5">Kategorija & Količina</th>
                    <th className="p-3.5">Gradilište</th>
                    <th className="p-3.5 w-28 text-center">Početak</th>
                    <th className="p-3.5 w-28 text-right">Vrednost ({currency})</th>
                    <th className="p-3.5 w-36 text-center">Status</th>
                    <th className="p-3.5 w-24 text-center">Akcije</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white/40 dark:bg-slate-900/40">
                  {filteredInquiries.map((inq) => {
                    const statusStyles =
                      inq.status === "Izdato na Plac"
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                        : inq.status === "Ugovor Potpisan"
                        ? "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30"
                        : inq.status === "Poslata Ponuda"
                        ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700";

                    return (
                      <tr
                        key={inq.id}
                        onClick={() => onSelectInquiry(inq)}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                      >
                        <td className="p-3.5 font-mono font-black text-amber-600 dark:text-amber-400">
                          {inq.id}
                        </td>
                        <td className="p-3.5">
                          <div className="font-extrabold text-slate-900 dark:text-white">
                            {inq.company}
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium">
                            {inq.contactPerson} ({inq.phone})
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span className="font-bold text-slate-800 dark:text-slate-200 block">
                            {inq.quantitySummary}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {inq.category}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-700 dark:text-slate-300">
                          {inq.location}
                        </td>
                        <td className="p-3.5 font-mono text-center text-slate-600 dark:text-slate-400">
                          {inq.startDate}
                        </td>
                        <td className="p-3.5 font-mono font-black text-right text-slate-900 dark:text-white">
                          {formatPrice(inq.estimatedValueEur)}
                        </td>
                        <td
                          className="p-3.5 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="relative inline-flex items-center">
                            <select
                              value={inq.status}
                              onChange={(e) => {
                                const newSt = e.target.value as RentalStatus;
                                onStatusChange(inq.id, newSt);
                                showToast(
                                  "Status Predmeta Ažuriran",
                                  `Predmet ${inq.id} (${inq.company}) je prebačen u fazu: ${newSt}.`,
                                  "info"
                                );
                              }}
                              className={`inline-flex items-center gap-1.5 pl-3 pr-7 py-1.5 rounded-full text-[11px] font-black border cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500/40 appearance-none transition-all shadow-sm ${statusStyles}`}
                              title="Brza promena faze predmeta"
                            >
                              <option value="U obradi" className="bg-slate-900 text-white font-bold">U obradi</option>
                              <option value="Poslata Ponuda" className="bg-slate-900 text-white font-bold">Poslata Ponuda</option>
                              <option value="Ugovor Potpisan" className="bg-slate-900 text-white font-bold">Ugovor Potpisan</option>
                              <option value="Izdato na Plac" className="bg-slate-900 text-white font-bold">Izdato na Plac</option>
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 pointer-events-none opacity-70" />
                          </div>
                        </td>
                        <td
                          className="p-3.5 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Quick Next-Stage Advancement Button */}
                            {inq.status === "U obradi" && (
                              <button
                                type="button"
                                onClick={() => {
                                  onStatusChange(inq.id, "Poslata Ponuda");
                                  showToast("Status: Poslata Ponuda", `Predmet ${inq.id} označen kao ponuđen klijentu.`, "info");
                                }}
                                title="Brzo unapredi u: Poslata Ponuda"
                                className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500 hover:text-slate-950 text-amber-500 border border-amber-500/20 transition-all"
                              >
                                <Send className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {inq.status === "Poslata Ponuda" && (
                              <button
                                type="button"
                                onClick={() => {
                                  onStatusChange(inq.id, "Ugovor Potpisan");
                                  showToast("Status: Ugovor Potpisan", `Predmet ${inq.id} označen kao ugovoren.`, "info");
                                }}
                                title="Brzo unapredi u: Ugovor Potpisan"
                                className="p-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500 hover:text-slate-950 text-cyan-400 border border-cyan-500/20 transition-all"
                              >
                                <FileCheck2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {inq.status === "Ugovor Potpisan" && (
                              <button
                                type="button"
                                onClick={() => {
                                  onStatusChange(inq.id, "Izdato na Plac");
                                  showToast("Status: Izdato na Plac", `Oprema za ${inq.id} izdata na gradilište.`, "success");
                                }}
                                title="Brzo unapredi u: Izdato na Plac"
                                className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 border border-emerald-500/20 transition-all"
                              >
                                <Truck className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {inq.status === "Izdato na Plac" && (
                              <div
                                title="Kompletirano na placu"
                                className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </div>
                            )}

                            {/* Open Spec Sheet Drawer / PDF Print */}
                            <button
                              type="button"
                              onClick={() => onSelectInquiry(inq)}
                              title="Otvori Zvanični Predmer & Specifikaciju"
                              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-600 dark:text-slate-300 transition-colors"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Digital Damage Protocols Ledger Feed */}
      <div className="glass-panel p-6 sm:p-7 rounded-3xl space-y-4 border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
            <h4 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
              Nedavni Zapisnici o Povratu & Obračunatim Štetama
            </h4>
          </div>
          <button
            onClick={onOpenDamageProtocolModal}
            className="text-xs text-amber-500 hover:text-amber-400 font-bold"
          >
            + Novi prijem na placu
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {damageReports.map((dam) => (
            <div
              key={dam.id}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2 text-xs"
            >
              <div className="flex justify-between items-start">
                <span className="font-mono font-bold text-amber-500">{dam.id}</span>
                <span className="text-[11px] text-slate-500">{dam.returnDate}</span>
              </div>
              <div className="font-black text-slate-900 dark:text-white">
                {dam.contractorName}
              </div>
              <div className="text-slate-600 dark:text-slate-300 font-medium line-clamp-1">
                {dam.condition}
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-2 italic">
                "{dam.notes}"
              </p>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-baseline font-mono">
                <span className="text-slate-500">Penal / Šteta:</span>
                <span className="font-black text-sm text-rose-500">
                  {dam.totalPenaltyEur > 0 ? formatPrice(dam.totalPenaltyEur) : "€0 (Čisto)"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
