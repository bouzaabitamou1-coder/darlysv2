import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import ConciergeChat from "@/components/ConciergeChat";

const Layout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-1">{children}</main>
    <Footer />
    <ConciergeChat />
  </div>
);

export default Layout;
