import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { services } from "../data/services";

type AdminUser = {
  email: string;
  name?: string;
  picture?: string;
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
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
};

type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
  bookingCount?: number;
};

type DashboardData = {
  summary: {
    todayBookings: number;
    upcomingBookings: number;
    cancelledBookings: number;
    totalClients: number;
  };
  todayBookings: Booking[];
  upcomingBookings: Booking[];
  recentBookings: Booking[];
  recentClients: Client[];
};

type ClientDetail = {
  client: Client;
  stats: {
    totalBookings: number;
    activeBookings: number;
    cancelledBookings: number;
    completedOrPastBookings: number;
  };
  nextBooking: Booking | null;
  lastBooking: Booking | null;
  bookings: Booking[];
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
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

function buildWhatsAppUrl(phone: string, name?: string) {
  let digits = phone.replace(/\D/g, "");

  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  }

  if (digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  if (!digits.startsWith("54")) {
    digits = `54${digits}`;
  }

  const message = encodeURIComponent(
    name ? `Hola ${name}, te escribimos de Ariana Vargas Nails.` : "Hola, te escribimos de Ariana Vargas Nails.",
  );

  return `https://wa.me/${digits}?text=${message}`;
}

function toDateTimeLocalValue(value: string) {
  const date = new Date(value);

  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

  return parts.replace(" ", "T");
}

function argentinaDateTimeLocalToIso(value: string) {
  return new Date(`${value}:00-03:00`).toISOString();
}

function addMinutesIso(startIso: string, minutes: number) {
  return new Date(new Date(startIso).getTime() + minutes * 60_000).toISOString();
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-[#f0dfe6] bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#B07070]">
        {label}
      </p>
      <p className="mt-3 text-3xl font-bold text-[#6f4e5f]">{value}</p>
    </div>
  );
}

function BookingList({
  title,
  bookings,
  emptyText,
  compact = false,
  onCancel,
  onEdit,
  actionLoadingId,
}: {
  title: string;
  bookings: Booking[];
  emptyText: string;
  compact?: boolean;
  onCancel?: (booking: Booking) => void;
  onEdit?: (booking: Booking) => void;
  actionLoadingId?: string | null;
}) {
  return (
    <section className="rounded-3xl border border-[#f0dfe6] bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-[#6f4e5f]">{title}</h2>

      {bookings.length === 0 ? (
        <p className="mt-4 text-sm text-[#8f6f7e]">{emptyText}</p>
      ) : (
        <div className="mt-4 overflow-hidden rounded-2xl border border-[#f0dfe6]">
          <div className="divide-y divide-[#f0dfe6]">
            {bookings.map((booking) => {
              const canManage = canManageBooking(booking);
              const isLoading = actionLoadingId === booking.id;

              return (
                <div
                  key={booking.id}
                  className="grid gap-3 bg-[#fffafc] p-4 sm:grid-cols-[120px_1fr_auto]"
                >
                  <div>
                    <p className="text-sm font-bold text-[#6f4e5f]">
                      {compact
                        ? formatTime(booking.start)
                        : formatDateTime(booking.start)}
                    </p>

                    <p className="text-xs text-[#8f6f7e]">
                      {booking.serviceDuration} min
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-bold text-[#6f4e5f]">
                      {booking.clientName}
                    </p>

                    <p className="mt-1 text-sm text-[#8f6f7e]">
                      {booking.serviceName}
                    </p>

                    <p className="mt-1 text-xs text-[#8f6f7e]">
                      {booking.clientPhone} · {booking.clientEmail}
                    </p>

                    {booking.notes && (
                      <p className="mt-2 rounded-xl bg-white p-2 text-xs text-[#8f6f7e]">
                        {booking.notes}
                      </p>
                    )}

                    {canManage && (onCancel || onEdit) && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {onEdit && (
                          <button
                            type="button"
                            onClick={() => onEdit(booking)}
                            disabled={isLoading}
                            className="rounded-xl border border-[#cfe0f8] bg-white px-3 py-2 text-xs font-bold text-[#315f9c] transition hover:bg-[#eef5ff] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Modificar
                          </button>
                        )}

                        {onCancel && (
                          <button
                            type="button"
                            onClick={() => onCancel(booking)}
                            disabled={isLoading}
                            className="rounded-xl border border-[#f3c8d8] bg-white px-3 py-2 text-xs font-bold text-[#8c5a6d] transition hover:bg-[#fff1f6] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isLoading ? "Cancelando..." : "Cancelar"}
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-start justify-start sm:justify-end">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-bold ${bookingDisplayStatusClass(
                        booking,
                      )}`}
                    >
                      {bookingDisplayStatusLabel(booking)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

function ClientsList({
  clients,
  onOpenClient,
}: {
  clients: Client[];
  onOpenClient: (clientId: string) => void;
}) {
  return (
    <section className="rounded-3xl border border-[#f0dfe6] bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-[#6f4e5f]">Clientas</h2>

      {clients.length === 0 ? (
        <p className="mt-4 text-sm text-[#8f6f7e]">
          No hay clientas para mostrar.
        </p>
      ) : (
        <div className="mt-4 divide-y divide-[#f0dfe6] overflow-hidden rounded-2xl border border-[#f0dfe6]">
          {clients.map((client) => (
            <div
              key={client.id}
              className="flex flex-col gap-3 bg-[#fffafc] p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-bold text-[#6f4e5f]">
                  {client.name}
                </p>
                <p className="mt-1 text-xs text-[#8f6f7e]">
                  {client.phone} · {client.email}
                </p>

                {typeof client.bookingCount === "number" && (
                  <span className="mt-2 inline-flex w-fit rounded-full border border-[#ead8e1] bg-white px-3 py-1 text-xs font-bold text-[#6f4e5f]">
                    {client.bookingCount} turno
                    {client.bookingCount === 1 ? "" : "s"}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onOpenClient(client.id)}
                  className="rounded-xl border border-[#cfe0f8] bg-white px-3 py-2 text-xs font-bold text-[#315f9c] transition hover:bg-[#eef5ff]"
                >
                  Ver ficha
                </button>

                <a
                  href={buildWhatsAppUrl(client.phone, client.name)}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl border border-[#cfe7d4] bg-white px-3 py-2 text-xs font-bold text-[#2f6b3f] transition hover:bg-[#edf9f0]"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default function AdminDashboard() {
  const [, navigate] = useLocation();

  const [loading, setLoading] = useState(true);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [editServiceId, setEditServiceId] = useState("");
  const [editDateTime, setEditDateTime] = useState("");

  const [bookingSearch, setBookingSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [bookings, setBookings] = useState<Booking[]>([]);

  const [clientsSearch, setClientsSearch] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [clientDetail, setClientDetail] = useState<ClientDetail | null>(null);
const [clientDetailLoading, setClientDetailLoading] = useState(false);

  const filteredBookingsTitle = useMemo(() => {
    if (bookingSearch || statusFilter !== "all") {
      return "Resultado de búsqueda";
    }

    return "Historial reciente";
  }, [bookingSearch, statusFilter]);

  async function loadMe() {
    try {
      const res = await fetch("/api/admin/me");
      const response = await res.json();

      if (!res.ok || !response.authenticated) {
        navigate("/admin/login");
        return false;
      }

      setUser(response.user);
      return true;
    } catch {
      navigate("/admin/login");
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function loadDashboard() {
    setDashboardLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/dashboard");
      const response = await res.json();

      if (!res.ok) {
        throw new Error(response.error || "No se pudo cargar el panel.");
      }

      setData(response);
      setBookings(response.recentBookings ?? []);
      setClients(response.recentClients ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo cargar el panel.",
      );
    } finally {
      setDashboardLoading(false);
    }
  }

  async function refreshDashboardData() {
    await loadDashboard();

    if (bookingSearch || statusFilter !== "all") {
      await searchBookings();
    }

    if (clientsSearch) {
      await searchClients();
    }
  }

  async function cancelBookingFromAdmin(booking: Booking) {
    const confirmed = window.confirm(
      `¿Seguro que querés cancelar el turno de ${booking.clientName}?`,
    );

    if (!confirmed) return;

    setActionLoadingId(booking.id);
    setError("");

    try {
      const res = await fetch(`/api/admin/bookings/${booking.id}/cancel`, {
        method: "POST",
      });

      const response = await res.json();

      if (!res.ok) {
        throw new Error(response.error || "No se pudo cancelar el turno.");
      }

      await refreshDashboardData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo cancelar el turno.",
      );
    } finally {
      setActionLoadingId(null);
    }
  }

  function openEditBookingModal(booking: Booking) {
    setEditingBooking(booking);
    setEditServiceId(booking.serviceId);
    setEditDateTime(toDateTimeLocalValue(booking.start));
    setError("");
  }

  async function rescheduleBookingFromAdmin() {
    if (!editingBooking) return;

    const selectedService = services.find(
      (service) => service.id === editServiceId,
    );

    if (!selectedService) {
      setError("Seleccioná un servicio válido.");
      return;
    }

    if (!editDateTime) {
      setError("Seleccioná fecha y horario.");
      return;
    }

    setActionLoadingId(editingBooking.id);
    setError("");

    try {
      const start = argentinaDateTimeLocalToIso(editDateTime);
      const end = addMinutesIso(start, selectedService.duration);

      const res = await fetch(
        `/api/admin/bookings/${editingBooking.id}/reschedule`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            serviceId: selectedService.id,
            start,
            end,
          }),
        },
      );

      const response = await res.json();

      if (!res.ok) {
        throw new Error(response.error || "No se pudo modificar el turno.");
      }

      setEditingBooking(null);
      setEditServiceId("");
      setEditDateTime("");

      await refreshDashboardData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo modificar el turno.",
      );
    } finally {
      setActionLoadingId(null);
    }
  }

  async function searchBookings() {
    setError("");

    const params = new URLSearchParams();

    if (bookingSearch.trim()) {
      params.set("q", bookingSearch.trim());
    }

    params.set("status", statusFilter);
    params.set("limit", "50");

    try {
      const res = await fetch(`/api/admin/bookings?${params.toString()}`);
      const response = await res.json();

      if (!res.ok) {
        throw new Error(response.error || "No se pudieron buscar turnos.");
      }

      setBookings(response.bookings ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudieron buscar turnos.",
      );
    }
  }

  async function searchClients() {
    setError("");

    const params = new URLSearchParams();

    if (clientsSearch.trim()) {
      params.set("q", clientsSearch.trim());
    }

    params.set("limit", "50");

    try {
      const res = await fetch(`/api/admin/clients?${params.toString()}`);
      const response = await res.json();

      if (!res.ok) {
        throw new Error(response.error || "No se pudieron buscar clientas.");
      }

      setClients(response.clients ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudieron buscar clientas.",
      );
    }
  }

    async function openClientDetail(clientId: string) {
  setClientDetailLoading(true);
  setError("");

  try {
    const res = await fetch(`/api/admin/clients/${clientId}`);
    const response = await res.json();

    if (!res.ok) {
      throw new Error(response.error || "No se pudo cargar la ficha.");
    }

    setClientDetail(response);
  } catch (err) {
    setError(
      err instanceof Error ? err.message : "No se pudo cargar la ficha.",
    );
  } finally {
    setClientDetailLoading(false);
  }
}

  async function logout() {
    await fetch("/api/admin/logout", {
      method: "POST",
    });

    navigate("/admin/login");
  }

  useEffect(() => {
    async function init() {
      const authenticated = await loadMe();

      if (authenticated) {
        await loadDashboard();
      }
    }

    init();
  }, []);

  useEffect(() => {
    if (!data) return;

    const timeout = window.setTimeout(() => {
      searchBookings();
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [bookingSearch, statusFilter]);

  useEffect(() => {
    if (!data) return;

    const timeout = window.setTimeout(() => {
      searchClients();
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [clientsSearch]);

  if (loading || dashboardLoading) {
    return (
      <main className="min-h-screen bg-[#fff7fa] px-4 py-10">
        <div className="mx-auto max-w-5xl rounded-3xl bg-white p-6 shadow-xl">
          Cargando panel...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fff7fa] px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-5">
        <section className="rounded-3xl border border-[#f0dfe6] bg-white p-6 shadow-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#B07070]">
                Ariana Vargas Nails
              </p>

              <h1 className="mt-2 text-2xl font-bold text-[#6f4e5f]">
                Panel de administración
              </h1>

              <p className="mt-2 text-sm text-[#8f6f7e]">
                Sesión iniciada como <strong>{user?.email}</strong>
              </p>
            </div>

            <div className="flex items-center gap-3">
              {user?.picture && (
                <img
                  src={user.picture}
                  alt={user.name || user.email}
                  className="h-12 w-12 rounded-full border border-[#f0dfe6]"
                />
              )}

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

        {error && (
          <div className="rounded-3xl border border-[#f3c8d8] bg-[#fff1f6] p-4 text-sm font-medium text-[#8c5a6d]">
            {error}
          </div>
        )}

        {clientDetailLoading && (
  <div className="rounded-3xl border border-[#cfe0f8] bg-[#eef5ff] p-4 text-sm font-medium text-[#315f9c]">
    Cargando ficha de clienta...
  </div>
)}

        {data && (
          <>
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <SummaryCard
                label="Turnos hoy"
                value={data.summary.todayBookings}
              />
              <SummaryCard
                label="Próximos"
                value={data.summary.upcomingBookings}
              />
              <SummaryCard
                label="Cancelados"
                value={data.summary.cancelledBookings}
              />
              <SummaryCard
                label="Clientas"
                value={data.summary.totalClients}
              />
            </section>

            <section className="grid gap-5 lg:grid-cols-2">
              <BookingList
                title="Turnos de hoy"
                bookings={data.todayBookings}
                emptyText="No hay turnos para hoy."
                compact
                onCancel={cancelBookingFromAdmin}
                onEdit={openEditBookingModal}
                actionLoadingId={actionLoadingId}
              />

              <BookingList
                title="Próximos turnos"
                bookings={data.upcomingBookings}
                emptyText="No hay próximos turnos."
                onCancel={cancelBookingFromAdmin}
                onEdit={openEditBookingModal}
                actionLoadingId={actionLoadingId}
              />
            </section>

            <section className="rounded-3xl border border-[#f0dfe6] bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-[#6f4e5f]">
                Buscar turnos
              </h2>

              <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_220px]">
                <input
                  type="search"
                  aria-label="Buscar turnos"
                  value={bookingSearch}
                  onChange={(event) => setBookingSearch(event.target.value)}
                  placeholder="Buscar por clienta, email, teléfono o servicio"
                  className="w-full rounded-2xl border border-[#ead8e1] bg-[#fffafc] px-4 py-2.5 text-sm outline-none focus:border-[#d9a8bb] focus:ring-2 focus:ring-[#f7d7e3]"
                />

                <select
                  aria-label="Filtrar turnos por estado"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="w-full rounded-2xl border border-[#ead8e1] bg-[#fffafc] px-4 py-2.5 text-sm outline-none focus:border-[#d9a8bb] focus:ring-2 focus:ring-[#f7d7e3]"
                >
                  <option value="all">Todos los estados</option>
                  <option value="confirmed">Confirmados</option>
                  <option value="rescheduled">Modificados</option>
                  <option value="cancelled">Cancelados</option>
                  <option value="failed">Fallidos</option>
                  <option value="pending">Pendientes</option>
                </select>
              </div>
            </section>

            <BookingList
              title={filteredBookingsTitle}
              bookings={bookings}
              emptyText="No hay turnos para mostrar."
              onCancel={cancelBookingFromAdmin}
              onEdit={openEditBookingModal}
              actionLoadingId={actionLoadingId}
            />

            <section className="rounded-3xl border border-[#f0dfe6] bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-[#6f4e5f]">
                Buscar clientas
              </h2>

              <input
                type="search"
                aria-label="Buscar clientas"
                value={clientsSearch}
                onChange={(event) => setClientsSearch(event.target.value)}
                placeholder="Buscar por nombre, email o teléfono"
                className="mt-4 w-full rounded-2xl border border-[#ead8e1] bg-[#fffafc] px-4 py-2.5 text-sm outline-none focus:border-[#d9a8bb] focus:ring-2 focus:ring-[#f7d7e3]"
              />
            </section>

            <ClientsList clients={clients} onOpenClient={openClientDetail} />
          </>
        )}
      </div>

      {editingBooking && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-[#f0dfe6] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#B07070]">
                  Modificar turno
                </p>

                <h2 className="mt-2 text-xl font-bold text-[#6f4e5f]">
                  {editingBooking.clientName}
                </h2>

                <p className="mt-1 text-sm text-[#8f6f7e]">
                  Turno actual: {formatDateTime(editingBooking.start)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditingBooking(null)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ead8e1] bg-white text-[#8c5a6d] transition hover:bg-[#fff1f6]"
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="admin-edit-service"
                  className="mb-2 block text-sm font-medium text-[#6f4e5f]"
                >
                  Servicio
                </label>

                <select
                  id="admin-edit-service"
                  value={editServiceId}
                  onChange={(event) => setEditServiceId(event.target.value)}
                  className="w-full rounded-2xl border border-[#ead8e1] bg-[#fffafc] px-4 py-2.5 text-sm outline-none focus:border-[#d9a8bb] focus:ring-2 focus:ring-[#f7d7e3]"
                >
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} ({service.duration} min)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="admin-edit-datetime"
                  className="mb-2 block text-sm font-medium text-[#6f4e5f]"
                >
                  Nueva fecha y horario
                </label>

                <input
                  id="admin-edit-datetime"
                  type="datetime-local"
                  value={editDateTime}
                  onChange={(event) => setEditDateTime(event.target.value)}
                  className="w-full rounded-2xl border border-[#ead8e1] bg-[#fffafc] px-4 py-2.5 text-sm outline-none focus:border-[#d9a8bb] focus:ring-2 focus:ring-[#f7d7e3]"
                />
              </div>

              <div className="rounded-2xl bg-[#fff7fa] p-4 text-sm text-[#8f6f7e]">
                Si el nuevo horario se superpone con otro turno de Google
                Calendar, el sistema lo va a bloquear.
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={rescheduleBookingFromAdmin}
                  disabled={actionLoadingId === editingBooking.id}
                  className="flex-1 rounded-2xl bg-[#B07070] px-4 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {actionLoadingId === editingBooking.id
                    ? "Guardando..."
                    : "Guardar cambios"}
                </button>

                <button
                  type="button"
                  onClick={() => setEditingBooking(null)}
                  disabled={actionLoadingId === editingBooking.id}
                  className="flex-1 rounded-2xl border border-[#ead8e1] bg-white px-4 py-3 text-sm font-semibold text-[#8c5a6d] transition hover:bg-[#fff1f6] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {clientDetail && (
  <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
    <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-3xl border border-[#f0dfe6] bg-white shadow-2xl">
      <div className="flex items-start justify-between gap-4 border-b border-[#f0dfe6] p-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#B07070]">
            Ficha de clienta
          </p>

          <h2 className="mt-2 text-2xl font-bold text-[#6f4e5f]">
            {clientDetail.client.name}
          </h2>

          <p className="mt-1 text-sm text-[#8f6f7e]">
            {clientDetail.client.phone} · {clientDetail.client.email}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setClientDetail(null)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ead8e1] bg-white text-[#8c5a6d] transition hover:bg-[#fff1f6]"
          aria-label="Cerrar ficha"
        >
          ×
        </button>
      </div>

      <div className="max-h-[calc(90vh-120px)] overflow-y-auto p-6">
        <div className="grid gap-3 sm:grid-cols-4">
          <SummaryCard
            label="Total"
            value={clientDetail.stats.totalBookings}
          />
          <SummaryCard
            label="Activos"
            value={clientDetail.stats.activeBookings}
          />
          <SummaryCard
            label="Cancelados"
            value={clientDetail.stats.cancelledBookings}
          />
          <SummaryCard
            label="Historial"
            value={clientDetail.stats.completedOrPastBookings}
          />
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <a
            href={buildWhatsAppUrl(
              clientDetail.client.phone,
              clientDetail.client.name,
            )}
            target="_blank"
            rel="noreferrer"
            className="inline-flex flex-1 items-center justify-center rounded-2xl bg-[#2f6b3f] px-4 py-3 text-sm font-bold text-white transition hover:opacity-90"
          >
            Escribir por WhatsApp
          </a>

          <a
            href={`mailto:${clientDetail.client.email}`}
            className="inline-flex flex-1 items-center justify-center rounded-2xl border border-[#ead8e1] bg-white px-4 py-3 text-sm font-bold text-[#6f4e5f] transition hover:bg-[#fff1f6]"
          >
            Enviar email
          </a>
        </div>

        {clientDetail.nextBooking && (
          <div className="mt-5 rounded-3xl border border-[#cfe7d4] bg-[#edf9f0] p-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2f6b3f]">
              Próximo turno
            </p>
            <p className="mt-2 text-sm font-bold text-[#2f6b3f]">
              {clientDetail.nextBooking.serviceName}
            </p>
            <p className="mt-1 text-sm text-[#2f6b3f]">
              {formatDateTime(clientDetail.nextBooking.start)}
            </p>
          </div>
        )}

        {clientDetail.lastBooking && (
          <div className="mt-5 rounded-3xl border border-[#f0dfe6] bg-[#fffafc] p-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#B07070]">
              Último turno
            </p>
            <p className="mt-2 text-sm font-bold text-[#6f4e5f]">
              {clientDetail.lastBooking.serviceName}
            </p>
            <p className="mt-1 text-sm text-[#8f6f7e]">
              {formatDateTime(clientDetail.lastBooking.start)}
            </p>
          </div>
        )}

        <div className="mt-6">
          <h3 className="text-lg font-bold text-[#6f4e5f]">
            Historial de turnos
          </h3>

          {clientDetail.bookings.length === 0 ? (
            <p className="mt-3 text-sm text-[#8f6f7e]">
              Esta clienta todavía no tiene turnos.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {clientDetail.bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="rounded-2xl border border-[#f0dfe6] bg-[#fffafc] p-4"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-bold text-[#6f4e5f]">
                        {booking.serviceName}
                      </p>
                      <p className="mt-1 text-xs text-[#8f6f7e]">
                        {formatDateTime(booking.start)}
                      </p>
                      {booking.notes && (
                        <p className="mt-2 text-xs text-[#8f6f7e]">
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
)}
    </main>
  );
}