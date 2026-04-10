import type { Express, Request, Response } from "express";
import type { Server } from "http";
import { addMinutes, format, isBefore, parseISO } from "date-fns";

// ==========================
// 🔹 Servicios
// ==========================
type ServiceItem = {
  id: string;
  name: string;
  duration: number;
};

const services: ServiceItem[] = [
  {
    id: "belleza-pies-semipermanente",
    name: "Belleza de Pies Semipermanente",
    duration: 75,
  },
  {
    id: "kapping-gel",
    name: "Kapping Gel",
    duration: 75,
  },
  {
    id: "soft-gel",
    name: "Soft Gel",
    duration: 120,
  },
];

// ==========================
// 🔹 Configuración
// ==========================
const SLOT_INTERVAL = 30;
const MIN_NOTICE_HOURS = 24;

// ==========================
// 🔹 Generar slots del día
// ==========================
function generateDailySlots(date: string, duration: number) {
  const slots: { start: string; end: string; label: string }[] = [];

  const dayStart = new Date(`${date}T08:00:00-03:00`);
  const dayEnd = new Date(`${date}T15:30:00-03:00`);

  let cursor = new Date(dayStart);

  while (true) {
    const slotStart = new Date(cursor);
    const slotEnd = addMinutes(slotStart, duration);

    if (slotEnd > dayEnd) break;

    slots.push({
      start: slotStart.toISOString(),
      end: slotEnd.toISOString(),
      label: format(slotStart, "HH:mm"),
    });

    cursor = addMinutes(cursor, SLOT_INTERVAL);
  }

  return slots;
}

// ==========================
// 🔹 Regla 24hs
// ==========================
function applyMinNotice(
  slots: { start: string; end: string; label: string }[]
) {
  const now = new Date();
  const minDate = new Date(
    now.getTime() + MIN_NOTICE_HOURS * 60 * 60 * 1000
  );

  return slots.filter((slot) => {
    return !isBefore(parseISO(slot.start), minDate);
  });
}

// ==========================
// 🔹 Rutas principales existentes
// ==========================
export async function registerRoutes(server: Server, app: Express) {
  // 👉 Si ya tenías rutas, dejalas acá
  // Ejemplo:
  // app.get("/api/health", (_req, res) => res.json({ ok: true }));
}

// ==========================
// 🔥 RUTAS DE BOOKING
// ==========================
export function registerBookingRoutes(app: Express) {

  // ======================
  // 📅 Disponibilidad
  // ======================
  app.get("/api/availability", async (req: Request, res: Response) => {
    try {
      const date = req.query.date as string;
      const serviceId = req.query.serviceId as string;

      if (!date || !serviceId) {
        return res.status(400).json({ error: "Faltan parámetros." });
      }

      const service = services.find((s) => s.id === serviceId);

      if (!service) {
        return res.status(404).json({ error: "Servicio no encontrado." });
      }

      // 🔹 Generar slots
      const allSlots = generateDailySlots(date, service.duration);

      // 🔹 Aplicar regla 24hs
      const withNotice = applyMinNotice(allSlots);

      // 🔹 Por ahora sin Google (sin busy)
      const available = withNotice;

      return res.json({ slots: available });
    } catch (error) {
      console.error("availability error:", error);
      return res
        .status(500)
        .json({ error: "Error al consultar disponibilidad." });
    }
  });

  // ======================
  // 📌 Crear reserva
  // ======================
  app.post("/api/book", async (req: Request, res: Response) => {
    try {
      const {
        serviceName,
        start,
        end,
        clientName,
        clientEmail,
        clientPhone,
        notes,
      } = req.body;

      if (
        !serviceName ||
        !start ||
        !end ||
        !clientName ||
        !clientEmail ||
        !clientPhone
      ) {
        return res
          .status(400)
          .json({ error: "Faltan datos obligatorios." });
      }

      // 🔹 Por ahora solo simulamos (sin Google)
      console.log("📌 Nueva reserva:", {
        serviceName,
        start,
        end,
        clientName,
        clientEmail,
        clientPhone,
        notes,
      });

      return res.json({
        ok: true,
        message: "Reserva creada correctamente",
      });
    } catch (error) {
      console.error("book error:", error);
      return res
        .status(500)
        .json({ error: "No se pudo crear la reserva." });
    }
  });
}