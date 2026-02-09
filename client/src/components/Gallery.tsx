import { useState } from "react";
import { galleryImages } from "@/config/brand";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Gallery() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const goNext = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % galleryImages.length);
    }
  };

  const goPrev = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex(
        (lightboxIndex - 1 + galleryImages.length) % galleryImages.length
      );
    }
  };

  return (
    <section
      id="galeria"
      data-testid="section-galeria"
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
            data-testid="text-galeria-label"
          >
            Galería
          </p>
          <h2
            className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold mb-4"
            data-testid="text-galeria-title"
          >
            Algunos trabajos realizados
          </h2>
          <p
            className="text-muted-foreground max-w-lg mx-auto text-base sm:text-lg"
            data-testid="text-galeria-description"
          >
            Cada diseño es único, pensado para vos.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {galleryImages.map((image, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              onClick={() => openLightbox(index)}
              className="relative aspect-square overflow-hidden rounded-md group cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
              data-testid={`button-gallery-${index}`}
            >
              <img
                src={image.src}
                alt={image.alt}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={closeLightbox}
            data-testid="lightbox-overlay"
          >
            <div
              className="relative max-w-3xl w-full max-h-[85vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                size="icon"
                variant="ghost"
                onClick={closeLightbox}
                className="absolute -top-12 right-0 text-white/70"
                data-testid="button-lightbox-close"
                aria-label="Cerrar"
              >
                <X className="w-6 h-6" />
              </Button>

              <Button
                size="icon"
                variant="ghost"
                onClick={goPrev}
                className="absolute left-2 sm:-left-14 text-white/70 z-10"
                data-testid="button-lightbox-prev"
                aria-label="Anterior"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>

              <motion.img
                key={lightboxIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                src={galleryImages[lightboxIndex].src}
                alt={galleryImages[lightboxIndex].alt}
                className="max-w-full max-h-[80vh] object-contain rounded-md"
                data-testid="img-lightbox"
              />

              <Button
                size="icon"
                variant="ghost"
                onClick={goNext}
                className="absolute right-2 sm:-right-14 text-white/70 z-10"
                data-testid="button-lightbox-next"
                aria-label="Siguiente"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>

              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex gap-1.5">
                {galleryImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setLightboxIndex(i)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i === lightboxIndex ? "bg-white" : "bg-white/30"
                    }`}
                    aria-label={`Imagen ${i + 1}`}
                    data-testid={`button-lightbox-dot-${i}`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
