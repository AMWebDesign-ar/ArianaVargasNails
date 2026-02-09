export const brand = {
  name: "Ariana Vargas Nails",
  tagline: "Uñas que hablan por vos",
  city: "Mar del Plata",
  area: "Zona Aldrey",
  hours: "Lunes a Sábado · 9 a 19 h",
  instagram: "https://www.instagram.com/arianavargasnails/",
  whatsappNumber: "WHATSAPP_NUMBER",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Zona+Aldrey+Mar+del+Plata",
  logo: {
    circle: "/brand/logo_circle_transparent.png",
    square: "/brand/logo_square_transparent.png",
  },
  developerCredit: {
    enabled: true,
    name: "AM Web Studio",
    text: "Sitio desarrollado por AM Web Studio",
    url: "https://www.instagram.com/am.webstudio/",
  },
};

export const trustPoints = [
  {
    title: "Productos profesionales",
    description:
      "Trabajamos con marcas de primera línea para garantizar durabilidad y cuidado de tus uñas.",
  },
  {
    title: "Higiene y esterilización",
    description:
      "Instrumentos esterilizados y descartables para cada clienta. Tu seguridad es prioridad.",
  },
  {
    title: "Atención personalizada",
    description:
      "Cada turno es exclusivo. Nos tomamos el tiempo para que salgas conforme con el resultado.",
  },
];

export const buildWhatsAppMessage = (service?: string) => {
  const svc = service?.trim() ? service.trim() : "___";
  return `Hola Ari! Quisiera reservar un turno. Servicio: ${svc}. Día preferido: ___. Horario: ___. Gracias!`;
};

export const whatsappLink = (service?: string) => {
  const phone = brand.whatsappNumber.replace(/\D/g, "");
  const text = buildWhatsAppMessage(service);
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
};

export const trackWhatsAppClick = (service?: string) => {
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", "whatsapp_click", {
      event_category: "conversion",
      event_label: service || "general",
    });
  }
};
