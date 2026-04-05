import { useState } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import SectionHeading from "@/components/ui/SectionHeading";
import { galleryItems, photo, video, type GalleryItem } from "@/data/siteMedia";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.5 },
};

const categories = ["All", "Riad", "Rooms", "Dining", "Spa", "Videos"];

const Gallery = () => {
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState<GalleryItem | null>(null);
  const filtered = filter === "All" ? galleryItems : galleryItems.filter((item) => item.category === filter);

  return (
    <Layout>
      <section className="relative h-[50vh] min-h-[350px] flex items-center justify-center overflow-hidden">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster={photo.patioHero}
          aria-hidden
        >
          <source src={video.riadWalkthrough} type="video/mp4" />
        </video>
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
            {filtered.map((item, i) => (
              <motion.div
                key={`${item.alt}-${i}`}
                {...fadeUp}
                transition={{ delay: i * 0.05, duration: 0.5 }}
                className="overflow-hidden aspect-square group cursor-pointer relative bg-charcoal/10"
                onClick={() => setSelected(item)}
              >
                {item.type === "image" ? (
                  <img src={item.src} alt={item.alt} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" width={640} height={640} />
                ) : (
                  <>
                    <video src={item.src} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 pointer-events-none" muted playsInline poster={item.poster} />
                    <span className="absolute bottom-2 right-2 text-[10px] tracking-widest uppercase bg-charcoal/75 text-cream px-2 py-1 font-body">Video</span>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {selected && (
        <div className="fixed inset-0 z-50 bg-charcoal/90 flex items-center justify-center p-4" onClick={() => setSelected(null)} role="presentation">
          {selected.type === "image" ? (
            <img src={selected.src} alt={selected.alt} className="max-w-full max-h-[90vh] object-contain" onClick={(e) => e.stopPropagation()} />
          ) : (
            <video
              src={selected.src}
              className="max-w-full max-h-[90vh]"
              controls
              autoPlay
              playsInline
              poster={selected.poster}
              onClick={(e) => e.stopPropagation()}
            />
          )}
          <button type="button" onClick={() => setSelected(null)} className="absolute top-6 right-6 text-cream text-2xl font-body hover:text-gold transition-colors" aria-label="Close">
            ✕
          </button>
        </div>
      )}
    </Layout>
  );
};

export default Gallery;
