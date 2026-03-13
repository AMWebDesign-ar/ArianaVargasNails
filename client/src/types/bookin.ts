export type AvailabilityRequest = {
  date: string; // YYYY-MM-DD
  serviceId: string;
};

export type TimeSlot = {
  start: string; // ISO string
  end: string;   // ISO string
  label: string; // 08:00
};

export type AvailabilityResponse = {
  slots: TimeSlot[];
};

export type BookingPayload = {
  serviceId: string;
  serviceName: string;
  start: string;
  end: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  notes?: string;
};