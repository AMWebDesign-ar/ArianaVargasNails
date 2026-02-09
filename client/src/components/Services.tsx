import { whatsappLink, trackWhatsAppClick } from "@/config/brand";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { SiWhatsapp } from "react-icons/si";

type Service = {
  name: string;
  description: string;
};

const services: Service[] = [
  {
    name: "Esmaltado Semipermanente",
    description:
      "Esmaltado de larga duración con acabado prolijo y brillante, ideal para mantener las uñas impecables por más tiempo.",
  },
  {
    name: "Capping",
    description:
      "Refuerzo de la uña natural con gel para mayor resistencia y durabilidad, manteniendo un look natural y elegante.",
  },
  {
    name: "Nivelación",
    description:
      "Técnica que corrige irregularidades de la uña natural para lograr una superficie pareja y un resultado perfecto.",
  },
  {
    name: "Belleza de Pies con Semipermanente",
    description:
      "Tratamiento estético de pies con limado, cuidado de cutículas y esmaltado semipermanente.",
  },
  {
    name: "Pedicura con Semipermanente",
    description:
      "Servicio completo de pedicuría para el cuidado del pie, finalizado con esmaltado semipermanente.",
  },
];

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
            Nuestros servicios
          </h2>
          <p
            className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg leading-relaxed"
            data-testid="text-servicios-description"
          >
            Cada servicio incluye atención personalizada en un espacio cómodo y
            con los mejores productos profesionales.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service, i) => (
            <motion.div
              key={service.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <Card
                className="p-6 h-full flex flex-col gap-4"
                data-testid={`card-service-${i}`}
              >
                <h3 className="font-serif text-lg font-semibold">
                  {service.name}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed flex-1">
                  {service.description}
                </p>
                <a
                  href={whatsappLink(service.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackWhatsAppClick(service.name)}
                  data-testid={`button-service-reservar-${i}`}
                >
                  <Button variant="outline" className="w-full gap-2">
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
