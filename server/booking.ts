import { addMinutes, isBefore, parseISO } from "date-fns";

export type BusyRange = {
  start: string;
  end: string;
};

type TimeSlot = {
  start: string;
  end: string;
  label: string;
};

const SLOT_INTERVAL = 15;
const MIN_NOTICE_HOURS = 24;

// Martes a sábado
const OPEN_DAYS = [2, 3, 4, 5, 6];

// Horario de atención
const START_HOUR = 8;
const END_HOUR = 20;

function minutesToLabel(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function buildArgentinaDate(date: string, totalMinutes: number) {
  const label = minutesToLabel(totalMinutes);
  return new Date(`${date}T${label}:00-03:00`);
}

export function generateDailySlots(date: string, duration: number): TimeSlot[] {
  const slots: TimeSlot[] = [];

  const day = new Date(`${date}T00:00:00-03:00`).getDay();

  // Bloquear domingos y lunes
  if (!OPEN_DAYS.includes(day)) {
    return [];
  }

  const startMinutes = START_HOUR * 60;
  const endMinutes = END_HOUR * 60;

  let cursorMinutes = startMinutes;

  while (cursorMinutes + duration <= endMinutes) {
    const slotStart = buildArgentinaDate(date, cursorMinutes);
    const slotEnd = addMinutes(slotStart, duration);

    slots.push({
      start: slotStart.toISOString(),
      end: slotEnd.toISOString(),
      label: minutesToLabel(cursorMinutes),
    });

    cursorMinutes += SLOT_INTERVAL;
  }

  return slots;
}

export function applyMinNotice(slots: TimeSlot[]) {
  const now = new Date();
  const minDate = new Date(now.getTime() + MIN_NOTICE_HOURS * 60 * 60 * 1000);

  return slots.filter((slot) => {
    return !isBefore(parseISO(slot.start), minDate);
  });
}

export function filterBusySlots(slots: TimeSlot[], busy: BusyRange[]) {
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