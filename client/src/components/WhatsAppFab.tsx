import { whatsappLink, trackWhatsAppClick } from "@/config/brand";
import { SiWhatsapp } from "react-icons/si";
import { motion } from "framer-motion";

export default function WhatsAppFab() {
  return (
    <motion.a
      href={whatsappLink()}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackWhatsAppClick()}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1.5, type: "spring", stiffness: 200, damping: 15 }}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg transition-shadow duration-200"
      aria-label="Reservar por WhatsApp"
      data-testid="button-whatsapp-fab"
    >
      <SiWhatsapp className="w-7 h-7" />
    </motion.a>
  );
}
