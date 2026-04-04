import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Clock, Droplets, Flower2, Leaf } from "lucide-react";
import Layout from "@/components/layout/Layout";
import SectionHeading from "@/components/ui/SectionHeading";
import spaHeroBanner from "@/assets/spa-hero-banner.jpg";
import spaHammam from "@/assets/spa-hammam.jpg";
import spaBeauty from "@/assets/spa-beauty.jpg";
import spaGallery1 from "@/assets/spa-gallery-1.jpg";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.7 },
};

const treatments = [
  { icon: Droplets, name: "Traditional Hammam", duration: "60 min", price: "70", desc: "A purifying ritual of steam, black soap scrub, and ghassoul clay mask." },
  { icon: Flower2, name: "Argan Oil Massage", duration: "75 min", price: "90", desc: "A deeply relaxing full-body massage using pure Moroccan argan oil." },
  { icon: Leaf, name: "Rose Petal Bath", duration: "45 min", price: "60", desc: "A luxurious soak in warm water infused with Damask rose petals and essential oils." },
  { icon: Droplets, name: "Royal Hammam Ritual", duration: "120 min", price: "150", desc: "Our signature experience: hammam, scrub, ghassoul wrap, argan massage, and mint tea." },
];

const packages = [
  { name: "Serenity Half-Day", duration: "3 hours", price: "200", includes: ["Traditional Hammam", "Argan Oil Massage", "Mint Tea Ceremony"] },
  { name: "Royal Wellness Day", duration: "5 hours", price: "350", includes: ["Royal Hammam Ritual", "Rose Petal Bath", "Lunch on Rooftop", "Relaxation Lounge"] },
];

const Spa = () => (
  <Layout>
    <section className="relative h-[50vh] min-h-[350px] flex items-center justify-center overflow-hidden">
      <img src={spaHeroBanner} alt="Lotus Spa at Dar Lys" className="absolute inset-0 w-full h-full object-cover" width={1024} height={1024} />
      <div className="overlay-dark" />
      <div className="relative z-10 text-center px-4">
        <p className="text-gold-light text-sm tracking-[0.4em] uppercase font-body mb-4">Wellness</p>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-cream">Lotus Spa</h1>
      </div>
    </section>

    <section className="section-padding bg-cream">
      <div className="container-luxury">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-20">
          <motion.div {...fadeUp}>
            <span className="text-sm tracking-[0.3em] uppercase font-body text-gold block mb-3">Bien-être</span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-charcoal leading-tight mb-6">A Sanctuary for Body & Soul</h2>
            <div className="moroccan-divider !mx-0 mb-6" />
            <p className="text-muted-foreground leading-relaxed mb-4 font-body">
              The Lotus Spa invites you to a parenthesis of well-being and cocooning. A refined and contemporary design, perfumes and scents, an inspiring spa menu to awaken your senses, regenerate and recharge.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6 font-body">
              Hammam with black soap, ancestral scrubbing techniques, massages and rejuvenating treatments — the Lotus Spa offers relaxation to pamper your spirit, body and soul.
            </p>
            <p className="text-sm text-charcoal-light font-body flex items-center gap-2">
              <Clock className="w-4 h-4 text-gold" /> Open daily 12:00 – 21:00
            </p>
          </motion.div>
          <motion.div {...fadeUp} transition={{ delay: 0.2, duration: 0.7 }}>
            <img src={spaGallery1} alt="Spa interior" className="w-full aspect-[4/5] object-cover" loading="lazy" width={1280} height={960} />
          </motion.div>
        </div>

        <SectionHeading subtitle="Treatments" title="Indulge in Tradition" description="Our spa draws on centuries-old Moroccan beauty rituals, using natural ingredients sourced from the Atlas Mountains." />

        <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {treatments.map((t, i) => (
            <motion.div key={t.name} {...fadeUp} transition={{ delay: i * 0.1, duration: 0.6 }} className="card-luxury p-6 lg:p-8">
              <t.icon className="w-8 h-8 text-gold mb-4" />
              <h3 className="text-xl font-display font-semibold text-charcoal mb-1">{t.name}</h3>
              <div className="flex items-center gap-3 text-xs text-muted-foreground font-body mb-3">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {t.duration}</span>
                <span className="text-gold font-semibold">€{t.price}</span>
              </div>
              <p className="text-sm text-muted-foreground font-body leading-relaxed">{t.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    <section className="section-padding bg-cream-dark">
      <div className="container-luxury">
        <SectionHeading subtitle="Gallery" title="The Lotus Spa" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 lg:gap-4">
          {[spaHammam, spaGallery1, spaBeauty].map((img, i) => (
            <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.08, duration: 0.5 }} className="overflow-hidden aspect-square group">
              <img src={img} alt={`Spa gallery ${i + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" width={640} height={640} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    <section className="section-padding bg-charcoal">
      <div className="container-luxury">
        <SectionHeading subtitle="Packages" title="Curated Experiences" light />
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {packages.map((pkg, i) => (
            <motion.div key={pkg.name} {...fadeUp} transition={{ delay: i * 0.1, duration: 0.6 }} className="border border-gold/30 p-8 text-center">
              <h3 className="text-2xl font-display font-bold text-gold mb-2">{pkg.name}</h3>
              <p className="text-cream/50 text-xs tracking-wider uppercase font-body mb-4">{pkg.duration}</p>
              <p className="text-3xl font-display font-bold text-cream mb-6">€{pkg.price}</p>
              <div className="space-y-2 mb-8">
                {pkg.includes.map((item) => (
                  <p key={item} className="text-cream/70 text-sm font-body">{item}</p>
                ))}
              </div>
              <Link to="/contact" className="btn-outline-luxury border-gold/50 text-gold hover:bg-gold hover:text-cream">
                Book Package
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  </Layout>
);

export default Spa;
