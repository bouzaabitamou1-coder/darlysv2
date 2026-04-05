import { motion } from "framer-motion";
import { MapPin, Plane, Train, Car, Navigation } from "lucide-react";
import Layout from "@/components/layout/Layout";
import SectionHeading from "@/components/ui/SectionHeading";
import { photo } from "@/data/siteMedia";

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
      </div>
    </section>
  </Layout>
);

export default Access;
