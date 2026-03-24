import { useState } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import SectionHeading from "@/components/ui/SectionHeading";
import heroImage from "@/assets/hero-riad.jpg";
import roomSuite from "@/assets/room-suite.jpg";
import roomDeluxe from "@/assets/room-deluxe.jpg";
import roomStandard from "@/assets/room-standard.jpg";
import restaurantImg from "@/assets/restaurant.jpg";
import spaImg from "@/assets/spa.jpg";
import galleryCourtyard from "@/assets/gallery-courtyard.jpg";
import galleryTea from "@/assets/gallery-tea.jpg";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.5 },
};

const allImages = [
  { src: heroImage, category: "Riad", alt: "Riad courtyard at night" },
  { src: roomSuite, category: "Rooms", alt: "Royal suite" },
  { src: roomDeluxe, category: "Rooms", alt: "Deluxe room" },
  { src: roomStandard, category: "Rooms", alt: "Standard room" },
  { src: restaurantImg, category: "Dining", alt: "Rooftop restaurant" },
  { src: spaImg, category: "Spa", alt: "Spa and hammam" },
  { src: galleryCourtyard, category: "Riad", alt: "Courtyard with fountain" },
  { src: galleryTea, category: "Dining", alt: "Moroccan tea ceremony" },
];

const categories = ["All", "Riad", "Rooms", "Dining", "Spa"];

const Gallery = () => {
  const [filter, setFilter] = useState("All");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const filtered = filter === "All" ? allImages : allImages.filter((img) => img.category === filter);

  return (
    <Layout>
      <section className="relative h-[50vh] min-h-[350px] flex items-center justify-center overflow-hidden">
        <img src={galleryCourtyard} alt="Gallery" className="absolute inset-0 w-full h-full object-cover" width={1280} height={960} />
        <div className="overlay-dark" />
        <div className="relative z-10 text-center px-4">
          <p className="text-gold-light text-sm tracking-[0.4em] uppercase font-body mb-4">Visual Journey</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-cream">Gallery</h1>
        </div>
      </section>

      <section className="section-padding bg-cream">
        <div className="container-luxury">
          <SectionHeading subtitle="Explore" title="Moments at Dar Lys" />

          <div className="flex justify-center gap-3 mb-12 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-5 py-2 text-xs tracking-[0.15em] uppercase font-body transition-all duration-300 ${
                  filter === cat ? "bg-gold text-cream" : "bg-transparent text-charcoal border border-border hover:border-gold hover:text-gold"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
            {filtered.map((img, i) => (
              <motion.div
                key={`${img.alt}-${i}`}
                {...fadeUp}
                transition={{ delay: i * 0.05, duration: 0.5 }}
                className="overflow-hidden aspect-square group cursor-pointer"
                onClick={() => setSelectedImage(img.src)}
              >
                <img src={img.src} alt={img.alt} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" width={640} height={640} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-charcoal/90 flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
          <img src={selectedImage} alt="Gallery fullscreen" className="max-w-full max-h-[90vh] object-contain" />
          <button onClick={() => setSelectedImage(null)} className="absolute top-6 right-6 text-cream text-2xl font-body hover:text-gold transition-colors" aria-label="Close">✕</button>
        </div>
      )}
    </Layout>
  );
};

export default Gallery;
