export type ServiceItem = {
  id: string;
  name: string;
  duration: number;
  description?: string;
};

export const services: ServiceItem[] = [
  {
    id: "nivelacion-semi-permanente",
    name: "Nivelación / Semi-Permanente",
    duration: 50,
    description: "Servicio de 50 minutos",
  },
  {
    id: "esculpida",
    name: "Esculpida",
    duration: 90,
    description: "Servicio de 90 minutos",
  },
  {
    id: "capping-poligel",
    name: "Capping / Poligel",
    duration: 75,
    description: "Servicio de 75 minutos",
  },
  {
    id: "pedicuria-semi-permanente",
    name: "Pedicuría c/Semi-Permanente",
    duration: 90,
    description: "Servicio de 90 minutos",
  },
  {
    id: "belleza-semi-permanente",
    name: "Belleza y Semi-Permanente",
    duration: 45,
    description: "Servicio de 45 minutos",
  },
];