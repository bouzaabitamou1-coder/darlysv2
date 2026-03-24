import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import SectionHeading from "@/components/ui/SectionHeading";
import galleryCourtyard from "@/assets/gallery-courtyard.jpg";
import heroImage from "@/assets/hero-riad.jpg";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.7 },
};

const values = [
  { title: "Authenticity", desc: "We preserve centuries-old Moroccan traditions in every tile, every arch, and every meal." },
  { title: "Excellence", desc: "Every detail is curated to exceed your expectations and create lasting memories." },
  { title: "Sustainability", desc: "We honor our heritage by using local materials and supporting artisan communities." },
  { title: "Warmth", desc: "Our team treats every guest like family, embodying the spirit of Moroccan hospitality." },
];

const About = () => (
  <Layout>
    <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden">
      <img src={heroImage} alt="Dar Lys riad" className="absolute inset-0 w-full h-full object-cover" width={1920} height={1080} />
      <div className="overlay-dark" />
      <div className="relative z-10 text-center px-4">
        <p className="text-gold-light text-sm tracking-[0.4em] uppercase font-body mb-4">Our Story</p>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-cream">About Dar Lys</h1>
      </div>
    </section>

    <section className="section-padding bg-cream">
      <div className="container-luxury">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div {...fadeUp}>
            <span className="text-sm tracking-[0.3em] uppercase font-body text-gold block mb-3">Heritage & Vision</span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-charcoal leading-tight mb-6">A Legacy Reimagined</h2>
            <div className="moroccan-divider !mx-0 mb-6" />
            <p className="text-muted-foreground leading-relaxed mb-4 font-body">
              Originally built in the 18th century, Dar Lys was once the private residence of a prominent Fassi merchant family. For generations, its walls witnessed celebrations, scholarly gatherings, and the daily rhythms of life in the medina.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4 font-body">
              In 2008, a team of passionate artisans and designers embarked on a meticulous restoration, preserving every piece of zellige, carved plaster, and cedarwood while introducing modern comforts that today's travelers expect.
            </p>
            <p className="text-muted-foreground leading-relaxed font-body">
              Today, Dar Lys stands as a testament to the enduring beauty of Moroccan architecture — a place where history breathes through every archway and where guests discover the true essence of Fassi hospitality.
            </p>
          </motion.div>
          <motion.div {...fadeUp} transition={{ delay: 0.2, duration: 0.7 }}>
            <img src={galleryCourtyard} alt="Courtyard" className="w-full aspect-[4/5] object-cover" loading="lazy" width={1280} height={960} />
          </motion.div>
        </div>
      </div>
    </section>

    <section className="section-padding bg-charcoal">
      <div className="container-luxury">
        <SectionHeading subtitle="Our Values" title="What Guides Us" light />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((v, i) => (
            <motion.div key={v.title} {...fadeUp} transition={{ delay: i * 0.1, duration: 0.6 }} className="text-center">
              <h3 className="text-xl font-display font-semibold text-gold mb-3">{v.title}</h3>
              <p className="text-cream/60 text-sm font-body leading-relaxed">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    <section className="relative py-24 overflow-hidden">
      <img src={heroImage} alt="Riad atmosphere" className="absolute inset-0 w-full h-full object-cover" loading="lazy" width={1920} height={1080} />
      <div className="overlay-dark" />
      <div className="relative z-10 text-center px-4">
        <motion.div {...fadeUp}>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-cream mb-6">Experience Dar Lys</h2>
          <Link to="/rooms" className="btn-hero">Book Your Stay</Link>
        </motion.div>
      </div>
    </section>
  </Layout>
);

export default About;
