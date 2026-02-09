import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

type GalleryItem = {
  src: string;
  alt: string;
};

const galleryImages: GalleryItem[] = [
  { src: "/gallery/gallery-1.png", alt: "Trabajo de uñas 1 - Ariana Vargas Nails" },
  { src: "/gallery/gallery-2.png", alt: "Trabajo de uñas 2 - Ariana Vargas Nails" },
  { src: "/gallery/gallery-3.png", alt: "Trabajo de uñas 3 - Ariana Vargas Nails" },
  { src: "/gallery/gallery-4.png", alt: "Trabajo de uñas 4 - Ariana Vargas Nails" },
  { src: "/gallery/gallery-5.png", alt: "Trabajo de uñas 5 - Ariana Vargas Nails" },
  { src: "/gallery/gallery-6.png", alt: "Trabajo de uñas 6 - Ariana Vargas Nails" },
  { src: "/gallery/gallery-7.png", alt: "Trabajo de uñas 7 - Ariana Vargas Nails" },
  { src: "/gallery/gallery-8.png", alt: "Trabajo de uñas 8 - Ariana Vargas Nails" },
  { src: "/gallery/gallery-9.png", alt: "Trabajo de uñas 9 - Ariana Vargas Nails" },
];

export default function Gallery() {
  const [selected, setSelected] = useState<GalleryItem | null>(null);

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
            Nuestros trabajos
          </h2>
          <p
            className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg leading-relaxed"
            data-testid="text-galeria-description"
          >
            Cada diseño es único. Mirá algunos de nuestros trabajos más recientes.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {galleryImages.map((item, i) => (
            <motion.button
              key={item.src}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              onClick={() => setSelected(item)}
              className="relative aspect-square rounded-md overflow-hidden group cursor-pointer"
              data-testid={`button-gallery-${i}`}
            >
              <img
                src={item.src}
                alt={item.alt}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelected(null)}
            data-testid="gallery-lightbox"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative max-w-3xl max-h-[85vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selected.src}
                alt={selected.alt}
                className="w-full h-full object-contain rounded-md"
              />
              <button
                onClick={() => setSelected(null)}
                className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center transition-colors hover:bg-black/70"
                aria-label="Cerrar"
                data-testid="button-lightbox-close"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
