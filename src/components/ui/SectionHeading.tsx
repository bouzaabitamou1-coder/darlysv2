import { motion } from "framer-motion";

interface SectionHeadingProps {
  subtitle?: string;
  title: string;
  description?: string;
  light?: boolean;
  align?: "center" | "left";
}

const SectionHeading = ({ subtitle, title, description, light, align = "center" }: SectionHeadingProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.6 }}
    className={`mb-12 lg:mb-16 ${align === "center" ? "text-center" : "text-left"}`}
  >
    {subtitle && (
      <span className={`text-sm tracking-[0.3em] uppercase font-body block mb-3 ${light ? "text-gold-light" : "text-gold"}`}>
        {subtitle}
      </span>
    )}
    <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-display font-bold leading-tight ${light ? "text-cream" : "text-charcoal"}`}>
      {title}
    </h2>
    {align === "center" && (
      <div className="star-separator">
        <span className="text-gold text-sm">✦</span>
      </div>
    )}
    {description && (
      <p className={`mt-6 max-w-2xl text-base leading-relaxed font-body ${align === "center" ? "mx-auto" : ""} ${light ? "text-cream/70" : "text-muted-foreground"}`}>
        {description}
      </p>
    )}
  </motion.div>
);

export default SectionHeading;
