export type ServiceItem = {
  id: string;
  name: string;
  duration: number; // minutos
  price?: number;
  description?: string;
};

export const services: ServiceItem[] = [
  {
    id: "belleza-pies-semipermanente",
    name: "Belleza de Pies Semipermanente",
    duration: 75,
    description: "Servicio de 75 minutos.",
  },
  {
    id: "kapping-gel",
    name: "Kapping Gel",
    duration: 75,
    description: "Servicio de 75 minutos.",
  },
  {
    id: "soft-gel",
    name: "Soft Gel",
    duration: 120,
    description: "Servicio de 120 minutos.",
  },
];//