import { brand, whatsappLink, trackWhatsAppClick } from "@/config/brand";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { SiWhatsapp } from "react-icons/si";
import { ChevronDown } from "lucide-react";

export default function Hero() {
  const scrollToGallery = () => {
    const el = document.querySelector("#galeria");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      data-testid="section-hero"
      className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0 bg-[#1C1C1C]">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, hsl(0 22% 70% / 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, hsl(25 20% 82% / 0.2) 0%, transparent 50%), radial-gradient(circle at 60% 80%, hsl(0 22% 70% / 0.15) 0%, transparent 50%)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1C1C1C]/50 via-transparent to-[#1C1C1C]/80" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center py-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <p
            className="text-[#D6B6B6] text-sm sm:text-base font-medium tracking-[0.2em] uppercase mb-6"
            data-testid="text-hero-brand"
          >
            {brand.name}
          </p>

          <h1
            className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-[#FAFAFA] leading-[1.1] mb-6"
            data-testid="text-hero-title"
          >
            {brand.tagline}
          </h1>

          <p
            className="text-[#FAFAFA]/70 text-base sm:text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed"
            data-testid="text-hero-subtitle"
          >
            Atención en estudio · {brand.city} ({brand.area})
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsAppClick()}
              data-testid="button-hero-whatsapp"
            >
              <Button
                size="lg"
                className="gap-2 bg-[#25D366] text-white border-[#25D366]"
              >
                <SiWhatsapp className="w-5 h-5" />
                Reservar por WhatsApp
              </Button>
            </a>

            <Button
              size="lg"
              variant="outline"
              className="text-[#FAFAFA] border-[#FAFAFA]/20 bg-white/5 backdrop-blur-sm"
              onClick={scrollToGallery}
              data-testid="button-hero-gallery"
            >
              Ver trabajos
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <button
            onClick={() => {
              const el = document.querySelector("#servicios");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="text-[#FAFAFA]/40 transition-colors"
            aria-label="Scroll abajo"
            data-testid="button-scroll-down"
          >
            <ChevronDown className="w-6 h-6 animate-bounce" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
