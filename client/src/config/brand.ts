export const brand = {
  name: "Ariana Vargas Nails",
  tagline: "Uñas impecables, prolijas y duraderas",
  city: "Mar del Plata",
  area: "Zona Aldrey",
  instagram: "https://www.instagram.com/arianavargasnails/",
  instagramHandle: "@arianavargasnails",
  whatsappNumber: "5492231234567",
  mapsUrl: "https://maps.google.com/?q=Zona+Aldrey,+Mar+del+Plata",
  logo: {
    circle: "/brand/logo_circle_transparent.png",
    square: "/brand/logo_square_transparent.png",
    favicon: "/brand/favicon.ico",
    og: "/brand/og_1200x630.png",
  },
  hours: "Consultá disponibilidad por WhatsApp",
  developerCredit: {
    enabled: true,
    name: "AM Web Studio",
    url: "#",
  },
};

export function whatsappLink(service?: string): string {
  const baseMessage = service
    ? `Hola Ari! Quisiera reservar un turno. Servicio: ${service}. Día preferido: ___. Horario: ___. Gracias!`
    : `Hola Ari! Quisiera reservar un turno. Día preferido: ___. Horario: ___. Gracias!`;
  const encoded = encodeURIComponent(baseMessage);
  return `https://wa.me/${brand.whatsappNumber}?text=${encoded}`;
}

export function trackWhatsAppClick(service?: string) {
  if (typeof window !== "undefined" && (window as any).dataLayer) {
    (window as any).dataLayer.push({
      event: "whatsapp_click",
      service: service || "general",
    });
  }
}

export const services = [
  {
    id: "esmaltado-semipermanente",
    name: "Esmaltado Semipermanente",
    description:
      "Color perfecto y duradero que mantiene tus uñas impecables por semanas. Amplia variedad de tonos para cada estilo y ocasión.",
    badge: "Consultá duración",
  },
  {
    id: "capping",
    name: "Capping",
    description:
      "Capa protectora que fortalece y alarga la vida de tus uñas naturales. Ideal para quienes buscan resistencia sin perder naturalidad.",
    badge: "Consultá duración",
  },
  {
    id: "nivelacion",
    name: "Nivelación",
    description:
      "Técnica profesional para corregir imperfecciones y lograr una superficie lisa y uniforme. Resultado prolijo y natural.",
    badge: "Consultá duración",
  },
  {
    id: "belleza-pies",
    name: "Belleza de Pies con Semipermanente",
    description:
      "Cuidado completo para tus pies con acabado en semipermanente. Hidratación, prolijidad y color que dura.",
    badge: "Consultá duración",
  },
  {
    id: "pedicura",
    name: "Pedicura con Semipermanente",
    description:
      "Pedicura profesional con esmaltado semipermanente de larga duración. Pies cuidados y prolijos por mucho más tiempo.",
    badge: "Consultá duración",
  },
];

export const galleryImages = [
  { src: "/gallery/gallery-1.png", alt: "Esmaltado semipermanente rosa" },
  { src: "/gallery/gallery-2.png", alt: "Manicura francesa elegante" },
  { src: "/gallery/gallery-3.png", alt: "Diseño nude con glitter" },
  { src: "/gallery/gallery-4.png", alt: "Pedicura con esmaltado rosado" },
  { src: "/gallery/gallery-5.png", alt: "Diseño minimalista mate" },
  { src: "/gallery/gallery-6.png", alt: "Extensiones gel almendra" },
  { src: "/gallery/gallery-7.png", alt: "Manicura mauve con flores" },
  { src: "/gallery/gallery-8.png", alt: "Diseño efecto mármol" },
  { src: "/gallery/gallery-9.png", alt: "Uñas naturales con brillo" },
];

export const trustPoints = [
  {
    title: "Higiene y prolijidad",
    description: "Protocolos estrictos de esterilización en cada turno.",
  },
  {
    title: "Materiales de calidad",
    description: "Productos premium para resultados duraderos y saludables.",
  },
  {
    title: "Atención personalizada",
    description: "Cada turno es exclusivo, con tiempo y dedicación para vos.",
  },
];
