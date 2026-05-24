import type { Express, Request, Response } from "express";
import type { Server } from "http";
import { parseISO } from "date-fns";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

import { db } from "./db";
import {
  createBookingEvent,
  deleteBookingEvent,
  getBusyRanges,
  updateBookingEvent,
} from "./google-calendar";
import {
  sendBookingCancellationEmails,
  sendBookingConfirmationEmails,
  sendBookingRescheduledEmails,
} from "./email";
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

const MIN_CHANGE_NOTICE_HOURS = 24;

function canChangeBooking(start: Date | string) {
  const startDate = start instanceof Date ? start : new Date(start);
  const minDate = new Date(
    Date.now() + MIN_CHANGE_NOTICE_HOURS * 60 * 60 * 1000
  );

  return startDate.getTime() > minDate.getTime();
}

function isActiveBookingStatus(status: string) {
  return status === "confirmed" || status === "rescheduled";
}

function toIso(value: Date | string) {
  return value instanceof Date
    ? value.toISOString()
    : new Date(value).toISOString();
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
        bookingToken: confirmedBooking.token,
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
  app.get("/api/bookings/:token", async (req: Request, res: Response) => {
  try {
    const token = normalizeText(req.params.token);

    if (!token) {
      return res.status(400).json({ error: "Token inválido." });
    }

    const [booking] = await db
      .select({
        id: bookings.id,
        token: bookings.token,
        googleEventId: bookings.googleEventId,
        serviceId: bookings.serviceId,
        serviceName: bookings.serviceName,
        serviceDuration: bookings.serviceDuration,
        start: bookings.start,
        end: bookings.end,
        status: bookings.status,
        notes: bookings.notes,
        clientName: clients.name,
        clientEmail: clients.email,
        clientPhone: clients.phone,
      })
      .from(bookings)
      .innerJoin(clients, eq(bookings.clientId, clients.id))
      .where(eq(bookings.token, token))
      .limit(1);

    if (!booking) {
      return res.status(404).json({ error: "Reserva no encontrada." });
    }

    return res.json({
      booking: {
        ...booking,
        start: toIso(booking.start),
        end: toIso(booking.end),
        canManage: isActiveBookingStatus(booking.status)
          ? canChangeBooking(booking.start)
          : false,
      },
    });
  } catch (error) {
    console.error("get booking error:", error);
    return res.status(500).json({
      error: "No se pudo consultar la reserva.",
    });
  }
});

app.post("/api/bookings/:token/cancel", async (req: Request, res: Response) => {
  try {
    const token = normalizeText(req.params.token);

    const [booking] = await db
      .select({
        id: bookings.id,
        googleEventId: bookings.googleEventId,
        serviceName: bookings.serviceName,
        start: bookings.start,
        end: bookings.end,
        status: bookings.status,
        notes: bookings.notes,
        clientName: clients.name,
        clientEmail: clients.email,
        clientPhone: clients.phone,
      })
      .from(bookings)
      .innerJoin(clients, eq(bookings.clientId, clients.id))
      .where(eq(bookings.token, token))
      .limit(1);

    if (!booking) {
      return res.status(404).json({ error: "Reserva no encontrada." });
    }

    if (!isActiveBookingStatus(booking.status)) {
      return res.status(409).json({
        error: "Esta reserva ya no está activa.",
      });
    }

    if (!canChangeBooking(booking.start)) {
      return res.status(403).json({
        error:
          "No se puede cancelar con menos de 24 hs de anticipación. Contactanos por WhatsApp.",
      });
    }

    if (booking.googleEventId) {
      await deleteBookingEvent(booking.googleEventId);
    }

    const [cancelledBooking] = await db
      .update(bookings)
      .set({
        status: "cancelled",
        cancelledAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, booking.id))
      .returning();

    try {
      await sendBookingCancellationEmails({
        serviceName: booking.serviceName,
        start: toIso(booking.start),
        end: toIso(booking.end),
        clientName: booking.clientName,
        clientEmail: booking.clientEmail,
        clientPhone: booking.clientPhone,
        notes: booking.notes || "",
        eventId: booking.googleEventId || undefined,
      });
    } catch (emailError) {
      console.error("cancellation email error:", emailError);
    }

    return res.json({
      ok: true,
      message: "Reserva cancelada correctamente.",
      bookingId: cancelledBooking.id,
    });
  } catch (error) {
    console.error("cancel booking error:", error);
    return res.status(500).json({
      error: "No se pudo cancelar la reserva.",
    });
  }
});

app.post("/api/bookings/:token/reschedule", async (req: Request, res: Response) => {
  try {
    const token = normalizeText(req.params.token);
    const cleanServiceId = normalizeText(req.body?.serviceId);
    const cleanStart = normalizeText(req.body?.start);
    const cleanEnd = normalizeText(req.body?.end);

    if (!cleanServiceId || !cleanStart || !cleanEnd) {
      return res.status(400).json({
        error: "Faltan datos para modificar la reserva.",
      });
    }

    const service = services.find((s) => s.id === cleanServiceId);

    if (!service) {
      return res.status(404).json({
        error: "Servicio no encontrado.",
      });
    }

    const requestedStart = parseISO(cleanStart);
    const requestedEnd = parseISO(cleanEnd);
    const requestedDuration =
      (requestedEnd.getTime() - requestedStart.getTime()) / 60_000;

    if (requestedDuration !== service.duration) {
      return res.status(400).json({
        error: "La duración del turno no coincide con el servicio.",
      });
    }

    if (!canChangeBooking(cleanStart)) {
      return res.status(403).json({
        error:
          "No se puede modificar a un horario con menos de 24 hs de anticipación.",
      });
    }

    const [booking] = await db
      .select({
        id: bookings.id,
        googleEventId: bookings.googleEventId,
        serviceName: bookings.serviceName,
        start: bookings.start,
        end: bookings.end,
        status: bookings.status,
        notes: bookings.notes,
        clientName: clients.name,
        clientEmail: clients.email,
        clientPhone: clients.phone,
      })
      .from(bookings)
      .innerJoin(clients, eq(bookings.clientId, clients.id))
      .where(eq(bookings.token, token))
      .limit(1);

    if (!booking) {
      return res.status(404).json({ error: "Reserva no encontrada." });
    }

    if (!isActiveBookingStatus(booking.status)) {
      return res.status(409).json({
        error: "Esta reserva ya no está activa.",
      });
    }

    if (!canChangeBooking(booking.start)) {
      return res.status(403).json({
        error:
          "No se puede modificar con menos de 24 hs de anticipación. Contactanos por WhatsApp.",
      });
    }

    if (!booking.googleEventId) {
      return res.status(500).json({
        error: "La reserva no tiene evento asociado en Google Calendar.",
      });
    }

    const busy = normalizeBusyRanges(
      await getBusyRanges(cleanStart, cleanEnd)
    ).filter((range) => {
      const oldStart = toIso(booking.start);
      const oldEnd = toIso(booking.end);

      return !(range.start === oldStart && range.end === oldEnd);
    });

    const overlaps = busy.some((range) => {
      const busyStart = parseISO(range.start).getTime();
      const busyEnd = parseISO(range.end).getTime();

      return (
        requestedStart.getTime() < busyEnd &&
        requestedEnd.getTime() > busyStart
      );
    });

    if (overlaps) {
      return res.status(409).json({
        error: "Ese horario acaba de ocuparse. Elegí otro.",
      });
    }

    const event = await updateBookingEvent({
      eventId: booking.googleEventId,
      serviceName: service.name,
      start: cleanStart,
      end: cleanEnd,
      clientName: booking.clientName,
      clientEmail: booking.clientEmail,
      clientPhone: booking.clientPhone,
      notes: booking.notes || "",
    });

    const [updatedBooking] = await db
      .update(bookings)
      .set({
        serviceId: service.id,
        serviceName: service.name,
        serviceDuration: service.duration,
        start: requestedStart,
        end: requestedEnd,
        status: "rescheduled",
        googleEventId: event.id || booking.googleEventId,
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, booking.id))
      .returning();

    try {
      await sendBookingRescheduledEmails({
        serviceName: service.name,
        start: cleanStart,
        end: cleanEnd,
        clientName: booking.clientName,
        clientEmail: booking.clientEmail,
        clientPhone: booking.clientPhone,
        notes: booking.notes || "",
        eventId: event.id || booking.googleEventId,
      });
    } catch (emailError) {
      console.error("reschedule email error:", emailError);
    }

    return res.json({
      ok: true,
      message: "Reserva modificada correctamente.",
      bookingId: updatedBooking.id,
    });
  } catch (error) {
    console.error("reschedule booking error:", error);
    return res.status(500).json({
      error: "No se pudo modificar la reserva.",
    });
  }
});
}