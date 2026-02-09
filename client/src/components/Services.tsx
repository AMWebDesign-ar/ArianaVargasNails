import { services, whatsappLink, trackWhatsAppClick } from "@/config/brand";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { SiWhatsapp } from "react-icons/si";
import { Sparkles } from "lucide-react";

export default function Services() {
  return (
    <section
      id="servicios"
      data-testid="section-servicios"
      className="py-20 sm:py-28 scroll-mt-20"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p
            className="text-primary text-sm font-medium tracking-[0.15em] uppercase mb-3"
            data-testid="text-servicios-label"
          >
            Servicios
          </p>
          <h2
            className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold mb-4"
            data-testid="text-servicios-title"
          >
            Lo que ofrecemos
          </h2>
          <p
            className="text-muted-foreground max-w-lg mx-auto text-base sm:text-lg"
            data-testid="text-servicios-description"
          >
            Cada servicio incluye atención personalizada y materiales de primera calidad.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((service, i) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <Card className="p-6 h-full flex flex-col gap-4 group" data-testid={`card-service-${service.id}`}>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary shrink-0" />
                    <h3
                      className="font-serif text-lg font-semibold"
                      data-testid={`text-service-name-${service.id}`}
                    >
                      {service.name}
                    </h3>
                  </div>
                  {service.badge && (
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {service.badge}
                    </Badge>
                  )}
                </div>

                <p
                  className="text-muted-foreground text-sm leading-relaxed flex-1"
                  data-testid={`text-service-desc-${service.id}`}
                >
                  {service.description}
                </p>

                <a
                  href={whatsappLink(service.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackWhatsAppClick(service.name)}
                  data-testid={`button-reservar-${service.id}`}
                >
                  <Button variant="outline" className="w-full gap-2 mt-auto">
                    <SiWhatsapp className="w-4 h-4" />
                    Reservar
                  </Button>
                </a>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
