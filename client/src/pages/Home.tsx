import { useState } from "react";
import { BRAND, whatsappLink } from "@/config/brand";
import { SERVICES } from "@/config/services";
import { GALLERY } from "@/config/gallery";
import { ServiceCard } from "@/components/ServiceCard";
import { WhatsAppFloatingButton } from "@/components/WhatsAppFloatingButton";

function NavLink({
  href,
  label,
  onClick,
}: {
  href: string;
  label: string;
  onClick?: () => void;
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="text-sm font-medium text-black/70 hover:text-black transition-colors focus:outline-none focus:ring-4 focus:ring-[#D6B6B6]/40 rounded-lg px-2 py-1"
      data-testid={`link-nav-${label.toLowerCase()}`}
    >
      {label}
    </a>
  );
}

function MobileMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <div
      className={`fixed inset-0 z-50 transition-all duration-300 md:hidden ${
        open
          ? "visible opacity-100"
          : "invisible opacity-0 pointer-events-none"
      }`}
    >
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
        data-testid="button-mobile-menu-overlay"
      />

      <nav
        className={`absolute right-0 top-0 h-full w-64 bg-[#FAFAFA] shadow-xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        data-testid="nav-mobile-menu"
      >
        <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
          <span className="text-sm font-semibold">{BRAND.name}</span>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-black/60 hover:text-black active:bg-black/5"
            aria-label="Cerrar menú"
            data-testid="button-close-mobile-menu"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-1 p-4">
          {[
            { href: "#services", label: "Servicios" },
            { href: "#gallery", label: "Galería" },
            { href: "#studio", label: "Estudio" },
            { href: "#turnos", label: "Turnos" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={onClose}
              className="rounded-xl px-4 py-3 text-sm font-medium text-black/80 active:bg-black/5 transition-colors"
              data-testid={`link-mobile-nav-${item.label.toLowerCase()}`}
            >
              {item.label}
            </a>
          ))}

          <a
            href={whatsappLink()}
            target="_blank"
            rel="noreferrer"
            onClick={onClose}
            className="mt-3 flex items-center justify-center rounded-xl bg-[#1C1C1C] px-5 py-3 text-sm font-medium text-[#FAFAFA] active:opacity-80"
            data-testid="button-mobile-reservar"
          >
            Reservar por WhatsApp
          </a>
        </div>
      </nav>
    </div>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* Header */}
      <header
        className="sticky top-0 z-40 border-b border-black/5 bg-[#FAFAFA]/80 backdrop-blur"
        data-testid="header"
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <a href="#top" className="flex items-center gap-2.5 min-w-0" data-testid="link-logo">
            <img
              src="/brand/logo_circle_transparent.png"
              alt={`${BRAND.name} logo`}
              width={40}
              height={40}
              className="rounded-full shrink-0"
            />
            <div className="leading-tight min-w-0">
              <div className="text-sm font-semibold tracking-tight truncate">
                {BRAND.name}
              </div>
              <div className="text-[11px] text-black/60 truncate">
                {BRAND.city} · {BRAND.area}
              </div>
            </div>
          </a>

          <nav className="hidden items-center gap-2 md:flex">
            <NavLink href="#services" label="Servicios" />
            <NavLink href="#gallery" label="Galería" />
            <NavLink href="#studio" label="Estudio" />
            <NavLink href="#turnos" label="Turnos" />
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center justify-center rounded-xl bg-[#1C1C1C] px-4 py-2.5 text-sm font-medium text-[#FAFAFA] hover:opacity-90 active:opacity-80 focus:outline-none focus:ring-4 focus:ring-[#D6B6B6]/40"
              data-testid="button-header-reservar"
            >
              Reservar
            </a>

            <button
              onClick={() => setMenuOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-black/70 active:bg-black/5 md:hidden"
              aria-label="Abrir menú"
              data-testid="button-open-mobile-menu"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* Main */}
      <main id="top">
        {/* HERO */}
        <section className="relative overflow-hidden" data-testid="section-hero">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(214,182,182,0.25),transparent_55%)]" />
          <div className="relative mx-auto max-w-6xl px-4 py-10 sm:py-14 md:py-20">
            <div className="grid items-center gap-8 md:gap-10 md:grid-cols-2">
              <div>
                <p
                  className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1.5 text-[11px] sm:text-xs text-black/70"
                  data-testid="text-hero-location"
                >
                  Atención en estudio · {BRAND.city} ({BRAND.area})
                </p>

                <h1
                  className="mt-4 sm:mt-5 text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight tracking-tight [font-family:var(--font-playfair)]"
                  data-testid="text-hero-title"
                >
                  Tu momento, tu estilo,
                  <br /> tus uñas
                </h1>

                <p
                  className="mt-3 sm:mt-4 max-w-xl text-sm sm:text-base leading-6 sm:leading-7 text-black/70"
                  data-testid="text-hero-subtitle"
                >
                  Reservá tu turno por WhatsApp en segundos. Te acompaño a elegir
                  la mejor opción según tu estilo, con un acabado prolijo y
                  elegante.
                </p>

                <div className="mt-5 sm:mt-7 flex flex-col gap-3 sm:flex-row">
                  <a
                    href={whatsappLink()}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-xl bg-[#1C1C1C] px-5 py-3.5 sm:py-3 text-sm font-medium text-[#FAFAFA] hover:opacity-90 active:opacity-80 focus:outline-none focus:ring-4 focus:ring-[#D6B6B6]/40"
                    data-testid="button-hero-whatsapp"
                  >
                    Reservar por WhatsApp
                  </a>

                  <a
                    href="#gallery"
                    className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white px-5 py-3.5 sm:py-3 text-sm font-medium text-black/80 hover:bg-black/[0.03] focus:outline-none focus:ring-4 focus:ring-[#D6B6B6]/40"
                    data-testid="button-hero-gallery"
                  >
                    Ver trabajos
                  </a>
                </div>

              </div>

              {/* Visual - hidden on very small screens, shown from sm */}
              <div className="relative hidden sm:block">
                <div className="rounded-[28px] border border-black/10 bg-white p-3 shadow-sm">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#E6DCD2]">
                    <img
                      src="/brand/logo_square_transparent.png"
                      alt="Ariana Vargas Nails"
                      className="absolute inset-0 w-full h-full object-contain p-10 opacity-90"
                    />
                  </div>
                </div>

                <div className="mt-4 text-sm text-black/60">
                  Seguime en{" "}
                  <a
                    className="font-medium text-black underline underline-offset-4"
                    href={BRAND.instagram}
                    target="_blank"
                    rel="noreferrer"
                    data-testid="link-hero-instagram"
                  >
                    Instagram
                  </a>{" "}
                  para ver trabajos y novedades.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section id="services" className="mx-auto max-w-6xl px-4 py-10 sm:py-14" data-testid="section-servicios">
          <div className="flex flex-wrap items-end justify-between gap-4 sm:gap-6">
            <div>
              <h2
                className="[font-family:var(--font-playfair)] text-2xl sm:text-3xl font-semibold tracking-tight"
                data-testid="text-servicios-title"
              >
                Servicios
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-black/70">
                Elegí el servicio que buscás y reservá con un mensaje listo para
                enviar por WhatsApp.
              </p>
            </div>
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noreferrer"
              className="hidden rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-medium text-black/80 hover:bg-black/[0.03] md:inline-flex"
              data-testid="button-consultar-disponibilidad"
            >
              Consultar disponibilidad
            </a>
          </div>

          <div className="mt-6 sm:mt-8 grid gap-4 sm:gap-5 md:grid-cols-2">
            {SERVICES.map((s) => (
              <ServiceCard key={s.name} service={s} />
            ))}
          </div>
        </section>

        {/* GALLERY */}
        <section id="gallery" className="mx-auto max-w-6xl px-4 py-10 sm:py-14" data-testid="section-galeria">
          <div className="flex flex-wrap items-end justify-between gap-4 sm:gap-6">
            <div>
              <h2
                className="[font-family:var(--font-playfair)] text-2xl sm:text-3xl font-semibold tracking-tight"
                data-testid="text-galeria-title"
              >
                Galería
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-black/70">
                Algunos de nuestros trabajos más recientes.
              </p>
            </div>
          </div>

          <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
            {GALLERY.map((item, idx) => (
              <a
                key={idx}
                href={item.src}
                target="_blank"
                rel="noreferrer"
                className="group relative overflow-hidden rounded-xl sm:rounded-2xl border border-black/10 bg-white shadow-sm focus:outline-none focus:ring-4 focus:ring-[#D6B6B6]/40"
                aria-label={`Abrir imagen ${idx + 1}`}
                data-testid={`button-gallery-${idx}`}
              >
                <div className="relative aspect-square">
                  <img
                    src={item.src}
                    alt={item.alt}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* STUDIO */}
        <section id="studio" className="mx-auto max-w-6xl px-4 py-10 sm:py-14" data-testid="section-estudio">
          <div className="grid gap-8 sm:gap-10 md:grid-cols-2">
            <div>
              <h2
                className="[font-family:var(--font-playfair)] text-2xl sm:text-3xl font-semibold tracking-tight"
                data-testid="text-estudio-title"
              >
                Estudio
              </h2>
              <p className="mt-3 text-sm leading-6 text-black/70">
                Atención en estudio en <span className="font-medium">{BRAND.area}</span>.
                Turnos con reserva previa. Para coordinar, escribime por WhatsApp.
              </p>

              <div className="mt-5 sm:mt-6 grid gap-3">
                {[
                  "Higiene y prolijidad",
                  "Materiales de calidad",
                  "Atención personalizada",
                ].map((t) => (
                  <div
                    key={t}
                    className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm"
                  >
                    <div className="text-sm font-medium">{t}</div>
                  </div>
                ))}
              </div>

              <div className="mt-5 sm:mt-7 flex flex-col gap-3 sm:flex-row">
                <a
                  href={BRAND.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white px-5 py-3.5 sm:py-3 text-sm font-medium text-black/80 hover:bg-black/[0.03] focus:outline-none focus:ring-4 focus:ring-[#D6B6B6]/40"
                  data-testid="button-como-llegar"
                >
                  Cómo llegar
                </a>
                <a
                  href={BRAND.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white px-5 py-3.5 sm:py-3 text-sm font-medium text-black/80 hover:bg-black/[0.03] focus:outline-none focus:ring-4 focus:ring-[#D6B6B6]/40"
                  data-testid="button-ver-instagram"
                >
                  Ver Instagram
                </a>
              </div>
            </div>

            <div className="rounded-[28px] border border-black/10 bg-white p-3 shadow-sm">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_top,rgba(230,220,210,1),rgba(250,250,250,1))]">
                <div className="absolute inset-0 flex items-center justify-center p-8 sm:p-10">
                  <div className="text-center">
                    <img
                      src="/brand/logo_circle_transparent.png"
                      alt={`${BRAND.name} logo`}
                      width={120}
                      height={120}
                      className="mx-auto rounded-full"
                    />
                    <div className="mt-3 sm:mt-4 text-sm font-semibold">
                      {BRAND.city} · {BRAND.area}
                    </div>
                    <div className="mt-1 text-xs text-black/60">
                      Turnos con reserva previa
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TURNOS */}
        <section id="turnos" className="mx-auto max-w-6xl px-4 pb-16 sm:pb-20 pt-10 sm:pt-14" data-testid="section-turnos">
          <div className="rounded-[28px] border border-black/10 bg-white p-5 sm:p-8 md:p-12 shadow-sm">
            <div className="grid gap-6 sm:gap-8 md:grid-cols-2 md:items-center">
              <div>
                <h2
                  className="[font-family:var(--font-playfair)] text-2xl sm:text-3xl font-semibold tracking-tight"
                  data-testid="text-turnos-title"
                >
                  Turnos
                </h2>
                <p className="mt-3 text-sm leading-6 text-black/70">
                  Reservá tu turno por WhatsApp. Enviame el servicio + día +
                  horario y coordinamos.
                </p>
                <p className="mt-3 text-sm text-black/60" data-testid="text-turnos-hours">
                  Horarios: consultá disponibilidad por WhatsApp.
                </p>

                <div className="mt-5 sm:mt-6 flex flex-col gap-3 sm:flex-row">
                  <a
                    href={whatsappLink()}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-xl bg-[#1C1C1C] px-6 py-3.5 sm:py-3 text-sm font-medium text-[#FAFAFA] hover:opacity-90 active:opacity-80 focus:outline-none focus:ring-4 focus:ring-[#D6B6B6]/40"
                    data-testid="button-turnos-whatsapp"
                  >
                    Reservar por WhatsApp
                  </a>

                  <a
                    href={BRAND.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white px-6 py-3.5 sm:py-3 text-sm font-medium text-black/80 hover:bg-black/[0.03] focus:outline-none focus:ring-4 focus:ring-[#D6B6B6]/40"
                    data-testid="button-turnos-instagram"
                  >
                    Instagram
                  </a>
                </div>
              </div>

              <div className="rounded-2xl bg-[#FAFAFA] p-5 sm:p-6">
                <div className="text-sm font-semibold">Mensaje sugerido</div>
                <div className="mt-3 rounded-2xl border border-black/10 bg-white p-4 text-sm leading-6 text-black/70">
                  Hola Ari!<br />
                  Quisiera reservar un turno.<br />
                  Servicio: ___.<br />
                  Día preferido: ___.<br />
                  Horario: ___.<br />
                  Gracias!
                </div>

                <a
                  href={whatsappLink()}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 sm:mt-5 inline-flex w-full items-center justify-center rounded-xl bg-[#1C1C1C] px-6 py-3.5 sm:py-3 text-sm font-medium text-[#FAFAFA] hover:opacity-90 active:opacity-80 focus:outline-none focus:ring-4 focus:ring-[#D6B6B6]/40"
                  data-testid="button-turnos-abrir-whatsapp"
                >
                  Abrir WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-black/5 bg-[#FAFAFA]" data-testid="footer">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
          <div className="flex flex-col gap-5 sm:gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/brand/logo_circle_transparent.png"
                alt={`${BRAND.name} logo`}
                width={40}
                height={40}
                className="rounded-full"
              />
              <div>
                <div className="text-sm font-semibold">{BRAND.name}</div>
                <div className="text-xs text-black/60">
                  {BRAND.city} · {BRAND.area}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href={BRAND.instagram}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-black/10 bg-white px-4 py-2.5 sm:py-2 text-sm font-medium text-black/80 hover:bg-black/[0.03]"
                data-testid="link-footer-instagram"
              >
                Instagram
              </a>
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl bg-[#1C1C1C] px-4 py-2.5 sm:py-2 text-sm font-medium text-[#FAFAFA] hover:opacity-90"
                data-testid="link-footer-whatsapp"
              >
                WhatsApp
              </a>
            </div>
          </div>

          <div className="mt-6 sm:mt-8 text-xs text-black/50">
            &copy; {new Date().getFullYear()} {BRAND.name}. Todos los derechos reservados.
          </div>

          {BRAND.developerCredit?.enabled && (
            <div className="mt-2 text-xs text-black/50">
              <a
                href={BRAND.developerCredit.url}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-4 hover:text-black/70"
                data-testid="link-developer-credit"
              >
                {BRAND.developerCredit.text}
              </a>
            </div>
          )}
        </div>
      </footer>

      {/* WhatsApp Floating */}
      <WhatsAppFloatingButton />
    </>
  );
}
