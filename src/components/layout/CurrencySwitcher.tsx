import { Coins, Check } from "lucide-react";
import { useCurrency, type Currency } from "@/i18n/CurrencyContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const options: { code: Currency; label: string; short: string }[] = [
  { code: "EUR", label: "Euro (€)", short: "EUR" },
  { code: "USD", label: "US Dollar ($)", short: "USD" },
  { code: "GBP", label: "Pound (£)", short: "GBP" },
  { code: "MAD", label: "Dirham (DH)", short: "MAD" },
];

const CurrencySwitcher = ({ textColor = "text-cream" }: { textColor?: string }) => {
  const { currency, setCurrency } = useCurrency();
  const current = options.find((o) => o.code === currency) ?? options[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={`flex items-center gap-1.5 text-xs tracking-[0.15em] uppercase font-body opacity-70 hover:opacity-100 transition-opacity ${textColor}`}
        aria-label="Change currency"
      >
        <Coins className="w-4 h-4" />
        <span>{current.short}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-cream border-border min-w-[160px]">
        {options.map((o) => (
          <DropdownMenuItem
            key={o.code}
            onClick={() => setCurrency(o.code)}
            className="flex items-center justify-between gap-3 cursor-pointer font-body text-charcoal hover:text-gold focus:text-gold"
          >
            <span>{o.label}</span>
            {currency === o.code && <Check className="w-3.5 h-3.5 text-gold" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CurrencySwitcher;