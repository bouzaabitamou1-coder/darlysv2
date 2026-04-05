import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Rooms", path: "/rooms" },
  { label: "Restaurant", path: "/restaurant" },
  { label: "Spa", path: "/spa" },
  { label: "Offers", path: "/offers" },
  { label: "Events", path: "/events" },
  { label: "Gallery", path: "/gallery" },
  { label: "Access", path: "/access" },
  { label: "Contact", path: "/contact" },
];

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const headerBg = isScrolled || !isHome
    ? "bg-cream/95 backdrop-blur-md shadow-sm"
    : "bg-transparent";

  const textColor = isScrolled || !isHome ? "text-charcoal" : "text-cream";
  const logoColor = isScrolled || !isHome ? "text-gold-gradient" : "text-cream";

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${headerBg}`}>
      <div className="container-luxury">
        <div className="flex items-center justify-between h-20 lg:h-24 px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <span className={`text-2xl lg:text-3xl font-display font-bold tracking-wide transition-colors duration-300 ${logoColor}`}>
              Dar Lys
            </span>
            <span className={`hidden sm:block text-xs tracking-[0.3em] uppercase font-body transition-colors duration-300 ${textColor} opacity-60`}>
              Fès
            </span>
          </Link>

          <nav className="hidden xl:flex items-center gap-5 flex-wrap justify-end max-w-3xl">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-[11px] tracking-[0.12em] uppercase font-body transition-all duration-300 hover:opacity-100 ${
                  location.pathname === link.path ? "opacity-100" : "opacity-70"
                } ${textColor}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden xl:flex items-center gap-4 shrink-0">
            <a href="tel:+212535555555" className={`flex items-center gap-2 text-sm ${textColor} opacity-70 hover:opacity-100 transition-opacity`}>
              <Phone className="w-4 h-4" />
            </a>
            <Link to="/rooms" className="btn-luxury text-xs py-2 px-6">
              Book Now
            </Link>
          </div>

          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className={`xl:hidden p-2 ${textColor}`}
            aria-label="Toggle menu"
          >
            {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="xl:hidden bg-cream/98 backdrop-blur-md border-t border-border max-h-[80vh] overflow-y-auto"
          >
            <div className="px-6 py-8 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block text-lg font-display tracking-wide transition-colors ${
                    location.pathname === link.path ? "text-gold" : "text-charcoal"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4">
                <Link to="/rooms" className="btn-luxury w-full text-center block">
                  Book Now
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
