"use client";

import React from "react";
import { Printer, X, Download, ShieldCheck, CheckCircle } from "lucide-react";
import { ComponentItem } from "@/types";

interface PrintableSpecModalProps {
  isOpen: boolean;
  onClose: () => void;
  specData: {
    title: string;
    type: string;
    surfaceAreaM2: number;
    durationDays: number;
    components: ComponentItem[];
    pricing: any;
    createdAt: string;
    dealId?: string;
    clientName?: string;
    location?: string;
  } | null;
}

export function PrintableSpecModal({
  isOpen,
  onClose,
  specData,
}: PrintableSpecModalProps) {
  if (!isOpen || !specData) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white">
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden print:shadow-none print:w-full print:max-w-none print:rounded-none">
        {/* Top Action Bar (Hidden in Print) */}
        <div className="no-print bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-bold text-xs uppercase">
              PDF Pregled
            </span>
            <span className="font-semibold text-sm">
              SFS Tehnička Specifikacija & Inženjerski Predmer
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold text-xs transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Štampaj / Snimi u PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 sm:p-12 space-y-8 bg-white print:p-6" id="printable-area">
          {/* Official Letterhead */}
          <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-amber-500 pb-6 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-slate-900">
                  SFS <span className="text-amber-500">OPLATE</span>
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-100 font-bold text-slate-700">
                  STANDARD FORMWORK SYSTEMS
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Inženjering, distribucija i iznajmljivanje industrijskih oplatnih sistema i fasadnih skela
              </p>
              <div className="text-[11px] text-slate-600 font-mono mt-2 space-y-0.5">
                <div>Centralni lager: Dobanovci, Privredna zona E-70</div>
                <div>Telefon: +381 11 844 3322 | Email: office@sfs-oplate.com</div>
                <div>Web: www.sfs-oplate.com | PIB: 108842199 | MB: 20984511</div>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <div className="inline-block px-3 py-1 bg-slate-100 rounded text-xs font-mono font-bold text-slate-800">
                Dokument br: {specData.dealId || `SFS-SPEC-${Date.now().toString().slice(-6)}`}
              </div>
              <div className="text-xs text-slate-500 mt-2">
                Datum izrade: <strong className="text-slate-800">{specData.createdAt}</strong>
              </div>
              <div className="text-xs text-slate-500">
                Važnost predmera: <strong className="text-slate-800">15 dana</strong>
              </div>
            </div>
          </div>

          {/* Client & Project Info */}
          <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Kupac / Izvođač radova:
              </span>
              <div className="font-bold text-sm text-slate-900">
                {specData.clientName || "Zvanični upit sa kalkulatora"}
              </div>
              <div className="text-slate-600 mt-0.5">
                Lokacija gradilišta: {specData.location || "Centralna Srbija / Beograd"}
              </div>
            </div>
            <div>
              <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Predmet najma & Tip:
              </span>
              <div className="font-bold text-slate-900">{specData.title}</div>
              <div className="text-slate-600 mt-0.5">
                Kalkulisana površina: <strong>{specData.surfaceAreaM2} m²</strong> | Period: <strong>{specData.durationDays} dana</strong>
              </div>
            </div>
          </div>

          {/* Component Spec Table */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span>Specifikacija Elemenata Konstrukcije (Predmer & Predračun)</span>
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                    <th className="p-2.5 border-r border-slate-300 w-12 text-center">R.br.</th>
                    <th className="p-2.5 border-r border-slate-300 w-28">Šifra artikla</th>
                    <th className="p-2.5 border-r border-slate-300">Naziv elementa / Tehnički opis</th>
                    <th className="p-2.5 border-r border-slate-300 w-20 text-center">Količina</th>
                    <th className="p-2.5 border-r border-slate-300 w-14 text-center">Jed.</th>
                    <th className="p-2.5 border-r border-slate-300 w-24 text-right">Dnevno/jed.</th>
                    <th className="p-2.5 w-24 text-right">Ukupno EUR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {specData.components.map((c, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-2 border-r border-slate-200 text-center font-mono">{i + 1}</td>
                      <td className="p-2 border-r border-slate-200 font-mono text-[11px] font-semibold text-slate-600">
                        {c.specCode || `SFS-${100 + i}`}
                      </td>
                      <td className="p-2 border-r border-slate-200 font-medium text-slate-900">
                        {c.name}
                      </td>
                      <td className="p-2 border-r border-slate-200 text-center font-mono font-bold">
                        {c.quantity}
                      </td>
                      <td className="p-2 border-r border-slate-200 text-center text-slate-600">
                        {c.unit}
                      </td>
                      <td className="p-2 border-r border-slate-200 text-right font-mono text-slate-600">
                        €{(c.unitPriceEur || 0.15).toFixed(2)}
                      </td>
                      <td className="p-2 text-right font-mono font-bold text-slate-900">
                        €{((c.totalEur || (c.quantity * (c.unitPriceEur || 0.15) * specData.durationDays))).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Recapitulation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-300">
            <div className="text-[11px] text-slate-600 space-y-1.5">
              <div className="font-bold text-slate-800 uppercase tracking-wider text-xs mb-1">
                Napomene i uslovi najma SFS:
              </div>
              <ul className="list-disc pl-4 space-y-1">
                <li>Sva oplata i skele se izdaju prečišćeni, podmazani i sa atestima o nosivosti (EN 1065 / EN 12810).</li>
                <li>Transport obuhvata utovar u Dobanovcima. Istovar na gradilištu obezbeđuje izvođač (kran/viljuškar).</li>
                <li>Obavezno polaganje menice i overene menične izjave pre preuzimanja prve ture opreme.</li>
                <li>Elementi se vraćaju očišćeni od betona u originalnim transportnim paletama.</li>
              </ul>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-300 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Osnovni najam ({specData.durationDays} dana):</span>
                <span className="font-mono font-bold">€{(specData.pricing?.rentalNetEur || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Transport & Logistika (Dobanovci):</span>
                <span className="font-mono font-bold">€{(specData.pricing?.transportEur || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Manipulacija i servis oplate (8%):</span>
                <span className="font-mono font-bold">€{(specData.pricing?.cleaningHandlingEur || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Potrošni materijal (Oplatol, distanceri):</span>
                <span className="font-mono font-bold">€{(specData.pricing?.consumablesEur || 0).toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-slate-300 flex justify-between font-bold text-slate-900">
                <span>Ukupno bez PDV:</span>
                <span className="font-mono">€{(specData.pricing?.subtotalEur || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>PDV (20%):</span>
                <span className="font-mono">€{(specData.pricing?.vatEur || 0).toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t-2 border-slate-900 flex justify-between items-baseline font-black text-sm text-slate-900">
                <span>UKUPNO ZA PLAĆANJE:</span>
                <span className="font-mono text-lg text-amber-600">
                  €{(specData.pricing?.totalEur || 0).toLocaleString()}
                </span>
              </div>
              <div className="text-right text-[11px] font-mono text-slate-500">
                (≈ {(specData.pricing?.totalRsd || 0).toLocaleString()} RSD)
              </div>
            </div>
          </div>

          {/* Signatures & Seal Box */}
          <div className="pt-8 border-t border-slate-300 grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <div className="h-14 border-b border-dashed border-slate-400"></div>
              <div className="mt-2 font-bold text-slate-800">Za Izvođača radova (Prihvata ponudu)</div>
              <div className="text-[10px] text-slate-500">Ime, prezime i M.P.</div>
            </div>
            <div>
              <div className="h-14 border-b border-dashed border-slate-400 flex items-center justify-center">
                <span className="text-[11px] text-amber-600 font-mono font-bold tracking-widest border border-amber-500/50 px-2 py-0.5 rounded">
                  SFS DISPEČERSKI PEČAT
                </span>
              </div>
              <div className="mt-2 font-bold text-slate-800">Za SFS Oplate d.o.o. (Dispečerski centar)</div>
              <div className="text-[10px] text-slate-500">Ovlašćeno lice Dobanovci</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
