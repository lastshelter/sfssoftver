"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Printer,
  Send,
  Building2,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Download,
  AlertCircle,
  FileCheck,
} from "lucide-react";
import { Inquiry, RentalStatus } from "@/types";
import { useCurrency } from "./CurrencyContext";
import { useToast } from "./ToastContext";

interface SpecSheetPreviewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  inquiry: Inquiry | null;
  onStatusChange: (id: string, newStatus: RentalStatus) => void;
  onGenerateFormalOffer?: (inquiry: Inquiry) => void;
}

export function SpecSheetPreviewDrawer({
  isOpen,
  onClose,
  inquiry,
  onStatusChange,
  onGenerateFormalOffer,
}: SpecSheetPreviewDrawerProps) {
  const { formatPrice, currency } = useCurrency();
  const { showToast } = useToast();
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Close on Escape key
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

  if (!isOpen || !inquiry) return null;

  const statuses: RentalStatus[] = [
    "U obradi",
    "Poslata Ponuda",
    "Ugovor Potpisan",
    "Izdato na Plac",
  ];

  // Action: Print / PDF
  const handlePrint = () => {
    window.print();
  };

  // Action: Send Offer to Client (Email Simulation)
  const handleSendEmail = () => {
    setIsSendingEmail(true);
    setTimeout(() => {
      setIsSendingEmail(false);
      onStatusChange(inquiry.id, "Poslata Ponuda");
      showToast(
        "Ponuda Poslata Klijentu",
        `Zvanični predmer i ponuda za firmu "${inquiry.company}" uspešno prosleđeni na e-mail: ${inquiry.email}.`,
        "success"
      );
    }, 600);
  };

  // Pricing calculations
  const rentalNetEur = Math.round(inquiry.estimatedValueEur * 0.72);
  const transportEur = 320;
  const engineeringFeeEur = 200;
  const cleaningHandlingEur = Math.round(inquiry.estimatedValueEur * 0.08);
  const consumablesEur = Math.round(inquiry.estimatedValueEur * 0.05);
  const depositEur = Math.round(inquiry.estimatedValueEur * 0.35);
  const subtotalNetEur = rentalNetEur + transportEur + engineeringFeeEur + cleaningHandlingEur + consumablesEur;
  const vatEur = Math.round(subtotalNetEur * 0.20);
  const totalGrossEur = subtotalNetEur + vatEur;
  const totalGrossRsd = Math.round(totalGrossEur * 117.2);

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm flex justify-end print:bg-white print:p-0 print:overflow-visible print:relative print:z-auto print:block"
      role="dialog"
      aria-modal="true"
    >
      {/* Slide-over Container */}
      <div className="w-full max-w-4xl bg-white dark:bg-[#0B111E] text-slate-900 dark:text-slate-100 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col transform transition-transform duration-300 ease-out animate-in slide-in-from-right print:w-full print:max-w-none print:h-auto print:border-none print:shadow-none print:bg-white print:text-black">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="no-print p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-100/90 dark:bg-[#0F172A] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs sm:text-sm font-black px-3 py-1 rounded-xl bg-amber-500 text-slate-950 shadow-sm">
              {inquiry.id}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white">
                  {inquiry.company}
                </h3>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {inquiry.category}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                PIB: {inquiry.pib} • Gradilište: {inquiry.location}
              </span>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs transition-colors shadow-sm"
              title="Štampaj ili sačuvaj u PDF formatu"
            >
              <Printer className="w-4 h-4 text-amber-500" />
              <span>Štampaj / Preuzmi PDF</span>
            </button>

            <button
              type="button"
              onClick={handleSendEmail}
              disabled={isSendingEmail}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-md shadow-amber-500/20 active:scale-95 disabled:opacity-75"
              title="Prosledi ponudu klijentu na email"
            >
              <Send className={`w-4 h-4 ${isSendingEmail ? "animate-spin" : ""}`} />
              <span>{isSendingEmail ? "Slanje..." : "Prosledi Ponudu Klijentu (Email)"}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Pipeline Chips (Hidden when printing) */}
        <div className="no-print px-5 py-3 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#0D1527] flex items-center justify-between gap-3 text-xs shrink-0">
          <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-500" /> Faza Predmeta:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {statuses.map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => {
                  onStatusChange(inquiry.id, st);
                  showToast("Faza Ažurirana", `Predmet prebačen u fazu: ${st}`, "info");
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  inquiry.status === st
                    ? "bg-amber-500 text-slate-950 shadow-sm"
                    : "bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Letterhead & Document Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 bg-white dark:bg-[#0B111E] print:p-0 print:overflow-visible print:bg-white print:text-black">
          {/* Printable Letterhead Header */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-sm print:shadow-none print:border-b-2 print:border-amber-500 print:rounded-none print:p-0 print:border-t-0 print:border-l-0 print:border-r-0 print:bg-white print:text-black">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-200 dark:border-slate-800 print:border-slate-300 pb-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white print:text-black">
                    SFS <span className="text-amber-500">OPLATE</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 print:border-slate-400 print:text-black">
                    STANDARD FORMWORK SYSTEMS
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 print:text-slate-600 mt-1 max-w-md">
                  Inženjering, distribucija i iznajmljivanje industrijskih oplatnih sistema, podupirača i modularnih fasadnih skela
                </p>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 print:text-black font-mono mt-3 space-y-0.5">
                  <div>Centralni lager: Dobanovci, Privredna zona E-70, Beograd</div>
                  <div>Telefon: +381 11 844 3322 • Email: dispecer@sfs-oplate.com</div>
                  <div>PIB: 108842199 • MB: 20984511 • Žiro-račun: 160-542199-34</div>
                </div>
              </div>

              <div className="text-left sm:text-right font-mono">
                <div className="inline-block px-3 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold print:border-slate-300 print:text-black">
                  PREDMER & PONUDA: SFS-PON-{inquiry.id}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 print:text-black mt-2">
                  Datum izrade: <strong className="text-slate-900 dark:text-white print:text-black">{inquiry.createdAt}</strong>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 print:text-black">
                  Važnost ponude: <strong className="text-slate-900 dark:text-white print:text-black">15 kalendarskih dana</strong>
                </div>
              </div>
            </div>

            {/* Client & Project Details Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 print:bg-slate-100 print:border-slate-300 space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-500 block">
                  Naručilac / Izvođač Radova:
                </span>
                <div className="font-black text-sm text-slate-900 dark:text-white print:text-black">
                  {inquiry.company}
                </div>
                <div className="text-slate-600 dark:text-slate-400 print:text-black">
                  PIB: <strong>{inquiry.pib}</strong>
                </div>
                <div className="text-slate-600 dark:text-slate-400 print:text-black">
                  Kontakt: {inquiry.contactPerson} ({inquiry.phone})
                </div>
                <div className="text-slate-600 dark:text-slate-400 print:text-black">
                  Email: {inquiry.email}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 print:bg-slate-100 print:border-slate-300 space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-cyan-500 block">
                  Gradilište & Predmet Najma:
                </span>
                <div className="font-black text-sm text-slate-900 dark:text-white print:text-black">
                  {inquiry.location}
                </div>
                <div className="text-slate-600 dark:text-slate-400 print:text-black">
                  Kategorija opreme: <strong>{inquiry.category}</strong>
                </div>
                <div className="text-slate-600 dark:text-slate-400 print:text-black">
                  Obim oplate: <strong>{inquiry.quantitySummary}</strong>
                </div>
                <div className="text-slate-600 dark:text-slate-400 print:text-black">
                  Period najma: <strong>{inquiry.startDate} ({inquiry.durationDays} dana)</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Itemized Bill of Quantities (Specifikacija Elemenata) */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-black text-sm sm:text-base text-slate-900 dark:text-white print:text-black uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-500" />
                Specifikacija Elemenata Oplatnog Sistema (Predmer Opreme)
              </h4>
              <span className="text-xs font-mono font-bold text-slate-500 print:text-black">
                {inquiry.components.length} stavki u kompletu
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-xs print:border-slate-300">
              <table className="w-full text-left">
                <thead className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 print:bg-slate-200 print:text-black font-bold border-b border-slate-200 dark:border-slate-800 print:border-slate-300">
                  <tr>
                    <th className="p-3 w-10 text-center">#</th>
                    <th className="p-3 w-28">Šifra</th>
                    <th className="p-3">Naziv Elementa & Tehnički Opis</th>
                    <th className="p-3 w-24 text-center">Količina</th>
                    <th className="p-3 w-16 text-center">Jed.</th>
                    <th className="p-3 w-24 text-right">Dnevno/jed.</th>
                    <th className="p-3 w-28 text-right">Ukupno EUR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 print:divide-slate-300">
                  {inquiry.components.map((comp, idx) => {
                    const lineTotalEur = comp.totalEur || Math.round(comp.quantity * 2.5);
                    return (
                      <tr
                        key={idx}
                        className="hover:bg-slate-50 dark:hover:bg-slate-900/40 print:hover:bg-transparent"
                      >
                        <td className="p-3 text-center font-mono text-slate-400 print:text-black">
                          {idx + 1}
                        </td>
                        <td className="p-3 font-mono font-bold text-amber-600 dark:text-amber-400 print:text-black text-[11px]">
                          {comp.specCode || `SFS-${100 + idx}`}
                        </td>
                        <td className="p-3 font-medium text-slate-900 dark:text-slate-100 print:text-black">
                          {comp.name}
                        </td>
                        <td className="p-3 text-center font-mono font-black text-slate-900 dark:text-white print:text-black">
                          {comp.quantity}
                        </td>
                        <td className="p-3 text-center text-slate-500 print:text-black">
                          {comp.unit}
                        </td>
                        <td className="p-3 text-right font-mono text-slate-600 dark:text-slate-400 print:text-black">
                          €{(comp.unitPriceEur || (lineTotalEur / (comp.quantity * inquiry.durationDays))).toFixed(2)}
                        </td>
                        <td className="p-3 text-right font-mono font-black text-amber-600 dark:text-amber-400 print:text-black">
                          €{lineTotalEur.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Commercial & Financial Breakdown */}
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4 print:bg-slate-50 print:border-slate-300">
            <h4 className="font-black text-xs sm:text-sm text-slate-900 dark:text-white print:text-black uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Komercijalni Uslovi & Rekapitulacija Ponude
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2 border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-800 pb-3 sm:pb-0 sm:pr-4">
                <div className="flex justify-between text-slate-600 dark:text-slate-400 print:text-black">
                  <span>Osnovni najam elemenata ({inquiry.durationDays} dana):</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white print:text-black">
                    €{rentalNetEur.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400 print:text-black">
                  <span>Doprema i mobilizacija sa lagera Dobanovci:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white print:text-black">
                    €{transportEur}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400 print:text-black">
                  <span>Izrada plana oplate i inženjerski proračun:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white print:text-black">
                    €{engineeringFeeEur}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400 print:text-black">
                  <span>Pranje, pregled i paletiranje opreme (8%):</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white print:text-black">
                    €{cleaningHandlingEur}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400 print:text-black">
                  <span>Potrošni materijal (ulje oplatol, PVC čepovi):</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white print:text-black">
                    €{consumablesEur}
                  </span>
                </div>
              </div>

              <div className="space-y-2 font-mono">
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 print:text-black">
                  <span>Neto osnovica:</span>
                  <span className="font-bold text-slate-900 dark:text-white print:text-black">
                    €{subtotalNetEur.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 print:text-black">
                  <span>PDV (20%):</span>
                  <span className="font-bold text-slate-900 dark:text-white print:text-black">
                    €{vatEur.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 print:text-black">
                  <span>Povratna kaucija (35% - depozit):</span>
                  <span className="font-bold text-slate-500">
                    €{depositEur.toLocaleString()}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-baseline">
                  <span className="text-sm font-sans font-black text-slate-900 dark:text-white print:text-black">
                    UKUPNO SA PDV-om:
                  </span>
                  <div className="text-right">
                    <div className="text-xl sm:text-2xl font-black text-amber-500 print:text-black">
                      €{totalGrossEur.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 print:text-black font-sans">
                      = {totalGrossRsd.toLocaleString()} RSD
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Standards & Terms Note */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1.5 print:border-slate-300 print:text-black">
            <div className="font-bold text-slate-700 dark:text-slate-300 print:text-black flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Sertifikacija & Tehnički Uslovi Preuzimanja:
            </div>
            <p>
              1. Sva oprema odgovara standardima <strong>EN 1065</strong> (podupirači Klase D i E), <strong>EN 12810</strong> (skele) i <strong>DIN 18218</strong> (dozvoljeni pritisak svežeg betona do 80 kN/m²).
            </p>
            <p>
              2. Preuzimanje i povrat opreme vrše se uz potpisivanje zvaničnog primopredajnog zapisnika na placu SFS Dobanovci.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
