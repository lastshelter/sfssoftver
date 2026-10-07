"use client";

import React, { useState } from "react";
import { Navbar, ViewMode } from "@/components/Navbar";
import { EstimatorWizard } from "@/components/EstimatorWizard";
import { FormworkCalculator } from "@/components/calculator/FormworkCalculator";
import { ContractorFleetTracker } from "@/components/ContractorFleetTracker";
import { TechnicalCatalog } from "@/components/TechnicalCatalog";
import { SupplierDesk } from "@/components/SupplierDesk";
import { SpecSheetPreviewDrawer } from "@/components/SpecSheetPreviewDrawer";
import { PrintableSpecModal } from "@/components/PrintableSpecModal";
import { DamageRecordModal } from "@/components/DamageRecordModal";
import { CurrencyProvider, useCurrency } from "@/components/CurrencyContext";
import { ToastProvider, useToast } from "@/components/ToastContext";
import {
  INITIAL_INQUIRIES,
  INITIAL_WAREHOUSE_STOCK,
  CONTRACTOR_JOBSITES,
  INITIAL_DAMAGE_REPORTS,
} from "@/data/mockData";
import {
  Inquiry,
  WarehouseItem,
  Jobsite,
  DamageReport,
  RentalStatus,
} from "@/types";
import {
  ShieldCheck,
  Award,
  Truck,
  PhoneCall,
  CheckCircle2,
  FileCheck2,
  Layers,
  ArrowRight,
  BookOpen,
} from "lucide-react";

function MainPlatformContent() {
  const [currentView, setCurrentView] = useState<ViewMode>("contractor");

  // Core synchronized application state
  const [inquiries, setInquiries] = useState<Inquiry[]>(INITIAL_INQUIRIES);
  const [warehouseStock, setWarehouseStock] = useState<WarehouseItem[]>(
    INITIAL_WAREHOUSE_STOCK
  );
  const [jobsites, setJobsites] = useState<Jobsite[]>(CONTRACTOR_JOBSITES);
  const [damageReports, setDamageReports] = useState<DamageReport[]>(
    INITIAL_DAMAGE_REPORTS
  );

  // Modal & Drawer states
  const [selectedInquiryForDrawer, setSelectedInquiryForDrawer] =
    useState<Inquiry | null>(null);
  const [isOfferDrawerOpen, setIsOfferDrawerOpen] = useState(false);

  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [specForPrint, setSpecForPrint] = useState<any>(null);

  const [damageModalOpen, setDamageModalOpen] = useState(false);

  // Client view sub-tab: "calculator" vs "fleet" vs "catalog"
  const [contractorTab, setContractorTab] = useState<"calculator" | "fleet" | "catalog">(
    "calculator"
  );

  const { showToast } = useToast();

  // Handlers for state updates with Inventory Lifecycle Machine
  const handleNewInquirySubmitted = (newInquiry: Inquiry) => {
    // Add to top of queue
    setInquiries((prev) => [newInquiry, ...prev]);

    // Reserve stock tentatively
    setWarehouseStock((prev) =>
      prev.map((item) => {
        if (item.category === newInquiry.category) {
          const newReserved = item.reservedUnits + 40;
          const newAvail = Math.max(0, item.availableUnits - 40);
          const newUtil = ((item.rentedUnits + newReserved) / item.totalUnits) * 100;
          return {
            ...item,
            reservedUnits: newReserved,
            availableUnits: newAvail,
            utilizationRate: Number(newUtil.toFixed(1)),
          };
        }
        return item;
      })
    );

    // Switch active view immediately to SFS Dispečerski Centar
    setCurrentView("supplier");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleStatusChange = (id: string, newStatus: RentalStatus) => {
    setInquiries((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );

    if (selectedInquiryForDrawer && selectedInquiryForDrawer.id === id) {
      setSelectedInquiryForDrawer({
        ...selectedInquiryForDrawer,
        status: newStatus,
      });
    }

    // Dynamic stock adjustment
    if (newStatus === "Izdato na Plac") {
      const targetInq = inquiries.find((i) => i.id === id);
      if (targetInq) {
        setWarehouseStock((prev) =>
          prev.map((item) => {
            if (item.category === targetInq.category) {
              const delta = 80;
              const newRented = item.rentedUnits + delta;
              const newAvail = Math.max(0, item.availableUnits - delta);
              const newUtil = (newRented / item.totalUnits) * 100;
              return {
                ...item,
                rentedUnits: newRented,
                availableUnits: newAvail,
                utilizationRate: Number(newUtil.toFixed(1)),
                status: newUtil > 88 ? "critical" : newUtil > 80 ? "warning" : "optimal",
              };
            }
            return item;
          })
        );
      }
    }
  };

  const handleScheduleReturn = (siteId: string, returnData: any) => {
    setJobsites((prev) =>
      prev.map((site) =>
        site.id === siteId ? { ...site, status: "Najavljen povrat" } : site
      )
    );
    showToast(
      "Demobilizacija Najavljena",
      `Zahtev za preuzimanje opreme sa lokacije ${siteId} uspešno zaveden.`,
      "info"
    );
  };

  const handleSaveDamageReport = (report: DamageReport) => {
    setDamageReports((prev) => [report, ...prev]);
  };

  const handleSelectInquiryFromSupplier = (inquiry: Inquiry) => {
    setSelectedInquiryForDrawer(inquiry);
    setIsOfferDrawerOpen(true);
  };

  const handleGenerateFormalOffer = (inquiry: Inquiry) => {
    setSpecForPrint({
      dealId: inquiry.id,
      title: `${inquiry.category} - ${inquiry.quantitySummary}`,
      type: inquiry.category,
      clientName: inquiry.company,
      location: inquiry.location,
      surfaceAreaM2: parseInt(inquiry.quantitySummary) || 350,
      durationDays: inquiry.durationDays,
      components: inquiry.components,
      pricing: {
        rentalNetEur: Math.round(inquiry.estimatedValueEur * 0.72),
        transportEur: 320,
        engineeringFeeEur: 200,
        cleaningHandlingEur: Math.round(inquiry.estimatedValueEur * 0.08),
        consumablesEur: Math.round(inquiry.estimatedValueEur * 0.05),
        depositEur: Math.round(inquiry.estimatedValueEur * 0.35),
        subtotalEur: Math.round(inquiry.estimatedValueEur / 1.2),
        vatEur: Math.round(inquiry.estimatedValueEur - inquiry.estimatedValueEur / 1.2),
        totalEur: inquiry.estimatedValueEur,
        totalRsd: Math.round(inquiry.estimatedValueEur * 117.2),
      },
      createdAt: inquiry.createdAt,
    });
    setPrintModalOpen(true);
  };

  return (
    <div className="relative min-h-screen pb-16 transition-colors duration-300">
      {/* Ambient background glow physics */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(245,158,11,0.14),rgba(6,182,212,0.08),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(245,158,11,0.18),rgba(6,182,212,0.12),rgba(0,0,0,0))]"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(245,158,11,0.06),transparent_70%)]"></div>
      </div>

      {/* Floating Glassmorphic Top Navigation Dock */}
      <Navbar
        currentView={currentView}
        onViewChange={(view) => {
          setCurrentView(view);
          if (typeof window !== "undefined") {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }}
        inquiryCount={inquiries.length}
        onOpenDamageProtocol={() => setDamageModalOpen(true)}
      />

      {/* Main Content View Switcher */}
      <main className="mt-4">
        {currentView === "contractor" ? (
          <div className="space-y-6">
            {/* Sub-Navigation for Contractor Portal: Kalkulator vs Flota vs Tehnički Katalog */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 dark:border-slate-800 pb-3 gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setContractorTab("calculator")}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                      contractorTab === "calculator"
                        ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    1. Inženjerski Kalkulator & Ponuda
                  </button>

                  <button
                    onClick={() => setContractorTab("fleet")}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                      contractorTab === "fleet"
                        ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    2. Moja Gradilišta & Razduživanje Flote
                  </button>

                  <button
                    onClick={() => setContractorTab("catalog")}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                      contractorTab === "catalog"
                        ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    3. Tehnički Katalog & Atesti
                  </button>
                </div>

                <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Lager Dobanovci 100% raspoloživ
                </div>
              </div>
            </div>

            {contractorTab === "calculator" ? (
              <FormworkCalculator
                onGenerateOffer={(result) => {
                  setSpecForPrint({
                    dealId: `SFS-SPEC-${Date.now().toString().slice(-6)}`,
                    title: result.systemTitle,
                    type: result.systemType === "wall" ? "Zidna oplata" : "Plafonska oplata",
                    clientName: "Zvanični upit sa Inženjerskog Kalkulatora",
                    location: "Centralna Srbija / Beograd",
                    surfaceAreaM2: result.metrics.totalContactAreaM2,
                    durationDays: 30,
                    components: result.lineItems.map((item) => ({
                      name: item.name,
                      quantity: item.quantity,
                      unit: item.unit,
                      unitPriceEur: item.unitPricePerDay,
                      totalEur: item.totalRentalPriceEur,
                      specCode: item.code,
                    })),
                    pricing: {
                      rentalNetEur: result.metrics.subtotalRentalEur,
                      transportEur: 320,
                      engineeringFeeEur: 200,
                      cleaningHandlingEur: Math.round(result.metrics.subtotalRentalEur * 0.08),
                      consumablesEur: Math.round(result.metrics.totalContactAreaM2 * 0.45),
                      depositEur: result.metrics.refundableDepositEur,
                      subtotalEur: result.metrics.subtotalRentalEur,
                      vatEur: Math.round(result.metrics.subtotalRentalEur * 0.20),
                      totalEur: Math.round(result.metrics.subtotalRentalEur * 1.20),
                      totalRsd: Math.round(result.metrics.subtotalRentalEur * 1.20 * 117.2),
                    },
                    createdAt: new Date().toLocaleDateString("sr-Latn-RS"),
                  });
                  setPrintModalOpen(true);
                }}
                onSubmitInquiry={handleNewInquirySubmitted}
              />
            ) : contractorTab === "fleet" ? (
              <ContractorFleetTracker
                jobsites={jobsites}
                onScheduleReturn={handleScheduleReturn}
              />
            ) : (
              <TechnicalCatalog />
            )}
          </div>
        ) : (
          <SupplierDesk
            inquiries={inquiries}
            warehouseStock={warehouseStock}
            damageReports={damageReports}
            onSelectInquiry={handleSelectInquiryFromSupplier}
            onStatusChange={handleStatusChange}
            onOpenDamageProtocolModal={() => setDamageModalOpen(true)}
            onGenerateFormalOffer={handleGenerateFormalOffer}
          />
        )}
      </main>

      {/* Slide-over Drawer for Inquiry Operations & Live Spec Sheet Preview */}
      <SpecSheetPreviewDrawer
        isOpen={isOfferDrawerOpen}
        onClose={() => setIsOfferDrawerOpen(false)}
        inquiry={selectedInquiryForDrawer}
        onStatusChange={handleStatusChange}
        onGenerateFormalOffer={handleGenerateFormalOffer}
      />

      {/* Printable Specification & Offer Sheet */}
      <PrintableSpecModal
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        specData={specForPrint}
      />

      {/* Damage & Return Intake Logger Modal */}
      <DamageRecordModal
        isOpen={damageModalOpen}
        onClose={() => setDamageModalOpen(false)}
        inquiries={inquiries}
        onSaveReport={handleSaveDamageReport}
      />

      {/* Footer Credentials */}
      <footer className="mt-16 border-t border-slate-200 dark:border-slate-800/80 pt-8 pb-12 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900 dark:text-white">
              SFS OPLATE d.o.o.
            </span>
            <span>•</span>
            <span>Standard Formwork Systems (sfs-oplate.com)</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>Centralni magacin: Dobanovci, Beograd</span>
            <span>•</span>
            <span>Tel: +381 11 844 3322</span>
            <span>•</span>
            <span className="text-emerald-500 font-bold">Standard EN 1065 / EN 12810</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <CurrencyProvider>
      <ToastProvider>
        <MainPlatformContent />
      </ToastProvider>
    </CurrencyProvider>
  );
}
