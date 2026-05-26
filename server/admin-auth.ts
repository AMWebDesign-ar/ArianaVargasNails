import type { Express, Request, Response, NextFunction } from "express";
import { google } from "googleapis";
import { nanoid } from "nanoid";

type AdminUser = {
  email: string;
  name?: string;
  picture?: string;
};

declare module "express-session" {
  interface SessionData {
    adminUser?: AdminUser;
    googleOAuthState?: string;
  }
}

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Falta ${name} en variables de entorno.`);
  }

  return value;
}

function getAllowedEmails() {
  return (process.env.ADMIN_ALLOWED_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function isAllowedAdmin(email: string) {
  const allowedEmails = getAllowedEmails();
  return allowedEmails.includes(email.trim().toLowerCase());
}

function getSuccessRedirectUrl() {
  return process.env.ADMIN_LOGIN_SUCCESS_URL || "/admin";
}

function getFailureRedirectUrl() {
  return process.env.ADMIN_LOGIN_FAILURE_URL || "/admin/login?error=unauthorized";
}

function getOAuthClient() {
  return new google.auth.OAuth2(
    getRequiredEnv("GOOGLE_OAUTH_CLIENT_ID"),
    getRequiredEnv("GOOGLE_OAUTH_CLIENT_SECRET"),
    getRequiredEnv("GOOGLE_OAUTH_CALLBACK_URL"),
  );
}

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!req.session.adminUser) {
    return res.status(401).json({
      authenticated: false,
      error: "No autorizado.",
    });
  }

  return next();
}

export function registerAdminAuthRoutes(app: Express) {
  app.get("/api/admin/google", (req: Request, res: Response) => {
    const oauth2Client = getOAuthClient();
    const state = nanoid(32);

    req.session.googleOAuthState = state;

    const url = oauth2Client.generateAuthUrl({
      access_type: "online",
      scope: ["openid", "email", "profile"],
      state,
      prompt: "select_account",
    });

    return res.redirect(url);
  });

  app.get("/api/admin/google/callback", async (req: Request, res: Response) => {
    try {
      const code = String(req.query.code || "");
      const state = String(req.query.state || "");

      if (!code || !state || state !== req.session.googleOAuthState) {
        return res.redirect(getFailureRedirectUrl());
      }

      req.session.googleOAuthState = undefined;

      const oauth2Client = getOAuthClient();

      const { tokens } = await oauth2Client.getToken(code);

      if (!tokens.id_token) {
        return res.redirect(getFailureRedirectUrl());
      }

      const ticket = await oauth2Client.verifyIdToken({
        idToken: tokens.id_token,
        audience: getRequiredEnv("GOOGLE_OAUTH_CLIENT_ID"),
      });

      const payload = ticket.getPayload();

      const email = payload?.email?.toLowerCase();
      const emailVerified = payload?.email_verified;

      if (!email || !emailVerified || !isAllowedAdmin(email)) {
        return res.redirect(getFailureRedirectUrl());
      }

      req.session.adminUser = {
        email,
        name: payload?.name,
        picture: payload?.picture,
      };

      return req.session.save(() => {
        return res.redirect(getSuccessRedirectUrl());
      });
    } catch (error) {
      console.error("google admin login error:", error);
      return res.redirect(getFailureRedirectUrl());
    }
  });

  app.get("/api/admin/me", (req: Request, res: Response) => {
    if (!req.session.adminUser) {
      return res.status(401).json({
        authenticated: false,
      });
    }

    return res.json({
      authenticated: true,
      user: req.session.adminUser,
    });
  });

  app.post("/api/admin/logout", (req: Request, res: Response) => {
    req.session.destroy((error) => {
      if (error) {
        console.error("admin logout error:", error);
        return res.status(500).json({
          error: "No se pudo cerrar sesión.",
        });
      }

      res.clearCookie("arianavargasnails.sid");

      return res.json({
        ok: true,
      });
    });
  });
}