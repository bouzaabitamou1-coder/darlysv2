import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Utensils, Sparkles, ArrowRight } from "lucide-react";
import Layout from "@/components/layout/Layout";
import SectionHeading from "@/components/ui/SectionHeading";
import heroImage from "@/assets/hero-riad.jpg";
import roomSuite from "@/assets/room-suite.jpg";
import roomDeluxe from "@/assets/room-deluxe.jpg";
import restaurantImg from "@/assets/restaurant.jpg";
import spaImg from "@/assets/spa.jpg";
import galleryCourtyard from "@/assets/gallery-courtyard.jpg";
import galleryTea from "@/assets/gallery-tea.jpg";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.7 },
};

const HeroSection = () => (
  <section className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden">
    <img src={heroImage} alt="Dar Lys luxury riad courtyard in Fes" className="absolute inset-0 w-full h-full object-cover" width={1920} height={1080} />
    <div className="overlay-dark" />
    <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-gold-light text-sm tracking-[0.4em] uppercase font-body mb-6"
      >
        Luxury Riad in Fès, Morocco
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-display font-bold text-cream leading-[1.1] mb-6"
      >
        Dar Lys
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="text-cream/70 text-lg sm:text-xl font-accent italic max-w-xl mx-auto mb-10"
      >
        Where timeless Moroccan elegance meets modern luxury in the heart of the ancient medina
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="flex flex-col sm:flex-row gap-4 justify-center"
      >
        <Link to="/rooms" className="btn-hero">
          Explore Rooms
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
  <section className="section-padding bg-cream">
    <div className="container-luxury">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <motion.div {...fadeUp}>
          <span className="text-sm tracking-[0.3em] uppercase font-body text-gold block mb-3">Welcome to Dar Lys</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-charcoal leading-tight mb-6">
            A Haven of Peace in the Medina
          </h2>
          <div className="moroccan-divider !mx-0 mb-6" />
          <p className="text-muted-foreground leading-relaxed mb-4 font-body">
            Nestled within the labyrinthine streets of the Fès medina, Dar Lys is a meticulously restored 18th-century riad that offers an oasis of calm and luxury. Every corner tells a story of Moroccan craftsmanship — from intricate zellige tilework to hand-carved cedarwood ceilings.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-8 font-body">
            Our philosophy is simple: blend the authentic spirit of Moroccan hospitality with the refinement of modern luxury, creating unforgettable moments for every guest.
          </p>
          <Link to="/about" className="btn-outline-luxury">
            Discover Our Story
          </Link>
        </motion.div>
        <motion.div {...fadeUp} transition={{ duration: 0.7, delay: 0.2 }} className="relative">
          <img src={galleryCourtyard} alt="Riad courtyard" className="w-full aspect-[4/5] object-cover" loading="lazy" width={1280} height={960} />
          <div className="absolute -bottom-6 -left-6 bg-gold p-6 hidden lg:block">
            <p className="text-cream text-3xl font-display font-bold">15+</p>
            <p className="text-cream/80 text-xs tracking-[0.2em] uppercase font-body">Years of Excellence</p>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

const rooms = [
  { name: "Royal Suite", price: "350", size: "65m²", image: roomSuite, desc: "The epitome of luxury with private terrace and panoramic views" },
  { name: "Deluxe Room", price: "220", size: "40m²", image: roomDeluxe, desc: "Elegant comfort with traditional Moroccan design elements" },
];

const RoomsPreview = () => (
  <section className="section-padding bg-cream-dark">
    <div className="container-luxury">
      <SectionHeading subtitle="Accommodations" title="Rooms & Suites" description="Each room is a unique sanctuary, adorned with authentic Moroccan craftsmanship and equipped with every modern amenity." />
      <div className="grid md:grid-cols-2 gap-8">
        {rooms.map((room, i) => (
          <motion.div key={room.name} {...fadeUp} transition={{ duration: 0.7, delay: i * 0.15 }} className="card-luxury group">
            <div className="relative overflow-hidden aspect-[4/3]">
              <img src={room.image} alt={room.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" width={1280} height={960} />
              <div className="absolute top-4 right-4 bg-charcoal/80 backdrop-blur-sm px-4 py-2">
                <p className="text-gold text-sm font-body">From <span className="text-lg font-semibold">€{room.price}</span>/night</p>
              </div>
            </div>
            <div className="p-6 lg:p-8">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-display font-semibold text-charcoal">{room.name}</h3>
                <span className="text-xs tracking-wider uppercase text-muted-foreground font-body">{room.size}</span>
              </div>
              <p className="text-sm text-muted-foreground font-body mb-4">{room.desc}</p>
              <Link to="/rooms" className="inline-flex items-center gap-2 text-sm text-gold hover:text-gold-dark transition-colors font-body tracking-wider uppercase">
                View Details <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="text-center mt-10">
        <Link to="/rooms" className="btn-outline-luxury">View All Rooms</Link>
      </div>
    </div>
  </section>
);

const experiences = [
  { icon: Utensils, title: "Fine Dining", desc: "Savor authentic Moroccan cuisine on our candlelit rooftop terrace", image: restaurantImg, link: "/restaurant" },
  { icon: Sparkles, title: "Spa & Hammam", desc: "Rejuvenate body and soul with traditional hammam rituals", image: spaImg, link: "/spa" },
];

const ExperiencesSection = () => (
  <section className="section-padding bg-charcoal relative">
    <div className="container-luxury">
      <SectionHeading subtitle="Experiences" title="Indulge Your Senses" description="Beyond accommodation, Dar Lys offers a world of curated experiences." light />
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
  { name: "Sophie Laurent", location: "Paris, France", text: "An absolutely magical stay. The attention to detail, the warmth of the staff, and the beauty of the riad exceeded all expectations.", rating: 5 },
  { name: "James Mitchell", location: "London, UK", text: "Dar Lys is a hidden gem in the medina. The rooftop dinner was one of the most memorable meals of our travels.", rating: 5 },
  { name: "Elena Rossi", location: "Milan, Italy", text: "Pure luxury with authentic Moroccan charm. The hammam experience was heavenly. We will definitely return.", rating: 5 },
];

const TestimonialsSection = () => (
  <section className="section-padding bg-cream">
    <div className="container-luxury">
      <SectionHeading subtitle="Testimonials" title="What Our Guests Say" />
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
  <section className="section-padding bg-cream-dark">
    <div className="container-luxury">
      <SectionHeading subtitle="Gallery" title="Glimpses of Dar Lys" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 lg:gap-4">
        {[heroImage, roomSuite, restaurantImg, spaImg, galleryCourtyard, galleryTea].map((img, i) => (
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

const CTASection = () => (
  <section className="relative py-24 sm:py-32 overflow-hidden">
    <img src={roomSuite} alt="Luxury room" className="absolute inset-0 w-full h-full object-cover" loading="lazy" width={1024} height={1024} />
    <div className="overlay-dark" />
    <div className="relative z-10 text-center px-4">
      <motion.div {...fadeUp}>
        <p className="text-gold-light text-sm tracking-[0.3em] uppercase font-body mb-4">Begin Your Journey</p>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-cream mb-6">Your Moroccan Escape Awaits</h2>
        <p className="text-cream/70 max-w-lg mx-auto mb-8 font-body">Reserve your stay at Dar Lys and experience the magic of Fès like never before.</p>
        <Link to="/rooms" className="btn-hero">Reserve Your Stay</Link>
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
    <TestimonialsSection />
    <GalleryPreview />
    <CTASection />
  </Layout>
);

export default Index;
