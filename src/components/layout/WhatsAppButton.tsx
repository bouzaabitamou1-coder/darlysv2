import { MessageCircle } from "lucide-react";

const WhatsAppButton = () => (
  <a
    href="https://wa.me/212535555555?text=Hello%2C%20I%20would%20like%20to%20inquire%20about%20Dar%20Lys"
    target="_blank"
    rel="noopener noreferrer"
    className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300"
    aria-label="Contact us on WhatsApp"
  >
    <MessageCircle className="w-6 h-6 text-white" />
  </a>
);

export default WhatsAppButton;
