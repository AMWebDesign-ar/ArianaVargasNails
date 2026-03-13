import { google } from "googleapis";

const calendarId = process.env.GOOGLE_CALENDAR_ID!;

function getAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });
}

export async function getCalendarClient() {
  const auth = getAuth();
  return google.calendar({ version: "v3", auth });
}

export async function getBusyRanges(start: string, end: string) {
  const calendar = await getCalendarClient();

  const response = await calendar.freebusy.query({
    requestBody: {
      timeMin: start,
      timeMax: end,
      items: [{ id: calendarId }],
    },
  });

  return response.data.calendars?.[calendarId]?.busy ?? [];
}

export async function createBookingEvent(params: {
  start: string;
  end: string;
  serviceName: string;
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