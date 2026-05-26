import { useSearch } from "wouter";

export default function AdminLogin() {
  const search = useSearch();
  const hasError = new URLSearchParams(search).has("error");

  return (
    <main className="min-h-screen bg-[#fff7fa] px-4 py-10">
      <div className="mx-auto max-w-md rounded-3xl border border-[#f0dfe6] bg-white p-6 shadow-xl">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#B07070]">
          Ariana Vargas Nails
        </p>

        <h1 className="mt-2 text-2xl font-bold text-[#6f4e5f]">
          Panel de administración
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-[#8f6f7e]">
          Ingresá con una cuenta de Google autorizada para ver y administrar los
          turnos.
        </p>

        {hasError && (
          <div className="mt-4 rounded-2xl border border-[#f3c8d8] bg-[#fff1f6] p-3 text-sm font-medium text-[#8c5a6d]">
            No pudimos autorizar esta cuenta. Usá una cuenta habilitada.
          </div>
        )}

        <a
          href="/api/admin/google"
          className="mt-6 flex w-full items-center justify-center rounded-2xl bg-[#B07070] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-[#B07070]/20 transition hover:opacity-90"
        >
          Ingresar con Google
        </a>
      </div>
    </main>
  );
}