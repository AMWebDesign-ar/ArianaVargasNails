// src/config/gallery.ts

export type GalleryItem = {
  src: string;
  alt: string;
};

export const GALLERY: GalleryItem[] = Array.from({ length: 12 }).map(
  (_, i) => ({
    // Placeholders: reemplazar por /gallery/01.jpg, /gallery/02.jpg, etc.
    src: `https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80&sig=${i + 1}`,
    alt: `Trabajo de uñas ${i + 1} - Ariana Vargas Nails`,
  }),
);
