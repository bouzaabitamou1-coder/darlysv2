import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Clock } from "lucide-react";
import Layout from "@/components/layout/Layout";
import SectionHeading from "@/components/ui/SectionHeading";
import restaurantHero from "@/assets/restaurant-hero.jpg";
import restaurantZahra from "@/assets/restaurant-zahra.jpg";
import restaurantPatio from "@/assets/restaurant-patio.jpg";
import restaurantBar from "@/assets/restaurant-bar.jpg";
import foodBriouats from "@/assets/food-briouats.jpg";
import foodTagine from "@/assets/food-tagine.jpg";
import foodCouscous from "@/assets/food-couscous.jpg";
import foodPastilla from "@/assets/food-pastilla.jpg";
import foodHarira from "@/assets/food-harira.jpg";
import foodTea from "@/assets/food-tea.jpg";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.7 },
};

const menuSections = [
  {
    title: "Entrées",
    titleAr: "المقبلات",
    items: [
      { name: "Briouats Marocains", desc: "Croustillants à base de feuille de brick farcis d'agneau épicé et herbes fraîches", price: "120 MAD", image: foodBriouats },
      { name: "Salade Zaalouk", desc: "Salade d'aubergines fumées et tomates au cumin et huile d'olive", price: "90 MAD" },
      { name: "Harira", desc: "Soupe traditionnelle de lentilles et pois chiches au safran et coriandre", price: "80 MAD", image: foodHarira },
    ],
  },
  {
    title: "Plats Principaux",
    titleAr: "الأطباق الرئيسية",
    items: [
      { name: "Tagine d'Agneau", desc: "Agneau mijoté lentement avec pruneaux, amandes et Ras el Hanout", price: "220 MAD", image: foodTagine },
      { name: "Pastilla au Poulet", desc: "Tourte sucrée-salée au poulet effiloché, amandes et cannelle", price: "180 MAD", image: foodPastilla },
      { name: "Couscous Royal", desc: "Couscous aux sept légumes avec agneau tendre et merguez", price: "200 MAD", image: foodCouscous },
      { name: "Bar Grillé", desc: "Poisson frais en marinade chermoula avec légumes rôtis", price: "240 MAD" },
    ],
  },
  {
    title: "Desserts & Thé",
    titleAr: "الحلويات والشاي",
    items: [
      { name: "Pastilla au Lait", desc: "Pastilla au lait à la crème de fleur d'oranger et amandes grillées", price: "100 MAD" },
      { name: "Thé à la Menthe", desc: "Thé vert à la poudre de canon avec menthe verte fraîche", price: "50 MAD", image: foodTea },
      { name: "Cornes de Gazelle", desc: "Pâtisseries en forme de croissant fourrées aux amandes et eau de fleur d'oranger", price: "80 MAD" },
    ],
  },
];

const Restaurant = () => (
  <Layout>
    <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden">
      <img src={restaurantHero} alt="Le Syl Bar at Dar Lys" className="absolute inset-0 w-full h-full object-cover" width={1024} height={1024} />
      <div className="overlay-warm" />
      <div className="relative z-10 text-center px-4">
        <p className="text-gold-light text-sm tracking-[0.4em] uppercase font-body mb-4">Gastronomie</p>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-cream mb-3">Restaurant & Bar</h1>
        <p className="text-arabic text-cream/60 text-xl">مطعم وبار</p>
      </div>
    </section>

    {/* Restaurant Zahra */}
    <section className="section-padding bg-cream zellige-pattern">
      <div className="container-luxury">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-20">
          <motion.div {...fadeUp}>
            <span className="text-sm tracking-[0.3em] uppercase font-body text-gold block mb-3">Restaurant Zahra</span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-charcoal leading-tight mb-2">Un Festin pour les Sens</h2>
            <p className="text-arabic text-muted-foreground text-lg mb-4">وليمة للحواس</p>
            <div className="moroccan-divider !mx-0 mb-6" />
            <p className="text-muted-foreground leading-relaxed mb-4 font-body">
              Décoré dans de riches tons bordeaux, orné de lustres et d'œuvres d'art orientales, le Restaurant Zahra offre une cuisine authentique dans une ambiance exclusive et intimiste.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6 font-body">
              Le dîner est une parenthèse de gourmandise — un voyage autour des classiques de la cuisine de Fès, célèbre pour son raffinement et ses saveurs.
            </p>
            <div className="space-y-2 text-sm text-charcoal-light font-body">
              <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-gold" /> Petit-déjeuner : 7h00 – 11h00</div>
              <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-gold" /> Déjeuner : 12h00 – 15h00</div>
              <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-gold" /> Dîner : 19h00 – 00h00</div>
            </div>
          </motion.div>
          <motion.div {...fadeUp} transition={{ delay: 0.2, duration: 0.7 }}>
            <div className="moroccan-arch">
              <img src={restaurantZahra} alt="Restaurant Zahra" className="w-full aspect-[4/5] object-cover" loading="lazy" width={1280} height={960} />
            </div>
          </motion.div>
        </div>

        {/* Le Patio */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-20">
          <motion.div {...fadeUp} transition={{ delay: 0.2, duration: 0.7 }} className="lg:order-1">
            <div className="moroccan-arch">
              <img src={restaurantPatio} alt="Le Patio" className="w-full aspect-[4/5] object-cover" loading="lazy" width={1280} height={960} />
            </div>
          </motion.div>
          <motion.div {...fadeUp} className="lg:order-2">
            <span className="text-sm tracking-[0.3em] uppercase font-body text-gold block mb-3">Le Patio</span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-charcoal leading-tight mb-6">Dîner au Cœur du Riad</h2>
            <div className="moroccan-divider !mx-0 mb-6" />
            <p className="text-muted-foreground leading-relaxed mb-4 font-body">
              Servi dans le salon ou dans le patio central, le petit-déjeuner met en avant les produits frais et de saison. Des recettes locales se marient aux délices classiques du matin.
            </p>
            <p className="text-muted-foreground leading-relaxed font-body">
              Salades et bowls, grillades et planchas s'invitent au déjeuner au patio ou sur la terrasse panoramique.
            </p>
          </motion.div>
        </div>

        {/* Le Syl Bar */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div {...fadeUp}>
            <span className="text-sm tracking-[0.3em] uppercase font-body text-gold block mb-3">Le Syl Bar</span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-charcoal leading-tight mb-6">La Vie au Naturel</h2>
            <div className="moroccan-divider !mx-0 mb-6" />
            <p className="text-muted-foreground leading-relaxed font-body">
              Dar Lys vous fait découvrir la vie au naturel, sans alcool ! Le Syl Bar vous invite dans une ambiance cosy et chaleureuse et vous offre une sélection de jus naturels, de mocktails, de thés et infusions.
            </p>
          </motion.div>
          <motion.div {...fadeUp} transition={{ delay: 0.2, duration: 0.7 }}>
            <div className="moroccan-arch">
              <img src={restaurantBar} alt="Le Syl Bar" className="w-full aspect-[4/5] object-cover" loading="lazy" width={1280} height={960} />
            </div>
          </motion.div>
        </div>
      </div>
    </section>

    {/* Menu with food images */}
    <section className="section-padding bg-charcoal relative">
      <div className="absolute inset-0 opacity-5 zellige-pattern" />
      <div className="container-luxury relative z-10">
        <SectionHeading subtitle="Notre Carte" title="Saveurs du Maroc" description="Ingrédients de saison, recettes ancestrales et les plus belles saveurs marocaines." light />

        <div className="space-y-16 max-w-5xl mx-auto">
          {menuSections.map((section, i) => (
            <motion.div key={section.title} {...fadeUp} transition={{ delay: i * 0.1, duration: 0.6 }}>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-display font-semibold text-gold mb-1">{section.title}</h3>
                <p className="text-arabic text-cream/40 text-lg">{section.titleAr}</p>
              </div>
              <div className="arabesque-border py-8 space-y-8">
                {section.items.map((item) => (
                  <div key={item.name} className={`flex gap-6 items-start ${item.image ? "flex-col sm:flex-row" : ""}`}>
                    {item.image && (
                      <div className="w-full sm:w-32 h-24 sm:h-24 shrink-0 overflow-hidden rounded-sm">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" width={800} height={600} />
                      </div>
                    )}
                    <div className="flex-1 flex justify-between items-start gap-4">
                      <div>
                        <h4 className="font-display font-semibold text-cream text-lg">{item.name}</h4>
                        <p className="text-sm text-cream/50 font-body mt-1">{item.desc}</p>
                      </div>
                      <span className="text-gold font-display font-semibold text-lg shrink-0 whitespace-nowrap">{item.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/contact" className="btn-outline-luxury border-gold/50 text-gold hover:bg-gold hover:text-cream">
            Réserver une Table
          </Link>
        </div>
      </div>
    </section>
  </Layout>
);

export default Restaurant;
