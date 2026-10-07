"use client";

import React, { useState } from "react";
import {
  Building2,
  Calendar,
  Truck,
  RotateCcw,
  CheckCircle2,
  Clock,
  Layers,
  MapPin,
  Phone,
  Upload,
  AlertTriangle,
  ArrowRight,
  Package,
} from "lucide-react";
import { Jobsite, DeployedEquipment } from "@/types";

interface ContractorFleetTrackerProps {
  jobsites: Jobsite[];
  onScheduleReturn: (siteId: string, returnData: any) => void;
}

export function ContractorFleetTracker({
  jobsites,
  onScheduleReturn,
}: ContractorFleetTrackerProps) {
  const [selectedSiteId, setSelectedSiteId] = useState<string>(jobsites[0]?.id || "");
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [activeSiteForReturn, setActiveSiteForReturn] = useState<Jobsite | null>(null);

  // Return Form State
  const [returnDate, setReturnDate] = useState<string>("");
  const [transportType, setTransportType] = useState<"sfs" | "self">("sfs");
  const [notes, setNotes] = useState<string>("");
  const [palletPhotoAttached, setPalletPhotoAttached] = useState<boolean>(false);
  const [returnSuccess, setReturnSuccess] = useState<boolean>(false);

  const selectedSite = jobsites.find((s) => s.id === selectedSiteId) || jobsites[0];

  const handleOpenReturnModal = (site: Jobsite) => {
    setActiveSiteForReturn(site);
    setReturnDate(new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0]);
    setPalletPhotoAttached(false);
    setReturnSuccess(false);
    setReturnModalOpen(true);
  };

  const handleSubmitReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSiteForReturn) return;

    onScheduleReturn(activeSiteForReturn.id, {
      returnDate,
      transportType,
      notes,
      palletPhotoAttached,
    });

    setReturnSuccess(true);
    setTimeout(() => {
      setReturnModalOpen(false);
      setReturnSuccess(false);
    }, 2000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 mb-2">
            <Package className="w-3.5 h-3.5" />
            Evidencija Iznajmljene Opreme
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Aktivna Flota & <span className="text-amber-500">Gradilišta u Radu</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Pratite zaduženu oplatu, podupirače i skele po lokacijama. Zakažite delimični ili
            potpuni povrat (demobilizaciju) jednim klikom.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-mono text-xs">
            <span className="font-bold text-sm block">3 Gradilišta</span>
            Ukupno angažovano
          </div>
          <div className="px-4 py-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 font-mono text-xs">
            <span className="font-bold text-sm block">€790.50</span>
            Dnevni trošak najma
          </div>
        </div>
      </div>

      {/* Jobsites Tabs / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {jobsites.map((site) => {
          const isSelected = site.id === selectedSiteId;
          return (
            <div
              key={site.id}
              onClick={() => setSelectedSiteId(site.id)}
              className={`p-5 rounded-3xl border cursor-pointer transition-all ${
                isSelected
                  ? "bg-white dark:bg-slate-900 border-amber-500 shadow-xl ring-2 ring-amber-500/20"
                  : "glass-panel hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-0.5"
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <span
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                    site.status === "Aktivno"
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                      : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full inline-block bg-current mr-1.5 animate-pulse"></span>
                  {site.status}
                </span>

                <span className="font-mono text-xs font-bold text-slate-500">
                  {site.id}
                </span>
              </div>

              <h3 className="font-black text-base text-slate-900 dark:text-white line-clamp-1">
                {site.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {site.contractor}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="truncate">{site.address}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>Dnevni najam:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    €{site.dailyRateEur.toFixed(2)}/dan
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenReturnModal(site);
                  }}
                  className="w-full py-2 px-3 rounded-xl border border-amber-500/50 bg-amber-500/10 hover:bg-amber-500 text-amber-700 dark:text-amber-300 hover:text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Najavi Povrat Opreme
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Jobsite Ledger & Breakdown */}
      {selectedSite && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl border border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {selectedSite.name}
                </h3>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {selectedSite.address}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-2">
                <span>
                  Izvođač: <strong>{selectedSite.contractor}</strong> (PIB: {selectedSite.pib})
                </span>
                <span>•</span>
                <span>
                  Odgovorni inženjer: <strong>{selectedSite.contactSupervisor}</strong> ({selectedSite.phone})
                </span>
                <span>•</span>
                <span>
                  Datum mobilizacije: <strong>{selectedSite.activeSince}</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleOpenReturnModal(selectedSite)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Zahtev za Demobilizaciju & Preuzimanje
              </button>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-500" />
              Trenutno Zadužena Oprema na Gradilištu
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {selectedSite.equipment.map((eq, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 space-y-2"
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {eq.category}
                  </span>
                  <div className="font-bold text-sm text-slate-900 dark:text-white">
                    {eq.name}
                  </div>
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-baseline font-mono">
                    <span className="text-xs text-slate-500">Količina:</span>
                    <span className="text-lg font-black text-amber-500">
                      {eq.quantity} {eq.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dispatch Timeline Notes */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <strong>Uputstvo za razduživanje i povrat na plac Dobanovci:</strong> Opremu je potrebno očistiti od naslaga betona pre predaje. Elementi moraju biti složeni u transportne korpe/palete radi bezbednog utovara autodizalicom.
            </div>
          </div>
        </div>
      )}

      {/* Return & Demobilization Modal */}
      {returnModalOpen && activeSiteForReturn && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-extrabold flex items-center gap-2">
                  <RotateCcw className="w-5 h-5 text-amber-500" />
                  Zahtev za Demobilizaciju & Povrat Opreme
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {activeSiteForReturn.name} ({activeSiteForReturn.contractor})
                </p>
              </div>
              <button
                onClick={() => setReturnModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {returnSuccess ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="font-extrabold text-base text-emerald-600 dark:text-emerald-400">
                  Zahtev za povrat uspešno evidentiran!
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  SFS Dispečer će kontaktirati šefa gradilišta radi usklađivanja termina dolaska
                  kamiona sa kranom.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReturn} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Željeni datum preuzimanja / razduženja
                  </label>
                  <input
                    type="date"
                    required
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Način transporta do Dobanovaca
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setTransportType("sfs")}
                      className={`p-3 rounded-xl border text-left text-xs font-bold transition-all ${
                        transportType === "sfs"
                          ? "bg-amber-500/15 border-amber-500 text-amber-600 dark:text-amber-400"
                          : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <Truck className="w-4 h-4 mb-1" />
                      SFS Kamion sa Dizalicom
                      <span className="block text-[10px] font-normal opacity-75">SFS obezbeđuje prevoz</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTransportType("self")}
                      className={`p-3 rounded-xl border text-left text-xs font-bold transition-all ${
                        transportType === "self"
                          ? "bg-amber-500/15 border-amber-500 text-amber-600 dark:text-amber-400"
                          : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <Building2 className="w-4 h-4 mb-1" />
                      Sopstveni Kamion Izvođača
                      <span className="block text-[10px] font-normal opacity-75">Dopremate na naš plac</span>
                    </button>
                  </div>
                </div>

                {/* Photo Upload Simulation */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Fotografija složene opreme i paleta (Placeholder)
                  </label>
                  <div
                    onClick={() => setPalletPhotoAttached(!palletPhotoAttached)}
                    className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                      palletPhotoAttached
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "border-slate-300 dark:border-slate-700 hover:border-amber-500 text-slate-500"
                    }`}
                  >
                    <Upload className="w-6 h-6 mx-auto mb-1 opacity-70" />
                    <span className="text-xs font-bold block">
                      {palletPhotoAttached
                        ? "✓ 2 fotografije složenih paleta priložene"
                        : "Kliknite da priložite fotografiju složenih elemenata"}
                    </span>
                    <span className="text-[10px] opacity-75">
                      Pomaže magacioneru da unapred pripremi viljuškar i prostor na placu
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Napomena za dispečera (radno vreme gradilišta, prolaz)
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Npr. Utovar moguć samo od 07 do 14h zbog saobraćajne zone..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                  ></textarea>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setReturnModalOpen(false)}
                    className="flex-1 py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Odustani
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20"
                  >
                    Prosledi Nalog Dispečeru
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
