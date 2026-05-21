import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Currency = "EUR" | "USD" | "MAD" | "GBP";

// Approximate static conversion rates from EUR base. Update as needed.
const RATES: Record<Currency, number> = {
  EUR: 1,
  USD: 1.08,
  GBP: 0.85,
  MAD: 10.9,
};

const SYMBOLS: Record<Currency, string> = {
  EUR: "€",
  USD: "$",
  GBP: "£",
  MAD: "DH",
};

type Ctx = {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  format: (eurAmount: number) => string;
  symbol: string;
};

const CurrencyContext = createContext<Ctx | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    if (typeof window === "undefined") return "EUR";
    const stored = localStorage.getItem("currency") as Currency | null;
    return stored && stored in RATES ? stored : "EUR";
  });

  useEffect(() => {
    try {
      localStorage.setItem("currency", currency);
    } catch {}
  }, [currency]);

  const setCurrency = (c: Currency) => setCurrencyState(c);

  const format = (eurAmount: number) => {
    const converted = eurAmount * RATES[currency];
    const rounded = currency === "MAD" ? Math.round(converted) : Math.round(converted * 100) / 100;
    const formatted = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: currency === "MAD" ? 0 : 0,
      maximumFractionDigits: currency === "MAD" ? 0 : 0,
    }).format(rounded);
    return currency === "MAD" ? `${formatted} ${SYMBOLS[currency]}` : `${SYMBOLS[currency]}${formatted}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, format, symbol: SYMBOLS[currency] }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
};