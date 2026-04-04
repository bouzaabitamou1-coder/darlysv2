import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Users, Maximize2, Wifi, Wind, Coffee, Bath, Check } from "lucide-react";
import Layout from "@/components/layout/Layout";
import SectionHeading from "@/components/ui/SectionHeading";
import { supabase } from "@/integrations/supabase/client";
import roomHeroBanner from "@/assets/room-hero-banner.jpg";
import roomClassique from "@/assets/room-classique.jpg";
import roomDeluxe from "@/assets/room-deluxe.jpg";
import roomSuperieure from "@/assets/room-superieure.jpg";
import roomFamily from "@/assets/room-family.jpg";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.7 },
};

const imageMap: Record<string, string> = {
  "royal-suite": roomSuperieure,
  "deluxe-room": roomDeluxe,
  "standard-room": roomClassique,
  "la-classique": roomClassique,
  "la-deluxe": roomDeluxe,
  "la-superieure": roomSuperieure,
  "la-lys-family": roomFamily,
};

const categories = ["All", "Suite", "Deluxe", "Standard"];

const amenityIcons: Record<string, typeof Wifi> = {
  "Free WiFi": Wifi,
  "Air conditioning": Wind,
  "Breakfast included": Coffee,
  "Marble bathroom": Bath,
  "En-suite bathroom": Bath,
  "Private bathroom": Bath,
};

const Rooms = () => {
  const [filter, setFilter] = useState("All");
  const [rooms, setRooms] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("rooms").select("*").eq("is_available", true).order("price_per_night", { ascending: false }).then(({ data }) => {
      if (data) setRooms(data);
    });
  }, []);

  const filtered = filter === "All" ? rooms : rooms.filter((r) => r.category === filter);

  return (
    <Layout>
      <section className="relative h-[50vh] min-h-[350px] flex items-center justify-center overflow-hidden">
        <img src={roomHeroBanner} alt="Luxury suite" className="absolute inset-0 w-full h-full object-cover" width={1024} height={1024} />
        <div className="overlay-dark" />
        <div className="relative z-10 text-center px-4">
          <p className="text-gold-light text-sm tracking-[0.4em] uppercase font-body mb-4">Accommodations</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-cream">Rooms & Suites</h1>
        </div>
      </section>

      <section className="section-padding bg-cream">
        <div className="container-luxury">
          <SectionHeading subtitle="Your Sanctuary" title="Find Your Perfect Room" description="Each of our rooms has been individually designed, blending traditional Moroccan artistry with modern luxury." />

          <div className="flex justify-center gap-3 mb-12">
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

          <div className="space-y-16">
            {filtered.map((room, i) => (
              <motion.div key={room.id} {...fadeUp} transition={{ delay: i * 0.1, duration: 0.7 }} className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                <div className={`overflow-hidden aspect-[4/3] ${i % 2 === 1 ? "lg:order-2" : ""}`}>
                  <img src={imageMap[room.slug] || roomDeluxe} alt={room.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" loading="lazy" width={1280} height={960} />
                </div>
                <div>
                  <h3 className="text-2xl sm:text-3xl font-display font-bold text-charcoal mb-2">{room.name}</h3>
                  <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground font-body">
                    <span className="flex items-center gap-1"><Maximize2 className="w-4 h-4" /> {room.size}</span>
                    <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {room.max_guests} Guests</span>
                  </div>
                  <div className="moroccan-divider !mx-0 mb-4" />
                  <p className="text-muted-foreground font-body leading-relaxed mb-6">{room.description}</p>
                  <div className="grid grid-cols-2 gap-2 mb-6">
                    {(room.amenities || []).map((a: string) => {
                      const Icon = amenityIcons[a] || Check;
                      return (
                        <div key={a} className="flex items-center gap-2 text-sm text-charcoal-light font-body">
                          <Icon className="w-4 h-4 text-gold shrink-0" /> {a}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-muted-foreground font-body">From </span>
                      <span className="text-2xl font-display font-bold text-gold">€{room.price_per_night}</span>
                      <span className="text-sm text-muted-foreground font-body"> / night</span>
                    </div>
                    <Link to={`/booking?room=${room.id}`} className="btn-luxury text-xs">Book Now</Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Rooms;
