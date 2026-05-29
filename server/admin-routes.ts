import type { Express, Request, Response } from "express";
import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  ilike,
  lt,
  or,
  sql,
  type SQL,
} from "drizzle-orm";
import { parseISO } from "date-fns";

import { requireAdmin } from "./admin-auth";
import { db } from "./db";
import {
  deleteBookingEvent,
  getBusyRanges,
  updateBookingEvent,
} from "./google-calendar";
import {
  sendBookingCancellationEmails,
  sendBookingRescheduledEmails,
} from "./email";
import { services } from "./services";
import { bookings, clients } from "../shared/schema";

type BookingStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "rescheduled"
  | "failed"
  | "all";

type BusyRange = {
  start: string;
  end: string;
};

const VALID_STATUSES: BookingStatus[] = [
  "pending",
  "confirmed",
  "cancelled",
  "rescheduled",
  "failed",
  "all",
];

function toIso(value: Date | string) {
  return value instanceof Date
    ? value.toISOString()
    : new Date(value).toISOString();
}

function normalizeText(value: unknown) {
  return String(value ?? "").trim();
}

function normalizeBusyRanges(
  ranges: Array<{ start?: string | null; end?: string | null }>,
): BusyRange[] {
  return ranges.filter((range): range is BusyRange => {
    return typeof range.start === "string" && typeof range.end === "string";
  });
}

function isActiveBookingStatus(status: string) {
  return status === "confirmed" || status === "rescheduled";
}

function getArgentinaDateString(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error("No se pudo calcular la fecha local.");
  }

  return `${year}-${month}-${day}`;
}

function getArgentinaDayRange(date = new Date()) {
  const dateString = getArgentinaDateString(date);
  const start = new Date(`${dateString}T00:00:00-03:00`);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

  return { start, end };
}

function normalizeStatus(value: unknown): BookingStatus {
  const status = String(value || "all").trim() as BookingStatus;

  return VALID_STATUSES.includes(status) ? status : "all";
}

function serializeBooking(row: {
  id: string;
  token: string;
  googleEventId: string | null;
  serviceId: string;
  serviceName: string;
  serviceDuration: number;
  start: Date;
  end: Date;
  status: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  cancelledAt: Date | null;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
}) {
  return {
    ...row,
    start: toIso(row.start),
    end: toIso(row.end),
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
    cancelledAt: row.cancelledAt ? toIso(row.cancelledAt) : null,
  };
}

async function countBookings(whereClause?: SQL) {
  const [row] = await db
    .select({
      total: sql<number>`count(*)::int`,
    })
    .from(bookings)
    .where(whereClause);

  return row?.total ?? 0;
}

async function getBookingRows(params: {
  limit?: number;
  status?: BookingStatus;
  q?: string;
  from?: Date;
  to?: Date;
  order?: "asc" | "desc";
}) {
  const conditions: SQL[] = [];

  if (params.status && params.status !== "all") {
    conditions.push(eq(bookings.status, params.status));
  }

  if (params.from) {
    conditions.push(gte(bookings.start, params.from));
  }

  if (params.to) {
    conditions.push(lt(bookings.start, params.to));
  }

  if (params.q) {
    const search = `%${params.q}%`;

    const searchCondition = or(
      ilike(clients.name, search),
      ilike(clients.email, search),
      ilike(clients.phone, search),
      ilike(bookings.serviceName, search),
    );

    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const rows = await db
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
      createdAt: bookings.createdAt,
      updatedAt: bookings.updatedAt,
      cancelledAt: bookings.cancelledAt,
      clientId: clients.id,
      clientName: clients.name,
      clientEmail: clients.email,
      clientPhone: clients.phone,
    })
    .from(bookings)
    .innerJoin(clients, eq(bookings.clientId, clients.id))
    .where(whereClause)
    .orderBy(params.order === "asc" ? asc(bookings.start) : desc(bookings.start))
    .limit(params.limit ?? 20);

  return rows.map(serializeBooking);
}

async function getBookingForAdmin(bookingId: string) {
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
      createdAt: bookings.createdAt,
      updatedAt: bookings.updatedAt,
      cancelledAt: bookings.cancelledAt,
      clientId: clients.id,
      clientName: clients.name,
      clientEmail: clients.email,
      clientPhone: clients.phone,
    })
    .from(bookings)
    .innerJoin(clients, eq(bookings.clientId, clients.id))
    .where(eq(bookings.id, bookingId))
    .limit(1);

  return booking;
}

export function registerAdminRoutes(app: Express) {
  app.get(
    "/api/admin/dashboard",
    requireAdmin,
    async (_req: Request, res: Response) => {
      try {
        const now = new Date();
        const { start: todayStart, end: todayEnd } = getArgentinaDayRange(now);

        const activeCondition = or(
          eq(bookings.status, "confirmed"),
          eq(bookings.status, "rescheduled"),
        );

        const todayCount = await countBookings(
          and(
            activeCondition,
            gte(bookings.start, todayStart),
            lt(bookings.start, todayEnd),
          ),
        );

        const upcomingCount = await countBookings(
          and(activeCondition, gte(bookings.start, now)),
        );

        const cancelledCount = await countBookings(
          eq(bookings.status, "cancelled"),
        );

        const [clientCountRow] = await db
          .select({
            total: count(),
          })
          .from(clients);

        const todayBookings = await getBookingRows({
          from: todayStart,
          to: todayEnd,
          status: "all",
          order: "asc",
          limit: 20,
        });

        const upcomingBookings = await getBookingRows({
          from: now,
          status: "all",
          order: "asc",
          limit: 20,
        });

        const recentBookings = await getBookingRows({
          status: "all",
          order: "desc",
          limit: 20,
        });

        const recentClients = await db
          .select({
            id: clients.id,
            name: clients.name,
            email: clients.email,
            phone: clients.phone,
            createdAt: clients.createdAt,
            updatedAt: clients.updatedAt,
          })
          .from(clients)
          .orderBy(desc(clients.createdAt))
          .limit(10);

        return res.json({
          summary: {
            todayBookings: todayCount,
            upcomingBookings: upcomingCount,
            cancelledBookings: cancelledCount,
            totalClients: Number(clientCountRow?.total ?? 0),
          },
          todayBookings,
          upcomingBookings,
          recentBookings,
          recentClients: recentClients.map((client) => ({
            ...client,
            createdAt: toIso(client.createdAt),
            updatedAt: toIso(client.updatedAt),
          })),
        });
      } catch (error) {
        console.error("admin dashboard error:", error);

        return res.status(500).json({
          error: "No se pudo cargar el dashboard.",
        });
      }
    },
  );

  app.get(
    "/api/admin/bookings",
    requireAdmin,
    async (req: Request, res: Response) => {
      try {
        const q = String(req.query.q || "").trim();
        const status = normalizeStatus(req.query.status);
        const limit = Math.min(Number(req.query.limit || 50), 100);

        const rows = await getBookingRows({
          q: q || undefined,
          status,
          limit,
          order: "desc",
        });

        return res.json({ bookings: rows });
      } catch (error) {
        console.error("admin bookings error:", error);

        return res.status(500).json({
          error: "No se pudieron cargar los turnos.",
        });
      }
    },
  );

  app.get(
    "/api/admin/clients",
    requireAdmin,
    async (req: Request, res: Response) => {
      try {
        const q = String(req.query.q || "").trim();
        const limit = Math.min(Number(req.query.limit || 50), 100);

        const whereClause = q
          ? or(
              ilike(clients.name, `%${q}%`),
              ilike(clients.email, `%${q}%`),
              ilike(clients.phone, `%${q}%`),
            )
          : undefined;

        const rows = await db
          .select({
            id: clients.id,
            name: clients.name,
            email: clients.email,
            phone: clients.phone,
            createdAt: clients.createdAt,
            updatedAt: clients.updatedAt,
            bookingCount: sql<number>`count(${bookings.id})::int`,
          })
          .from(clients)
          .leftJoin(bookings, eq(bookings.clientId, clients.id))
          .where(whereClause)
          .groupBy(
            clients.id,
            clients.name,
            clients.email,
            clients.phone,
            clients.createdAt,
            clients.updatedAt,
          )
          .orderBy(desc(clients.updatedAt))
          .limit(limit);

        return res.json({
          clients: rows.map((client) => ({
            ...client,
            createdAt: toIso(client.createdAt),
            updatedAt: toIso(client.updatedAt),
          })),
        });
      } catch (error) {
        console.error("admin clients error:", error);

        return res.status(500).json({
          error: "No se pudieron cargar las clientas.",
        });
      }
    },
  );

app.get(
  "/api/admin/clients/:id",
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const clientId = normalizeText(req.params.id);

      if (!clientId) {
        return res.status(400).json({
          error: "Clienta inválida.",
        });
      }

      const [client] = await db
        .select({
          id: clients.id,
          name: clients.name,
          email: clients.email,
          phone: clients.phone,
          createdAt: clients.createdAt,
          updatedAt: clients.updatedAt,
        })
        .from(clients)
        .where(eq(clients.id, clientId))
        .limit(1);

      if (!client) {
        return res.status(404).json({
          error: "Clienta no encontrada.",
        });
      }

      const clientBookings = await db
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
          createdAt: bookings.createdAt,
          updatedAt: bookings.updatedAt,
          cancelledAt: bookings.cancelledAt,
          clientId: clients.id,
          clientName: clients.name,
          clientEmail: clients.email,
          clientPhone: clients.phone,
        })
        .from(bookings)
        .innerJoin(clients, eq(bookings.clientId, clients.id))
        .where(eq(bookings.clientId, clientId))
        .orderBy(desc(bookings.start));

      const serializedBookings = clientBookings.map(serializeBooking);

      const activeBookings = serializedBookings.filter((booking) =>
        isActiveBookingStatus(booking.status),
      );

      const cancelledBookings = serializedBookings.filter(
        (booking) => booking.status === "cancelled",
      );

      const now = Date.now();

      const nextBooking =
        activeBookings
          .filter((booking) => new Date(booking.start).getTime() >= now)
          .sort(
            (a, b) =>
              new Date(a.start).getTime() - new Date(b.start).getTime(),
          )[0] ?? null;

      const lastBooking =
        serializedBookings
          .filter((booking) => new Date(booking.start).getTime() < now)
          .sort(
            (a, b) =>
              new Date(b.start).getTime() - new Date(a.start).getTime(),
          )[0] ?? null;

      return res.json({
        client: {
          ...client,
          createdAt: toIso(client.createdAt),
          updatedAt: toIso(client.updatedAt),
        },
        stats: {
          totalBookings: serializedBookings.length,
          activeBookings: activeBookings.length,
          cancelledBookings: cancelledBookings.length,
          completedOrPastBookings: serializedBookings.filter(
            (booking) => new Date(booking.start).getTime() < now,
          ).length,
        },
        nextBooking,
        lastBooking,
        bookings: serializedBookings,
      });
    } catch (error) {
      console.error("admin client detail error:", error);

      return res.status(500).json({
        error: "No se pudo cargar la ficha de la clienta.",
      });
    }
  },
);

  app.post(
    "/api/admin/bookings/:id/cancel",
    requireAdmin,
    async (req: Request, res: Response) => {
      try {
        const bookingId = normalizeText(req.params.id);

        if (!bookingId) {
          return res.status(400).json({ error: "Reserva inválida." });
        }

        const booking = await getBookingForAdmin(bookingId);

        if (!booking) {
          return res.status(404).json({ error: "Reserva no encontrada." });
        }

        if (!isActiveBookingStatus(booking.status)) {
          return res.status(409).json({
            error: "Esta reserva ya no está activa.",
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
          console.error("admin cancellation email error:", emailError);
        }

        return res.json({
          ok: true,
          message: "Reserva cancelada correctamente.",
          bookingId: cancelledBooking.id,
        });
      } catch (error) {
        console.error("admin cancel booking error:", error);

        return res.status(500).json({
          error: "No se pudo cancelar la reserva.",
        });
      }
    },
  );

  app.post(
    "/api/admin/bookings/:id/reschedule",
    requireAdmin,
    async (req: Request, res: Response) => {
      try {
        const bookingId = normalizeText(req.params.id);
        const cleanServiceId = normalizeText(req.body?.serviceId);
        const cleanStart = normalizeText(req.body?.start);
        const cleanEnd = normalizeText(req.body?.end);

        if (!bookingId || !cleanServiceId || !cleanStart || !cleanEnd) {
          return res.status(400).json({
            error: "Faltan datos para modificar la reserva.",
          });
        }

        const service = services.find((item) => item.id === cleanServiceId);

        if (!service) {
          return res.status(404).json({
            error: "Servicio no encontrado.",
          });
        }

        const booking = await getBookingForAdmin(bookingId);

        if (!booking) {
          return res.status(404).json({ error: "Reserva no encontrada." });
        }

        if (!isActiveBookingStatus(booking.status)) {
          return res.status(409).json({
            error: "Esta reserva ya no está activa.",
          });
        }

        if (!booking.googleEventId) {
          return res.status(500).json({
            error: "La reserva no tiene evento asociado en Google Calendar.",
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

        const oldStart = toIso(booking.start);
        const oldEnd = toIso(booking.end);

        const busy = normalizeBusyRanges(
          await getBusyRanges(cleanStart, cleanEnd),
        ).filter((range) => {
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
          console.error("admin reschedule email error:", emailError);
        }

        return res.json({
          ok: true,
          message: "Reserva modificada correctamente.",
          bookingId: updatedBooking.id,
        });
      } catch (error) {
        console.error("admin reschedule booking error:", error);

        return res.status(500).json({
          error: "No se pudo modificar la reserva.",
        });
      }
    },
  );
}
