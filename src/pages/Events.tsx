import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { PartyPopper, Heart, Briefcase, Music } from "lucide-react";
import Layout from "@/components/layout/Layout";
import SectionHeading from "@/components/ui/SectionHeading";
import { photo, video } from "@/data/siteMedia";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.7 },
};

const eventTypes = [
  {
    icon: Heart,
    title: "Mariages & fiançailles",
    text: "Célébrez votre union dans l'intimité d'un riad d'exception : patios, salons et terrasse panoramique pour un décor inoubliable.",
  },
  {
    icon: PartyPopper,
    title: "Anniversaires & réceptions",
    text: "Soirées privées, cocktails et dîners sur mesure avec l'équipe du Restaurant Zahra et du Syl Bar.",
  },
  {
    icon: Briefcase,
    title: "Événements d'entreprise",
    text: "Séminaires résidentiels, dîners de direction ou incentives : espaces modulables et service haut de gamme.",
  },
  {
    icon: Music,
    title: "Soirées culturelles",
    text: "Musique live, ateliers artisanaux ou dégustations : nous adaptons l'expérience à votre projet.",
  },
];

const Events = () => {
  const [note, setNote] = useState("");

  return (
    <Layout>
      <section className="relative h-[45vh] min-h-[320px] flex items-center justify-center overflow-hidden">
        <img src={photo.salon} alt="" className="absolute inset-0 w-full h-full object-cover" width={1280} height={960} />
        <div className="overlay-dark" />
        <div className="relative z-10 text-center px-6 sm:px-10 py-8 riad-door-frame">
          <p className="text-gold-light text-sm tracking-[0.4em] uppercase font-body mb-4">Privatisation</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-cream mb-3">Événements & célébrations</h1>
          <p className="text-cream/75 max-w-xl mx-auto font-body">
            Dar Lys accueille vos moments les plus importants au cœur de la médina de Fès.
          </p>
        </div>
      </section>

      <section className="section-padding bg-cream">
        <div className="container-luxury">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-20">
            <motion.div {...fadeUp}>
              <span className="text-sm tracking-[0.3em] uppercase font-body text-gold block mb-3">Ambiance</span>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-charcoal leading-tight mb-6">
                Un cadre authentique pour vos invités
              </h2>
              <div className="moroccan-divider !mx-0 mb-6" />
              <p className="text-muted-foreground leading-relaxed mb-4 font-body">
                Tadelakt, zellige, salons autour du patio et terrasse avec vue sur la médina : chaque espace raconte l'âme des demeures fassies, avec le confort d'un hôtel de charme contemporain.
              </p>
              <p className="text-muted-foreground leading-relaxed font-body">
                Notre équipe coordonne restauration, mise en scène et logistique pour que vous profitiez pleinement de votre événement.
              </p>
            </motion.div>
            <motion.div {...fadeUp} transition={{ delay: 0.15, duration: 0.7 }} className="grid grid-cols-2 gap-4">
              <div className="moroccan-arch overflow-hidden">
                <img src={photo.restaurantZahra} alt="" className="w-full aspect-[3/4] object-cover" loading="lazy" width={800} height={1066} />
              </div>
              <div className="moroccan-arch overflow-hidden mt-8">
                <img src={photo.exterior} alt="" className="w-full aspect-[3/4] object-cover" loading="lazy" width={800} height={1066} />
              </div>
            </motion.div>
          </div>

          <motion.div {...fadeUp} className="max-w-3xl mx-auto mb-20 rounded-sm overflow-hidden border border-border shadow-card">
            <video className="w-full aspect-video object-cover" controls playsInline poster={photo.courtyard}>
              <source src={video.reelRiad} type="video/mp4" />
            </video>
            <p className="text-center text-sm text-muted-foreground font-body py-3 px-4 bg-cream-dark/30">Aperçu vidéo des espaces pour vos événements.</p>
          </motion.div>

          <SectionHeading
            subtitle="Prestations"
            title="Ce que nous organisons"
            description="Parlez-nous de votre date, du nombre d'invités et de l'atmosphère souhaitée — nous vous proposerons une offre sur mesure."
          />
          <div className="grid sm:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
            {eventTypes.map((e, i) => (
              <motion.div
                key={e.title}
                {...fadeUp}
                transition={{ delay: i * 0.08, duration: 0.6 }}
                className="p-6 border border-border bg-cream-dark/30"
              >
                <e.icon className="w-8 h-8 text-gold mb-4" />
                <h3 className="text-xl font-display font-semibold text-charcoal mb-2">{e.title}</h3>
                <p className="text-sm text-muted-foreground font-body leading-relaxed">{e.text}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            {...fadeUp}
            className="max-w-xl mx-auto p-8 border-2 border-gold/30 bg-charcoal text-cream"
          >
            <h3 className="text-xl font-display font-semibold mb-4 text-center">Demande de devis</h3>
            <p className="text-sm text-cream/70 text-center mb-6 font-body">
              Décrivez votre projet ci-dessous, puis envoyez-nous le message depuis la page contact (pré-remplie).
            </p>
            <label htmlFor="event-note" className="sr-only">
              Détails de l'événement
            </label>
            <textarea
              id="event-note"
              value={note}
              onChange={(ev) => setNote(ev.target.value)}
              rows={4}
              className="w-full bg-charcoal-light/50 border border-cream/20 text-cream placeholder:text-cream/40 px-4 py-3 text-sm font-body mb-4 focus:outline-none focus:ring-2 focus:ring-gold/50"
              placeholder="Date souhaitée, nombre d'invités, type d'événement…"
            />
            <Link
              to="/contact"
              state={{ subject: "Événement / privatisation Dar Lys", body: note }}
              className="btn-luxury w-full text-center block"
            >
              Continuer vers le formulaire
            </Link>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Events;
