"use client";

import React, { useState } from "react";
import { FormworkType } from "@/types";
import { Eye, Layers, Compass, ZoomIn } from "lucide-react";

interface CadBlueprintVisualizerProps {
  type: FormworkType;
  wallParams: { height: number; length: number; corners: number; thickness: number };
  slabParams: { area: number; slabThickness: number; ceilingHeight: number };
  scaffoldParams: { width: number; height: number; platformLevels: number };
  surfaceAreaM2: number;
}

export function CadBlueprintVisualizer({
  type,
  wallParams,
  slabParams,
  scaffoldParams,
  surfaceAreaM2,
}: CadBlueprintVisualizerProps) {
  const [viewMode, setViewMode] = useState<"elevation" | "section">("elevation");

  return (
    <div className="glass-panel p-5 rounded-3xl space-y-3 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
              CAD Inženjerski Crtež & Statička Šema
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              DIN 18218 / EN 1065 • Standard SFS Oplate
            </span>
          </div>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-0.5 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] font-bold">
          <button
            onClick={() => setViewMode("elevation")}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              viewMode === "elevation"
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Izgled (Front)
          </button>
          <button
            onClick={() => setViewMode("section")}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              viewMode === "section"
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Presek & Detalj
          </button>
        </div>
      </div>

      {/* SVG Canvas Container with Blueprint Grid */}
      <div className="relative w-full h-56 sm:h-64 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center">
        {/* Subtle engineering blueprint grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d40d_1px,transparent_1px),linear-gradient(to_bottom,#06b6d40d_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none"></div>

        {/* --- 1. WALL BLUEPRINT SVG --- */}
        {type === "wall" && (
          <svg className="w-full h-full p-4" viewBox="0 0 600 240" fill="none">
            {viewMode === "elevation" ? (
              <g>
                {/* Baseline ground */}
                <line x1="40" y1="190" x2="560" y2="190" stroke="#475569" strokeWidth="2" strokeDasharray="6 3" />
                <text x="50" y="206" fill="#64748b" fontSize="10" fontFamily="monospace">±0.00 KOTA TEMELJA</text>

                {/* Wall Formwork Panels Array */}
                {Array.from({ length: 7 }).map((_, idx) => {
                  const x = 70 + idx * 65;
                  const isPrimary = idx % 3 !== 2;
                  return (
                    <g key={idx}>
                      {/* Outer Steel Frame */}
                      <rect
                        x={x}
                        y="50"
                        width="60"
                        height="140"
                        stroke="#f59e0b"
                        strokeWidth="1.8"
                        fill="#f59e0b"
                        fillOpacity={isPrimary ? "0.15" : "0.08"}
                        rx="2"
                      />
                      {/* Internal ribbing */}
                      <line x1={x} y1="95" x2={x + 60} y2="95" stroke="#f59e0b" strokeWidth="0.8" strokeOpacity="0.6" />
                      <line x1={x} y1="145" x2={x + 60} y2="145" stroke="#f59e0b" strokeWidth="0.8" strokeOpacity="0.6" />

                      {/* Tie rod holes (DW15) */}
                      <circle cx={x + 15} cy="80" r="3" fill="#06b6d4" />
                      <circle cx={x + 45} cy="80" r="3" fill="#06b6d4" />
                      <circle cx={x + 15} cy="160" r="3" fill="#06b6d4" />
                      <circle cx={x + 45} cy="160" r="3" fill="#06b6d4" />

                      {/* Fastening Clamp marker between panels */}
                      {idx < 6 && (
                        <rect x={x + 57} y="110" width="6" height="20" fill="#38bdf8" rx="1" />
                      )}

                      {/* Panel dimension label */}
                      <text x={x + 12} y="125" fill="#f59e0b" fontSize="9" fontFamily="monospace" fontWeight="bold">
                        {isPrimary ? "0.90m" : "0.60m"}
                      </text>
                    </g>
                  );
                })}

                {/* Vertical Dimension Line (Height) */}
                <line x1="535" y1="50" x2="535" y2="190" stroke="#06b6d4" strokeWidth="1.5" />
                <line x1="530" y1="50" x2="540" y2="50" stroke="#06b6d4" strokeWidth="1.5" />
                <line x1="530" y1="190" x2="540" y2="190" stroke="#06b6d4" strokeWidth="1.5" />
                <text x="544" y="125" fill="#06b6d4" fontSize="11" fontFamily="monospace" fontWeight="bold">
                  h={wallParams.height.toFixed(2)}m
                </text>

                {/* Horizontal Dimension Line (Length) */}
                <line x1="70" y1="35" x2="525" y2="35" stroke="#f59e0b" strokeWidth="1.5" />
                <line x1="70" y1="30" x2="70" y2="40" stroke="#f59e0b" strokeWidth="1.5" />
                <line x1="525" y1="30" x2="525" y2="40" stroke="#f59e0b" strokeWidth="1.5" />
                <text x="240" y="27" fill="#f59e0b" fontSize="11" fontFamily="monospace" fontWeight="bold">
                  L = {wallParams.length} m' (Ukupno sa {wallParams.corners} uglova)
                </text>

                {/* Legend at bottom right */}
                <g transform="translate(360, 215)">
                  <circle cx="0" cy="0" r="3" fill="#06b6d4" />
                  <text x="8" y="3" fill="#94a3b8" fontSize="9" fontFamily="monospace">Anker šipke DW15</text>
                  <rect x="110" y="-4" width="6" height="8" fill="#38bdf8" />
                  <text x="122" y="3" fill="#94a3b8" fontSize="9" fontFamily="monospace">Spojne kandže</text>
                </g>
              </g>
            ) : (
              /* Cross-section view */
              <g>
                <text x="40" y="25" fill="#f59e0b" fontSize="11" fontFamily="monospace" fontWeight="bold">
                  VERTIKALNI POPREČNI PRESEK KROZ ZID (d = {wallParams.thickness} cm)
                </text>

                {/* Left Panel Face */}
                <rect x="180" y="45" width="16" height="150" fill="#f59e0b" fillOpacity="0.25" stroke="#f59e0b" strokeWidth="2" />
                <text x="130" y="120" fill="#f59e0b" fontSize="9" fontFamily="monospace">Framax 2.7m</text>

                {/* Fresh Concrete Wall Core */}
                <rect x="196" y="45" width="70" height="150" fill="#64748b" fillOpacity="0.3" stroke="#94a3b8" strokeDasharray="3 3" />
                <text x="206" y="115" fill="#cbd5e1" fontSize="10" fontFamily="monospace" fontWeight="bold">
                  AB BETON
                </text>
                <text x="210" y="130" fill="#94a3b8" fontSize="9" fontFamily="monospace">
                  d={wallParams.thickness}cm
                </text>

                {/* Right Panel Face */}
                <rect x="266" y="45" width="16" height="150" fill="#f59e0b" fillOpacity="0.25" stroke="#f59e0b" strokeWidth="2" />

                {/* Tie Rod through wall */}
                <line x1="160" y1="100" x2="300" y2="100" stroke="#06b6d4" strokeWidth="3" />
                <rect x="165" y="90" width="8" height="20" fill="#06b6d4" rx="2" />
                <rect x="290" y="90" width="8" height="20" fill="#06b6d4" rx="2" />
                <text x="315" y="104" fill="#06b6d4" fontSize="10" fontFamily="monospace" fontWeight="bold">
                  DW15 šipka + matice
                </text>

                {/* Diagonal Alignment Strut */}
                <line x1="180" y1="150" x2="100" y2="195" stroke="#eab308" strokeWidth="3" />
                <circle cx="180" cy="150" r="3" fill="#eab308" />
                <circle cx="100" cy="195" r="4" fill="#eab308" />
                <text x="65" y="175" fill="#eab308" fontSize="9" fontFamily="monospace">Kosnik 3.4m</text>

                {/* Concrete Pressure Diagram Curve */}
                <path d="M 400 45 L 400 195 L 460 195 Z" fill="#ef4444" fillOpacity="0.15" stroke="#ef4444" strokeWidth="1.5" />
                <text x="410" y="180" fill="#f87171" fontSize="9" fontFamily="monospace">
                  Pritisak betona: 60-80 kN/m²
                </text>
                <text x="405" y="65" fill="#94a3b8" fontSize="9" fontFamily="monospace">
                  DIN 18218 hidrostatički dijagram
                </text>
              </g>
            )}
          </svg>
        )}

        {/* --- 2. SLAB BLUEPRINT SVG --- */}
        {type === "slab" && (
          <svg className="w-full h-full p-4" viewBox="0 0 600 240" fill="none">
            {viewMode === "elevation" ? (
              <g>
                <text x="30" y="24" fill="#f59e0b" fontSize="11" fontFamily="monospace" fontWeight="bold">
                  DOKAFLEX MREŽA: PRIMARNI & SEKUNDARNI H20 NOSAČI SA PODUPIRAČIMA
                </text>

                {/* Yellow Shuttering Boards Top Layer */}
                <rect x="60" y="45" width="480" height="12" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
                <text x="230" y="40" fill="#fbbf24" fontSize="10" fontFamily="monospace" fontWeight="bold">
                  Žuta troslojna ploča 21mm (Površina {slabParams.area} m²)
                </text>

                {/* Secondary H20 Beams (spaced 0.5m) */}
                {Array.from({ length: 9 }).map((_, i) => (
                  <rect
                    key={i}
                    x={75 + i * 52}
                    y="57"
                    width="14"
                    height="18"
                    fill="#f59e0b"
                    fillOpacity="0.8"
                    stroke="#b45309"
                    strokeWidth="1"
                    rx="1"
                  />
                ))}

                {/* Primary Main H20 Beams (running perpendicular) */}
                <rect x="60" y="75" width="480" height="14" fill="#0284c7" stroke="#0369a1" strokeWidth="1.5" rx="1" />
                <text x="450" y="70" fill="#38bdf8" fontSize="9" fontFamily="monospace">
                  Primarni H20 nosači
                </text>

                {/* Heavy Duty Props (Podupirači) */}
                {[100, 200, 300, 400, 500].map((propX, idx) => (
                  <g key={idx}>
                    {/* Fork head */}
                    <rect x={propX - 6} y="89" width="12" height="6" fill="#64748b" />
                    {/* Outer tube */}
                    <rect x={propX - 3} y="95" width="6" height="50" fill="#94a3b8" />
                    {/* Inner telescopic tube */}
                    <rect x={propX - 2} y="145" width="4" height="40" fill="#cbd5e1" />
                    {/* Base plate */}
                    <rect x={propX - 10} y="185" width="20" height="5" fill="#475569" rx="1" />
                    {/* Tripod support */}
                    <line x1={propX} y1="140" x2={propX - 20} y2="185" stroke="#f59e0b" strokeWidth="1.5" />
                    <line x1={propX} y1="140" x2={propX + 20} y2="185" stroke="#f59e0b" strokeWidth="1.5" />
                  </g>
                ))}

                {/* Height Dimension line */}
                <line x1="555" y1="45" x2="555" y2="190" stroke="#06b6d4" strokeWidth="1.5" />
                <line x1="550" y1="45" x2="560" y2="45" stroke="#06b6d4" strokeWidth="1.5" />
                <line x1="550" y1="190" x2="560" y2="190" stroke="#06b6d4" strokeWidth="1.5" />
                <text x="530" y="206" fill="#06b6d4" fontSize="10" fontFamily="monospace" fontWeight="bold">
                  H={slabParams.ceilingHeight.toFixed(2)}m
                </text>

                {/* Ground */}
                <line x1="40" y1="190" x2="570" y2="190" stroke="#475569" strokeWidth="2" strokeDasharray="6 3" />
              </g>
            ) : (
              /* Slab Detail Section */
              <g>
                <text x="30" y="25" fill="#f59e0b" fontSize="11" fontFamily="monospace" fontWeight="bold">
                  DETALJ OSLANJANJA PLOČE d = {slabParams.slabThickness} cm (EN 1065 KLASA {slabParams.ceilingHeight > 3.2 ? "E-45" : "D-30"})
                </text>

                {/* Concrete Slab Body */}
                <rect x="80" y="45" width="440" height="35" fill="#64748b" fillOpacity="0.4" stroke="#94a3b8" />
                <text x="210" y="67" fill="#f8fafc" fontSize="11" fontFamily="monospace" fontWeight="bold">
                  BETONSKA PLOČA d={slabParams.slabThickness}cm (Težina ≈ {(slabParams.slabThickness * 0.25).toFixed(2)} kN/m²)
                </text>

                {/* Shuttering Board */}
                <rect x="80" y="80" width="440" height="8" fill="#fbbf24" stroke="#d97706" />

                {/* H20 Cross details */}
                <g transform="translate(180, 88)">
                  <rect x="0" y="0" width="20" height="25" fill="#f59e0b" stroke="#b45309" rx="2" />
                  <text x="26" y="16" fill="#f59e0b" fontSize="9" fontFamily="monospace">Poprečni H20 @ 50cm</text>
                </g>

                <g transform="translate(340, 88)">
                  <rect x="0" y="0" width="20" height="25" fill="#f59e0b" stroke="#b45309" rx="2" />
                  <text x="26" y="16" fill="#f59e0b" fontSize="9" fontFamily="monospace">Poprečni H20 @ 50cm</text>
                </g>

                {/* Main Beam */}
                <rect x="80" y="113" width="440" height="15" fill="#0284c7" stroke="#0369a1" />

                {/* Prop head */}
                <rect x="290" y="128" width="20" height="10" fill="#64748b" rx="2" />
                <line x1="300" y1="138" x2="300" y2="195" stroke="#94a3b8" strokeWidth="8" />
                <text x="315" y="170" fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="bold">
                  Podupirač nosivosti do 30kN
                </text>
              </g>
            )}
          </svg>
        )}

        {/* --- 3. SCAFFOLD BLUEPRINT SVG --- */}
        {type === "scaffold" && (
          <svg className="w-full h-full p-4" viewBox="0 0 600 240" fill="none">
            <g>
              <text x="30" y="24" fill="#06b6d4" fontSize="11" fontFamily="monospace" fontWeight="bold">
                RAMOVSKA FASADNA SKELA Š=0.73m • POLJA L=2.50m (Površina {surfaceAreaM2} m²)
              </text>

              {/* Scaffolding Frame Bays */}
              {Array.from({ length: 6 }).map((_, col) => {
                const x = 70 + col * 75;
                return (
                  <g key={col}>
                    {/* Vertical tube */}
                    <line x1={x} y1="40" x2={x} y2="190" stroke="#06b6d4" strokeWidth="2.5" />
                    {/* Base jack */}
                    <rect x={x - 8} y="188" width="16" height="4" fill="#64748b" />
                    <line x1={x} y1="182" x2={x} y2="190" stroke="#f59e0b" strokeWidth="4" />

                    {/* Horizontal platform levels */}
                    {col < 5 && (
                      <>
                        <line x1={x} y1="80" x2={x + 75} y2="80" stroke="#06b6d4" strokeWidth="1.8" />
                        <rect x={x} y="77" width="75" height="5" fill="#0284c7" fillOpacity="0.5" />

                        <line x1={x} y1="130" x2={x + 75} y2="130" stroke="#06b6d4" strokeWidth="1.8" />
                        <rect x={x} y="127" width="75" height="5" fill="#0284c7" fillOpacity="0.5" />

                        <line x1={x} y1="180" x2={x + 75} y2="180" stroke="#06b6d4" strokeWidth="1.8" />
                        <rect x={x} y="177" width="75" height="5" fill="#0284c7" fillOpacity="0.5" />

                        {/* Diagonal Wind Braces */}
                        {col % 2 === 0 && (
                          <line x1={x} y1="180" x2={x + 75} y2="130" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 2" />
                        )}
                        {col % 2 === 1 && (
                          <line x1={x} y1="130" x2={x + 75} y2="80" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 2" />
                        )}

                        {/* Wall Anchor tie icon */}
                        <circle cx={x + 37} cy="105" r="4" fill="#ef4444" />
                      </>
                    )}
                  </g>
                );
              })}

              {/* Dimensions */}
              <text x="210" y="210" fill="#f59e0b" fontSize="10" fontFamily="monospace">
                ← Širina fronta = {scaffoldParams.width}m →
              </text>
              <text x="460" y="115" fill="#06b6d4" fontSize="10" fontFamily="monospace">
                ↕ Visina = {scaffoldParams.height}m
              </text>
            </g>
          </svg>
        )}
      </div>

      <div className="flex justify-between items-center text-[11px] font-mono text-slate-500 pt-1">
        <span>Statički koeficijent sigurnosti: γ = 1.50</span>
        <span className="text-amber-500 font-bold">Autentične komponente SFS</span>
      </div>
    </div>
  );
}
