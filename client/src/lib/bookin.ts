import { addMinutes, format, isBefore, parseISO } from "date-fns";

type BusyRange = {
  start: string;
  end: string;
};

const SLOT_INTERVAL = 30; // cada cuánto mostrar opciones
const MIN_NOTICE_HOURS = 24;

export function generateDailySlots(date: string, duration: number) {
  const slots: { start: string; end: string; label: string }[] = [];

  const dayStart = new Date(`${date}T08:00:00-03:00`);
  const dayEnd = new Date(`${date}T15:30:00-03:00`);

  let cursor = new Date(dayStart);

  while (true) {
    const slotStart = new Date(cursor);
    const slotEnd = addMinutes(slotStart, duration);

    if (slotEnd > dayEnd) break;

    slots.push({
      start: slotStart.toISOString(),
      end: slotEnd.toISOString(),
      label: format(slotStart, "HH:mm"),
    });

    cursor = addMinutes(cursor, SLOT_INTERVAL);
  }

  return slots;
}

export function applyMinNotice(slots: { start: string; end: string; label: string }[]) {
  const now = new Date();
  const minDate = new Date(now.getTime() + MIN_NOTICE_HOURS * 60 * 60 * 1000);

  return slots.filter((slot) => !isBefore(parseISO(slot.start), minDate));
}

export function filterBusySlots(
  slots: { start: string; end: string; label: string }[],
  busy: BusyRange[]
) {
  return slots.filter((slot) => {
    const slotStart = parseISO(slot.start).getTime();
    const slotEnd = parseISO(slot.end).getTime();

    const overlaps = busy.some((b) => {
      const busyStart = parseISO(b.start).getTime();
      const busyEnd = parseISO(b.end).getTime();

      return slotStart < busyEnd && slotEnd > busyStart;
    });

    return !overlaps;
  });
}