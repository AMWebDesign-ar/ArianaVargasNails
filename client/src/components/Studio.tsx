import { brand, trustPoints } from "@/config/brand";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { MapPin, ShieldCheck, Gem, Heart } from "lucide-react";

const trustIcons = [ShieldCheck, Gem, Heart];

export default function Studio() {
  return (
    <section
      id="estudio"
      data-testid="section-estudio"
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
            data-testid="text-estudio-label"
          >
            Estudio
          </p>
          <h2
            className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold mb-4"
            data-testid="text-estudio-title"
          >
            Sobre el estudio
          </h2>
          <p
            className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg leading-relaxed"
            data-testid="text-estudio-description"
          >
            Atención en estudio en {brand.area}. Turnos con reserva previa.
            Para coordinar, escribime por WhatsApp.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
          >
            <Card className="p-6 sm:p-8 h-full flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-semibold">Ubicación</h3>
                  <p
                    className="text-muted-foreground text-sm"
                    data-testid="text-location"
                  >
                    {brand.city} – {brand.area}
                  </p>
                </div>
              </div>

              <p className="text-muted-foreground text-sm leading-relaxed flex-1">
                El estudio está ubicado en {brand.area}, una zona accesible y
                tranquila de {brand.city}. La dirección exacta se comparte al
                confirmar tu turno.
              </p>

              <a
                href={brand.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="button-como-llegar"
              >
                <Button variant="outline" className="w-full gap-2">
                  <MapPin className="w-4 h-4" />
                  Cómo llegar
                </Button>
              </a>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="p-6 sm:p-8 h-full">
              <h3 className="font-serif text-lg font-semibold mb-5">
                Nuestro compromiso
              </h3>

              <div className="flex flex-col gap-5">
                {trustPoints.map((point, i) => {
                  const Icon = trustIcons[i];
                  return (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p
                          className="font-medium text-sm mb-0.5"
                          data-testid={`text-trust-title-${i}`}
                        >
                          {point.title}
                        </p>
                        <p
                          className="text-muted-foreground text-sm leading-relaxed"
                          data-testid={`text-trust-desc-${i}`}
                        >
                          {point.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
