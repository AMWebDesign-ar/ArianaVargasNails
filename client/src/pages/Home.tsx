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
        className={`absolute right-0 top-0 h-full w-64 bg-white/90 backdrop-blur-lg shadow-xl transition-transform duration-300 ${
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
  const [servicesOpen, setServicesOpen] = useState(false);

  return (
    <>
      {/* Header */}
      <header
        className="sticky top-0 z-40 border-b border-black/5 bg-white/60 backdrop-blur-lg"
        data-testid="header"
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
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

            <a href="#top" className="min-w-0" data-testid="link-logo">
              <div className="text-sm font-semibold tracking-tight truncate">
                {BRAND.name}
              </div>
            </a>
          </div>

          <nav className="hidden items-center gap-2 md:flex">
            <NavLink href="#services" label="Servicios" />
            <NavLink href="#gallery" label="Galería" />
            <NavLink href="#studio" label="Estudio" />
            <NavLink href="#turnos" label="Turnos" />
          </nav>

          <a
            href={whatsappLink()}
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center justify-center rounded-xl bg-[#1C1C1C] px-4 py-2.5 text-sm font-medium text-[#FAFAFA] hover:opacity-90 active:opacity-80 focus:outline-none focus:ring-4 focus:ring-[#D6B6B6]/40"
            data-testid="button-header-reservar"
          >
            Reservar
          </a>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* Main */}
      <main id="top">
        {/* HERO */}
        <section className="relative overflow-hidden" data-testid="section-hero">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(214,182,182,0.25),transparent_55%)]" />
          <div className="relative mx-auto max-w-6xl px-4 py-10 sm:py-14 md:py-20">
            <div className="flex flex-col items-center text-center">
              <h1
                className="text-4xl sm:text-5xl md:text-6xl font-semibold leading-none tracking-tight [font-family:var(--font-playfair)]"
                data-testid="text-hero-title"
              >
                Tu momento, tu estilo, tus uñas
              </h1>

              <img
                src="/brand/logo_square_transparent.png"
                alt="Ariana Vargas Nails"
                className="mt-6 sm:mt-8 w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 object-contain"
                data-testid="img-hero-logo"
              />

              <p
                className="mt-3 sm:mt-4 max-w-xl text-sm sm:text-base leading-6 sm:leading-7 text-black/70"
                data-testid="text-hero-subtitle"
              >
                Turnos con reserva previa
              </p>

              <div className="mt-5 sm:mt-7 flex flex-col gap-3 sm:flex-row">
                <a
                  href={whatsappLink()}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white px-5 py-3.5 sm:py-3 text-sm font-medium text-black/80 hover:bg-black/[0.03] focus:outline-none focus:ring-4 focus:ring-[#D6B6B6]/40"
                  data-testid="button-hero-whatsapp"
                >
                  Reservar
                </a>

                <button
                  onClick={() => setServicesOpen(true)}
                  className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white px-5 py-3.5 sm:py-3 text-sm font-medium text-black/80 hover:bg-black/[0.03] focus:outline-none focus:ring-4 focus:ring-[#D6B6B6]/40"
                  data-testid="button-hero-servicios"
                >
                  Servicios
                </button>

                <a
                  href="#gallery"
                  className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white px-5 py-3.5 sm:py-3 text-sm font-medium text-black/80 hover:bg-black/[0.03] focus:outline-none focus:ring-4 focus:ring-[#D6B6B6]/40"
                  data-testid="button-hero-gallery"
                >
                  Ver trabajos
                </a>

                <a
                  href={BRAND.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white px-5 py-3.5 sm:py-3 text-sm font-medium text-black/80 hover:bg-black/[0.03] focus:outline-none focus:ring-4 focus:ring-[#D6B6B6]/40"
                  data-testid="button-hero-ubicacion"
                >
                  Ubicación
                </a>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-black/5 bg-white/40 backdrop-blur-sm" data-testid="footer">
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

      {/* Services Popup */}
      {servicesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-testid="services-popup">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setServicesOpen(false)}
            data-testid="services-popup-overlay"
          />
          <div className="relative w-full max-w-md rounded-2xl bg-white/95 backdrop-blur-lg p-6 shadow-xl">
            <button
              onClick={() => setServicesOpen(false)}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full text-black/60 hover:bg-black/5"
              aria-label="Cerrar"
              data-testid="button-close-services"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <h3 className="text-lg font-semibold [font-family:var(--font-playfair)]">Servicios</h3>

            <div className="mt-4 grid gap-3">
              {SERVICES.map((s) => (
                <a
                  key={s.name}
                  href={whatsappLink(s.name)}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl border border-black/10 bg-white/70 p-4 hover:bg-white transition-colors"
                  data-testid={`popup-service-${s.name.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <div className="text-sm font-semibold">{s.name}</div>
                  <div className="mt-1 text-xs leading-5 text-black/60">{s.description}</div>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
