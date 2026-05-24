import { relations, sql } from "drizzle-orm";
import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * Tabla existente.
 * La dejamos para no romper estructura previa del proyecto.
 */
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

/**
 * Booking domain
 */
export const bookingStatusEnum = pgEnum("booking_status", [
  "pending",
  "confirmed",
  "cancelled",
  "rescheduled",
  "failed",
]);

export const clients = pgTable(
  "clients",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    emailUnique: uniqueIndex("clients_email_unique").on(table.email),
  }),
);

export const bookings = pgTable(
  "bookings",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),

    // Para Fase 3: modificar/cancelar por link seguro
    token: varchar("token", { length: 80 }).notNull(),

    googleEventId: text("google_event_id"),

    clientId: varchar("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),

    serviceId: text("service_id").notNull(),
    serviceName: text("service_name").notNull(),
    serviceDuration: integer("service_duration").notNull(),

    start: timestamp("start", { withTimezone: true }).notNull(),
    end: timestamp("end", { withTimezone: true }).notNull(),

    status: bookingStatusEnum("status").notNull().default("pending"),

    notes: text("notes"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
  },
  (table) => ({
    tokenUnique: uniqueIndex("bookings_token_unique").on(table.token),
    googleEventIdUnique: uniqueIndex("bookings_google_event_id_unique").on(
      table.googleEventId,
    ),
  }),
);

export const clientsRelations = relations(clients, ({ many }) => ({
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  client: one(clients, {
    fields: [bookings.clientId],
    references: [clients.id],
  }),
}));

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  cancelledAt: true,
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;