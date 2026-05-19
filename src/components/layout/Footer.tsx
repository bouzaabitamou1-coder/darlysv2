import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Instagram, Facebook } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();
  return (
  <footer className="bg-charcoal text-cream/80 relative">
    <div className="absolute inset-0 opacity-5 zellige-pattern" />
    <div className="container-luxury section-padding relative z-10">
      {/* Moroccan ornamental header */}
      <div className="text-center mb-16">
        <p className="text-gold/70 text-xs tracking-[0.35em] uppercase font-body mb-2">Riad — Médina de Fès</p>
        <h3 className="text-3xl font-display font-bold text-cream">Dar Lys</h3>
        <div className="star-separator mt-4">
          <span className="text-gold text-sm">✦</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
        <div>
          <p className="text-sm leading-relaxed opacity-70 mb-6">
            {t("footer.tagline")}
          </p>
          <div className="flex gap-4">
            <a href="https://www.instagram.com/dar_lys_fes/" target="_blank" rel="noopener noreferrer" className="text-cream/50 hover:text-gold transition-colors" aria-label="Instagram">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="https://www.facebook.com/profile.php?id=61588096623552" target="_blank" rel="noopener noreferrer" className="text-cream/50 hover:text-gold transition-colors" aria-label="Facebook">
              <Facebook className="w-5 h-5" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-sm tracking-[0.2em] uppercase font-body text-gold mb-6">{t("footer.explore")}</h4>
          <div className="space-y-3">
            {[
              { label: t("nav.rooms"), path: "/rooms" },
              { label: t("nav.restaurant"), path: "/restaurant" },
              { label: t("nav.spa"), path: "/spa" },
              { label: t("nav.offers"), path: "/offers" },
              { label: t("nav.events"), path: "/events" },
              { label: t("nav.gallery"), path: "/gallery" },
            ].map((link) => (
              <Link key={link.path} to={link.path} className="block text-sm opacity-70 hover:opacity-100 hover:text-gold transition-all">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm tracking-[0.2em] uppercase font-body text-gold mb-6">{t("footer.info")}</h4>
          <div className="space-y-3">
            {[
              { label: t("nav.about"), path: "/about" },
              { label: t("nav.access"), path: "/access" },
              { label: t("nav.contact"), path: "/contact" },
              { label: "FAQ", path: "/faq" },
              { label: "Leave feedback", path: "/feedback" },
            ].map((link) => (
              <Link key={link.path} to={link.path} className="block text-sm opacity-70 hover:opacity-100 hover:text-gold transition-all">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm tracking-[0.2em] uppercase font-body text-gold mb-6">{t("footer.contact")}</h4>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 mt-1 text-gold shrink-0" />
              <p className="text-sm opacity-70">13 Derb Bennis, Douh, Fès Medina, Maroc</p>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-gold shrink-0" />
              <a href="tel:+212535366423" className="text-sm opacity-70 hover:opacity-100 transition-opacity">+212 5 35 36 64 23</a>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-gold shrink-0" />
              <a href="mailto:contact@darlys.ma" className="text-sm opacity-70 hover:opacity-100 transition-opacity">contact@darlys.ma</a>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16 pt-8 arabesque-border flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-xs opacity-50">© {new Date().getFullYear()} Dar Lys. {t("footer.rights")}</p>
        <p className="text-xs opacity-50">{t("footer.madeBy")}</p>
      </div>
    </div>
  </footer>
  );
};

export default Footer;
