import { useState } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import SectionHeading from "@/components/ui/SectionHeading";
import heroImage from "@/assets/darlys-hero-1.jpg";
import heroImage2 from "@/assets/darlys-hero-2.jpg";
import patioHero from "@/assets/darlys-patio-hero.jpg";
import patio from "@/assets/darlys-patio.jpg";
import exterior from "@/assets/darlys-exterior.jpg";
import detail from "@/assets/darlys-detail.jpg";
import salon from "@/assets/gallery-salon.jpg";
import terrasse from "@/assets/gallery-terrasse.jpg";
import patioFull from "@/assets/gallery-patio-full.jpg";
import roomClassique from "@/assets/room-classique.jpg";
import roomDeluxe from "@/assets/room-deluxe.jpg";
import roomSuperieure from "@/assets/room-superieure.jpg";
import roomFamily from "@/assets/room-family.jpg";
import restaurantZahra from "@/assets/restaurant-zahra.jpg";
import restaurantPatio from "@/assets/restaurant-patio.jpg";
import restaurantBar from "@/assets/restaurant-bar.jpg";
import spaHammam from "@/assets/spa-hammam.jpg";
import spaGallery1 from "@/assets/spa-gallery-1.jpg";
import spaBeauty from "@/assets/spa-beauty.jpg";
import gallerySpaDetail from "@/assets/gallery-spa-detail.jpg";
import galleryBar from "@/assets/gallery-bar.jpg";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.5 },
};

const allImages = [
  { src: heroImage, category: "Riad", alt: "Dar Lys entrance" },
  { src: heroImage2, category: "Riad", alt: "Dar Lys courtyard" },
  { src: patioHero, category: "Riad", alt: "Patio panoramic view" },
  { src: patio, category: "Riad", alt: "Patio with fountain" },
  { src: exterior, category: "Riad", alt: "Riad exterior view" },
  { src: detail, category: "Riad", alt: "Architectural detail" },
  { src: salon, category: "Riad", alt: "Lounge salon" },
  { src: terrasse, category: "Riad", alt: "Panoramic terrace" },
  { src: patioFull, category: "Riad", alt: "Patio full view" },
  { src: roomClassique, category: "Rooms", alt: "La Classique room" },
  { src: roomDeluxe, category: "Rooms", alt: "La Deluxe room" },
  { src: roomSuperieure, category: "Rooms", alt: "La Supérieure room" },
  { src: roomFamily, category: "Rooms", alt: "La Lys Family room" },
  { src: restaurantZahra, category: "Dining", alt: "Restaurant Zahra" },
  { src: restaurantPatio, category: "Dining", alt: "Patio dining" },
  { src: restaurantBar, category: "Dining", alt: "Le Syl Bar" },
  { src: galleryBar, category: "Dining", alt: "Bar ambiance" },
  { src: spaHammam, category: "Spa", alt: "Hammam treatments" },
  { src: spaGallery1, category: "Spa", alt: "Spa interior" },
  { src: spaBeauty, category: "Spa", alt: "Beauty center" },
  { src: gallerySpaDetail, category: "Spa", alt: "Spa detail" },
];

const categories = ["All", "Riad", "Rooms", "Dining", "Spa"];

const Gallery = () => {
  const [filter, setFilter] = useState("All");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const filtered = filter === "All" ? allImages : allImages.filter((img) => img.category === filter);

  return (
    <Layout>
      <section className="relative h-[50vh] min-h-[350px] flex items-center justify-center overflow-hidden">
        <img src={patioHero} alt="Gallery" className="absolute inset-0 w-full h-full object-cover" width={1280} height={960} />
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
