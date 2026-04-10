import type { Express, Request, Response } from "express";
import type { Server } from "http";
import { parseISO } from "date-fns";
import { createBookingEvent, getBusyRanges } from "./google-calendar";
import { services } from "./services";
import {
  generateDailySlots,
  applyMinNotice,
  filterBusySlots,
} from "./booking";

type BusyRange = {
  start: string;
  end: string;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function registerRoutes(_server: Server, _app: Express) {
  // Dejamos esta función por compatibilidad con tu index actual.
}

export function registerBookingRoutes(app: Express) {
  app.get("/api/availability", async (req: Request, res: Response) => {
    try {
      const date = String(req.query.date || "");
      const serviceId = String(req.query.serviceId || "");

      if (!date || !serviceId) {
        return res.status(400).json({ error: "Faltan parámetros." });
      }

      const service = services.find((s) => s.id === serviceId);

      if (!service) {
        return res.status(404).json({ error: "Servicio no encontrado." });
      }

      const allSlots = generateDailySlots(date, service.duration);
      const withNotice = applyMinNotice(allSlots);

      const dayStart = new Date(`${date}T08:00:00-03:00`).toISOString();
      const dayEnd = new Date(`${date}T15:30:00-03:00`).toISOString();

      const busy = await getBusyRanges(dayStart, dayEnd);
      const available = filterBusySlots(withNotice, busy);

      return res.json({ slots: available });
    } catch (error) {
      console.error("availability error:", error);
      return res
        .status(500)
        .json({ error: "Error al consultar disponibilidad." });
    }
  });

  app.post("/api/book", async (req: Request, res: Response) => {
    try {
      const {
        serviceId,
        serviceName,
        start,
        end,
        clientName,
        clientEmail,
        clientPhone,
        notes,
      } = req.body ?? {};

      if (
        !serviceId ||
        !serviceName ||
        !start ||
        !end ||
        !clientName ||
        !clientEmail ||
        !clientPhone
      ) {
        return res.status(400).json({
          error: "Completá todos los campos obligatorios.",
        });
      }

      if (!isValidEmail(String(clientEmail))) {
        return res.status(400).json({
          error: "Ingresá un email válido.",
        });
      }

      const service = services.find((s) => s.id === serviceId);

      if (!service) {
        return res.status(404).json({ error: "Servicio no encontrado." });
      }

      const busy = await getBusyRanges(String(start), String(end));

      const overlaps = busy.some((range: BusyRange) => {
        const busyStart = parseISO(range.start).getTime();
        const busyEnd = parseISO(range.end).getTime();
        const requestedStart = parseISO(String(start)).getTime();
        const requestedEnd = parseISO(String(end)).getTime();

        return requestedStart < busyEnd && requestedEnd > busyStart;
      });

      if (overlaps) {
        return res.status(409).json({
          error: "Ese horario acaba de ocuparse. Elegí otro.",
        });
      }

      const event = await createBookingEvent({
        serviceName: String(serviceName),
        start: String(start),
        end: String(end),
        clientName: String(clientName),
        clientEmail: String(clientEmail),
        clientPhone: String(clientPhone),
        notes: notes ? String(notes) : "",
      });

      return res.json({
        ok: true,
        message: "Reserva creada correctamente",
        eventId: event.id,
      });
    } catch (error) {
      console.error("book error:", error);
      return res.status(500).json({
        error: "No se pudo crear la reserva.",
      });
    }
  });
}