import { useEffect, useMemo, useState } from "react";
import { addDays, format } from "date-fns";
import { useRoute } from "wouter";
import { services } from "../data/services";

type Booking = {
  id: string;
  serviceId: string;
  serviceName: string;
  serviceDuration: number;
  start: string;
  end: string;
  status: string;
  notes?: string | null;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  canManage: boolean;
};

type TimeSlot = {
  start: string;
  end: string;
  label: string;
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function ManageBooking() {
  const [, params] = useRoute("/reserva/:token");
  const token = params?.token || "";

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const selectedService = useMemo(
    () => services.find((service) => service.id === serviceId),
    [serviceId]
  );

  const minDate = format(addDays(new Date(), 1), "yyyy-MM-dd");

  async function loadBooking() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/bookings/${token}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "No se pudo consultar la reserva.");
      }

      setBooking(data.booking);
      setServiceId(data.booking.serviceId);
      setDate(format(new Date(data.booking.start), "yyyy-MM-dd"));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo consultar la reserva."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadAvailability() {
    if (!serviceId || !date) return;

    setLoadingSlots(true);
    setSelectedSlot(null);
    setError("");

    try {
      const res = await fetch(
        `/api/availability?date=${date}&serviceId=${serviceId}`
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "No se pudo cargar disponibilidad.");
      }

      setSlots(data.slots ?? []);
    } catch (err) {
      setSlots([]);
      setError(
        err instanceof Error ? err.message : "No se pudo cargar disponibilidad."
      );
    } finally {
      setLoadingSlots(false);
    }
  }

  async function cancelBooking() {
    const confirmed = window.confirm("¿Seguro que querés cancelar este turno?");

    if (!confirmed) return;

    setActionLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch(`/api/bookings/${token}/cancel`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "No se pudo cancelar la reserva.");
      }

      setMessage("Tu turno fue cancelado correctamente.");
      await loadBooking();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo cancelar la reserva."
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function rescheduleBooking() {
    if (!selectedService || !selectedSlot) {
      setError("Seleccioná un nuevo horario.");
      return;
    }

    setActionLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch(`/api/bookings/${token}/reschedule`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceId: selectedService.id,
          start: selectedSlot.start,
          end: selectedSlot.end,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "No se pudo modificar la reserva.");
      }

      setMessage("Tu turno fue modificado correctamente.");
      await loadBooking();
      setSelectedSlot(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo modificar la reserva."
      );
    } finally {
      setActionLoading(false);
    }
  }

  useEffect(() => {
    if (token) {
      loadBooking();
    }
  }, [token]);

  useEffect(() => {
    if (booking?.canManage) {
      loadAvailability();
    }
  }, [serviceId, date, booking?.canManage]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fff7fa] px-4 py-10">
        <div className="mx-auto max-w-2xl rounded-3xl bg-white p-6 shadow-xl">
          Cargando reserva...
        </div>
      </main>
    );
  }

  if (error && !booking) {
    return (
      <main className="min-h-screen bg-[#fff7fa] px-4 py-10">
        <div className="mx-auto max-w-2xl rounded-3xl bg-white p-6 shadow-xl">
          <h1 className="text-xl font-bold text-[#6f4e5f]">
            No pudimos encontrar tu reserva
          </h1>
          <p className="mt-3 text-sm text-[#8f6f7e]">{error}</p>
        </div>
      </main>
    );
  }

  if (!booking) return null;

  const isCancelled = booking.status === "cancelled";

  return (
    <main className="min-h-screen bg-[#fff7fa] px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-5">
        <section className="rounded-3xl border border-[#f0dfe6] bg-white p-6 shadow-xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#B07070]">
            Ariana Vargas Nails
          </p>

          <h1 className="mt-2 text-2xl font-bold text-[#6f4e5f]">
            Gestionar turno
          </h1>

          {message && (
            <div className="mt-4 rounded-2xl border border-[#cfe7d4] bg-[#edf9f0] p-3 text-sm font-medium text-[#2f6b3f]">
              {message}
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-2xl border border-[#f3c8d8] bg-[#fff1f6] p-3 text-sm font-medium text-[#8c5a6d]">
              {error}
            </div>
          )}

          <div className="mt-5 rounded-2xl bg-[#fff5f8] p-4 text-sm text-[#6f4e5f]">
            <p>
              <strong>Cliente:</strong> {booking.clientName}
            </p>
            <p>
              <strong>Servicio:</strong> {booking.serviceName}
            </p>
            <p>
              <strong>Turno:</strong> {formatDateTime(booking.start)}
            </p>
            <p>
              <strong>Estado:</strong> {booking.status}
            </p>
          </div>

          {!booking.canManage && !isCancelled && (
            <p className="mt-4 text-sm text-[#8f6f7e]">
              Este turno ya no puede modificarse o cancelarse desde la web
              porque faltan menos de 24 hs. Contactanos por WhatsApp.
            </p>
          )}

          {isCancelled && (
            <p className="mt-4 text-sm text-[#8f6f7e]">
              Este turno ya fue cancelado.
            </p>
          )}

          {booking.canManage && !isCancelled && (
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={cancelBooking}
                disabled={actionLoading}
                className="rounded-2xl border border-[#f3c8d8] bg-white px-4 py-2.5 text-sm font-semibold text-[#8c5a6d] transition hover:bg-[#fff1f6] disabled:opacity-50"
              >
                Cancelar turno
              </button>
            </div>
          )}
        </section>

        {booking.canManage && !isCancelled && (
          <section className="rounded-3xl border border-[#f0dfe6] bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-[#6f4e5f]">
              Modificar turno
            </h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#6f4e5f]">
                  Servicio
                </label>
                <select
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  aria-label="Servicio"
                  className="w-full rounded-2xl border border-[#ead8e1] bg-[#fffafc] px-4 py-2.5 text-[15px] outline-none focus:border-[#d9a8bb] focus:ring-2 focus:ring-[#f7d7e3]"
                >
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} ({service.duration} min)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#6f4e5f]">
                  Fecha
                </label>
                <input
                  type="date"
                  value={date}
                  min={minDate}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-2xl border border-[#ead8e1] bg-[#fffafc] px-4 py-2.5 text-[15px] outline-none focus:border-[#d9a8bb] focus:ring-2 focus:ring-[#f7d7e3]"
                />
              </div>
            </div>

            <div className="mt-5">
              <h3 className="mb-2 text-sm font-semibold text-[#6f4e5f]">
                Horarios disponibles
              </h3>

              {loadingSlots ? (
                <p className="text-sm text-[#8f6f7e]">Cargando horarios...</p>
              ) : slots.length === 0 ? (
                <p className="text-sm text-[#8f6f7e]">
                  No hay horarios disponibles para esa fecha.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {slots.map((slot) => {
                    const active = selectedSlot?.start === slot.start;

                    return (
                      <button
                        key={slot.start}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                          active
                            ? "border-[#d86c93] bg-[#d86c93] text-white shadow-md"
                            : "border-[#ead8e1] bg-[#fffafc] text-[#6f4e5f] hover:border-[#d9a8bb] hover:bg-[#fff0f5]"
                        }`}
                      >
                        {slot.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={rescheduleBooking}
              disabled={!selectedSlot || actionLoading}
              className="mt-5 w-full rounded-2xl bg-[#d86c93] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {actionLoading ? "Guardando..." : "Confirmar modificación"}
            </button>
          </section>
        )}
      </div>
    </main>
  );
}