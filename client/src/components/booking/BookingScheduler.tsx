import { useEffect, useMemo, useState } from "react";
import { addDays, format } from "date-fns";
import { services } from "../../data/services";

type TimeSlot = {
  start: string;
  end: string;
  label: string;
};

type Props = {
  onClose: () => void;
};

export default function BookingScheduler({ onClose }: Props) {
  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [notes, setNotes] = useState("");

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const selectedService = useMemo(
    () => services.find((s) => s.id === serviceId),
    [serviceId]
  );

  const minDate = format(new Date(), "yyyy-MM-dd");

  const isFormValid =
    !!serviceId &&
    !!selectedSlot &&
    clientName.trim() !== "" &&
    clientEmail.trim() !== "" &&
    clientPhone.trim() !== "";

  async function findFirstAvailableDate(selectedServiceId: string) {
    for (let i = 0; i < 30; i++) {
      const candidate = format(addDays(new Date(), i), "yyyy-MM-dd");

      try {
        const res = await fetch(
          `/api/availability?date=${candidate}&serviceId=${selectedServiceId}`
        );

        const data = await res.json();

        if (res.ok && data.slots && data.slots.length > 0) {
          return candidate;
        }
      } catch (error) {
        console.error("Error buscando primera fecha disponible:", error);
      }
    }

    return "";
  }

  useEffect(() => {
    if (!serviceId) {
      setDate("");
      setSlots([]);
      setSelectedSlot(null);
      setSuccessMessage("");
      setErrorMessage("");
      return;
    }

    async function preloadFirstDate() {
      setLoadingSlots(true);
      setErrorMessage("");
      setSuccessMessage("");
      setSelectedSlot(null);

      try {
        const firstDate = await findFirstAvailableDate(serviceId);

        if (firstDate) {
          setDate(firstDate);
        } else {
          setDate("");
          setSlots([]);
          setSelectedSlot(null);
        }
      } catch (error) {
        console.error("Error precargando fecha:", error);
        setDate("");
        setSlots([]);
        setSelectedSlot(null);
      } finally {
        setLoadingSlots(false);
      }
    }

    preloadFirstDate();
  }, [serviceId]);

  useEffect(() => {
    if (!serviceId || !date) {
      setSlots([]);
      setSelectedSlot(null);
      return;
    }

    async function loadAvailability() {
      setLoadingSlots(true);
      setErrorMessage("");
      setSuccessMessage("");
      setSelectedSlot(null);

      try {
        const res = await fetch(
          `/api/availability?date=${date}&serviceId=${serviceId}`
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "No se pudo consultar disponibilidad.");
        }

        setSlots(data.slots ?? []);
      } catch (error) {
        console.error("Error cargando disponibilidad:", error);
        setSlots([]);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "No se pudo consultar disponibilidad."
        );
      } finally {
        setLoadingSlots(false);
      }
    }

    loadAvailability();
  }, [serviceId, date]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!selectedService || !selectedSlot) {
      setErrorMessage("Seleccioná un servicio y un horario.");
      return;
    }

    if (!clientName.trim() || !clientEmail.trim() || !clientPhone.trim()) {
      setErrorMessage("Completá todos los campos obligatorios.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceId: selectedService.id,
          serviceName: selectedService.name,
          start: selectedSlot.start,
          end: selectedSlot.end,
          clientName: clientName.trim(),
          clientEmail: clientEmail.trim(),
          clientPhone: clientPhone.trim(),
          notes: notes.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "No se pudo reservar el turno.");
      }

      setSuccessMessage("Turno reservado con éxito 💅");

      setClientName("");
      setClientEmail("");
      setClientPhone("");
      setNotes("");
      setSelectedSlot(null);

      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo reservar el turno."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="h-full overflow-y-auto bg-[#fffafc]">
      <div className="grid gap-4 p-3 sm:gap-5 sm:p-5 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="rounded-2xl border border-[#f0dfe6] bg-white p-4 sm:p-5">
            <label
              htmlFor="service"
              className="mb-2 block text-sm font-medium text-[#6f4e5f]"
            >
              Servicio
            </label>

            <select
              id="service"
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              className="w-full rounded-2xl border border-[#ead8e1] bg-[#fffafc] px-4 py-2.5 text-[15px] outline-none focus:border-[#d9a8bb] focus:ring-2 focus:ring-[#f7d7e3]"
            >
              <option value="" disabled>
                Seleccionar servicio
              </option>

              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} ({service.duration} min)
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-2xl border border-[#f0dfe6] bg-white p-4 sm:p-5">
            <label
              htmlFor="booking-date"
              className="mb-2 block text-sm font-medium text-[#6f4e5f]"
            >
              Fecha
            </label>

            <input
              id="booking-date"
              type="date"
              value={date}
              min={minDate}
              onChange={(e) => setDate(e.target.value)}
              disabled={!serviceId}
              className="w-full rounded-2xl border border-[#ead8e1] bg-[#fffafc] px-4 py-2.5 text-[15px] outline-none focus:border-[#d9a8bb] focus:ring-2 focus:ring-[#f7d7e3] disabled:opacity-50"
            />

            <p className="mt-2 text-xs text-[#8f6f7e]">
              No se permiten reservas con menos de 24 hs de anticipación.
            </p>

            {serviceId && date && (
              <p className="mt-2 text-xs text-[#8f6f7e]">
                Mostrando la fecha más cercana disponible.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-[#f0dfe6] bg-white p-4 sm:p-5">
            <h4 className="mb-2 text-sm font-semibold text-[#6f4e5f]">
              Horarios disponibles
            </h4>

            {!serviceId ? (
              <p className="text-sm text-[#8f6f7e]">
                Seleccioná primero un servicio.
              </p>
            ) : !date ? (
              <p className="text-sm text-[#8f6f7e]">
                Buscando la fecha más cercana disponible...
              </p>
            ) : loadingSlots ? (
              <p className="text-sm text-[#8f6f7e]">Cargando horarios...</p>
            ) : slots.length === 0 ? (
              <p className="text-sm text-[#8f6f7e]">
                No hay horarios disponibles para esa fecha.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
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
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-[#f0dfe6] bg-white p-4 sm:p-5"
        >
          <h4 className="mb-3 text-sm font-semibold text-[#6f4e5f]">
            Tus datos
          </h4>

          {successMessage && (
            <div className="mb-4 rounded-2xl border border-[#cfe7d4] bg-[#edf9f0] p-3 text-sm font-medium text-[#2f6b3f]">
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 rounded-2xl border border-[#f3c8d8] bg-[#fff1f6] p-3 text-sm font-medium text-[#8c5a6d]">
              {errorMessage}
            </div>
          )}

          <div className="space-y-3">
            <label htmlFor="client-name" className="sr-only">
              Nombre y apellido
            </label>
            <input
              id="client-name"
              type="text"
              placeholder="Nombre y apellido"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              required
              className="w-full rounded-2xl border border-[#ead8e1] bg-[#fffafc] px-4 py-2.5 text-[15px] outline-none focus:border-[#d9a8bb] focus:ring-2 focus:ring-[#f7d7e3]"
            />

            <label htmlFor="client-email" className="sr-only">
              Email
            </label>
            <input
              id="client-email"
              type="email"
              placeholder="Email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              required
              className="w-full rounded-2xl border border-[#ead8e1] bg-[#fffafc] px-4 py-2.5 text-[15px] outline-none focus:border-[#d9a8bb] focus:ring-2 focus:ring-[#f7d7e3]"
            />

            <label htmlFor="client-phone" className="sr-only">
              WhatsApp o Teléfono
            </label>
            <input
              id="client-phone"
              type="tel"
              placeholder="WhatsApp / Teléfono"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              required
              className="w-full rounded-2xl border border-[#ead8e1] bg-[#fffafc] px-4 py-2.5 text-[15px] outline-none focus:border-[#d9a8bb] focus:ring-2 focus:ring-[#f7d7e3]"
            />

            <label htmlFor="client-notes" className="sr-only">
              Notas adicionales
            </label>
            <textarea
              id="client-notes"
              placeholder="Notas adicionales (opcional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full rounded-2xl border border-[#ead8e1] bg-[#fffafc] px-4 py-3 text-[15px] outline-none focus:border-[#d9a8bb] focus:ring-2 focus:ring-[#f7d7e3]"
            />

            <div className="rounded-2xl bg-[#fff5f8] p-3 text-sm text-[#6f4e5f]">
              <p>
                <strong>Servicio:</strong> {selectedService?.name ?? "-"}
              </p>
              <p>
                <strong>Duración:</strong> {selectedService?.duration ?? "-"} min
              </p>
              <p>
                <strong>Horario:</strong> {selectedSlot?.label ?? "Seleccioná uno"}
              </p>
            </div>

            <button
              type="submit"
              disabled={!isFormValid || submitting}
              className="w-full rounded-2xl bg-[#d86c93] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Reservando..." : "Confirmar turno"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}