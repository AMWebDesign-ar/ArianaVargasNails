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

import { requireAdmin } from "./admin-auth";
import { db } from "./db";
import { bookings, clients } from "../shared/schema";

type BookingStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "rescheduled"
  | "failed"
  | "all";

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
}
