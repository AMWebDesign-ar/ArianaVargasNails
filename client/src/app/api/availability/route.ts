import { NextRequest, NextResponse } from "next/server";
import { services } from "@/data/services";
import { generateDailySlots, applyMinNotice, filterBusySlots } from "@/lib/booking";
import { getBusyRanges } from "@/lib/google-calendar";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const serviceId = searchParams.get("serviceId");

    if (!date || !serviceId) {
      return NextResponse.json({ error: "Faltan parámetros." }, { status: 400 });
    }

    const service = services.find((s) => s.id === serviceId);

    if (!service) {
      return NextResponse.json({ error: "Servicio no encontrado." }, { status: 404 });
    }

    const dayStart = new Date(`${date}T08:00:00-03:00`).toISOString();
    const dayEnd = new Date(`${date}T15:30:00-03:00`).toISOString();

    const busy = await getBusyRanges(dayStart, dayEnd);

    const allSlots = generateDailySlots(date, service.duration);
    const withNotice = applyMinNotice(allSlots);
    const available = filterBusySlots(withNotice, busy);

    return NextResponse.json({ slots: available });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al consultar disponibilidad." }, { status: 500 });
  }
}