import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Calendar, Sparkles, Heart, Palmtree } from "lucide-react";
import Layout from "@/components/layout/Layout";
import SectionHeading from "@/components/ui/SectionHeading";
import { photo } from "@/data/siteMedia";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.7 },
};

const offers = [
  {
    title: "Échappée médina & spa",
    subtitle: "2 nuits minimum",
    desc: "Profitez de Dar Lys et du Lotus Spa : hammam, gommage et massage inclus pour une immersion complète dans le bien-être fassi.",
    image: photo.spaInterior,
    icon: Sparkles,
    href: "/booking",
    badge: "Populaire",
  },
  {
    title: "Romance à Fès",
    subtitle: "Sur demande",
    desc: "Chambre décorée, dîner aux chandelles au patio ou en terrasse, petit-déjeuner servi en chambre — idéal pour célébrer un moment précieux.",
    image: photo.roomDeluxe,
    icon: Heart,
    href: "/contact",
    badge: "Sur mesure",
  },
  {
    title: "Séjour gourmand",
    subtitle: "Restaurant Zahra",
    desc: "Hébergement avec dîner gastronomique marocain au Restaurant Zahra et découverte des saveurs de la capitale spirituelle.",
    image: photo.restaurantZahra,
    icon: Calendar,
    href: "/restaurant",
    badge: "Gastronomie",
  },
  {
    title: "Dar Lys & la médina",
    subtitle: "Expérience locale",
    desc: "Conseils personnalisés pour explorer Fès : artisans, tanneries, monuments et ruelles — votre pied-à-terre de luxe au cœur de la ville.",
    image: photo.patio,
    icon: Palmtree,
    href: "/about",
    badge: "Découverte",
  },
];

const Offers = () => (
  <Layout>
    <section className="relative h-[45vh] min-h-[320px] flex items-center justify-center overflow-hidden">
      <img src={photo.patio} alt="" className="absolute inset-0 w-full h-full object-cover" width={1280} height={960} />
      <div className="overlay-warm" />
      <div className="relative z-10 text-center px-6 sm:px-10 py-8 riad-door-frame">
        <p className="text-gold-light text-sm tracking-[0.4em] uppercase font-body mb-4">Dar Lys</p>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-cream mb-3">Offres spéciales</h1>
        <p className="text-cream/75 max-w-xl mx-auto font-body">
          Réservez en direct pour le meilleur tarif garanti — petit-déjeuner offert, pas de frais cachés, contact direct avec la maison.
        </p>
      </div>
    </section>

    <section className="section-padding bg-cream zellige-pattern">
      <div className="container-luxury">
        <SectionHeading
          subtitle="Séjours"
          title="Packages & promotions"
          description="Des formules pensées pour découvrir Dar Lys, la médina de Fès et nos tables d'exception."
        />
        <div className="grid md:grid-cols-2 gap-8 lg:gap-10">
          {offers.map((offer, i) => (
            <motion.article
              key={offer.title}
              {...fadeUp}
              transition={{ duration: 0.7, delay: i * 0.08 }}
              className="card-luxury group flex flex-col overflow-hidden border border-border/60"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={offer.image}
                  alt=""
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                  width={1280}
                  height={800}
                />
                <div className="absolute top-4 left-4 bg-charcoal/85 text-cream text-xs tracking-widest uppercase px-3 py-1.5 font-body">
                  {offer.badge}
                </div>
              </div>
              <div className="p-6 lg:p-8 flex flex-col flex-1">
                <div className="flex items-center gap-2 text-gold mb-2">
                  <offer.icon className="w-5 h-5" />
                  <span className="text-xs tracking-[0.2em] uppercase font-body">{offer.subtitle}</span>
                </div>
                <h2 className="text-2xl font-display font-semibold text-charcoal mb-3">{offer.title}</h2>
                <p className="text-muted-foreground font-body leading-relaxed flex-1 mb-6">{offer.desc}</p>
                <Link to={offer.href} className="btn-luxury text-center w-full sm:w-auto">
                  En savoir plus
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
        <p className="text-center text-sm text-muted-foreground mt-12 font-body max-w-2xl mx-auto">
          Conditions et disponibilités selon la saison. Contactez-nous pour composer votre séjour idéal à Dar Lys.
        </p>
      </div>
    </section>
  </Layout>
);

export default Offers;
