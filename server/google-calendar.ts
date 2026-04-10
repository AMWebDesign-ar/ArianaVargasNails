import { google } from "googleapis";

const calendarId = process.env.GOOGLE_CALENDAR_ID;

if (!calendarId) {
  throw new Error("Falta GOOGLE_CALENDAR_ID en variables de entorno.");
}

function getAuth() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!clientEmail || !privateKey) {
    throw new Error("Faltan GOOGLE_CLIENT_EMAIL o GOOGLE_PRIVATE_KEY.");
  }

  return new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });
}

async function getCalendarClient() {
  const auth = getAuth();
  return google.calendar({ version: "v3", auth });
}

export async function getBusyRanges(timeMin: string, timeMax: string) {
  const calendar = await getCalendarClient();

  const response = await calendar.freebusy.query({
    requestBody: {
      timeMin,
      timeMax,
      items: [{ id: calendarId }],
    },
  });

  return response.data.calendars?.[calendarId]?.busy ?? [];
}

export async function createBookingEvent(params: {
  serviceName: string;
  start: string;
  end: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  notes?: string;
}) {
  const calendar = await getCalendarClient();

  const response = await calendar.events.insert({
    calendarId,
    requestBody: {
      summary: `${params.serviceName} - ${params.clientName}`,
      description: [
        `Servicio: ${params.serviceName}`,
        `Cliente: ${params.clientName}`,
        `Email: ${params.clientEmail}`,
        `Teléfono: ${params.clientPhone}`,
        params.notes ? `Notas: ${params.notes}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
      start: {
        dateTime: params.start,
        timeZone: "America/Argentina/Buenos_Aires",
      },
      end: {
        dateTime: params.end,
        timeZone: "America/Argentina/Buenos_Aires",
      },
    },
  });

  return response.data;
}