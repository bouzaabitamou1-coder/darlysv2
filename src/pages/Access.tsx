import { motion } from "framer-motion";
import { MapPin, Plane, Train, Car, Navigation, Crosshair, Loader2 } from "lucide-react";
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import SectionHeading from "@/components/ui/SectionHeading";
import { photo } from "@/data/siteMedia";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/i18n/LanguageContext";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.7 },
};

const landmarks = [
  { name: "Bab Boujloud", detail: "Porte emblématique — point de repère pour rejoindre la médina." },
  { name: "Zaouïa Moulay Idriss II", detail: "Cœur spirituel de Fès, à quelques minutes de marche des artères principales." },
  { name: "Médina classée UNESCO", detail: "Ruelles historiques, souks et médersas à portée du riad." },
];

const transport = [
  { icon: Plane, title: "Aéroport Fès–Saïss", text: "Environ 30–45 minutes en voiture selon le trafic. Transfert privé disponible sur demande." },
  { icon: Train, title: "Gare ONCF", text: "Connexions depuis Casablanca, Rabat, Tanger. Compléter en taxi vers la médina." },
  { icon: Car, title: "Parking", text: "La médina est piétonne ; stationnement en périphérie puis accès à pied ou en petite voiture avec votre accompagnateur." },
];

// Dar Lys (Fès Médina) approximate coordinates
const DAR_LYS_LAT = 34.0625;
const DAR_LYS_LNG = -4.9745;
const RATE_PER_KM = 10; // DH per km

const haversineKm = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
};

const DriverPickupCalculator = () => {
  const { locale } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ km: number; dh: number; label?: string } | null>(null);
  const [manual, setManual] = useState("");

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=12`,
      );
      const data = await res.json();
      return data?.display_name as string | undefined;
    } catch {
      return undefined;
    }
  };

  const useMyLocation = () => {
    setError(null);
    setResult(null);
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const km = haversineKm(latitude, longitude, DAR_LYS_LAT, DAR_LYS_LNG);
        const label = await reverseGeocode(latitude, longitude);
        setResult({ km, dh: km * RATE_PER_KM, label });
        setLoading(false);
      },
      (err) => {
        setError(err.message || "Unable to retrieve your location.");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const lookupAddress = async () => {
    if (!manual.trim()) return;
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(manual)}`,
      );
      const data = await res.json();
      if (!data?.length) {
        setError("Address not found. Try a more specific search.");
      } else {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        const km = haversineKm(lat, lng, DAR_LYS_LAT, DAR_LYS_LNG);
        setResult({ km, dh: km * RATE_PER_KM, label: data[0].display_name });
      }
    } catch {
      setError("Lookup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fmtKm = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
  const fmtDh = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });

  return (
    <div className="bg-cream border border-gold/30 p-6 sm:p-8 shadow-card">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
          <Car className="w-6 h-6 text-gold" />
        </div>
        <div>
          <h3 className="font-display text-xl text-charcoal font-semibold">Private driver pickup — instant estimate</h3>
          <p className="text-sm text-muted-foreground font-body mt-1">
            Share your location or enter an address. We calculate the distance to Dar Lys and apply a flat rate of{" "}
            <span className="text-gold font-semibold">{RATE_PER_KM} DH / km</span>.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <Button
          onClick={useMyLocation}
          disabled={loading}
          className="bg-gold hover:bg-gold-dark text-cream rounded-none px-6"
        >
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Crosshair className="w-4 h-4 mr-2" />}
          Use my location
        </Button>
        <div className="flex flex-1 gap-2">
          <Input
            placeholder="…or enter address / city (e.g. Fès airport)"
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && lookupAddress()}
            className="rounded-none border-border bg-cream"
          />
          <Button
            onClick={lookupAddress}
            disabled={loading || !manual.trim()}
            variant="outline"
            className="rounded-none border-gold text-gold hover:bg-gold hover:text-cream"
          >
            Estimate
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-destructive font-body mb-2">{error}</p>}

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 grid sm:grid-cols-3 gap-4 p-5 bg-charcoal text-cream"
        >
          <div>
            <p className="text-xs tracking-wider uppercase text-gold-light/70 font-body mb-1">Distance</p>
            <p className="text-2xl font-display font-semibold">{fmtKm.format(result.km)} km</p>
          </div>
          <div>
            <p className="text-xs tracking-wider uppercase text-gold-light/70 font-body mb-1">Pickup fee</p>
            <p className="text-2xl font-display font-semibold text-gold">{fmtDh.format(result.dh)} DH</p>
          </div>
          <div className="sm:col-span-1">
            <p className="text-xs tracking-wider uppercase text-gold-light/70 font-body mb-1">From</p>
            <p className="text-xs text-cream/80 font-body leading-relaxed line-clamp-3">
              {result.label ?? "Your location"}
            </p>
          </div>
          <p className="sm:col-span-3 text-[11px] text-cream/50 font-body">
            Estimate based on straight-line distance × {RATE_PER_KM} DH/km. Final fare may vary slightly depending on the route. To confirm a pickup, contact the riad.
          </p>
        </motion.div>
      )}
    </div>
  );
};

const Access = () => (
  <Layout>
    <section className="relative h-[40vh] min-h-[280px] flex items-center justify-center overflow-hidden">
      <img src={photo.exterior} alt="" className="absolute inset-0 w-full h-full object-cover" width={1024} height={1024} />
      <div className="overlay-warm" />
      <div className="relative z-10 text-center px-4">
        <p className="text-gold-light text-sm tracking-[0.4em] uppercase font-body mb-4">Localisation</p>
        <h1 className="text-4xl sm:text-5xl font-display font-bold text-cream">Accès & quartier</h1>
      </div>
    </section>

    <section className="section-padding bg-cream zellige-pattern">
      <div className="container-luxury">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <motion.div {...fadeUp}>
            <SectionHeading
              subtitle="Adresse"
              title="Dar Lys, médina de Fès"
              description="13 Derb Bennis, Douh — au cœur du tissu historique, dans le respect du calme des ruelles."
            />
            <div className="flex items-start gap-3 mt-8 p-6 bg-cream-dark/50 border border-border">
              <MapPin className="w-6 h-6 text-gold shrink-0 mt-0.5" />
              <div>
                <p className="font-display font-semibold text-charcoal">13 Derb Bennis, Douh</p>
                <p className="text-muted-foreground text-sm font-body mt-1">Fès Médina, Maroc</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-6 font-body flex items-start gap-2">
              <Navigation className="w-4 h-4 text-gold shrink-0 mt-0.5" />
              Pour l'itinéraire précis, utilisez Google Maps ou contactez la réception : nous pouvons organiser une prise en charge à un point de rendez-vous proche de la médina.
            </p>
          </motion.div>
          <motion.div {...fadeUp} transition={{ delay: 0.12, duration: 0.7 }} className="w-full min-h-[320px] rounded-sm overflow-hidden border border-border shadow-card">
            <iframe
              title="Carte — Dar Lys Fès"
              src="https://www.openstreetmap.org/export/embed.html?bbox=-5.0100%2C34.0520%2C-4.9950%2C34.0620&layer=mapnik"
              className="w-full h-[320px] lg:h-full min-h-[320px] border-0 grayscale-[20%] contrast-[1.05]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </motion.div>
        </div>
      </div>
    </section>

    <section className="section-padding bg-charcoal relative">
      <div className="absolute inset-0 opacity-5 zellige-pattern" />
      <div className="container-luxury relative z-10">
        <SectionHeading
          subtitle="Autour de vous"
          title="Proches repères"
          description="Fès se découvre à pied depuis Dar Lys."
          light
        />
        <ul className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {landmarks.map((l, i) => (
            <motion.li key={l.name} {...fadeUp} transition={{ delay: i * 0.1, duration: 0.6 }} className="text-cream/90">
              <h3 className="font-display text-lg text-gold mb-2">{l.name}</h3>
              <p className="text-sm text-cream/65 font-body leading-relaxed">{l.detail}</p>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>

    <section className="section-padding section-warm">
      <div className="container-luxury">
        <SectionHeading subtitle="Venir à Dar Lys" title="Transports" description="Plusieurs options pour rejoindre la médina en toute sérénité." />
        <div className="grid md:grid-cols-3 gap-8">
          {transport.map((t, i) => (
            <motion.div
              key={t.title}
              {...fadeUp}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="p-6 bg-cream border border-border card-luxury"
            >
              <t.icon className="w-8 h-8 text-gold mb-4" />
              <h3 className="font-display font-semibold text-charcoal mb-2">{t.title}</h3>
              <p className="text-sm text-muted-foreground font-body leading-relaxed">{t.text}</p>
            </motion.div>
          ))}
        </div>

        <motion.div {...fadeUp} transition={{ delay: 0.3, duration: 0.7 }} className="mt-12">
          <DriverPickupCalculator />
        </motion.div>
      </div>
    </section>
  </Layout>
);

export default Access;
