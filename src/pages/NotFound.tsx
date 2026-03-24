import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";

const NotFound = () => (
  <Layout>
    <section className="min-h-[70vh] flex items-center justify-center bg-cream pt-24">
      <div className="text-center px-4">
        <h1 className="text-8xl font-display font-bold text-gold mb-4">404</h1>
        <h2 className="text-2xl font-display font-semibold text-charcoal mb-4">Page Not Found</h2>
        <p className="text-muted-foreground font-body mb-8 max-w-md mx-auto">
          The page you're looking for seems to have wandered into the medina. Let us guide you back.
        </p>
        <Link to="/" className="btn-luxury">Return Home</Link>
      </div>
    </section>
  </Layout>
);

export default NotFound;
