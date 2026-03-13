import { NextRequest, NextResponse } from "next/server";
import { createBookingEvent } from "@/lib/google-calendar";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      serviceName,
      start,
      end,
      clientName,
      clientEmail,
      clientPhone,
      notes,
    } = body;

    if (!serviceName || !start || !end || !clientName || !clientEmail || !clientPhone) {
      return NextResponse.json({ error: "Faltan datos obligatorios." }, { status: 400 });
    }

    const event = await createBookingEvent({
      serviceName,
      start,
      end,
      clientName,
      clientEmail,
      clientPhone,
      notes,
    });

    return NextResponse.json({ ok: true, eventId: event.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "No se pudo crear la reserva." }, { status: 500 });
  }
}