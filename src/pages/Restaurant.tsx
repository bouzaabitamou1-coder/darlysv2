import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Clock, Star } from "lucide-react";
import Layout from "@/components/layout/Layout";
import SectionHeading from "@/components/ui/SectionHeading";
import restaurantImg from "@/assets/restaurant.jpg";
import galleryTea from "@/assets/gallery-tea.jpg";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.7 },
};

const menuSections = [
  {
    title: "Starters",
    items: [
      { name: "Moroccan Briouats", desc: "Crispy filo pastries filled with spiced lamb and fresh herbs", price: "12" },
      { name: "Zaalouk Salad", desc: "Smoky eggplant and tomato salad with cumin and olive oil", price: "10" },
      { name: "Harira Soup", desc: "Traditional lentil and chickpea soup with saffron and coriander", price: "9" },
    ],
  },
  {
    title: "Main Courses",
    items: [
      { name: "Lamb Tagine", desc: "Slow-cooked lamb with prunes, almonds, and Ras el Hanout", price: "28" },
      { name: "Chicken Pastilla", desc: "Sweet and savory pie with shredded chicken, almonds, and cinnamon", price: "24" },
      { name: "Royal Couscous", desc: "Seven-vegetable couscous with tender lamb and merguez sausage", price: "26" },
      { name: "Grilled Sea Bass", desc: "Fresh fish with chermoula marinade and roasted vegetables", price: "30" },
    ],
  },
  {
    title: "Desserts",
    items: [
      { name: "Pastilla au Lait", desc: "Milk pastilla with orange blossom cream and toasted almonds", price: "12" },
      { name: "Moroccan Mint Tea", desc: "Traditional gunpowder green tea with fresh spearmint", price: "6" },
      { name: "Cornes de Gazelle", desc: "Almond-filled crescent pastries with orange blossom water", price: "10" },
    ],
  },
];

const Restaurant = () => (
  <Layout>
    <section className="relative h-[50vh] min-h-[350px] flex items-center justify-center overflow-hidden">
      <img src={restaurantImg} alt="Rooftop restaurant" className="absolute inset-0 w-full h-full object-cover" width={1024} height={1024} />
      <div className="overlay-dark" />
      <div className="relative z-10 text-center px-4">
        <p className="text-gold-light text-sm tracking-[0.4em] uppercase font-body mb-4">Gastronomy</p>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-cream">Restaurant & Bar</h1>
      </div>
    </section>

    <section className="section-padding bg-cream">
      <div className="container-luxury">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-20">
          <motion.div {...fadeUp}>
            <span className="text-sm tracking-[0.3em] uppercase font-body text-gold block mb-3">Culinary Journey</span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-charcoal leading-tight mb-6">A Feast for the Senses</h2>
            <div className="moroccan-divider !mx-0 mb-6" />
            <p className="text-muted-foreground leading-relaxed mb-4 font-body">
              Our rooftop restaurant offers an unforgettable dining experience under the stars of Fès. Chef Fatima crafts each dish using locally sourced ingredients and recipes passed down through generations.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6 font-body">
              From fragrant tagines simmered for hours to delicate pastries made fresh each morning, every meal at Dar Lys is a celebration of Moroccan culinary heritage.
            </p>
            <div className="flex items-center gap-6 text-sm text-charcoal-light font-body">
              <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-gold" /> Breakfast: 7:30 – 10:30</div>
              <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-gold" /> Dinner: 19:00 – 22:00</div>
            </div>
          </motion.div>
          <motion.div {...fadeUp} transition={{ delay: 0.2, duration: 0.7 }}>
            <img src={galleryTea} alt="Moroccan tea service" className="w-full aspect-square object-cover" loading="lazy" width={1280} height={960} />
          </motion.div>
        </div>

        <SectionHeading subtitle="Our Menu" title="A Taste of Morocco" description="Seasonal ingredients, time-honored recipes, and the finest Moroccan flavors." />

        <div className="space-y-12 max-w-3xl mx-auto">
          {menuSections.map((section, i) => (
            <motion.div key={section.title} {...fadeUp} transition={{ delay: i * 0.1, duration: 0.6 }}>
              <h3 className="text-2xl font-display font-semibold text-charcoal mb-6 text-center">{section.title}</h3>
              <div className="space-y-6">
                {section.items.map((item) => (
                  <div key={item.name} className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h4 className="font-display font-semibold text-charcoal text-lg">{item.name}</h4>
                      <p className="text-sm text-muted-foreground font-body">{item.desc}</p>
                    </div>
                    <span className="text-gold font-display font-semibold text-lg shrink-0">€{item.price}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/contact" className="btn-luxury">Reserve a Table</Link>
        </div>
      </div>
    </section>
  </Layout>
);

export default Restaurant;
