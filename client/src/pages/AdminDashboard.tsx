import { useEffect, useState } from "react";
import { useLocation } from "wouter";

type AdminUser = {
  email: string;
  name?: string;
  picture?: string;
};

export default function AdminDashboard() {
  const [, navigate] = useLocation();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AdminUser | null>(null);

  async function loadMe() {
    try {
      const res = await fetch("/api/admin/me");
      const data = await res.json();

      if (!res.ok || !data.authenticated) {
        navigate("/admin/login");
        return;
      }

      setUser(data.user);
    } catch {
      navigate("/admin/login");
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", {
      method: "POST",
    });

    navigate("/admin/login");
  }

  useEffect(() => {
    loadMe();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fff7fa] px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow-xl">
          Cargando panel...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fff7fa] px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-5">
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

            {user?.picture && (
              <img
                src={user.picture}
                alt={user.name || user.email}
                className="h-12 w-12 rounded-full border border-[#f0dfe6]"
              />
            )}
          </div>

          <button
            type="button"
            onClick={logout}
            className="mt-6 rounded-2xl border border-[#f3c8d8] bg-white px-4 py-2.5 text-sm font-semibold text-[#8c5a6d] transition hover:bg-[#fff1f6]"
          >
            Cerrar sesión
          </button>
        </section>

        <section className="rounded-3xl border border-[#f0dfe6] bg-white p-6 shadow-xl">
          <h2 className="text-lg font-bold text-[#6f4e5f]">
            Próximo paso
          </h2>

          <p className="mt-2 text-sm text-[#8f6f7e]">
            Login de Google funcionando. En la siguiente parte agregamos turnos
            de hoy, próximos turnos, historial y clientas.
          </p>
        </section>
      </div>
    </main>
  );
}