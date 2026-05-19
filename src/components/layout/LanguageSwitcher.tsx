import { Globe, Check } from "lucide-react";
import { useLanguage, type Lang } from "@/i18n/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const options: { code: Lang; label: string; native: string }[] = [
  { code: "en", label: "English", native: "EN" },
  { code: "fr", label: "Français", native: "FR" },
  { code: "ar", label: "العربية", native: "ع" },
];

const LanguageSwitcher = ({ textColor = "text-cream" }: { textColor?: string }) => {
  const { lang, setLang } = useLanguage();
  const current = options.find((o) => o.code === lang) ?? options[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={`flex items-center gap-1.5 text-xs tracking-[0.15em] uppercase font-body opacity-70 hover:opacity-100 transition-opacity ${textColor}`}
        aria-label="Change language"
      >
        <Globe className="w-4 h-4" />
        <span>{current.native}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-cream border-border min-w-[140px]">
        {options.map((o) => (
          <DropdownMenuItem
            key={o.code}
            onClick={() => setLang(o.code)}
            className="flex items-center justify-between gap-3 cursor-pointer font-body text-charcoal hover:text-gold focus:text-gold"
          >
            <span className={o.code === "ar" ? "font-arabic text-base" : ""}>{o.label}</span>
            {lang === o.code && <Check className="w-3.5 h-3.5 text-gold" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;