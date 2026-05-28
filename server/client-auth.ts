import crypto from "crypto";
import type { Express, Request, Response, NextFunction } from "express";
import { and, desc, eq, gt, isNull } from "drizzle-orm";

import { db } from "./db";
import { sendClientLoginCodeEmail } from "./email";
import { bookings, clientLoginCodes, clients } from "../shared/schema";

type ClientUser = {
  email: string;
};

declare module "express-session" {
  interface SessionData {
    clientUser?: ClientUser;
  }
}

const CODE_EXPIRATION_MINUTES = 10;
const MAX_CODE_ATTEMPTS = 5;

function normalizeEmail(value: unknown) {
  return String(value || "").trim().toLowerCase();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getHashSecret() {
  return process.env.SESSION_SECRET || "local-dev-secret";
}

function generateCode() {
  return String(crypto.randomInt(100000, 999999));
}

function hashCode(email: string, code: string) {
  return crypto
    .createHash("sha256")
    .update(`${email}:${code}:${getHashSecret()}`)
    .digest("hex");
}

function toIso(value: Date | string) {
  return value instanceof Date
    ? value.toISOString()
    : new Date(value).toISOString();
}

function requireClientAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!req.session.clientUser?.email) {
    return res.status(401).json({
      authenticated: false,
      error: "No autorizado.",
    });
  }

  return next();
}

export function registerClientAuthRoutes(app: Express) {
  app.post("/api/client-auth/request-code", async (req: Request, res: Response) => {
    try {
      const email = normalizeEmail(req.body?.email);

      if (!email || !isValidEmail(email)) {
        return res.status(400).json({
          error: "Ingresá un email válido.",
        });
      }

      const code = generateCode();
      const codeHash = hashCode(email, code);

      const expiresAt = new Date(
        Date.now() + CODE_EXPIRATION_MINUTES * 60 * 1000,
      );

      await db.insert(clientLoginCodes).values({
        email,
        codeHash,
        expiresAt,
      });

      await sendClientLoginCodeEmail({
        email,
        code,
      });

      return res.json({
        ok: true,
        message: "Te enviamos un código de acceso a tu email.",
      });
    } catch (error) {
      console.error("client request code error:", error);

      return res.status(500).json({
        error: "No se pudo enviar el código. Intentá nuevamente.",
      });
    }
  });

  app.post("/api/client-auth/verify-code", async (req: Request, res: Response) => {
    try {
      const email = normalizeEmail(req.body?.email);
      const code = String(req.body?.code || "").trim();

      if (!email || !isValidEmail(email) || !code) {
        return res.status(400).json({
          error: "Ingresá email y código.",
        });
      }

      const [loginCode] = await db
        .select()
        .from(clientLoginCodes)
        .where(
          and(
            eq(clientLoginCodes.email, email),
            isNull(clientLoginCodes.usedAt),
            gt(clientLoginCodes.expiresAt, new Date()),
          ),
        )
        .orderBy(desc(clientLoginCodes.createdAt))
        .limit(1);

      if (!loginCode) {
        return res.status(400).json({
          error: "El código es inválido o venció.",
        });
      }

      if (loginCode.attempts >= MAX_CODE_ATTEMPTS) {
        return res.status(429).json({
          error: "Superaste la cantidad de intentos. Pedí un código nuevo.",
        });
      }

      const expectedHash = hashCode(email, code);

      if (expectedHash !== loginCode.codeHash) {
        await db
          .update(clientLoginCodes)
          .set({
            attempts: loginCode.attempts + 1,
          })
          .where(eq(clientLoginCodes.id, loginCode.id));

        return res.status(400).json({
          error: "El código ingresado no es correcto.",
        });
      }

      await db
        .update(clientLoginCodes)
        .set({
          usedAt: new Date(),
        })
        .where(eq(clientLoginCodes.id, loginCode.id));

      req.session.clientUser = {
        email,
      };

      return req.session.save(() => {
        return res.json({
          ok: true,
          authenticated: true,
          user: {
            email,
          },
        });
      });
    } catch (error) {
      console.error("client verify code error:", error);

      return res.status(500).json({
        error: "No se pudo verificar el código.",
      });
    }
  });

  app.get("/api/client-auth/me", (req: Request, res: Response) => {
    if (!req.session.clientUser?.email) {
      return res.status(401).json({
        authenticated: false,
      });
    }

    return res.json({
      authenticated: true,
      user: req.session.clientUser,
    });
  });

  app.post("/api/client-auth/logout", (req: Request, res: Response) => {
    req.session.clientUser = undefined;

    return req.session.save(() => {
      return res.json({
        ok: true,
      });
    });
  });

  app.get(
    "/api/client/bookings",
    requireClientAuth,
    async (req: Request, res: Response) => {
      try {
        const email = req.session.clientUser?.email;

        if (!email) {
          return res.status(401).json({
            authenticated: false,
          });
        }

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
            clientName: clients.name,
            clientEmail: clients.email,
            clientPhone: clients.phone,
          })
          .from(bookings)
          .innerJoin(clients, eq(bookings.clientId, clients.id))
          .where(eq(clients.email, email))
          .orderBy(desc(bookings.start))
          .limit(50);

        return res.json({
          bookings: rows.map((booking) => ({
            ...booking,
            start: toIso(booking.start),
            end: toIso(booking.end),
            createdAt: toIso(booking.createdAt),
            updatedAt: toIso(booking.updatedAt),
            cancelledAt: booking.cancelledAt
              ? toIso(booking.cancelledAt)
              : null,
          })),
        });
      } catch (error) {
        console.error("client bookings error:", error);

        return res.status(500).json({
          error: "No se pudieron cargar tus turnos.",
        });
      }
    },
  );
}