import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";

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
}: {
  title: string;
  bookings: Booking[];
  emptyText: string;
  compact?: boolean;
}) {
  return (
    <section className="rounded-3xl border border-[#f0dfe6] bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-[#6f4e5f]">{title}</h2>

      {bookings.length === 0 ? (
        <p className="mt-4 text-sm text-[#8f6f7e]">{emptyText}</p>
      ) : (
        <div className="mt-4 overflow-hidden rounded-2xl border border-[#f0dfe6]">
          <div className="divide-y divide-[#f0dfe6]">
            {bookings.map((booking) => (
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
                </div>

                <div className="flex items-start justify-start sm:justify-end">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-bold ${statusClass(
                      booking.status,
                    )}`}
                  >
                    {statusLabel(booking.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function ClientsList({ clients }: { clients: Client[] }) {
  return (
    <section className="rounded-3xl border border-[#f0dfe6] bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-[#6f4e5f]">Clientas</h2>

      {clients.length === 0 ? (
        <p className="mt-4 text-sm text-[#8f6f7e]">No hay clientas para mostrar.</p>
      ) : (
        <div className="mt-4 divide-y divide-[#f0dfe6] overflow-hidden rounded-2xl border border-[#f0dfe6]">
          {clients.map((client) => (
            <div
              key={client.id}
              className="flex flex-col gap-2 bg-[#fffafc] p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-bold text-[#6f4e5f]">
                  {client.name}
                </p>
                <p className="mt-1 text-xs text-[#8f6f7e]">
                  {client.phone} · {client.email}
                </p>
              </div>

              {typeof client.bookingCount === "number" && (
                <span className="w-fit rounded-full border border-[#ead8e1] bg-white px-3 py-1 text-xs font-bold text-[#6f4e5f]">
                  {client.bookingCount} turno
                  {client.bookingCount === 1 ? "" : "s"}
                </span>
              )}
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

  const [bookingSearch, setBookingSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [bookings, setBookings] = useState<Booking[]>([]);

  const [clientsSearch, setClientsSearch] = useState("");
  const [clients, setClients] = useState<Client[]>([]);

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
              />

              <BookingList
                title="Próximos turnos"
                bookings={data.upcomingBookings}
                emptyText="No hay próximos turnos."
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

            <ClientsList clients={clients} />
          </>
        )}
      </div>
    </main>
  );
}
