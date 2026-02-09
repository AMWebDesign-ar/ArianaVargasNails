import { brand, whatsappLink, trackWhatsAppClick } from "@/config/brand";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { SiWhatsapp, SiInstagram } from "react-icons/si";
import { Clock, MessageCircle } from "lucide-react";

export default function Contact() {
  return (
    <section
      id="turnos"
      data-testid="section-turnos"
      className="py-20 sm:py-28 scroll-mt-20"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <p
            className="text-primary text-sm font-medium tracking-[0.15em] uppercase mb-3"
            data-testid="text-turnos-label"
          >
            Turnos
          </p>
          <h2
            className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold mb-4"
            data-testid="text-turnos-title"
          >
            Reservá tu turno
          </h2>
          <p
            className="text-muted-foreground max-w-lg mx-auto text-base sm:text-lg mb-10 leading-relaxed"
            data-testid="text-turnos-description"
          >
            Escribime por WhatsApp con el servicio que te interesa, el día y el
            horario que preferís.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsAppClick()}
              data-testid="button-contact-whatsapp"
            >
              <Button
                size="lg"
                className="gap-2 bg-[#25D366] text-white border-[#25D366]"
              >
                <SiWhatsapp className="w-5 h-5" />
                Reservar por WhatsApp
              </Button>
            </a>

            <a
              href={brand.instagram}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="button-contact-instagram"
            >
              <Button size="lg" variant="outline" className="gap-2">
                <SiInstagram className="w-5 h-5" />
                Instagram
              </Button>
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
            <div className="flex items-center gap-3 justify-center sm:justify-start text-muted-foreground">
              <MessageCircle className="w-4 h-4 text-primary shrink-0" />
              <span className="text-sm" data-testid="text-turnos-instructions">
                Servicio + día + horario
              </span>
            </div>
            <div className="flex items-center gap-3 justify-center sm:justify-start text-muted-foreground">
              <Clock className="w-4 h-4 text-primary shrink-0" />
              <span className="text-sm" data-testid="text-turnos-hours">
                {brand.hours}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
