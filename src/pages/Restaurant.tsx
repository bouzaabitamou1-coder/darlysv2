import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Clock, Star } from "lucide-react";
import Layout from "@/components/layout/Layout";
import SectionHeading from "@/components/ui/SectionHeading";
import restaurantHero from "@/assets/restaurant-hero.jpg";
import restaurantZahra from "@/assets/restaurant-zahra.jpg";
import restaurantPatio from "@/assets/restaurant-patio.jpg";
import restaurantBar from "@/assets/restaurant-bar.jpg";
import galleryBar from "@/assets/gallery-bar.jpg";

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
      <img src={restaurantHero} alt="Le Syl Bar at Dar Lys" className="absolute inset-0 w-full h-full object-cover" width={1024} height={1024} />
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
            <span className="text-sm tracking-[0.3em] uppercase font-body text-gold block mb-3">Restaurant Zahra</span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-charcoal leading-tight mb-6">A Feast for the Senses</h2>
            <div className="moroccan-divider !mx-0 mb-6" />
            <p className="text-muted-foreground leading-relaxed mb-4 font-body">
              Decorated in rich burgundy tones, adorned with chandeliers and oriental art, Restaurant Zahra offers authentic cuisine in an exclusive and intimate atmosphere.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6 font-body">
              Dinner is a gourmet parenthesis; a journey through the classics of Fès cuisine, celebrated for its refinement and flavors.
            </p>
            <div className="space-y-2 text-sm text-charcoal-light font-body">
              <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-gold" /> Breakfast: 7:00 – 11:00</div>
              <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-gold" /> Lunch: 12:00 – 15:00</div>
              <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-gold" /> Dinner: 19:00 – 00:00</div>
            </div>
          </motion.div>
          <motion.div {...fadeUp} transition={{ delay: 0.2, duration: 0.7 }}>
            <img src={restaurantZahra} alt="Restaurant Zahra interior" className="w-full aspect-square object-cover" loading="lazy" width={1280} height={960} />
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-20">
          <motion.div {...fadeUp} transition={{ delay: 0.2, duration: 0.7 }} className="lg:order-1">
            <img src={restaurantPatio} alt="Le Patio dining" className="w-full aspect-square object-cover" loading="lazy" width={1280} height={960} />
          </motion.div>
          <motion.div {...fadeUp} className="lg:order-2">
            <span className="text-sm tracking-[0.3em] uppercase font-body text-gold block mb-3">Le Patio</span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-charcoal leading-tight mb-6">Dining in the Courtyard</h2>
            <div className="moroccan-divider !mx-0 mb-6" />
            <p className="text-muted-foreground leading-relaxed mb-4 font-body">
              Served in the lounge or in the central patio, breakfast highlights fresh and seasonal products. Local recipes blend with classic morning delights for maximum vitamins and energy.
            </p>
            <p className="text-muted-foreground leading-relaxed font-body">
              Salads, bowls, grills, and planchas are served at lunch in the patio or on the panoramic terrace.
            </p>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-20">
          <motion.div {...fadeUp}>
            <span className="text-sm tracking-[0.3em] uppercase font-body text-gold block mb-3">Le Syl Bar</span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-charcoal leading-tight mb-6">Natural Living</h2>
            <div className="moroccan-divider !mx-0 mb-6" />
            <p className="text-muted-foreground leading-relaxed font-body">
              Dar Lys introduces you to natural living, alcohol-free! Le Syl Bar welcomes you in a cozy and warm atmosphere with a selection of natural juices, fruit and vegetable mocktails, teas and infusions, coffees to delight body and spirit.
            </p>
          </motion.div>
          <motion.div {...fadeUp} transition={{ delay: 0.2, duration: 0.7 }}>
            <img src={restaurantBar} alt="Le Syl Bar" className="w-full aspect-square object-cover" loading="lazy" width={1280} height={960} />
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
