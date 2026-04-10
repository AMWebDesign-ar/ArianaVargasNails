"use client";

import { useEffect, useMemo, useState } from "react";
import { services } from "@/data/services";
import { addDays, format } from "date-fns";
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
  //const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [date, setDate] = useState("");
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
  if (!serviceId || !date) {
    setSlots([]);
    setSelectedSlot(null);
    return;
  }

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

    async function findFirstAvailableDate(selectedServiceId: string) {
  for (let i = 0; i < 30; i++) {
    const candidate = format(addDays(new Date(), i), "yyyy-MM-dd");

    const res = await fetch(
      `/api/availability?date=${candidate}&serviceId=${selectedServiceId}`
    );
    const data = await res.json();

    if (data.slots && data.slots.length > 0) {
      return candidate;
    }
  }

  return "";
}

useEffect(() => {
  if (!serviceId) return;

  async function preloadFirstDate() {
    const firstDate = await findFirstAvailableDate(serviceId);
    if (firstDate) {
      setDate(firstDate);
    } else {
      setDate("");
      setSlots([]);
      setSelectedSlot(null);
    }
  }

  preloadFirstDate();
}, [serviceId]);
    
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
    <div className="grid gap-4 p-3 sm:gap-5 sm:p-5 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="rounded-2xl border border-[#f0dfe6] bg-white p-4 sm:p-5">
          <label className="mb-2 block text-sm font-medium text-[#6f4e5f]">
            Servicio
          </label>
          <select
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
          <label className="mb-2 block text-sm font-medium text-[#6f4e5f]">
            Fecha
          </label>
          <input
            type="date"
            value={date}
            min={format(new Date(), "yyyy-MM-dd")}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-2xl border border-[#ead8e1] bg-[#fffafc] px-4 py-2.5 text-[15px] outline-none focus:border-[#d9a8bb] focus:ring-2 focus:ring-[#f7d7e3]"
          />
          <p className="mt-2 text-xs text-[#8f6f7e]">
            No se permiten reservas con menos de 24 hs de anticipación.
          </p>
        </div>

        <div className="rounded-2xl border border-[#f0dfe6] bg-white p-4 sm:p-5">
          <h4 className="mb-2 text-sm font-semibold text-[#6f4e5f]">
            Horarios disponibles
          </h4>

          {!serviceId ? (
  <p className="text-sm text-[#8f6f7e]">
    Seleccioná primero un servicio.
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
        className="rounded-2xl border border-[#f0dfe6] bg-white p-4 sm:p-5"
      >
        <h4 className="mb-3 text-sm font-semibold text-[#6f4e5f]">
          Tus datos
        </h4>

        <div className="space-y-3">
          <input
            type="text"
            placeholder="Nombre y apellido"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            required
            className="w-full rounded-2xl border border-[#ead8e1] bg-[#fffafc] px-4 py-2.5 text-[15px] outline-none focus:border-[#d9a8bb] focus:ring-2 focus:ring-[#f7d7e3]"
          />

          <input
            type="email"
            placeholder="Email"
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            required
            className="w-full rounded-2xl border border-[#ead8e1] bg-[#fffafc] px-4 py-2.5 text-[15px] outline-none focus:border-[#d9a8bb] focus:ring-2 focus:ring-[#f7d7e3]"
          />

          <input
            type="tel"
            placeholder="WhatsApp / Teléfono"
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
            required
            className="w-full rounded-2xl border border-[#ead8e1] bg-[#fffafc] px-4 py-2.5 text-[15px] outline-none focus:border-[#d9a8bb] focus:ring-2 focus:ring-[#f7d7e3]"
          />

          <textarea
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
            disabled={!selectedSlot || submitting}
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