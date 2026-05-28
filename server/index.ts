import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes, registerBookingRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import session from "express-session";
import { registerAdminAuthRoutes } from "./admin-auth";
import { registerAdminRoutes } from "./admin-routes";

const app = express();
const httpServer = createServer(app);
app.set("trust proxy", 1);


declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

// 🔹 Body parser con rawBody (para futuros webhooks si querés)
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret) {
  throw new Error("Falta SESSION_SECRET en variables de entorno.");
}

app.use(
  session({
    name: "arianavargasnails.sid",
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 8,
    },
  }),
);

registerAdminAuthRoutes(app);
registerAdminRoutes(app);

// 🔹 Logger simple
export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

// 🔹 Middleware de logging de requests
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;

    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;

      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

// 🔥 ARRANQUE DEL SERVER
(async () => {
  // 🔹 Rutas existentes
  await registerRoutes(httpServer, app);

  // 🔥 IMPORTANTE: rutas de booking (lo que te faltaba)
  registerBookingRoutes(app);

  // 🔹 Manejo global de errores
  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });

  // 🔹 Static / Vite
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // 🔹 Server listen
  const port = parseInt(process.env.PORT || "5000", 10);

  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
    },
    () => {
      log(`serving on port http://localhost:${port}`);
    },
  );
})();