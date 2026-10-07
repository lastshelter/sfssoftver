"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Currency = "EUR" | "RSD";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  toggleCurrency: () => void;
  formatPrice: (eurAmount: number) => string;
  eurToRsdRate: number;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: "EUR",
  setCurrency: () => {},
  toggleCurrency: () => {},
  formatPrice: (eur) => `€${eur.toLocaleString()}`,
  eurToRsdRate: 117.2,
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("EUR");
  const eurToRsdRate = 117.2; // Srednji kurs NBS za građevinske ugovore

  useEffect(() => {
    const saved = localStorage.getItem("sfs-currency") as Currency | null;
    if (saved === "EUR" || saved === "RSD") {
      setCurrencyState(saved);
    }
  }, []);

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem("sfs-currency", c);
  };

  const toggleCurrency = () => {
    const next = currency === "EUR" ? "RSD" : "EUR";
    setCurrency(next);
  };

  const formatPrice = (eurAmount: number) => {
    if (currency === "RSD") {
      const rsd = Math.round(eurAmount * eurToRsdRate);
      return `${rsd.toLocaleString("sr-Latn-RS")} RSD`;
    }
    return `€${Math.round(eurAmount).toLocaleString("sr-Latn-RS")}`;
  };

  return (
    <CurrencyContext.Provider
      value={{ currency, setCurrency, toggleCurrency, formatPrice, eurToRsdRate }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
