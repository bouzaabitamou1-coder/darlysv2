import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Instagram, Facebook } from "lucide-react";

const Footer = () => (
  <footer className="bg-charcoal text-cream/80">
    <div className="container-luxury section-padding">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
        <div>
          <h3 className="text-2xl font-display font-bold text-cream mb-4">Dar Lys</h3>
          <p className="text-sm leading-relaxed opacity-70 mb-6">
            A luxury riad nestled in the heart of the ancient medina of Fès, offering an authentic Moroccan experience with modern comfort.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-cream/50 hover:text-gold transition-colors" aria-label="Instagram">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="text-cream/50 hover:text-gold transition-colors" aria-label="Facebook">
              <Facebook className="w-5 h-5" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-sm tracking-[0.2em] uppercase font-body text-gold mb-6">Explore</h4>
          <div className="space-y-3">
            {[
              { label: "Rooms & Suites", path: "/rooms" },
              { label: "Restaurant", path: "/restaurant" },
              { label: "Spa & Wellness", path: "/spa" },
              { label: "Gallery", path: "/gallery" },
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
              { label: "About Us", path: "/about" },
              { label: "Contact", path: "/contact" },
              { label: "FAQ", path: "/faq" },
              { label: "Privacy Policy", path: "/privacy" },
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
              <p className="text-sm opacity-70">13 Derb Bennis, Douh, Fès Medina, Morocco</p>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-gold shrink-0" />
              <a href="tel:+212535555555" className="text-sm opacity-70 hover:opacity-100 transition-opacity">+212 5 35 55 55 55</a>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-gold shrink-0" />
              <a href="mailto:contact@darlys.com" className="text-sm opacity-70 hover:opacity-100 transition-opacity">contact@darlys.com</a>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16 pt-8 border-t border-cream/10 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-xs opacity-50">© {new Date().getFullYear()} Dar Lys. All rights reserved.</p>
        <p className="text-xs opacity-50">Crafted with passion in the heart of Fès</p>
      </div>
    </div>
  </footer>
);

export default Footer;
