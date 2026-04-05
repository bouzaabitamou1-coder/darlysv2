import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Instagram, Facebook } from "lucide-react";

const Footer = () => (
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
            Riad de charme en plein cœur de la médina de Fès, offrant un séjour authentique dans la capitale spirituelle du Maroc.
          </p>
          <div className="flex gap-4">
            <a href="https://www.instagram.com/dar_lys_fes/" target="_blank" rel="noopener noreferrer" className="text-cream/50 hover:text-gold transition-colors" aria-label="Instagram">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="text-cream/50 hover:text-gold transition-colors" aria-label="Facebook">
              <Facebook className="w-5 h-5" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-sm tracking-[0.2em] uppercase font-body text-gold mb-6">Explorer</h4>
          <div className="space-y-3">
            {[
              { label: "Chambres", path: "/rooms" },
              { label: "Restaurant & Bar", path: "/restaurant" },
              { label: "Lotus Spa", path: "/spa" },
              { label: "Offres", path: "/offers" },
              { label: "Événements", path: "/events" },
              { label: "Galerie", path: "/gallery" },
            ].map((link) => (
              <Link key={link.path} to={link.path} className="block text-sm opacity-70 hover:opacity-100 hover:text-gold transition-all">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm tracking-[0.2em] uppercase font-body text-gold mb-6">Information</h4>
          <div className="space-y-3">
            {[
              { label: "À Propos", path: "/about" },
              { label: "Accès", path: "/access" },
              { label: "Contact", path: "/contact" },
              { label: "FAQ", path: "/faq" },
            ].map((link) => (
              <Link key={link.path} to={link.path} className="block text-sm opacity-70 hover:opacity-100 hover:text-gold transition-all">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm tracking-[0.2em] uppercase font-body text-gold mb-6">Contact</h4>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 mt-1 text-gold shrink-0" />
              <p className="text-sm opacity-70">13 Derb Bennis, Douh, Fès Medina, Maroc</p>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-gold shrink-0" />
              <a href="tel:+212535555555" className="text-sm opacity-70 hover:opacity-100 transition-opacity">+212 5 35 55 55 55</a>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-gold shrink-0" />
              <a href="mailto:contact@darlys.ma" className="text-sm opacity-70 hover:opacity-100 transition-opacity">contact@darlys.ma</a>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16 pt-8 arabesque-border flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-xs opacity-50">© {new Date().getFullYear()} Dar Lys. Tous droits réservés.</p>
        <p className="text-xs opacity-50">Créé avec passion au cœur de Fès</p>
      </div>
    </div>
  </footer>
);

export default Footer;
