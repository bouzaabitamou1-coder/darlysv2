import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Users, Maximize2, Wifi, Wind, Coffee, Bath, Check } from "lucide-react";
import Layout from "@/components/layout/Layout";
import SectionHeading from "@/components/ui/SectionHeading";
import roomSuite from "@/assets/room-suite.jpg";
import roomDeluxe from "@/assets/room-deluxe.jpg";
import roomStandard from "@/assets/room-standard.jpg";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.7 },
};

const allRooms = [
  {
    id: "royal-suite",
    name: "Royal Suite",
    category: "Suite",
    price: 350,
    size: "65m²",
    guests: 2,
    image: roomSuite,
    description: "Our most prestigious accommodation features a private terrace with panoramic medina views, a sitting area with traditional Moroccan salon, and a marble bathroom with hammam-inspired shower.",
    amenities: ["King bed", "Private terrace", "Marble bathroom", "Air conditioning", "Free WiFi", "Breakfast included", "Bathrobes & slippers", "Mini bar", "Nespresso machine", "Room service"],
  },
  {
    id: "deluxe-room",
    name: "Deluxe Room",
    category: "Deluxe",
    price: 220,
    size: "40m²",
    guests: 2,
    image: roomDeluxe,
    description: "Spacious and elegantly appointed, our Deluxe Rooms feature hand-carved cedarwood ceilings, zellige tile accents, and views overlooking the courtyard or the medina rooftops.",
    amenities: ["Queen bed", "Courtyard view", "En-suite bathroom", "Air conditioning", "Free WiFi", "Breakfast included", "Bathrobes", "Safe box"],
  },
  {
    id: "standard-room",
    name: "Standard Room",
    category: "Standard",
    price: 150,
    size: "25m²",
    guests: 2,
    image: roomStandard,
    description: "Cozy and charming, our Standard Rooms offer all the essential comforts wrapped in authentic Moroccan decor with traditional textiles and artisanal details.",
    amenities: ["Double bed", "Garden view", "Private bathroom", "Air conditioning", "Free WiFi", "Breakfast included"],
  },
];

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
  const filtered = filter === "All" ? allRooms : allRooms.filter((r) => r.category === filter);

  return (
    <Layout>
      <section className="relative h-[50vh] min-h-[350px] flex items-center justify-center overflow-hidden">
        <img src={roomSuite} alt="Luxury suite" className="absolute inset-0 w-full h-full object-cover" width={1024} height={1024} />
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
                  <img src={room.image} alt={room.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" loading="lazy" width={1280} height={960} />
                </div>
                <div>
                  <h3 className="text-2xl sm:text-3xl font-display font-bold text-charcoal mb-2">{room.name}</h3>
                  <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground font-body">
                    <span className="flex items-center gap-1"><Maximize2 className="w-4 h-4" /> {room.size}</span>
                    <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {room.guests} Guests</span>
                  </div>
                  <div className="moroccan-divider !mx-0 mb-4" />
                  <p className="text-muted-foreground font-body leading-relaxed mb-6">{room.description}</p>
                  <div className="grid grid-cols-2 gap-2 mb-6">
                    {room.amenities.map((a) => {
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
                      <span className="text-2xl font-display font-bold text-gold">€{room.price}</span>
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
