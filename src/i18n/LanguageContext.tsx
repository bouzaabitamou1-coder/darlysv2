import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Lang = "en" | "fr" | "ar";

type Dict = Record<string, string>;

const translations: Record<Lang, Dict> = {
  en: {
    "nav.home": "Home",
    "nav.about": "About",
    "nav.rooms": "Rooms",
    "nav.restaurant": "Restaurant",
    "nav.spa": "Spa",
    "nav.offers": "Offers",
    "nav.events": "Events",
    "nav.gallery": "Gallery",
    "nav.access": "Access",
    "nav.transport": "Transport",
    "nav.contact": "Contact",
    "cta.bookNow": "Book Now",
    "hero.eyebrow": "Exceptional Riad — Fès",
    "hero.tagline": "A charming riad in the heart of the millennial medina of Fès",
    "hero.discover": "Discover Rooms",
    "hero.story": "Our Story",
    "footer.tagline": "Charming riad in the heart of the Fès medina, offering an authentic stay in the spiritual capital of Morocco.",
    "footer.explore": "Explore",
    "footer.info": "Information",
    "footer.contact": "Contact",
    "footer.rights": "All rights reserved.",
    "footer.madeBy": "Crafted with passion in the heart of Fès — Made by Bouzaabita Mohammed",
    "lang.label": "Language",
  },
  fr: {
    "nav.home": "Accueil",
    "nav.about": "À Propos",
    "nav.rooms": "Chambres",
    "nav.restaurant": "Restaurant",
    "nav.spa": "Spa",
    "nav.offers": "Offres",
    "nav.events": "Événements",
    "nav.gallery": "Galerie",
    "nav.access": "Accès",
    "nav.transport": "Transport",
    "nav.contact": "Contact",
    "cta.bookNow": "Réserver",
    "hero.eyebrow": "Riad d'exception — Fès",
    "hero.tagline": "Riad de charme au cœur de la médina millénaire de Fès",
    "hero.discover": "Découvrir les Chambres",
    "hero.story": "Notre Histoire",
    "footer.tagline": "Riad de charme en plein cœur de la médina de Fès, offrant un séjour authentique dans la capitale spirituelle du Maroc.",
    "footer.explore": "Explorer",
    "footer.info": "Information",
    "footer.contact": "Contact",
    "footer.rights": "Tous droits réservés.",
    "footer.madeBy": "Créé avec passion au cœur de Fès — Made by Bouzaabita Mohammed",
    "lang.label": "Langue",
  },
  ar: {
    "nav.home": "الرئيسية",
    "nav.about": "من نحن",
    "nav.rooms": "الغرف",
    "nav.restaurant": "المطعم",
    "nav.spa": "السبا",
    "nav.offers": "العروض",
    "nav.events": "الفعاليات",
    "nav.gallery": "المعرض",
    "nav.access": "الوصول",
    "nav.transport": "النقل",
    "nav.contact": "اتصل بنا",
    "cta.bookNow": "احجز الآن",
    "hero.eyebrow": "رياض استثنائي — فاس",
    "hero.tagline": "رياض ساحر في قلب المدينة العتيقة بفاس",
    "hero.discover": "اكتشف الغرف",
    "hero.story": "قصتنا",
    "footer.tagline": "رياض ساحر في قلب مدينة فاس العتيقة، يقدم إقامة أصيلة في العاصمة الروحية للمغرب.",
    "footer.explore": "استكشف",
    "footer.info": "معلومات",
    "footer.contact": "اتصل بنا",
    "footer.rights": "جميع الحقوق محفوظة.",
    "footer.madeBy": "صُنع بشغف في قلب فاس — من إعداد بوزعبيطة محمد",
    "lang.label": "اللغة",
  },
};

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
  dir: "ltr" | "rtl";
  locale: string;
  formatCurrency: (amount: number, currency?: string) => string;
  formatDate: (date: string | Date, opts?: Intl.DateTimeFormatOptions) => string;
  formatDateTime: (date: string | Date) => string;
};

const LanguageContext = createContext<Ctx | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return "en";
    const stored = localStorage.getItem("darlys-lang") as Lang | null;
    return stored ?? "en";
  });

  const dir: "ltr" | "rtl" = lang === "ar" ? "rtl" : "ltr";
  const locale = lang === "ar" ? "ar-MA" : lang === "fr" ? "fr-FR" : "en-GB";

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    document.documentElement.classList.toggle("lang-ar", lang === "ar");
  }, [lang, dir]);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("darlys-lang", l);
  };

  const t = (key: string) => translations[lang][key] ?? translations.en[key] ?? key;

  const formatCurrency = (amount: number, currency = "EUR") => {
    try {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      }).format(Number(amount) || 0);
    } catch {
      return `${amount} ${currency}`;
    }
  };

  const formatDate = (date: string | Date, opts?: Intl.DateTimeFormatOptions) => {
    try {
      const d = typeof date === "string" ? new Date(date) : date;
      return new Intl.DateTimeFormat(locale, opts ?? { year: "numeric", month: "short", day: "numeric" }).format(d);
    } catch {
      return String(date);
    }
  };

  const formatDateTime = (date: string | Date) =>
    formatDate(date, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, dir, locale, formatCurrency, formatDate, formatDateTime }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};