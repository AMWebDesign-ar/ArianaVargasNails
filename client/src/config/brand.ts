// src/config/brand.ts

export const BRAND = {
  name: "Ariana Vargas Nails",
  city: "Mar del Plata",
  area: "Zona Aldrey",
  instagram: "https://www.instagram.com/arianavargasnails/",
  whatsappNumber: "WHATSAPP_NUMBER", // ej: 549223XXXXXXX
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Zona+Aldrey+Mar+del+Plata",
  developerCredit: {
    enabled: true,
    text: "Sitio desarrollado por AM Web Studio",
    url: "https://www.instagram.com/am.webstudio/", // cambiá si querés
  },
};

export const buildWhatsAppMessage = (service?: string) => {
  const svc = service?.trim() ? service.trim() : "___";
  return `Hola Ari 💅 Quisiera reservar un turno. Servicio: ${svc}. Día preferido: ___. Horario: ___. Gracias ✨`;
};

export const whatsappLink = (service?: string) => {
  const phone = BRAND.whatsappNumber.replace(/\D/g, "");
  const text = buildWhatsAppMessage(service);
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
};
