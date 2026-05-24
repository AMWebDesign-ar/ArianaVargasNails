import type { Express, Request, Response } from "express";
import type { Server } from "http";
import { parseISO } from "date-fns";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

import { db } from "./db";
import { createBookingEvent, getBusyRanges } from "./google-calendar";
import { sendBookingConfirmationEmails } from "./email";
import { services } from "./services";
import {
  generateDailySlots,
  applyMinNotice,
  filterBusySlots,
} from "./booking";
import { bookings, clients } from "../shared/schema";

type BusyRange = {
  start: string;
  end: string;
};

function normalizeBusyRanges(
  ranges: Array<{ start?: string | null; end?: string | null }>
): BusyRange[] {
  return ranges.filter((range): range is BusyRange => {
    return typeof range.start === "string" && typeof range.end === "string";
  });
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizeText(value: unknown) {
  return String(value ?? "").trim();
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
      const dayEnd = new Date(`${date}T20:00:00-03:00`).toISOString();

      const busy = normalizeBusyRanges(await getBusyRanges(dayStart, dayEnd));
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
    let pendingBookingId: string | null = null;

    try {
      const { serviceId, start, end, clientName, clientEmail, clientPhone, notes } =
        req.body ?? {};

      const cleanServiceId = normalizeText(serviceId);
      const cleanStart = normalizeText(start);
      const cleanEnd = normalizeText(end);
      const cleanClientName = normalizeText(clientName);
      const cleanClientEmail = normalizeEmail(String(clientEmail || ""));
      const cleanClientPhone = normalizeText(clientPhone);
      const cleanNotes = notes ? normalizeText(notes) : "";

      if (
        !cleanServiceId ||
        !cleanStart ||
        !cleanEnd ||
        !cleanClientName ||
        !cleanClientEmail ||
        !cleanClientPhone
      ) {
        return res.status(400).json({
          error: "Completá todos los campos obligatorios.",
        });
      }

      if (!isValidEmail(cleanClientEmail)) {
        return res.status(400).json({
          error: "Ingresá un email válido.",
        });
      }

      const service = services.find((s) => s.id === cleanServiceId);

      if (!service) {
        return res.status(404).json({ error: "Servicio no encontrado." });
      }

        const busy = normalizeBusyRanges(await getBusyRanges(cleanStart, cleanEnd));

        const overlaps = busy.some((range) => {
        const busyStart = parseISO(range.start).getTime();
        const busyEnd = parseISO(range.end).getTime();
        const requestedStart = parseISO(cleanStart).getTime();
        const requestedEnd = parseISO(cleanEnd).getTime();

        return requestedStart < busyEnd && requestedEnd > busyStart;
      });

      if (overlaps) {
        return res.status(409).json({
          error: "Ese horario acaba de ocuparse. Elegí otro.",
        });
      }

      // 1) Upsert de clienta por email
      const [client] = await db
        .insert(clients)
        .values({
          name: cleanClientName,
          email: cleanClientEmail,
          phone: cleanClientPhone,
        })
        .onConflictDoUpdate({
          target: clients.email,
          set: {
            name: cleanClientName,
            phone: cleanClientPhone,
            updatedAt: new Date(),
          },
        })
        .returning();

      // 2) Crear reserva pending en DB
      const bookingToken = nanoid(40);

      const [pendingBooking] = await db
        .insert(bookings)
        .values({
          token: bookingToken,
          clientId: client.id,
          serviceId: service.id,
          serviceName: service.name,
          serviceDuration: service.duration,
          start: new Date(cleanStart),
          end: new Date(cleanEnd),
          status: "pending",
          notes: cleanNotes || null,
        })
        .returning();

      pendingBookingId = pendingBooking.id;

      // 3) Crear evento real en Google Calendar
      const event = await createBookingEvent({
        serviceName: service.name,
        start: cleanStart,
        end: cleanEnd,
        clientName: cleanClientName,
        clientEmail: cleanClientEmail,
        clientPhone: cleanClientPhone,
        notes: cleanNotes,
      });

      // 4) Confirmar reserva en DB con googleEventId
      const [confirmedBooking] = await db
        .update(bookings)
        .set({
          googleEventId: event.id || null,
          status: "confirmed",
          updatedAt: new Date(),
        })
        .where(eq(bookings.id, pendingBooking.id))
        .returning();

      // 5) Enviar emails sin romper reserva si falla Resend
      let emailResult = null;

      try {
        emailResult = await sendBookingConfirmationEmails({
          serviceName: service.name,
          start: cleanStart,
          end: cleanEnd,
          clientName: cleanClientName,
          clientEmail: cleanClientEmail,
          clientPhone: cleanClientPhone,
          notes: cleanNotes,
          eventId: event.id || undefined,
        });
      } catch (emailError) {
        console.error("email confirmation error:", emailError);
      }

      return res.json({
        ok: true,
        message: "Reserva creada correctamente",
        eventId: event.id,
        bookingId: confirmedBooking.id,
        //bookingToken: confirmedBooking.token,
        email: emailResult,
      });
    } catch (error) {
      console.error("book error:", error);

      if (pendingBookingId) {
        try {
          await db
            .update(bookings)
            .set({
              status: "failed",
              updatedAt: new Date(),
            })
            .where(eq(bookings.id, pendingBookingId));
        } catch (dbError) {
          console.error("booking failed status update error:", dbError);
        }
      }

      return res.status(500).json({
        error: "No se pudo crear la reserva.",
      });
    }
  });
}