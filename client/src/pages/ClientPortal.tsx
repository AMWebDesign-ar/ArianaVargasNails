import { FormEvent, useEffect, useMemo, useState } from "react";

type ClientUser = {
  email: string;
};

type Booking = {
  id: string;
  token: string;
  googleEventId: string | null;
  serviceId: string;
  serviceName: string;
  serviceDuration: number;
  start: string;
  end: string;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  cancelledAt: string | null;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
};

type Step = "email" | "code" | "portal";

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

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: "Pendiente",
    confirmed: "Confirmado",
    cancelled: "Cancelado",
    rescheduled: "Modificado",
    failed: "Fallido",
  };

  return labels[status] ?? status;
}

function statusClass(status: string) {
  if (status === "confirmed") {
    return "bg-[#edf9f0] text-[#2f6b3f] border-[#cfe7d4]";
  }

  if (status === "rescheduled") {
    return "bg-[#eef5ff] text-[#315f9c] border-[#cfe0f8]";
  }

  if (status === "cancelled") {
    return "bg-[#fff1f6] text-[#8c5a6d] border-[#f3c8d8]";
  }

  if (status === "failed") {
    return "bg-[#fff3e8] text-[#9a5a25] border-[#f2d0b3]";
  }

  return "bg-[#f7f3f5] text-[#6f4e5f] border-[#ead8e1]";
}

function isActiveBooking(status: string) {
  return status === "confirmed" || status === "rescheduled";
}

function isPastBooking(booking: Pick<Booking, "start">) {
  return new Date(booking.start).getTime() < Date.now();
}

function canManageBooking(booking: Booking) {
  return isActiveBooking(booking.status) && !isPastBooking(booking);
}

function bookingDisplayStatusLabel(booking: Booking) {
  if (isActiveBooking(booking.status) && isPastBooking(booking)) {
    return "Finalizado";
  }

  return statusLabel(booking.status);
}

function bookingDisplayStatusClass(booking: Booking) {
  if (isActiveBooking(booking.status) && isPastBooking(booking)) {
    return "bg-[#f7f3f5] text-[#6f4e5f] border-[#ead8e1]";
  }

  return statusClass(booking.status);
}

function BookingCard({ booking }: { booking: Booking }) {
  return (
    <article className="rounded-3xl border border-[#f0dfe6] bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#B07070]">
            {booking.serviceName}
          </p>

          <h3 className="mt-2 text-lg font-bold text-[#6f4e5f]">
            {formatDateTime(booking.start)}
          </h3>

          <p className="mt-1 text-sm text-[#8f6f7e]">
            Duración: {booking.serviceDuration} min
          </p>

          {booking.notes && (
            <p className="mt-3 rounded-2xl bg-[#fff7fa] p-3 text-sm text-[#8f6f7e]">
              {booking.notes}
            </p>
          )}
        </div>

        <span
          className={`w-fit rounded-full border px-3 py-1 text-xs font-bold ${bookingDisplayStatusClass(
            booking,
          )}`}
        >
          {bookingDisplayStatusLabel(booking)}
        </span>
      </div>

      {canManageBooking(booking) && (
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <a
            href={`/reserva/${booking.token}`}
            className="inline-flex items-center justify-center rounded-2xl bg-[#B07070] px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
          >
            Ver, modificar o cancelar
          </a>
        </div>
      )}
    </article>
  );
}

export default function ClientPortal() {
  const [step, setStep] = useState<Step>("email");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [user, setUser] = useState<ClientUser | null>(null);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);

  const upcomingBookings = useMemo(() => {
    const now = Date.now();

    return bookings
      .filter(
        (booking) =>
          isActiveBooking(booking.status) &&
          new Date(booking.start).getTime() >= now,
      )
      .sort(
        (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
      );
  }, [bookings]);

  const pastBookings = useMemo(() => {
    const now = Date.now();

    return bookings.filter((booking) => {
      const isPast = new Date(booking.start).getTime() < now;
      return isPast || !isActiveBooking(booking.status);
    });
  }, [bookings]);

  async function loadBookings() {
    const res = await fetch("/api/client/bookings");
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "No se pudieron cargar tus turnos.");
    }

    setBookings(data.bookings ?? []);
  }

  async function loadSession() {
    setLoading(true);

    try {
      const res = await fetch("/api/client-auth/me");
      const data = await res.json();

      if (!res.ok || !data.authenticated) {
        setStep("email");
        return;
      }

      setUser(data.user);
      setEmail(data.user.email);
      await loadBookings();
      setStep("portal");
    } catch {
      setStep("email");
    } finally {
      setLoading(false);
    }
  }

  async function requestCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActionLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/client-auth/request-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "No se pudo enviar el código.");
      }

      setMessage("Te enviamos un código de acceso a tu email.");
      setStep("code");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar el código.");
    } finally {
      setActionLoading(false);
    }
  }

  async function verifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActionLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/client-auth/verify-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "No se pudo verificar el código.");
      }

      setUser(data.user);
      await loadBookings();
      setStep("portal");
      setCode("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo verificar el código.");
    } finally {
      setActionLoading(false);
    }
  }

  async function logout() {
    await fetch("/api/client-auth/logout", {
      method: "POST",
    });

    setUser(null);
    setBookings([]);
    setCode("");
    setMessage("");
    setError("");
    setStep("email");
  }

  useEffect(() => {
    loadSession();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fff7fa] px-4 py-10">
        <div className="mx-auto max-w-xl rounded-3xl bg-white p-6 shadow-xl">
          Cargando...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fff7fa] px-4 py-10">
      <div className="mx-auto max-w-4xl space-y-5">
        <section className="rounded-3xl border border-[#f0dfe6] bg-white p-6 shadow-xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#B07070]">
            Ariana Vargas Nails
          </p>

          <h1 className="mt-2 text-2xl font-bold text-[#6f4e5f]">
            Mis turnos
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-[#8f6f7e]">
            Ingresá con tu email para ver tus turnos, modificar o cancelar si todavía estás dentro del plazo permitido.
          </p>

          <a
            href="/"
            className="mt-4 inline-flex rounded-2xl border border-[#ead8e1] bg-white px-4 py-2.5 text-sm font-semibold text-[#8c5a6d] transition hover:bg-[#fff1f6]"
          >
            Volver al inicio
          </a>

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
        </section>

        {step === "email" && (
          <section className="rounded-3xl border border-[#f0dfe6] bg-white p-6 shadow-sm">
            <form onSubmit={requestCode} className="space-y-4">
              <div>
                <label
                  htmlFor="client-email"
                  className="mb-2 block text-sm font-medium text-[#6f4e5f]"
                >
                  Email
                </label>

                <input
                  id="client-email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="tuemail@gmail.com"
                  className="w-full rounded-2xl border border-[#ead8e1] bg-[#fffafc] px-4 py-2.5 text-sm outline-none focus:border-[#d9a8bb] focus:ring-2 focus:ring-[#f7d7e3]"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full rounded-2xl bg-[#B07070] px-4 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {actionLoading ? "Enviando..." : "Enviar código"}
              </button>
            </form>
          </section>
        )}

        {step === "code" && (
          <section className="rounded-3xl border border-[#f0dfe6] bg-white p-6 shadow-sm">
            <form onSubmit={verifyCode} className="space-y-4">
              <div>
                <label
                  htmlFor="client-code"
                  className="mb-2 block text-sm font-medium text-[#6f4e5f]"
                >
                  Código recibido
                </label>

                <input
                  id="client-code"
                  name="code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  className="w-full rounded-2xl border border-[#ead8e1] bg-[#fffafc] px-4 py-2.5 text-center text-xl font-bold tracking-[0.25em] text-[#6f4e5f] outline-none focus:border-[#d9a8bb] focus:ring-2 focus:ring-[#f7d7e3]"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full rounded-2xl bg-[#B07070] px-4 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {actionLoading ? "Verificando..." : "Ingresar"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setCode("");
                  setError("");
                  setMessage("");
                }}
                className="w-full rounded-2xl border border-[#ead8e1] bg-white px-4 py-3 text-sm font-semibold text-[#8c5a6d] transition hover:bg-[#fff1f6]"
              >
                Cambiar email
              </button>
            </form>
          </section>
        )}

        {step === "portal" && (
          <>
            <section className="rounded-3xl border border-[#f0dfe6] bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-[#8f6f7e]">Ingresaste como</p>
                  <p className="font-bold text-[#6f4e5f]">{user?.email}</p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <a
                    href="/#top"
                    className="inline-flex items-center justify-center rounded-2xl bg-[#B07070] px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
                  >
                    Reservar nuevo turno
                  </a>

                  <button
                    type="button"
                    onClick={logout}
                    className="rounded-2xl border border-[#f3c8d8] bg-white px-4 py-2.5 text-sm font-semibold text-[#8c5a6d] transition hover:bg-[#fff1f6]"
                  >
                    Cerrar sesión
                  </button>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-bold text-[#6f4e5f]">
                Próximos turnos
              </h2>

              {upcomingBookings.length === 0 ? (
                <div className="rounded-3xl border border-[#f0dfe6] bg-white p-5 text-sm text-[#8f6f7e] shadow-sm">
                  No tenés próximos turnos.
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </div>
              )}
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-bold text-[#6f4e5f]">
                Historial
              </h2>

              {pastBookings.length === 0 ? (
                <div className="rounded-3xl border border-[#f0dfe6] bg-white p-5 text-sm text-[#8f6f7e] shadow-sm">
                  Todavía no hay turnos anteriores.
                </div>
              ) : (
                <div className="space-y-4">
                  {pastBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
