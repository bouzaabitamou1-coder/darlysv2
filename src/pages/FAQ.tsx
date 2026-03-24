import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Layout from "@/components/layout/Layout";
import SectionHeading from "@/components/ui/SectionHeading";

const faqs = [
  {
    q: "How do I get to Dar Lys from the airport?",
    a: "Fès-Saïss Airport is approximately 15 km from the riad. We can arrange private airport transfers for €25 per way. Alternatively, you can take a taxi to the medina entrance (Bab Boujloud or Bab Rcif), where our team will meet you and guide you to the riad.",
  },
  {
    q: "What is your cancellation policy?",
    a: "Free cancellation up to 7 days before check-in. Cancellations within 7 days are charged 50% of the first night. No-shows are charged the full first night. Special offers and packages may have different terms.",
  },
  {
    q: "Is breakfast included?",
    a: "Yes, a traditional Moroccan breakfast is included with all room bookings. It features freshly baked bread, msemen, baghrir, honey, olive oil, fresh orange juice, seasonal fruit, and Moroccan mint tea or coffee.",
  },
  {
    q: "Do you accommodate dietary restrictions?",
    a: "Absolutely. Our chef can prepare vegetarian, vegan, gluten-free, and halal options. Please inform us of any dietary requirements at least 24 hours in advance.",
  },
  {
    q: "Can I book the riad for a private event?",
    a: "Yes, Dar Lys can be privatized for weddings, celebrations, or corporate retreats. We accommodate up to 30 guests for a seated dinner. Contact us for a personalized quote.",
  },
  {
    q: "Is the riad suitable for families with children?",
    a: "Yes, families are welcome. We can arrange extra beds and cribs. However, please note the riad has an open courtyard with a fountain — children should be supervised at all times.",
  },
  {
    q: "Do you offer cooking classes?",
    a: "Yes! Our chef leads interactive Moroccan cooking classes where you'll visit the local souk to select fresh ingredients and then prepare a traditional three-course meal. Classes are available daily at 10:00 and must be booked at least 24 hours in advance (€60 per person).",
  },
  {
    q: "What languages does your staff speak?",
    a: "Our team speaks Arabic, French, and English. Some staff members also speak Spanish and Italian.",
  },
];

const FAQ = () => {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <Layout>
      <section className="section-padding bg-cream pt-32 lg:pt-40">
        <div className="container-luxury max-w-3xl">
          <SectionHeading subtitle="Help" title="Frequently Asked Questions" description="Find answers to common questions about staying at Dar Lys." />

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                className="border border-border bg-cream-dark"
              >
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                  aria-expanded={open === i}
                >
                  <span className="font-display font-semibold text-charcoal pr-4">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-gold shrink-0 transition-transform duration-300 ${open === i ? "rotate-180" : ""}`} />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${open === i ? "max-h-96 pb-5 px-5" : "max-h-0"}`}>
                  <p className="text-sm text-muted-foreground font-body leading-relaxed">{faq.a}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default FAQ;
