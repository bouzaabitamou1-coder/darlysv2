import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Utensils, Sparkles, ArrowRight } from "lucide-react";
import Layout from "@/components/layout/Layout";
import SectionHeading from "@/components/ui/SectionHeading";
import { photo, video } from "@/data/siteMedia";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.7 },
};

const HeroSection = () => (
  <section className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden">
    <video
      className="absolute inset-0 w-full h-full object-cover"
      autoPlay
      muted
      loop
      playsInline
      poster={photo.heroMain}
      aria-label="Dar Lys luxury riad in Fès"
    >
      <source src={video.homeHero} type="video/mp4" />
    </video>
    <div className="overlay-warm" />
    <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-gold-light text-sm tracking-[0.45em] uppercase font-body mb-4"
      >
        Riad d’exception — Fès
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-display font-bold text-cream leading-[1.1] mb-4"
      >
        Dar Lys
      </motion.h1>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="star-separator"
      >
        <span className="text-gold text-lg">✦</span>
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="text-cream/70 text-lg sm:text-xl font-accent italic max-w-xl mx-auto mb-10"
      >
        Riad de charme au cœur de la médina millénaire de Fès
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="flex flex-col sm:flex-row gap-4 justify-center"
      >
        <Link to="/rooms" className="btn-hero">
          Discover Rooms
        </Link>
        <Link to="/about" className="btn-hero border-cream/30 bg-transparent hover:bg-cream/10 hover:border-cream/50">
          Our Story
        </Link>
      </motion.div>
    </div>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5, duration: 1 }}
      className="absolute bottom-10 left-1/2 -translate-x-1/2"
    >
      <div className="w-px h-16 bg-gradient-to-b from-transparent via-gold/50 to-transparent" />
    </motion.div>
  </section>
);

const AboutPreview = () => (
  <section className="section-padding bg-cream zellige-pattern">
    <div className="container-luxury">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <motion.div {...fadeUp}>
          <span className="text-sm tracking-[0.3em] uppercase font-body text-gold block mb-3">Bienvenue à Dar Lys</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-charcoal leading-tight mb-2">
            Un Havre de Paix
          </h2>
          <p className="text-muted-foreground text-sm tracking-[0.2em] uppercase font-body mb-4">Heritage & contemporary comfort</p>
          <div className="moroccan-divider !mx-0 mb-6" />
          <p className="text-muted-foreground leading-relaxed mb-4 font-body">
            Dar Lys est la nouvelle adresse en plein cœur de la médina de Fès. Des murs en tadelakt se marient harmonieusement au zellige et stucs aux motifs de lys ou nids d'abeilles.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-8 font-body">
            Dar Lys a été entièrement construit dans le respect de l'esprit de la médina et des anciennes demeures fassies. Un lieu authentique qui invite modernité et tradition.
          </p>
          <Link to="/about" className="btn-outline-luxury">
            Discover Our Story
          </Link>
        </motion.div>
        <motion.div {...fadeUp} transition={{ duration: 0.7, delay: 0.2 }} className="relative">
          <div className="moroccan-arch">
            <img src={photo.courtyard} alt="Riad courtyard" className="w-full aspect-[4/5] object-cover" loading="lazy" width={1280} height={960} />
          </div>
          <div className="absolute -bottom-6 -left-6 bg-gold p-6 hidden lg:block">
            <p className="text-cream text-3xl font-display font-bold">18</p>
            <p className="text-cream/80 text-xs tracking-[0.2em] uppercase font-body">Rooms & suites</p>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

const rooms = [
  { name: "La Classique", size: "19 sqm", image: photo.roomClassique, desc: "Warm tones, natural light, and discreet elegance — up to 2 adults and a baby under 2." },
  { name: "La Deluxe", size: "30 sqm", image: photo.roomDeluxe, desc: "Spacious contemporary comfort, natural palette and rich furnishings — ideal for business or leisure." },
  { name: "The Superior", size: "36 sqm", image: photo.roomSuperieure, desc: "Art Deco flair, zellige and cedar; balcony with medina views in selected rooms, fireplace in winter." },
  { name: "La Lys Family", size: "38 sqm", image: photo.roomFamily, desc: "Two bedrooms, two walk-in showers, patio views — up to 5 guests including children and teens." },
];

const RoomsPreview = () => (
  <section className="section-padding section-warm">
    <div className="container-luxury">
      <SectionHeading
        subtitle="Stay"
        title="Rooms & Suites"
        description="Eighteen rooms around the patio, each with Smart TV, safe, minibar, Nespresso, tea tray, and Italian showers with Botanika care products."
      />
      <div className="grid sm:grid-cols-2 gap-8">
        {rooms.map((room, i) => (
          <motion.div key={room.name} {...fadeUp} transition={{ duration: 0.7, delay: i * 0.1 }} className="card-luxury group">
            <div className="relative overflow-hidden aspect-[4/3]">
              <img src={room.image} alt={room.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" width={1280} height={960} />
              <div className="absolute top-4 right-4 bg-charcoal/80 backdrop-blur-sm px-4 py-2">
                <p className="text-gold text-sm font-body">
                  <span className="text-lg font-semibold">{room.size}</span>
                </p>
              </div>
            </div>
            <div className="p-6 lg:p-8">
              <h3 className="text-xl font-display font-semibold text-charcoal mb-3">{room.name}</h3>
              <p className="text-sm text-muted-foreground font-body mb-4">{room.desc}</p>
              <Link to="/rooms" className="inline-flex items-center gap-2 text-sm text-gold hover:text-gold-dark transition-colors font-body tracking-wider uppercase">
                View details <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="text-center mt-10">
        <Link to="/rooms" className="btn-outline-luxury">View all rooms</Link>
      </div>
    </div>
  </section>
);

const experiences = [
  { icon: Utensils, title: "Restaurant Zahra", desc: "Cuisine authentique de Fès dans une ambiance exclusive et intimiste", image: photo.restaurantZahra, link: "/restaurant" },
  { icon: Sparkles, title: "Lotus Spa", desc: "Hammam, massages et soins pour chouchouter corps et esprit", image: photo.spaInterior, link: "/spa" },
];

const offersPreview = [
  { title: "Spa & médina", desc: "Hammam, soins Lotus Spa et séjour au cœur de Fès.", image: photo.spaInterior, link: "/offers" },
  { title: "Table d’hôte", desc: "Restaurant Zahra — saveurs authentiques et patio.", image: photo.restaurantPatio, link: "/offers" },
];

const OffersPreviewSection = () => (
  <section className="section-padding bg-charcoal relative">
    <div className="absolute inset-0 opacity-5 zellige-pattern" />
    <div className="container-luxury relative z-10">
      <SectionHeading
        subtitle="Offres"
        title="Profitez de nos séjours signature"
        description="Meilleur tarif en réservation directe — petit-déjeuner offert, sans frais cachés."
        light
      />
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {offersPreview.map((o, i) => (
          <motion.div key={o.title} {...fadeUp} transition={{ duration: 0.7, delay: i * 0.12 }}>
            <Link to={o.link} className="group block border border-cream/15 overflow-hidden bg-charcoal-light/20 hover:border-gold/40 transition-colors">
              <div className="aspect-[16/9] overflow-hidden">
                <img src={o.image} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" width={1280} height={720} />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-display font-semibold text-cream mb-2">{o.title}</h3>
                <p className="text-cream/65 text-sm font-body mb-4">{o.desc}</p>
                <span className="text-gold text-xs tracking-[0.2em] uppercase font-body">Voir toutes les offres →</span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const ExperiencesSection = () => (
  <section className="section-padding bg-charcoal relative">
    <div className="absolute inset-0 opacity-5 zellige-pattern" />
    <div className="container-luxury relative z-10">
      <SectionHeading subtitle="Expériences" title="Éveillez Vos Sens" description="Au-delà de l'hébergement, Dar Lys offre des expériences uniques." light />
      <div className="grid md:grid-cols-2 gap-8">
        {experiences.map((exp, i) => (
          <motion.div key={exp.title} {...fadeUp} transition={{ duration: 0.7, delay: i * 0.15 }}>
            <Link to={exp.link} className="group block relative overflow-hidden aspect-[3/2]">
              <img src={exp.image} alt={exp.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" width={1024} height={1024} />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                <exp.icon className="w-8 h-8 text-gold mb-3" />
                <h3 className="text-2xl font-display font-semibold text-cream mb-2">{exp.title}</h3>
                <p className="text-cream/70 text-sm font-body">{exp.desc}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const testimonials = [
  { name: "Sophie Laurent", location: "Paris, France", text: "Un séjour absolument magique. L'attention aux détails, la chaleur du personnel et la beauté du riad ont dépassé toutes nos attentes.", rating: 5 },
  { name: "James Mitchell", location: "London, UK", text: "Dar Lys is a hidden gem in the medina. The rooftop dinner was one of the most memorable meals of our travels.", rating: 5 },
  { name: "Elena Rossi", location: "Milan, Italy", text: "Pure luxury with authentic Moroccan charm. The hammam experience was heavenly. We will definitely return.", rating: 5 },
];

const TestimonialsSection = () => (
  <section className="section-padding bg-cream zellige-pattern">
    <div className="container-luxury">
      <SectionHeading subtitle="Témoignages" title="Ce Que Disent Nos Hôtes" />
      <div className="grid md:grid-cols-3 gap-8">
        {testimonials.map((t, i) => (
          <motion.div key={t.name} {...fadeUp} transition={{ duration: 0.7, delay: i * 0.1 }} className="text-center p-8">
            <div className="flex justify-center gap-1 mb-4">
              {Array.from({ length: t.rating }).map((_, j) => (
                <Star key={j} className="w-4 h-4 text-gold fill-gold" />
              ))}
            </div>
            <p className="text-charcoal-light font-accent italic text-lg leading-relaxed mb-6">"{t.text}"</p>
            <p className="font-display font-semibold text-charcoal">{t.name}</p>
            <p className="text-xs text-muted-foreground tracking-wider uppercase font-body mt-1">{t.location}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const GalleryPreview = () => (
  <section className="section-padding section-warm">
    <div className="container-luxury">
      <SectionHeading subtitle="Galerie" title="Moments à Dar Lys" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 lg:gap-4">
        {[photo.patioHero, photo.exterior, photo.restaurantZahra, photo.spaInterior, photo.patio, photo.restaurantPatio].map((img, i) => (
          <motion.div key={i} {...fadeUp} transition={{ duration: 0.5, delay: i * 0.08 }} className="overflow-hidden aspect-square group">
            <img src={img} alt={`Dar Lys gallery ${i + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" width={640} height={640} />
          </motion.div>
        ))}
      </div>
      <div className="text-center mt-10">
        <Link to="/gallery" className="btn-outline-luxury">View Full Gallery</Link>
      </div>
    </div>
  </section>
);

const SpaBotanikaSection = () => (
  <section className="section-padding bg-charcoal relative">
    <div className="absolute inset-0 opacity-5 zellige-pattern" />
    <div className="container-luxury relative z-10">
      <SectionHeading
        subtitle="Lotus Spa & Botanika"
        title="Relaxation with a clear conscience"
        description="Our spa and bathrooms use Botanika refill dispensers — Moroccan, ecological formulas without parabens, aluminum salts, or GMOs, not tested on animals."
        light
      />
      <motion.div {...fadeUp} className="max-w-3xl mx-auto rounded-sm overflow-hidden border border-cream/15 shadow-2xl">
        <video className="w-full aspect-video object-cover" controls playsInline poster={photo.spaInterior}>
          <source src={video.spa} type="video/mp4" />
        </video>
      </motion.div>
    </div>
  </section>
);

const CTASection = () => (
  <section className="relative py-24 sm:py-32 overflow-hidden">
    <video
      className="absolute inset-0 w-full h-full object-cover"
      autoPlay
      muted
      loop
      playsInline
      poster={photo.exterior}
      aria-hidden
    >
      <source src={video.ambience} type="video/mp4" />
    </video>
    <div className="overlay-warm" />
    <div className="relative z-10 text-center px-4">
      <motion.div {...fadeUp}>
        <p className="text-gold-light text-sm tracking-[0.35em] uppercase font-body mb-4">Réservez en direct</p>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-cream mb-6">Your Moroccan Escape Awaits</h2>
        <p className="text-cream/70 max-w-lg mx-auto mb-8 font-body">Réservez votre séjour à Dar Lys et vivez la magie de Fès comme jamais auparavant.</p>
        <Link to="/rooms" className="btn-hero">Réserver Maintenant</Link>
      </motion.div>
    </div>
  </section>
);

const Index = () => (
  <Layout>
    <HeroSection />
    <AboutPreview />
    <RoomsPreview />
    <ExperiencesSection />
    <OffersPreviewSection />
    <TestimonialsSection />
    <GalleryPreview />
    <SpaBotanikaSection />
    <CTASection />
  </Layout>
);

export default Index;
