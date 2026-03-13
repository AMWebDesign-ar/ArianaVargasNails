"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { services } from "@/data/services";

type TimeSlot = {
  start: string;
  end: string;
  label: string;
};

type Props = {
  onClose: () => void;
};

export default function BookingScheduler({ onClose }: Props) {
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [notes, setNotes] = useState("");

  const selectedService = useMemo(
    () => services.find((s) => s.id === serviceId),
    [serviceId]
  );

  useEffect(() => {
    if (!serviceId || !date) return;

    async function loadAvailability() {
      setLoadingSlots(true);
      setSelectedSlot(null);

      try {
        const res = await fetch(`/api/availability?date=${date}&serviceId=${serviceId}`);
        const data = await res.json();
        setSlots(data.slots ?? []);
      } catch (error) {
        console.error(error);
        setSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    }

    loadAvailability();
  }, [serviceId, date]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedService || !selectedSlot) return;

    setSubmitting(true);

    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: selectedService.id,
          serviceName: selectedService.name,
          start: selectedSlot.start,
          end: selectedSlot.end,
          clientName,
          clientEmail,
          clientPhone,
          notes,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Error al reservar");

      alert("Turno reservado con éxito");
      onClose();
    } catch (error) {
      console.error(error);
      alert("No se pudo reservar el turno");
    } finally {
      setSubmitting(false);
    }
  }

  return (
  <div className="h-full overflow-y-auto bg-[#fffafc]">
    {/* <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-2">
        <div>
          <h3 className="text-lg font-bold uppercase tracking-[0.1em] text-[#6f4e5f]">
            Reservar turno
          </h3>
          <p className="text-sm text-[#8f6f7e]">
            Elegí servicio, fecha y horario disponible
          </p>
        </div>

        <button
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#edd6e0] bg-white text-[#8d6677]"
        >
          ×
        </button>
      </div> */}

      <div className="grid flex-1 gap-6 overflow-y-auto p-6 lg:grid-cols-2">
        <div className="space-y-5">
          <div className="rounded-3xl border border-[#f0dfe6] bg-white p-5">
            <label className="mb-2 block text-sm font-medium text-[#6f4e5f]">
              Servicio
            </label>
            <select
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              className="w-full rounded-2xl border border-[#ead8e1] bg-[#fffafc] px-4 py-3 outline-none"
            >
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} ({service.duration} min)
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-3xl border border-[#f0dfe6] bg-white p-5">
            <label className="mb-2 block text-sm font-medium text-[#6f4e5f]">
              Fecha
            </label>
            <input
              type="date"
              value={date}
              min={format(new Date(), "yyyy-MM-dd")}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-2xl border border-[#ead8e1] bg-[#fffafc] px-4 py-3 outline-none"
            />
            <p className="mt-2 text-xs text-[#8f6f7e]">
              No se permiten reservas con menos de 24 hs de anticipación.
            </p>
          </div>

          <div className="rounded-3xl border border-[#f0dfe6] bg-white p-5">
            <h4 className="mb-3 text-sm font-medium text-[#6f4e5f]">
              Horarios disponibles
            </h4>

            {loadingSlots ? (
              <p className="text-sm text-[#8f6f7e]">Cargando horarios...</p>
            ) : slots.length === 0 ? (
              <p className="text-sm text-[#8f6f7e]">
                No hay horarios disponibles para esa fecha.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {slots.map((slot) => {
                  const active = selectedSlot?.start === slot.start;

                  return (
                    <button
                      key={slot.start}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                        active
                          ? "border-[#d86c93] bg-[#d86c93] text-white"
                          : "border-[#ead8e1] bg-[#fffafc] text-[#6f4e5f] hover:border-[#d9a8bb]"
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
          className="rounded-3xl border border-[#f0dfe6] bg-white p-5"
        >
          <h4 className="mb-4 text-sm font-medium text-[#6f4e5f]">
            Tus datos
          </h4>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Nombre y apellido"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              required
              className="w-full rounded-2xl border border-[#ead8e1] bg-[#fffafc] px-4 py-3 outline-none"
            />

            <input
              type="email"
              placeholder="Email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              required
              className="w-full rounded-2xl border border-[#ead8e1] bg-[#fffafc] px-4 py-3 outline-none"
            />

            <input
              type="tel"
              placeholder="WhatsApp / Teléfono"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              required
              className="w-full rounded-2xl border border-[#ead8e1] bg-[#fffafc] px-4 py-3 outline-none"
            />

            <textarea
              placeholder="Notas adicionales (opcional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full rounded-2xl border border-[#ead8e1] bg-[#fffafc] px-4 py-3 outline-none"
            />

            <div className="rounded-2xl bg-[#fff5f8] p-4 text-sm text-[#6f4e5f]">
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
              disabled={!selectedSlot || submitting}
              className="w-full rounded-2xl bg-[#d86c93] px-4 py-3 font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Reservando..." : "Confirmar turno"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}