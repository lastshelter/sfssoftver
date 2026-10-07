"use client";

import React from "react";
import { useTheme } from "./ThemeContext";
import { useCurrency } from "./CurrencyContext";
import {
  Sun,
  Moon,
  HardHat,
  Truck,
  PhoneCall,
  Activity,
  Layers,
  ShieldCheck,
  Building2,
  Coins,
} from "lucide-react";

export type ViewMode = "contractor" | "supplier";

interface NavbarProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  inquiryCount: number;
  onOpenDamageProtocol?: () => void;
}

export function Navbar({
  currentView,
  onViewChange,
  inquiryCount,
  onOpenDamageProtocol,
}: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { currency, toggleCurrency } = useCurrency();

  return (
    <header className="sticky top-4 z-50 w-full max-w-7xl mx-auto px-3 sm:px-6 transition-all duration-300">
      <div className="glass-dock px-3 sm:px-6 py-2.5 sm:py-3 rounded-2xl flex items-center justify-between gap-2 sm:gap-4 border shadow-xl">
        {/* Brand Logo & Telemetry */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 font-black shadow-lg shadow-amber-500/25">
            <span className="text-xl sm:text-2xl font-black tracking-tighter">SFS</span>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-slate-900"></span>
            </span>
          </div>

          <div className="hidden md:flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-base sm:text-lg text-slate-900 dark:text-white">
                SFS <span className="text-amber-500">OPLATE</span>
              </span>
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                Tier-1 Fleet
              </span>
            </div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 tracking-wide flex items-center gap-1.5">
              <span>Dobanovci Hub</span>
              <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[10px]">
                Lager Operativan
              </span>
            </span>
          </div>
        </div>

        {/* Center: Dual View Switcher */}
        <div className="flex items-center bg-slate-200/70 dark:bg-slate-900/90 p-1 rounded-xl border border-slate-300/60 dark:border-slate-800 shadow-inner">
          <button
            type="button"
            onClick={() => onViewChange("contractor")}
            className={`relative flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200 ${
              currentView === "contractor"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-[1.02]"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <HardHat className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">Izvođač Radova</span>
          </button>

          <button
            type="button"
            onClick={() => onViewChange("supplier")}
            className={`relative flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200 ${
              currentView === "supplier"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-[1.02]"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Truck className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">SFS Dispečerski Centar</span>
            {inquiryCount > 0 && (
              <span
                className={`ml-0.5 inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-black rounded-full transition-colors ${
                  currentView === "supplier"
                    ? "bg-slate-950 text-amber-400"
                    : "bg-amber-500 text-slate-950"
                }`}
              >
                {inquiryCount}
              </span>
            )}
          </button>
        </div>

        {/* Right Tools: Currency Toggle, Dispatch Phone & Theme Switcher */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Currency Toggle (EUR / RSD) */}
          <button
            onClick={toggleCurrency}
            title="Promeni valutu (EUR / RSD)"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-xs font-mono font-black text-slate-800 dark:text-slate-200 hover:border-amber-500 shadow-sm"
          >
            <Coins className="w-3.5 h-3.5 text-amber-500" />
            <span>{currency}</span>
          </button>

          <a
            href="tel:+381118443322"
            className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-amber-500/50 hover:bg-amber-500/5 transition-colors"
            title="SFS Dispečerska Linija Dobanovci"
          >
            <PhoneCall className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-mono">+381 11 844 3322</span>
          </a>

          {/* Theme Switcher Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Promeni temu (Svetla / Tamna)"
            className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-amber-400 hover:scale-105 active:scale-95 transition-all shadow-sm"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 animate-pulse-subtle" />
            ) : (
              <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
